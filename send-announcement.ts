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
    title: '🛠️ Scheduled Maintenance',
    description: "We are performing a quick system migration to improve performance and stability.",
    color: 0xFF0000, // Red for maintenance
    fields: [
      {
        name: '⏱️ Duration',
        value: 'Expected downtime: **2-4 minutes**.',
        inline: false
      },
      {
        name: '🚀 Purpose',
        value: 'Migration to enhanced infrastructure for better reliability.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT - Scaling Up',
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
        content: "@everyone 🛠️ **Scheduled Maintenance: 5-10 minute downtime for migration starting now.**",
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
