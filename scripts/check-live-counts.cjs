// Read-only verification of aggregate query support. Never prints records or credentials.
const {createRequire}=require('node:module');const req=createRequire(require('node:path').resolve('frontend/package.json'));
req('@next/env').loadEnvConfig(require('node:path').resolve('frontend'));
const {createClient}=req('@supabase/supabase-js');const assert=require('node:assert/strict');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
(async()=>{
 const org=await db.from('organizations').select('id').limit(1).single();if(org.error)throw new Error('Organization lookup failed: '+org.error.code);
 const id=org.data.id;
 const jobs=await db.from('organizations').select('total:jobs(count),active:jobs(count),draft:jobs(count),paused:jobs(count),closed:jobs(count)').eq('id',id).eq('active.status','active').eq('draft.status','draft').eq('paused.status','paused').eq('closed.status','closed').single();
 if(jobs.error)throw new Error('Job aggregate failed: '+jobs.error.code);
 const jobTotal=await db.from('jobs').select('id',{count:'exact',head:true}).eq('organization_id',id);assert.equal(jobTotal.error,null);assert.equal(jobs.data.total[0].count,jobTotal.count);
 const since=new Date(Date.now()-7*86400000).toISOString();
 const candidates=await db.from('organizations').select('total:candidates(count),located:candidates(count),linked:candidates(count),recent:candidates(count)').eq('id',id).not('located.location','is',null).neq('located.location','').not('linked.linkedin_url','is',null).neq('linked.linkedin_url','').gte('recent.created_at',since).single();
 if(candidates.error)throw new Error('Candidate aggregate failed: '+candidates.error.code);
 const candidateTotal=await db.from('candidates').select('id',{count:'exact',head:true}).eq('organization_id',id);assert.equal(candidateTotal.error,null);assert.equal(candidates.data.total[0].count,candidateTotal.count);
 const job=await db.from('jobs').select('id,applicants:applications(count),qualified:applications(count)').eq('organization_id',id).in('qualified.status',['assessment','interview','evaluation','shortlisted','hired']).limit(1);
 if(job.error)throw new Error('Application aggregate failed: '+job.error.code);
 if(job.data.length){const total=await db.from('applications').select('id',{count:'exact',head:true}).eq('job_id',job.data[0].id).eq('organization_id',id);assert.equal(total.error,null);assert.equal(job.data[0].applicants[0].count,total.count);}
 console.log('PASS live read-only aggregate totals match exact HEAD counts; no records modified');
})().catch(e=>{console.error(e.message);process.exitCode=1});
