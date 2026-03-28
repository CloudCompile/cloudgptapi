'use server';

import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
  [key: string]: any;
}

/**
 * Get the current user ID from Kinde authentication (via JWT stored in cookies)
 * @returns The user ID if authenticated, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('kinde_access_token')?.value;

    if (!accessToken) {
      return null;
    }

    const decoded = jwtDecode<DecodedToken>(accessToken);
    return decoded.sub || null;
  } catch (error: any) {
    // Only log errors in development or if not a dynamic server error
    if (error?.message?.includes('Dynamic server') || error?.message?.includes('cookies')) {
      // Silently handle static generation attempts
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
 * Get the current user information from the access token
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('kinde_access_token')?.value;

    if (!accessToken) {
      return null;
    }

    const decoded = jwtDecode<DecodedToken>(accessToken);
    return {
      id: decoded.sub,
      email: decoded.email,
      given_name: decoded.given_name,
      family_name: decoded.family_name,
      picture: decoded.picture,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Get the access token from cookies
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('kinde_access_token')?.value || null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

/**
 * Verify that a token is still valid
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('kinde_access_token')?.value;

    if (!accessToken) {
      return false;
    }

    const decoded = jwtDecode<DecodedToken>(accessToken);
    const now = Math.floor(Date.now() / 1000);

    // Check if token is expired
    if (decoded.exp && decoded.exp < now) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}
