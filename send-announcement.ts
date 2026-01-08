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
    title: '✨ CloudGPT: UI & Model Update',
    description: "We've rolled out a significant update to the CloudGPT interface. Experience a more fluid dashboard and access the latest cutting-edge models directly from our homepage.",
    color: 0x6366f1, // Indigo/Primary color
    fields: [
      {
        name: '🖱️ Enhanced Interactivity',
        value: 'The dashboard sidebar has been fully optimized with improved layering (z-index) and scroll behavior for seamless navigation.',
        inline: false
      },
      {
        name: '🚀 New Model Lineup',
        value: 'Our homepage now features the latest industry-leading models, including Claude 3.5 Sonnet, Gemini 2.0 Flash, and DeepSeek-V3.',
        inline: false
      },
      {
        name: '💎 Refined UI/UX',
        value: 'Polished glassmorphism effects and corrected layouts across the platform for a more professional and reliable experience.',
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
        content: "@everyone 🚀 **The CloudGPT UI & Model Update is now live! Explore the latest improvements and infrastructure.**",
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
