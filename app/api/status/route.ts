import { NextResponse } from 'next/server';
import { PROVIDER_URLS } from '@/lib/providers';
import {
  getPollinationsApiKey,
  getPoeApiKey,
  getLizApiKey,
  getBluesmindsApiKey,
  getAquaApiKey,
  getGroqApiKey,
  getCerebrasApiKey,
  getBlazeAiApiKey,
} from '@/lib/utils';

interface ProviderStatus {
  status: 'online' | 'down';
  latency: number;
  statusCode?: number;
  lastChecked?: string;
  error?: string;
}

let statusCache: {
  data: Record<string, ProviderStatus>;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 15 * 1000; // 15s — short to keep the status page "live"

async function checkProviderStatus(name: string, url: string, apiKey?: string): Promise<ProviderStatus> {
  const start = Date.now();
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Vetra-Status-Monitor/1.0',
      'Accept': 'application/json'
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
      cache: 'no-store'
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    // 401/403 mean the service is responding (just rejecting our auth) → treat as online.
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
    { name: 'openrouter', url: `${PROVIDER_URLS.openrouter}/api/v1/models` },
    { name: 'poe', url: `${PROVIDER_URLS.poe}/models`, apiKey: getPoeApiKey() },
    { name: 'github', url: `${PROVIDER_URLS.github}/models` },
    { name: 'liz', url: `${PROVIDER_URLS.liz}/v1/models`, apiKey: getLizApiKey() },
    { name: 'shalom', url: `${PROVIDER_URLS.shalom}/models`, apiKey: getBluesmindsApiKey() },
    { name: 'bluesminds', url: `${PROVIDER_URLS.bluesminds}/models`, apiKey: getBluesmindsApiKey() },
    { name: 'aqua', url: `${PROVIDER_URLS.aqua}/models`, apiKey: getAquaApiKey() },
    { name: 'groq', url: `${PROVIDER_URLS.groq}/models`, apiKey: getGroqApiKey() },
    { name: 'cerebras', url: `${PROVIDER_URLS.cerebras}/models`, apiKey: getCerebrasApiKey() },
    { name: 'mino', url: `${PROVIDER_URLS.mino}/x/zai/models` },
    { name: 'blazeai', url: `${PROVIDER_URLS.blazeai}/models`, apiKey: getBlazeAiApiKey() },
  ];

  const results = await Promise.all(
    providers.map(async (p) => ({ name: p.name, ...(await checkProviderStatus(p.name, p.url, p.apiKey)) }))
  );

  const statusMap = results.reduce<Record<string, ProviderStatus>>((acc, { name, ...rest }) => {
    acc[name] = rest;
    return acc;
  }, {});

  statusCache = { data: statusMap, timestamp: Date.now() };

  return NextResponse.json(statusMap);
}
