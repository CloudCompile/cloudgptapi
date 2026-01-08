
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1458666010197495962';

async function sendAnnouncement() {
  const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;
  
  const embed = {
    title: '⚡ CloudGPT API Optimization Update',
    description: 'We have successfully deployed a major update to our proxy routing system, significantly reducing latency across flagship models.',
    color: 0x00ffcc, // Cyan/Aqua
    fields: [
      {
        name: '🚀 Performance Gains',
        value: '• **GPT-4o:** 1088ms → **327ms** (70% Faster)\n• **Gemini & DeepSeek:** Optimized routing with fast-path fallbacks.\n• **New Path:** Prioritizing ultra-low latency providers.',
        inline: false
      },
      {
        name: '🛠️ Technical Improvements',
        value: '• Implemented **High-Speed Path** for core models.\n• Improved **Model Aliasing** for better compatibility.\n• Smart fallback logic for 99.9% reliability.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT API • Powered by Gemini 3 Flash Preview',
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
      console.log('✅ Announcement pushed successfully!');
      console.log('Message ID:', data.id);
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to push announcement:', errorData);
    }
  } catch (error: any) {
    console.error('❌ Error sending announcement:', error.message);
  }
}

sendAnnouncement();
