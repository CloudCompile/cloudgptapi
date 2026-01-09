'use server';

import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabase';
import { revalidatePath } from 'next/cache';

async function verifyAdmin() {
  const user = await currentUser();

  if (!user) {
    throw new Error('Unauthorized: Admin access required');
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return user;
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

export async function syncUser(userId: string, email: string) {
  // Check if user already exists
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  // This can be called when a user logs in to ensure they have a profile
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({ 
      id: userId, 
      email: email,
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error syncing user profile:', error);
    return;
  }

  // If this is a new user (didn't exist before upsert), notify Discord
  if (!existingProfile) {
    const discordWebhookUrl = process.env.DISCORD_PRO_WEBHOOK;
    if (discordWebhookUrl) {
      try {
        const embed = {
          title: 'New User Joined! 🚀',
          description: `A new user has just signed up for CloudGPT.`,
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
            text: 'CloudGPT User System'
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
