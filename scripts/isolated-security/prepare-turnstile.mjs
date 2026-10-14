import {mkdtempSync,mkdirSync,copyFileSync,readdirSync,readFileSync,writeFileSync,appendFileSync,chmodSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=mkdtempSync(join(tmpdir(),'bw-turnstile-'));
chmodSync(root,0o755); // Allow container users to read mounted non-secret templates.
appendFileSync(process.env.GITHUB_ENV,'BW_ISOLATED_ROOT='+root+'\n');
execFileSync('npx',['--yes','supabase@2.54.11','init'],{cwd:root,stdio:'pipe'});
mkdirSync(root+'/supabase/migrations',{recursive:true});
for(const f of readdirSync('supabase/migrations').filter(f=>/^\d{12,14}_.*\.sql$/.test(f)))copyFileSync('supabase/migrations/'+f,root+'/supabase/migrations/'+f);
mkdirSync(root+'/supabase/templates',{recursive:true});
// Same token-hash callback as PR #39, solely for the disposable mailbox test.
writeFileSync(root+'/supabase/templates/recovery.html','<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=recovery">Reset password</a>');
let config=readFileSync(root+'/supabase/config.toml','utf8')
 .replace(/^project_id = .*$/m,'project_id = "bw-turnstile-ci"')
 .replace(/^site_url = .*$/m,'site_url = "http://127.0.0.1:3301"')
 .replace(/^additional_redirect_urls = .*$/m,'additional_redirect_urls = ["http://127.0.0.1:3301/auth/recovery"]')
 .replace(/(\[auth\.mfa\.totp\][\s\S]*?)(?=\n\[|$)/,s=>s.replace(/enroll_enabled = false/,'enroll_enabled = true').replace(/verify_enabled = false/,'verify_enabled = true'));
// Official public Cloudflare TEST secret, never a Production credential.
config+='\n[auth.captcha]\nenabled = true\nprovider = "turnstile"\nsecret = "1x0000000000000000000000000000000AA"\n';
config+='\n[auth.email.template.recovery]\nsubject = "BengalWave CAPTCHA recovery test"\ncontent_path = "./supabase/templates/recovery.html"\n';
writeFileSync(root+'/supabase/config.toml',config);
console.log('Prepared isolated Supabase with real provider CAPTCHA, MFA and SMTP capture.');
