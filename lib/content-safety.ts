/**
 * Content safety utilities for Vetra API.
 *
 * Provides two layers of protection:
 *  1. CSAM detection  – blocks any content involving sexual material related to minors.
 *     Applied on every chat request before any provider dispatch.
 *  2. NSFW detection  – blocks explicit adult content before routing to providers
 *     (like Aqua) that enforce their own content policies.
 *
 * Detection is keyword/pattern-based (no external dependency required).
 * All patterns are compiled once at module load for efficiency.
 */

export interface ContentSafetyResult {
  flagged: boolean;
  category: 'csam' | 'nsfw' | null;
  reason: string | null;
}

// ---------------------------------------------------------------------------
// CSAM detection
// ---------------------------------------------------------------------------

/**
 * Unambiguous CSAM terms that are never acceptable in any context.
 * Compiled once; uses word-boundaries to avoid partial-word matches.
 */
const CSAM_DIRECT = /\b(csam|childporn|child[-\s]porn|pedo(?:phile|philia|sexual)?|paedo(?:phile|philia|sexual)?|child\s+sexual\s+abuse\s+material|lolicon|shotacon)\b/i;

/**
 * Terms that describe minors (used together with SEXUAL_TERMS to flag content).
 */
const MINOR_TERMS = /\b(child(?:ren)?|minor|underage|prepubescent|preteen|pre[-\s]teen|shota|loli(?:ta)?|toddler|infant)\b/i;

/**
 * Sexual / explicit terms that, when combined with MINOR_TERMS, indicate CSAM.
 */
const SEXUAL_TERMS = /\b(sex(?:ual(?:ly)?)?|porn(?:ography|ographic)?|nude|naked|erotic|lewd|hentai|masturbat(?:e|ion|ing)?|orgasm|intercourse)\b/i;

// ---------------------------------------------------------------------------
// NSFW detection (Aqua and similar providers that block adult content)
// ---------------------------------------------------------------------------

/**
 * Explicit adult-content patterns used when routing to providers that
 * enforce NSFW restrictions (e.g. Aqua).
 *
 * Deliberately conservative to minimise false positives – only flag
 * requests that are unambiguously asking for explicit sexual content.
 */
const NSFW_EXPLICIT = /\b(porn(?:ography|ographic)?|hentai|explicit\s+sex(?:ual)?\s+(?:content|story|scene|roleplay)|erotic\s+(?:story|fiction|roleplay|rp)|write\s+(?:a\s+)?(?:erotic|porn|sexual|lewd|nsfw)\s+(?:story|fiction|scene)|generate\s+(?:erotic|porn|sexual)\s+(?:content|image|picture))\b/i;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts plain text from a message content value that may be a string,
 * an array of content parts (OpenAI multimodal format), or something else.
 */
function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part: unknown) => {
        if (typeof part === 'string') return part;
        if (part !== null && typeof part === 'object' && 'text' in part && typeof (part as any).text === 'string') {
          return (part as any).text;
        }
        return '';
      })
      .join(' ');
  }
  return '';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Scans all messages for CSAM content.
 *
 * Flags when:
 *   a) An unambiguous CSAM term is present (CSAM_DIRECT), OR
 *   b) A minor-descriptive term co-occurs with a sexual term in the same message.
 *
 * Only message content is scanned; role labels are ignored.
 */
export function scanForCSAM(messages: unknown[]): ContentSafetyResult {
  if (!Array.isArray(messages)) return { flagged: false, category: null, reason: null };

  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') continue;
    const text = extractText((msg as any).content);
    if (!text) continue;

    if (CSAM_DIRECT.test(text)) {
      return {
        flagged: true,
        category: 'csam',
        reason: 'Content involves sexual material related to minors.',
      };
    }

    if (MINOR_TERMS.test(text) && SEXUAL_TERMS.test(text)) {
      return {
        flagged: true,
        category: 'csam',
        reason: 'Content involves sexual material related to minors.',
      };
    }
  }

  return { flagged: false, category: null, reason: null };
}

/**
 * Scans user messages for explicit adult content.
 *
 * System messages are excluded because they may legitimately describe
 * moderation instructions or content restrictions.
 *
 * Used before routing to providers that do not allow adult content.
 */
export function scanForNSFW(messages: unknown[]): ContentSafetyResult {
  if (!Array.isArray(messages)) return { flagged: false, category: null, reason: null };

  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') continue;
    if ((msg as any).role === 'system') continue; // skip injected system context

    const text = extractText((msg as any).content);
    if (!text) continue;

    if (NSFW_EXPLICIT.test(text)) {
      return {
        flagged: true,
        category: 'nsfw',
        reason: 'This provider does not support explicit adult content.',
      };
    }
  }

  return { flagged: false, category: null, reason: null };
}
