const API_KEY = 'vtai_ccf3d76da8c84f7a99b961fd0a20fa25';
const API_URL = 'https://vetraai.vercel.app/v1/chat/completions';

const modelWeights: Record<string, number> = {
  // Pollinations
  'gpt-5.1': 2,
  'gpt-oss-120b': 2,
  'gpt-oss-20b': 1,
  'gemini-large-search': 7,
  'deepseek-chat': 1,
  'deepseek-reasoner': 3,
  'deepseek-r1-0528': 4,
  'qwen3-235b-a22b': 2,
  'qwen3-32b': 1,
  'qwen-next-80b': 2,
  'qwen-next-80b-thinking': 3,
  'qwen3.5-plus': 1,
  'qwen3.5-flash': 1,
  'qwen-deep-research': 4,
  'kimi-k2': 1,
  'kimi-k2-thinking': 3,
  // Kivest
  'kivest-tungtung-brainrot': 1,
  'claude-sonnet-4.6': 10,
  'gpt-5.4': 6,
  'gpt-5.3-codex': 6,
  'gpt-5-nano': 2,
  'llama3.1-8B': 1,
  'llama-4-maverick-17b-128e-instruct': 4,
  'llama-4-scout-17b-16e-instruct': 4,
  'gemini-3-pro-preview': 8,
  'gemini-3-pro-preview:search': 9,
  'gemini-3-flash-preview': 8,
  'gemini-3-flash-preview:search': 9,
  'gemini-2.5-flash': 8,
  'qwen-slides': 4,
  'qwen3.5-397b-a17b': 2,
  'qwen3-coder-480b-a35b-instruct': 2,
  'qwen3-next-80b-a3b-instruct': 2,
  'qwen3-next-80b-a3b-thinking': 2,
  'deepseek-v3.2': 3,
  'phi-4-mini-flash-reasoning': 3,
  'phi-4-multimodal-instruct': 6,
  'minimax-2.7': 3,
  'minimax-m2.1': 4,
  'minimax-m2.5': 6,
  'minimax-m2': 3,
  'mimo-v2-pro': 3,
  'mimo-v2-omni': 3,
  'devstral-2-123b': 6,
  'mistral-large-3-675b-instruct': 2,
  'kimi-k2-instruct-0905': 4,
  'kimi-k2.5': 6,
  'glm-4.7': 2,
  'glm-5': 3,
  'seed-oss-36b-instruct': 2,
  'nemotron-3-nano-30b-a3b': 2,
  'step-3.5-flash': 2,
  // OpenAI
  'gpt-4o': 10,
  'gpt-4o-mini': 1,
  'gpt-5': 100,
  'gpt-5-pro': 150,
  'gpt-5-mini': 50,
  'o1': 30,
  'o3': 30,
  'o3-mini': 15,
  // GitHub
  'Phi-4': 3,
  'Llama-3.3-70B-Instruct': 10,
  'Mistral-small-3.1': 3,
  'DeepSeek-V3-0324': 10,
};

const models = [
  // Pollinations models
  'gpt-5.1',
  'gpt-oss-120b',
  'gpt-oss-20b',
  'gemini-large-search',
  'deepseek-chat',
  'deepseek-reasoner',
  'deepseek-r1-0528',
  'qwen3-235b-a22b',
  'qwen3-32b',
  'qwen-next-80b',
  'qwen-next-80b-thinking',
  'qwen3.5-plus',
  'qwen3.5-flash',
  'qwen-deep-research',
  'kimi-k2',
  'kimi-k2-thinking',
  
  // Kivest models
  'kivest-tungtung-brainrot',
  'claude-sonnet-4.6',
  'gpt-5.4',
  'gpt-5.3-codex',
  'gpt-5.1',
  'gpt-5-nano',
  'llama3.1-8B',
  'llama-4-maverick-17b-128e-instruct',
  'llama-4-scout-17b-16e-instruct',
  'gemini-3-pro-preview',
  'gemini-3-pro-preview:search',
  'gemini-3-flash-preview',
  'gemini-3-flash-preview:search',
  'gemini-2.5-flash',
  'gpt-oss-120b',
  'gpt-oss-20b',
  'qwen3.5-plus',
  'qwen3.5-flash',
  'qwen-slides',
  'qwen-deep-research',
  'qwen3.5-397b-a17b',
  'qwen3-235b-a22b',
  'qwen3-32b',
  'qwen3-coder-480b-a35b-instruct',
  'qwen3-next-80b-a3b-instruct',
  'qwen3-next-80b-a3b-thinking',
  'deepseek-r1-0528',
  'deepseek-chat',
  'deepseek-v3.2',
  'deepseek-reasoner',
  'phi-4-mini-flash-reasoning',
  'phi-4-multimodal-instruct',
  'minimax-2.7',
  'minimax-m2.1',
  'minimax-m2.5',
  'minimax-m2',
  'mimo-v2-pro',
  'mimo-v2-omni',
  'devstral-2-123b',
  'mistral-large-3-675b-instruct',
  'kimi-k2-instruct-0905',
  'kimi-k2.5',
  'kimi-k2-thinking',
  'glm-4.7',
  'glm-5',
  'seed-oss-36b-instruct',
  'nemotron-3-nano-30b-a3b',
  'step-3.5-flash',
  
  // OpenAI models
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-5',
  'gpt-5-pro',
  'gpt-5-mini',
  'o1',
  'o3',
  'o3-mini',
  
  // GitHub models
  'Phi-4',
  'Llama-3.3-70B-Instruct',
  'Mistral-small-3.1',
  'DeepSeek-V3-0324',
];

async function testModel(model: string): Promise<{ model: string; working: boolean; error?: string }> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10,
      }),
    });

    const data = await response.json();
    
    if (response.ok && !data.error) {
      return { model, working: true };
    } else {
      return { 
        model, 
        working: false, 
        error: data.error?.message || `HTTP ${response.status}` 
      };
    }
  } catch (err: any) {
    return { model, working: false, error: err.message };
  }
}

async function main() {
  console.log('Testing models...\n');
  
  const results = await Promise.all(
    models.map(async (model) => {
      process.stdout.write(`Testing ${model}... `);
      const result = await testModel(model);
      console.log(result.working ? '✓' : '✗');
      return result;
    })
  );

  const working = results.filter(r => r.working).map(r => r.model);
  const notWorking = results.filter(r => !r.working);

  console.log('\n');
  working.forEach(m => {
    const weight = modelWeights[m] || 1;
    console.log(`- ${m} x${weight}`);
  });
}

main();
