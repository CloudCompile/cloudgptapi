import { supabaseAdmin } from './supabase';

export interface FandomSettings {
  maxLoreTokens: number;
  autoSummarize: boolean;
  cacheMode: string;
  preferredSources: string[];
  wikiBaseUrl?: string;
}

export function isFandomPluginConfigured(): boolean {
  return true;
}

const STOP_WORDS = new Set([
  'I', 'A', 'An', 'The', 'In', 'On', 'At', 'To', 'For', 'Of', 'And', 'Or',
  'But', 'Is', 'Are', 'Was', 'Were', 'Be', 'Been', 'Being', 'Have', 'Has',
  'Had', 'Do', 'Does', 'Did', 'Will', 'Would', 'Could', 'Should', 'May',
  'Might', 'Must', 'Can', 'This', 'That', 'These', 'Those', 'My', 'Your',
  'His', 'Her', 'Its', 'Our', 'Their', 'What', 'When', 'Where', 'Who',
  'Which', 'How', 'Why', 'If', 'Then', 'So', 'Not', 'No', 'Yes', 'Just',
  'Tell', 'Me', 'About', 'Please', 'You', 'He', 'She', 'We', 'They',
  'Now', 'Here', 'There', 'Oh', 'Ok', 'Hi', 'Hey', 'User', 'Assistant',
  'System', 'Let', 'Get', 'Go', 'Come', 'Say', 'Know', 'Think', 'See',
  'Look', 'Want', 'Give', 'Use', 'Find', 'Make', 'Take',
]);

function extractEntities(text: string): string[] {
  const pattern = /\b([A-Z][a-zA-Z]{1,}(?:\s+[A-Z][a-zA-Z]{1,}){0,2})\b/g;
  const seen = new Set<string>();
  const candidates: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const entity = match[1].trim();
    if (entity.split(' ').some(w => STOP_WORDS.has(w))) continue;
    if (!seen.has(entity)) {
      seen.add(entity);
      candidates.push(entity);
    }
  }

  candidates.sort((a, b) => b.length - a.length);
  const result: string[] = [];
  for (const entity of candidates) {
    if (result.some(r => r.toLowerCase().includes(entity.toLowerCase()))) continue;
    result.push(entity);
    if (result.length >= 5) break;
  }

  return result;
}

async function fetchFandomLore(entity: string, wikiBaseUrl: string): Promise<string> {
  try {
    const parsed = new URL(wikiBaseUrl.startsWith('http') ? wikiBaseUrl : `https://${wikiBaseUrl}`);
    const apiBase = `${parsed.protocol}//${parsed.hostname}/api.php`;

    const searchRes = await fetch(
      `${apiBase}?action=opensearch&search=${encodeURIComponent(entity)}&limit=1&format=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!searchRes.ok) return '';

    const [, titles] = (await searchRes.json()) as [string, string[]];
    if (!titles?.length) return '';

    const extractRes = await fetch(
      `${apiBase}?action=query&prop=extracts&exintro=true&exsentences=5&explaintext=true` +
      `&titles=${encodeURIComponent(titles[0])}&format=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!extractRes.ok) return '';

    const extractData = await extractRes.json();
    const pages = Object.values(extractData?.query?.pages ?? {}) as any[];
    const page = pages[0];

    if (!page || page.missing !== undefined || !page.extract?.trim()) return '';
    return `${titles[0]}: ${page.extract.trim().substring(0, 600)}`;
  } catch {
    return '';
  }
}

async function fetchWikipediaLore(entity: string): Promise<string> {
  try {
    const slug = encodeURIComponent(entity.replace(/ /g, '_'));
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return '';

    const data = await res.json();
    if (data.type === 'disambiguation' || !data.extract?.trim()) return '';
    return `${data.title}: ${data.extract.trim().substring(0, 600)}`;
  } catch {
    return '';
  }
}

async function getMatchingSnippets(text: string, apiKeyId: string): Promise<string[]> {
  try {
    const { data } = await supabaseAdmin
      .from('lore_snippets')
      .select('title, content')
      .eq('api_key_id', apiKeyId);

    if (!data?.length) return [];

    const lowerText = text.toLowerCase();
    return data
      .filter(s => lowerText.includes(s.title.toLowerCase()))
      .map(s => `${s.title}: ${s.content}`);
  } catch {
    return [];
  }
}

export async function runFandomPlugin(
  messages: any[],
  settings: FandomSettings,
  apiKeyId?: string,
  modelId?: string
): Promise<any[]> {
  try {
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
    const query: string = typeof lastUserMsg?.content === 'string' ? lastUserMsg.content : '';
    if (!query.trim()) return messages;

    const maxChars = (settings?.maxLoreTokens ?? 800) * 4;
    const wikiBaseUrl = (settings as any)?.wikiBaseUrl || 'https://community.fandom.com/wiki/';
    const isGenericWiki = wikiBaseUrl.includes('community.fandom.com');
    const loreLines: string[] = [];

    if (apiKeyId) {
      const snippetMatches = await getMatchingSnippets(query, apiKeyId);
      loreLines.push(...snippetMatches);
    }

    const entities = extractEntities(query);
    const coveredLower = loreLines.map(l => l.split(':')[0].toLowerCase());

    for (const entity of entities) {
      if (loreLines.length >= 5) break;
      if (coveredLower.some(t => t.includes(entity.toLowerCase()))) continue;

      let lore = '';
      if (!isGenericWiki) {
        lore = await fetchFandomLore(entity, wikiBaseUrl);
      }
      if (!lore) {
        lore = await fetchWikipediaLore(entity);
      }

      if (lore) {
        loreLines.push(lore);
        coveredLower.push(entity.toLowerCase());
      }
    }

    if (!loreLines.length) return messages;

    let combined = loreLines.join('\n\n');
    if (combined.length > maxChars) {
      combined = combined.substring(0, maxChars) + '... [Lore truncated]';
    }

    const loreMessage = {
      role: 'system',
      content: `[Lore/Wiki Context]\n${combined}\n\nUse this information naturally if relevant to the conversation.`,
    };

    console.log(`[FandomPlugin] Injecting lore for ${loreLines.length} source(s). Key: ${apiKeyId ?? 'unknown'}`);
    return [loreMessage, ...messages];
  } catch (err) {
    console.error('[FandomPlugin] Error:', err);
    return messages;
  }
}
