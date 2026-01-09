import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1458666010197495962';

async function sendAnnouncement() {
  if (!BOT_TOKEN) {
    console.error('DISCORD_BOT_TOKEN not found in environment variables');
    return;
  }

  const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;
  
  const embed = {
    title: '💎 CloudGPT Pro: Pricing Update & Early Access',
    description: "CloudGPT Pro is currently available for just **$1/month**. We're announcing that the price will be increasing soon as we expand our infrastructure and model offerings.",
    color: 0x6366f1, // Indigo/Primary color
    fields: [
      {
        name: '� Lock In Your Price',
        value: "If you purchase your Pro plan now at **$1**, you will be grandfathered into this price. Your subscription will stay at **$1/month** even after the general price increase.",
        inline: false
      },
      {
        name: '🚀 Unlimited Potential',
        value: 'Pro members get priority access to premium models including Claude 3.5 Sonnet, Gemini 2.0 Flash, and our upcoming specialized agents.',
        inline: false
      },
      {
        name: '�️ UI & Model Update',
        value: 'Experience our newly optimized dashboard with improved sidebar interactivity and a refined model lineup directly on the homepage.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT — The Infrastructure for Professional AI',
      icon_url: 'https://raw.githubusercontent.com/lucide-software/lucide/main/icons/cloud.png'
    },
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        content: "@everyone � **Pro Pricing Update: Lock in your $1/month plan before the price increases!**",
        embeds: [embed] 
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Announcement pushed successfully to Announcements channel!');
      console.log('Message ID:', data.id);
    } else {
      const errorData = await response.json();
      console.error('Failed to push announcement:', errorData);
    }
  } catch (error: any) {
    console.error('Error sending announcement:', error.message);
  }
}

sendAnnouncement();
