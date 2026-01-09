import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables if needed
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CONTEST_WEBHOOK = 'https://discord.com/api/webhooks/1458950950625607701/RVRvEvPPbZJnPpndZEVaFfsvvQy1GZ3mHcd0Pj2OOyY-asCdihCio0pYV35kzC-tqC5c';
const FORUM_CHANNEL_ID = '1458951237461610528';

async function sendForumLink() {
  // Constructing a special link that Discord often renders with a "Open Link" style or clear navigation
  const message = `**Ready to submit your project?**\n\nClick here to access the submission forum: <https://discord.com/channels/1325176161839550505/${FORUM_CHANNEL_ID}>`;

  try {
    const response = await fetch(CONTEST_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        // Using components to try and send a button-like experience if the webhook allows it
        // Note: Standard webhooks usually ignore 'components' unless it's a specific interaction response,
        // but we'll include the raw link as the primary method.
      }),
    });

    if (response.ok) {
      console.log('Forum access message sent successfully!');
    } else {
      const errorData = await response.json();
      console.error('Failed to send forum access message:', errorData);
    }
  } catch (error: any) {
    console.error('Error sending forum access message:', error.message);
  }
}

sendForumLink();
