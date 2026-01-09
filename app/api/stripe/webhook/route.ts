import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const arrayBuffer = await req.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;
  const requestId = `stripe_${event.id}`;

  if (event.type === 'checkout.session.completed') {
    if (!session.subscription) {
      console.error(`[${requestId}] Webhook Error: No subscription in session`, session.id);
      return new NextResponse('No subscription on session', { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId) {
      console.error(`[${requestId}] Webhook Error: User id is required in session metadata`, session.id);
      return new NextResponse('User id is required', { status: 400 });
    }

    const userId = session.metadata.userId;
    const userEmail = session.metadata.userEmail;
    const priceId = subscription.items.data[0].price.id;
    
    // Map price ID to plan name using env vars if available, fallback to hardcoded IDs from pricing page
    let planName = 'free';
    const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1Sn50iRG5zp0rTvzA3lI8SE2';
    const DEV_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_DEV_PRICE_ID || 'price_1Sn51wRG5zp0rTvz8SeF3WXh';
    const VIDEO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_VIDEO_PRICE_ID || 'price_1SnLTHRG5zp0rTvzT7KuRE8v';

    if (priceId === PRO_PRICE_ID) {
      planName = 'pro';
    } else if (priceId === DEV_PRICE_ID) {
      planName = 'developer';
    } else if (priceId === VIDEO_PRICE_ID) {
      planName = 'video_pro';
    }

    console.log(`[${requestId}] Updating user ${userId} (${userEmail || 'no email'}) to plan ${planName} (price: ${priceId})`);

    // Use upsert to ensure profile exists
    const profileUpdate: any = { 
      id: userId,
      plan: planName,
      stripe_product_id: subscription.items.data[0].plan.product as string,
      updated_at: new Date().toISOString()
    };

    if (userEmail) {
      profileUpdate.email = userEmail;
    }

    const { data: updatedProfiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileUpdate, { onConflict: 'id' })
      .select();

    if (profileError) {
      console.error(`[${requestId}] Error upserting profile for user ${userId}:`, profileError);
    } else {
      console.log(`[${requestId}] Successfully updated profile for user ${userId} to ${planName}`, updatedProfiles);
      
      // Notify Discord via webhook if user upgraded to Pro or Video Pro
      if (planName === 'pro' || planName === 'video_pro' || planName === 'developer') {
        const discordWebhookUrl = process.env.DISCORD_PRO_WEBHOOK;
        if (discordWebhookUrl) {
          try {
            const embed = {
              title: 'New Subscription Purchased!',
              description: `A user has successfully upgraded to the **${planName.toUpperCase()}** plan.`,
              color: planName === 'pro' ? 0x00ff00 : (planName === 'developer' ? 0x3498db : 0x9b59b6),
              fields: [
                {
                  name: 'User ID',
                  value: userId,
                  inline: true
                },
                {
                  name: 'Email',
                  value: userEmail || 'N/A',
                  inline: true
                },
                {
                  name: 'Plan',
                  value: planName.toUpperCase(),
                  inline: true
                },
                {
                  name: 'Action Required',
                  value: 'Invite the user to the exclusive Pro channels!',
                  inline: false
                }
              ],
              timestamp: new Date().toISOString(),
              footer: {
                text: 'CloudGPT Billing System'
              }
            };

            await fetch(discordWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content: `🚀 **New ${planName.toUpperCase()} Upgrade!**`,
                embeds: [embed]
              })
            });
            console.log(`[${requestId}] Discord notification sent for plan upgrade`);
          } catch (discordError) {
            console.error(`[${requestId}] Failed to send Discord notification:`, discordError);
          }
        }
      }
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
      }, { onConflict: 'stripe_subscription_id' });

    if (subError) {
      console.error(`[${requestId}] Error logging subscription for user ${userId}:`, subError);
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      ) as any;
      console.log(`[${requestId}] Subscription ${subscription.id} payment succeeded`);
      
      // Update subscription status in database
      await supabaseAdmin
        .from('user_subscriptions')
        .update({ 
          status: subscription.status,
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);
    }
  }

  if (event.type === 'invoice.payment_failed') {
    console.log(`[${requestId}] Payment failed for subscription: ${session.subscription}`);
    
    if (session.subscription) {
      await supabaseAdmin
        .from('user_subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', session.subscription);
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as any;
    console.log(`[${requestId}] Subscription updated: ${subscription.id}`);
    
    // Sync new price/plan to database
    const priceId = subscription.items.data[0].price.id;
    let planName = 'free';
    const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1Sn50iRG5zp0rTvzA3lI8SE2';
    const DEV_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_DEV_PRICE_ID || 'price_1Sn51wRG5zp0rTvz8SeF3WXh';
    const VIDEO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_VIDEO_PRICE_ID || 'price_1SnLTHRG5zp0rTvzT7KuRE8v';

    if (priceId === PRO_PRICE_ID) {
      planName = 'pro';
    } else if (priceId === DEV_PRICE_ID) {
      planName = 'developer';
    } else if (priceId === VIDEO_PRICE_ID) {
      planName = 'video_pro';
    }

    // Find user ID for this subscription
    const { data: subData } = await supabaseAdmin
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (subData) {
      console.log(`[${requestId}] Updating user ${subData.user_id} plan to ${planName} due to subscription update`);
      
      await supabaseAdmin
        .from('profiles')
        .update({ 
          plan: planName,
          stripe_product_id: subscription.items.data[0].plan.product as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', subData.user_id);
        
      await supabaseAdmin
        .from('user_subscriptions')
        .update({ 
          status: subscription.status,
          stripe_price_id: priceId,
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
    console.log(`[${requestId}] Subscription cancelled/deleted: ${subscription.id}`);
    
    // Find the user with this subscription
    const { data: subData, error: subQueryError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (subQueryError || !subData) {
      console.error(`[${requestId}] Error finding user for deleted subscription ${subscription.id}:`, subQueryError);
    } else {
      const userId = subData.user_id;
      console.log(`[${requestId}] Reverting user ${userId} to free plan due to subscription deletion`);
      
      // Update the profile plan to 'free'
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          plan: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error(`[${requestId}] Error reverting profile for user ${userId}:`, profileError);
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
