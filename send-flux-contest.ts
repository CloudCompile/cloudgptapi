import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables if needed
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CONTEST_WEBHOOK = 'https://discord.com/api/webhooks/1458950950625607701/RVRvEvPPbZJnPpndZEVaFfsvvQy1GZ3mHcd0Pj2OOyY-asCdihCio0pYV35kzC-tqC5c';

async function sendFluxContestAnnouncement() {
  const embed = {
    title: '🎨 Flux Image Generation Contest: Remix & Mutate!',
    description: "Time to abuse pixels responsibly. We’re hosting an Image Generation Contest using the world-class **Flux** model. Show us your prompt engineering prowess!",
    color: 0xec4899, // Pink color for creative/image vibes
    fields: [
      {
        name: '🖼️ The Challenge',
        value: 'You’ll be given a starter prompt. Your job is to twist, remix, and mutate it into the best image you can generate using Flux on CloudGPT. Make Flux do something it probably regrets.',
        inline: false
      },
      {
        name: '🏆 The Prize',
        value: '**1 Month of CloudGPT Pro** for the winner!',
        inline: false
      },
      {
        name: '⏳ Duration',
        value: 'The contest runs for **1 week** from the moment the starter prompt is dropped.',
        inline: false
      },
      {
        name: '📌 Judging Criteria',
        value: '• **Creativity and Originality**: Stand out from the noise.\n• **Prompt Engineering Skill**: Show off your technical control.\n• **Visual Quality**: The final aesthetic impact.\n• **Prompt Twisting**: How cleverly you remixed the base prompt.',
        inline: false
      },
      {
        name: '📢 Stay Tuned',
        value: 'Starter prompt and submission rules are dropping soon. Get your prompts ready.',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT Flux Contest — The Art of the Prompt',
      icon_url: 'https://raw.githubusercontent.com/lucide-software/lucide/main/icons/image.png'
    },
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(CONTEST_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: "@everyone 🎨 **New Contest Alert: The Flux Image Generation Challenge!**",
        embeds: [embed]
      }),
    });

    if (response.ok) {
      console.log('Flux contest announcement sent successfully!');
    } else {
      const errorData = await response.json();
      console.error('Failed to send Flux contest announcement:', errorData);
    }
  } catch (error: any) {
    console.error('Error sending Flux contest announcement:', error.message);
  }
}

sendFluxContestAnnouncement();
