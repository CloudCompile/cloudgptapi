async function testGLM5() {
  const apiKey = 'cgpt_a17273722c99488181a4a342795e8d00';
  const model = 'glm-5';
  
  console.log(`Testing GLM-5 streaming...`);
  
  const response = await fetch('http://localhost:3000/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: 'Say hello!' }
      ],
      stream: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error:', response.status, errorText);
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    console.error('No reader');
    return;
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log('CHUNK:', chunk);
  }
}

testGLM5();
