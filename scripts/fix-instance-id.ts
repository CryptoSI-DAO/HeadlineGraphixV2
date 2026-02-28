import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function fixInstanceId() {
  const userEmail = 'cryptosi@protonmail.com';
  const correctId = '2732abe0-5cf3-49b3-8588-9a34adff5dd8';
  
  console.log('Fixing instance_id for user:', userEmail);
  console.log('User ID:', correctId);
  
  // First, let's check the current state
  const { data: currentUser, error: fetchError } = await supabase
    .from('auth.users')
    .select('id, instance_id, email')
    .eq('id', correctId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching current user data:', fetchError);
    console.log('This might be expected since auth.users is a system table');
  } else {
    console.log('Current user data:', currentUser);
  }
  
  // Try to update using SQL (this requires admin access)
  console.log('Attempting to fix with SQL...');
  console.log('Manual SQL to run in Supabase dashboard SQL editor:');
  console.log(`UPDATE auth.users SET instance_id = '${correctId}' WHERE id = '${correctId}';`);
  console.log('');
  console.log('Alternatively, you can run this in the Supabase dashboard:');
  console.log('1. Go to Authentication > Users');
  console.log('2. Find the user with email cryptosi@protonmail.com');
  console.log('3. Check if there\'s an option to edit the instance_id');
  console.log('4. If not, use the SQL editor with the command above');
}

fixInstanceId().catch(console.error);