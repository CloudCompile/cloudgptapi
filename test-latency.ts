
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

  for (const m of modelsToTest) {
    console.log(`\nTesting model: ${m.name} (${m.id})`);
    
    const polLatency = await measureLatency(PROVIDERS[0], m.id);
    console.log(`- Pollinations: ${polLatency ? polLatency + 'ms' : 'FAILED'}`);
    
    // For Liz, we use the actual model name they expect if different
    const lizModelId = m.id === 'openai' ? 'gpt-4o' : (m.id === 'deepseek' ? 'deepseek-v3' : 'gemini-2.0-flash');
    const lizLatency = await measureLatency(PROVIDERS[1], lizModelId);
    console.log(`- Liz Proxy: ${lizLatency ? lizLatency + 'ms' : 'FAILED'}`);
    
    if (polLatency && lizLatency) {
      const diff = lizLatency - polLatency;
      const percent = ((diff / lizLatency) * 100).toFixed(1);
      console.log(`>>> Optimization Gain: ${diff}ms faster (${percent}%)`);
    }
  }
}

runTests();
