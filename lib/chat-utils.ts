/**
 * Simple stable hash function (cyrb53) to avoid Node.js 'crypto' dependency issues.
 * This works in both Node.js and Browser/Edge environments.
 */
const hashString = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
};

export const MAX_MESSAGE_LENGTH = 10000000; // 10MB per message (Roleplay friendly)
export const MAX_TOTAL_LENGTH = 50000000; // 50MB total for all messages (Long context RP)
export const MAX_MESSAGES_COUNT = 2000; // More history for roleplayers
export const PROVIDER_TIMEOUT_MS = 300000; // 5 minutes (RP models can be slow)

/**
 * Generate a stable hash for a character based on its metadata.
 * This ensures that the same character always gets the same ID regardless of name changes.
 */
export function generateCharacterId(metadata: any): string {
  if (!metadata) return 'default-character';
  
  // If we already have a clean UUID or ID, use it
  if (typeof metadata === 'string' && metadata.length > 10) return metadata;
  if (metadata.id && typeof metadata.id === 'string' && metadata.id.length > 10) return metadata.id;

  // Otherwise, create a stable hash from available metadata
  const stableString = JSON.stringify({
    name: metadata.name || metadata.character_name || 'unknown',
    creator: metadata.creator || metadata.creator_id || 'unknown',
    // Include a snippet of the description or first message if available for better uniqueness
    fingerprint: (metadata.description || metadata.scenario || '').substring(0, 100)
  });

  return hashString(stableString);
}

/**
 * Extract character metadata from various frontend formats (SillyTavern, Chub JAI, etc.)
 */
export function extractCharacterMetadata(body: any): any {
  if (!body) return null;

  // SillyTavern format
  if (body.character && typeof body.character === 'object') {
    return {
      name: body.character.name,
      id: body.character.id,
      description: body.character.description
    };
  }

  // Chub JAI / Common format
  if (body.character_id || body.character_name) {
    return {
      id: body.character_id,
      name: body.character_name
    };
  }

  // Fallback to body root if it looks like a character object
  if (body.name && (body.description || body.scenario)) {
    return {
      name: body.name,
      id: body.id,
      description: body.description
    };
  }

  return null;
}

/**
 * Extract or generate a stable user ID
 */
export function extractUserId(headers: any, body: any, fallbackId: string): string {
  // 1. Explicit header
  const headerId = headers.get?.('x-user-id') || headers['x-user-id'];
  if (headerId) return headerId;

  // 2. Body fields (Chub JAI, SillyTavern)
  if (body?.user_id) return body.user_id;
  if (body?.user && typeof body.user === 'string') return body.user;

  // 3. Fallback (API Key owner, Session, or IP-based)
  return fallbackId;
}

// Validate message structure and content
export function validateMessages(messages: any[]): { valid: boolean; error?: string } {
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: 'messages array is required' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'messages array cannot be empty' };
  }
  
  if (messages.length > MAX_MESSAGES_COUNT) {
    return { valid: false, error: `messages array exceeds maximum of ${MAX_MESSAGES_COUNT} messages` };
  }
  
  let totalLength = 0;
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: `messages[${i}] must be an object` };
    }
    
    if (!msg.role || typeof msg.role !== 'string') {
      return { valid: false, error: `messages[${i}].role must be a string` };
    }
    
    const validRoles = ['system', 'user', 'assistant', 'function', 'tool'];
    if (!validRoles.includes(msg.role)) {
      return { valid: false, error: `messages[${i}].role must be one of: ${validRoles.join(', ')}` };
    }
    
    if (msg.content !== null && msg.content !== undefined) {
      if (typeof msg.content !== 'string' && !Array.isArray(msg.content)) {
        return { valid: false, error: `messages[${i}].content must be a string or array` };
      }
      
      const contentLength = typeof msg.content === 'string'
        ? msg.content.length
        : JSON.stringify(msg.content).length;
        
      if (contentLength > MAX_MESSAGE_LENGTH) {
        return { valid: false, error: `Message at index ${i} is too long (${contentLength} chars). Maximum allowed per message is ${MAX_MESSAGE_LENGTH} characters. Please truncate your input.` };
      }
      
      totalLength += contentLength;
    }
  }
  
  if (totalLength > MAX_TOTAL_LENGTH) {
    return { valid: false, error: `Total conversation length (${totalLength} chars) exceeds the maximum allowed limit of ${MAX_TOTAL_LENGTH} characters. Please reduce the number of messages or their content.` };
  }
  
  return { valid: true };
}

