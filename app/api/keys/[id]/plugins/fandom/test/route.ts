import { getCurrentUserId } from '@/lib/kinde-auth';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { runFandomPlugin } from '@/lib/plugins';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    const { id: keyId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('user_id, fandom_settings')
      .eq('id', keyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (keyError || !keyData) {
      return NextResponse.json({ error: 'API key not found or unauthorized' }, { status: 404 });
    }

    const body = await request.json();
    const query: string = (body.query || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    // Normalize settings the same way validateApiKey() does so the test
    // reflects exactly what happens during real chat requests.
    const rawSettings = keyData.fandom_settings || {};
    const normalizedSettings = {
      maxLoreTokens: rawSettings.maxLoreTokens ?? 800,
      autoSummarize: rawSettings.autoSummarize ?? true,
      cacheMode: rawSettings.cacheMode ?? 'aggressive',
      preferredSources: rawSettings.preferredSources ?? ['fandom', 'wikipedia'],
      wikiBaseUrl: rawSettings.wikiBaseUrl ?? undefined,
      plugins: {
        memory: { enabled: Boolean(rawSettings?.plugins?.memory?.enabled) },
        search: { enabled: Boolean(rawSettings?.plugins?.search?.enabled) },
      },
    };

    const testMessages = [{ role: 'user', content: query }];
    const resultMessages = await runFandomPlugin(
      testMessages,
      normalizedSettings,
      keyId,
      'test'
    );

    const originalSet = new Set(testMessages.map(m => m.content));
    const newMessages = resultMessages.filter((m: any) => !originalSet.has(m.content));
    const lore = newMessages
      .map((m: any) => m.content.replace('[Lore/Wiki Context]\n', '').replace(/\n\nUse this information.*$/, '').trim())
      .join('\n')
      .trim() || 'No lore found for this query.';

    return NextResponse.json({ lore, entities: [] });
  } catch (err: any) {
    console.error('[POST Fandom Test] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
