import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase'; // We'll need a service role client for this

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
      return new NextResponse('User id is required', { status: 400 });
    }

    // Here you would update your database (Supabase) with the subscription info
    // For now, we'll log it. You'll need to define your schema for subscriptions.
    console.log(`User ${session.metadata.userId} subscribed to ${subscription.id}`);
    
    // Example Supabase update (requires a subscriptions table):
    /*
    await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id: session.metadata.userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        stripe_price_id: subscription.items.data[0].price.id,
        stripe_current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      });
    */
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
    // Remove access or mark as inactive in database
  }

  return new NextResponse(null, { status: 200 });
}
