
// import fetch from 'node-fetch';

async function testModel(model: string, apiKey: string) {
  console.log(`\nTesting model: ${model}`);
  const response = await fetch('http://localhost:3001/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: 'Say hello!' }
      ]
    })
  });

  console.log(`Status: ${response.status} ${response.statusText}`);
  const data: any = await response.json();
  if (response.ok) {
    console.log('Response:', data.choices[0].message.content);
  } else {
    console.log('Error:', JSON.stringify(data, null, 2));
  }
}

async function runTests() {
  const apiKey = 'cgpt_822b7637a03648abb9d59e460c1fe921';
  
  // Test models from different providers
  await testModel('gemini-fast', apiKey); // provider: gemini (pollinations)
  await testModel('gemini', apiKey);      // provider: gemini (pollinations)
  await testModel('gemini-2.5-pro', apiKey); // provider: liz
  await testModel('openai', apiKey);      // provider: pollinations
}

runTests();
