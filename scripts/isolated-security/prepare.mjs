import {mkdirSync,copyFileSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const root='/tmp/bw-security-supabase';
mkdirSync(root,{recursive:true});
execFileSync('npx',['--yes','supabase@2.54.11','init'],{cwd:root,stdio:'pipe'});
mkdirSync(root+'/supabase/migrations',{recursive:true});
// 001_blueprint is a design document, superseded by the CMS migrations.
for(const file of readdirSync('supabase/migrations').filter(f=>/^\d{12,14}_.*\.sql$/.test(f)))copyFileSync('supabase/migrations/'+file,root+'/supabase/migrations/'+file);
mkdirSync(root+'/supabase/templates',{recursive:true});
copyFileSync('supabase/templates/recovery-token-hash.html',root+'/supabase/templates/recovery.html');
let config=readFileSync(root+'/supabase/config.toml','utf8');
config=config.replace(/^project_id = .*$/m,'project_id = "bw-security-ci"')
 .replace(/^site_url = .*$/m,'site_url = "http://127.0.0.1:3300"')
 .replace(/^additional_redirect_urls = .*$/m,'additional_redirect_urls = ["http://127.0.0.1:3300/auth/recovery"]');
config+='\n[auth.email.template.recovery]\nsubject = "BengalWave isolated recovery"\ncontent_path = "./supabase/templates/recovery.html"\n';
if(!config.includes('[auth.mfa.totp]'))throw new Error('Missing local TOTP configuration');
config=config.replace(/(\[auth\.mfa\.totp\][\s\S]*?)(?=\n\[|$)/,section=>section
 .replace(/enroll_enabled = false/,'enroll_enabled = true')
 .replace(/verify_enabled = false/,'verify_enabled = true'));
writeFileSync(root+'/supabase/config.toml',config);
console.log('Prepared isolated Auth, Storage, database and mail capture; no hosted project linked.');
