/* Isolated auth regressions: no network, credentials, or real user records. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {createRequire} = require('node:module');
const req = createRequire(require('node:path').resolve('frontend/package.json'));
const ts = req('typescript');
function load(file, mocks) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports = {};
  vm.runInNewContext(source,{exports,require:name=>{if(name in mocks)return mocks[name];throw new Error('Unexpected import '+name);},process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://test.invalid',NEXT_PUBLIC_SUPABASE_ANON_KEY:'fixture'}},console,Headers,URL});
  return exports;
}
function cache(fn) { const values=new Map();return (...args)=>{const key=JSON.stringify(args);if(!values.has(key))values.set(key,fn(...args));return values.get(key);}; }
function fixture(valid=true) {
  const calls={auth:0,profiles:0,organization_members:0};
  const db={auth:{getUser:async()=>{calls.auth++;return {data:{user:valid?{id:'real-user',email:'test@example.test',user_metadata:{}}:null},error:valid?null:new Error('unauthorized')};}},from(table){calls[table]++;const result={data:table==='profiles'?{id:'real-user',full_name:'Test Recruiter'}:[{id:'member',user_id:'real-user',organization_id:'org-a',role:'viewer',organizations:{id:'org-a',name:'Workspace'}}]};const query={select(){return query},eq(){return query},single:async()=>result,then(resolve){return Promise.resolve(result).then(resolve)}};return query;}};
  const session=load('frontend/lib/auth/session.ts',{'react':{cache},'next/headers':{cookies:async()=>({get:()=>({value:'org-a'})}),headers:async()=>({get:()=> 'forged-user'})},'@/lib/supabase/server':{createClient:async()=>db},'@/lib/utils/errors':{AuthError:Error,ForbiddenError:Error,NotFoundError:Error}});
  return {session,calls,db};
}
(async()=>{
  const denied=fixture(false);
  await assert.rejects(denied.session.getCurrentUser(),/Authentication required/);
  assert.equal(denied.calls.auth,1,'request identity headers cannot bypass verification');
  const {session,calls}=fixture();
  const [implicit,explicit,role]=await Promise.all([session.getOrganizationContext(),session.getOrganizationContext('org-a'),session.getCurrentRole('org-a')]);
  assert.equal(implicit.user.id,'real-user');assert.equal(explicit.organization.id,'org-a');assert.equal(role,'viewer');
  assert.equal(await session.getOrganizationContext('other-org'),null);
  await assert.rejects(session.getCurrentRole('other-org'),/Access denied/);
  assert.deepEqual(calls,{auth:1,profiles:1,organization_members:1},'same request shares verified context across page/services');
  const {NextRequest,NextResponse}=req('next/server');
  let membershipQueries=0;
  const db={auth:{getUser:async()=>({data:{user:{id:'real-user'}}})},from(){membershipQueries++;const q={select:()=>q,eq:()=>q,limit:async()=>({data:[],error:null})};return q;}};
  const {proxy}=load('frontend/proxy.ts',{'@supabase/ssr':{createServerClient:()=>db},'next/server':{NextResponse}});
  const result=await proxy(new NextRequest('https://example.test/login',{headers:{cookie:'air360_org_id=forged-org','x-user-id':'forged-user'}}));
  assert.equal(new URL(result.headers.get('location')).pathname,'/onboarding/organization');assert.equal(membershipQueries,1);
  let jobQueries = 0;
  const query = {select(columns){assert.ok(columns.includes('applications(count)'));return query;},in(){return query;},eq(){return query;},order(){return query;},limit(){return query;},then(resolve){return Promise.resolve({data:[{id:'job',applicants:[{count:1501}],qualified:[{count:1200}]}],error:null}).then(resolve);}};
  const jobsService = load('frontend/lib/services/job-service.ts', {
    '@/lib/supabase/server': {createClient:async()=>({from(table){assert.equal(table,'jobs');jobQueries++;return query;}})},
    '@/lib/auth/session': {}, '@/lib/auth/permissions': {}, '@/lib/utils/validation': {},
    '@/lib/utils/errors': {DatabaseError:Error,NotFoundError:Error,ForbiddenError:Error},
    '@/lib/performance/logger': {measurePerformance:async(_,fn)=>({result:await fn()})},
  });
  const jobs = await jobsService.getJobsForOrg('org-a');
  assert.equal(jobQueries,1);assert.equal(jobs[0].applicantsCount,1501);assert.equal(jobs[0].qualifiedCount,1200);
  console.log('PASS job counts above 1000 use one aggregate request');
  console.log('PASS verified identity, request deduplication, workspace isolation, stale-cookie redirects');
})().catch(error=>{console.error(error);process.exitCode=1;});
