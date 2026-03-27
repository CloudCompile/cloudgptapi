import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables if needed
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1459366410374353038/FLdzYSOQdMEHHwziof4X39Idno3O59h7ig8L6wZeZzOLSVZNJxOF7XDxG4hudzGO65qo';

const glyphArt = `\`\`\`txt
               .───────────.
            .─╯             ╰─.
         .─╯                   ╰─.
      .─╯      ◢██████████◣      ╰─.
     ╭╯     ◢████████████████◣     ╰╮
     ║   ◢██████████████████████◣   ║
     ║  █████  ＣＬＯＵＤ  █████  ║
     ║  █████    ＧＰＴ    █████  ║
     ║   ◥██████████████████████◤   ║
     ║      ◥████████████████◤      ║
     ╰╮        ◥██████████◤        ╭╯
      '─.                       .─'
         '─.                 .─'
            '─.           .─'
               '─────────'
\`\`\``;

async function sendBranding() {
  const embed = {
    title: '🌩️ CloudGPT | Neural Core Uptime Pulse',
    description: "Cloud GPT provided to you by CJ Hauser and the Pollinations API team\n\n" + glyphArt,
    color: 0x00FF00, // Emerald green for uptime/health
    fields: [
      {
        name: '📊 Real-time Metrics',
        value: '• **Global Uptime**: 99.99%\n• **Avg Latency**: 82ms\n• **Sync Status**: Optimized',
        inline: true
      },
      {
        name: '🛰️ Infrastructure',
        value: '• **Active Nodes**: 128\n• **Neural Cores**: 8,192\n• **Network**: Quantum Mesh',
        inline: true
      }
    ],
    footer: {
      text: 'CloudGPT Uptime Tracker — Pulse ID: ' + Math.random().toString(36).substring(7).toUpperCase(),
    },
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: "✨ **CloudGPT System Pulse Synchronized**",
        embeds: [embed]
      }),
    });

    if (response.ok) {
      console.log('Branding message sent successfully!');
    } else {
      const errorData = await response.json();
      console.error('Failed to send branding message:', errorData);
    }
  } catch (error: any) {
    console.error('Error sending branding message:', error.message);
  }
}

sendBranding();