// Model Aliases for compatibility with OpenAI-oriented apps
export const modelAliases: Record<string, string> = {
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai-fast',
  'gpt-4.5': 'openai-large',
  'gpt-4': 'openai',
  'gpt-3.5-turbo': 'openai-fast',
  'claude-3-5-sonnet': 'claude',
  'claude-3-haiku': 'claude-fast',
  'claude-3-opus': 'claude-large',
  'claude-opus-3': 'claude-large',
  'claude-opus': 'claude-large',
  'deepseek-chat': 'deepseek',
  'deepseek-coder': 'qwen-coder',
  'deepseek-v3': 'deepseek',
  'deepseek-r1': 'deepseek',
  'gemini-2.0-flash': 'gemini',
  'gemini-1.5-flash': 'gemini-fast',
  'gemini-1.5-pro': 'gemini-large',
  'gemini-2.5-pro': 'gemini-large',
  // Liz Proxy Aliases
  'claude-3-5-sonnet-liz': 'liz-claude-3-5-sonnet',
  'claude-3-opus-liz': 'liz-claude-3-opus',
  'gpt-4o-liz': 'liz-gpt-4o',
  'gemini-1.5-pro-liz': 'liz-gemini-1.5-pro',
  'deepseek-v3-liz': 'liz-deepseek-v3',
  'deepseek-r1-liz': 'liz-deepseek-r1',
  'o1-liz': 'liz-o1',
  'o3-mini-liz': 'liz-o3-mini',
  'qwen3-235b-liz': 'liz-qwen3-235b',
  'llama-3.3-70b-liz': 'liz-llama-3.3-70b',
  'kimi-k2-thinking': 'kimi-k2-thinking',
  'kimi-k2': 'kimi-k2',
  'claude-sonnet-4-6': 'claude-sonnet-4.6',
  'gemini-3-pro-preview:search': 'gemini-3-pro-preview:search',
  'gemini-3-flash-preview:search': 'gemini-3-flash-preview:search',
};

// Provider-specific model mapping (Vetra ID -> Provider ID)
export const PROVIDER_MODEL_MAPPING: Record<string, string> = {
  // Liz Proxy Mapping
  'liz-claude-3-5-sonnet': 'claude-3.5-sonnet',
  'liz-claude-3-7-sonnet': 'claude-3.7-sonnet',
  'liz-claude-3-opus': 'claude-3-opus',
  'liz-claude-sonnet-4': 'claude-sonnet-4',
  'liz-claude-opus-4': 'claude-opus-4',
  'liz-claude-opus-4.5': 'claude-opus-4.5',
  'liz-gpt-4o': 'gpt-4o',
  'liz-gemini-2.0-flash': 'gemini-2.0-flash-001',
  'liz-gemini-2.0-flash-lite': 'gemini-2.0-flash-lite-001',
  'liz-gemini-2.5-flash': 'gemini-2.5-flash',
  'liz-gemini-2.5-pro': 'gemini-2.5-pro',
  'liz-gemini-3-flash': 'gemini-3-flash-preview',
  'liz-gemini-3-pro': 'gemini-3-pro-preview',
  'liz-gemini-1.5-pro': 'gemini-1.5-pro',
  'liz-deepseek-v3': 'deepseek-v3',
  'liz-deepseek-r1': 'deepseek-r1',
  'liz-o1': 'o1',
  'liz-o3-mini': 'o3-mini',
  'liz-qwen3-235b': 'qwen3-235b-a22b',
  'liz-llama-3.3-70b': 'llama-3.3-70b',
  // Pollinations canonical IDs
  'gemini': 'gemini-3-flash-preview',
  'gemini-search': 'gemini-3-flash-preview:search',
  'gemini-large': 'gemini-3-pro-preview',
  'gemini-large-search': 'gemini-3-pro-preview:search',
  'gemini-fast': 'gemini-2.5-flash',
  'claude-fast': 'claude-sonnet-4.6',
  'openai': 'gpt-5.1',
  'openai-fast': 'gpt-5-nano',
  'openai-large': 'gpt-5.4',
  'qwen-large': 'qwen3.5-397b-a17b',
  'qwen-coder': 'qwen3-coder-480b-a35b-instruct',
  'qwen-next-80b': 'qwen3-next-80b-a3b-instruct',
  'qwen-next-80b-thinking': 'qwen3-next-80b-a3b-thinking',
  // Kivest compatibility aliases for Qwen Next variants
  'qwen3-next-80b-a3b-instruct': 'qwen-next-80b',
  'qwen3-next-80b-a3b-thinking': 'qwen-next-80b-thinking',
  'mistral': 'mistral-large-3-675b-instruct',
  'glm': 'glm-5',
  'minimax': 'minimax-m2.5',
  'deepseek': 'deepseek-v3.2',
  'grok': 'grok',
  
  // OpenRouter specific mappings if needed
  'openai/gpt-4o': 'gpt-4o',
  'anthropic/claude-3.5-sonnet': 'claude-3-5-sonnet',
};

