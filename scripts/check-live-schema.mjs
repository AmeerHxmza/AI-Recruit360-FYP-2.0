import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const env = Object.fromEntries(readFileSync(new URL('../frontend/.env.local',import.meta.url),'utf8').split(/\r?\n/).filter(line => /^[A-Z_]+=/.test(line)).map(line => { const i=line.indexOf('='); return [line.slice(0,i),line.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]; }));
const url=env.NEXT_PUBLIC_SUPABASE_URL;
const key=env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.log('Schema check unavailable: Supabase configuration missing.'); process.exit(0); }
try {
  const response=await fetch(`${url}/rest/v1/`,{headers:{apikey:key,Authorization:`Bearer ${key}`,Accept:'application/openapi+json'},signal:AbortSignal.timeout(15000)});
  if(!response.ok) throw new Error(`Schema request returned HTTP ${response.status}`);
  const schema=await response.json();
  const requiredFunctions = ['workspace_dashboard', 'search_workspace_applications', 'save_screening_result', 'save_final_evaluation'];
  const missing = requiredFunctions.filter(name => !schema.paths?.[`/rpc/${name}`]);
  if (missing.length) {
    console.error(`Database setup incomplete. Missing API functions: ${missing.join(', ')}. Apply pending migrations 02–07 in order; see supabase/README.md. Do not reset existing data.`);
    process.exitCode = 1;
  }
  const tables=Object.fromEntries(Object.entries(schema.definitions || {}).map(([name,definition]) => [name,Object.keys(definition.properties || {})]));
  mkdirSync(new URL('../.artifacts/',import.meta.url), {recursive:true});
  writeFileSync(new URL('../.artifacts/schema-inventory.json',import.meta.url),JSON.stringify(tables,null,2)+'\n');
  console.log(`Read-only schema inventory saved: ${Object.keys(tables).length} tables. No records read or modified.`);
} catch(error) { console.log('Read-only schema check:',error.message); process.exitCode = 1; }
