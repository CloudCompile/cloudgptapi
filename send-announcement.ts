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
    title: '✨ Gemini 3 Flash is now FREE!',
    description: "We've updated our tiers to make Gemini 3 Flash available to everyone.",
    color: 0xFFA500, // Orange
    fields: [
      {
        name: '🆓 Gemini 3 Flash',
        value: 'The `gemini` model is now free for all users! Experience high-speed intelligence without a subscription.',
        inline: false
      },
      {
        name: '💎 Gemini 3 Pro',
        value: 'The `gemini-large` model remains a **Premium** model for our Pro and Enterprise subscribers.',
        inline: false
      },
      {
        name: '🚀 Peak Performance',
        value: 'We\'ve optimized our routing and cleaned up the interface for a smoother experience.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT - Always Improving',
      icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
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
        content: "@everyone ✨ **Gemini 3 Flash is now available for FREE!** (Pro remains Premium)",
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
