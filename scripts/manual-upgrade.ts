
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DISCORD_PRO_WEBHOOK = process.env.DISCORD_PRO_WEBHOOK;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function upgradeUserByEmail(email: string) {
  console.log(`--- Upgrading user ${email} to Pro ---`);
  
  try {
    // 1. Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, plan')
      .eq('email', email)
      .maybeSingle();

    if (profileError) {
      console.error(`Error finding profile for ${email}:`, profileError.message);
      return;
    }

    if (!profile) {
      console.log('User might not have logged into the dashboard yet. Creating profile...');
      // If user doesn't exist, we might need to wait for them to log in, 
      // OR we can create a placeholder if we have a userId. 
      // Since we don't have the Clerk userId, we can't create the profile correctly.
      return;
    }

    console.log(`Found profile: ${profile.id} (${profile.email}), current plan: ${profile.plan}`);

    if (profile.plan === 'pro') {
      console.log('User is already on Pro plan.');
    } else {
      // 2. Update to Pro
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          plan: 'pro',
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating profile:', updateError.message);
        return;
      }

      console.log(`Successfully updated ${email} to Pro plan.`);
    }

    // 3. Notify Discord
    if (DISCORD_PRO_WEBHOOK) {
      const embed = {
        title: 'Manual Subscription Upgrade',
        description: `User **${email}** has been manually upgraded to the **PRO** plan.`,
        color: 0x00ff00, // Green
        fields: [
          {
            name: 'User ID',
            value: profile.id,
            inline: true
          },
          {
            name: 'Email',
            value: email,
            inline: true
          },
          {
            name: 'Action',
            value: 'User should now have access to Pro features.',
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'CloudGPT Manual Admin Action'
        }
      };

      await fetch(DISCORD_PRO_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🛠️ **Manual Upgrade: ${email}**`,
          embeds: [embed]
        })
      });
      console.log('Discord notification sent.');
    }

  } catch (err: any) {
    console.error('System error:', err.message);
  }
}

const targetEmail = process.argv[2] || 'kyhas@hotmail.co.uk';
upgradeUserByEmail(targetEmail);
