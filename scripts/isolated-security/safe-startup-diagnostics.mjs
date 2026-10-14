import {readFileSync} from 'node:fs';
const path=process.argv[2];
let raw='';
try { raw=readFileSync(path,'utf8'); } catch { console.log('Local startup log unavailable'); process.exit(0); }
const lines=raw.split(/\r?\n/);
const matches=lines.filter(line=>/error|fail|migra|schema|timeout|denied|not found|docker|cannot|aborted|port.*used/i.test(line)).slice(-24);
console.log('Sanitized Supabase startup diagnostics ('+matches.length+' matching lines):');
for(let line of matches){
  line=line.replace(/(postgres(?:ql)?:\/\/)[^\s@]+@/ig,'$1[REDACTED]@')
    .replace(/(apikey|secret|token|password|authorization)\s*[:=]\s*[^\s,;]+/ig,'$1=[REDACTED]')
    .replace(/[A-Za-z0-9+/_-]{50,}={0,2}/g,'[REDACTED]')
    .slice(0,280);
  console.log(line);
}