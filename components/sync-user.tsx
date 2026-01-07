'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { syncUser } from '@/lib/admin-actions';

export function SyncUser() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.emailAddresses[0]?.emailAddress;
      if (email) {
        // We use a server action to sync the user profile
        syncUser(user.id, email).catch(err => {
          console.error('Failed to sync user profile:', err);
        });
      }
    }
  }, [isLoaded, user]);

  return null;
}
