import { supabaseAdmin } from './supabase';

export type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

export async function logErrorToSupabase(
  level: LogLevel,
  message: string,
  path?: string,
  userId?: string
): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('error_logs').insert({
      level,
      message,
      path: path ? path.substring(0, 255) : null,
      user_id: userId || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Failed to log to error_logs table (it might not exist yet):', error.message);
    }
  } catch (err) {
    console.warn('Exception while logging to error_logs table:', err);
  }
}
