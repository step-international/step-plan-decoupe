// perte_l516_test.js — [L516 · demande DG via Celine 10/09/2026] GARDE de la pastille « PERTE / SOLDE » de la bobine en cours :
// _l516ChipEtat (pur) : ⚠ DEPASSE > SOLDE > PERTE (>= seuil, rouge) > PERTE neutre ; _l516EstSolde : fin de phase ou derniere
// bobine de SA reference (identite _refKeyOf) = solde ; rouleau ♻ jamais ; une ref a UNE bobine = solde (piege pos-last-ref).
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.fmt=eval('('+fnOf('fmt')+')');
global._refKeyOf=eval('('+fnOf('_refKeyOf')+')');
const mS=src.match(/^const PERTE_LAIZE_ALERTE_MM=(\d+);/m); if(!mS) throw new Error('introuvable PERTE_LAIZE_ALERTE_MM');
global.PERTE_LAIZE_ALERTE_MM=+mS[1];
const ETAT=eval('('+fnOf('_l516ChipEtat')+')');
const SOLDE=eval('('+fnOf('_l516EstSolde')+')');
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };

console.log('── 1. seuil ──');
ok(PERTE_LAIZE_ALERTE_MM===20,'seuil unique = 20 mm (constante lue dans le code) → '+PERTE_LAIZE_ALERTE_MM);
console.log('── 2. etat de la pastille (cas VEKA 152x50 : utile 1240, 24x50 = 1200 → reste 40) ──');
{
  const e=ETAT(40,false,20); ok(e.cls==='perte'&&e.label==='PERTE 40 mm','bobine intermediaire, 40 mm → PERTE 40 mm en ROUGE (cls perte) → '+JSON.stringify(e));
  const e2=ETAT(40,true,20); ok(e2.cls==='solde'&&e2.label==='SOLDE 40 mm','derniere bobine, 40 mm → SOLDE 40 mm (jamais rouge) → '+JSON.stringify(e2));
  const e3=ETAT(8,false,20); ok(e3.cls===''&&e3.label==='PERTE 8 mm','8 mm → PERTE 8 mm neutre (gris) → '+JSON.stringify(e3));
  const e4=ETAT(20,false,20); ok(e4.cls==='perte','20 mm = seuil atteint → rouge (>=) → '+e4.cls);
  const e5=ETAT(19.9,false,20); ok(e5.cls==='','19,9 mm → neutre → "'+e5.cls+'"');
  const e6=ETAT(-10,false,20); ok(e6.cls==='over'&&e6.label==='⚠ DÉPASSE 10 mm','depassement 25x50 sur 1240 → ⚠ DÉPASSE 10 mm (L353 prioritaire) → '+JSON.stringify(e6));
  const e7=ETAT(-10,true,20); ok(e7.cls==='over','depassement sur la derniere bobine → ⚠ DÉPASSE prime sur SOLDE → '+e7.cls);
  const e8=ETAT(840,true,20); ok(e8.cls==='solde'&&e8.label==='SOLDE 840 mm','7e bobine VEKA (8x50) → SOLDE 840 mm → '+JSON.stringify(e8));
  const e9=ETAT(40,false,undefined); ok(e9.cls==='perte','seuil absent → repli sur la constante → '+e9.cls);
}
console.log('── 3. solde : derniere bobine de SA reference, fin de phase, rouleau, ref mono-bobine ──');
{
  const A=(id,x)=>Object.assign({id,ref:'KX1006-1',refIdKey:'kA'},x||{});
  global.ficheLines=[A('a1'),A('a2'),A('a3'),{id:'b1',ref:'KX1075',refIdKey:'kB'},A('p1',{phaseEnd:true}),A('r1',{recut:true,rollW:300})];
  ok(SOLDE(ficheLines[0])===false,'a1 (1re de 3) → PERTE (pas un solde)');
  ok(SOLDE(ficheLines[1])===false,'a2 (2e de 3) → PERTE');
  ok(SOLDE(ficheLines[5])===false,'r1 rouleau ♻ → jamais un solde');
  ok(SOLDE(ficheLines[4])===true,'p1 fin de phase → SOLDE (chute gardee) meme au milieu');
  ok(SOLDE(ficheLines[3])===true,'b1 : reference a UNE seule bobine → SOLDE (la classe pos-last-ref, elle, ne s affiche pas : totalsByRef>1)');
  // derniere de A = la derniere ligne dont la cle est kA, rouleau exclu par recut, phaseEnd compte comme ligne de A
  ok(SOLDE(ficheLines[2])===false&&SOLDE(ficheLines[4])===true,'la derniere ligne de la ref A est p1 (fin de phase) ; a3 n est pas la derniere → PERTE');
  global.ficheLines=[A('a1'),A('a2'),A('a3')];
  ok(SOLDE(ficheLines[2])===true,'a3 derniere de sa ref → SOLDE');
  // homonymes : meme nom, identites differentes → chacune sa derniere
  global.ficheLines=[A('a1'),A('a2'),{id:'c1',ref:'KX1006-1',refIdKey:'kC'},{id:'c2',ref:'KX1006-1',refIdKey:'kC'}];
  ok(SOLDE(ficheLines[1])===true&&SOLDE(ficheLines[2])===false&&SOLDE(ficheLines[3])===true,'deux refs HOMONYMES (1000 et 700 ml) : a2 et c2 sont chacune la derniere de LEUR ref');
  // lignes anciennes sans refIdKey : cle par nom
  global.ficheLines=[{id:'o1',ref:'KX1045-1'},{id:'o2',ref:'KX1045-1'}];
  ok(SOLDE(ficheLines[0])===false&&SOLDE(ficheLines[1])===true,'sans identite : cle par nom, o2 derniere → SOLDE');
  ok(SOLDE(null)===false&&SOLDE({id:'z'})===false,'ligne absente / inconnue → jamais un solde (false), pas d exception');
}
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 PERTE L516 OK : '+total+' verifications'));
process.exit(fail?1:0);
