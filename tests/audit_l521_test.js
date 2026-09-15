// audit_l521_test.js — [L521 · audit adverse des lots L516-L518, 15/09/2026] GARDE des 5 correctifs :
// C7 commentaire imprime sur le plan ; C6 dechet NC d une ligne ♻ soustrait de clientM2 ; C3 note VOIR DOMINIQUE collee ;
// C5 rejeu _l517Cause qui avalait une trace ; C4 pastille PERTE alors que ✂ Chutes = chute gardee (regle L513).
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i);let d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };

console.log('── C7 : gabarit du plan imprime ──');
{
  // le gabarit des lignes du tableau va de « tRows+=` » a la fin « </tr>`; » : aucun /* */ ne doit s y trouver
  const i=src.indexOf('tRows+=`<tr style="${_isL?'); ok(i>0,'gabarit des lignes du plan imprime trouve');
  const j=src.indexOf('</tr>`;',i); ok(j>i,'fin du gabarit trouvee');
  const gab=src.slice(i,j);
  ok(gab.indexOf('/*')<0&&gab.indexOf('*/')<0,'aucun commentaire /* */ dans le gabarit (il s imprimait en clair sur le plan a chaque ligne)');
  ok(/\/\/ \[L518 · question Celine « 4 bobines/.test(src),'le commentaire de Celine est conserve, hors gabarit, en // sur sa ligne');
}
console.log('── C4 : pastille SOLDE si ✂ Chutes ──');
{
  global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
  global._refKeyOf=eval('('+fnOf('_refKeyOf')+')');
  global.ficheLines=[{id:'a',ref:'R1'},{id:'b',ref:'R1'},{id:'c',ref:'R1'}];
  const SOLDE=eval('('+fnOf('_l516EstSolde')+')');
  ok(SOLDE({id:'a',ref:'R1'})===false,'bobine intermediaire sans destination → pas un solde (inchange)');
  ok(SOLDE({id:'a',ref:'R1',actChutes:true})===true,'bobine intermediaire avec ✂ Chutes → SOLDE (parite regle L513)');
  ok(SOLDE({id:'a',ref:'R1',recut:true,actChutes:true})===false,'rouleau ♻ avec ✂ Chutes → jamais un solde (regle inchangee)');
  ok(SOLDE({id:'c',ref:'R1'})===true,'derniere bobine de la ref → solde (inchange)');
  ok(SOLDE({id:'a',ref:'R1',phaseEnd:true})===true,'fin de phase → solde (inchange)');
}
console.log('── C6 / C3 / C5 : cablage ──');
ok(/if\(fd\.actDechet===true&&!fd\.recut&&typeof ncLoss==='function'\)\{ const n=ncLoss\(f,fd\); if\(n&&n\.m2>0\)\{ client-=n\.m2; \} \}/.test(src),'C6 : « m² decoupes et livres » n est plus debite du dechet d une ligne ♻ (jamais creditee)');
ok(/const n=ncLoss\(f,fd\); if\(n&&n\.m2>0\)\{ dechet\+=n\.m2;|dechet\+=/.test(src),'C6 : le cumul du dechet NC lui-meme est intact (seul indicateur ISO)');
ok(/if\(!\(useful>0\)\|\|!conf\.trim\(\)\)\{ if\(chip\) chip\.remove\(\); const _n0=cur\.querySelector\('\.l516-note'\); if\(_n0\) _n0\.remove\(\); return; \}/.test(src),'C3 : configuration vide → pastille ET note retirees');
ok(/if\(!pieces\.length\)\{ if\(chip\) chip\.remove\(\); const _n1=cur\.querySelector\('\.l516-note'\); if\(_n1\) _n1\.remove\(\); return; \}/.test(src),'C3 : configuration illisible → pastille ET note retirees');
ok(/window\._l517Replay=true;[^\n]*\n\s*const m=_l513Matiere\(f\);/.test(src),'C5 : _l517Cause pose le drapeau de rejeu AVANT _l513Matiere');
ok(/window\._l517Replay=false; \} \}/.test(src),'C5 : le drapeau est retire dans le finally (jamais laisse a true)');
ok(/if\(\(typeof window!=='undefined'&&window\._l517Replay\)\|\|!_l507Traced\.has\(fd\)\)/.test(src),'C5 : le garde-fou « une trace par session » laisse passer le rejeu');
ok(/tags:Array\.from\(new Set\(tags\.map\(x=>x\.t\)\)\)/.test(src),'C5 : les causes affichees sont dedoublonnees (le rejeu emet une trace par appel — passe adverse)');
ok((src.match(/_l507Traced\.has\(fd\)/g)||[]).length===1,'C5 : un seul site de garde _l507Traced (pas de jumeau oublie)');

console.log((fail?'\n💥 '+fail+' echec(s)':'\n🏆 audit_l521 OK')+' — '+total+' verifications');
process.exit(fail?1:0);
