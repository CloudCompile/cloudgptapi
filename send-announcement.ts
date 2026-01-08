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
    title: '✨ CloudGPT: The Next Generation',
    description: "The CloudGPT Studio overhaul is now live. We've completely redesigned the experience for professional AI developers. Faster, cleaner, and more powerful than ever.",
    color: 0x6366f1, // Indigo/Primary color
    fields: [
      {
        name: '🎨 Modern UI/UX',
        value: 'A brand new visual identity with glassmorphism, dot-grid backgrounds, and smooth animations across the entire platform.',
        inline: false
      },
      {
        name: '⚡ Performance Optimized',
        value: 'Dashboard and documentation rewritten for sub-100ms response times and global low-latency access.',
        inline: false
      },
      {
        name: '🛠️ Developer Tools',
        value: 'Enhanced API documentation and real-time model monitoring to streamline your production workflow.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT Studio — The Infrastructure for Professional AI',
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
        content: "@everyone 🚀 **The CloudGPT Studio Overhaul is now live! Explore the next generation of AI infrastructure.**",
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
