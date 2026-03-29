'use server';

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

/**
 * Get the current user ID from Kinde authentication
 * @returns The user ID if authenticated, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { isAuthenticated, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return null;
    }
    const user = await getUser();
    return user?.id || null;
  } catch (error: any) {
    if (error?.message?.includes('Dynamic server') || error?.message?.includes('cookies')) {
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to get current user ID:', error);
    }
    return null;
  }
}

/**
 * Require authentication and return the user ID
 * @throws Error with descriptive message if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Authentication required: No valid user session found');
  }
  return userId;
}

/**
 * Get the current user information from Kinde
 */
export async function getCurrentUser() {
  try {
    const { isAuthenticated, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return null;
    }
    const user = await getUser();
    return user || null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Get the access token from Kinde
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const { getAccessTokenRaw } = getKindeServerSession();
    const token = await getAccessTokenRaw();
    return token || null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

/**
 * Verify that a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = getKindeServerSession();
    const isAuth = await session.isAuthenticated();
    return Boolean(isAuth);
  } catch (error) {
    return false;
  }
}
