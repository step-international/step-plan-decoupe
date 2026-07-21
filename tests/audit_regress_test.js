// audit_regress_test.js — GARDE anti-régression : vérifie que les correctifs d'audit L126→L146 sont TOUJOURS
// présents (marqueurs de code distinctifs). Cadence d'edits élevée + 16 tests perdus → filet contre un revert
// silencieux. Ne teste pas la logique fine (couverte ailleurs) mais l'INTÉGRITÉ des correctifs livrés.
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
const sw=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/sw.js','utf8');
let fail=0; const has=(re,m)=>{const ok=(re instanceof RegExp?re.test(src):src.includes(re));console.log((ok?'✅ ':'❌ ')+m);if(!ok)fail++;};
const hasSw=(re,m)=>{const ok=(re instanceof RegExp?re.test(sw):sw.includes(re));console.log((ok?'✅ ':'❌ ')+m);if(!ok)fail++;};
const absent=(re,m)=>{const ok=!(re instanceof RegExp?re.test(src):src.includes(re));console.log((ok?'✅ ':'❌ ')+m);if(!ok)fail++;};

console.log('── L136 ──');
absent(/^\s*stopVersionWatcher\(\)/m,'CRITIQUE : plus AUCUN appel à stopVersionWatcher() (fonction inexistante ; seul un commentaire la mentionne)');
has(/fd\.coupee===true&&nrm\(fd\.ref\)/,'#10 proposeStockSortie : filtre fd.coupee===true');
has(/!m\.corrigePar&&!m\.corrige&&String\(m\.note/,'#11 noteHas exclut les contre-écritures (m.corrige)');
has(/deleteSave\(id\)\{[\s\S]{0,200}?canManageData\(\)/,'#16 deleteSave : garde canManageData');
has(/clearTimeout\(_fb\)/,'#17 updReload : timer de repli annulable');
has(/selOp\.innerHTML=.<option value="">Tous découpeurs/,'#25 filtre découpeurs dynamique');

console.log('── L137/L138 ──');
has(/_photoUploadsPending>0\){ showToast\('⏳ '\+_photoUploadsPending\+' photo/,'#2 stopManqueMatiere : garde photo');
has(/fLameChg.*avant l\\'arrêt manque-matière/,'#3 stopManqueMatiere : garde lame');
has(/fMachChg.*avant l\\'arrêt manque-matière/,'#3 stopManqueMatiere : garde machine');
has(/if\(_viewingSharedId\|\|_localCopyFromShare\) return;/,'#5/#6 autosaveDraftTick + planAutosaveTick : garde copie locale');
has(/_localCopyBannerDismissed/,'#21 découplage bandeau / garde anti-doublon');

console.log('── L140/L141 ──');
has(/entrée ORPHELINE.*null/,'#4 _pmFindGroup : null sur orphelin');
has(/planManual=planManual\.filter\(r=>\(r&&r\.refIdKey/,'#4 adaptPlanManualToInputs : purge orphelins');
has(/over:true, total:tot, useful:uf/,'#5 planManualCoherence : écart « over » hors-laize');
has(/clearTimeout\(_recalcPlanTimer\); recalcPlan\(\); \}catch\(e\)\{\}/,'#20 showPage(1) : purge recalc débouncé');
has(/if\(secMid>0 && \(addSec<0\.3\*secMid \|\| addSec>3\*secMid\)\)/,'#12 dujEstimate : clamp additif 0,3×–3×');
has(/const _opsOf=t=>\{ const o=\[\.\.\.new Set\(tempsShareParts\(t\)/,'#13 renderAnalyse : ventilation op.2 (weekOpMap)');
has(/tempsShareParts\(t\)\.forEach\(g=>\{ const m=g\.mach/,'#13 renderAnalyse : ventilation machine');
has(/scope==='global'\)\?0:\(\(deb&&deb\.d\)\|\|0\)/,'#26 dujCalibrateAdditive : mapeM masqué en global');
has(/const partiel=\(auditCache\.length>=AUDIT_LOAD_LIMIT\)/,'#30 exportAudit : mention plafond');
has(/const _soldeUtil=\{\}; \['step','prod'\]/,'#23 stock : seuil sur stock utilisable (hors B+K)');

console.log('── L142 ergonomie ──');
has(/👤 \$\{esc\(f\.client\)\}<\/div>`:''\}<!-- \[L142/,'#7 nom client PDF lisible');
has(/badge\.textContent=hasNC\?'⚠ NC':'✓ RAS'/,'#8 badge daltonien ✓RAS/⚠NC');
has(/color:#141310;background:var\(--mc,#888\)/,'#9 pastilles machine texte sombre');
has(/kind==='err'\)\?Math\.min\(14000,Math\.max\(8000/,'#14 toast erreur 8-14s');
has(/body\.atelier \.machine-btn-fiche\{min-height:52px/,'#2 cibles machine 52px atelier');
has(/top:calc\(56px \+ env\(safe-area-inset-top,0px\)\)/,'#20 coupeeBanner safe-area');
has(/@media\(max-width:700px\)\{ select,textarea,input/,'#21 anti-zoom iOS téléphone');
has(/@media\(max-width:430px\)\{#verTag\{display:none\}/,'#19 nav iPhone anti-débordement');

console.log('── L143/L144/L145/L146 décisions ──');
has(/const _premierDepart=\(countCoupees\(\)===0\)&&\(typeof chronoSec/,'chronoStart : rappel au 1er départ seulement');
has(/chronoRunning&&!confirm\('⏱ Le chronomètre TOURNE/,'doLogout : garde chrono');
has(/if\(currentRole==='operateur'\) on=true;/,'initAtelier : atelier forcé ON pour le rôle operateur (bugfix L152 : op→operateur)');
has(/@media\(max-width:1099px\)\{\s*body\.has-actionbar #actionBar\{display:block\}/,'barre d\'action affichée sur tablette (≤1099px)');
hasSw(/const FIREBASE_URLS=\[/,'sw.js : liste des scripts Firebase à précacher');
hasSw(/_isFirebaseSdk\(url\)\)\{/,'sw.js : fetch cache-first Firebase');
hasSw(/const cur=await c\.match\('index\.html'\)/,'sw.js : GEL de version index.html PRÉSERVÉ');
has(/SEGMENT FANTÔME/,'#9 planning : segments fantômes multi-machines');
has(/const ghosts=inSpan\.filter\(s=>dujMachKey\(s\.plannedMachine\|\|''\)!==m/,'#9 filtre des fantômes (autre machine)');
has(/✂ Chute stock <span style="font-weight:700;color:var\(--orange\)">\$\{fmt\(chuteStockMm\)/,'#12 chute stock unifié en orange');
has(/const lostMach=all\.filter\(s=>s\.plannedDate&&dujMachKey\(s\.plannedMachine\|\|''\)===''/,'#22 planning : bande « machine inconnue »');
has(/Cet article a ENCORE .*en mouvements/,'#24 stock : avertissement archivage à solde non nul');
has(/vérifier la couverture de la commande/,'CRIT#1 (audit 9001) : rebut 🗑/NC quantité force hasEcart (anti sous-livraison silencieuse)');
has(/const _dechetPieces=ficheData\.reduce/,'CRIT#1 : comptage des pièces au rebut à l\'archivage');
has(/const _resolveKey=fd=>\{/,'CRIT#2 (audit 9001) : désambiguïsation homonymes par LARGEUR dans _resteGroupsFromFiche');
has(/const MAX_USEFUL_MM=4000/,'#5/#20 anti-gel : clamp laize utile 4000 mm (20000 gelait le DP 135 s)');
has(/const MAX_BLADE_MM=50/,'#5 anti-gel : clamp lame 50 mm');
has(/largeur < 1 mm/,'#23 : largeur sub-millimétrique refusée (0 slot → pièce perdue en silence)');
has(/!before\.d \|\| \(machKey\|\|null\)!==\(before\.m\|\|null\)/,'revue planning #1/#2 : étalement auto SEULEMENT 1re pose ou changement de machine');
has(/normalisée au 1er jour OUVRÉ suivant/,'revue planning #3 : pose sur férié normalisée');
has(/if\(M===60\)\{H\+\+;M=0;\}/,'revue planning #12 : _plnH report de retenue (1 h 60 → 2 h)');
has(/importFullBackup/,'#16 : import de sauvegarde présent (round-trip)');
has(/Cascade archivage fiche/,'#14 : cascade temps à l\'archivage d\'une fiche');

console.log(fail?('\n💥 '+fail+' correctif(s) MANQUANT(S) — revert silencieux ?'):'\n🏆 '+'INTÉGRITÉ AUDIT OK : tous les correctifs L126→L146 présents dans index.html + sw.js');
process.exit(fail?1:0);
