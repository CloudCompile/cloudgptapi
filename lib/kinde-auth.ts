import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest } from 'next/server';

export async function getCurrentUserId(req?: NextRequest): Promise<string | null> {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const isAuth = await isAuthenticated();
  if (!isAuth) return null;
  const user = await getUser();
  return user?.id || null;
}

export async function requireAuth(req?: NextRequest): Promise<string> {
  const userId = await getCurrentUserId(req);
  if (!userId) {
    throw new Error('Authentication required: No valid user session found');
  }
  return userId;
}

export async function getCurrentUser(req?: NextRequest) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const isAuth = await isAuthenticated();
  if (!isAuth) return null;
  const user = await getUser();
  return user || null;
}

export async function getAccessToken(): Promise<string | null> {
  const { getAccessTokenRaw } = getKindeServerSession();
  const token = await getAccessTokenRaw();
  return token || null;
}

export async function isUserAuthenticated(): Promise<boolean> {
  const { isAuthenticated } = getKindeServerSession();
  const isAuth = await isAuthenticated();
  return Boolean(isAuth);
}
