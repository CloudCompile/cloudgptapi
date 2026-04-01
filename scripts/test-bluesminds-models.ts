import dotenv from 'dotenv';
dotenv.config();

const SHALOM_API_KEY = process.env.SHALOM_API_KEY;
const BASE_URL = 'https://api.bluesminds.com/v1/chat/completions';

const modelsToTest = [
  // Claude models
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5 (Oct)' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6' },
  { id: 'provider-1/claude-opus-4-5', name: 'Claude Opus 4.5' },
  // Gemini models
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview' },
  { id: 'gemini-3-1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite Preview' },
  { id: 'gemini-3-1-pro-preview', name: 'Gemini 3.1 Pro Preview' },
  // Other models
  { id: 'deepseek-chat', name: 'DeepSeek Chat' },
  { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner' },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2' },
  { id: 'moonshotai/kimi-k2.5', name: 'Kimi K2.5' },
  { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi K2 Thinking' },
  { id: 'grok-4.2', name: 'Grok 4.2' },
  { id: 'glm-4.6', name: 'GLM 4.6' },
  { id: 'z-ai/glm5', name: 'GLM 5' },
  { id: 'glm-5-turbo', name: 'GLM 5 Turbo' },
  { id: 'MiniMax-M2.7', name: 'MiniMax M2.7' },
];

async function testModel(modelId: string, modelName: string) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SHALOM_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${modelName} (${modelId}) - OK`);
      return { success: true, model: modelName, id: modelId };
    } else {
      console.log(`❌ ${modelName} (${modelId}) - ${data.error?.message || 'ERROR'}`);
      return { success: false, model: modelName, id: modelId, error: data.error?.message };
    }
  } catch (err: any) {
    console.log(`❌ ${modelName} (${modelId}) - ${err.message}`);
    return { success: false, model: modelName, id: modelId, error: err.message };
  }
}

async function main() {
  if (!SHALOM_API_KEY) {
    console.error('SHALOM_API_KEY not found in .env');
    process.exit(1);
  }

  console.log('Testing Bluesminds models...\n');

  const results = await Promise.all(
    modelsToTest.map(m => testModel(m.id, m.name))
  );

  console.log('\n=== Summary ===');
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`Passed: ${passed}/${modelsToTest.length}`);
  console.log(`Failed: ${failed}/${modelsToTest.length}`);

  if (failed > 0) {
    console.log('\nFailed models:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.id}: ${r.error}`);
    });
  }
}

main();
