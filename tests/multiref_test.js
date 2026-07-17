// multiref_test.js — [L152 · incident BEKA imprimé/non-imprimé] VERROUS anti-mélange de références :
//  1) MOTEUR : deux groupes de réf (même nom, films ≠) sont packés SÉPARÉMENT — leurs laizes ne se
//     retrouvent JAMAIS sur les mêmes bobines mères.
//  2) CLÉ de détection doublon : films différents → clés différentes (pas de doublon signalé) ;
//     champs identiques → doublon signalé (bannière), PLUS JAMAIS fusionné automatiquement.
//  3) Marqueurs du nouveau flux : détection sans fusion, bouton fusion explicite, envoi bloqué,
//     chrono bloqué sans opérateur, comptes machine (_machineProfileOf), initAtelier 'operateur'.
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0; const ok=(c,m)=>{console.log((c?'✅ ':'❌ ')+m);if(!c)fail++;};

// ── 1) MOTEUR : séparation stricte des groupes ──
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.parseNum=v=>{const n=parseFloat(String(v==null?'':v).replace(',','.'));return isFinite(n)?n:0;};
for(const n of ['expandDemand','buildCounts','calcStats','makeLabel','bestPattern','pack','packRecutRolls','groupRecutRolls','computeChutesUsed','reduceItemsByChutes','assignChutesForDisplay','groupBobines','groupBobinesWithChutes','packRefGroups']) global[n]=eval('('+fnOf(n)+')');
const gImp={ref:'BEKA-PROF',film:'Imprimé',   veka:'',longueur:'800',useful:1200,blade:2,machine:'feba',rows:[{qty:6,width:300}],chutes:[],recuts:[]};
const gNon={ref:'BEKA-PROF',film:'Non imprimé',veka:'',longueur:'800',useful:1200,blade:2,machine:'feba',rows:[{qty:4,width:500}],chutes:[],recuts:[]};
const packed=packRefGroups([gImp,gNon]);
ok(Array.isArray(packed)&&packed.length===2,'moteur : 2 groupes en entrée → 2 plans SÉPARÉS en sortie (1 par film)');
const widthsOf=p=>{const w=new Set();(p.planGroups||[]).forEach(g=>(g.pattern||[]).forEach(x=>w.add(x.width)));return w;};
const w0=widthsOf(packed[0]), w1=widthsOf(packed[1]);
ok(w0.has(300)&&!w0.has(500),'plan du groupe IMPRIMÉ : uniquement SES laizes (300) — aucune laize de l\'autre film');
ok(w1.has(500)&&!w1.has(300),'plan du groupe NON IMPRIMÉ : uniquement SES laizes (500)');
const nb0=(packed[0].bobines||[]).length, nb1=(packed[1].bobines||[]).length;
ok(nb0>0&&nb1>0&&(packed[0].stats.totalBobines+packed[1].stats.totalBobines)===(nb0+nb1),'bobines mères comptées PAR groupe — jamais partagées entre les 2 films');

