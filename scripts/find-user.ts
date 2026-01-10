
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase config');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findUser(query: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`email.eq.${query},id.eq.${query}`)
    .maybeSingle();

  if (error) {
    console.error('Error searching for user:', error.message);
    return;
  }

  if (!profile) {
    console.log(`No user found matching: ${query}`);
    return;
  }

  console.log('User found:', profile);
}

const query = process.argv[2] || 'kyhas@hotmail.co.uk';
findUser(query);
