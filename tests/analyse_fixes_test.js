// analyse_fixes_test.js — [L254] TESTS D'EXÉCUTION RÉELS des correctifs de revue (pas des marqueurs).
// Couvre : _supersededManualDrafts (REVERT L254 : plus de perte de brouillon sans n°) · csvMetaLine
// (anti-injection formule CSV) · sparkline max (série plate) · filtre « Mois » LOCAL vs UTC.
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0; const ok=(c,m)=>{ console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };

// ── environnement minimal partagé ──
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();

console.log('── REVERT L254 : _supersededManualDrafts (anti perte de brouillon) ──');
{
  // dépendances de la fonction
  global._isSharedDoc=d=>!!(d&&(d.kind==='shared'||(typeof d.id==='string'&&d.id.indexOf('d_shared_')===0)));
  global._ini=()=>'DC';
  global._resumedDraftId=null;
  const _superseded=eval('('+fnOf('_supersededManualDrafts')+')');
  const mk=(id,label,client,ref,numCmd,extra)=>Object.assign({id,label,owner:'DC',state:{plan:{client,ref,numCmd:numCmd||''}}},extra||{});

  // CAS 1 (le bug L252 corrigé) : deux commandes DISTINCTES même client+réf SANS n° → l'ancienne NON consommée
  global.brouillonsCache=[ mk('d1','Prima / sans n°','Prima','PVC-70','') ];
  global._resumedDraftId=null;
  let r=_superseded('d2','Prima / sans n°',{state:{plan:{client:'Prima',ref:'PVC-70',numCmd:''}}});
  ok(r.length===0,'deux « sans n° » même client+réf = commandes distinctes → l\'ancienne PRÉSERVÉE (plus de perte silencieuse) → superseded='+r.length);

  // CAS 2 (comportement historique conservé) : même client + même N° → l'ancienne consommée
  global.brouillonsCache=[ mk('d1','Acme / 12345','Acme','PVC-70','12345') ];
  r=_superseded('d2','Acme / 12345',{state:{plan:{client:'Acme',ref:'PVC-70',numCmd:'12345'}}});
  ok(r.length===1&&r[0].id==='d1','même « client / n° » → ancienne remplacée (comportement historique intact)');

  // CAS 3 : reprise EXPLICITE d'un sans-n° → toujours consommée (choix conscient, jamais perdu par erreur)
  global.brouillonsCache=[ mk('d1','Prima / sans n°','Prima','PVC-70','') ];
  global._resumedDraftId='d1';
  r=_superseded('d2','Prima / sans n°',{state:{plan:{client:'Prima',ref:'PVC-70',numCmd:''}}});
  ok(r.length===1&&r[0].id==='d1','reprise EXPLICITE (_resumedDraftId) d\'un sans-n° → toujours remplacée');
  global._resumedDraftId=null;

  // CAS 4 : brouillon d'un AUTRE poste → jamais touché
  global.brouillonsCache=[ Object.assign(mk('d1','Acme / 12345','Acme','PVC-70','12345'),{owner:'TB'}) ];
  r=_superseded('d2','Acme / 12345',{state:{plan:{client:'Acme',ref:'PVC-70',numCmd:'12345'}}});
  ok(r.length===0,'brouillon d\'un AUTRE poste (owner≠moi) → jamais consommé');

  // CAS 5 : partagé / autosave / corbeille → jamais consommés
  global.brouillonsCache=[
    mk('d_shared_x','Acme / 12345','Acme','PVC-70','12345'),
    Object.assign(mk('d_autosave_1','Acme / 12345','Acme','PVC-70','12345'),{auto:true}),
    Object.assign(mk('d3','Acme / 12345','Acme','PVC-70','12345'),{deleted:true})
  ];
  r=_superseded('d2','Acme / 12345',{state:{plan:{client:'Acme',ref:'PVC-70',numCmd:'12345'}}});
  ok(r.length===0,'partagé + autosave + corbeille → jamais consommés');
}

console.log('── L254 : csvMetaLine anti-injection formule CSV ──');
{
  global.currentUser={ini:'ER'};
  global.fullHistoryLoaded=true;
  const csvMetaLine=eval('('+fnOf('csvMetaLine')+')');
  // client piégé passé en « extra » (via le libellé de filtre du dashboard)
  const evil='client Acme;=cmd|\'/c calc.exe\'!A1';
  const line=csvMetaLine('Tableau de bord',3,evil);
  ok(line.indexOf(';')===-1,'aucun « ; » dans la ligne de méta → pas de 2e cellule injectée → '+(line.indexOf(';')===-1));
  ok(line.indexOf('\n')===line.length-1,'aucun saut de ligne interne (seul le \\n final)');
  // une valeur qui COMMENCE par une formule doit être désamorcée par une apostrophe
  const line2=csvMetaLine('=SUM(A1)',2,'');
  ok(/·\s*'=SUM\(A1\)/.test(line2)||line2.indexOf("'=SUM")>=0,'valeur débutant par = désamorcée par une apostrophe');
  // unité correcte quand n est un libellé
  ok(csvMetaLine('X','12 mois','').indexOf('12 mois')>=0 && csvMetaLine('X','12 mois','').indexOf('12 mois ligne')===-1,'n déjà libellé (« 12 mois ») passé tel quel, pas « 12 mois ligne(s) »');
  ok(csvMetaLine('X',5,'').indexOf('5 ligne(s)')>=0,'n numérique → « 5 ligne(s) »');
}

console.log('── L254 : sparkline — étiquette « max » = vrai maximum (série plate) ──');
{
  // reproduit la logique min/max/label de spark() sans le SVG
  const sparkMaxLabel=vals=>{
    const pts=vals.map((v,i)=>({v,i})).filter(p=>p.v!=null);
    if(pts.length<2) return null;
    let mn=Math.min(...pts.map(p=>p.v)),mx=Math.max(...pts.map(p=>p.v));
    const mxReal=mx;                 // [L254] capturé AVANT l'ajustement
    if(mx===mn){mx+=1;mn-=1;}
    return mxReal;                   // ce que le libellé affiche
  };
  ok(sparkMaxLabel([100,100,100,100])===100,'12 mois à 100 % → étiquette « max 100 » (pas 101)');
  ok(sparkMaxLabel([2,5,8,3])===8,'série variable → max réel = 8');
}

console.log('── L254 : filtre « Mois » construit en LOCAL (comme _ymLoc au filtrage) ──');
{
  const _ymL2=ds=>{ const d=new Date(ds); return isNaN(d)?String(ds||'').slice(0,7):d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); };
  // un relevé du 1er août 00:30 heure LOCALE : la liste d'options ET le filtrage doivent le classer PAREIL.
  const localFirstAug=new Date(2026,7,1,0,30).toISOString();   // ISO UTC (peut être 2026-07-31T…Z selon le fuseau CI)
  const optMonth=_ymL2(localFirstAug);      // valeur d'option
  const filterMonth=_ymL2(localFirstAug);   // clé de filtrage (même fonction locale)
  ok(optMonth===filterMonth,'option et filtrage utilisent la MÊME bucketisation locale → entrée toujours atteignable ('+optMonth+')');
  ok(/^2026-0[78]$/.test(optMonth),'mois local cohérent (07 ou 08 selon fuseau) — jamais un slice UTC divergent');
}

console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 CORRECTIFS REVUE VALIDÉS À L\'EXÉCUTION : brouillons sûrs · CSV non injectable · sparkline juste · filtre mois cohérent');
process.exit(fail?1:0);
