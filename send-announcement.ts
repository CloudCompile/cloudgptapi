import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = '1458666010197495962';

async function sendAnnouncement() {
  if (!BOT_TOKEN) {
    console.error('DISCORD_BOT_TOKEN not found in environment variables');
    return;
  }

  const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;
  
  const embed = {
    title: '⚠️ Service Update: Pollinations Models',
    description: "We are currently performing maintenance on all **Pollinations** powered models. They are temporarily unavailable.",
    color: 0xffa500, // Orange
    fields: [
      {
        name: '🕒 Expected Return',
        value: "Models are expected to be back online by **2:00 PM EST**.",
        inline: false
      },
      {
        name: '⚡ Alternative Models',
        value: 'While Pollinations is down, you can still use our other high-performance models from Anthropic, Google, and OpenAI.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT Service Status',
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
        content: "@everyone ⚠️ **Pollinations models are temporarily down until 2PM EST.**",
        embeds: [embed] 
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Announcement pushed successfully to channel:', CHANNEL_ID);
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
