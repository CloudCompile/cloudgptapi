const fs = require('fs');

let t = fs.readFileSync('app/v1/chat/completions/services/dispatcher.ts', 'utf-8');

t = t.replace(/if \(model\.provider === 'meridian'\) \{[\s\S]*?\}\s*if/g, 'if');
t = t.replace(/if \(model\.provider === 'openrouter'\) \{[\s\S]*?\}\s*if/g, 'if');
t = t.replace(/\} else if \(model\.provider === 'stablehorde'\) \{[\s\S]*?\}\s*else/g, '} else');
t = t.replace(/if \(model\.provider === 'meridian'\) \{[\s\S]*?\} else if/g, 'if');

fs.writeFileSync('app/v1/chat/completions/services/dispatcher.ts', t);
console.log('Finished sweeping dispatcher.ts');
