import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { trackUsage, getRateLimitInfo, getDailyLimitInfo, ApiKey } from '@/lib/api-keys';
import { CHAT_MODELS } from '@/lib/providers';
import { getCorsHeaders } from '@/lib/utils';
import { rememberInteraction } from '@/lib/memory';
import { PROVIDER_URLS } from '@/lib/chat-utils';

export function getStableHordeTextModelName(modelId: string): string {
  const modelMap: Record<string, string> = {
    'stable-horde-nemotron-nano-9b': 'Nemotron Nano 9B v2',
    'stable-horde-llama-3.2-3b': 'Llama 3.2 3B Instruct',
    'stable-horde-mistral-7b': 'Mistral 7B Instruct',
    'stable-horde-qwen3-4b': 'Qwen3 4B',
    'stable-horde-neonmaid-12b': 'NeonMaid-12B-v2',
  };
  return modelMap[modelId] || 'Mistral 7B Instruct';
}

export async function handleStableHordeChat(
  body: any,
  modelId: string,
  apiKeyInfo: ApiKey | null,
  userId: string,
  effectiveKey: string,
  requestId: string,
  limit: number,
  dailyLimit: number,
  isSystemRequest: boolean,
  characterId?: string
): Promise<NextResponse> {
  const hordeApiKey = process.env.STABLE_HORDE_API_KEY || process.env.STABLEHORDE_API_KEY || '0000000000';
  if (!process.env.STABLE_HORDE_API_KEY && !process.env.STABLEHORDE_API_KEY) {
    console.warn('STABLE_HORDE_API_KEY not set, using anonymous access with reduced rate limits');
  }
  const hordeUrl = PROVIDER_URLS.stablehorde;
  const modelName = getStableHordeTextModelName(modelId);
  
  const prompt = body.messages
    .map((msg: any) => `${msg.role}: ${msg.content}`)
    .join('\n') + '\nassistant:';
  
  const generateRequest = {
    prompt,
    params: {
      max_length: body.max_tokens ? Math.min(body.max_tokens, 1024) : 512,
      temperature: body.temperature || 0.7,
      top_p: body.top_p || 0.9,
      n: 1,
    },
    models: [modelName],
    workers: [],
    slow_workers: true,
  };

  try {
    const generateResponse = await fetch(`${hordeUrl}/generate/text/async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': hordeApiKey,
        'Client-Agent': 'Vetra:1.0:api@github.com',
      },
      body: JSON.stringify(generateRequest),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      return NextResponse.json(
        { error: 'Stable Horde API error', details: errorText },
        { status: generateResponse.status, headers: getCorsHeaders() }
      );
    }

    const generateData = await generateResponse.json();
    const generationId = generateData.id;

    if (!generationId) {
      return NextResponse.json(
        { error: 'Failed to get generation ID from Stable Horde' },
        { status: 500, headers: getCorsHeaders() }
      );
    }

    const maxWaitTime = 120000;
    const pollInterval = 2000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const checkResponse = await fetch(`${hordeUrl}/generate/text/status/${generationId}`, {
        headers: {
          'Client-Agent': 'Vetra:1.0:api@github.com',
        },
      });
      
      if (!checkResponse.ok) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }
      
      const checkData = await checkResponse.json();
      
      if (checkData.done) {
        if (checkData.generations && checkData.generations.length > 0) {
          const generatedText = checkData.generations[0].text || '';
          
          if (apiKeyInfo && !isSystemRequest) {
            const model = CHAT_MODELS.find(m => m.id === modelId);
            const usageWeight = model?.usageWeight || 1;
            waitUntil(trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat', body.messages, usageWeight));
          }
          
          const lastUserMessage = body.messages[body.messages.length - 1]?.content || '';
          const shouldRemember = body.use_memory || apiKeyInfo?.fandomPluginEnabled;
          
          if (userId && lastUserMessage && shouldRemember) {
            rememberInteraction(lastUserMessage, generatedText.trim(), userId, characterId).catch(err =>
              console.error('Failed to remember Stable Horde interaction:', err)
            );
          }
          
          const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'chat');
          const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);

          return NextResponse.json({
            id: 'horde-' + generationId,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: modelId,
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: generatedText.trim(),
                },
                finish_reason: 'stop',
              },
            ],
            usage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0,
            },
          }, {
            headers: {
              ...getCorsHeaders(),
              'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
              'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
              'X-RateLimit-Limit': String(rateLimitInfo.limit),
              'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
              'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
              'X-DailyLimit-Limit': String(dailyLimitInfo.limit),
            },
          });
        }
        
        return NextResponse.json(
          { error: 'No text generated' },
          { status: 500, headers: getCorsHeaders() }
        );
      }
      
      if (checkData.faulted) {
        return NextResponse.json(
          { error: 'Generation failed on Stable Horde' },
          { status: 500, headers: getCorsHeaders() }
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    return NextResponse.json(
      { error: 'Generation timed out' },
      { status: 504, headers: getCorsHeaders() }
    );
    
  } catch (error) {
    console.error('Stable Horde text error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Stable Horde API' },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}
