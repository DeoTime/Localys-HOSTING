import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const body = await request.json();
    const { itemId, itemName, itemPrice, sellerId, buyerId, itemImage, couponCode } = body;

    if (!itemId || !itemName || itemPrice === undefined || !sellerId || !buyerId) {
      console.error('Missing required fields:', { itemId, itemName, itemPrice, sellerId, buyerId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let finalPrice = itemPrice;
    let appliedCouponCode: string | null = null;
    let discountPercentage = 0;

    // Validate and apply coupon if provided
    if (couponCode) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (couponError || !coupon) {
        return NextResponse.json(
          { error: 'Invalid or expired coupon' },
          { status: 400 }
        );
      }

      // Check expiry
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        return NextResponse.json(
          { error: 'Coupon has expired' },
          { status: 400 }
        );
      }

      // Check max uses
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json(
          { error: 'Coupon has reached maximum uses' },
          { status: 400 }
        );
      }

      discountPercentage = coupon.discount_percentage;
      const discount = finalPrice * (discountPercentage / 100);
      finalPrice = Math.max(0, finalPrice - discount);
      appliedCouponCode = couponCode.toUpperCase();

      // Mark coupon as used and increment count
      await supabase
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', coupon.id);
    }

    const priceInCents = Math.round(finalPrice * 100);

    const productName = appliedCouponCode
      ? `${itemName} (${discountPercentage}% off with ${appliedCouponCode})`
      : itemName;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: `Purchase from local business`,
              images: itemImage ? [itemImage] : [],
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://localys.xyz'}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://localys.xyz'}/profile/${sellerId}?canceled=true`,
      metadata: {
        itemId: itemId.toString(),
        itemName: itemName.toString(),
        sellerId: sellerId.toString(),
        buyerId: buyerId.toString(),
        itemPrice: itemPrice.toString(),
        ...(appliedCouponCode && {
          couponCode: appliedCouponCode,
          discountPercentage: discountPercentage.toString(),
          finalPrice: finalPrice.toString(),
        }),
      },
    });

    if (!session || !session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    console.log(`Checkout session created: ${session.id} for item ${itemName}${appliedCouponCode ? ` with coupon ${appliedCouponCode}` : ''}`);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
