// engine_identity.js — garde-fou : le MOTEUR de découpe doit rester BYTE-IDENTIQUE.
// [L492] comparaison à des EMPREINTES FIGÉES (comparer à git HEAD était vrai par construction dès le commit).
// [L504 · audit 30 agents, pattern 7 « le gel protège la forme, pas le résultat »] :
//   · fnOf trouve la signature COMPLÈTE en début de ligne, mot-clé `async` COMPRIS et exige UNE seule
//     occurrence : `indexOf('function pack(')` matchait à l'intérieur de `async function pack(` et la tranche
//     excluait le mot-clé -> rendre pack async laissait 🏆 ;
//   · PLAN_LAYER : les 14 fonctions APPELÉES par les 11 gelées (calculées, pas listées à la main) sont gelées
//     aussi. Neutraliser computeChutesUsed coûtait une bobine mère par commande avec 16 tests verts.
//   · un callee NOUVEAU ou DISPARU d une fonction gelée est rouge : la fermeture transitive est recalculée ici.
// Changer une empreinte est un geste conscient : BASELINE/PLAN_LAYER se mettent à jour dans le MÊME commit
// que la modification volontaire du moteur (règle : 4000+ tests).
const fs = require('fs');
const crypto = require('crypto');
const FILE = require('path').join(__dirname,'..','index.html');
const BASELINE = {
  'expandDemand':            {sha:'881debf0ddbef2f3c85a1b5d4bac195abe43c6d32eac506d10922b428ccb536a', len:149},
  'buildCounts':             {sha:'e9ffb4c3dbf0b5495882b06ddd9bbe4259d44530ba946036b47ddfccf25584bf', len:97},
  'calcStats':               {sha:'ed7ff0c204f58911cfdf90e99f1f00cbb518deab79e5d71d26c822338b293088', len:182},
  'makeLabel':               {sha:'9ac4e677b14da7e46fc298f2be9913dc1a36c847e498399a40e1833c1c0a1c94', len:107},
  'bestPattern':             {sha:'ebea6ed8e40b9e0049bb70b1c84bb818454e6d3872ce6d8229747a86e7e49895', len:3582},
  'pack':                    {sha:'d63c0b6502b725a6f300fe93a51bb9f618b4da067db013db135c8ce8971ddd64', len:1049},
  'packRecutRolls':          {sha:'eb5f5584ddd9cca967eaca17dac818e2b50cb4730f6634d8d45c3c1dba6b3338', len:872},
  'packRefGroups':           {sha:'2fd5092724f09c77243e20787b243c306fa1a0a1449ccda0337e2214e2b35113', len:1924},
  'packRefGroupsPal':        {sha:'8fe0de0bbbedb1981dd15c7996f84373c08f079ce85ef0dc34686927c0838508', len:1291},
  '_seqMinPalettes':         {sha:'507e9f6c4e1f40de4989abd8c4ba4b99b969e60a25540dc5d19c158fa47080b6', len:2288},
  'groupBobines':            {sha:'de17678195903d215e8197d4cb493fcb6b91e22ac1d993df6842177d3fa2f440', len:335},
};
const PLAN_LAYER = {
  '_laizeSortExcluded':      {sha:'6b04bb84649edac4964225e24883cacb865b91a3e1cacc2f7264c9378ab0627e', len:49},
  '_palBobines':             {sha:'cfdcef3556db3c2830c56d60221bb4960ef2f09a48da6f9bbe044243036581ca', len:174},
  '_palRepack':              {sha:'2b8677e20f359076c78f63fe964a6e20bfb8c9d907c23e267ea65bf179375b11', len:6509},
  '_palSplitSolde':          {sha:'532b05e81d719e903da68f547943d43a01aadd68963fd36c3f79690c07fb94fd', len:265},
  '_pgW':                    {sha:'507f1b945576fbdba9ce847463c95b55976dc5d73b94c82f6a235780644b405a', len:99},
  '_seqPeak':                {sha:'3d3460944fb5e55733f7f5f13bd1d095b5daf357f3998077746fe8b9e894599b', len:296},
  '_seqPeakPartial':         {sha:'363f3ff3d56aee74287eecdea19ecae47361f2da274ef9c3b574108451ae5ac7', len:344},
  'assignChutesForDisplay':  {sha:'354bbc2d264bf0e8f9e64fcbd9e6cd4603c18bfc459a7dc325e9e2d56450974a', len:550},
  'betterState':             {sha:'91c878f551817a013db6418f4089f28c10a26874955e59314187ee526601fe66', len:327},
  'computeChutesUsed':       {sha:'036a9c563b0269e9b0a41d41fb89de7bd64106b9879ea2efb719cf6d5c2e266c', len:528},
  'groupBobinesWithChutes':  {sha:'9182647d8e78b3a5254cd18f0055ff0951d89964f0bb957489dd679269ad4252', len:434},
  'groupRecutRolls':         {sha:'53ef588c1c11b1bbf27ce5ec0f2598e5a949af8fc1ad6be701aeb613bf09b7c9', len:378},
  'push':                    {sha:'921226e1dd06bbd5faf5f8ed5134ccd89c58e3147bae2041906121cf48b13ae5', len:72},
  'reduceItemsByChutes':     {sha:'51074ffc7d16f0f7b22db21f5c803d00cec48ff7e1b43649b985440451e3b6c9', len:336},
};
const cur = fs.readFileSync(FILE,'utf8');
function fnOf(src, n){
  const re = new RegExp('^[ \\t]*((?:async\\s+)?function\\s+' + n.replace(/[$]/g,'\\$') + '\\s*\\()', 'mg');
  const hits = [...src.matchAll(re)];
  if (hits.length !== 1) return { err: hits.length ? 'DÉFINIE ' + hits.length + ' FOIS' : 'DISPARUE' };
  const i = hits[0].index + hits[0][0].length - hits[0][1].length;
  let k = src.indexOf('{', i), d = 0; for (; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (!d) break; } }
  return { body: src.slice(i, k + 1) };
}
const defined = new Set([...cur.matchAll(/^[ \t]*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/mg)].map(m => m[1]));
let fail = 0, checked = 0;
function check(table, label){
  for (const n of Object.keys(table)){
    const r = fnOf(cur, n);
    if (r.err){ console.log('❌ ' + n + ' ' + r.err); fail++; continue; }
    checked++;
    const sha = crypto.createHash('sha256').update(r.body).digest('hex');
    if (sha === table[n].sha) console.log('✅ ' + n + ' byte-identique (' + r.body.length + ' o)' + label);
    else { console.log('❌ ' + n + ' A CHANGÉ (' + table[n].len + '→' + r.body.length + ' o)' + label); fail++; }
  }
}
check(BASELINE, '');
check(PLAN_LAYER, ' [dépendance]');
// fermeture transitive : les callees des 11 gelées doivent tous être gelés (BASELINE ou PLAN_LAYER)
for (const n of Object.keys(BASELINE)){
  const r = fnOf(cur, n); if (r.err) continue;
  const ids = new Set([...r.body.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]));
  for (const c of ids){
    if (c === n || !defined.has(c)) continue;
    if (!(c in BASELINE) && !(c in PLAN_LAYER)){ console.log('❌ ' + n + ' appelle ' + c + ' qui n est pas gelée (nouvelle dépendance du moteur)'); fail++; }
  }
}
console.log(fail ? ('\n💥 MOTEUR MODIFIÉ : ' + fail + ' point(s). Si le changement est VOULU (règle : 4000+ tests), mets à jour BASELINE/PLAN_LAYER dans le MÊME commit.') : ('\n🏆 MOTEUR INTACT : ' + checked + ' fonctions byte-identiques (11 gelées + ' + Object.keys(PLAN_LAYER).length + ' dépendances), fermeture transitive fermée'));
process.exit(fail ? 1 : 0);
