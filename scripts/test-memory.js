
async function testMemory() {
  const url = 'http://localhost:3000/v1/chat/completions';
  
  // Test with User A
  const userIdA = 'user-A-' + Math.random().toString(36).substring(7);
  console.log(`\n=== Testing User A: ${userIdA} ===`);
  
  await sendMessage(url, userIdA, 'My name is Alice and I love hiking.', 'Alice');
  await new Promise(r => setTimeout(r, 2000));
  await checkMemory(url, userIdA, 'What is my name and what do I love?');

  // Test with User B
  const userIdB = 'user-B-' + Math.random().toString(36).substring(7);
  console.log(`\n=== Testing User B: ${userIdB} ===`);
  
  await sendMessage(url, userIdB, 'My name is Bob and I am a chef.', 'Bob');
  await new Promise(r => setTimeout(r, 2000));
  await checkMemory(url, userIdB, 'What is my name and what is my profession?');
  
  // Verify User A still has her own memory
  console.log(`\n=== Re-verifying User A: ${userIdA} ===`);
  await checkMemory(url, userIdA, 'Do you remember my name?');
}

async function sendMessage(url, userId, content, label) {
  console.log(`[${label}] Sending: ${content}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({
      model: 'meridian',
      messages: [{ role: 'user', content }]
    })
  });
  const data = await res.json();
  if (data.error) {
    console.error(`[${label}] Error:`, JSON.stringify(data.error, null, 2));
    process.exit(1);
  }
  console.log(`[${label}] Response:`, data.choices[0].message.content);
}

async function checkMemory(url, userId, content) {
  console.log(`[Check] Asking: ${content}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({
      model: 'meridian',
      messages: [{ role: 'user', content }]
    })
  });
  const data = await res.json();
  if (data.error) {
    console.error(`[Check] Error:`, JSON.stringify(data.error, null, 2));
    process.exit(1);
  }
  console.log(`[Check] Memory Result:`, data.choices[0].message.content);
}

testMemory();
