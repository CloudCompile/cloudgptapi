
async function testGeminiLarge() {
  console.log('Testing gemini-large on Pollinations...');
  try {
    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-large',
        messages: [{ role: 'user', content: 'Say "Working"' }],
        max_tokens: 5
      })
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data).substring(0, 200));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
testGeminiLarge();
