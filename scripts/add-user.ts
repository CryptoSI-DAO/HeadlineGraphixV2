import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'not set');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'set' : 'not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

function getArgValue(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function addUser() {
  const email =
    getArgValue('--email') ||
    process.env.NEW_USER_EMAIL ||
    process.env.SEED_USER_EMAIL;
  const password =
    getArgValue('--password') ||
    process.env.NEW_USER_PASSWORD ||
    process.env.SEED_USER_PASSWORD;

  if (!email || !password) {
    console.error('Missing required user credentials.');
    console.error(
      'Provide --email and --password flags or set NEW_USER_EMAIL and NEW_USER_PASSWORD.'
    );
    process.exit(1);
  }

  console.log('Creating user with email:', email);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm the email so user can sign in immediately
  });

  if (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }

  console.log('User created successfully!');
  console.log('User ID:', data.user?.id);
  console.log('Email:', data.user?.email);
  console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
}

addUser().catch(err => {
  console.error('Failed to add user:', err);
  process.exit(1);
});
