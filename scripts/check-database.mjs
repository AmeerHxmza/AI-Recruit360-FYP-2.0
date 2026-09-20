import { createRequire } from 'node:module';
const frontendRequire = createRequire(new URL('../frontend/package.json', import.meta.url));
const { PGlite } = frontendRequire('@electric-sql/pglite');
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// Isolated PostgreSQL engine. Supabase-managed auth/storage are stubbed; no network.
const db = new PGlite();
process.on('uncaughtException', async error => { console.error(error.message, error.detail || '', error.where || ''); await db.close(); process.exit(1); });
await db.exec(`CREATE SCHEMA auth; CREATE SCHEMA storage; CREATE SCHEMA extensions;
CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE TABLE auth.users(id UUID PRIMARY KEY, raw_user_meta_data JSONB, email TEXT);
CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE FUNCTION auth.role() RETURNS TEXT LANGUAGE sql STABLE AS $$ SELECT current_user::text $$;
CREATE TABLE storage.buckets(id TEXT PRIMARY KEY,name TEXT,public BOOLEAN,file_size_limit BIGINT,allowed_mime_types TEXT[]);
CREATE TABLE storage.objects(id UUID DEFAULT gen_random_uuid(),bucket_id TEXT,name TEXT);
CREATE FUNCTION storage.foldername(TEXT) RETURNS TEXT[] LANGUAGE sql AS $$ SELECT string_to_array($1,'/') $$;`);
for (const file of ['01_schema.sql','02_data_contract.sql','03_candidate_submission.sql','04_assessment_integrity.sql','05_pipeline_persistence.sql','06_dashboard.sql','07_application_search.sql','08_function_permissions.sql','09_performance_indexes.sql']) {
  const sql = readFileSync(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8').replace(/^CREATE EXTENSION .*;$/gm, '');
  try {
    await db.exec(sql); console.log(`PASS migration ${file}`);
    if (file === '01_schema.sql') {
      await db.exec(`INSERT INTO auth.users(id,email) VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','owner@example.test');
      INSERT INTO organizations(id,name,slug) VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Legacy workspace','legacy');
      INSERT INTO organization_members(organization_id,user_id,role) VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','viewer');
      INSERT INTO jobs(id,organization_id,title,slug,description) VALUES ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Existing role','existing-role','Existing description');
      INSERT INTO candidates(id,organization_id,full_name,email) VALUES ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Existing person','existing@example.test');
      INSERT INTO applications(id,organization_id,job_id,candidate_id) VALUES ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','cccccccc-cccc-4ccc-8ccc-cccccccccccc','dddddddd-dddd-4ddd-8ddd-dddddddddddd');
      INSERT INTO candidate_documents(organization_id,application_id,candidate_id,file_name,file_type,file_size,storage_path,extracted_text) VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','dddddddd-dddd-4ddd-8ddd-dddddddddddd','legacy.pdf','application/pdf',100,'legacy/path.pdf','Existing resume evidence');`);
      if (process.argv.includes('--current-layout')) await db.exec(`
        ALTER TABLE candidate_documents RENAME COLUMN file_name TO original_filename;
        ALTER TABLE candidate_documents RENAME COLUMN file_type TO mime_type;
        ALTER TABLE assessment_questions RENAME COLUMN question_text TO question;
        ALTER TABLE assessment_questions DROP COLUMN options;
        ALTER TABLE assessment_answers RENAME COLUMN time_spent_seconds TO time_taken_seconds;
        ALTER TABLE interview_responses RENAME COLUMN candidate_response_text TO response_text;
        ALTER TABLE interview_responses RENAME COLUMN feedback TO ai_feedback;
        ALTER TABLE final_evaluations RENAME COLUMN executive_summary TO ai_summary;
        ALTER TABLE assessments DROP COLUMN passed;
      `);
    }
  }
  catch (error) { console.error(`FAIL ${file}: ${error.message}`); process.exitCode = 1; await db.close(); process.exit(1); }
}
const job = '11111111-1111-4111-8111-111111111111';
const org = '22222222-2222-4222-8222-222222222222';
await db.exec(`INSERT INTO organizations(id,name,slug) VALUES ('${org}','Test','test'); INSERT INTO jobs(id,organization_id,title,slug,department,location,description) VALUES ('${job}','${org}','Engineer','engineer','Engineering','Remote','Build software');`);
const payload = { job_id: job, submission_key: '33333333-3333-4333-8333-333333333333', full_name: 'Test Candidate', email: 'candidate@example.test', phone: '12345678', storage_path: `${org}/test.pdf`, original_filename: 'test.pdf', mime_type: 'application/pdf', file_size: 100 };
const submit = () => db.query('SELECT submit_candidate_application($1::jsonb) AS result', [JSON.stringify(payload)]);
const first = (await submit()).rows[0].result;
assert.ok(first.application_id); assert.ok(first.candidate_id);
assert.deepEqual((await submit()).rows[0].result, first);
assert.equal((await db.query('SELECT count(*)::int AS n FROM applications')).rows[0].n, 2);
console.log('PASS submission is atomic and retry-safe');
const legacy = (await db.query("SELECT original_filename,extracted_text FROM candidate_documents WHERE original_filename='legacy.pdf'")).rows[0];
assert.equal(legacy.original_filename,'legacy.pdf'); assert.equal(legacy.extracted_text,'Existing resume evidence');
console.log('PASS existing resume records and evidence preserved');
await assert.rejects(db.query('SELECT submit_candidate_application($1::jsonb)', [JSON.stringify({...payload,submission_key:'44444444-4444-4444-8444-444444444444'})]), /already exists/);
assert.equal((await db.query('SELECT count(*)::int AS n FROM candidates')).rows[0].n,2);
console.log('PASS duplicate email/job does not create partial records');
const screening = {match_score:80,skills_score:80,experience_score:80,education_score:80,keyword_score:80,recommendation:'match',matched_skills:['SQL'],missing_skills:[],matched_experience:[],missing_requirements:[],evidence:[],reasoning_summary:'Relevant SQL experience'};
await db.query('SELECT save_screening_result($1,$2,true)',[first.application_id,JSON.stringify(screening)]);
assert.equal((await db.query('SELECT status FROM applications WHERE id=$1',[first.application_id])).rows[0].status,'assessment');
const assessment=(await db.query("INSERT INTO assessments(application_id,organization_id,status,total_questions) VALUES ($1,$2,'in_progress',2) RETURNING id",[first.application_id,org])).rows[0].id;
const questions=(await db.query("INSERT INTO assessment_questions(assessment_id,question_number,question,option_a,option_b,option_c,option_d,correct_option,presented_at) VALUES ($1,1,'First?','Yes','No','Maybe','Unknown','A',now()),($1,2,'Second?','Yes','No','Maybe','Unknown','B',now()-interval '70 seconds') RETURNING id",[assessment])).rows;
await assert.rejects(db.query('SELECT finish_assessment($1,60)',[assessment]), /every question/);
await assert.rejects(db.query("SELECT record_assessment_answer($1,$2,'B')",[assessment,questions[1].id]), /previous question/);
await assert.rejects(db.query("SELECT record_assessment_answer($1,$2,'A')",[assessment,job]), /does not belong/);
await db.query("SELECT record_assessment_answer($1,$2,'A')",[assessment,questions[0].id]);
await db.query("SELECT record_assessment_answer($1,$2,'D')",[assessment,questions[0].id]);
await db.query("SELECT record_assessment_answer($1,$2,'B')",[assessment,questions[1].id]);
const result=(await db.query('SELECT finish_assessment($1,60) AS result',[assessment])).rows[0].result;
assert.equal(result.score,50); assert.equal(result.passed,false);
assert.equal((await db.query('SELECT count(*)::int AS n FROM assessment_answers')).rows[0].n,2);
console.log('PASS question ownership, ordering, server deadline, duplicate answer and finalization');
// Fixture for interview persistence; no remote state is involved.
await db.query("UPDATE applications SET status='interview' WHERE id=$1",[first.application_id]);
await db.query("UPDATE assessments SET score=100,percentage=100,passed=true WHERE id=$1",[assessment]);
const interview=(await db.query("INSERT INTO interviews(application_id,organization_id,status,total_questions) VALUES ($1,$2,'in_progress',2) RETURNING id",[first.application_id,org])).rows[0].id;
const interviewQuestions=(await db.query("INSERT INTO interview_questions(interview_id,question_number,question_text,question_type) VALUES ($1,1,'Explain a project','technical'),($1,2,'Explain a tradeoff','technical') RETURNING id",[interview])).rows;
const scores={technical_score:60,communication_score:60,relevance_score:60,feedback:'Fixture feedback'};
const saveAnswer=(question,scoresOverride=scores)=>db.query('SELECT save_interview_response($1,$2,$3,$4) AS result',[interview,question,'A concrete answer',JSON.stringify(scoresOverride)]);
await assert.rejects(saveAnswer(job),/does not belong/);
await assert.rejects(saveAnswer(interviewQuestions[1].id),/previous question/);
await saveAnswer(interviewQuestions[0].id);
assert.deepEqual((await saveAnswer(interviewQuestions[0].id,{...scores,technical_score:100})).rows[0].result,scores);
await saveAnswer(interviewQuestions[1].id);
const storedInterview=(await db.query('SELECT status,overall_score FROM interviews WHERE id=$1',[interview])).rows[0];
assert.equal(storedInterview.status,'completed'); assert.equal(Number(storedInterview.overall_score),60);
const evaluation={cv_score:80,assessment_score:100,interview_score:60,overall_score:78,recommendation:'hire',strengths:[],weaknesses:[],evidence:[],ai_summary:'Test summary'};
await db.query('SELECT save_final_evaluation($1,$2)',[first.application_id,JSON.stringify(evaluation)]);
await db.query("UPDATE applications SET status='shortlisted' WHERE id=$1",[first.application_id]);
await db.query('SELECT save_final_evaluation($1,$2)',[first.application_id,JSON.stringify({...evaluation,overall_score:0})]);
assert.equal((await db.query('SELECT status FROM applications WHERE id=$1',[first.application_id])).rows[0].status,'shortlisted');
assert.equal(Number((await db.query('SELECT overall_score FROM final_evaluations WHERE application_id=$1',[first.application_id])).rows[0].overall_score),78);
console.log('PASS interview ownership, answer retries, atomic scorecard and preserved recruiter decision');
await db.exec(`GRANT USAGE ON SCHEMA public,auth TO authenticated; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
SET ROLE authenticated; SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';`);
const visible=(await db.query('SELECT id FROM applications')).rows;
assert.equal(visible.length,1); assert.equal(visible[0].id,'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
const updated=await db.query("UPDATE jobs SET title='Unauthorized change' RETURNING id"); assert.equal(updated.rows.length,0);
await assert.rejects(db.query('SELECT workspace_dashboard($1)',[org]), /access denied/);
await assert.rejects(db.query('SELECT submit_candidate_application($1::jsonb)',[JSON.stringify(payload)]), /permission denied/);
const dashboard=(await db.query("SELECT workspace_dashboard('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') AS result")).rows[0].result;
assert.equal(dashboard.metrics.totalApplications,1);
const search=(await db.query("SELECT search_workspace_applications('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','All','Existing person',1,50) AS result")).rows;
assert.equal(search.length,1); assert.equal(search[0].result.candidateName,'Existing person');
await db.exec('RESET ROLE');
console.log('PASS tenant isolation, viewer restrictions and private RPC access');
await db.close();
