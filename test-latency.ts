
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROVIDERS = [
  { name: 'Pollinations', url: 'https://gen.pollinations.ai/v1/chat/completions', auth: '' },
  { name: 'Liz Proxy', url: 'https://lizley.zeabur.app/v1/chat/completions', auth: `Bearer ${process.env.LIZ_API_KEY || 'sk-d38705df52b386e905f257a4019f8f2a'}` },
];

async function measureLatency(provider: any, model: string) {
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

async function measureImageLatency() {
  const url = 'https://gen.pollinations.ai/image/a%20beautiful%20sunset?model=flux&width=512&height=512&nologo=true';
  const start = Date.now();
  
  try {
    const response = await fetch(url);
    const end = Date.now();
    if (response.ok) {
      return end - start;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function runTests() {
  console.log('--- Provider Latency Test (Optimized) ---');
  
  const modelsToTest = [
    { name: 'OpenAI GPT-5 Mini', id: 'openai' },
    { name: 'DeepSeek V3.2', id: 'deepseek' },
    { name: 'Gemini 3 Flash', id: 'gemini' }
  ];

  for (const model of modelsToTest) {
    console.log(`\nModel: ${model.name}`);
    for (const provider of PROVIDERS) {
      const latency = await measureLatency(provider, model.id);
      if (latency) {
        console.log(`${provider.name}: ${latency}ms`);
      } else {
        console.log(`${provider.name}: FAILED`);
      }
    }
  }

  console.log('\n--- Image Generation Latency ---');
  const imageLatency = await measureImageLatency();
  if (imageLatency) {
    console.log(`Pollinations Flux: ${imageLatency}ms`);
  } else {
    console.log('Pollinations Flux: FAILED');
  }

  console.log('\n--- Done ---');
}

runTests().catch(console.error);
