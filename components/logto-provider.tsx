'use client';

import { LogtoProvider, LogtoConfig } from '@logto/react';
import { ReactNode } from 'react';

const config: LogtoConfig = {
  endpoint: process.env.NEXT_PUBLIC_LOGTO_ENDPOINT!,
  appId: process.env.NEXT_PUBLIC_LOGTO_APP_ID!,
  scopes: ['email', 'profile', 'openid', 'offline_access'],
  signInRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/api/logto/sign-in-callback` : '',
  signOutRedirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
};

export const LogtoClientProvider = ({ children }: { children: ReactNode }) => {
  return <LogtoProvider config={config}>{children}</LogtoProvider>;
};
