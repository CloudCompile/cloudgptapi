
async function testApiKey(key: string) {
  console.log(`--- Testing API Key: ${key.substring(0, 10)}... ---`);
  
  const baseUrl = 'http://localhost:3000'; // Assuming local dev server
  const endpoint = `${baseUrl}/v1/chat/completions`;
  
  const payload = {
    model: 'gemini-2.5-pro',
    messages: [
      { role: 'user', content: 'Say "API Key is working!"' }
    ],
    stream: false
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(payload)
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
  } catch (err) {
    console.error('Fetch error:', err.message);
    console.log('\n--- TEST FAILED (Connection Error) ---');
    console.log('Note: Make sure the local dev server is running (npm run dev)');
  }
}

const keyToTest = process.argv[2] || 'cgpt_2c33963f422948d381bfab94581db93f';
testApiKey(keyToTest);
