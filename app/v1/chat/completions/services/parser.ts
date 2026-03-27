import { extractCharacterMetadata, generateCharacterId, extractUserId, estimateTokens } from '@/lib/chat-utils';
import { retrieveMemory } from '@/lib/memory';
import { runFandomPlugin } from '@/lib/plugins';
import { ApiKey } from '@/lib/api-keys';

export interface ParseResult {
  userId: string;
  characterId: string;
  messages: any[];
}

export async function processContextAndMemory(
  messages: any[],
  headers: Headers,
  body: any,
  apiKeyInfo: ApiKey | null,
  sessionUserId: string | null,
  clientIp: string,
  modelId: string,
  requestId: string
): Promise<ParseResult> {
  const rawUserIdFallback = apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
  const userId = extractUserId(headers, body, rawUserIdFallback);
  
  let characterId = headers.get('x-character-id') || body.character_id;
  
  if (!characterId) {
    const charMetadata = extractCharacterMetadata(body);
    if (charMetadata) {
      characterId = generateCharacterId(charMetadata);
      console.log(`[${requestId}] Auto-generated characterId: ${characterId} for ${charMetadata.name || 'unknown'}`);
    }
  }

  let processedMessages = [...messages];
  const lastMessage = processedMessages[processedMessages.length - 1]?.content || '';
  let memoryContext = '';
  
  try {
    const isGeminiLarge = modelId === 'gemini-large';
    const isClaude = modelId.startsWith('claude');
    const isFandomEnabled = apiKeyInfo?.fandomPluginEnabled || false;
    
    if (isGeminiLarge || isClaude || body.use_memory || isFandomEnabled) {
      memoryContext = await retrieveMemory(lastMessage, userId, characterId);
      
      let optimizationPrompt = '';
      if (isGeminiLarge || isClaude) {
        optimizationPrompt += '\n[System Instruction]: Keep responses concise and focused. Limit output to 3-5 paragraphs maximum. Avoid long monologues.';
      }
      
      if (isClaude) {
        optimizationPrompt += ' Do not repeat the user\'s input or previous messages. Start your response directly.';
      }
      
      if (memoryContext && memoryContext !== 'No prior context found.') {
        const safeMemory = memoryContext.length > 2000 ? memoryContext.substring(0, 2000) + '... [Truncated]' : memoryContext;
        optimizationPrompt += `\n\n[Character Memory Context]:\n${safeMemory}`;
      }

      if (optimizationPrompt) {
        const isGemini = modelId.includes('gemini');
        
        if (isGemini) {
          console.log(`[${requestId}] ADAPTIVE: Injecting memory/optimization as user context for Gemini.`);
          const firstUserIndex = processedMessages.findIndex((m: any) => m.role === 'user');
          if (firstUserIndex !== -1) {
            processedMessages[firstUserIndex].content = `[Context]: ${optimizationPrompt}\n\n${processedMessages[firstUserIndex].content}`;
          } else {
            processedMessages.push({
              role: 'user',
              content: `[Context]: ${optimizationPrompt}`
            });
          }
        } else {
          const systemMessageIndex = processedMessages.findIndex((m: any) => m.role === 'system');
          
          if (systemMessageIndex !== -1) {
            const existingContent = processedMessages[systemMessageIndex].content;
            if (existingContent.length > 5000) {
              processedMessages[systemMessageIndex].content = existingContent.substring(0, 5000) + '... [Original system prompt truncated for performance]';
            }
            processedMessages[systemMessageIndex].content += optimizationPrompt;
          } else {
            processedMessages.unshift({
              role: 'system',
              content: `You are a helpful assistant with per-character persistent memory.${optimizationPrompt}`
            });
          }
        }
      }
    }

    console.log(`[${requestId}] Running Remote Fandom Plugin for key: ${apiKeyInfo?.id || 'unknown'}`);
    const originalMessages = [...processedMessages];
    
    processedMessages = await runFandomPlugin(processedMessages, apiKeyInfo?.fandomSettings as any, apiKeyInfo?.id, modelId);
    
    if (processedMessages.length > originalMessages.length) {
      console.log(`[${requestId}] Fandom Knowledge Plugin injected lore from remote VPS.`);
      
      const isGemini = modelId.includes('gemini');
      if (isGemini) {
        processedMessages = processedMessages.map((msg: any, idx: number) => {
          const isNew = !originalMessages.some(orig => orig.role === msg.role && orig.content === msg.content);
          if (isNew && msg.role === 'system') {
            console.log(`[${requestId}] ADAPTIVE: Converting injected system message to user context for Gemini.`);
            
            let content = msg.content;
            const loreTokens = estimateTokens(content);
            const maxLoreTokens = 800; 
            
            if (loreTokens > maxLoreTokens) {
              console.log(`[${requestId}] ADAPTIVE: Compressing long lore snippet (${loreTokens} tokens) for Gemini stability.`);
              const targetCharCount = maxLoreTokens * 4;
              content = content.substring(0, targetCharCount) + '... [Lore truncated for stability]';
            }

            return {
              role: 'user',
              content: `[Knowledge Context]: ${content}\n\nPlease use the above information to inform your response.`
            };
          }
          return msg;
        });
      }
    }

  } catch (memError) {
    console.error('Memory retrieval failed:', memError);
  }

  if (modelId === 'gemini-large') {
    console.log(`[${requestId}] FINAL PROCESSED MESSAGES (Count: ${processedMessages.length}):`);
    processedMessages.forEach((m: any, i: number) => {
      const snippet = typeof m.content === 'string' ? m.content.substring(0, 200) : '[Non-string content]';
      console.log(`  [${i}] ${m.role}: ${snippet}${m.content?.length > 200 ? '...' : ''}`);
    });
  }

  return { userId, characterId, messages: processedMessages };
}

