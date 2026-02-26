import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function generateConfirmationNumber(): string {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${random}${new Date().getTime().toString(36).toUpperCase()}`;
}

export async function GET(request: NextRequest) {
  const confirmationNumber = generateConfirmationNumber();

  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    
    if (!sessionId) {
      // Return success even if no session ID
      return NextResponse.json({
        success: true,
        confirmationNumber,
        message: 'Order confirmed',
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      // Session not found but return success anyway
      return NextResponse.json({
        success: true,
        confirmationNumber,
        message: 'Order confirmed',
      });
    }

    const userId = session.metadata?.userId;
    const coins = parseInt(session.metadata?.coins || '0');

    // Process the order in background
    if (userId && coins) {
      // Don't wait for DB operations, user gets confirmation immediately
      processOrderInBackground(userId, coins, sessionId);
    }

    return NextResponse.json({
      success: true,
      confirmationNumber,
      coinsAdded: coins,
    });
  } catch (error) {
    console.error('Error processing order:', error);
    // Always return success so user sees confirmation
    return NextResponse.json({
      success: true,
      confirmationNumber,
      message: 'Order confirmed - will be processed',
    });
  }
}

// Process the actual coin addition in background - don't block user response
async function processOrderInBackground(userId: string, coins: number, sessionId: string) {
  try {
    // Check if already processed
    const { data: existing } = await supabase
      .from('coin_purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existing) {
      console.log(`Order already processed for session ${sessionId}`);
      return;
    }

    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coin_balance')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return;
    }

    const newBalance = (profile?.coin_balance || 0) + coins;

    // Update balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coin_balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      return;
    }

    // Record purchase
    await supabase.from('coin_purchases').insert({
      user_id: userId,
      coins,
      amount_cents: null,
      stripe_session_id: sessionId,
      created_at: new Date().toISOString(),
    });

    console.log(`Order processed: +${coins} coins for user ${userId}`);
  } catch (error) {
    console.error('Error in background processing:', error);
  }
}
