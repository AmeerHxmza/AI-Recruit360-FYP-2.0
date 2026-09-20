// Browser regression for the actual compiled AuthProvider. Synthetic cookie/data only.
const { createRequire }=require('node:module');
const req=createRequire(require('node:path').resolve('frontend/package.json'));
const {chromium}=req('@playwright/test');
const {loadEnvConfig}=req('@next/env');
const assert=require('node:assert/strict');
loadEnvConfig(require('node:path').resolve('frontend'));
const host=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
const project=host.split('.')[0];
const enc=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const user={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',aud:'authenticated',role:'authenticated',email:'fixture@example.test',app_metadata:{provider:'email'},user_metadata:{full_name:'Fixture Recruiter'},created_at:'2026-01-01T00:00:00Z'};
const expires=Math.floor(Date.now()/1000)+3600;
const token=enc({alg:'HS256',typ:'JWT'})+'.'+enc({sub:user.id,exp:expires,role:'authenticated'})+'.fixture';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const context=await browser.newContext();
  const value='base64-'+Buffer.from(JSON.stringify({access_token:token,refresh_token:'fixture',token_type:'bearer',expires_in:3600,expires_at:expires,user})).toString('base64url');
  await context.addCookies([{name:`sb-${project}-auth-token`,value,domain:'localhost',path:'/'}]);
  const requests={profiles:0,organization_members:0};
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.hostname===host){
    const table=url.pathname.split('/').pop();
    if(table in requests){requests[table]++;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(table==='profiles'?{id:user.id,full_name:'Fixture Recruiter'}:[{id:'member',user_id:user.id,organization_id:'org',role:'owner',organizations:{id:'org',name:'Fixture Workspace'}}])});return;}
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)});return;
   }
   if(url.hostname!=='localhost'||['/login','/signup'].includes(url.pathname))return route.abort();
   return route.continue();
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3100/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('h1')?.textContent.includes('hiring decision'));
  assert.deepEqual(requests,{profiles:1,organization_members:1},'one profile and membership request on initial session');
  assert.deepEqual(errors,[]);
  console.log('PASS browser auth startup: one profile + one membership request, no callback hang');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
