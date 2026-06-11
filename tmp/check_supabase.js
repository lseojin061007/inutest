const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkConnection() {
  console.log('Checking Supabase connection and tables...');
  
  // Fetch tables from public schema
  const { data: tables, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .filter('schemaname', 'eq', 'public');

  if (error) {
    // If pg_tables is not accessible (standard for anon/service role sometimes via API),
    // try another way or just try to list some common things.
    // Actually, via PostgREST we can't easily query pg_tables unless specifically exposed.
    // Let's try to query the REST API directly for the schema if possible,
    // or just try a simple query to see if it works.
    
    console.log('Note: Direct pg_tables query might be restricted via API.');
  }

  // Best way to see tables via API is often checking specific tables or using a RPC if defined.
  // However, Supabase's API doesn't have a "list tables" endpoint by default that is public.
  // BUT, we can try to use a SQL query through an RPC if the user has one, 
  // or more simply, check if there's any data in known tables or just check connection.
  
  // Let's try a generic query to see if the client is valid.
  const { data, error: healthError } = await supabase.from('_non_existent_table_just_to_check_connection').select('*').limit(1);
  
  if (healthError && healthError.code === 'PGRST116') {
      // This is a "no rows found" or similar, but meant the connection worked.
      console.log('Connection successful.');
  } else if (healthError && healthError.message.includes('relation') && healthError.message.includes('does not exist')) {
      console.log('Connection successful (Table not found as expected).');
  } else if (healthError) {
      console.error('Connection failed:', healthError.message);
      process.exit(1);
  } else {
      console.log('Connection successful.');
  }

  // Attempt to list tables using a query that might work if permissions allow or if we use the right approach.
  // Since we have the service role key, we can use it to query information_schema or similar if enabled.
  
  // Try to get table list using information_schema via a trick or standard query if possible.
  // Actually, without a custom RPC, we can't easily "SQL" from the JS client for schema info.
  // Let's try to fetch from a 'diaries' table or something that might exist based on the prompt's context.
  
  const { data: diaryTest, error: diaryError } = await supabase.from('diaries').select('*').limit(1);
  if (!diaryError) {
      console.log('Found table: diaries');
  } else {
      console.log('Table "diaries" not found or not accessible.');
  }
}

checkConnection();
