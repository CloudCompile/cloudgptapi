import { PROVIDER_URLS } from './providers';

export interface MemoryResult {
  context: string;
}

const APP_ID = 'Vetra';

/**
 * Retrieves relevant long-term memory context for a given query and user.
 * Powered by PolliStack Agent Engine.
 */
export async function retrieveMemory(query: string, userId: string, characterId?: string): Promise<string> {
  try {
    const polliKey = process.env.MERIDIAN_API_KEY;
    if (!polliKey) return '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': polliKey,
      'x-user-id': userId,
    };

    if (characterId) {
      headers['x-character-id'] = characterId;
    }

    const response = await fetch(`${PROVIDER_URLS.meridian}/retrieve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        query,
        app_id: APP_ID,
        character_id: characterId
      }),
    });

    if (!response.ok) return '';
    
    const data = await response.json();
    const context = data.context || '';
    
    // Auto-truncate memory to prevent context bloat and response truncation in frontends
    // Target: ~2000 characters (~512 tokens)
    return truncateMemory(context, 2000);
  } catch (error) {
    console.error('[PolliStack] Error retrieving memory:', error);
    return '';
  }
}

/**
 * Truncates memory context to a specific character limit to prevent context bloat.
 */
export function truncateMemory(context: string, limit: number = 2000): string {
  if (!context || context.length <= limit) return context;
  
  // Try to find a clean break point (last newline or period)
  const truncated = context.substring(0, limit);
  const lastNewline = truncated.lastIndexOf('\n');
  const lastPeriod = truncated.lastIndexOf('. ');
  
  const breakPoint = Math.max(lastNewline, lastPeriod);
  
  if (breakPoint > limit * 0.7) {
    return truncated.substring(0, breakPoint) + '... [Truncated for brevity]';
  }
  
  return truncated + '... [Truncated for brevity]';
}

/**
 * Stores a new interaction in the long-term memory.
 * Powered by PolliStack Agent Engine.
 */
export async function rememberInteraction(prompt: string, response: string, userId: string, characterId?: string): Promise<void> {
  try {
    const polliKey = process.env.MERIDIAN_API_KEY;
    if (!polliKey) return;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': polliKey,
      'x-user-id': userId,
    };

    if (characterId) {
      headers['x-character-id'] = characterId;
    }

    await fetch(`${PROVIDER_URLS.meridian}/remember`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        response,
        app_id: APP_ID,
        character_id: characterId
      }),
    });
  } catch (error) {
    console.error('[PolliStack] Error storing memory:', error);
  }
}

