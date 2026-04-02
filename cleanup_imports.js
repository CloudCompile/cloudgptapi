const fs = require('fs');
let code = fs.readFileSync('app/v1/chat/completions/services/dispatcher.ts', 'utf8');

code = code.replace(/import \{ handleStableHordeChat \} from '\.\/stablehorde';\n/, '');
code = code.replace(/getOpenRouterApiKey,\s*/, '');
code = code.replace(/getMeridianApiKey,\s*/, '');

fs.writeFileSync('app/v1/chat/completions/services/dispatcher.ts', code);
console.log('Fixed imports');
