
async function testApiKey(key: string, model: string = 'gemini-2.5-pro', baseUrl: string = 'http://localhost:3001') {
  console.log(`--- Testing API Key: ${key.substring(0, 10)}... ---`);
  console.log(`--- Using Base URL: ${baseUrl} ---`);
  console.log(`--- Using Model: ${model} ---`);
  
  const endpoint = `${baseUrl}/v1/chat/completions`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: 'Hello! Are you working?' }
        ]
      })
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response Content:', data.choices[0].message.content);
      console.log('\n--- TEST SUCCESSFUL ---');
    } else {
      const errorText = await response.text();
      console.error('Error Response:', errorText);
      console.log('\n--- TEST FAILED ---');
    }
  } catch (err: any) {
    console.error('Fetch error:', err.message);
    console.log('\n--- TEST FAILED (Connection Error) ---');
    console.log('Note: Make sure the local dev server is running (npm run dev)');
  }
}

const keyToTest = process.argv[2] || 'cgpt_2c33963f422948d381bfab94581db93f';
const modelToTest = process.argv[3] || 'gemini-2.5-pro';
const baseUrlToTest = process.argv[4] || 'http://localhost:3001';

testApiKey(keyToTest, modelToTest, baseUrlToTest);
