import { NextResponse } from 'next/server';
import { PROVIDER_URLS } from '@/lib/providers';
import { getPollinationsApiKey, getPoeApiKey, getLizApiKey, getKivestApiKey } from '@/lib/utils';

// Cache status for 1 minute to avoid hammering providers
let statusCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 15 * 1000; // 15 seconds for more "live" feeling

async function checkProviderStatus(name: string, url: string, apiKey?: string) {
  const start = Date.now();
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Vetra-Status-Monitor/1.0',
      'Accept': 'application/json'
    };
    
    if (apiKey) {
      if (name === 'poe' || name === 'kivest' || name === 'liz') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (name === 'pollinations') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    
    // Some providers might return 401/403 if the models list is protected but the service is UP
    // We treat 200, 401, 403 as "online" (the service is responding)
    const isOnline = response.ok || response.status === 401 || response.status === 403;
    
    return {
      status: isOnline ? 'online' : 'down',
      latency,
      statusCode: response.status,
      lastChecked: new Date().toISOString()
    };
  } catch (err) {
    return {
      status: 'down',
      latency: Date.now() - start,
      error: err instanceof Error ? err.name : 'Unknown'
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
    { name: 'kivest', url: `${PROVIDER_URLS.kivest}/models`, apiKey: getKivestApiKey() },
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
