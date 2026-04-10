import { supabaseAdmin } from './supabase';

const MAX_STORED = 50;  // max rows kept per (user_id, character_id) pair
const RETRIEVE_LIMIT = 10; // interactions surfaced per request

/**
 * Retrieves the most recent interaction history for a user/character pair
 * and formats it as a context string to inject into the prompt.
 *
 * The query parameter is accepted for API compatibility but not used for
 * semantic search — retrieval is recency-based.
 */
export async function retrieveMemory(query: string, userId: string, characterId?: string): Promise<string> {
  try {
    if (!userId) return '';

    let q = supabaseAdmin
      .from('memory_logs')
      .select('prompt, response')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(RETRIEVE_LIMIT);

    if (characterId) {
      q = q.eq('character_id', characterId);
    } else {
      q = q.is('character_id', null);
    }

    const { data, error } = await q;

    if (error || !data || data.length === 0) return '';

    // Reverse so the oldest interaction comes first (natural reading order)
    const lines = [...data].reverse().map(row =>
      `User: ${row.prompt}\nAssistant: ${row.response}`
    ).join('\n\n');

    const context = `[Past Interactions]:\n${lines}`;
    return truncateMemory(context, 2000);
  } catch (error) {
    console.error('[Memory] Error retrieving memory:', error);
    return '';
  }
}

/**
 * Truncates memory context to a character limit, breaking at a clean line or sentence.
 */
export function truncateMemory(context: string, limit: number = 2000): string {
  if (!context || context.length <= limit) return context;

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
 * Stores an interaction in memory_logs, then prunes the table to MAX_STORED rows
 * for this user/character pair. Called fire-and-forget after each response.
 */
export async function rememberInteraction(
  prompt: string,
  response: string,
  userId: string,
  characterId?: string
): Promise<void> {
  try {
    if (!userId) return;

    const { error } = await supabaseAdmin
      .from('memory_logs')
      .insert({
        user_id: userId,
        character_id: characterId || null,
        prompt: prompt.slice(0, 2000),
        response: response.slice(0, 4000),
      });

    if (error) {
      console.error('[Memory] Error storing interaction:', error);
      return;
    }

    // Prune old rows via the SQL function defined in SUPABASE_SETUP.sql
    await supabaseAdmin.rpc('prune_memory_logs', {
      p_user_id: userId,
      p_character_id: characterId || null,
      p_max_count: MAX_STORED,
    });
  } catch (error) {
    console.error('[Memory] Error storing interaction:', error);
  }
}
