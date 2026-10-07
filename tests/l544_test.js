// l544_test.js — [L544 · 07/10/2026, suite de l audit d usage reel du 06/10] (1) le rebut seul ne fait plus « ⚠ Ecart plan » quand la
// couverture de la commande est prouvee complete ; (2) un defaut CHIFFRE sans motif coche est refuse a l envoi (avant : parti « RAS ») ;
// (3) les temps impossibles (< 1 min par bobine mere) sont exclus des moyennes et de l estimateur, signales en orange ; (4) le top clients
// est un top des CLIENTS (plus des commandes) ; (5) corriger la date de livraison au bureau met a jour la date lue par la ponctualite.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
function blockFrom(start){ const i=src.indexOf(start); if(i<0) throw new Error('bloc introuvable : '+start.slice(0,40)); let k=src.indexOf('{',i),d=0; for(let j=k;j<src.length;j++){ const c=src[j]; if(c==='{')d++; else if(c==='}'){ d--; if(d===0) return src.slice(i,j+1); } } }
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };

console.log('── 1. rebut et ecart ──');
ok(!/if\(_dechetPieces>0\)\{\s*hasEcart=true;/.test(src)&&/if\(_dechetPieces>0\) _l544Rebut=_dechetPieces;/.test(src),'le rebut ne pose plus hasEcart directement');
ok(src.indexOf('_l544CovOk=true; _l544Miss=_miss.length;')>0&&src.indexOf('_l544CovOk=true; _l544Miss=_miss.length;')<src.indexOf('if(_l544Rebut>0){'),'la decision est prise APRES le controle de couverture (le vrai)');
const DEC=new Function('hasEcart','ecartMsg','_l544Rebut','_l544CovOk','_l544Miss', blockFrom('if(_l544Rebut>0){')+'\nreturn {hasEcart:hasEcart,ecartMsg:ecartMsg};');
let r=DEC(false,'',7,true,0); ok(r.hasEcart===false&&r.ecartMsg==='','7 pieces au rebut, commande COUVERTE → pas d ecart (avant : « ⚠ Ecart plan » sur 9 fiches sur 9)');
r=DEC(false,'',7,true,2); ok(r.hasEcart===true&&/7 pièce\(s\) au rebut — vérifier la couverture/.test(r.ecartMsg),'7 au rebut + 2 pieces non couvertes → ecart comme avant');
r=DEC(false,'',3,false,0); ok(r.hasEcart===true,'couverture NON calculable (erreur) → prudence : ecart comme avant');
r=DEC(true,'+1 bobine',3,true,0); ok(r.hasEcart===true&&/\+1 bobine ; ♻ 3 pièce\(s\) au rebut, recoupées — commande couverte/.test(r.ecartMsg),'ecart deja la pour une autre raison → simple information ajoutee');
r=DEC(false,'',0,true,0); ok(r.hasEcart===false,'sans rebut → rien ne change');

console.log('── 2. defaut chiffre sans motif ──');
const G=src.slice(src.indexOf('const _l544Chif='),src.indexOf('const _l544Chif=')+900);
global.parseNum=v=>parseFloat(String(v==null?'':v).replace(',','.'))||0;
const chif=new Function('fd','return '+G.match(/const _l544Chif=([^;]+);/)[1]+';');
const blocks=fd=>{ const hasNC=fd.ncLarg||fd.ncQty||fd.ncCasse||fd.ncAng||fd.ncHum; return !hasNC&&!fd.test2nc&&chif(fd); };
ok(blocks({ncQtyVal:3,ncWidthVal:61,ncLots:[{q:3,w:61}]})===true,'3 × 61 chiffres, aucune case → refuse a l envoi (cas Legrand du 26/08, parti « RAS »)');
ok(blocks({ncAng:true,ncQtyVal:3,ncWidthVal:61,ncLots:[{q:3,w:61}]})===false,'meme chiffrage avec Angle coche → accepte');
ok(blocks({ncQtyVal:0,ncWidthVal:0,ncLots:[]})===false,'bobine RAS sans chiffrage → accepte');
ok(blocks({test2nc:true,ncQtyVal:2,ncWidthVal:26,ncLots:[{q:2,w:26}]})===false,'Test NC coche → pas bloque par cette garde');
ok(/défaut CHIFFRÉ sans motif coché/.test(G)&&/return;/.test(G),'message clair et envoi interrompu');

console.log('── 3. temps impossibles ──');
const TD=eval('('+fnOf('_l544TempsDouteux')+')');
ok(TD({nbBobines:26,duree:101})===true&&TD({nbBobines:1,duree:38})===true&&TD({nbBobines:14,duree:3*3600})===false&&TD({nbBobines:0,duree:50})===false&&TD(null)===false,'moins d 1 min par bobine mere = temps non mesure (26 bobines en 1 min 41 ; 1 bobine en 38 s) ; jamais d exception');
ok(/\|\|_l544TempsDouteux\(t\)\) return;/.test(fnOf('dujSamples'))&&/\|\|_l544TempsDouteux\(t\)\) return;/.test(fnOf('_dujAddSamples')),'exclus du debit et de l estimateur');
const RT=fnOf('renderTemps');
ok(/const _l544Ok=temps\.filter\(t=>!_l544TempsDouteux\(t\)\)/.test(RT)&&/const avgSec=_l544Ok\.length\?/.test(RT)&&/temps non mesuré/.test(RT),'« Temps moyen » sans eux, avec le nombre exclu ; ligne en orange « ⚠ » — rien n est efface');

