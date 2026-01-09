import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables if needed
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CONTEST_WEBHOOK = 'https://discord.com/api/webhooks/1458950950625607701/RVRvEvPPbZJnPpndZEVaFfsvvQy1GZ3mHcd0Pj2OOyY-asCdihCio0pYV35kzC-tqC5c';
const SUBMISSION_WEBHOOK = 'https://discord.com/api/webhooks/1458951284831948959/n6tGMOOVawenwoO_8DEr4ZFv8gmRLbI-Gr5vvLCV6C8goW3wleG3ChvkINizYFp9AQMh';

async function sendContestAnnouncement() {
  const embed = {
    title: '🚀 CloudGPT Developer Contest: Build & Win!',
    description: "We're launching a Developer Contest to see who can build the best project using the CloudGPT API. Whether it's a polished app or a wild experiment, we want to see it!",
    color: 0x10b981, // Emerald color
    fields: [
      {
        name: '🛠️ The Challenge',
        value: 'Create any project you want using the CloudGPT API. Web app, bot, tool, or even a cursed experiment. If it uses our API in a meaningful way, it counts.',
        inline: false
      },
      {
        name: '🏆 The Prize',
        value: '**1 Month of CloudGPT Pro** for the winner!',
        inline: false
      },
      {
        name: '⏳ Duration',
        value: 'The contest runs for **1 week** from today.',
        inline: false
      },
      {
        name: '📌 Judging Criteria',
        value: '• **Creativity**: How unique is your idea?\n• **Technical Execution**: How well is it built?\n• **Integration**: How effectively is CloudGPT used?\n• **Cool Factor**: Overall usefulness or wow-factor.',
        inline: false
      },
      {
        name: '📤 How to Submit',
        value: 'Ready to show off? More rules and submission details will be shared shortly. For now, go break something in a productive way!\n\n*(Submission details for the forum channel will be provided in the follow-up update)*',
        inline: false
      }
    ],
    footer: {
      text: 'CloudGPT Contest — May the best dev win!',
      icon_url: 'https://raw.githubusercontent.com/lucide-software/lucide/main/icons/trophy.png'
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
        content: "@everyone 🛠️ **The CloudGPT Developer Contest is officially OPEN!**",
        embeds: [embed]
      }),
    });

    if (response.ok) {
      console.log('Contest announcement sent successfully!');
    } else {
      const errorData = await response.json();
      console.error('Failed to send contest announcement:', errorData);
    }
  } catch (error: any) {
    console.error('Error sending contest announcement:', error.message);
  }
}

sendContestAnnouncement();
