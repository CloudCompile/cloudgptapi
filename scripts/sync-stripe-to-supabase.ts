
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
  console.error('Error: Missing required environment variables in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16' as any, // Use a stable version
});

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
const DEV_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_DEV_PRICE_ID;

// Manual overrides from lib/api-keys.ts
const MANUAL_OVERRIDES: Record<string, string> = {
  'mschneider2492@gmail.com': 'developer',
  'sakurananachan645@gmail.com': 'pro',
  'bakatsun09@gmail.com': 'pro'
};

async function syncStripeToSupabase() {
  console.log('--- Starting Stripe to Supabase Sync ---');

  try {
    // 1. Fetch all active subscriptions from Stripe
    console.log('Fetching active subscriptions from Stripe...');
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer'],
    });

    console.log(`Found ${subscriptions.data.length} active subscriptions.`);

    for (const sub of subscriptions.data) {
      const customer = sub.customer as Stripe.Customer;
      const email = customer.email;
      const priceId = sub.items.data[0].price.id;
      
      let planName = 'free';
      if (priceId === PRO_PRICE_ID) {
        planName = 'pro';
      } else if (priceId === DEV_PRICE_ID) {
        planName = 'developer';
      }

      if (!email) {
        console.warn(`Subscription ${sub.id} has no customer email. Skipping.`);
        continue;
      }

      console.log(`Processing subscription for ${email}: Plan=${planName}, Status=${sub.status}`);

      // 2. Find user profile by email
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, plan')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error(`Error fetching profile for ${email}:`, profileError.message);
        continue;
      }

      if (!profile) {
        console.warn(`No Supabase profile found for ${email}. User may not have logged in yet.`);
        continue;
      }

      // 3. Update profile if plan doesn't match
      if (profile.plan !== planName) {
        console.log(`Updating ${email} plan from ${profile.plan} to ${planName}...`);
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            plan: planName,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`Error updating plan for ${email}:`, updateError.message);
        } else {
          console.log(`Successfully updated ${email} to ${planName}.`);
        }
      } else {
        console.log(`${email} already has the correct plan: ${planName}`);
      }

      // 4. Upsert into user_subscriptions table
      // Ensure we have a valid date for current_period_end
      let periodEndIso: string;
      try {
        const currentPeriodEnd = (sub as any).current_period_end;
        if (currentPeriodEnd && !isNaN(currentPeriodEnd)) {
          periodEndIso = new Date(currentPeriodEnd * 1000).toISOString();
        } else {
          periodEndIso = new Date().toISOString();
        }
      } catch (e) {
        console.error(`Invalid date for subscription ${sub.id}:`, (sub as any).current_period_end);
        periodEndIso = new Date().toISOString();
      }

      const { error: subError } = await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
          user_id: profile.id,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          stripe_price_id: priceId,
          stripe_current_period_end: periodEndIso,
          status: sub.status,
          updated_at: new Date().toISOString()
        }, { onConflict: 'stripe_subscription_id' });

      if (subError) {
        console.error(`Error upserting subscription record for ${email}:`, subError.message);
      }
    }

    // 5. Apply Manual Overrides
    console.log('\n--- Applying Manual Overrides ---');
    for (const [email, plan] of Object.entries(MANUAL_OVERRIDES)) {
      console.log(`Checking override for ${email} -> ${plan}...`);
      
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, plan')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error(`Error fetching profile for override ${email}:`, profileError.message);
        continue;
      }

      if (profile && profile.plan !== plan) {
        console.log(`Applying override: Updating ${email} plan from ${profile.plan} to ${plan}...`);
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            plan: plan,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`Error applying override for ${email}:`, updateError.message);
        } else {
          console.log(`Successfully applied override for ${email}.`);
        }
      } else if (!profile) {
        console.log(`No profile found for override ${email}. skipping.`);
      } else {
        console.log(`${email} already has override plan ${plan}.`);
      }
    }

  } catch (error: any) {
    console.error('Fatal error during sync:', error.message);
  }

  console.log('\n--- Sync Complete ---');
}

syncStripeToSupabase();
