import { LogtoNextConfig } from '@logto/next';

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_APP_URL || 
           (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  // Remove any trailing slashes to avoid double-slashes in redirect URIs
  // and ensure cookie path consistency
  return url.replace(/\/$/, '');
};

export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT!,
  appId: process.env.LOGTO_APP_ID!,
  appSecret: process.env.LOGTO_APP_SECRET!,
  baseUrl: getBaseUrl(),
  cookieSecret: process.env.LOGTO_COOKIE_SECRET!,
  // In production (Vercel/Cloudflare), always use secure cookies.
  // If testing locally via http://localhost:3000, cookieSecure will be false.
  cookieSecure: process.env.NODE_ENV === 'production' && !getBaseUrl().includes('localhost'),
  scopes: ['email', 'profile', 'openid', 'offline_access'],
  signInRedirectUri: `${getBaseUrl()}/api/logto/sign-in-callback`,
  signOutRedirectUri: getBaseUrl(),
};
