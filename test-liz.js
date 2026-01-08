
async function checkLiz() {
  const response = await fetch('https://lizley.zeabur.app/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-d38705df52b386e905f257a4019f8f2a'
    },
    body: JSON.stringify({
      model: 'gemini-2.5-pro',
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 5
    })
  });
  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response:', text.substring(0, 500));
}
checkLiz();
