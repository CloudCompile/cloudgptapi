
async function checkPollinations() {
  const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-2.5-pro',
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 5
    })
  });
  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response:', text.substring(0, 200));
}
checkPollinations();
