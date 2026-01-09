export const MAX_MESSAGE_LENGTH = 2000000; // 2MB per message (~1.5M tokens)
export const MAX_TOTAL_LENGTH = 10000000; // 10MB total for all messages
export const MAX_MESSAGES_COUNT = 500;
export const PROVIDER_TIMEOUT_MS = 120000; // 120 seconds

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
  'deepseek-chat': 'deepseek',
  'deepseek-coder': 'qwen-coder',
  'deepseek-v3': 'deepseek',
  'deepseek-r1': 'deepseek',
  'gemini-2.0-flash': 'gemini',
  'gemini-1.5-flash': 'gemini-fast',
  'gemini-1.5-pro': 'gemini-large',
};

export function resolveModelId(modelId: string): string {
  return modelAliases[modelId] || modelId;
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
  liz: 'https://lizley.zeabur.app',
  stablehorde: 'https://stablehorde.net/api/v2',
  meridian: 'https://meridianlabsapp.website/api',
};

export function createChatTransformStream(
  lastMessage: string | null,
  userId: string | null,
  rememberInteraction: (userMsg: string, assistantMsg: string, userId: string) => Promise<any>
) {
  const decoder = new TextDecoder();
  let fullContent = '';
  let fullToolCalls: any[] = [];

  return new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            
            if (delta?.content) {
              fullContent += delta.content;
            }
            
            if (delta?.tool_calls) {
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
          } catch (e) {
            // Silently ignore parse errors for partial chunks
          }
        }
      }
      controller.enqueue(chunk);
    },
    async flush() {
      // If we have tool calls but no content, we still want to remember it
      const hasContent = !!fullContent;
      const hasToolCalls = fullToolCalls.length > 0;
      
      if ((hasContent || hasToolCalls) && userId && lastMessage) {
        try {
          // Format assistant message for memory
          let assistantMsg = fullContent;
          if (hasToolCalls) {
            assistantMsg += '\n[Tool Calls]: ' + JSON.stringify(fullToolCalls.filter(Boolean));
          }
          await rememberInteraction(lastMessage, assistantMsg, userId);
        } catch (err) {
          console.error('Failed to remember streaming interaction:', err);
        }
      }
    }
  });
}
