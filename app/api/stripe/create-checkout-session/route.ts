import { getCurrentUserId, getCurrentUser } from '@/lib/kinde-auth';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the user's email from Kinde
    const user = await getCurrentUser();
    const userEmail = user?.email || undefined;

    const body = await req.json();
    const { priceId, promoCode, mode } = body;

    if (!priceId) {
      return new NextResponse('Price ID is required', { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

    // Validate promo code if provided
    let discountParams: { discounts?: { coupon: string }[] } = {};
    
    if (promoCode) {
      const normalizedCode = promoCode.toUpperCase().trim();
      
      // Fetch promo code from database
      const { data: promoData, error: promoError } = await supabaseAdmin
        .from('promo_codes')
        .select('*')
        .eq('code', normalizedCode)
        .eq('is_active', true)
        .single();

      if (!promoError && promoData) {
        // Check expiration
        if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
          return NextResponse.json(
            { error: 'Promo code has expired' },
            { status: 400 }
          );
        }

        // Check usage limit
        if (promoData.usage_limit && promoData.times_used >= promoData.usage_limit) {
          return NextResponse.json(
            { error: 'Promo code usage limit exceeded' },
            { status: 400 }
          );
        }

        // Create Stripe coupon
        const couponParams: any = {
          duration: 'once',
        };

        if (promoData.discount_type === 'percent') {
          couponParams.percent_off = promoData.discount_amount;
        } else {
          couponParams.amount_off = Math.round(promoData.discount_amount * 100); // cents
          couponParams.currency = 'usd';
        }

        const stripeCoupon = await stripe.coupons.create(couponParams);
        
        // Apply discount to checkout
        discountParams = {
          discounts: [{ coupon: stripeCoupon.id }],
        };

        console.log(`[CHECKOUT] Applied promo code ${normalizedCode} with coupon ${stripeCoupon.id}`);
      }
    }

    const checkoutMode = mode === 'payment' ? 'payment' : 'subscription';

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      ...discountParams,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: checkoutMode,
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
        userEmail: userEmail,
        ...(promoCode && { promoCode: promoCode.toUpperCase() }),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error.message || 'Internal Error',
        code: error.code,
        type: error.type
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
