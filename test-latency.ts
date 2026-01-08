
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROVIDERS = [
  { name: 'Pollinations', url: 'https://gen.pollinations.ai/v1/chat/completions', auth: '' },
  { name: 'Liz Proxy', url: 'https://lizley.zeabur.app/v1/chat/completions', auth: `Bearer ${process.env.LIZ_API_KEY || 'sk-d38705df52b386e905f257a4019f8f2a'}` },
];

async function measureLatency(provider: typeof PROVIDERS[0], model: string) {
  const start = Date.now();
  
  try {
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': provider.auth
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
        stream: false
      })
    });

    const end = Date.now();
    const duration = end - start;

    if (response.ok) {
      return duration;
    } else {
      return null;
    }
  } catch (err: any) {
    return null;
  }
}

async function runTests() {
  console.log('--- Provider Latency Test (Optimized) ---');
  
  const modelsToTest = [
    { name: 'OpenAI GPT-4o', id: 'openai' },
    { name: 'DeepSeek V3', id: 'deepseek' },
    { name: 'Gemini 2.0 Flash', id: 'gemini' }
  ];

  const imageModels = [
    { name: 'Flux', id: 'flux' },
    { name: 'GPT Image', id: 'gptimage' },
    { name: 'Stable Horde SDXL', id: 'stable-horde-sdxl' }
  ];

  for (const m of modelsToTest) {
    // ... existing chat tests ...
  }

  console.log('\n--- Image Provider Test ---');
  for (const m of imageModels) {
    const start = Date.now();
    try {
      const response = await fetch('http://localhost:3000/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'a small red cube', model: m.id })
      });
      const duration = Date.now() - start;
      console.log(`Model ${m.id}: ${response.status} (${duration}ms)`);
      if (!response.ok) {
        const err = await response.text();
        console.log(`  Error: ${err.substring(0, 100)}`);
      }
    } catch (e: any) {
      console.log(`Model ${m.id}: FAILED (${e.message})`);
    }
  }
}

runTests();
