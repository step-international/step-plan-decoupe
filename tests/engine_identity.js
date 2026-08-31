// engine_identity.js — garde-fou : le MOTEUR de découpe doit rester BYTE-IDENTIQUE.
// [L492 · audit 20 agents] AVANT : la comparaison se faisait contre `git show HEAD:index.html`.
// Ce garde-fou était donc VRAI PAR CONSTRUCTION dès qu'une modification du moteur était commitée
// (les deux textes comparés devenaient le même) — la seule protection du cœur métier ne protégeait
// plus rien après le premier commit. On compare désormais à des EMPREINTES FIGÉES, écrites ici :
// les toucher est un geste conscient, visible en revue de code, impossible par accident.
const fs = require('fs');
const crypto = require('crypto');
const FILE = require('path').join(__dirname,'..','index.html');
const BASELINE = {
  'expandDemand':    {sha:'881debf0ddbef2f3c85a1b5d4bac195abe43c6d32eac506d10922b428ccb536a', len:149},
  'buildCounts':     {sha:'e9ffb4c3dbf0b5495882b06ddd9bbe4259d44530ba946036b47ddfccf25584bf', len:97},
  'calcStats':       {sha:'ed7ff0c204f58911cfdf90e99f1f00cbb518deab79e5d71d26c822338b293088', len:182},
  'makeLabel':       {sha:'9ac4e677b14da7e46fc298f2be9913dc1a36c847e498399a40e1833c1c0a1c94', len:107},
  'bestPattern':     {sha:'ebea6ed8e40b9e0049bb70b1c84bb818454e6d3872ce6d8229747a86e7e49895', len:3582},
  'pack':            {sha:'d63c0b6502b725a6f300fe93a51bb9f618b4da067db013db135c8ce8971ddd64', len:1049},
  'packRecutRolls':  {sha:'eb5f5584ddd9cca967eaca17dac818e2b50cb4730f6634d8d45c3c1dba6b3338', len:872},
  'packRefGroups':   {sha:'2fd5092724f09c77243e20787b243c306fa1a0a1449ccda0337e2214e2b35113', len:1924},
  'packRefGroupsPal': {sha:'8fe0de0bbbedb1981dd15c7996f84373c08f079ce85ef0dc34686927c0838508', len:1291},
  '_seqMinPalettes': {sha:'507e9f6c4e1f40de4989abd8c4ba4b99b969e60a25540dc5d19c158fa47080b6', len:2288},
  'groupBobines':    {sha:'de17678195903d215e8197d4cb493fcb6b91e22ac1d993df6842177d3fa2f440', len:335},
};
function fnOf(src, n){ let i = src.indexOf('function '+n+'('); if (i<0) return null;
  let k = src.indexOf('{', i), d = 0; for (; k<src.length; k++){ if(src[k]==='{')d++; else if(src[k]==='}'){d--; if(!d)break;} } return src.slice(i,k+1); }
const cur = fs.readFileSync(FILE,'utf8');
let fail=0, checked=0;
for (const n of Object.keys(BASELINE)){
  const a=fnOf(cur,n);
  if (a==null){ console.log('❌ '+n+' DISPARU'); fail++; continue; }
  checked++;
  const sha=crypto.createHash('sha256').update(a).digest('hex');
  if (sha===BASELINE[n].sha) console.log('✅ '+n+' byte-identique ('+a.length+' o)');
  else { console.log('❌ '+n+' A CHANGÉ ('+BASELINE[n].len+'→'+a.length+' o) — empreinte attendue '+BASELINE[n].sha.slice(0,12)+'…, obtenue '+sha.slice(0,12)+'…'); fail++; }
}
console.log(fail?('\n💥 MOTEUR MODIFIÉ : '+fail+' fonction(s). Si le changement est VOULU (règle : 4000+ tests), mets à jour BASELINE ci-dessus dans le MÊME commit.'):('\n🏆 MOTEUR INTACT : '+checked+' fonctions byte-identiques vs empreintes figées'));
process.exit(fail?1:0);
