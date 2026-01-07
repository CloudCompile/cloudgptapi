import { PROVIDER_URLS } from './providers';

export interface MemoryResult {
  context: string;
}

const APP_ID = 'CloudGPT';

/**
 * Retrieves relevant long-term memory context for a given query and user.
 * Powered by PolliStack Agent Engine.
 */
export async function retrieveMemory(query: string, userId: string): Promise<string> {
  try {
    const polliKey = process.env.MERIDIAN_API_KEY;
    if (!polliKey) return '';

    const response = await fetch(`${PROVIDER_URLS.meridian}/retrieve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': polliKey,
        'x-user-id': userId,
      },
      body: JSON.stringify({ 
        query,
        app_id: APP_ID
      }),
    });

    if (!response.ok) return '';
    
    const data = await response.json();
    return data.context || '';
  } catch (error) {
    console.error('[PolliStack] Error retrieving memory:', error);
    return '';
  }
}

/**
 * Stores a new interaction in the long-term memory.
 * Powered by PolliStack Agent Engine.
 */
export async function rememberInteraction(prompt: string, response: string, userId: string): Promise<void> {
  try {
    const polliKey = process.env.MERIDIAN_API_KEY;
    if (!polliKey) return;

    await fetch(`${PROVIDER_URLS.meridian}/remember`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': polliKey,
        'x-user-id': userId,
      },
      body: JSON.stringify({
        prompt,
        response,
        app_id: APP_ID
      }),
    });
  } catch (error) {
    console.error('[PolliStack] Error storing memory:', error);
  }
}

