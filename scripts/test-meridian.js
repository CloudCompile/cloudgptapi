
async function test() {
  const retrieveUrl = 'https://meridianlabsapp.website/api/retrieve';
  const rememberUrl = 'https://meridianlabsapp.website/api/remember';
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'ps_6od22i7ddomt18c1jyk9hm',
    'x-user-id': 'test-user'
  };

  try {
    console.log('--- Testing Remember ---');
    const rememberResponse = await fetch(rememberUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt: 'My favorite color is blue', response: 'I will remember that your favorite color is blue.' })
    });
    console.log('Remember Status:', rememberResponse.status);
    const rememberData = await rememberResponse.json();
    console.log('Remember Data:', rememberData);

    console.log('\n--- Testing Retrieve ---');
    const retrieveResponse = await fetch(retrieveUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: 'What is my favorite color?' })
    });
    console.log('Retrieve Status:', retrieveResponse.status);
    const retrieveData = await retrieveResponse.json();
    console.log('Retrieve Data:', retrieveData);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
