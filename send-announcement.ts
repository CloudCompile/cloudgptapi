import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const WEBHOOK_URL = process.env.DISCORD_PRO_WEBHOOK;
const CHANNEL_ID = '1459360039809843310';
const LOCK_FILE = path.join(process.cwd(), '.maintenance-sent');

async function sendAnnouncement() {
  // Check if already sent
  if (fs.existsSync(LOCK_FILE)) {
    const lastSent = fs.readFileSync(LOCK_FILE, 'utf8');
    const sentTime = new Date(lastSent).getTime();
    const now = Date.now();
    
    // Only allow one message every 4 hours to prevent spamming
    if (now - sentTime < 4 * 60 * 60 * 1000) {
      console.log('Announcement already sent recently. Skipping to prevent spam.');
      return;
    }
  }

  const embed = {
    title: '🚀 New Models & Lightning Speed Upgrades',
    description: "We've just integrated several cutting-edge models and optimized our infrastructure for unprecedented response times across the board.",
    color: 0x7289da, // Discord Blurple
    fields: [
      {
        name: '🧠 New Reasoning & Text',
        value: '• **Phi-4-reasoning**: Advanced logic & coding\n• **AI21-Jamba-1.5-Large**: Massive context & high accuracy',
        inline: false
      },
      {
        name: '🎨 New Image Generation',
        value: '• **Stable-Diffusion-3.5-Large**: Next-gen photorealism\n• **HunyuanImage-3.0**: Superior prompt adherence\n• **Qwen-Image**: High-speed multimodal generation',
        inline: false
      },
      {
        name: '⚡ Lightning Speed',
        value: 'Our new optimized routing engine now delivers **sub-500ms** response times for high-speed models. Experience the fastest AI responses on the market.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT Performance Update',
      icon_url: 'https://raw.githubusercontent.com/lucide-software/lucide/main/icons/zap.png'
    },
    timestamp: new Date().toISOString()
  };

  const payload = { 
    content: "@everyone 🚀 **Major updates have arrived!** Check out our new models and speed improvements.",
    embeds: [embed] 
  };

  // Try Bot Token first if available
  if (BOT_TOKEN) {
    console.log('Attempting to send via Bot Token...');
    const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('Announcement pushed successfully via Bot Token');
        fs.writeFileSync(LOCK_FILE, new Date().toISOString());
        return;
      } else {
        const errorData = await response.json();
        console.error('Bot Token failed:', errorData);
      }
    } catch (error: any) {
      console.error('Bot Token error:', error.message);
    }
  }

  // Fallback to Webhook if Bot Token fails
  if (WEBHOOK_URL) {
    console.log('Attempting to send via Webhook fallback...');
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('Announcement pushed successfully via Webhook');
        fs.writeFileSync(LOCK_FILE, new Date().toISOString());
      } else {
        const errorData = await response.json();
        console.error('Webhook failed:', errorData);
      }
    } catch (error: any) {
      console.error('Webhook error:', error.message);
    }
  } else {
    console.error('No Bot Token or Webhook URL available');
  }
}

sendAnnouncement();
