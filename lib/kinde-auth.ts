'use server';

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest } from 'next/server';

export async function getCurrentUserId(req?: NextRequest): Promise<string | null> {
  try {
    const session = req ? getKindeServerSession(req as any) : getKindeServerSession();
    const { isAuthenticated, getUser } = session;
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

export async function requireAuth(req?: NextRequest): Promise<string> {
  const userId = await getCurrentUserId(req);
  if (!userId) {
    throw new Error('Authentication required: No valid user session found');
  }
  return userId;
}

export async function getCurrentUser(req?: NextRequest) {
  try {
    const session = req ? getKindeServerSession(req as any) : getKindeServerSession();
    const { isAuthenticated, getUser } = session;
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
rt async function getAccessToken(): Promise<string | null> {
  try {
    const { getAccessTokenRaw } = getKindeServerSession();
    const token = await getAccessTokenRaw();
    return token || null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = getKindeServerSession();
    const isAuth = await session.isAuthenticated();
    return Boolean(isAuth);
  } catch (error) {
    return false;
  }
}
