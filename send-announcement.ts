import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1458666010197495962';

async function sendAnnouncement() {
  const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;
  
  const embed = {
    title: 'CloudGPT API: Plan-Based Rate Limits and New Video Pro Plan',
    description: "We have implemented a robust plan-based rate limiting system and introduced a dedicated Video Pro plan for high-quality video generation.",
    color: 0x5865F2, // Discord Blurple
    fields: [
      {
        name: 'New Video Pro Plan ($5/mo)',
        value: '- **Exclusive Access:** All video models (Google Veo, Seedance Pro) now require the Video Pro or flagship Pro plan.\n- **Higher Limits:** 2 RPM and 2,000 requests per day for video generation.\n- **Commercial Rights:** Fully included for Video Pro subscribers.',
        inline: false
      },
      {
        name: 'Updated Rate Limits (RPM)',
        value: '- **Image Generation:** 5 RPM for all users.\n- **Chat Completions:** 100 RPM (Free) / 200 RPM (Pro).\n- **Memory API:** 20 RPM (Free) / 50 RPM (Pro).',
        inline: false
      },
      {
        name: 'Daily Request Limits (RPD)',
        value: '- **Free Users:** 1,000 requests per day across all routes.\n- **Pro Users:** 2,000 requests per day across all routes.\n- **Resets:** Daily at 00:00 UTC.',
        inline: false
      },
      {
        name: 'Synchronization and Reliability',
        value: '- **OpenAI V1 Sync:** All rate limits and reliability fixes are now synchronized to /v1 endpoints.\n- **Descriptive Errors:** Enhanced 429 responses with X-RateLimit and X-DailyLimit headers.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT API - Powered by Gemini 3 Flash Preview',
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
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Announcement pushed successfully!');
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
