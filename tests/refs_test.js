// refs_test.js — [L271] GARDE anti-perte de référence (audit 27/07). Teste les fonctions PURES touchées
// (parseNum O→0). Les chemins DOM (rawRows round-trip, confirmation removeRefBlock, réf gardée au changement
// de client) sont gardés par marqueurs dans audit_regress_test.js (pas de DOM en Node).
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
const parseNum=eval('('+fnOf('parseNum')+')');
let fail=0; const ok=(c,m)=>{ console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };

console.log('── [L271 · audit #8] parseNum : « O » (lettre) → 0 dans un champ numérique ──');
ok(parseNum('4OO')===400,'« 4OO » → 400 (avant : 4, quantité ÷100 en silence)');
ok(parseNum('8O')===80,'« 8O » → 80');
ok(parseNum('O5')===5,'« O5 » (largeur) → 5');
ok(parseNum('1o5')===105,'minuscule « 1o5 » → 105');
ok(parseNum('502')===502,'un nombre normal reste intact (502)');
ok(parseNum('92,5')===92.5,'décimale virgule conservée (92,5 → 92.5)');
ok(parseNum('92 ,5')===92.5,'espaces + virgule (tablette) conservés');
ok(parseNum('')===0&&parseNum(null)===0&&parseNum(undefined)===0,'vide/null/undefined → 0');
ok(parseNum('abc')===0,'texte non numérique → 0 (repli inchangé)');

console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 REFS VALIDÉ : parseNum robuste à la lettre O (anti quantité ÷100 silencieuse)');
process.exit(fail?1:0);
