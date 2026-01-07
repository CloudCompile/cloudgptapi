const BASE_URL = 'http://localhost:3000/v1';

async function testModels() {
  console.log('Testing /v1/models...');
  try {
    const response = await fetch(`${BASE_URL}/models`);
    const data = await response.json();
    console.log('Models response:', JSON.stringify(data, null, 2).slice(0, 500) + '...');
    if (data.object === 'list' && Array.isArray(data.data)) {
      console.log('✅ /v1/models is working correctly');
    } else {
      console.log('❌ /v1/models response format is incorrect');
    }
  } catch (error) {
    console.error('❌ /v1/models failed:', error.message);
  }
}

async function testChatCompletions() {
  console.log('\nTesting /v1/chat/completions with gemini-3-pro-preview...');
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-3-pro-preview',
        messages: [{ role: 'user', content: 'Say hello!' }]
      })
    });
    const data = await response.json();
    console.log('Chat response:', JSON.stringify(data, null, 2));
    if (data.choices && data.choices[0].message) {
      console.log('✅ /v1/chat/completions is working correctly');
    } else {
      console.log('❌ /v1/chat/completions response format is incorrect');
    }
  } catch (error) {
    console.error('❌ /v1/chat/completions failed:', error.message);
  }
}

async function testImageGenerations() {
  console.log('\nTesting /v1/images/generations with flux...');
  try {
    const response = await fetch(`${BASE_URL}/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'flux',
        prompt: 'A beautiful sunset over the ocean'
      })
    });
    const data = await response.json();
    console.log('Image response:', JSON.stringify(data, null, 2));
    if (data.data && data.data[0].url) {
      console.log('✅ /v1/images/generations is working correctly');
    } else {
      console.log('❌ /v1/images/generations response format is incorrect');
    }
  } catch (error) {
    console.error('❌ /v1/images/generations failed:', error.message);
  }
}

async function runTests() {
  await testModels();
  // Note: Chat and Image tests might fail if the server isn't running or API keys are missing
  // These are meant to be run in a live environment
  console.log('\nTests completed. Note: Live API tests require the server to be running and valid API keys.');
}

runTests();
