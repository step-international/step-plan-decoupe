// horscmd_l559_test.js — [L559 · decisions Celine 28/10 et 04/11/2026, responsable qualite · contre-lecture 3 angles] BOBINEAUX HORS COMMANDE, POUR LE STOCK :
// question OBLIGATOIRE en fin de commande (volet CONFIRMER : garde au tap Enregistrer, volet ouvert ; fenetre dediee a l arret manque-matiere, encadres
// cherches dans le CONTENEUR ACTIF), « Aucun » / « Oui » + cases Quantite × Largeur (reference seulement si longueurs differentes, repartition auto sinon),
// « sans-reste » note tout seul, lignes incompletes jamais perdues en silence, reponse en memoire et dans le brouillon, remises a zero (6 sites), saisie seule
// dans ficheEntry.horsCmd, m² dans f.mat (source unique _l513Matiere : 2 reservoirs par reference — restes NON gardes puis chutes gardees — au-dela =
// depassement, jamais compte), invariant a 5 familles, ventilation par reference, livres / decoupes inchanges, correction admin (diff PUR contre l etat
// initial : rien n est invente), tuile KPI (fiches a verifier), CSV en fin de ligne (nb, m², depassement), carte. Donnees FICTIVES, aucun reseau.
// Fonctions VRAIES (extraites du source) sur un DOM FACTICE minimal ; une fonction absente = {} ; une exception = ROUGE (compte rouge honnete sur L558).
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const shot=fs.readFileSync(path.join(__dirname,'shot.mjs'),'utf8');
const bat=fs.readFileSync(path.join(__dirname,'battery.sh'),'utf8');
const ci=fs.readFileSync(path.join(ROOT,'.github','workflows','static.yml'),'utf8');
const sim=fs.readFileSync(path.join(__dirname,'sim200.mjs'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)return src.slice(i,j+1);}}throw new Error('non fermee '+n);}
const F=n=>{ try{ return fnOf(n); }catch(e){ return ''; } };
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
let fini=false; process.on('exit',c=>{ if(!fini&&c===0){ console.log('💥 test non termine : ROUGE'); process.exitCode=1; } });
const near=(a,b,t)=>Math.abs(a-b)<=(t||0.11);
const T=(f)=>{ try{ return f(); }catch(e){ console.log('   (exception : '+(e&&e.message||e)+')'); return false; } };   /* une exception = ROUGE (jamais une chaine « ERR » qui compte vrai) */

ok(/const APP_VERSION='\d{4}\.\d\d\.\d\d-L(559|5[6-9]\d|[6-9]\d\d|\d{4,})';/.test(src),'APP_VERSION >= L559');
const mS=src.match(/^const PERTE_LAIZE_ALERTE_MM=(\d+);/m); global.PERTE_LAIZE_ALERTE_MM=mS?+mS[1]:20;
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.window=global; global._l528BugN=0; let warns=0; global._l505Warn=function(){ warns++; }; global._l507Traced=new WeakSet();
const CH=[]; const NOMS=['parseNum','parseConf','calcStats','_refIdKey','_refKeyOf','_l505HorsPlan','_l507GroupUseful','_l507KeyOf','_l506RefGroupFor','fmt','esc','isoNow','ncLoss','_l513Matiere','_l513MatiereOf','_l513MatSig','_l516EstSolde','_l558Conf','_l558Garde','_l558Purge','_l558Lire','computeChutesUsed','_sanStoredRows','_l530ChutesOfGroup','_l530Stock','_l530Surplus','_l530Bilan','_l528Livres','_l528ParRef','_l559Root','_l559Box','_l559EditDiff','_l559Ml','_l559Ini','_l559Parse','_l559Items','_l559Incomplets','_l559Txt','_l559HcSer','_l559Sig','_l559Refs','_l559RefsDiff','_l559RestesVifs','_l559ARestes','_l559RefDefaut','_l559Placer','_l559Repartir','_l559Set','_l559Row','_l559RowAdd','_l559RowDel','_l559PeutEnvoyer','_l559Refus','_l559HcForFiche','_l559KeysHtml','_l559DispoTxt','_l559PartageTxt','_l559ResumeHtml','_l559RowsHtml','_l559VoletHtml','_l559Rendu','_l559Resume','_l559AskMM','victoryConfirm'];
NOMS.forEach(n=>{ try{ global[n]=eval('('+fnOf(n)+')'); CH.push(n); }catch(e){ global[n]=function(){ return {}; }; } });
ok(CH.length===NOMS.length,NOMS.length+' fonctions VRAIES extraites du source → '+CH.length+(CH.length<NOMS.length?' (absentes : '+NOMS.filter(n=>CH.indexOf(n)<0).join(', ')+')':''));
global.normConf=(function(){ try{ return eval('('+fnOf('normConf')+')'); }catch(e){ const m=src.match(/^(?:const|let|var) normConf=([^\n]+?);\s*(?:\/\/.*)?$/m); if(!m) throw e; return eval('('+m[1]+')'); } })();
global._l513M2=function(v){ if(typeof v!=='number'||isNaN(v)) return '—'; return v.toLocaleString('fr-FR',{maximumFractionDigits:1}); };
const L=(conf,x)=>Object.assign({conf:conf,coupee:true,useful:2090},x||{});
const inv=(m,hc)=>near(m.perteM2+m.chutesM2+m.dechetM2+m.clientM2+(hc||0),m.m2Coupes,0.6);

console.log('── 1. calcul : 5e famille dans _l513Matiere (EXECUTE, vraie fonction, fixture CONTISTEEL simplifiee) ──');
{ const F0=()=>({mother:2100,useful:2090,blade:0,longueur:'1000',ficheDetail:[L('1x1180'),L('1x1180'),L('1x1180')]});   /* 3 bobines, reste 910 mm, derniere = solde ; 1000 m → 1 mm = 1 m² */
  const m0=_l513Matiere(F0());
  ok(m0.ok&&near(m0.perteM2,1850)&&near(m0.chutesM2,910)&&m0.horsCmdM2===null&&m0.horsCmdN===0&&inv(m0,0),'fiche d AVANT le lot (pas de horsCmd) : perte 1850, chutes 910, horsCmdM2 NULL (cellule vide), invariant tenu → '+m0.perteM2+' / '+m0.horsCmdM2);
  const mA=_l513Matiere(Object.assign(F0(),{horsCmd:{rep:'aucun',items:[]}}));
  ok(mA.ok&&near(mA.perteM2,1850)&&mA.horsCmdM2===0&&mA.horsCmdN===0&&mA.horsCmdDepM2===0,'reponse « aucun » : rien ne bouge, horsCmdM2 = 0 (un vrai zero)');
  const mN=_l513Matiere(Object.assign(F0(),{horsCmd:{rep:'non-demande',items:[]}}));
  ok(mN.ok&&mN.horsCmdM2===null&&near(mN.perteM2,1850),'reponse « non-demande » (portrait, repli) : horsCmdM2 NULL, perte inchangee');
  const m1=_l513Matiere(Object.assign(F0(),{horsCmd:{rep:'oui',items:[{n:1,w:500}]}}));
  ok(m1.ok&&near(m1.perteM2,1350)&&near(m1.resteM2,1320)&&near(m1.lamesM2+m1.bordsM2+m1.resteM2,m1.perteM2)&&near(m1.chutesM2,910)&&near(m1.horsCmdM2,500)&&m1.horsCmdN===1&&near(m1.horsCmdDepM2,0)&&near(m1.horsCmdSaisiM2,500)&&inv(m1,m1.horsCmdM2),'1 × 500 mm : 500 m² sortent de la PERTE (et de resteM2 : decomposition tenue), chutes intactes, invariant a 5 familles → perte '+m1.perteM2+' reste '+m1.resteM2+' hc '+m1.horsCmdM2);
  const m2=_l513Matiere(Object.assign(F0(),{horsCmd:{rep:'oui',items:[{n:1,w:2000}]}}));
  ok(m2.ok&&near(m2.perteM2,30)&&near(m2.chutesM2,730)&&near(m2.horsCmdM2,2000)&&near(m2.horsCmdDepM2,0)&&inv(m2,m2.horsCmdM2),'1 × 2000 mm (plus que les restes non gardes 1820) : 1820 pris dans la perte PUIS 180 dans les chutes gardees (solde) — decision 1 → perte '+m2.perteM2+' chutes '+m2.chutesM2);
  const m3=_l513Matiere(Object.assign(F0(),{horsCmd:{rep:'oui',items:[{n:3,w:2000}]}}));
  ok(m3.ok&&near(m3.perteM2,30)&&near(m3.chutesM2,0)&&near(m3.horsCmdM2,2730)&&near(m3.horsCmdDepM2,3270)&&near(m3.horsCmdSaisiM2,6000)&&m3.horsCmdN===3&&inv(m3,m3.horsCmdM2),'3 × 2000 mm (au-dela des deux reservoirs) : on compte ce qui existe (2730), le reste est un DEPASSEMENT (3270) jamais compte, perte jamais negative');
  const m4=_l513Matiere(Object.assign(F0(),{horsCmd:{rep:'oui',items:[{n:0,w:50},{n:2,w:0},{n:1,w:100}]}}));
  ok(m4.ok&&m4.horsCmdInc===2&&near(m4.horsCmdM2,100)&&m4.horsCmdN===1,'lignes invalides (n 0, w 0) : comptees en horsCmdInc, jamais en m² → inc '+m4.horsCmdInc);
  const m5=_l513Matiere(Object.assign(F0(),{ficheDetail:[L('1x1180',{resteGarde:true}),L('1x1180'),L('1x1180')],horsCmd:{rep:'oui',items:[{n:1,w:1000}]}}));
  ok(m5.ok&&near(m5.perteM2,30+910-910)&&near(m5.horsCmdM2,1000)&&near(m5.chutesM2,1820-90)&&inv(m5,m5.horsCmdM2),'reste GARDE (L558) sur la bobine 1 : il n est plus dans les restes non gardes ; 1 × 1000 = 910 pris dans la perte + 90 dans les chutes gardees (jamais deux fois) → perte '+m5.perteM2+' chutes '+m5.chutesM2);
  const m6=_l513Matiere(Object.assign(F0(),{ficheDetail:[L('1x1180'),L('1x300',{recut:true,rollW:600,useful:600}),L('1x1180'),L('1x1180')],horsCmd:{rep:'oui',items:[{n:1,w:2200}]}}));
  ok(m6.ok&&near(m6.horsCmdM2,2200)&&near(m6.horsCmdDepM2,0)&&near(m6.perteM2,30+300)&&near(m6.chutesM2,910-380),'rouleau ♻ : son residu (300) n est PAS un reservoir (il reste en perte) ; 1 × 2200 → 1820 pris dans les restes + 380 dans le solde → perte '+m6.perteM2+' chutes '+m6.chutesM2);
  ok(m1.regleVer==='L513','la regle reste L513 (anciennes fiches : resultat identique, pas de recalcul force)');
  const mKo=_l513Matiere({mother:2100,useful:2090,blade:0,longueur:'',ficheDetail:[L('1x1180')],horsCmd:{rep:'oui',items:[{n:3,w:100}]}}); ok(mKo.ok===false&&mKo.horsCmdM2===null&&mKo.horsCmdN===3,'fiche non calculable : horsCmdM2 null (jamais un 0 a la place d un inconnu) mais le NOMBRE saisi (3) est pose (contre-lecture)'); }

