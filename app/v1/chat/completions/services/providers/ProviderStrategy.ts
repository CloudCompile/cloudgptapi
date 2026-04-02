import { NextRequest, NextResponse } from 'next/server';
import { ApiKey } from '@/lib/api-keys';

export interface DispatchOptions {
  request: NextRequest;
  body: any;
  processedMessages: any[];
  modelId: string;
  model: any;
  requestId: string;
  userId: string;
  characterId: string;
  apiKeyInfo: ApiKey | null;
  effectiveKey: string;
  limit: number;
  dailyLimit: number;
  isSystemRequest: boolean;
  lastMessage: string;
}

export interface ProviderStrategy {
  // Returns true if this strategy should handle the request
  supports(model: any): boolean;
  
  // Handles the entire interaction with the provider
  handle(options: DispatchOptions): Promise<NextResponse>;
}