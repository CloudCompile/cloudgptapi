import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { supabaseAdmin } from '../../../../lib/supabase'; // We'll need a service role client for this

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId) {
      console.error('Webhook Error: User id is required in session metadata', session.id);
      return new NextResponse('User id is required', { status: 400 });
    }

    const userId = session.metadata.userId;
    const priceId = subscription.items.data[0].price.id;
    
    // Map price ID to plan name using env vars if available, fallback to hardcoded IDs from pricing page
    let planName = 'free';
    const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1Sn50iRG5zp0rTvzA3lI8SE2';
    const DEV_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_DEV_PRICE_ID || 'price_1Sn51wRG5zp0rTvz8SeF3WXh';

    if (priceId === PRO_PRICE_ID) {
      planName = 'pro';
    } else if (priceId === DEV_PRICE_ID) {
      planName = 'developer';
    }

    console.log(`Updating user ${userId} to plan ${planName} (price: ${priceId})`);

    // Update the profile plan in Supabase
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        plan: planName,
        stripe_product_id: subscription.items.data[0].plan.product as string,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error(`Error updating profile for user ${userId}:`, profileError);
    } else {
      console.log(`Successfully updated profile for user ${userId} to ${planName}`);
    }
    
    // Also track the subscription details for audit/debugging
    const sub = subscription as any;
    const { error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: sub.id,
        stripe_customer_id: sub.customer as string,
        stripe_price_id: priceId,
        stripe_current_period_end: new Date(
          sub.current_period_end * 1000
        ).toISOString(),
        status: sub.status,
      });

    if (subError) {
      console.error(`Error logging subscription for user ${userId}:`, subError);
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update the subscription current period end
    console.log(`Subscription ${subscription.id} payment succeeded`);
  }

  if (event.type === 'invoice.payment_failed') {
    console.log(`Payment failed for subscription: ${session.subscription}`);
    // Notify user or restrict access
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as any;
    console.log(`Subscription updated: ${subscription.id}`);
    // Sync new price/plan to database
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
    console.log(`Subscription cancelled/deleted: ${subscription.id}`);
    
    // Find the user with this subscription
    const { data: subData, error: subQueryError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (subQueryError || !subData) {
      console.error(`Error finding user for deleted subscription ${subscription.id}:`, subQueryError);
    } else {
      const userId = subData.user_id;
      console.log(`Reverting user ${userId} to free plan due to subscription deletion`);
      
      // Update the profile plan to 'free'
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          plan: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error(`Error reverting profile for user ${userId}:`, profileError);
      }
      
      // Update subscription status in database
      await supabaseAdmin
        .from('user_subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);
    }
  }

  return new NextResponse(null, { status: 200 });
}
