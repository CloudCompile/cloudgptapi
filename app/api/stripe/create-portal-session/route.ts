import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { getCorsHeaders } from '@/lib/utils';
import { getCurrentUserId } from '@/lib/kinde-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    let userId = null;
    
    // Try to get user from session
    try {
      userId = await getCurrentUserId();
    } catch (authError) {
      // Try from request body as fallback
      const body = await request.json().catch(() => ({}));
      userId = body.userId;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Get user's subscription from database
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', userId)
      .single();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      return NextResponse.json(
        { error: 'No active subscription found', details: subError.message },
        { status: 404, headers: getCorsHeaders() }
      );
    }

    if (!subscription?.stripe_customer_id) {
      console.error('No customer ID for user:', userId);
      return NextResponse.json(
        { error: 'No active subscription found', hint: 'Please contact support' },
        { status: 404, headers: getCorsHeaders() }
      );
    }

    // Create Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json(
      { url: portalSession.url },
      { headers: getCorsHeaders() }
    );
  } catch (error: any) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create billing portal session' },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}
