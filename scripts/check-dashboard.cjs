// Visual fixture only: render the actual workspace components without a live account.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const frontend = path.join(root, 'frontend');
const localRequire = Module.createRequire(path.join(frontend, 'package.json'));
const ts = localRequire('typescript');
const React = localRequire('react');
const { renderToStaticMarkup } = localRequire('react-dom/server');
const { chromium } = localRequire('@playwright/test');
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if(request==='next/navigation') return {usePathname:()=>'/dashboard',useRouter:()=>({push(){},refresh(){}})};
  if(request==='next/link') return ({href,children,...props})=>React.createElement('a',{href,...props},children);
  if(request==='@/providers/auth-provider') return {useAuth:()=>({user:{id:'fixture'},loading:false,userMetadata:{fullName:'Demo Recruiter',role:'owner'},organization:{id:'fixture',name:'Example workspace'},organizations:[{id:'fixture',name:'Example workspace'}],signOut:async()=>{},switchOrganization:async()=>{}})};
  return originalLoad.call(this,request.startsWith('@/') ? path.join(frontend,request.slice(2)) : request,parent,isMain);
};
for(const extension of ['.ts','.tsx']) Module._extensions[extension]=(module,filename)=>{
  const source=fs.readFileSync(filename,'utf8');
  const output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  module._compile(output,filename);
};
const { ApplicationShell }=localRequire('./components/layout/application-shell.tsx');
const { DashboardClientView }=localRequire('./components/dashboard/dashboard-client-view.tsx');
const fixture={metrics:{activeJobs:4,totalApplications:32,qualifiedCandidates:18,aiInterviews:9},funnel:{applied:32,screening:29,assessment:18,interview:9,evaluation:7,shortlisted:3,rejected:1,knocked_out:11,total:32},aiSummary:{totalScreened:29,averageMatchScore:74,qualifiedCount:18,knockedOutCount:11},recentApplications:[
  {id:'one',candidateId:'one',candidateName:'Example Candidate',candidateEmail:'example@example.test',jobTitle:'Software Engineer',status:'evaluation',cvMatch:84,assessmentScore:80,interviewScore:77,createdAt:'2026-09-15'},
  {id:'two',candidateId:'two',candidateName:'Sample Applicant',candidateEmail:'sample@example.test',jobTitle:'Frontend Developer',status:'assessment',cvMatch:76,assessmentScore:null,interviewScore:null,createdAt:'2026-09-15'},
]};
const html=renderToStaticMarkup(React.createElement(ApplicationShell,{pageBreadcrumb:['Example workspace','Overview']},React.createElement(DashboardClientView,{initialData:fixture,userName:'Demo Recruiter'})));
const cssRoot=path.join(frontend,'.next/static/css');
const styles=fs.readdirSync(cssRoot,{recursive:true}).filter(file=>file.endsWith('.css')).map(file=>`<link rel="stylesheet" href="http://localhost:3100/_next/static/css/${file.replaceAll('\\','/')}">`).join('');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage();
  for(const width of [375,768,1440]) {
   await page.setViewportSize({width,height:1000});
   await page.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${styles}</head><body>${html}</body></html>`,{waitUntil:'networkidle'});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.equal(await page.getByRole('heading',{name:'Overview',exact:true}).count(),1);
   await page.screenshot({path:path.join(root,'.artifacts',`dashboard-fixture-${width}.png`),fullPage:true});
   console.log(`PASS workspace fixture at ${width}px`);
  }
 } finally {await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