// Bluesminds model mapping (Vetra ID -> Bluesminds ID)
// Used when Aqua fails and we fallback to Bluesminds
export const BLUESMINDS_MODEL_MAPPING: Record<string, string> = {
  'claude-opus-4-6': 'claude-opus-4-6',
  'claude-opus-4.5': 'claude-opus-4-6',
  'claude-sonnet-4-6': 'claude-sonnet-4-6',
  'claude-sonnet-4.5': 'claude-sonnet-4-5-20250929',
  'claude-sonnet-4.5-20250929': 'claude-sonnet-4-5-20250929',
  'claude-haiku-4.5': 'claude-haiku-4-5',
};

export function getBluesmindsModelId(modelId: string): string {
  return BLUESMINDS_MODEL_MAPPING[modelId] || modelId;
}

// BlazeAI model mapping (Vetra ID -> BlazeAI ID)
// Used when Aqua fails and we fallback to BlazeAI
export const BLAZEAI_MODEL_MAPPING: Record<string, string> = {
  'glm-5': 'z-ai/glm5',
};

export function getBlazeAiModelId(modelId: string): string {
  return BLAZEAI_MODEL_MAPPING[modelId] || modelId;
}

export function resolveModelId(modelId: string): string {
  const normalizedModelId = modelId.trim().replace(/^['"]+|['"]+$/g, '');
  const aliased = modelAliases[normalizedModelId] || normalizedModelId;
  return PROVIDER_MODEL_MAPPING[aliased] || aliased;
}

export const SEARCH_MODEL_ALIASES: Record<string, string> = {
  'gemini': 'gemini-search',
  'gemini-large': 'gemini-large-search',
  'gemini-3-flash-preview': 'gemini-3-flash-preview:search',
  'gemini-3-pro-preview': 'gemini-3-pro-preview:search',
};

export function applySearchPluginModel(modelId: string, searchEnabled: boolean): string {
  if (!searchEnabled) return modelId;
  return SEARCH_MODEL_ALIASES[modelId] || modelId;
}

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

// Simple token estimation: ~4 chars per token
export function estimateTokens(text: string | any[] | object): number {
  if (!text) return 0;
  
  const content = typeof text === 'string' 
    ? text 
    : JSON.stringify(text);
    
  return Math.ceil(content.length / 4);
}

// Sanitize error text to prevent XML/HTML leakage
export function sanitizeErrorText(text: string): string {
  if (!text) return 'Unknown error';
  
  // If it's XML or HTML, extract meaningful message or return generic error
  if (text.includes('<?xml') || text.includes('<html') || (text.includes('<Error>') && text.includes('</Error>'))) {
    if (text.includes('AccessDenied')) return 'Access denied by upstream provider.';
    if (text.includes('NoSuchKey')) return 'Resource not found on upstream provider.';
    if (text.includes('Message')) {
      const match = text.match(/<Message>(.*?)<\/Message>/);
      if (match) return match[1];
    }
    return 'The upstream provider returned an invalid response format (XML/HTML).';
  }
  
  return text.substring(0, 1000);
}

export const PROVIDER_URLS = {
  pollinations: 'https://gen.pollinations.ai',
  openrouter: 'https://openrouter.ai',
  stablehorde: 'https://stablehorde.net/api/v2',
  meridian: 'https://meridianlabsapp.website/api',
  github: 'https://models.inference.ai.azure.com',
  poe: 'https://api.poe.com/v1',
  liz: 'https://lizley.zeabur.app',
  openai: 'https://api.openai.com/v1',
  kivest: 'https://ai.ezif.in/v1',
  shalom: 'https://api.bluesminds.com/v1',
  bluesminds: 'https://api.bluesminds.com/v1',
  aqua: 'https://api.aquadevs.com/v1',
  blazeai: 'https://blazeai.boxu.dev/v1',
};

export function createChatTransformStream(
  lastMessage: string | null,
  userId: string | null,
  rememberInteraction: (userMsg: string, assistantMsg: string, userId: string, characterId?: string) => Promise<any>,
  characterId?: string,
  modelId?: string
) {
  const decoder = new TextDecoder();
  let fullContent = '';
  let fullToolCalls: any[] = [];
  let leftover = '';
  
  // Track last seen content for various fields to handle providers that send snapshots instead of deltas
  const streamState = {
    lastContent: '',
    lastText: '',
    lastThinking: '',
    blockContentSeen: new Map<number, string>(), // index -> seen_text
    blockThinkingSeen: new Map<number, string>()  // index -> seen_thinking
  };

  const processParsedData = (parsed: any): boolean => {
    // 0. Handle potential error objects in the stream
    if (parsed.error) {
      console.error('[STREAM ERROR] Received error in stream chunk:', parsed.error);
      return false; 
    }

    let modified = false;

    // Helper to extract delta from potential snapshots
    const getDelta = (newVal: string, lastValKey: keyof typeof streamState): string => {
      if (typeof newVal !== 'string' || !newVal) return '';
      
      const lastVal = streamState[lastValKey] as string;
      
      // If the new value starts with the last value, it's likely a snapshot
      if (lastVal && newVal.startsWith(lastVal)) {
        const delta = newVal.slice(lastVal.length);
        if (delta) {
          (streamState as any)[lastValKey] = newVal;
          return delta;
        }
        return '';
      }
      
      // If it doesn't start with the last value, it might be a true delta 
      // OR a completely new snapshot (e.g. from a different field)
      // For safety, if it's not a snapshot, we treat it as a delta but update our snapshot tracker
      (streamState as any)[lastValKey] = (streamState as any)[lastValKey] + newVal;
      return newVal;
    };

    // 1. Normalize Vertex AI / Raw Pollinations to OpenAI format
    if (!parsed.choices || parsed.choices.length === 0) {
      // Check for Vertex AI candidates (common in Gemini fallback)
      if (parsed.candidates && parsed.candidates[0]?.content?.parts) {
        const text = parsed.candidates[0].content.parts[0].text;
        if (text) {
          const delta = getDelta(text, 'lastText');
          if (delta) {
            parsed.choices = [{
              index: 0,
              delta: { content: delta },
              finish_reason: parsed.candidates[0].finishReason === 'STOP' ? 'stop' : null
            }];
            modified = true;
          }
        }
      } 
      // Check for top-level content (some Pollinations models)
      else if (parsed.content) {
        const delta = getDelta(parsed.content, 'lastContent');
        if (delta) {
          parsed.choices = [{
            index: 0,
            delta: { content: delta }
          }];
          modified = true;
        }
      }
      // Check for top-level message (Zhipu/GLM format)
      else if (parsed.message) {
        const text = parsed.message.content || parsed.message;
        if (typeof text === 'string') {
          const delta = getDelta(text, 'lastContent');
          if (delta) {
            parsed.choices = [{
              index: 0,
              delta: { content: delta }
            }];
            modified = true;
          }
        }
      }
      // Check for top-level content_blocks (sometimes seen in raw Gemini/Vertex streams)
      else if (Array.isArray(parsed.content_blocks)) {
        let textDelta = '';
        parsed.content_blocks.forEach((block: any, idx: number) => {
          if (block.text) {
            const seen = streamState.blockContentSeen.get(idx) || '';
            if (block.text.startsWith(seen)) {
              const delta = block.text.slice(seen.length);
              if (delta) {
                textDelta += delta;
                streamState.blockContentSeen.set(idx, block.text);
              }
            } else {
              textDelta += block.text;
              streamState.blockContentSeen.set(idx, block.text);
            }
          } else if (block.delta?.text) {
            textDelta += block.delta.text;
          }
        });

        if (textDelta) {
          parsed.choices = [{
            index: 0,
            delta: { content: textDelta }
          }];
          modified = true;
        }
      }
      // Check for top-level delta (some proxy servers do this)
      else if (parsed.delta && parsed.delta.content) {
        parsed.choices = [{
          index: 0,
          delta: { content: parsed.delta.content }
        }];
        modified = true;
      }
      // Check for top-level text field (common in some non-standard APIs)
      else if (parsed.text) {
        const delta = getDelta(parsed.text, 'lastText');
        if (delta) {
          parsed.choices = [{
            index: 0,
            delta: { content: delta }
          }];
          modified = true;
        }
      }
    }

    // Ensure we have some basic fields for client compatibility if we normalized
    if (modified) {
      if (!parsed.id) parsed.id = `norm-${Date.now()}`;
      if (!parsed.object) parsed.object = 'chat.completion.chunk';
      if (!parsed.created) parsed.created = Math.floor(Date.now() / 1000);
    }

    // 2. Skip if still no choices
    if (!parsed.choices || parsed.choices.length === 0) {
      return modified;
    }

    const choice = parsed.choices[0];
    const delta = choice.delta || choice.message || {};
    
    // 3. Extract content and ensure it's in delta.content for client compatibility
    // Fix for Claude/Gemini repetition: some providers send snapshots instead of deltas
    if (delta.content) {
      const originalContent = delta.content;
      const extractedDelta = getDelta(originalContent, 'lastContent');
      
      if (extractedDelta !== originalContent) {
        delta.content = extractedDelta;
        modified = true;
      }
    }

    let modifiedInStep3 = false;
    let contentFromBlocks = '';
    const blocks = delta.content_blocks || choice.message?.content_blocks || parsed.content_blocks;
    if (Array.isArray(blocks)) {
      blocks.forEach((block: any, idx: number) => {
        if (block.type === 'text') {
          if (block.text) {
            const seen = streamState.blockContentSeen.get(idx) || '';
            if (block.text.startsWith(seen)) {
              const d = block.text.slice(seen.length);
              if (d) {
                contentFromBlocks += d;
                streamState.blockContentSeen.set(idx, block.text);
              }
            } else {
              contentFromBlocks += block.text;
              streamState.blockContentSeen.set(idx, block.text);
            }
          } else if (block.delta?.text) {
            contentFromBlocks += block.delta.text;
          }
        } else if (block.type === 'thinking') {
          if (block.thinking) {
            const seen = streamState.blockThinkingSeen.get(idx) || '';
            if (block.thinking.startsWith(seen)) {
              const d = block.thinking.slice(seen.length);
              if (d) {
                contentFromBlocks += `\n[Thinking]: ${d}\n`;
                streamState.blockThinkingSeen.set(idx, block.thinking);
              }
            } else {
              contentFromBlocks += `\n[Thinking]: ${block.thinking}\n`;
              streamState.blockThinkingSeen.set(idx, block.thinking);
            }
          } else if (block.delta?.thinking) {
            contentFromBlocks += `\n[Thinking]: ${block.delta.thinking}\n`;
          }
        }
      });
    }

    // If we have content in blocks but not in delta.content, move it there
    if (contentFromBlocks && !delta.content) {
      if (!choice.delta) {
        choice.delta = {};
      }
      choice.delta.content = contentFromBlocks;
      modified = true;
      modifiedInStep3 = true;
    }

    if (delta.content) {
      fullContent += delta.content;
    } else if (contentFromBlocks && !modifiedInStep3) {
      fullContent += contentFromBlocks;
    }
    
    // 5. Tool calls
    if (delta.tool_calls) {
      for (const toolCall of delta.tool_calls) {
        const index = toolCall.index || 0;
        if (!fullToolCalls[index]) {
          fullToolCalls[index] = {
            id: toolCall.id,
            type: 'function',
            function: { name: '', arguments: '' }
          };
        }
        if (toolCall.id) fullToolCalls[index].id = toolCall.id;
        if (toolCall.function?.name) fullToolCalls[index].function.name += toolCall.function.name;
        if (toolCall.function?.arguments) fullToolCalls[index].function.arguments += toolCall.function.arguments;
      }
    }

    return modified;
  };

  return new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      const lines = (leftover + text).split('\n');
      leftover = lines.pop() || '';
      
      let outputText = '';
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          outputText += line + '\n';
          continue;
        }

        if (trimmedLine.startsWith('data: ')) {
          const dataStr = trimmedLine.slice(6).trim();
          if (dataStr === '[DONE]') {
            outputText += 'data: [DONE]\n\n';
            continue;
          }
          try {
            const parsed = JSON.parse(dataStr);
            const modified = processParsedData(parsed);
            
            // Strictly filter out chunks that have empty content to prevent "Empty completion" errors in Chub JAI/ST
            const choice = parsed.choices?.[0];
            const content = choice?.delta?.content || choice?.message?.content;
            
            if ((!parsed.choices || parsed.choices.length === 0 || (content !== undefined && content === "")) && !parsed.error) {
              // Skip empty chunk
              continue;
            }

            if (modified) {
              outputText += `data: ${JSON.stringify(parsed)}\n\n`;
            } else {
              // Ensure double newline for SSE compliance
              outputText += `data: ${dataStr}\n\n`;
            }
          } catch (e) {
            // If it's not valid JSON but starts with data:, just pass it through with double newline
            outputText += trimmedLine + '\n\n';
          }
        } else if (trimmedLine) {
          // If it's a non-empty line that doesn't start with data:, it might be a comment or malformed
          outputText += trimmedLine + '\n';
        }
      }
      
      if (outputText) {
        controller.enqueue(new TextEncoder().encode(outputText));
      }
    },
    async flush(controller) {
      let finalOutput = '';
      
      // Process any remaining leftover data
      if (leftover) {
        const lines = leftover.split('\n');
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr === '[DONE]') {
              finalOutput += 'data: [DONE]\n\n';
              continue;
            }

            try {
              const parsed = JSON.parse(dataStr);
              const modified = processParsedData(parsed);
              
              const choice = parsed.choices?.[0];
              const content = choice?.delta?.content || choice?.message?.content;
              
              if ((!parsed.choices || parsed.choices.length === 0 || (content !== undefined && content === "")) && !parsed.error) {
                continue;
              }

              if (modified) {
                finalOutput += `data: ${JSON.stringify(parsed)}\n\n`;
              } else {
                finalOutput += `data: ${dataStr}\n\n`;
              }
            } catch (e) {
              finalOutput += trimmedLine + '\n\n';
            }
          } else {
            finalOutput += trimmedLine + '\n';
          }
        }
      }

      // ALWAYS ensure the stream ends with [DONE] for Chub JAI/SillyTavern compatibility
      if (!finalOutput.includes('[DONE]')) {
        // --- EMPTY CONTENT FALLBACK FOR STREAMING ---
        // If we've reached the end of the stream and have no content, send a fallback message
        if (!fullContent && !fullToolCalls.length && modelId?.includes('gemini')) {
          console.error('[STREAM FLUSH] Empty content detected for Gemini stream. Sending fallback.');
          const fallback = {
            choices: [{
              index: 0,
              delta: { content: "I apologize, but I encountered an issue generating a response for this request. This can sometimes happen with complex prompts or sensitive topics. Please try rephrasing your message or switching to a different model." },
              finish_reason: "content_filter"
            }]
          };
          finalOutput = `data: ${JSON.stringify(fallback)}\n\n` + finalOutput;
        }
        
        finalOutput += 'data: [DONE]\n\n';
      }

      if (finalOutput) {
        controller.enqueue(new TextEncoder().encode(finalOutput));
      }

      // DEBUG: Log what was collected
      console.log(`[STREAM FLUSH] fullContent length: ${fullContent.length}, toolCalls: ${fullToolCalls.length}`);
      if (fullContent.length > 0 && fullContent.length < 200) {
        console.log(`[STREAM FLUSH] fullContent:`, fullContent);
      }
      
      // If we have tool calls but no content, we still want to remember it
      const hasContent = !!fullContent;
      const hasToolCalls = fullToolCalls.length > 0;
      
      // Only remember for gemini-large or if explicitly enabled
      const isGeminiLarge = modelId === 'gemini-large';
      
      if ((hasContent || hasToolCalls) && userId && lastMessage && isGeminiLarge) {
        try {
          // Format assistant message for memory
          let assistantMsg = fullContent;
          if (hasToolCalls) {
            assistantMsg += '\n[Tool Calls]: ' + JSON.stringify(fullToolCalls.filter(Boolean));
          }
          await rememberInteraction(lastMessage, assistantMsg, userId, characterId);
        } catch (err) {
          console.error('Failed to remember streaming interaction:', err);
        }
      }
    }
  });
}
