// ordre_l525_test.js — [L525 · demande Celine a l atelier, 16/09/2026 (commande 4501961108)] GARDE de « la chute ♻ ajoutee a une
// reference PAS commencee d une commande engagee devient la n°1 de sa reference » ; une reference commencee garde l ordre actuel
// (coupees, deux bobines montees MAVEG, chutes, meres). Ne couvre pas le rendu navigateur (preuves a part).
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
function grab(n){ try{ return eval('('+fnOf(n)+')'); }catch(e){ ok(false,'fonction '+n+' introuvable ('+e.message+')'); return null; } }
const DONE=grab('_l525Done'), SPLIT=grab('_l525Split'), MOVE=grab('_l525MoveAfter');

console.log('── A. helpers PURS ──');
const node=(o)=>({classList:{contains:c=>c==='coupee'&&!!o.coupee}, querySelector:sel=>o.dechet?{classList:{contains:c=>c==='btn-red'}}:null});
ok(DONE&&DONE(node({coupee:true}),'x')===true,'ligne coupee → reference commencee');
ok(DONE&&DONE(node({dechet:true}),'x')===true,'ligne jetee (🗑 Dechet) → reference commencee');
ok(DONE&&DONE(node({}),'x')===false&&DONE(null,'x')===false,'ligne gelee par le verrou MAVEG SEUL (aucun geste) → pas commencee ; noeud absent → faux');
global.isLineFrozen=id=>id==='geste';
ok(DONE&&DONE(node({}),'geste')===true&&DONE(node({}),'x')===false,'ligne engagee par un GESTE operateur (isLineFrozen : etiquette, photo, NC, conf) → reference commencee, la chute ne passe pas devant');
delete global.isLineFrozen;
const A={id:'A'},B={id:'B'},C={id:'C'},R1={id:'R1'},R2={id:'R2'};
const s1=SPLIT&&SPLIT([A,B,C],l=>l===A);
ok(s1&&s1.started===true&&s1.rest.length===2&&s1.rest[0]===B&&s1.rest[1]===C,'reference commencee (A coupee) : rest = [B, C] (les deux montees MAVEG)');
const s2=SPLIT&&SPLIT([B,C],l=>false);
ok(s2&&s2.started===false&&s2.rest.length===2,'reference PAS commencee : started=false, rest = [B, C]');
ok(SPLIT&&SPLIT([],l=>true).started===false&&SPLIT(null,l=>true).rest.length===0,'aucune figee : pas commencee, rest vide (jamais undefined)');
const m1=MOVE&&MOVE([B,C,R1,R2],[B,C]);
ok(m1&&m1.map(l=>l.id).join(',')==='R1,R2,B,C','cas Celine : figees [B,C] puis rouleaux [R1,R2] → R1, R2, B, C (la chute est n°1 de sa reference)');
const m2=MOVE&&MOVE([A,B,C,R1],[]);
ok(m2&&m2.map(l=>l.id).join(',')==='A,B,C,R1','reference commencee (rest vide car non applique) : ordre intact');
ok(MOVE&&MOVE([A,R1],[B]).map(l=>l.id).join(',')==='A,R1','identite non trouvee → ordre intact (jamais de perte de ligne)');
{ const F1={id:'F1',recut:true},M1={id:'M1'},R9={id:'R9',recut:true}; const rest=[F1,M1].filter(l=>!l.recut); ok(rest.length===1&&rest[0]===M1&&MOVE([F1,M1,R9],rest).map(l=>l.id).join(',')==='F1,R9,M1','2e chute ajoutee : le rouleau ♻ deja en place (gele MAVEG, pas coupe) reste n°1, seule la mere figee recule → F1, R9, M1 (revue adverse)'); }

console.log('── B. cablage dans index.html (rebuild d une commande engagee) ──');
const rf=(()=>{ try{ return fnOf('recalcEcartsFromFiche'); }catch(e){ return src; } })();
const i3a=rf.indexOf("frozenMetas.filter(l=>lineKey(l)===k).forEach(l=>{ cont.appendChild(frozenNodes[l.id]);");
const iS=rf.indexOf("const _l525S=_l525Split(frozenMetas.filter(l=>lineKey(l)===k),function(l){ return _l525Done(frozenNodes[l.id],l.id); });");
const iMv=rf.indexOf("if(recutAdded>0&&!_l525S.started){ const _l525M=_l525S.rest.filter(function(l){ return !l.recut; }); if(_l525M.length){ _l525M.forEach(function(l){ const n=document.getElementById(l.id); if(n) cont.appendChild(n); }); ficheLines=_l525MoveAfter(ficheLines,_l525M); } }");
const iRolls=rf.indexOf("groupRecutRolls(rr.rolls).forEach(g=>{");
const iPack=rf.indexOf("const bobines=pack(rr.remaining,pu,pb);");
ok(i3a>0&&iS>i3a,'etape 3a : « commencee ? » calcule juste apres le re-attachement des figees de la reference');
ok(iRolls>0&&iMv>iRolls&&iPack>0&&iMv<iPack,'le deplacement des figees non coupees est fait APRES l emission des rouleaux ♻ et AVANT le pack des meres');
ok(/_cutOrderChutesFirst\(\(typeof fmmGenOrder==='function'\)\?fmmGenOrder\(computed\):computed\.map\(\(_,k\)=>k\),computed,true\);/.test(rf),'l ordre des REFERENCES reste inchange sur une commande engagee (keep=true, regle L432/L490)');
ok(/function _l418Frozen2Ids\(\)\{/.test(src)&&/if\(nx\[1\]&&_flMachineOf\(nx\[1\]\.id\)==='maveg'\) out\.add\(nx\[1\]\.id\);/.test(src),'verrou MAVEG L418 (deux bobines montees) INTACT');
ok(/if\(!isFicheUntouched\(\)\)\{ if\(auto\) return;/.test(src)||/isFicheUntouched\(\)/.test(src),'la generation L491 (fiche vierge) reste le chemin des fiches non engagees');

console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 ORDRE L525 OK : '+total+' verifications'));
process.exit(fail?1:0);
