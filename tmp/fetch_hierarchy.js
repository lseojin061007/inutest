const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env.local manually
const envPath = path.resolve(__dirname, '../env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getHierarchy() {
  console.log('Fetching hierarchy with quoted columns...');
  // Quoting column names that contain parentheses
  const { data, error } = await supabase
    .from('inucourse2')
    .select('"대학(원)", "학과(부)"');

  if (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }

  const hierarchy = {};
  data.forEach(item => {
    const univ = item['대학(원)'];
    const dept = item['학과(부)'];
    if (univ) {
        if (!hierarchy[univ]) hierarchy[univ] = new Set();
        if (dept) hierarchy[univ].add(dept);
    }
  });

  const result = {};
  for (const univ in hierarchy) {
    result[univ] = Array.from(hierarchy[univ]).sort();
  }

  fs.writeFileSync(path.resolve(__dirname, '../tmp/hierarchy.json'), JSON.stringify(result, null, 2));
  console.log('Hierarchy saved success');
}

getHierarchy();
