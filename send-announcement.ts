import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1458666010197495962';

async function sendAnnouncement() {
  const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;
  
  const embed = {
    title: '🚀 Services Restored: Pollinations & OpenRouter are Back!',
    description: "We've successfully restored full access to all models from Pollinations and OpenRouter with enhanced reliability.",
    color: 0x00FF00, // Green for "Back Online"
    fields: [
      {
        name: '🌈 Pollinations Restored',
        value: 'All high-speed models (GPT-4o, Gemini 2.0, DeepSeek V3) are now fully operational with optimized routing.',
        inline: false
      },
      {
        name: '🔗 OpenRouter Multi-Key Failover',
        value: 'We\'ve implemented a new multi-key fallback system for OpenRouter. If one key hits a limit, the system automatically switches to a backup key to ensure zero downtime.',
        inline: false
      },
      {
        name: '⚡ Performance Boost',
        value: 'Requests are now load-balanced across multiple API keys, providing higher effective rate limits and faster response times for all users.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT API - Service Status: Operational',
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
        content: "@everyone 🚀 **Pollinations and OpenRouter are back online!**",
        embeds: [embed] 
      }),
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