// ── 2) CLÉ de détection doublon (_dupRefKeyOf) : DOM stubé ──
const _dupRefKeyOf=eval('('+fnOf('_dupRefKeyOf')+')');
global.fmt=v=>String(v);
const mkBlock=(vals)=>({querySelector:sel=>{const m=sel.match(/data-rb="([^"]+)"/);return m&&(m[1] in vals)?{value:vals[m[1]]}:null;}});
const bImp=mkBlock({ref:'BEKA-PROF',longueur:'800',film:'Imprimé',machine:'feba',veka:'',mother:'1250'});
const bNon=mkBlock({ref:'BEKA-PROF',longueur:'800',film:'Non imprimé',machine:'feba',veka:'',mother:'1250'});
const bDup=mkBlock({ref:'BEKA-PROF',longueur:'800',film:'Imprimé',machine:'feba',veka:'',mother:'1250'});
ok(_dupRefKeyOf(bImp)!==_dupRefKeyOf(bNon),'films ≠ (Imprimé vs Non imprimé) → clés ≠ → JAMAIS traités comme doublons');
ok(_dupRefKeyOf(bImp)===_dupRefKeyOf(bDup),'champs identiques → même clé → détectés comme doublons (bannière + choix)');
ok(_dupRefKeyOf(mkBlock({ref:'',longueur:'800',film:'',machine:'',veka:'',mother:''}))===null,'bloc sans réf → jamais considéré');

// ── 3) Marqueurs du nouveau flux (anti-régression textuelle) ──
const has=(re,m)=>{const okk=re.test(src);console.log((okk?'✅ ':'❌ ')+m);if(!okk)fail++;};
has(/return false;\s*\/\/ plus JAMAIS de fusion automatique/,'mergeDuplicateRefBlocks ne fusionne PLUS automatiquement (détection seule)');
has(/function mergeDupRefNow\(di\)/,'fusion uniquement EXPLICITE (bouton ♻ Fusionner, ciblée par groupe)');
has(/_dupRefPending\.length\)\{\s*\n\s*showToast\('⛔ Envoi bloqué : '/,'envoi BLOQUÉ tant que le doublon n\'est pas résolu');
has(/blocs de référence IDENTIQUES/,'bannière plan « blocs identiques » présente (choix fusionner / distinguer les films)');
has(/\.ref-block\.rb-dup\{border-color:var\(--orange\)/,'blocs doublons surlignés en orange');
has(/l\\'opérateur — touche ses initiales/,'chrono BLOQUÉ sans opérateur sélectionné (ficheParamMissing)');
has(/function _machineProfileOf\(email\)/,'comptes machine partagés reconnus par email (feba@/maveg@/cevenini@)');
has(/\^\(feba\|maveg\|cevenini\)@/,'local-part seul (pas d\'adresse complète stockée — règle anti-PII)');
has(/role:'operateur', ini:'', nom:'Poste '/,'comptes machine : rôle operateur (mêmes accès que Taïeb) + AUCUNE initiale pré-sélectionnée');
has(/currentRole==='operateur'\) on=true;/,'initAtelier : atelier forcé ON pour le rôle operateur (bugfix L143 op→operateur)');

// _machineProfileOf comportement direct
const _machineProfileOf=eval('('+fnOf('_machineProfileOf')+')');
ok(_machineProfileOf('feba@step-international.com').role==='operateur','feba@… → operateur');
ok(_machineProfileOf('FEBA@STEP-INTERNATIONAL.COM').nom==='Poste FEBA','casse ignorée → Poste FEBA');
ok(_machineProfileOf('cevenini@step-international.com').ini==='','aucune initiale pré-sélectionnée (ini vide)');
ok(_machineProfileOf('quelquun@ailleurs.com')===null&&_machineProfileOf('')===null,'email inconnu / vide → null (déconnecté comme avant)');

// ── [L156] verrous post-audit ──
has(/Arrêt manque-matière bloqué : '\+_dupRefPending/,'#2 stopManqueMatiere rejoue la garde blocs identiques (voie manque-matière fermée)');
has(/const h=document\.getElementById\('fInitiales'\); if\(h\)h\.value='';\n\s*document\.querySelectorAll\('#initBtns \.ini-btn'\)\.forEach\(function\(b\)\{b\.classList\.remove\('sel'\);\}\);/,'#1 CRITIQUE resetAll vide les initiales sur compte machine (plus d\'héritage de l\'opérateur précédent)');
has(/mergeDupRefNow\('\+di\+'\)/,'#5 fusion CIBLÉE par groupe (le bouton ne fusionne que sa bannière)');
has(/if\(want!==null&&k!==want\) return;/,'#5 mergeDupRefNow ignore les groupes non visés');
has(/if\(!hasRow\) return;/,'#6 blocs-stubs vides (aucune qty×largeur) ignorés par la détection doublons');
has(/if\(d\.owner==='\?'\|\|me==='\?'\) return false;/,'#9 supersession : identité inconnue jamais croisée');
has(/if\(d\.owner==='\?'\|\|_mineIni==='\?'\) return false;/,'#9bis balayage envoi : idem');
has(/Touche TES initiales \(Opérateur 1\) avant de partager/,'#8 partage exige l\'opérateur (compte machine)');
has(/d\.sharedByIni&&d\.sharedByIni!=='\?'/,'#7 inbox partage : initiales embarquées préférées (émetteur compte machine)');

console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 MULTIREF VALIDÉ : films séparés au moteur · doublons détectés JAMAIS auto-fusionnés · envoi + manque-matière bloqués · chrono/partage exigent l\'opérateur · comptes machine sans héritage d\'initiales');
process.exit(fail?1:0);
