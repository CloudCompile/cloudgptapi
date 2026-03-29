import { getCurrentUserId, getCurrentUser } from '@/lib/kinde-auth';
import { syncUser } from '@/lib/admin-actions';

export async function SyncUser() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    const user = await getCurrentUser();

    if (user) {
      const email = user.email || '';
      const username = user.email?.split('@')[0] || '';
      const name = [user.given_name, user.family_name].filter(Boolean).join(' ') || username;
      const avatar = user.picture || '';

      if (email) {
        try {
          await syncUser(userId, email, username, name || undefined, avatar || undefined);
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      }
    }
  } catch (err) {
  }

  return null;
}
