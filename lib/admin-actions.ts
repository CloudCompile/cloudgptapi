'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabase';
import { revalidatePath } from 'next/cache';

async function verifyAdmin() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: Admin access required');
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error || !profile || profile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return userId;
}

export async function getAllUsers() {
  await verifyAdmin();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data;
}

export async function promoteUser(userId: string, role: 'user' | 'admin') {
  await verifyAdmin();

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to promote user: ${error.message}`);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function assignPlan(userId: string, plan: 'free' | 'developer' | 'pro' | 'enterprise', stripeProductId?: string) {
  await verifyAdmin();

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ 
      plan, 
      stripe_product_id: stripeProductId || null 
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to assign plan: ${error.message}`);
  }

  // Update Clerk metadata with plan
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        plan: plan
      }
    });
  } catch (clerkError) {
    console.error(`Failed to update Clerk metadata for ${userId}:`, clerkError);
  }

  // Also update rate limits for their API keys if they upgrade
  if (plan === 'pro' || plan === 'enterprise' || plan === 'developer') {
    let rateLimit = 100; // Developer default
    if (plan === 'pro') rateLimit = 500;
    if (plan === 'enterprise') rateLimit = 1000;

    const { error: keyError } = await supabaseAdmin
      .from('api_keys')
      .update({ rate_limit: rateLimit })
      .eq('user_id', userId);
      
    if (keyError) {
      console.error('Failed to update API key rate limits:', keyError);
    }
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function syncUser(userId: string, email: string, username?: string, name?: string, avatar?: string) {
  // 1. Check if user already exists by ID
  const { data: existingProfileById } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existingProfileById) {
    // Already synced, just ensure profile info is up to date
    await supabaseAdmin
      .from('profiles')
      .update({ 
        email,
        username: username || undefined,
        name: name || undefined,
        avatar: avatar || undefined
      })
      .eq('id', userId);
    return;
  }

  // 2. Check if user exists by email (Clerk to Logto migration case)
  const { data: existingProfileByEmail } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (existingProfileByEmail && existingProfileByEmail.id !== userId) {
    const oldId = existingProfileByEmail.id;
    console.log(`[Migration] Migrating user ${email} from old ID ${oldId} to new ID ${userId}`);

    try {
      // 1. Update related tables that reference user_id
      // We do this first to ensure data is moved before we create the new profile
      const updateResults = await Promise.all([
        supabaseAdmin.from('api_keys').update({ user_id: userId }).eq('user_id', oldId),
        supabaseAdmin.from('usage_logs').update({ user_id: userId }).eq('user_id', oldId),
        supabaseAdmin.from('user_subscriptions').update({ user_id: userId }).eq('user_id', oldId),
      ]);

      const errors = updateResults.filter(r => r.error);
      if (errors.length > 0) {
        console.error(`[Migration] Errors updating related tables for ${email}:`, errors);
      }

      // 3. Check for existing subscription to determine initial plan
      const { data: subscription } = await supabaseAdmin
        .from('user_subscriptions')
        .select('stripe_price_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      let initialPlan = 'free';
      if (subscription) {
        const priceId = subscription.stripe_price_id;
        const PRO_PRICE_IDS = [
          process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1Sn50iRG5zp0rTvzA3lI8SE2',
          'price_1SnmRzRG5zp0rTvzlRi9k0EO'
        ];
        const DEV_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_DEV_PRICE_ID || 'price_1Sn51wRG5zp0rTvz8SeF3WXh';
        const VIDEO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_VIDEO_PRICE_ID || 'price_1SnLTHRG5zp0rTvzT7KuRE8v';

        if (PRO_PRICE_IDS.includes(priceId)) initialPlan = 'pro';
        else if (priceId === DEV_PRICE_ID) initialPlan = 'developer';
        else if (priceId === VIDEO_PRICE_ID) initialPlan = 'video_pro';
      }

      // Create new profile with new ID but old data
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          ...existingProfileByEmail,
          id: userId,
          plan: initialPlan !== 'free' ? initialPlan : existingProfileByEmail.plan,
          updated_at: new Date().toISOString()
        });

      if (!insertError || insertError.code === '23505') { // Success or already exists
        // 3. Delete the old profile record
        await supabaseAdmin.from('profiles').delete().eq('id', oldId);
        console.log(`[Migration] Successfully migrated all data for ${email} from ${oldId} to ${userId}`);
        return;
      } else {
        console.error(`[Migration] Failed to create new profile for ${email}:`, insertError);
      }
    } catch (migError) {
      console.error(`[Migration] Critical error during migration for ${email}:`, migError);
    }
  }

  // 3. Brand new user case
  console.log(`[Sync] Creating new profile for brand new user ${email} (${userId})`);

  // Check if they have an existing subscription by email (from Stripe sync or webhook)
  const { data: emailSubscription } = await supabaseAdmin
    .from('user_subscriptions')
    .select('stripe_price_id, stripe_subscription_id')
    .eq('user_id', email) // Some webhooks might store email as user_id temporarily if user not found
    .eq('status', 'active')
    .maybeSingle();

  // Also check by ID in case it was already linked
  const { data: idSubscription } = await supabaseAdmin
    .from('user_subscriptions')
    .select('stripe_price_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  const subscription = idSubscription || emailSubscription;
  let initialPlan = 'free';

  if (subscription) {
    const priceId = subscription.stripe_price_id;
    const PRO_PRICE_IDS = [
      process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1Sn50iRG5zp0rTvzA3lI8SE2',
      'price_1SnmRzRG5zp0rTvzlRi9k0EO'
    ];
    const DEV_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_DEV_PRICE_ID || 'price_1Sn51wRG5zp0rTvz8SeF3WXh';
    const VIDEO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_VIDEO_PRICE_ID || 'price_1SnLTHRG5zp0rTvzT7KuRE8v';

    if (PRO_PRICE_IDS.includes(priceId)) initialPlan = 'pro';
    else if (priceId === DEV_PRICE_ID) initialPlan = 'developer';
    else if (priceId === VIDEO_PRICE_ID) initialPlan = 'video_pro';

    // If we found it by email, we should update the user_id in the subscription record
    if (emailSubscription && !idSubscription) {
      await supabaseAdmin
        .from('user_subscriptions')
        .update({ user_id: userId })
        .eq('stripe_subscription_id', emailSubscription.stripe_subscription_id);
    }
  }

  const { error: finalInsertError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      email,
      username: username || undefined,
      name: name || undefined,
      avatar: avatar || undefined,
      role: 'user',
      plan: initialPlan,
    });

  if (finalInsertError && finalInsertError.code !== '23505') {
    console.error('Error syncing user profile:', finalInsertError);
    return;
  }

  // Update Clerk metadata with plan (default to 'free' if not set from subscription)
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        plan: initialPlan || 'free'
      }
    });
  } catch (clerkError) {
    console.error(`Failed to update Clerk metadata for new user ${userId}:`, clerkError);
  }

  // Only notify Discord if this is a truly new user (didn't exist before in any form)
  if (!existingProfileById && !existingProfileByEmail) {
    const discordWebhookUrl = process.env.DISCORD_PRO_WEBHOOK;
    if (discordWebhookUrl) {
      try {
        const embed = {
          title: 'New User Joined! 🚀',
          description: `A new user has just signed up for Vetra.`,
          color: 0x3498db, // Blue
          fields: [
            {
              name: 'User ID',
              value: userId,
              inline: true
            },
            {
              name: 'Email',
              value: email,
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Vetra User System'
          }
        };

        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🆕 **New User Signup: ${email}**`,
            embeds: [embed]
          })
        });
      } catch (discordError) {
        console.error('Failed to send Discord notification for new user:', discordError);
      }
    }
  }
}
