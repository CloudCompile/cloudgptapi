
async function listLizModels() {
  const providerUrl = 'https://lizley.zeabur.app/v1/models';
  const providerApiKey = 'sk-946715b46e8fcd676f8cc5d4e9c80a51'; // From .env.local

  console.log(`Fetching models from Liz at ${providerUrl}...`);
  try {
    const response = await fetch(providerUrl, {
      headers: {
        'Authorization': `Bearer ${providerApiKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Available Models:');
      if (data.data) {
        data.data.forEach((m: any) => console.log(`- ${m.id}`));
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    } else {
      const errorText = await response.text();
      console.error(`Error ${response.status}: ${errorText}`);
    }
  } catch (err: any) {
    console.error('Fetch error:', err.message);
  }
}

listLizModels();
