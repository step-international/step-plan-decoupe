// engine_identity.js — garde-fou : le MOTEUR de découpe doit rester BYTE-IDENTIQUE à git HEAD.
const { execSync } = require('child_process');
const fs = require('fs');
const REPO = '/Users/EstebanR/step-plan-decoupe';
const FILE = REPO + '/index.html';
const FROZEN = ['expandDemand','buildCounts','calcStats','makeLabel','bestPattern','pack',
  'packRecutRolls','packRefGroups','packRefGroupsPal','_seqMinPalettes','groupBobines'];
function fnOf(src, n){ let i = src.indexOf('function '+n+'('); if (i<0) return null;
  let k = src.indexOf('{', i), d = 0; for (; k<src.length; k++){ if(src[k]==='{')d++; else if(src[k]==='}'){d--; if(!d)break;} } return src.slice(i,k+1); }
const cur = fs.readFileSync(FILE,'utf8');
let head; try { head = execSync('git show HEAD:index.html',{cwd:REPO,maxBuffer:64*1024*1024}).toString('utf8'); }
catch(e){ console.log('❌ git show HEAD : '+e.message); process.exit(1); }
let fail=0, checked=0;
for (const n of FROZEN){ const a=fnOf(cur,n), b=fnOf(head,n);
  if (b==null){ console.log('· '+n+' absent de HEAD — ignoré'); continue; }
  if (a==null){ console.log('❌ '+n+' DISPARU'); fail++; continue; }
  checked++;
  if (a===b) console.log('✅ '+n+' byte-identique ('+a.length+' o)');
  else { console.log('❌ '+n+' A CHANGÉ ('+b.length+'→'+a.length+')'); fail++; } }
console.log(fail?('\n💥 MOTEUR MODIFIÉ : '+fail):('\n🏆 MOTEUR INTACT : '+checked+' fonctions byte-identiques vs HEAD'));
process.exit(fail?1:0);
