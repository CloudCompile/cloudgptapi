const BRAVE_SEARCH_URL = 'https://search.brave.com/search';
const DEFAULT_TIMEOUT_MS = 8000;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function absoluteUrl(href: string): string | null {
  try {
    const url = new URL(href);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VetraBot/1.0; +https://vetraai.vercel.app)',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(id);
  }
}

function parseBraveResults(html: string, maxResults = 5): Array<{ title: string; url: string }> {
  const results: Array<{ title: string; url: string }> = [];
  const anchorRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) && results.length < maxResults) {
    const href = decodeHtmlEntities(match[1] || '');
    const text = decodeHtmlEntities(stripHtml(match[2] || ''));
    const url = absoluteUrl(href);
    if (!url) continue;
    if (!text || text.length < 8) continue;
    if (url.includes('search.brave.com')) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    results.push({ title: text.slice(0, 140), url });
  }

  return results;
}

async function fetchPageSnippet(url: string, maxChars = 500): Promise<string> {
  try {
    const html = await fetchWithTimeout(url, 6000);
    const text = stripHtml(html);
    return text.slice(0, maxChars);
  } catch {
    return '';
  }
}

export async function runWebSearch(query: string, maxResults = 3): Promise<string> {
  const trimmed = (query || '').trim();
  if (!trimmed) return '';

  try {
    const searchHtml = await fetchWithTimeout(`${BRAVE_SEARCH_URL}?q=${encodeURIComponent(trimmed)}&source=web`);
    const hits = parseBraveResults(searchHtml, maxResults);
    if (!hits.length) return '';

    const lines: string[] = [];
    for (const [index, hit] of hits.entries()) {
      const snippet = await fetchPageSnippet(hit.url, 420);
      lines.push(
        `${index + 1}. ${hit.title}\nURL: ${hit.url}\nSnippet: ${snippet || 'Snippet unavailable.'}`
      );
    }

    return lines.join('\n\n');
  } catch (error) {
    console.warn('[WebSearch] Failed to run search:', error);
    return '';
  }
}
