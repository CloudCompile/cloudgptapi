
import { validateApiKey } from './lib/api-keys.ts';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  const key = process.argv[2] || 'cgpt_822b7637a03648abb9d59e460c1fe921';
  console.log(`Testing validation for key: ${key}`);
  
  try {
    const result = await validateApiKey(key);
    if (result) {
      console.log('Validation SUCCESS:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error('Validation FAILED: validateApiKey returned null');
    }
  } catch (err: any) {
    console.error('Validation ERROR:', err.message);
  }
}

test();