export function sanitizeMessagesForProvider(
  messages: any[],
  modelId: string,
  requestId: string
): any[] {
  let processedMessages = [...messages];
  
  if (Array.isArray(processedMessages) && processedMessages.length > 0) {
    const isGeminiModel = modelId.includes('gemini');
    
    if (isGeminiModel) {
      let poppedCount = 0;
      let lastPoppedContent = '';
      
      while (processedMessages.length > 0 && processedMessages[processedMessages.length - 1].role === 'assistant') {
        const lastMsg = processedMessages[processedMessages.length - 1];
        const content = typeof lastMsg.content === 'string' ? lastMsg.content : '';
        
        if (content.trim()) {
          lastPoppedContent = content + (lastPoppedContent ? '\n' + lastPoppedContent : '');
        }
        
        console.log(`[${requestId}] SANITIZER: Popping trailing assistant message to prevent Gemini failure (Model: ${modelId}, Content length: ${content.length})`);
        processedMessages.pop();
        poppedCount++;
      }
      
      if (poppedCount > 0) {
        if (processedMessages.length > 0 && processedMessages[processedMessages.length - 1].role === 'user') {
          if (lastPoppedContent) {
            const lastUserMsg = processedMessages[processedMessages.length - 1];
            console.log(`[${requestId}] SANITIZER: Moving popped assistant content (${lastPoppedContent.length} chars) to last user message for continuity.`);
            lastUserMsg.content = `${lastUserMsg.content}\n\n[Assistant Continuation Context]:\n${lastPoppedContent}`;
          }
        } else {
          console.log(`[${requestId}] SANITIZER: After popping, last message is not 'user'. Adding placeholder to ensure generation.`);
          let content = 'Continue the conversation.';
          if (lastPoppedContent) {
            content = `Continue from this context:\n${lastPoppedContent}`;
          }
          processedMessages.push({ role: 'user', content });
        }
      }
    } else {
      const lastMsg = processedMessages[processedMessages.length - 1];
      if (lastMsg.role === 'assistant') {
        if (!lastMsg.content || (typeof lastMsg.content === 'string' && lastMsg.content.trim() === '')) {
          console.log(`[${requestId}] Removing trailing empty assistant message for provider compatibility`);
          processedMessages = processedMessages.slice(0, -1);
        } else {
          console.warn(`[${requestId}] Trailing non-empty assistant message detected for ${modelId}. This may cause provider errors.`);
        }
      }
    }
  }
  
  return processedMessages;
}
