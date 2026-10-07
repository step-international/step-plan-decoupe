// l546_test.js — [L546 · 07/10/2026, suite de l audit d usage reel du 06/10] (B8) un chrono invraisemblable (plus long que les heures de
// travail possibles depuis le 1er ▶) est SIGNALE a la reprise d un brouillon, sur la carte du brouillon et dans le volet avant l envoi —
// jamais modifie (decision du 15/09) ; (A10) un signalement non envoye garde son texte, et la bulle porte le mot « Signaler ».
// Dates construites en heure LOCALE (independant du fuseau de la machine de test). Donnees FICTIVES.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const withCtx=(fnSrc,ctx)=>new Function('ctx','with(ctx){ return ('+fnSrc+'); }')(ctx);
['dayChronoCutoffMs','_l546WorkCap','_l546ChronoOdd','fmtTimeFr'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
const _l546TxtF=eval('('+fnOf('_l546Txt')+')');
const L=(y,mo,d,h,mi)=>new Date(y,mo-1,d,h,mi||0,0,0).getTime();   // heure locale
const H=h=>Math.round(h*3600);

console.log('── 0. version ──');
ok(/const APP_VERSION='2026\.\d\d\.\d\d-L(54[6-9]|5[5-9]\d|[6-9]\d\d)';/.test(src),'APP_VERSION >= L546');

console.log('── 1. heures de travail possibles ──');
// 2026-10-05 = lundi
ok(_l546WorkCap(L(2026,10,5,8,0),L(2026,10,5,15,0))===H(7),'lundi 8 h → 15 h : 7 h possibles');
ok(_l546WorkCap(L(2026,10,5,8,0),L(2026,10,5,20,0))===H(8.25),'lundi 8 h → 20 h : arret a 16 h 15 → 8 h 15');
ok(_l546WorkCap(L(2026,10,5,4,0),L(2026,10,5,7,0))===H(1),'lundi 4 h → 7 h : la journee commence a 6 h → 1 h');
ok(_l546WorkCap(L(2026,10,9,14,0),L(2026,10,12,9,0))===H(1.25+3),'vendredi 14 h → lundi 9 h : 1 h 15 (vendredi jusqu a 15 h 15) + 3 h (lundi), week-end 0');
ok(_l546WorkCap(L(2026,10,10,8,0),L(2026,10,11,18,0))===0,'samedi → dimanche : 0');
ok(_l546WorkCap(L(2026,10,5,8,0),L(2026,10,7,15,0))===H(8.25+10.25+9),'lundi 8 h → mercredi 15 h : 27 h 30');
ok(_l546WorkCap(L(2026,10,30,8,0),L(2026,11,2,9,0))===H(7.25+3),'fin de mois (vendredi 30 → lundi 2) : dates qui changent de mois');

console.log('── 2. chrono invraisemblable ──');
ok(_l546ChronoOdd(H(6),L(2026,10,5,8,0),L(2026,10,5,15,0))===null,'6 h sur une journee de 7 h : normal');
ok(_l546ChronoOdd(H(25),L(2026,10,5,8,0),L(2026,10,7,15,0))===null,'25 h sur 3 jours (27 h 30 possibles) : normal');
let o=_l546ChronoOdd(H(29.72),L(2026,8,27,15,22),L(2026,9,1,9,7));
ok(o&&o.sec===H(29.72)&&o.cap<H(29.72)-3600,'29 h 43 du jeudi apres-midi au mardi matin (≈ 23 h 30 possibles) : SIGNALE (cas reel de septembre)');
ok(_l546ChronoOdd(H(8.5),L(2026,10,5,8,0),L(2026,10,5,17,0))===null,'8 h 30 entre 8 h et 17 h (8 h 15 possibles) : dans la tolerance d 1 h (heures supp)');
ok(_l546ChronoOdd(H(8.5),L(2026,10,5,8,0),L(2026,10,5,16,0))!==null,'8 h 30 de chrono entre 8 h et 16 h : plus que le temps ecoule → signale');
ok(_l546ChronoOdd(H(9.92),L(2026,10,5,8,0),L(2026,10,5,18,0))===null,'heures supp : lundi 8 h → 18 h, 9 h 55 de chrono (8 h 15 de journee normale) : dans la tolerance de 2 h 30, pas d alerte');
ok(_l546ChronoOdd(H(11),L(2026,10,5,8,0),L(2026,10,5,23,0))!==null,'11 h sur un seul lundi (8 h 15 de journee normale) : signale');
ok(_l546ChronoOdd(H(2),L(2026,10,5,10,0),L(2026,10,5,11,0))!==null,'2 h de chrono pour 1 h reellement ecoulee : signale');
ok(_l546ChronoOdd(H(3),L(2026,10,10,9,0),L(2026,10,10,13,0))!==null&&_l546ChronoOdd(H(2),L(2026,10,10,9,0),L(2026,10,10,13,0))===null,'samedi : au-dela de 2 h 30 signale (aucun releve reel le week-end), en dessous non');
o=_l546ChronoOdd(H(2),L(2026,10,5,10,0),L(2026,10,5,11,0)); ok(o&&o.wall===true&&o.cap===H(1),'plus que le temps ecoule : cause « temps ecoule » (impossible)');
ok(/se sont écoulés depuis le début/.test(_l546TxtF(o))&&/heures supp \?/.test(_l546TxtF({sec:H(30),cap:H(23.5),wall:false}))&&/week-end \?/.test(_l546TxtF({sec:H(3),cap:0,wall:false}))&&!/environ 00s/.test(_l546TxtF({sec:H(3),cap:0,wall:false}))&&/signalé à la reprise/.test(_l546TxtF({sec:H(30),cap:null})),'message adapte a la cause (temps ecoule / heures supp ? / week-end ?), jamais « environ 00s »');
ok(_l546ChronoOdd(0,L(2026,10,5,8),L(2026,10,5,9))===null&&_l546ChronoOdd(H(30),null,L(2026,10,5,9))===null&&_l546ChronoOdd(H(30),L(2026,10,5,9),L(2026,10,5,8))===null&&_l546ChronoOdd(H(30),'pas une date',L(2026,10,5,9))===null&&_l546ChronoOdd(H(30),L(2026,10,5,8),NaN)===null,'chrono nul, 1er ▶ inconnu, dates a l envers ou illisibles : jamais de signal, jamais d exception');
ok(_l546ChronoOdd(H(29.72),new Date(L(2026,8,27,15,22)).toISOString(),L(2026,9,1,9,7))!==null,'1er ▶ au format texte (ISO, comme dans les brouillons) : lu');
ok(_l546ChronoOdd(H(29.72),L(2026,8,27,15,22),L(2026,10,7,10,0))===null,'le MEME chrono juge a une date bien plus tardive devient « possible » : d ou le controle a la date du brouillon + la marque gardee');

console.log('── 3. marque locale (reprise → envoi) ──');
{ const store={}; const ls={getItem:k=>(k in store)?store[k]:null,setItem:(k,v)=>{ store[k]=String(v); }};
  const ctx={localStorage:ls,_L546_KEY:'step_l546_chrono_odd',JSON,Number,String,Object,Array,Math};
  ctx._l546Map=withCtx(fnOf('_l546Map'),ctx); ctx._l546Mark=withCtx(fnOf('_l546Mark'),ctx); ctx._l546Marked=withCtx(fnOf('_l546Marked'),ctx);
  ctx._l546Mark('2026-08-27T13:22:49.075Z',107000);
  ok(ctx._l546Marked('2026-08-27T13:22:49.075Z')===107000&&ctx._l546Marked('autre')===0&&ctx._l546Marked(null)===0,'marque posee pour CE 1er ▶, aucune pour un autre');
  for(let i=0;i<30;i++) ctx._l546Mark('k'+i,i+1);
  ok(Object.keys(JSON.parse(store.step_l546_chrono_odd)).length===20,'au plus 20 marques gardees');
  store.step_l546_chrono_odd='"pas un objet"'; ok(ctx._l546Marked('x')===0,'contenu abime : ignore');
  const broken={getItem:()=>{ throw new Error('bloque'); },setItem:()=>{ throw new Error('bloque'); }};
  const c2=Object.assign({},ctx,{localStorage:broken}); c2._l546Map=withCtx(fnOf('_l546Map'),c2); c2._l546Mark=withCtx(fnOf('_l546Mark'),c2); c2._l546Marked=withCtx(fnOf('_l546Marked'),c2);
  c2._l546Mark('a',1); ok(c2._l546Marked('a')===0,'stockage local bloque : aucune exception');
  // envoi
  const sctx={chronoSec:H(30),chronoStartTs:new Date(L(2026,10,5,8,0)).toISOString(),Date:{now:()=>L(2026,10,12,9,0),parse:Date.parse},_l546ChronoOdd:global._l546ChronoOdd,_l546Marked:()=>0};
  const atSend=withCtx(fnOf('_l546AtSend'),sctx);
  ok(atSend()===null,'envoi une semaine plus tard, sans marque : plus rien a signaler (le temps a passe)');
  sctx._l546Marked=()=>H(29.9); ok(atSend()&&atSend().cap===null,'… mais marque a la reprise pour la MEME commande : signale a l envoi');
  sctx.chronoSec=H(2); ok(atSend()===null,'chrono reparti de zero (nouvelle commande, plus petit que la marque) : rien');
  const rctx={chronoSec:H(29.72),chronoStartTs:new Date(L(2026,8,27,15,22)).toISOString(),Date:{now:()=>L(2026,10,7,9,0),parse:Date.parse},_l546ChronoOdd:global._l546ChronoOdd,marked:[],_l546Mark:(a,b)=>rctx.marked.push([a,b])};
  const atRes=withCtx(fnOf('_l546AtResume'),rctx);
  const r=atRes({savedAt:new Date(L(2026,9,1,9,7)).toISOString(),state:{chrono:{wasRunning:false}}});
  ok(r&&rctx.marked.length===1,'reprise d un brouillon EN PAUSE : juge a la date du brouillon → signale et marque');
  rctx.marked=[]; ok(atRes({savedAt:new Date(L(2026,9,1,9,7)).toISOString(),state:{chrono:{wasRunning:true}}})===null&&rctx.marked.length===0,'chrono EN MARCHE : juge a l instant (le temps tourne vraiment) → rien ici');
  { const actx=Object.assign({},rctx,{marked:[],Date:{now:()=>L(2026,9,2,6,30),parse:Date.parse}}); actx._l546Mark=(a,b)=>actx.marked.push([a,b]); actx._l546AtResume=withCtx(fnOf('_l546AtResume'),actx);
    const auto=withCtx(fnOf('_l546AtAutoResume'),actx);
    const c0={sec:H(29.72),startTs:new Date(L(2026,8,27,15,22)).toISOString(),at:new Date(L(2026,9,1,9,7)).toISOString()};
    const ra=auto({savedAt:c0.at,state:{chrono:{wasRunning:false}}},c0);
    ok(ra&&actx.marked.length===1&&ra.cap<H(24),'cas reel de septembre repris AUTOMATIQUEMENT le lendemain matin : signale (juge a la date du brouillon) et marque pour l envoi');
    actx.marked=[]; ok(auto({savedAt:c0.at,state:{chrono:{wasRunning:false}}},{sec:H(6),startTs:c0.startTs,at:c0.at})===null&&actx.marked.length===0,'brouillon normal repris automatiquement : rien');
    ok(auto({savedAt:c0.at,state:{chrono:{wasRunning:true}}},null)===null,'chrono en marche (pas de releve du brouillon) : juge a l instant comme avant'); }
  ok(atRes({savedAt:new Date(L(2026,9,1,9,7)).toISOString(),state:{chrono:{wasRunning:false}}},true)===null,'reprise AUTO au demarrage : jugee a l instant (sauvegarde locale plus recente que le brouillon) → pas de fausse alerte');
  { const hctx={chronoSec:H(11),chronoStartTs:new Date(L(2026,10,5,8,0)).toISOString(),Date:{now:()=>L(2026,10,5,19,30),parse:Date.parse},_l546ChronoOdd:global._l546ChronoOdd,_l546Marked:()=>0,_chronoAutoStopOverride:null,_dateKey:ms=>{ const d=new Date(ms); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }};
    const hs=withCtx(fnOf('_l546AtSend'),hctx);
    ok(hs()!==null,'11 h un lundi 8 h → 19 h 30 sans heures supp declarees : signale a l envoi');
    hctx._chronoAutoStopOverride=hctx._dateKey(L(2026,10,5,12,0)); ok(hs()===null,'… mais heures supp lancees aujourd hui (Reprendre apres 16 h 15) : seule la regle « temps ecoule » vaut → pas d alerte');
    hctx.chronoSec=H(12); ok(hs()&&hs().wall===true,'… et plus que le temps reellement ecoule reste signale meme en heures supp'); }
  ok(atRes(null)===null,'brouillon absent : rien, pas d exception'); }

console.log('── 4. ou c est affiche ──');
ok(/const _o6=_l546AtAutoResume\(d,_l546C0\); showToast\(_o6\?\('⏱ Commande reprise — '\+_l546Txt\(_o6\)\):\('⏱ Commande reprise — chrono à '\+fmtTimeFr\(showSec\)\)/.test(fnOf('maybeResumeRunningChrono'))&&/'⏱ Commande reprise — chrono figé à '/.test(fnOf('maybeResumeRunningChrono')),'reprise automatique (meme jour / autre jour) : message d avertissement a la place du message habituel');
const RD=fnOf('resumeDraft');
ok(RD.indexOf('_l546AtResume(d)')>RD.indexOf('restoreFicheState(d.state)')&&/'⚠ Brouillon chargé — '\+_l546Txt\(_o6\)/.test(RD),'reprise manuelle : controle APRES la restauration');
const OV=fnOf('_openVictory');
ok(/_o546=t\?_l546AtSend\(\):null/.test(OV)&&/row\('Temps', t\?\(t\+\(_o546\?' ⚠':''\)\):'⚠ CHRONO À ZÉRO — aucun temps enregistré'/.test(OV),'volet de cloture : ligne Temps en orange + explication (le chrono a zero reste signale comme avant)');
ok(/⏱ chrono à vérifier \('\+esc\(fmtTimeFr\(_co\.sec\)\)/.test(fnOf('renderDrafts'))&&/if\(_c6&&!_c6\.wasRunning\) _co=_l546ChronoOdd\(_c6\.sec,_c6\.startTs,Date\.parse\(d\.savedAt\|\|''\)\)/.test(fnOf('renderDrafts')),'Donnees > Brouillons : « ⏱ chrono a verifier » sur la carte (le bureau le repere)');
ok(!/chronoSec\s*=/.test(fnOf('_l546AtResume'))&&!/chronoSec\s*=/.test(fnOf('_l546AtSend'))&&!/chronoSec\s*=/.test(fnOf('_l546ChronoOdd')),'le chrono n est JAMAIS modifie (decision du 15/09)');
ok(/il n\\'est PAS modifié : préviens le bureau s\\'il est faux/.test(fnOf('_l546Txt')),'le message dit que le chrono n est pas modifie et quoi faire');

console.log('── 5. A10 : bulle de signalement ──');
(async()=>{
  const mkR=(writeRes)=>{ const rec={toast:[],sent:[]}; const c={document:{getElementById:id=>id==='reportText'?{value:'  la bobine 3 ne se coupe pas  '}:null},_repKind:'idee',closeReport(){},showToast:(m,k)=>rec.toast.push([m,k]),navigator:{onLine:false},
    _l388CaptureShots:null,Promise,setTimeout,_l546RepShown:null,_l380AssistSend:(k,t)=>rec.sent.push(['assist',k,t]),_reportWrite:(k,t)=>{ rec.sent.push(['mail',k,t]); if(writeRes==='throw') throw new Error('x'); if(writeRes==='reject') return Promise.reject(new Error('x')); return Promise.resolve(writeRes); },_l546RepKeep:null};
    c.fn=withCtx(fnOf('reportSubmit'),c); c.rec=rec; return c; };
  const flush=()=>new Promise(r=>setTimeout(r,30));
  let c=mkR(false); c.fn(); await flush();
  ok(c._l546RepKeep&&c._l546RepKeep.t==='la bobine 3 ne se coupe pas'&&c._l546RepKeep.k==='idee'&&/ton texte est gardé/.test(c.rec.toast.pop()[0]),'envoi echoue : type + texte GARDES, message clair (avant : perdus)');
  ok(c.rec.sent.length===2&&c.rec.sent.every(x=>x[1]==='idee'),'mail + fil assistant partent avec le meme type qu avant (appel L380 inchange)');
  c=mkR(new Promise(()=>{})); c._l546RepKeep={k:'bug',t:'vieux',at:Date.now()}; c._l546RepShown=c._l546RepKeep; c.fn(); await flush(); ok(c._l546RepKeep===null,'envoi EN COURS du texte garde affiche : efface tout de suite (bulle rouverte = vide, jamais deux fois le meme texte)');
  c=mkR(new Promise(()=>{})); const _A={k:'bug',t:'texte A',at:Date.now()}; c._l546RepKeep=_A; c._l546RepShown=null; c.fn(); await flush(); ok(c._l546RepKeep===_A,'echec de A arrive pendant que la bulle (vide) etait ouverte, puis on envoie un autre texte : A reste garde (pas perdu)');
  c=mkR(false); c.trainingGuard=()=>true; c.fn(); await flush(); ok(c._l546RepKeep===null&&/mode entraînement/.test(c.rec.toast.pop()[0]),'mode entrainement : rien n est garde (l essai repartirait pour de vrai)');
  c=mkR(true); const _V={k:'bug',t:'vieux',at:Date.now()}; c._l546RepKeep=_V; c.fn(); await flush(); ok(c._l546RepKeep===_V,'envoi reussi d un AUTRE texte : le texte garde d un envoi echoue (non affiche) reste garde');
  c=mkR(true); c._l546RepKeep={k:'bug',t:'vieux',at:Date.now()}; c._l546RepShown=c._l546RepKeep; c.fn(); await flush();
  ok(c._l546RepKeep===null&&/Merci/.test(c.rec.toast.pop()[0]),'envoi reussi : plus rien de garde');
  c=mkR('reject'); c.fn(); await flush(); ok(c._l546RepKeep&&/ton texte est gardé/.test(c.rec.toast.pop()[0]),'erreur imprevue de l envoi : texte garde quand meme, et un message (avant : aucun)');
  c=mkR('throw'); c.fn(); await flush(); ok(c._l546RepKeep&&c._l546RepKeep.t,'exception immediate : texte garde');
  const ta={value:'x'}; const picks=[];
  const oc={document:{querySelectorAll:()=>[],getElementById:id=>id==='reportText'?ta:(id==='reportOverlay'?{classList:{add(){},remove(){}}}:null)},_repKind:'question',_repPick:k=>{ picks.push(k); oc._repKind=k; },_reportCtx:()=>({}),_l546RepKeep:{k:'idee',t:'mon texte',at:Date.now()}};
  withCtx(fnOf('openReport'),oc)();
  ok(ta.value==='mon texte'&&picks[0]==='idee','reouverture : le texte et le type gardes sont remis');
  oc._l546RepKeep=null; ta.value='zzz'; withCtx(fnOf('openReport'),oc)(); ok(ta.value==='','sans texte garde : bulle vide comme avant');
  oc._l546RepKeep={k:'idee',t:'vieux',at:Date.now()-16*60000}; withCtx(fnOf('openReport'),oc)(); ok(ta.value===''&&oc._l546RepKeep===null,'texte garde depuis plus de 15 min (poste partage) : oublie');
  const close=withCtx(fnOf('closeReport'),oc);
  oc._l546RepKeep={k:'idee',t:'mon texte',at:1}; oc._l546RepShown=oc._l546RepKeep; ta.value='   '; close(); ok(oc._l546RepKeep===null&&oc._l546RepShown===null,'zone videe puis Annuler : le texte garde est jete');
  oc._l546RepKeep={k:'idee',t:'mon texte',at:5}; oc._l546RepShown=oc._l546RepKeep; ta.value='texte corrige'; close(); ok(oc._l546RepKeep&&oc._l546RepKeep.t==='texte corrige'&&oc._l546RepKeep.at===5,'texte modifie puis Annuler : c est la version modifiee qui est gardee (meme expiration)');
  oc._l546RepKeep={k:'idee',t:'garde pendant que la bulle etait ouverte',at:Date.now()}; oc._l546RepShown=null; ta.value=''; close(); ok(oc._l546RepKeep&&oc._l546RepKeep.t==='garde pendant que la bulle etait ouverte','bulle ouverte VIDE pendant un envoi, echec arrive entre-temps : Annuler ne jette pas le texte garde (il n etait pas affiche)');
  oc._l546RepKeep=null; ta.value='pas garde'; close(); ok(oc._l546RepKeep===null,'sans texte garde, Annuler ne garde rien (comme avant)');
  ok(/<button id="reportBubble" onclick="openReport\(\)" aria-label="Signaler un problème ou une idée" title="Signaler un problème ou une idée">💬<span class="rb-lbl" aria-hidden="true">Signaler<\/span><\/button>/.test(src),'le mot « Signaler » sous l icone, dans la bulle');
  ok(/#reportBubble\{flex-direction:column;line-height:1\}#reportBubble \.rb-lbl\{display:block;font-size:9px/.test(src)&&/body:has\(#page0\.active\) #reportBubble \.rb-lbl\{display:none\}/.test(src),'taille de la bulle inchangee ; mot dans la bulle de 60 px (mesure Chrome : il tient), masque dans la petite bulle du Plan (48 px, il deborderait)');
  ok(/#reportBubble\{width:60px!important;height:60px!important/.test(src)&&/body:has\(#page0\.active\) #reportBubble\{width:48px!important;height:48px!important/.test(src),'tailles de la bulle intactes (L350, L522)');
  console.log('\n'+(fail?('❌ '+fail+' echec(s) sur '+total):('🏆 L546 : '+total+'/'+total+' verts')));
  process.exit(fail?1:0);
})().catch(e=>{ console.error('❌ exception',e); process.exit(1); });