console.log('── 2. multi-reference : longueur de SA reference, reservoir par reference, ventilation (_l528ParRef) et livres (EXECUTE) ──');
{ const RG=[{ref:'KX-A',mother:2100,edge:10,useful:2090,longueur:'1000',blade:0,machine:'feba',rows:[{width:1180,qty:2}]},{ref:'KX-B',mother:2100,edge:10,useful:2090,longueur:'500',blade:0,machine:'feba',rows:[{width:1180,qty:2}]}];
  const FM=(hc)=>({mother:'2100 / 2100',useful:'2090 / 2090',blade:0,longueur:'1000 / 500',refGroups:JSON.parse(JSON.stringify(RG)),totalBobines:4,ficheDetail:[L('1x1180',{ref:'KX-A',refIdx:0}),L('1x1180',{ref:'KX-A',refIdx:0}),L('1x1180',{ref:'KX-B',refIdx:1}),L('1x1180',{ref:'KX-B',refIdx:1})],horsCmd:hc});
  const mm0=_l513Matiere(FM(undefined)); const mmB=_l513Matiere(FM({rep:'oui',items:[{n:1,w:500,refIdx:1,ref:'KX-B'}]}));
  ok(mm0.ok&&mmB.ok&&near(mmB.horsCmdM2,250)&&near(mm0.perteM2-mmB.perteM2,250)&&inv(mmB,mmB.horsCmdM2),'1 × 500 sur la reference B (500 m) : 250 m² (longueur de SA reference, jamais « 1000 / 500 ») → '+mmB.horsCmdM2);
  const mmX=_l513Matiere(FM({rep:'oui',items:[{n:1,w:500}]}));
  ok(mmX.ok&&mmX.horsCmdInc===1&&near(mmX.horsCmdM2,0)&&near(mmX.perteM2,mm0.perteM2),'multi-ref SANS reference sur la ligne : non chiffrable (inc), rien retire, la fiche reste calculable');
  const mmC=_l513Matiere(FM({rep:'oui',items:[{n:1,w:1500,refIdx:1,ref:'KX-B'}]}));
  ok(mmC.ok&&near(mmC.horsCmdM2,455+295)&&near(mmC.horsCmdDepM2,0),'plafond PAR reference : B n a que 455 m² de reste non garde (1 × 910 mm × 500 m) + 455 de solde ; 1 × 1500 (750 m²) = 455 perte + 295 solde');
  const fB=FM({rep:'oui',items:[{n:1,w:500,refIdx:1,ref:'KX-B'}]}); const pr=T(()=>_l528ParRef(fB,mmB));
  ok(pr&&pr.ok===true&&pr.src==='rejeu'&&pr.refs.length===2&&near(pr.refs[1].horsCmdM2,250)&&near(pr.refs[0].horsCmdM2,0)&&near(pr.refs[0].perteM2+pr.refs[1].perteM2,mmB.perteM2,0.2),'_l528ParRef : la fiche reste VENTILABLE, 250 m² sur B et 0 sur A, Σ pertes = fiche (mutation « sous-fiches heritant de tout » → rouge)');
  const b0=T(()=>_l530Bilan(FM(undefined),mm0)), b1=T(()=>_l530Bilan(fB,mmB));
  ok(b0&&b1&&b0.ok&&b1.ok&&near(b0.decoupesM2,b1.decoupesM2)&&near(b0.livresM2,b1.livresM2)&&near(b0.surplusM2,b1.surplusM2),'livres / decoupes / surplus IDENTIQUES avec et sans bobineaux hors commande (decision 6)'); }

