import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseKey) {
    console.error('Missing required Stripe webhook environment variables');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeKey);
  const supabase = createClient(supabaseUrl, supabaseKey);

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Only process if payment was successful
      if (session.payment_status !== 'paid') {
        console.log(`Checkout session ${session.id} not fully paid. Status: ${session.payment_status}`);
        return NextResponse.json({ received: true });
      }

      const metadata = session.metadata || {};

      // Determine if this is a coin purchase or item purchase
      if (metadata.coins && metadata.userId) {
        // --- COIN PURCHASE ---
        const userId = metadata.userId;
        const coins = parseInt(metadata.coins || '0');

        // Check if already processed (deduplication)
        const { data: existingCoin } = await supabase
          .from('coin_purchases')
          .select('id')
          .eq('stripe_session_id', session.id)
          .single();

        if (existingCoin) {
          console.log(`Coin purchase already processed for session ${session.id}`);
          return NextResponse.json({ received: true });
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('coin_balance')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
          );
        }

        const newBalance = (profile?.coin_balance || 0) + coins;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ coin_balance: newBalance })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating coin balance:', updateError);
          return NextResponse.json(
            { error: 'Failed to update balance' },
            { status: 500 }
          );
        }

        console.log(`Added ${coins} coins to user ${userId}. New balance: ${newBalance}`);

        await supabase.from('coin_purchases').insert({
          user_id: userId,
          coins,
          amount_cents: session.amount_total,
          stripe_session_id: session.id,
          created_at: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
      } else if (metadata.itemId && metadata.buyerId && metadata.sellerId) {
        // --- ITEM PURCHASE ---
        const { itemId, sellerId, buyerId, itemName, itemPrice } = metadata;

        // Check if already processed (deduplication)
        const { data: existingItem } = await supabase
          .from('item_purchases')
          .select('id')
          .eq('stripe_session_id', session.id)
          .single();

        if (existingItem) {
          console.log(`Item purchase already processed for session ${session.id}`);
          return NextResponse.json({ received: true });
        }

        const { error } = await supabase.from('item_purchases').insert({
          item_id: itemId,
          seller_id: sellerId,
          buyer_id: buyerId,
          item_name: itemName || 'Unknown Item',
          price: parseFloat(itemPrice || '0'),
          stripe_session_id: session.id,
          status: 'completed',
          purchased_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error recording item purchase:', error);
          return NextResponse.json(
            { error: 'Failed to record purchase' },
            { status: 500 }
          );
        }

        console.log(`Item purchase recorded: ${itemName} sold by ${sellerId} to ${buyerId}`);
        return NextResponse.json({ success: true });
      } else {
        console.error('Webhook: unrecognized session metadata', metadata);
        return NextResponse.json({ received: true });
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
