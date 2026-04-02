const fs = require('fs');

let t = fs.readFileSync('app/v1/chat/completions/services/dispatcher.ts', 'utf-8');

const startMatch = /if \(model\.provider === 'openrouter'\) \{/;
const startIdx = t.search(startMatch);
const endIdx = t.indexOf('const headers:', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newBlock = `if (model.provider === 'pollinations') {
    providerUrl = \`\${PROVIDER_URLS.pollinations}/v1/chat/completions\`;
    providerApiKey = getPollinationsApiKey();
    if (!providerApiKey) {
      console.warn(\`[\${requestId}] Missing Pollinations API key for model: \${modelId}\`);
      return NextResponse.json(
        { error: { message: 'Pollinations API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } else if (model.provider === 'kivest') {
    console.warn(\`[\${requestId}] Kivest provider is temporarily disabled\`);
    return NextResponse.json(
      { error: { message: 'Kivest provider is temporarily unavailable. Please try another model.', type: 'provider_error', param: null, code: 'provider_disabled', request_id: requestId } },
      { status: 503, headers: getCorsHeaders() }
    );
  } else if (model.provider === 'shalom') {
    providerUrl = \`\${PROVIDER_URLS.shalom}/chat/completions\`;
    providerApiKey = getShalomApiKey();
    if (!providerApiKey) {
      console.warn(\`[\${requestId}] Missing Shalom API key for model: \${modelId}\`);
      return NextResponse.json(
        { error: { message: 'Shalom/Bluesmind API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } else {
    // Fallback or Unknown provider
    return NextResponse.json(
      { error: { message: 'Unsupported provider: ' + model.provider, type: 'config_error', param: null, code: 'unsupported_provider', request_id: requestId } },
      { status: 400, headers: getCorsHeaders() }
    );
  }

  `;
  
  t = t.substring(0, startIdx) + newBlock + t.substring(endIdx);
  fs.writeFileSync('app/v1/chat/completions/services/dispatcher.ts', t);
  console.log('Dispatcher cleaned up!');
} else {
  console.log('Could not find bounds in dispatcher.ts');
}
