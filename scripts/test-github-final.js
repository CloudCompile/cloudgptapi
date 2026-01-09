// No require for fetch in Node 18+
require('dotenv').config({ path: '.env.local' });

async function testGitHubDirect() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('GITHUB_TOKEN is not defined in .env.local');
    return;
  }

  console.log('Using token starting with:', token.substring(0, 10));

  // Test with a basic model first to verify token
  const models = [
    'Phi-3-mini-4k-instruct',
    'gpt-4o-mini',
    'Stable-Diffusion-3.5-Large'
  ];

  for (const model of models) {
    console.log(`\n--- Testing model: ${model} ---`);
    
    const isImage = model.includes('Stable-Diffusion');
    const endpoint = isImage 
      ? 'https://models.inference.ai.azure.com/images/generations'
      : 'https://models.inference.ai.azure.com/chat/completions';

    const body = isImage
      ? {
          model: model,
          prompt: 'A beautiful sunset over the mountains',
          n: 1,
          size: '1024x1024'
        }
      : {
          model: model,
          messages: [{ role: 'user', content: 'Say hello!' }]
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log('Status:', response.status);
      
      if (response.ok) {
        if (isImage) {
          console.log('Success! Image URL:', data.data?.[0]?.url);
        } else {
          console.log('Success! Response:', data.choices?.[0]?.message?.content);
        }
      } else {
        console.error('Error Response:', JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('Fetch Error:', error.message);
    }
  }
}

testGitHubDirect();
