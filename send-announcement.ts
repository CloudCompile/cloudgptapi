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
    title: '🎭 New Roleplaying Platform: Beta Test Starting!',
    description: "We're excited to announce our brand new Roleplaying platform is now live for early testing! This is designed to be a powerful replacement for Janitor and Silly Tavern.",
    color: 0x9B59B6, // Purple for RP/Creativity
    fields: [
      {
        name: '🚀 Early Access',
        value: 'Visit now at: [meridianlabsapp.website/RP](https://meridianlabsapp.website/RP)',
        inline: false
      },
      {
        name: '⚠️ Work in Progress',
        value: 'This platform was just built and is in its very early stages. We need your feedback to shape its development!',
        inline: false
      },
      {
        name: '💬 Your Feedback Matters',
        value: 'Please jump in, test it out, and let us know what you think. Your input will directly determine the features we build next.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT & Meridian Labs - Building the future of RP',
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
        content: "@everyone 🎭 **A new challenger in the RP space has arrived!**",
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
