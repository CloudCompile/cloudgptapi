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
      const name = user.name || '';
      const avatar = user.picture || '';
      
      if (email) {
        try {
          await syncUser(userId, email, username, name, avatar);
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      }
    }
  } catch (err) {
    // During build/prerendering, this is expected to fail
    // Silently ignore - authentication will be handled at runtime
  }

  return null;
}
