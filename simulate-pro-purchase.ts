import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DISCORD_PRO_WEBHOOK = process.env.DISCORD_PRO_WEBHOOK;

async function simulateProPurchase() {
  if (!DISCORD_PRO_WEBHOOK) {
    console.error('DISCORD_PRO_WEBHOOK not found in .env.local');
    return;
  }

  const planName = 'pro';
  const userId = 'simulated_user_12345';

  const embed = {
    title: 'New Subscription Purchased!',
    description: `A user has successfully upgraded to the **${planName === 'pro' ? 'Pro' : 'Video Pro'}** plan.`,
    color: planName === 'pro' ? 0x00ff00 : 0x9b59b6, // Green for Pro, Purple for Video Pro
    fields: [
      {
        name: 'User ID',
        value: userId,
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
      text: 'CloudGPT Billing System (Simulation)'
    }
  };

  try {
    const response = await fetch(DISCORD_PRO_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🚀 **New ${planName.toUpperCase()} Upgrade! (SIMULATION)**`,
        embeds: [embed]
      })
    });

    if (response.ok) {
      console.log('✅ Simulation Discord notification sent successfully!');
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to send simulation notification:', errorData);
    }
  } catch (error: any) {
    console.error('❌ Error in simulation:', error.message);
  }
}

simulateProPurchase();
