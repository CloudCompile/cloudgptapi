import { NextResponse } from 'next/server';
import { PROVIDER_URLS } from '@/lib/chat-utils';
import { getPollinationsApiKey, getOpenRouterApiKey, getPoeApiKey, getLizApiKey } from '@/lib/utils';

// Cache status for 1 minute to avoid hammering providers
let statusCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 1000; // 1 minute

async function checkProviderStatus(name: string, url: string, apiKey?: string) {
  const start = Date.now();
  try {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Use a lightweight GET request to check if provider is up
    // Most providers have a /v1/models or similar endpoint that doesn't cost tokens
    const response = await fetch(url, {
      method: 'GET',
      headers,
      next: { revalidate: 30 } // Cache for 30 seconds at Next.js level
    });

    const latency = Date.now() - start;
    
    return {
      status: response.ok ? 'online' : 'offline',
      latency,
      statusCode: response.status
    };
  } catch (err) {
    return {
      status: 'offline',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

export async function GET() {
  if (statusCache && Date.now() - statusCache.timestamp < CACHE_DURATION) {
    return NextResponse.json(statusCache.data);
  }

  const providers = [
    { name: 'pollinations', url: `${PROVIDER_URLS.pollinations}/v1/models`, apiKey: getPollinationsApiKey() },
    { name: 'openrouter', url: `https://openrouter.ai/api/v1/models` }, // OpenRouter doesn't need key for models list
    { name: 'poe', url: `${PROVIDER_URLS.poe}/models`, apiKey: getPoeApiKey() },
    { name: 'github', url: `https://models.inference.ai.azure.com/models` },
    { name: 'liz', url: `${PROVIDER_URLS.liz}/v1/models`, apiKey: getLizApiKey() },
  ];

  const results = await Promise.all(
    providers.map(async (p) => {
      const check = await checkProviderStatus(p.name, p.url, p.apiKey);
      return { name: p.name, ...check };
    })
  );

  const statusMap = results.reduce((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {} as any);

  statusCache = {
    data: statusMap,
    timestamp: Date.now()
  };

  return NextResponse.json(statusMap);
}