console.log('── 4. top clients ──');
const K=src.slice(src.indexOf('const _c0=String(f.client'),src.indexOf('const _c0=String(f.client')+500);
const cle=new Function('f','_l517ClientNom','const '+K.match(/const _c0=([^;]+);/)[0].slice(6)+' const c='+K.match(/const c=(\(function\(\)\{[\s\S]*?\}\)\(\));/)[1]+'; return c;');
ok(cle({client:'DECEUNINCK NV pour le 15 09 26 n°4500864123'},undefined)==='DECEUNINCK NV'&&cle({client:'DECEUNINCK NV pour le 10 09 26 n°4500864121'},undefined)==='DECEUNINCK NV','plusieurs commandes d un meme client → UNE ligne (avant : DECEUNINCK 3 fois dans le top 5)');
ok(cle({client:'VEKA pour le 21 09 26 n°4501964870'},v=>/^VEKA/.test(v)?'VEKA':'')==='VEKA'&&cle({client:''},undefined)==='—','nom du catalogue utilise quand il est reconnu ; client vide → « — »');

console.log('── 5. date de livraison corrigee au bureau ──');
global._l543FixYear=eval('('+fnOf('_l543FixYear')+')');
const ISO=src.slice(src.indexOf('let _l544Iso=null;'),src.indexOf('let _l544Iso=null;')+700);
const iso=new Function('dateLiv','f',ISO.split('\n')[0].replace(/\/\*[\s\S]*?\*\//g,'')+'\nreturn _l544Iso;');
ok(iso('19/10/2026',{dateLiv:'19/10/0026'})==='2026-10-19'&&iso('24/09/26',{dateLiv:'24/10/920'})==='2026-09-24','la date corrigee a la main recalcule aussi la date lue par la ponctualite (avant : jamais)');
ok(iso('19/10/0026',{dateLiv:'01/01/2026'})==='2026-10-19'&&iso('24/10/920',{dateLiv:'x'})===null&&iso('19/10/2026',{dateLiv:'19/10/2026'})===null,'annee 0026 tapee → 2026 ; annee ambigue → rien n est ecrit ; date inchangee → rien n est ecrit');
ok(/if\(_l544Iso\) upd\.dateLivIso=_l544Iso;/.test(src),'… et seulement dans ce cas');
ok(iso('31/02/2026',{dateLiv:'x'})===null&&iso('31/09/2026',{dateLiv:'x'})===null,'date impossible (31/02, 31/09) → rien n est ecrit');
ok(/\$\{_l544Ok\.length\?fmtTime\(avgSec\):'—'\}/.test(RT),'tous les temps filtres non mesures → « — » (jamais un faux 00:00:00)');
console.log(fail?('\n💥 '+fail+' echec(s) sur '+total):('\n🏆 L544 OK : '+total+' verifications'));
process.exit(fail?1:0);
