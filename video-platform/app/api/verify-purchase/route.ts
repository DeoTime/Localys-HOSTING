import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const userId = session.metadata?.userId;
    const coins = parseInt(session.metadata?.coins || '0');

    if (!userId || !coins) {
      return NextResponse.json(
        { error: 'Missing metadata in session' },
        { status: 400 }
      );
    }

    // Check if purchase already exists
    const { data: existingPurchase } = await supabase
      .from('coin_purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existingPurchase) {
      // Already processed
      return NextResponse.json({
        success: true,
        coinsAdded: coins,
        alreadyProcessed: true,
      });
    }

    // Get user's current coin balance
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

    // Update user's coin balance
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

    // Record the purchase
    const { error: purchaseError } = await supabase
      .from('coin_purchases')
      .insert({
        user_id: userId,
        coins,
        amount_cents: session.amount_total,
        stripe_session_id: sessionId,
        created_at: new Date().toISOString(),
      });

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError);
      // Still successful even if recording fails
    }

    console.log(`Added ${coins} coins to user ${userId}. New balance: ${newBalance}`);

    return NextResponse.json({
      success: true,
      coinsAdded: coins,
      newBalance,
      alreadyProcessed: false,
    });
  } catch (error) {
    console.error('Error processing purchase confirmation:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to process purchase';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
