// pkg_l532_test.js — [L532 · demande Celine 18/09/2026] regle d emballage COUGNAUD : les chiffres de la fiche atelier
// « commande cougnaud 08 2025.doc » (PP = petite palette, GP = grande palette, bobineaux par pile, 20 piles de N, bobineaux par carton)
// entrent dans l outil, au format compact deja utilise par VEKA. La TABLE ci-dessous est retranscrite de la fiche : le test compare
// la note du code a cette table, largeur par largeur. Et comme Cougnaud EXISTE deja dans la table partagee (Firestore config/clients,
// qui REMPLACE la table du code), _l529PkgMerge fait GAGNER le code pour les cles listees dans _L532_PKG_FORCE.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const mP=src.match(/^var PKG_CLIENTS=(\{[\s\S]*?\n\});/m); if(!mP) throw new Error('introuvable PKG_CLIENTS'); global.PKG_CLIENTS=eval('('+mP[1]+')');
const mL=src.match(/^const _L529_PKG_PATCHES=(\[[^\]]*\]);/m); global._L529_PKG_PATCHES=mL?eval(mL[1]):[];
const mF=src.match(/^const _L532_PKG_FORCE=(\[[^\]]*\]);/m); global._L532_PKG_FORCE=mF?eval(mF[1]):null;
const MERGE=eval('('+fnOf('_l529PkgMerge')+')');
const mO=src.match(/^const _OLD_NOTES=(\[[\s\S]*?\n\]);/m); if(!mO) throw new Error('introuvable _OLD_NOTES'); global._OLD_NOTES=eval('('+mO[1]+')');
const MIG=eval('('+fnOf('_migrateOldNotes')+')');
const N=(PKG_CLIENTS['Cougnaud']||{}).notes||''; const lines=N.split('\n');
console.log('── 1. la note Cougnaud porte les chiffres de la fiche, largeur par largeur ──');
ok(/PP = petite palette · GP = grande palette/.test(lines[0]||'')&&/^⚡ SPÉCIFICITÉ : Mandrins PARFAITS exigés \+ caisse\/carton mixte\./.test(lines[0]||''),'1re ligne : la specificite existante est conservee + la legende PP / GP');
const parse=(l)=>{ const o={}; String(l||'').split(':').slice(1).join(':').split('|').forEach(function(seg){ const m=seg.match(/(\d+)mm=(\d+)(?: bob)?(?: (PP|GP))?/); if(m) o[m[1]]=m[2]+(m[3]?' '+m[3]:''); }); return o; };
const FICHE_PILE={14:'8 PP',19:'6 PP',24:'6 PP',30:'7 GP',36:'6 GP'};
const FICHE_20PILES={40:'19 GP',45:'11 PP',50:'15 GP',65:'7 PP',81:'6 PP',90:'6 PP'};
const FICHE_CARTON={14:'16',19:'11',24:'9',30:'7',36:'6',40:'5',45:'4',50:'4',65:'3',81:'2',90:'2',100:'2',110:'2',130:'1'};
const same=(a,b)=>JSON.stringify(Object.keys(a).sort().map(k=>[k,a[k]]))===JSON.stringify(Object.keys(b).sort().map(k=>[String(k),b[k]]));
const lP=lines.find(l=>/^DQ1006 Bleu 600ml — bob\/pile/.test(l)), l20=lines.find(l=>/^DQ1006 Bleu 600ml — 20 piles de N bobineaux :/.test(l)), lC=lines.find(l=>/^KX1011-1 noir blanc 500ml — bob\/carton/.test(l));
ok(!!lP&&same(parse(lP),FICHE_PILE),'DQ1006 Bleu 600 ml — bobineaux par pile + palette : 14=8 PP · 19=6 PP · 24=6 PP · 30=7 GP · 36=6 GP → '+JSON.stringify(parse(lP)));
ok(!!l20&&same(parse(l20),FICHE_20PILES),'DQ1006 Bleu 600 ml — 20 piles de N bobineaux + palette : 40=19 GP · 45=11 PP · 50=15 GP · 65=7 PP · 81=6 PP · 90=6 PP → '+JSON.stringify(parse(l20)));
ok(!!lC&&same(parse(lC),FICHE_CARTON),'KX1011-1 noir blanc 500 ml — bobineaux par carton, 14 largeurs de 14 a 130 mm → '+JSON.stringify(parse(lC)));
ok(lines.some(l=>l==='DQ1009 vert 600ml : 19mm=6/p, 2p/carton.')&&lines.length===5,'la ligne DQ1009 existante est conservee ; 5 lignes en tout (meme densite que la regle VEKA) → '+lines.length);
ok(PKG_CLIENTS['Cougnaud'].palette==='80×120'&&PKG_CLIENTS['Cougnaud'].type==='Caisse'&&/Standard/.test(PKG_CLIENTS['Cougnaud'].cerclage),'palette / type / cerclage de la regle inchanges');
console.log('── 2. la table partagee ne masque plus la mise a jour (le code GAGNE pour les cles listees) ──');
global.PKG_CLIENTS_SEED=PKG_CLIENTS;
const remote={'Cougnaud':{palette:'80×120',type:'Caisse',etiquetage:'Standard',cerclage:'Standard (≤39mm + tous KX)',notes:'ANCIENNE NOTE de la table partagee'},'EPCO':{palette:'X',notes:'table partagee'}};
const out=MERGE(remote);
ok(Array.isArray(_L532_PKG_FORCE)&&_L532_PKG_FORCE.indexOf('Cougnaud')>=0,'Cougnaud est liste dans _L532_PKG_FORCE');
ok(out!==remote&&out['Cougnaud']===PKG_CLIENTS['Cougnaud']&&remote['Cougnaud'].notes==='ANCIENNE NOTE de la table partagee','table partagee avec l ANCIENNE regle Cougnaud → la regle du code gagne ; l objet recu n est pas modifie');
ok(out['EPCO'].notes==='table partagee'&&out['Suys']===PKG_CLIENTS['Suys'],'les autres cles restent celles de la table partagee (EPCO) ; Suys (L529) toujours re-ajoutee');
const _tri=function(o){ const r={}; Object.keys(o).sort().forEach(function(k){ r[k]=o[k]; }); return r; };   /* une table revenue de Firestore a ses cles TRIEES */
const r2={'Cougnaud':_tri(PKG_CLIENTS['Cougnaud']),'BOUVET':_tri(PKG_CLIENTS['BOUVET']),'Suys':PKG_CLIENTS['Suys']}; ok(MERGE(r2)===r2,'table partagee DEJA a jour, cles dans l ordre de Firestore (triees) → rendue telle quelle (comparaison champ par champ)');
console.log('── 3. commandes et plans DEJA enregistres avec l ancienne note ──');
const OLDN='⚡ SPÉCIFICITÉ : Mandrins PARFAITS exigés + caisse/carton mixte.\nDQ1006 Bleu 600ml (bob/pile par largeur 14-90mm).\nKX1011-1 noir blanc 500ml (bob/carton par largeur 14-130mm).\nDQ1009 vert 600ml : 19mm=6/p, 2p/carton.';
ok(N!==OLDN&&MIG(OLDN)===N,'ancienne note EXACTE → remplacee par la nouvelle a l affichage et a l impression (patron L297)');
ok(MIG(OLDN+'\nNote ajoutée à la main par Dominique')===N+'\nNote ajoutée à la main par Dominique','un complement tape a la main apres l ancienne note est CONSERVE');
ok(MIG('Texte tapé à la main')==='Texte tapé à la main','une note tapee a la main n est jamais touchee');
console.log('── 4. BOUVET : fiche « commande bouvet.doc » + corrections de Celine (totaux entre parentheses, 20 et 30 mm cercles, cerclage du DQ1000-1 ; 360 / 260 / 200 NON repris) ──');
{ const NB=(PKG_CLIENTS['BOUVET']||{}).notes||''; const lb=NB.split('\n');
  ok(lb.length===3&&lb[0]==='⚡ SPÉCIFICITÉ : 20 bobines au sol pour 40-55-70mm.','1re ligne de la regle existante conservee ; 3 lignes');
  const l9=lb.find(l=>/^DQ1009 Bleu 600ml/.test(l))||''; const m9={}; l9.split(':').slice(1).join(':').split('|').forEach(function(seg){ const m=seg.match(/(\d+)mm=(\d+)(?:\/p ×(\d+)p \((\d+)\))?/); if(m) m9[m[1]]=m[3]?(m[2]+'/p x'+m[3]+'p ('+m[4]+')'):m[2]; });
  ok(JSON.stringify(m9)===JSON.stringify({20:'11/p x48p (528)',30:'7/p x48p (336)'})&&/— 20 et 30 mm CERCLÉS \| 40\/55\/70mm$/.test(l9)&&!/360|260|200/.test(NB),'DQ1009 Bleu 600 ml : 20 = 11/p × 48p (528) · 30 = 7/p × 48p (336) · « 20 et 30 mm CERCLÉS » · 40/55/70 mm SANS chiffre (corrections de Celine 18/09 : 360 / 260 / 200 retires) → '+l9);
  { const mm=l9.match(/20mm=(\d+)\/p ×(\d+)p \((\d+)\) \| 30mm=(\d+)\/p ×(\d+)p \((\d+)\)/)||[]; ok(Number(mm[1])*Number(mm[2])===Number(mm[3])&&Number(mm[4])*Number(mm[5])===Number(mm[6]),'controle LU DANS LA NOTE : le total entre parentheses = bobineaux par pile × piles (11 × 48 = 528, 7 × 48 = 336) → '+[mm[3],mm[6]].join(' / ')); }
  const l0=lb.find(l=>/^DQ1000-1 transp 500ml/.test(l))||''; const m0={}; l0.split(':').slice(1).join(':').split('|').forEach(function(seg){ const m=seg.match(/(\d+)mm=(\d+)\/p/); if(m) m0[m[1]]=m[2]; });
  ok(/CERCLER toutes les largeurs/.test(l0)&&JSON.stringify(m0)===JSON.stringify({20:'5',30:'5',40:'4',50:'4',70:'3'}),'DQ1000-1 transp 500 ml : « CERCLER toutes les largeurs » (la mention MANQUAIT) + 20 = 5/p · 30 = 5/p · 40 = 4/p · 50 = 4/p · 70 = 3/p → '+JSON.stringify(m0));
  ok(_L532_PKG_FORCE.indexOf('BOUVET')>=0&&MERGE({'BOUVET':{notes:'ancienne'},'Cougnaud':PKG_CLIENTS['Cougnaud'],'Suys':PKG_CLIENTS['Suys']})['BOUVET']===PKG_CLIENTS['BOUVET'],'BOUVET liste dans _L532_PKG_FORCE : la regle du code gagne sur la table partagee');
  const OLDB='⚡ SPÉCIFICITÉ : 20 bobines au sol pour 40-55-70mm.\nDQ1009 Bleu 600ml : 20mm=11/p ×48p, 30mm=7/p ×48p, 40/55/70mm.\nDQ1000-1 transp 500ml : 20mm=5/p, 30mm=5/p, 40mm=4/p, 50mm=4/p, 70mm=3/p';
  ok(NB!==OLDB&&MIG(OLDB)===NB,'commandes et plans deja enregistres avec l ancienne note Bouvet → nouvelle note a l affichage et a l impression'); }
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 PKG L532 OK : '+total+' verifications'));
process.exit(fail?1:0);