console.log('── 3. instantane, signature, correction admin (diff PUR, EXECUTE) ──');
{ const f={mother:2100,useful:2090,blade:0,longueur:'1000',ficheDetail:[L('1x1180'),L('1x1180')]};
  const mat=_l513Matiere(f); const fOld=Object.assign({},f,{mat:mat}); const fMix=Object.assign({},f,{mat:mat,horsCmd:{rep:'oui',items:[{n:1,w:200}]}});
  ok(_l513MatiereOf(fOld)===mat,'_l513MatiereOf : fiche sans bobineaux → l instantane est servi tel quel');
  const mx=_l513MatiereOf(fMix); ok(mx!==mat&&typeof mx.horsCmdM2==='number'&&near(mx.horsCmdM2,200),'_l513MatiereOf : instantane pose par un poste L558 (sans horsCmdM2) sur une fiche AVEC bobineaux → calcul vif (jamais une perte qui les ignore)');
  const fOk=Object.assign({},fMix,{mat:_l513Matiere(fMix)}); ok(_l513MatiereOf(fOk)===fOk.mat,'_l513MatiereOf : instantane L559 complet → servi');
  const s0=_l513MatSig(f,f.ficheDetail), s1=_l513MatSig(Object.assign({},f,{horsCmd:{rep:'oui',items:[{n:1,w:200}]}}),f.ficheDetail), s2=_l513MatSig(Object.assign({},f,{horsCmd:{rep:'aucun',items:[]}}),f.ficheDetail);
  ok(s0!==s1&&s1!==s2&&s0!==s2,'_l513MatSig voit la saisie (oui / aucun / rien : 3 signatures differentes)');
  const D=_l559EditDiff;
  ok(T(()=>D(f,'',null,{txt:'',sel:null}).chg===false),'EditDiff : fiche d AVANT le lot, champ laisse vide → RIEN (jamais un « aucun » invente — contre-lecture, bloquant)');
  ok(T(()=>D(Object.assign({},f,{horsCmd:{rep:'non-demande',items:[]}}),'',null,{txt:'',sel:null}).chg===false&&D(Object.assign({},f,{horsCmd:{rep:'sans-reste',items:[]}}),'',null,{txt:'',sel:null}).chg===false),'EditDiff : fiche « non-demande » / « sans-reste », champ vide → RIEN');
  ok(T(()=>{ const r=D(Object.assign({},f,{horsCmd:{rep:'oui',items:[{n:2,w:120}]}}),'2×120',null,{txt:'2×120',sel:null}); return r.chg===false; }),'EditDiff : reponse « oui » inchangee (texte identique) → RIEN (by / at / auto conserves, f.mat pas recalcule)');
  ok(T(()=>{ const r=D(Object.assign({},f,{horsCmd:{rep:'oui',items:[{n:2,w:120}]}}),'',null,{txt:'2×120',sel:null}); return r.chg===true&&r.hc.rep==='aucun'&&r.hc.admin===true; }),'EditDiff : une vraie reponse « oui » EFFACEE → « aucun » explicite');
  ok(T(()=>{ const r=D(f,'2×120 + 1×80',null,{txt:'',sel:null}); return r.chg===true&&r.hc.rep==='oui'&&r.hc.items.length===2&&r.hc.items[1].w===80; }),'EditDiff : saisie nouvelle → « oui » 2 lots');
  ok(T(()=>{ const r=D(f,'3',null,{txt:'',sel:null}); return r.chg===false&&Array.isArray(r.err)&&r.err[0]==='3'; }),'EditDiff : « 3 » seul → erreur explicite (rien n est ecrit)');
  ok(T(()=>{ const fm={refGroups:[{ref:'A',longueur:'1000'},{ref:'B',longueur:'500'}],horsCmd:{rep:'oui',items:[{n:1,w:100,refIdx:0}]}}; const r=D(fm,'1×100','1',{txt:'1×100',sel:'0'}); return r.chg===true&&r.hc.items[0].refIdx===1&&r.hc.items[0].ref==='B'; }),'EditDiff : seul le selecteur de reference change → reattribution explicite');
  const SV=F('saveFicheConfigs');
  ok(/const _d=_l559EditDiff\(f,_ef\.value,_sel\?_sel\.value:null,\{txt:_ef\.dataset\.init,sel:_sel\?_sel\.dataset\.init:null\}\);/.test(SV)&&/if\(_d\.chg\)\{ _hcNew=Object\.assign\(\{\},_d\.hc,\{by:_ini\(\),at:isoNow\(\)\}\); if\(f\.horsCmd&&f\.horsCmd\.rep\) _hcNew\.prev=/.test(SV)&&/const _hcChg=\(_hcNew!==undefined\);/.test(SV)&&/if\(_sigOld!==_sigNew\|\|_hcChg\)\{/.test(SV)&&/if\(_hcChg\) upd\.horsCmd=_hcNew;/.test(SV),'saveFicheConfigs : diff PUR contre data-init, reponse precedente gardee en trace (prev), recalcul de f.mat seulement si la saisie change');
  ok(/if\(_d\.err\)\{ const _m='❌ Bobineaux hors commande : « '/.test(SV)&&/document\.getElementById\('ef_horscmd_err'\)/.test(SV),'saveFicheConfigs : segment illisible = refus explicite, affiche DANS la fenetre (le toast passe dessous)');
  const EF=F('editFicheConfigs');
  ok(/id="ef_horscmd"/.test(EF)&&/data-init="'\+esc\(\(typeof _l559Txt==='function'\)\?_l559Txt\(f\.horsCmd\):''\)\+'"/.test(EF)&&/typeof canManageData==='function'&&canManageData\(\)\)\?\('<div style="grid-column:1\/-1"><label/.test(EF)&&/id="ef_horscmd_ref" data-init="/.test(EF)&&/id="ef_horscmd_err"/.test(EF),'fenetre Modifier : champ texte avec son etat initial (data-init), reserve au pilotage / admin, selecteur de reference en multi-ref, zone d erreur');
  ok(/valide:data\.valide===true,hc:\(\(data\.horsCmd&&data\.horsCmd\.rep\)\?\[data\.horsCmd\.rep,/.test(F('_ficheEditSig')),'verrou optimiste d edition : voit la saisie'); }

console.log('── 4. lecture d une saisie texte, items, lignes incompletes, texte, fiche (EXECUTE) ──');
{ ok(T(()=>{ const p1=_l559Parse('2×120 + 1×80'); return p1.items.length===2&&p1.items[0].n===2&&p1.items[0].w===120&&p1.items[1].w===80&&!p1.bad.length; }),'« 2×120 + 1×80 » → 2 lots');
  ok(T(()=>{ const p2=_l559Parse('2x120\n1*80; 3 X 50,5'); return p2.items.length===3&&p2.items[2].w===50.5&&!p2.bad.length; }),'retours a la ligne, ; x * X, virgule decimale → 3 lots (parseConf ne coupait pas les retours a la ligne)');
  ok(T(()=>{ const p3=_l559Parse('3'); return p3.items.length===0&&p3.bad.length===1; }),'« 3 » seul : ILLISIBLE (parseConf en faisait 1 bobineau de 3 mm)');
  ok(T(()=>{ const p4=_l559Parse('2,5×80'); return p4.items.length===0&&p4.bad.length===1; }),'quantite decimale : illisible');
  ok(T(()=>_l559Parse('').items.length===0&&_l559Parse('').bad.length===0),'vide : rien (= aucun)');
  ok(T(()=>_l559Items({rep:'oui',items:[{n:'2',w:'120'},{n:0,w:50},{n:1,w:0},{n:1.5,w:80}]}).length===1),'_l559Items : seules les lignes quantite ENTIERE >= 1 et largeur >= 1 comptent');
  ok(T(()=>{ const i=_l559Incomplets({rep:'oui',items:[{n:2,w:120},{n:3,w:0},{n:0,w:0},{n:0,w:40}]}); return i.length===2&&i[0].k===1&&i[1].k===3; }),'_l559Incomplets : « 3 × (vide) » et « (vide) × 40 » sont incompletes ; « 0 × 0 » (jamais touchee) ne compte pas');
  ok(T(()=>_l559Txt({rep:'oui',items:[{n:2,w:120},{n:1,w:80.5}]})==='2×120 + 1×80.5'&&_l559Txt({rep:'aucun'})===''),'_l559Txt : « 2×120 + 1×80.5 » / vide');
  global.document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]}; window._l559Hc=null; global.ficheLines=[];
  ok(T(()=>{ const h0=_l559HcForFiche({}); return h0.rep==='non-demande'&&Array.isArray(h0.items)&&!h0.items.length&&typeof h0.at==='string'; }),'sans reponse : {rep:non-demande} (jamais undefined)');
  ok(T(()=>{ window._l559Repli=true; const h=_l559HcForFiche({}); return h.rep==='repli'&&window._l559Repli===false; }),'un affichage qui a plante (repli trace) : {rep:repli}');
  window._l559Hc={rep:'oui',items:[{n:1,w:100,ref:'KX',refIdx:0,refIdKey:'k',auto:true},{n:0,w:5}],by:'OP',at:'2026-11-04T10:00:00Z'};
  ok(T(()=>{ const h1=_l559HcForFiche({}); return h1.rep==='oui'&&h1.items.length===1&&h1.items[0].n===1&&h1.items[0].w===100&&h1.items[0].ref==='KX'&&h1.items[0].refIdx===0&&h1.items[0].refIdKey==='k'&&h1.items[0].auto===true&&h1.by==='OP'&&JSON.stringify(h1).indexOf('undefined')<0; }),'« oui » : lignes valides seules, ref / refIdx / refIdKey / auto conserves, pas d undefined');
  window._l559Hc={rep:'oui',items:[{n:1,w:0}],by:'OP',at:'x'}; ok(T(()=>_l559HcForFiche({}).rep==='non-demande'),'« oui » sans aucune ligne valide (rotation, encadre retire) : pas une reponse → non-demande');
  window._l559Hc={rep:'aucun',items:[],by:'OP',at:'x'}; ok(T(()=>_l559HcForFiche({}).rep==='aucun'&&_l559HcSer().rep==='aucun'&&_l559HcSer()!==window._l559Hc),'« aucun » ; _l559HcSer = copie profonde pour le brouillon'); window._l559Hc=null; ok(T(()=>_l559HcSer()===null),'_l559HcSer : null sans reponse (jamais undefined)'); }

/* ── DOM factice : b1 coupee par moi (reste 910), b2x coupee par un collegue (910), b3 derniere (non coupee) ; conteneurs VB (volet ouvert) et MMB (fenetre manque-matiere) ── */
const DOM={}, MMDOM={}; let toasts=[], autosaves=0, landscape=true, outer=[], cc=0, closed=0, created=[];
function mkCL(){ const s=new Set(); return {contains:c=>s.has(c),add:c=>{s.add(c);},remove:c=>{s.delete(c);},toggle:(c,v)=>{ if(v) s.add(c); else s.delete(c); }}; }
function mk(id,props,reg){ const R2=reg||DOM; const el=Object.assign({id:id,value:'',textContent:'',innerHTML:'',_outer:'',classList:mkCL(),querySelector(){ return null; },querySelectorAll(){ return []; },dataset:{},style:{},checked:false,getBoundingClientRect(){ return {height:44,width:100,left:0,top:0}; },scrollIntoView(){},animate(){},onclick:null},props||{}); Object.defineProperty(el,'outerHTML',{set(v){ outer.push(v); el._outer=v; },get(){ return ''; }}); el.remove=function(){ delete R2[id]; }; R2[id]=el; return el; }
const VB={querySelector:(q)=>DOM[q.replace(/^#/,'')]||null};   /* corps du volet OUVERT */
let voletOuvert=true;
global.document={getElementById:id=>DOM[id]||null, querySelector:(sel)=>((sel==='#victoryOverlay.open #victoryBody'&&voletOuvert)?VB:null), querySelectorAll:()=>[], createElement:()=>{ const e=mk('_tmp'+Math.random(),{}); created.push(e); return e; }, body:{classList:mkCL(),appendChild(){}}, activeElement:null};
global.showToast=function(m,k){ toasts.push([String(m),k||'']); };
global.autosaveDraftTick=function(){ autosaves++; };
global._ini=()=>'OP'; global.getUseful=()=>2090; global.getBlade=()=>0;
global.fmmIsMulti=()=>false; global.fmmRawRefs=()=>[]; global.serializeRefGroups=()=>[]; global.getRefGroups=()=>[{ref:'KX1045-1',longueur:'1000'}];
global.refDispCtx=(r)=>String(r); global._l527LotLbl=()=>''; global._l527DomIdx=(l)=>(typeof l.refIdx==='number'?l.refIdx:-1);
global._isLandscapeFiche=()=>landscape; global._l558VoletHtml=()=>'';
global.victoryClose=function(){ closed++; }; global.confirmCommandeRecap=function(){ cc++; }; global._victoryArmed=false;
function fixture(cutB1,cutB2x,cutB3){ for(const k of Object.keys(DOM)) delete DOM[k]; for(const k of Object.keys(MMDOM)) delete MMDOM[k]; toasts=[]; autosaves=0; outer=[]; landscape=true; cc=0; closed=0; voletOuvert=true; window._l559Hc=null; window._l559MM=false; window._l559Repli=false; global._victoryArmed=false;
  global.ficheLines=[{id:'b1',ref:'KX1045-1',useful:2090,blade:0},{id:'b2x',ref:'KX1045-1',useful:2090,blade:0},{id:'b3',ref:'KX1045-1',useful:2090,blade:0}];
  mk('b1'); if(cutB1) DOM.b1.classList.add('coupee'); mk('flConf_b1',{value:'1×1180'}); mk('pos_b1',{textContent:'1/3'});
  mk('b2x'); if(cutB2x){ DOM.b2x.classList.add('coupee'); DOM.b2x.classList.add('coupee-other'); } mk('flConf_b2x',{value:'1×1180'}); mk('pos_b2x',{textContent:'2/3'});
  mk('b3'); if(cutB3) DOM.b3.classList.add('coupee'); mk('flConf_b3',{value:'1×1180'}); mk('pos_b3',{textContent:'3/3'});
  mk('fInitiales',{value:'op'}); mk('fLongueur',{value:'1000'}); }
const L1=()=>ficheLines[0];

console.log('── 5. restes vifs, sans-reste automatique, encadre, garde, saisie (EXECUTE sur DOM factice) ──');
fixture(true,true,false);
ok(T(()=>{ const D=_l559RestesVifs(false); return Object.keys(D).join()==='mono'&&D.mono.ng.length===2&&near(D.mono.ng[0],910)&&D.mono.chute.length===0&&D.mono.ml===1000; }),'_l559RestesVifs : 2 restes NON gardes de 910 mm (la bobine du collegue comprise : le plafond de la commande), longueur 1000 m');
ok(T(()=>{ const D=_l559RestesVifs(true); return D.mono.ng.length===1&&D.mono.chute.length===0&&near(D.mono.ng[0],910); }),'_l559RestesVifs(mineOnly) : a l arret manque-matiere, seulement les bobines coupees par moi ; le collegue a coupe la derniere (2/3) : c est ELLE le solde de l archive, mon reste reste non garde');
ok(T(()=>{ DOM.b2x.classList.remove('coupee'); DOM.b2x.classList.remove('coupee-other'); const D=_l559RestesVifs(true); const Dv=_l559RestesVifs(false); DOM.b2x.classList.add('coupee'); DOM.b2x.classList.add('coupee-other'); return D.mono.ng.length===0&&D.mono.chute.length===1&&near(D.mono.chute[0],910)&&Dv.mono.ng.length===1&&Dv.mono.chute.length===0; }),'ma bobine 1/3 coupee en DERNIER puis arret manque-matiere : son reste devient le solde (chute, comme lastIdx de l archive) ; dans le volet normal (commande complete) il reste non garde');
ok(T(()=>_l559ARestes(_l559RestesVifs(false))===true),'_l559ARestes : il y a un reste >= 20 mm');
fixture(true,true,true);
ok(T(()=>{ const D=_l559RestesVifs(false); return D.mono.ng.length===2&&D.mono.chute.length===1&&near(D.mono.chute[0],910); }),'derniere bobine coupee : son reste est dans « chute » (solde de la regle), pas dans « ng »');
fixture(false,false,false);
ok(T(()=>{ landscape=false; const h=_l559VoletHtml(); landscape=true; return h===''&&window._l559Hc===null; }),'portrait : encadre VIDE, aucune reponse posee (regle 3)');
ok(T(()=>{ const h=_l559VoletHtml(); return /rien à déclarer/.test(h)&&/noté automatiquement/.test(h)&&window._l559Hc&&window._l559Hc.rep==='sans-reste'&&window._l559Hc.by==='OP'; }),'aucune bobine coupee avec un reste >= 20 mm : ligne grise + reponse « sans-reste » notee toute seule, initiales (decision 3)');
ok(T(()=>{ window._l559Hc={rep:'aucun',items:[],by:'OP',at:'x'}; _l559VoletHtml(); return window._l559Hc.rep==='aucun'; }),'un « aucun » explicite n est JAMAIS remplace par « sans-reste »');
ok(T(()=>_l559PeutEnvoyer()===true),'_l559PeutEnvoyer : pas de bloc dans le volet ouvert → true (jamais un envoi bloque sans question visible)');
fixture(true,true,false);
ok(T(()=>{ window._l559Hc={rep:'sans-reste',items:[]}; const h=_l559VoletHtml(); return /HORS COMMANDE, pour le stock/.test(h)&&/Aucun<\/button>/.test(h)&&/Oui, j’en ai coupé<\/button>/.test(h)&&window._l559Hc===null; }),'des restes existent : un « sans-reste » perime est efface, la question est posee (deux boutons)');
ok(T(()=>{ const h=_l559VoletHtml(); return !/l559-sel/.test(h)&&!/l559-row/.test(h)&&/obligatoire, même pour dire « aucun »/.test(h); }),'sans reponse : aucun bouton selectionne, pas de cases, mention « obligatoire »');
ok(T(()=>{ global.document.querySelector=(s)=>(s==='.fiche-line.coupee-other'?DOM.b2x:((s==='#victoryOverlay.open #victoryBody'&&voletOuvert)?VB:null)); const h=_l559VoletHtml(); const hm=_l559VoletHtml({mm:true}); global.document.querySelector=(sel)=>((sel==='#victoryOverlay.open #victoryBody'&&voletOuvert)?VB:null); return /Commande à plusieurs/.test(h)&&h.indexOf('Commande à plusieurs')<h.indexOf('l559-row')||(/Commande à plusieurs/.test(h)&&!/l559-row/.test(h)&&!/Commande à plusieurs/.test(hm)); }),'commande partagee : le rappel « compte aussi ceux du collegue » est sous la question AVANT toute reponse (volet), et absent de la fenetre de l arret (seules mes bobines y comptent)');
mk('l559Volet');
ok(T(()=>_l559Box('l559Volet')===DOM.l559Volet&&_l559PeutEnvoyer()===false),'_l559Box / _l559PeutEnvoyer : bloc present dans le volet OUVERT, pas de reponse → false');
ok(T(()=>{ voletOuvert=false; const r=_l559PeutEnvoyer(); voletOuvert=true; return r===true; }),'volet FERME (encadre resté dans la page) : pas de bloc actif → true (jamais un envoi bloque sans question visible — contre-lecture)');
ok(T(()=>{ victoryConfirm(); return cc===0&&closed===0&&global._victoryArmed===false&&toasts.length===1&&/Réponds à/.test(toasts[0][0])&&toasts[0][1]==='err'; }),'victoryConfirm SANS reponse : refuse (pas d envoi, volet pas ferme, pas arme, toast) — mutation « garde absente » → rouge');
ok(T(()=>{ window._l355SameClient={cli:'X'}; victoryConfirm(); return window._l355SameClient===null; }),'refus depuis « Même client » : l intention est purgee (sinon elle s appliquerait au tap suivant)');
ok(T(()=>{ _l559Set('aucun'); const h=window._l559Hc; return h.rep==='aucun'&&h.by==='OP'&&typeof h.at==='string'&&h.sig.indexOf('1×1180')>=0&&autosaves===1; }),'_l559Set(aucun) : reponse tracee (qui, quand, empreinte des bobines), brouillon auto');
ok(T(()=>{ const h=_l559VoletHtml(); return /l559-sel/.test(h)&&/aucun bobineau hors commande/.test(h)&&/Réponse de OP/.test(h); }),'rendu « aucun » : bouton selectionne, ligne de confirmation avec les initiales');
ok(T(()=>_l559PeutEnvoyer()===true),'_l559PeutEnvoyer : « aucun » → true');
ok(T(()=>{ victoryConfirm(); return cc===1&&closed===1&&global._victoryArmed===true; }),'victoryConfirm avec « aucun » : le volet se ferme, l envoi arme part (branche armee intacte)');
ok(T(()=>{ DOM.flConf_b1.value='1×1000'; const h=_l559VoletHtml(); DOM.flConf_b1.value='1×1180'; return /Les bobines ont changé depuis la réponse de OP/.test(h)&&/touche à nouveau ta réponse/.test(h); }),'les bobines changent apres la reponse : avertissement « a verifier, touche a nouveau », jamais un effacement silencieux');
ok(T(()=>{ _l559Set('oui'); const h=window._l559Hc; return h.rep==='oui'&&h.items.length===1&&h.items[0].n===1&&h.items[0].w===0&&_l559PeutEnvoyer()===false; }),'_l559Set(oui) : une ligne « 1 × (vide) » prete a saisir ; pas encore envoyable');
ok(T(()=>{ victoryConfirm(); return cc===1&&/largeur manquante/.test(toasts[toasts.length-1][0]); }),'victoryConfirm avec « oui » et une ligne incomplete : refuse, consigne precise (ligne 1 : largeur manquante)');
ok(T(()=>{ _l559Row(0,'w','100'); const h=window._l559Hc; return h.items[0].w===100&&_l559PeutEnvoyer()===true&&_l559HcForFiche({}).items[0].w===100; }),'_l559Row : saisie de la largeur → envoyable, part dans la fiche');
ok(T(()=>{ const r=_l559ResumeHtml(_l559RestesVifs(false)); return /= 1 bobineau · /.test(r)&&/m² pour toute la commande/.test(r)&&!/⚠/.test(r); }),'resume : « = 1 bobineau · 100 m² pour toute la commande », pas d avertissement');
ok(T(()=>{ _l559RowAdd(0); const n=window._l559Hc.items.length; const r=_l559ResumeHtml(_l559RestesVifs(false)); const peut=_l559PeutEnvoyer(); _l559RowDel(n-1); return n===2&&/Ligne 2 : largeur manquante/.test(r)&&peut===false; }),'« + une autre largeur » laissee vide : signalee en orange dans le resume ET l envoi est refuse (jamais une ligne perdue en silence)');
ok(T(()=>{ _l559RowAdd(0); _l559RowAdd(500); const h=window._l559Hc; const n=h.items.length; const w2=h.items[1].w; _l559RowDel(1); return n===2&&w2===500&&h.items.length===1; }),'touche rapide : REMPLIT la ligne vide au lieu d en ajouter une (puis retrait)');
ok(T(()=>{ _l559Row(0,'w','500'); _l559RowAdd(0); _l559RowAdd(500); const h=window._l559Hc; const r=(h.items.length===2&&h.items[0].n===1&&h.items[1].w===500); _l559RowDel(1); _l559Row(0,'w','100'); return r; }),'touche rapide d une largeur deja saisie : la ligne VIDE est remplie d abord (pas de +1 sur l autre ligne, pas de ligne fantome)');
ok(T(()=>{ _l559Row(0,'w','950'); const r=_l559ResumeHtml(_l559RestesVifs(false)); return /950 mm ne tient dans aucun reste \(le plus grand fait 910 mm\)/.test(r)&&/l’envoi reste possible/.test(r); }),'controle par LARGEUR : 950 > 910 → avertissement, jamais bloquant');
ok(T(()=>{ _l559Row(0,'w','500'); _l559Row(0,'n','3'); const r=_l559ResumeHtml(_l559RestesVifs(false)); return /3 × 500 mm demandés, place pour 2 au plus dans les restes/.test(r); }),'controle par NOMBRE : 3 × 500 dans 2 restes de 910 (capacite 2) → avertissement');
ok(T(()=>{ _l559Row(0,'n','1'); DOM.b3.classList.add('coupee'); _l559Row(0,'w','500'); _l559RowAdd(500); _l559RowAdd(500); const r=_l559ResumeHtml(_l559RestesVifs(false)); DOM.b3.classList.remove('coupee'); return /= 3 bobineau/.test(r)&&/pris en partie dans un reste gardé ou le solde/.test(r)&&!/⚠/.test(r); }),'3 × 500 avec 2 restes non gardes + le solde : tient, note « sortiront des chutes gardees » (decision 1)');
ok(T(()=>{ const n=window._l559Hc.items.length; _l559RowAdd(0); return window._l559Hc.items.length===n+1&&window._l559Hc.items[n].w===0; }),'« + une autre largeur » ajoute une ligne vide quand aucune ligne n est vide');
ok(T(()=>{ _l559RowDel(0); _l559RowDel(0); const h=window._l559Hc; return h.items.length>=1; }),'retirer la derniere ligne laisse toujours une ligne (jamais un « oui » sans case)');
ok(T(()=>{ const k=_l559KeysHtml(_l559RestesVifs(false)); return /onclick="_l559RowAdd\(910\)">\+1 × 910<\/button>/.test(k); }),'touche rapide tiree des restes : « +1 × 910 » (lame 0)');
ok(T(()=>{ ficheLines.forEach(function(l){ l.blade=5; }); const k=_l559KeysHtml(_l559RestesVifs(false)); ficheLines.forEach(function(l){ l.blade=0; }); return /\+1 × 905</.test(k)&&!/× 910</.test(k); }),'lame 5 mm (FEBA) : la touche propose 905 (largeur du reste MOINS la lame : ce qu elle propose tient toujours)');
ok(T(()=>/910, 910 mm non gardé/.test(_l559DispoTxt(_l559RestesVifs(false)))),'aide-memoire des restes disponibles');
ok(T(()=>{ global.document.querySelector=(s)=>(s==='.fiche-line.coupee-other'?DOM.b2x:((s==='#victoryOverlay.open #victoryBody'&&voletOuvert)?VB:null)); const t=_l559PartageTxt(); global.document.querySelector=(sel)=>((sel==='#victoryOverlay.open #victoryBody'&&voletOuvert)?VB:null); return /Commande à plusieurs/.test(t); }),'commande partagee : rappel « compte aussi les bobineaux coupes par le collegue »');

console.log('── 6. multi-reference : reference par ligne si longueurs differentes, repartition automatique sinon, index DOM (EXECUTE) ──');
fixture(true,false,false);
global.fmmIsMulti=()=>true; global.fmmRawRefs=()=>[{idx:1,ref:'KX-A',refKey:'a',longueur:'1000'},{idx:2,ref:'KX-B',refKey:'b',longueur:'1000'}]; global.serializeRefGroups=()=>[{ref:'VIDE'},{ref:'KX-A'},{ref:'KX-B'}]; global._l507KeyOf=(g)=>'k:'+(g&&g.ref);
global._l527DomIdx=(l)=>(typeof l.refIdx==='number'?l.refIdx+1:-1);   /* bloc VIDE en tete : index du plan calcule 0/1 → index DOM 1/2 (jumeau _l527DomIdx) */
global.ficheLines=[{id:'b1',ref:'KX-A',refIdx:0,useful:2090,blade:0},{id:'b2x',ref:'KX-B',refIdx:1,useful:2090,blade:0},{id:'b3',ref:'KX-B',refIdx:1,useful:2090,blade:0}];
DOM.b2x.classList.add('coupee');
ok(T(()=>{ const Rf=_l559Refs(); return Rf.length===2&&Rf[1].refIdKey==='k:KX-B'&&Rf[1].ml===1000&&_l559RefsDiff()===false; }),'2 references de meme longueur : pas de selecteur (RefsDiff false)');
ok(T(()=>{ const D=_l559RestesVifs(false); return D.g1&&D.g2&&D.g1.chute.length===1&&D.g1.ng.length===0&&D.g2.ng.length===1&&!D.g0; }),'restes vifs par reference avec un bloc VIDE en tete : g1 (seule bobine de A = solde → chute), g2 (reste non garde) — index DOM via _l527DomIdx (mutation « refIdx brut » → rouge)');
ok(T(()=>{ _l559Set('oui'); const it=window._l559Hc.items[0]; return typeof it.refIdx==='number'&&it.auto===true&&it.refIdKey&&it.ref; }),'longueurs egales : la reference est attribuee toute seule (auto:true) avec ref / refIdx / refIdKey');
ok(T(()=>!/<select/.test(_l559RowsHtml(window._l559Hc))),'pas de selecteur dans les cases');
ok(T(()=>{ global.ficheLines=[{id:'b1',ref:'KX-A',refIdx:0,useful:2090,blade:0},{id:'b2x',ref:'KX-B',refIdx:1,useful:2090,blade:0},{id:'b3',ref:'KX-A',refIdx:0,useful:2090,blade:0},{id:'b4',ref:'KX-B',refIdx:1,useful:2090,blade:0}]; mk('b4'); mk('flConf_b4',{value:'1×1180'}); const D=_l559RestesVifs(false); const out=_l559Repartir([{n:2,w:800,refIdx:1,auto:true}],D); return D.g1.ng.length===1&&D.g2.ng.length===1&&out.length===2&&out.every(function(o){ return o.n===1&&o.auto===true; })&&out.map(function(o){ return o.refIdx; }).sort().join()==='1,2'; }),'repartition auto : 2 × 800 avec un reste NON garde de 910 sur A et un sur B → 1 bobineau sur CHAQUE reference (restes non gardes d abord, reservoirs par seau, _l528ParRef concordant — contre-lecture)');
ok(T(()=>{ const D=_l559RestesVifs(false); const out=_l559Repartir([{n:3,w:800,refIdx:1,auto:true}],D); const byRef={}; out.forEach(function(o){ byRef[o.refIdx]=(byRef[o.refIdx]||0)+o.n; }); return out.reduce(function(s,o){ return s+o.n; },0)===3&&byRef[1]===2&&byRef[2]===1; }),'repartition auto : 3 × 800 avec 1 reste non garde par reference → 1 + 1 dans les restes, le 3e sur la reference choisie (depassement signale, jamais perdu)');
ok(T(()=>{ const D=_l559RestesVifs(false); const out=_l559Repartir([{n:1,w:800,refIdx:1,auto:true},{n:1,w:700,refIdx:1,auto:true}],D); const refs=out.map(function(o){ return o.refIdx; }).sort().join(); return out.length===2&&refs==='1,2'; }),'PLUSIEURS lignes (1 × 800 puis 1 × 700) : capacite PARTAGEE entre les lignes → une sur chaque reference (contre-lecture 2 : avant, tout partait sur la premiere)');
ok(T(()=>{ window._l559Hc={rep:'oui',items:[{n:1,w:800,refIdx:1,auto:true},{n:1,w:700,refIdx:1,auto:true}],by:'OP',at:'x',sig:''}; const r=_l559ResumeHtml(_l559RestesVifs(false)); return /= 2 bobineaux/.test(r)&&!/⚠/.test(r)&&!/place pour/.test(r); }),'resume avec 2 lignes qui tiennent grace a la repartition : aucun faux avertissement « place pour N au plus »');
ok(T(()=>{ window._l559Hc={rep:'oui',items:[{n:2,w:800,refIdx:1,auto:true},{n:1,w:700,refIdx:1,auto:true}],by:'OP',at:'x',sig:''}; const r=_l559ResumeHtml(_l559RestesVifs(false)); return /2 × 800 mm demandés, place pour 1 au plus|1 × 700 mm demandés, place pour 0 au plus/.test(r); }),'3 bobineaux pour 2 restes : la capacite partagee produit un avertissement (une des lignes ne tient pas)');
ok(T(()=>{ window._l559Hc={rep:'oui',items:[{n:1,w:800,refIdx:1,auto:true},{n:1,w:700,refIdx:1,auto:true}],by:'OP',at:'x',sig:''}; const f=_l559HcForFiche({}); const refs=f.items.map(function(o){ return o.refIdx; }).sort().join(); return f.rep==='oui'&&f.items.length===2&&refs==='1,2'&&f.items.every(function(o){ return o.ref&&o.refIdKey&&o.auto===true; }); }),'_l559HcForFiche en multi-ref de meme longueur : les lignes partent REPARTIES avec ref / refIdx / refIdKey / auto');
ok(T(()=>{ DOM.b2x.classList.add('coupee-other'); const Dm=_l559RestesVifs(true); const f=_l559HcForFiche({manqueMatiere:true}); DOM.b2x.classList.remove('coupee-other'); return !Dm.g2&&f.items.every(function(o){ return o.refIdx===1; }); }),'arret manque-matiere : la bobine du COLLEGUE est exclue des restes et de la repartition (mineOnly)');
global.fmmRawRefs=()=>[{idx:1,ref:'KX-A',refKey:'a',longueur:'1000'},{idx:2,ref:'KX-B',refKey:'b',longueur:'500'}];
ok(T(()=>_l559RefsDiff()===true&&/<select aria-label="Référence"/.test(_l559RowsHtml(window._l559Hc))&&/500 m · KX-B/.test(_l559RowsHtml(window._l559Hc))),'longueurs differentes : un selecteur de reference par ligne, libelle « longueur m · ref » (la longueur en tete, lisible en mode atelier)');
ok(T(()=>{ _l559Row(0,'ref','2'); const it=window._l559Hc.items[0]; return it.refIdx===2&&it.ref==='KX-B'&&it.refIdKey==='k:KX-B'&&it.auto===undefined; }),'choix de la reference : ref / refIdx / refIdKey poses, auto retire');
global.fmmIsMulti=()=>false; global.fmmRawRefs=()=>[]; global.serializeRefGroups=()=>[]; global._l527DomIdx=(l)=>(typeof l.refIdx==='number'?l.refIdx:-1);

console.log('── 7. fenetre manque-matiere : conteneur actif, refus dedans, « Ne pas arreter », saut si rien a decider (EXECUTE, asynchrone) ──');
const MMB={querySelector:(q)=>MMDOM[q.replace(/^#/,'')]||null};
function mkMM(){ const ov=mk('l559MMOverlay',{style:{display:'none'},onclick:null}); const body=mk('l559MMBody',{querySelector:MMB.querySelector}); Object.defineProperty(body,'innerHTML',{set(v){ body._html=v; if(/id="l559Volet"/.test(v)) mk('l559Volet',{},MMDOM); else delete MMDOM.l559Volet; if(/id="l558Volet"/.test(v)) mk('l558Volet',{},MMDOM); else delete MMDOM.l558Volet; },get(){ return body._html||''; }}); mk('l559MMErr',{style:{display:'none'}}); mk('l559MMNo'); mk('l559MMYes'); return ov; }
(async function(){
  const A=async(f)=>{ try{ return await f(); }catch(e){ console.log('   (exception : '+(e&&e.message||e)+')'); return 'EXC'; } };
  fixture(true,true,false); mkMM(); mk('l559Volet');   /* un encadre CACHE traine dans le volet (ferme) */
  voletOuvert=false; landscape=false;
  const rP=await A(()=>_l559AskMM()); landscape=true;
  ok(rP===true&&window._l559MM===false&&DOM.l559MMOverlay.style.display!=='flex','portrait : la fenetre ne s ouvre pas, resolue VRAIE (la fiche part « non-demande »)');
  let p=A(()=>_l559AskMM()); await new Promise(r=>setTimeout(r,10));
  ok(T(()=>window._l559MM===true&&DOM.l559MMOverlay.style.display==='flex'&&!!MMDOM.l559Volet&&DOM.l559MMOverlay.onclick===null),'paysage : fenetre ouverte, encadre rendu DEDANS, pas d annulation par un appui sur le fond');
  ok(T(()=>_l559Box('l559Volet')===MMDOM.l559Volet&&_l559Box('l559Volet')!==DOM.l559Volet),'_l559Box vise l encadre de la FENETRE, pas la copie cachee du volet (bloquant de la contre-lecture)');
  ok(T(()=>{ window._l559Hc=null; DOM.l559MMYes.onclick(); return window._l559MM===true&&DOM.l559MMOverlay.style.display==='flex'&&DOM.l559MMErr.style.display==='block'&&/Réponds à/.test(DOM.l559MMErr.textContent); }),'« Enregistrer l arret » sans reponse : refus affiche DANS la fenetre (le toast passe dessous), la fenetre reste ouverte');
  ok(T(()=>{ _l559Set('oui'); return /l559-row/.test(MMDOM.l559Volet._outer||'')&&!(DOM.l559Volet._outer)&&DOM.l559MMErr.style.display==='none'; }),'« Oui » dans la fenetre : les cases apparaissent DANS la fenetre (c est l encadre de la FENETRE qui est redessine, pas la copie cachee), l erreur s efface');
  ok(T(()=>{ DOM.l559MMNo.onclick(); return true; })===true,'(Ne pas arreter)');
  const rNo=await p;
  ok(rNo===false&&window._l559MM===false&&DOM.l559MMOverlay.style.display==='none'&&!MMDOM.l559Volet,'« Ne pas arreter » : resolue FAUSSE, fenetre fermee et VIDEE (plus d encadre fantome)');
  ok(T(()=>{ voletOuvert=true; const r=_l559Box('l559Volet')===DOM.l559Volet&&_l559PeutEnvoyer()===false; voletOuvert=false; return r; }),'volet ouvert APRES une fenetre manque-matiere refermee : c est bien l encadre du volet qui est vise (le drapeau _l559MM est retombe)');
  window._l559Hc=null; p=A(()=>_l559AskMM()); await new Promise(r=>setTimeout(r,10));
  ok(T(()=>{ _l559Set('aucun'); DOM.l559MMYes.onclick(); return window._l559Hc&&window._l559Hc.rep==='aucun'; }),'Aucun puis Enregistrer l arret : reponse posee');
  const rYes=await p; ok(rYes===true&&window._l559MM===false&&window._l559Hc&&window._l559Hc.rep==='aucun','« Aucun » + « Enregistrer l arret » : resolue VRAIE, reponse en memoire pour la fiche partielle');
  fixture(false,false,false); mkMM(); voletOuvert=false;
  const rSkip=await A(()=>_l559AskMM());
  ok(rSkip===true&&DOM.l559MMOverlay.style.display!=='flex'&&window._l559Hc&&window._l559Hc.rep==='sans-reste','rien a decider (aucun reste, rien a garder) : pas d ecran de plus, « sans-reste » note, resolue VRAIE');
  fixture(true,true,true); voletOuvert=true;
  ok(T(()=>{ const D=_l559RestesVifs(true); return D.mono.ng.length===1&&D.mono.chute.length===1; }),'arret manque-matiere avec 2 bobines a moi (1/3 et 3/3) : la 3/3 est le solde (regle), la 1/3 reste un reste non garde (le collegue a coupe apres elle)');
  ok(T(()=>{ window._l559Repli=true; _l559Set('aucun'); return window._l559Repli===false; }),'un repli trace est efface des que l operateur repond');
  ok(T(()=>{ const w0=warns; const old=global._isLandscapeFiche; global._isLandscapeFiche=function(){ throw new Error('boum'); }; const h=_l559VoletHtml(); global._isLandscapeFiche=old; return h===''&&window._l559Repli===true&&warns===w0+1; }),'un affichage qui plante : encadre vide, repli trace (_l505Warn + drapeau _l559Repli)');
  window._l559Repli=false;

  console.log('── 8. parcours et jumeaux (forme) ──');
  const OV=F('_openVictory'), SM=F('stopManqueMatiere');
  ok(OV.indexOf("_l559VoletHtml():'')")>0&&OV.indexOf("_l559VoletHtml():'')")<OV.indexOf("_l558VoletHtml():'')")&&/📷 Photo des réglages MAVEG \? <span/.test(OV),'volet : l encadre bleu (L559) est rendu AVANT l encadre orange (L558) ; encadres L556 intacts');
  ok(/regl:_reglCount,reglMaveg:_reglMaveg,chronoZero:/.test(F('confirmCommandeRecap'))&&/if\(_armed\)\{ confirmCommande\(\); return; \}/.test(F('confirmCommandeRecap')),'confirmCommandeRecap : branche armee et parametres du volet INTACTS (la garde est dans victoryConfirm)');
  ok(/const _vb=document\.getElementById\('victoryBody'\); if\(_vb\) _vb\.innerHTML='';/.test(F('victoryClose')),'victoryClose vide le corps du volet (plus d encadre cache)');
  ok(SM.indexOf('Aucun solde à reprendre.`))) return;')>0&&SM.indexOf('const _r59=await _l559AskMM();')>SM.indexOf('Aucun solde à reprendre.`))) return;')&&SM.indexOf('const _r59=await _l559AskMM();')<SM.indexOf("let soldeState=null, soldeLabel='';")&&SM.indexOf('let _etq547=1;')<SM.indexOf("if(!confirm((_etq547?'':'🛑 AUCUNE PHOTO")&&/\+_ng558\+`⛔ Arrêt manque de matière \?/.test(SM)&&/if\(_r59===false\)\{ try\{ showToast\('↩ Arrêt manque de matière ANNULÉ/.test(SM),'arret manque-matiere : question APRES le confirm natif, AVANT le solde ; annulation DITE ; verrou _stoppingMM et ordre L547 / L558 intacts');
  ok(/try\{ if\(st\.fiche\) st\.fiche\.horsCmd=null; \}catch\(e\)\{\}   \/\* \[L559\] le solde est une NOUVELLE commande/.test(SM),'le solde manque-matiere repart sans reponse');
  ok(/planValidated:fichePlanValidated,horsCmd:_l559HcSer\(\)\},/.test(F('serializeFicheState')),'serializeFicheState : la reponse suit le brouillon (autosave, brouillon manuel, filet d envoi rate, partage, solde)');
  ok(/try\{ window\._l559Hc=\(st\.fiche&&st\.fiche\.horsCmd&&typeof st\.fiche\.horsCmd==='object'\)\?JSON\.parse\(JSON\.stringify\(st\.fiche\.horsCmd\)\):null; \}catch\(e\)\{ window\._l559Hc=null; \}/.test(F('restoreFicheState')),'restoreFicheState : pose explicitement la reponse (ou null : ancien brouillon = pas de reponse)');
  ok(/^  window\._l559Hc=null; window\._l559Repli=false;   \/\* \[L559\] nouvelle commande/m.test(F('resetAll')),'resetAll remet la question (et efface le repli)');
  ok(/^  window\._l559Hc=null; window\._l559Repli=false;   \/\* \[L559\] Parquer \/ Effacer/m.test(F('_newCmdClearLiveFiche')),'Parquer / Effacer remet la question (et efface le repli)');
  ok(/^  window\._l559Hc=null;   \/\* \[L559\] chargement d un plan/m.test(F('doLoad')),'chargement d un plan remet la question');
  ok(/try\{ if\(st\.fiche\) st\.fiche\.horsCmd=null; \}catch\(e\)\{\}   \/\* \[L559\] la reponse de l emetteur ne s impose pas au destinataire/.test(F('_shareCloneForReceiver')),'clone du partage : sans la reponse de l emetteur');
  const SCF=F('saveCommandeFiche');
  ok(/^    horsCmd:_l559HcForFiche\(opts\),/m.test(SCF)&&SCF.indexOf('horsCmd:_l559HcForFiche(opts),')<SCF.indexOf('ficheEntry.mat=_l513Matiere(ficheEntry);')&&SCF.indexOf('horsCmd:_l559HcForFiche(opts),')<SCF.indexOf('manqueMatiere:opts.manqueMatiere===true,'),'ficheEntry : la saisie est dans le litteral, AVANT l instantane f.mat');
  ok(/^window\._l559Hc=null;/m.test(src),'etat declare tot (propriete window : aucune zone morte temporelle)');
  ok(/const box=\(\(typeof _l559Box==='function'\)\?_l559Box\('l558Volet'\):null\)\|\|document\.getElementById\('l558Volet'\);/.test(F('_l558VoletSet'))&&/try\{ if\(typeof _l559Resume==='function'\) _l559Resume\(\); \}catch\(_\)\{ \}/.test(F('_l558VoletSet')),'« garder » un reste (L558) : encadre du conteneur ACTIF, et le resume des bobineaux suit (le plafond change)');
  ok(/\(\(window\._l559Hc&&window\._l559Hc\.rep==='oui'\)\?' · si tu y as coupé des bobineaux, garde seulement si la bande qui RESTE part entière sur palette/.test(F('_l558VoletHtml')),'encadre L558 : consigne « garde seulement si la bande qui RESTE part entiere » quand des bobineaux sont declares (jamais deux fois)');
  ok(/ov\.style\.zIndex='9998';/.test(F('_l559AskMM'))&&/id="l559MMErr"/.test(F('_l559AskMM'))&&/↩ Ne pas arrêter \(revenir à la fiche\)/.test(F('_l559AskMM'))&&/min-height:56px/.test(F('_l559AskMM')),'fenetre manque-matiere : sous les toasts (z 9998), zone d erreur, bouton « Ne pas arreter » nomme, boutons 56 px');

  console.log('── 9. KPI, CSV, carte, papier inchange, CSS, scene, boucles, simulation (forme) ──');
  const KPI=F('buildMonthlyKpi');
  ok(/let horsCmdM2=0, horsCmdN=0, horsCmdRepN=0, horsCmdDepN=0, horsCmdDepM2=0;/.test(KPI)&&/if\(typeof _m13\.horsCmdM2==='number'\)\{ horsCmdM2\+=_m13\.horsCmdM2; horsCmdN\+=\(Number\(_m13\.horsCmdN\)\|\|0\); horsCmdRepN\+\+; if\(\(Number\(_m13\.horsCmdDepM2\)\|\|0\)>0\.05\)\{ horsCmdDepN\+\+; horsCmdDepM2\+=Number\(_m13\.horsCmdDepM2\); \} \}/.test(KPI)&&/horsCmdM2:Math\.round\(horsCmdM2\*10\)\/10,horsCmdN:horsCmdN,horsCmdRepN:horsCmdRepN,horsCmdDepN:horsCmdDepN,horsCmdDepM2:Math\.round\(horsCmdDepM2\*10\)\/10,topClientsM2,/.test(KPI)&&/return \{mois:ym,regleVer:'L513',/.test(KPI),'agregat mensuel : m², nombre, fiches renseignees, fiches a verifier (prefixe du retour intact)');
  ok(/Bobineaux hors commande \(pour le stock\)<\/div>\$\{\(typeof kpi\.horsCmdM2==='number'\)\?`<div style="font-size:24px;font-weight:800;color:#8ec5ff">\$\{_l513M2\(kpi\.horsCmdM2\)\} m²<\/div>`:_naTile\}/.test(src)&&/coupés POUR le stock \(≠ pris DU stock\)/.test(src)&&/fiche\(s\) à vérifier : '\+_l513M2\(kpi\.horsCmdDepM2\)\+' m² déclarés au-delà des restes/.test(src),'tuile KPI : m², nombre, R/F fiches renseignees, fiches a verifier ; « — » pour un mois fige avant le lot');
  ok(/écart non comparable : bobineaux hors commande retirés de la perte depuis le 04\/11\/2026 \(L559\)/.test(src),'tuile Perte : l ecart avec un mois d avant le lot est dit non comparable (changement de methode)');
  ok(/m² pris du stock;m² livrés \(bobineaux\);Bobineaux hors commande pour le stock \(nb\);Bobineaux hors commande pour le stock \(m²\);Bobineaux hors commande au-delà des restes \(m²\)';/.test(src)&&/\(\(f\.horsCmd&&\/\^\(aucun\|oui\|sans-reste\)\$\/\.test\(String\(f\.horsCmd\.rep\|\|''\)\)\)\?String\(Number\(_m17\.horsCmdN\)\|\|0\):''\),\(\(typeof _m17\.horsCmdM2==='number'\)\?_l517Num\(_m17\.horsCmdM2\):''\),\(\(typeof _m17\.horsCmdDepM2==='number'&&_m17\.horsCmdDepM2>0\.05\)\?_l517Num\(_m17\.horsCmdDepM2\):''\)/.test(F('_l517FicheRow')),'CSV fiches : 3 colonnes EN FIN de ligne (nb, m², depassement a verifier), vides sans reponse (csv_l517_test : 53 colonnes, executees)');
  ok(/'CEVENINI s\/laize','Bobineaux hors commande pour le stock \(nb\)','Bobineaux hors commande pour le stock \(m²\)'\];/.test(src)&&/\.concat\(mrow\('CEVENINI'\)\)\.concat\(\[N\(k\.horsCmdN\),N\(k\.horsCmdM2\)\]\)/.test(F('_l526KpiRow'))&&/Bobineaux hors commande \(pour le stock\) : depuis le 04\/11\/2026 \(L559\), leurs m² sont RETIRÉS de la perte/.test(src),'CSV KPI : 2 colonnes en fin de ligne, MEME ordre que le CSV fiches (nb, m²), legende « perte non comparable avant le 04/11 »');
  ok(/const chips=\[mmBadge,hcChip,/.test(src)&&/const nbb=Number\(m&&m\.horsCmdN\)\|\|0; if\(!nbb\) return '';/.test(src)&&/text-transform:none/.test(src.slice(src.indexOf('const hcChip='),src.indexOf('const hcChip=')+900))&&/' · ⚠ \+'\+_l513M2\(m\.horsCmdDepM2\)\+' m² à vérifier'/.test(src),'carte de fiche : puce « 📦 N bob. pour le stock · X m² », seulement s il y a des bobineaux, depassement en clair (pas en infobulle), unite en minuscules');
  ok(!/horsCmd/.test(F('buildFichePrintHTML'))&&!/horsCmd/.test(F('showFicheDetail'))&&!/horsCmd/.test(F('printKpiMois')),'PAPIER : rien sur la fiche imprimee ni sur la revue de direction (decisions Q4 et 5) — seule la VALEUR de la perte baisse');
  ok(/\.l559-row input\{min-height:44px;width:92px;/.test(src)&&/\.l559-rep,\.l559-key\{min-height:44px;border-color:#8ec5ff!important;color:#8ec5ff!important\}/.test(src)&&/\.l559-rep\.l559-sel\{background:#f5b301!important/.test(src)&&/body\.atelier \.l559-row input\{min-height:48px;height:48px;width:100px;/.test(src),'CSS paysage : cases et boutons 44 px, selection ambre, mode atelier borne (48 px)');
  ok(!/<!--[^>]*(Celine|Céline|Dominique|Esteban|Christian)[^>]*-->/.test(F('editFicheConfigs'))&&!/(Celine|Céline|Dominique|Esteban)/.test(F('_l559VoletHtml')+F('_l559ResumeHtml')+F('_l559AskMM')+F('_l559Refus')),'aucun prenom dans les textes d interface ni dans un commentaire HTML d une chaine (l543)');
  ok(/'fiche-horscmd': `document\.querySelectorAll\('#refBlocks \.ref-block \.rb-op-validate'\)/.test(shot)&&/S9\.sansReste=\{html:_l559VoletHtml\(\)/.test(shot)&&/victoryConfirm\(\); \}catch\(e\)\{ S9\.err='victoryConfirm : '\+e; \}/.test(shot)&&/S9\.volet=\{modalH:/.test(shot)&&/victoryClose\(\); S9\.ferme=\{vide:document\.getElementById\('victoryBody'\)\.innerHTML===''\};/.test(shot)&&/bO2\.click\(\); const b59b=mb\.querySelector\('#l559Volet'\);/.test(shot)&&/document\.getElementById\('l559MMNo'\)\.click\(\);/.test(shot)&&!/vb\.innerHTML=''; const pm=_l559AskMM\(\)/.test(shot),'scene smoke fiche-horscmd : sans-reste, encadre, refus sans reponse, Aucun, Oui + cases, avertissements, Enregistrer atteignable, volet vide a la fermeture, fenetre manque-matiere (Oui DEDANS, refus dedans, Ne pas arreter, puis Aucun + Enregistrer) — plus de vidage manuel qui masquait le bug');
  ok(/'fiche-horscmd': "\(function\(\)\{ const s=window\.__l559\|\|\{\}; if\(s\.err\) return 'ERR '\+s\.err; if\(s\.step!=='fin'\) return false;/.test(shot)&&/rgb\(30, 77, 138\)/.test(shot)&&/m\.z==='9998'&&m\.nbVolets===1/.test(shot)&&/largeur manquante/.test(shot),'CHECK en lecture pure : couleur calculee, un seul encadre actif, refus dans la fenetre');
  ok(/fiche-dossier fiche-reste fiche-horscmd (?:[a-z0-9-]+ )*analyse; do/.test(bat)&&/fiche-dossier fiche-reste fiche-horscmd (?:[a-z0-9-]+ )*analyse; do/.test(ci)&&/Smokes \(\d+ scenes/.test(ci),'la batterie ET la CI rejouent la scene (d autres scenes peuvent suivre : L560 fiche-ordre, L561 donnees-emballage)');
  ok(/document\.getElementById\('victoryGo'\)\.click\(\); await wait\(80\); if\(!document\.querySelector\('#victoryOverlay\.open'\)\) bug\('L559 : envoi parti SANS reponse \(volet ferme\)'\); else rep\.l559\.refusOk=true;/.test(sim)&&/if\(k%3===0\)\{ bO\.click\(\);/.test(sim)&&/l559Bloc: reports\.filter\(r => r\.l559 && r\.l559\.bloc\)\.length/.test(sim)&&(function(){ const i0=sim.indexOf('[L559] question OBLIGATOIRE'); const b=sim.slice(sim.indexOf('*/',i0)+2,sim.indexOf('try{ victoryClose();',i0)); return i0>0&&b.length>200&&b.indexOf('R()')<0; })(),'simulation : chemin negatif (Enregistrer sans reponse → refuse) puis reponse par le VRAI bouton, variee par k (jamais R()), couverture comptee dans le resume');
  { const re=/const nn=s\.n-\(s\.skipN\|\|0\); if\(\(s\.l559Bloc\|\|0\)!==nn\|\|\(\(s\.l559Refus\|\|0\)\+\(s\.l559SansReste\|\|0\)\)!==nn\|\|\(s\.l559Oui\|\|0\)<1\|\|\(s\.l559Aucun\|\|0\)<1\)/; ok(re.test(bat)&&re.test(ci),'la batterie ET la CI exigent la couverture L559 de la simulation (encadre dans chaque volet hors sauts legitimes, refus verifie ou sans-reste, au moins un Oui et un Aucun)'); }
  fini=true; console.log(fail?('💥 '+fail+'/'+total+' ECHEC(S) HORS COMMANDE L559'):('🏆 HORS COMMANDE L559 OK : '+total+' verifications')); process.exit(fail?1:0);
})().catch(function(e){ console.log('💥 exception hors test : '+(e&&e.stack||e)); process.exit(1); });
