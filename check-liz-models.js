
async function checkModels() {
  const response = await fetch('https://lizley.zeabur.app/v1/models', {
    headers: {
      'Authorization': 'Bearer sk-d38705df52b386e905f257a4019f8f2a'
    }
  });
  const data = await response.json();
  const geminiModels = data.data
    .filter(m => m.id.toLowerCase().includes('gemini'))
    .map(m => m.id);
  console.log('Gemini Models:', geminiModels);
}
checkModels();
