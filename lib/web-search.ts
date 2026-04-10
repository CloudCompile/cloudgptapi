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

// Domains that appear in Brave's navigation, ads, or infrastructure — not real results.
const BRAVE_NON_RESULT_DOMAINS = new Set([
  'search.brave.com', 'brave.com', 'account.brave.com',
  'basicattentiontoken.org', 'bat.community',
  'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'youtube.com',
]);

function parseBraveResults(html: string, maxResults = 5): Array<{ title: string; url: string }> {
  // Brave wraps organic results inside data-type="web" containers.
  // Use a narrower pattern to avoid picking up nav/footer/ad anchors.
  const resultSectionMatch = html.match(/id=["']results["'][^>]*>([\s\S]*?)(?:<\/main>|<footer)/i);
  const searchArea = resultSectionMatch ? resultSectionMatch[1] : html;

  const results: Array<{ title: string; url: string }> = [];
  const anchorRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(searchArea)) && results.length < maxResults) {
    const href = decodeHtmlEntities(match[1] || '');
    const text = decodeHtmlEntities(stripHtml(match[2] || ''));
    const url = absoluteUrl(href);
    if (!url) continue;
    if (!text || text.length < 10) continue;

    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      if (BRAVE_NON_RESULT_DOMAINS.has(hostname)) continue;
    } catch { continue; }

    if (seen.has(url)) continue;
    seen.add(url);
    results.push({ title: text.slice(0, 140), url });
  }

  if (results.length === 0) {
    console.warn('[WebSearch] parseBraveResults found 0 results — Brave HTML structure may have changed');
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

    const lines = await Promise.all(
      hits.map(async (hit, index) => {
        const snippet = await fetchPageSnippet(hit.url, 420);
        return `${index + 1}. ${hit.title}\nURL: ${hit.url}\nSnippet: ${snippet || 'Snippet unavailable.'}`;
      })
    );

    return lines.join('\n\n');
  } catch (error) {
    console.warn('[WebSearch] Failed to run search:', error);
    return '';
  }
}
