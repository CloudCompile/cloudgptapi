
import { validateApiKey } from './lib/api-keys';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  const key = process.argv[2] || 'cgpt_8aae2b6f6e7242b59271fdff389e3fe0';
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
