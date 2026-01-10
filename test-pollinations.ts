
async function testPollinations() {
  const url = 'https://text.pollinations.ai/v1/chat/completions';
  const keys = [
    'sk_v36iYt2n9Xm4PqW7zR5bL8kH1jD0vS9u',
    'sk_dk0IDDUCHuz2RUyEZtAJ668NKMd6d5Vv'
  ];

  for (const key of keys) {
    console.log(`\nTesting Pollinations Key: ${key.substring(0, 10)}...`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'openai',
          messages: [{ role: 'user', content: 'hi' }]
        })
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}`);
    } catch (err: any) {
      console.error('Error:', err.message);
    }
  }
}

testPollinations();
