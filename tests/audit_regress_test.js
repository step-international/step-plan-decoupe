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
has(/if\(dujMachKey\(s\.plannedMachine\|\|''\)===m\) return false;/,'#9 filtre des fantômes (autre machine) — forme L206 (bloc)');
has(/AUCUN fantôme chez la native/,'L206 : commande déplacée → pas de fantôme natif (charge sur la machine posée)');
has(/RÉ-ÉTALER les cartes déjà posées|1\) RÉ-ÉTALER/,'L206 : autofill ré-étale les commandes déjà posées (max 7h30/j)');
has(/✂ Chute stock <span style="font-weight:700;color:var\(--orange\)">\$\{fmt\(chuteStockMm\)/,'#12 chute stock unifié en orange');
has(/const lostMach=all\.filter\(s=>s\.plannedDate&&dujMachKey\(s\.plannedMachine\|\|''\)===''/,'#22 planning : bande « machine inconnue »');
has(/Cet article a ENCORE .*en mouvements/,'#24 stock : avertissement archivage à solde non nul');
has(/vérifier la couverture de la commande/,'CRIT#1 (audit 9001) : rebut 🗑/NC quantité force hasEcart (anti sous-livraison silencieuse)');
has(/const _dechetPieces=ficheData\.reduce/,'CRIT#1 : comptage des pièces au rebut à l\'archivage');
has(/const _resolveKey=fd=>\{/,'CRIT#2 (audit 9001) : désambiguïsation homonymes par LARGEUR dans _resteGroupsFromFiche');
has(/const MAX_USEFUL_MM=4000/,'#5/#20 anti-gel : clamp laize utile 4000 mm (20000 gelait le DP 135 s)');
has(/const MAX_BLADE_MM=50/,'#5 anti-gel : clamp lame 50 mm');
has(/largeur < 1 mm/,'#23 : largeur sub-millimétrique refusée (0 slot → pièce perdue en silence)');
has(/GARDIEN UNIQUE 7h30/,'L212 : plnSetPlan = gardien unique 7h30 (toute pose sans days recalcule load-aware, refuse si jour plein)');
has(/Impossible sans dépasser 7h30/,'L212 : refus de pose quand le jour est déjà plein (jamais de dépassement au glisser)');
has(/normalisée au 1er jour OUVRÉ suivant/,'revue planning #3 : pose sur férié normalisée');
has(/if\(M===60\)\{H\+\+;M=0;\}/,'revue planning #12 : _plnH report de retenue (1 h 60 → 2 h)');
has(/importFullBackup/,'#16 : import de sauvegarde présent (round-trip)');
has(/Cascade archivage fiche/,'#14 : cascade temps à l\'archivage d\'une fiche');
has(/pièces commandées non produites/,'CRIT#1 v2 : couverture PAR LARGEUR à l\'archivage (_resteGroupsFromFiche rejoué — détecte les bobines sous-remplies sans rebut)');

console.log('── L218 régressions revue (diff du jour) ──');
has(/const _fromResume=_resumeAutoImportGuard; _resumeAutoImportGuard=false;/,'#1 MAJEUR : import auto capture le flag reprise (consommé une fois)');
has(/if\(!auto && !_fromResume\)\{ _resumedForeignDraftId=null; _resumedDraftId=null; \}/,'#1 MAJEUR + L245 : reset passation UNIQUEMENT sur régénération MANUELLE (l aller-retour Plan→Fiche ne désarme plus la passation — anti double découpe)');
has(/_resumeAutoImportGuard=true;   \/\/ \[L218/,'#1 MAJEUR : resumeDraft arme le flag avant showPage(1)');
has(/const _sibling=\(fichesCache\|\|\[\]\)\.some\(f=>f&&!f\.deleted&&f\._id!==id/,'#2 : cascade temps ne s\'exécute QUE si aucune fiche sœur vivante ne partage le triplet (anti sous-comptage KPI)');
has(/if\(!show && \(fromClientChange\|\|!hasVal\) && sel\) sel\.value='';/,'#3 : VEKA→non-VEKA interactif VIDE le sous-type (anti-rétention — régression du garde L215)');
has(/updateVekaVisibility\(true\);   \/\/ \[L218\]/,'#3 : onClientChange passe fromClientChange=true');
absent(/class="fiche-film-badge"/,'L222 ergo #9 : bandeau violet Film SUPPRIMÉ (info portée par la carte compacte de réf L217)');

console.log('── L222 ergonomie lot A ──');
absent(/onclick="resetFicheBobines\(\)"/,'ergo #10 : bouton global « Reset bobines » retiré');
absent(/Recalcule les écarts \(rattrapage \/ surplus\) sur toute la commande/,'ergo #10 : bouton global « Recalculer les écarts » retiré');
has(/Recalcule les écarts de cette bobine/,'ergo #11/#12 : bouton « ♻ Recalculer les écarts » RÉTABLI sur chaque bobine');
absent(/>⬆ Restaurer une sauvegarde<\/button>/,'ergo #2 : bouton « Restaurer une sauvegarde » retiré de l\'UI');
absent(/>🧊 Archive froide<\/button>/,'ergo #2 : bouton « Archive froide » retiré de l\'UI');
has(/importFullBackup/,'ergo #2 : importFullBackup conservé en code (réactivable)');
has(/id="btnLoadFull"[\s\S]{0,120}?Charger l'historique complet/,'ergo #2 : « Charger l\'historique complet » sur la rangée d\'actions');
absent(/class="fc-cmdline"/,'ergo #6 : bandeau bleu des laizes retiré de la carte fiche');
has(/ab-confirm/,'ergo #15 : « Confirmer la commande » une seule fois (bouton pleine page masqué quand la barre le porte)');
has(/id="etiqPhotoInput"/,'L226 ergo #14 : input caméra étiquettes présent');
has(/name:'Étiquette '\+\(\+\+n\)/,'L226 ergo #14 : photos étiquettes poussées dans commandeFiles (archivées avec la fiche + PDF)');
has(/if\(!bandHtml\) div\.classList\.add\('refonly'\);/,'L224 : bande de réf supprimée du PORTRAIT (le bloc Réf N y est l unique porteur) — révisé L372 : rendue partout, classe refonly = visible en paysage seulement (les blocs sont masqués L361)');
has(/function plnResetAll/,'L223 ergo #3 : Reset du planning présent (via gardien plnSetPlan)');
has(/id="ncBox"/,'L223 ergo #13 : Registre NC dans Analyse (repliable)');

console.log('── L231 audit L217→L229 (7 bugs corrigés) ──');
has(/const _logRefCheck=\(\)=>/,'MAJ-1 ISO : trace « ref-check » rétablie dans applyFicheRefPlanChange (2 branches de succès)');
has(/Vérification bobine mère RÉOUVERTE/,'MAJ-1 ISO : la ré-ouverture (recorriger) est tracée aussi');
absent(/function toggleRefValid/,'MAJ-1 : cluster mort toggleRefValid/_paintRefValid/_refCheckOk purgé');
has(/const nm=nrm\(c\.ref\|\|''\);/,'MAJ-2 : drift check — repli par NOM quand refIdKey a divergé (chgt machine → défauts bords/lame)');
has(/h3\.pp-ref\{color:#000!important/,'MAJ-3 : en-tête de réf NOIR sur papier (grayscale rendait les pastels illisibles)');
has(/En mono-réf : petit chip discret|petit chip discret \(pas le gros bandeau\)/,'MAJ-4 : film visible en MONO-réf (chip discret — la carte compacte n\'existe qu\'en multi)');
has(/onclick="openCommandeFileViewer\(\$\{i\}\)"/,'MIN-5 : vignettes étiquettes → openCommandeFileViewer (openCommandeFile n\'existait pas)');
has(/#planDriftBanner\{margin-bottom:10px/,'MIN-6 : styles bannière dérive en CSS (l\'inline écrasait l\'override atelier)');
has(/let _cPos=-1;/,'MIN-7 : index couleur écran = réfs AVEC lignes (aligné PDF, bloc vide n\'décale plus)');

console.log('── L243 audit propriétés + demandes Esteban ──');
has(/AVEZ-VOUS PRIS LA PHOTO DES ÉTIQUETTES/,'demande Esteban : alarme rouge « photo des étiquettes ? » à la validation de commande');
has(/function restoreLastNav/,'demande Esteban : reprise de navigation (dernière page/onglet) au rechargement');
has(/localStorage\.setItem\('step_lastPage'/,'reprise nav : page courante mémorisée');
has(/const n=v=>String\(v==null\?'':v\)\.trim\(\)\.toLowerCase\(\)\.split\('¦'\)\.join\('¦¦'\)/,'props P4 : _refIdKey longueur normalisée + séparateur ¦ échappé');
has(/const _q=\(v,i\)=>\(i===2\|\|i===4\|\|i===5\)\?Math\.round\(v\/EPS\)/,'props P3b/P3c : _plnKeyLt quantifié = ordre strict TOTAL (transitif)');
has(/String\(a\.machine\|\|''\)\.localeCompare\(String\(b\.machine\|\|''\)\)\|\|String\(a\.lameNum/,'props P3 : tri lames ordre TOTAL (machine/n°/id) — état déterministe');
has(/filter\(r=>r\.qty>0&&r\.width>=1\)/,'props P15 : _sanStoredRows exclut largeur <1 mm (plus de perte silencieuse)');

console.log('── L219/L220 plan de découpe ──');
has(/class="rb-refchip"/,'L219 : pastille couleur PAR RÉFÉRENCE sur la bande écran du plan');
has(/color:\$\{refColor\(ci\)\};border-left:5px solid \$\{refColor\(ci\)\}/,'L219 : en-tête PDF/aperçu coloré par réf (refColor)');
has(/if\(ci>0&&_prevMachLbl|grayscale\(1\)/,'L219 : impression papier reste N&B (grayscale @media print conservé)');
has(/if\(perte>optPerte\+1e-9\) return;/,'L220 : sélecteur DOMINANT — ne prend JAMAIS une partition dont la perte réelle dépasse celle de l\'optimum de rendement (perte jamais aggravée)');
has(/const optPerte=opt\.waste-_reuse\(opt\.keys\)/,'L220 : DOMINANT en 2 passes (optimum rendement, puis min solde-milieu sous contrainte perte ≤ optimum)');
has(/phaseEndSolde:Math\.max\(0,c\.useful-calcStats\(_lp,c\.blade\)\.total\)/,'L220 : solde de fin de phase calculé par tranche (même déf. que le marquage _phaseEnd)');

console.log('── L221 dérive plan→fiche (bug Dominique) ──');
has(/function _fichePlanDriftCheck\(opts\)/,'L221→L286 : détecteur de dérive plan→fiche présent (signature opts : autoApply réservé à showPage)');
has(/id="planDriftBanner"/,'L221 : bannière de dérive dans la page Fiche');
has(/if\(typeof _fichePlanDriftCheck==='function'\) _fichePlanDriftCheck\(\{autoApply:true\}\);/,'L221→L286 : check branché sur l\'arrivée onglet Fiche (showPage 1), SEUL porteur d\'autoApply');
has(/const _engaged=lines\.some\(engagedOf\);/,'L221→L278 : réf ENGAGÉE — la MACHINE reste gardée (dans if(!_engaged), travail terrain prime), mais stock/rouleaux chute passent (recalc du reste, sûr)');
has(/function _applyPlanDriftFix\(opts\)\{[\s\S]{0,1600}?recalcEcartsFromFiche\(\{force:true, onApplied:/,'L221→L286 : bouton bannière route vers recalcEcartsFromFiche({force:true, onApplied}) — chemin éprouvé qui conserve les coupées + re-contrôle la dérive après re-base (plus de bandeau bloqué rouge)');
has(/_applyPlanDriftFix\(opts\)\{\n?\s*opts=opts\|\|\{\};\n?\s*if\(typeof _shareCurrentDocId==='function'&&_shareCurrentDocId\(\)\)/,'L221→L286 : garde partage AVANT toute mutation (verrous cuts par position protégés), y compris en mode silent');

console.log('── L246/L247 chantier ANALYSE — lots R1/R2 ──');
has(/function _acSetHTML\(ac,html\)/,'R1 : re-render Analyse préservant saisies + details ouverts (_acSetHTML)');
has(/let _dujSamplesMemo=null/,'R1 : échantillons débit mémoïsés (plus de triple recalcul par render)');
has(/_ms\.indexOf\(analyseFilter\.mach\)>=0/,'R1 : filtre machine/op couvre les segments RELAIS (machine2/operateur2)');
absent(/clientRank|volSvg/,'R1→R4 : calculs morts TOTALEMENT purgés (clientRank/volSvg n\'existent plus — le placeholder R1 est parti avec le refactor zones R4)');
has(/if\(f\.manqueMatiere\)\{\n\s*const _cut=\(Array\.isArray\(f\.ficheDetail\)\?f\.ficheDetail\.filter\(fd=>fd&&fd\.coupee===true\)\.length:0\);\n\s*b=Math\.min\(b,_cut\); p=NaN;/,'R2.1 : KPI mensuel — fiche manque-matière comptée sur bobines COUPÉES, perte exclue (constat HAUTE L79)');
has(/machMap\[m\]\.durW\+=t\.duree\*f; machMap\[m\]\.laiW\+=t\.totalLaizes\*f;/,'R2.2 : comparaison machines en sec/laize PONDÉRÉ (durW/laiW), plus de moyenne de ratios');
has(/const _hasRelay=!isNaN\(_o2s\)&&_o2s>=1&&_o2s<=det\.length&&\(f\.ini2\|\|f\.machine2\)/,'R2.3 : NC écran ventilées PAR BOBINE au relais op.2/machine2 (bornées à op2Bob, comme le KPI figé)');

console.log('── L249 chantier ANALYSE — lot R4 ──');
has(/function _anaFiltered\(\)/,'R4a : filtre GLOBAL {machine·op·mois·client} (état + helper)');
has(/analyseFilter\.client==='ALL'\|\|nrm\(t\.client\|\|''\)===nrm\(analyseFilter\.client\)/,'R4a : dimension CLIENT appliquée aux temps (nrm)');
has(/id="zoneCharts"/,'R4a : rendu PARTIEL par zones (zoneFbar/zoneCharts/zoneFa)');
has(/class="ana-scope-note"/,'R4a : bandeau « périmètre tout atelier » sur Pilotage/Débit/KPI/Tendances quand filtre actif');
absent(/Temps moyen par largeur de bobineau/,'R4a : carte « Temps moyen par largeur » RETIRÉE (redondante avec le corrigé-laize)');
has(/if\(analyseFilter\.op!=='ALL'&&String\(op\)\.trim\(\)!==analyseFilter\.op\) return;/,'R4a : NC filtrées au niveau BOBINE (part de l\'op relayeur isolable)');
has(/function _pilotToggle\(/,'R4b : tuiles Retards / À planifier dépliables (listes plus jamais jetées)');
has(/function _kpiFichesToggle\(/,'R4b : tuile Fiches → liste du mois (mois figé = requête datée à la demande, lecture seule)');
has(/liste limitée à \$\{CAP\}/,'R4b : cap de liste ANNONCÉ (jamais de troncature silencieuse)');
has(/function _openNcRegistre\(/,'R4b : carte NC → Registre NC (ncBox)');

console.log('── L250 chantier ANALYSE — lot R5 ──');
has(/OP_COLORS=\{'TB':'#22d3ee','JF':'#a3e635','MR':'#f59e0b','MT':'#f59e0b'/,'R5 (recalibré L404) : palette opérateurs — MR ajouté, MT conservé pour l archive');
has(/body\.atelier #tabContentAnalyse\{zoom:1\.18\}/,'R5 : mode atelier AGIT sur Analyse (zoom conteneur — lisible à 60 cm)');
has(/min-width:560px;display:block/,'R5 : graphes non-rétrécissants (défilement au lieu de labels 5 px sur téléphone)');
has(/function _anaFold\(/,'R5 : blocs repliables avec état retenu (localStorage step_ana_fold)');
has(/step_ana_fold/,'R5 : clé de persistance des blocs');
has(/if\(!e\.target\.closest\('svg'\)\) _atipHide\(\)/,'R5 : tooltip refermable au tap hors graphe');
has(/Quelle machine décroche \?/,'R5 : titres reformulés en QUESTIONS dirigeant');
has(/min-width:430px;border-collapse:collapse/,'R5 : table Pilotage défile proprement sur petit écran');

console.log('── L251 chantier ANALYSE — lot R6 ──');
has(/function csvMetaLine\(/,'R6 : ligne de méta CSV (date · auteur · périmètre · nb lignes)');
has(/csvMetaLine\('Relevés de temps',temps\.length\)/,'R6 : périmètre DANS le CSV temps');
has(/csvMetaLine\('Registre NC',rows\.length\)/,'R6 : périmètre DANS le CSV NC');
has(/csvMetaLine\('Fiches de découpe',fiches\.length\)/,'R6 : périmètre DANS le CSV fiches');
has(/function exportDashboardCsv\(/,'R6 : export CSV tableau de bord (KPI 24 mois + débit quartiles + pilotage)');
has(/step_tableau_de_bord_/,'R6 : nom de fichier daté du tableau de bord');
has(/n\/d = mois figé AVANT la version/,'R6 : n/d expliqué DANS le fichier (jamais un faux 0 exporté)');

console.log('── L252 restes chantier ──');
has(/function _supersededManualDrafts\(newId,newLabel,newDraft\)\{/,'L252 : anti-doublon brouillons reçoit l\'état du nouveau brouillon');
has(/return hasNum && d\.label===newLabel;\n  \}\);/,'L252→L254 : brouillons avec n° = concordance client+n° (comportement historique) ; sans n° non repris = jamais supersédé (sûr)');
absent(/l'ancien porte un n° dans son état/,'L254 : extension L252 « sans n° » RETIRÉE (annulée par le revert — perte de données confirmée ×2)');
has(/function _openTempsBox\(/,'L252 : drill-down Débit → relevés de temps (tempsBox)');

console.log('── L253 revue adversariale du chantier (3 confirmés ×2 + 2 corrigés par prudence) ──');
has(/function dujSamplesInvalidate\(\)/,'L253 MAJEUR : invalidation EXPLICITE du mémo débit (soft-delete/correction machine invisibles à la clé nb+Σdurée)');
has(/dujSamplesInvalidate\(\);   \/\/ \[L253 · revue\]/,'L253 : invalidation branchée au funnel commun refreshAnalyseIfPresent');
has(/if\(typeof dujSamplesInvalidate==='function'\)dujSamplesInvalidate\(\);/,'L253 : invalidation aussi aux rechargements de cache (boot + historique complet)');
has(/if\(_ks&&_ks\.value&&_ks\.value!==currentMonthYM\(\)\) renderKpiMois\(_ks\.value\);/,'L253 MAJEUR : kpiMoisSel restauré ⇒ contenu KPI resynchronisé (plus d\'étiquette « figé » sur chiffres live)');
has(/const el2=document\.getElementById\('kpiFichesList'\)\|\|el;/,'L253 : drill-down fiches — re-lookup du nœud VIVANT après l\'await (plus d\'écriture dans un élément détaché)');
has(/snap\.metadata&&snap\.metadata\.fromCache/,'L253 : hors-ligne dit HONNÊTEMENT que la liste vient du cache local (possiblement partielle)');
has(/async function exportDashboardCsv\(\)\{/,'L253 : export tableau de bord passe par ensureFullHistory comme TOUS les autres exports');
has(/typeof n==='number'\?\(n\+' ligne\(s\)'\):_safe\(n\)/,'L253→L254 : méta CSV — unité correcte (« 12 mois ») + valeur neutralisée');

console.log('── L254 revue adversariale passe 2 (7 confirmés ×2 : logique + sécurité) ──');
has(/if\(f\.manqueMatiere && fd\.coupee!==true\) return;/,'L254 MAJEUR : dénominateur NC du KPI exclut les bobines jamais coupées d\'un manque-matière (taux juste)');
has(/if\(f\.manqueMatiere && d && d\.coupee!==true\) return;/,'L254 MAJEUR : idem dans buildFicheAnalytics (taux NC op/machine non gonflés)');
has(/REVERT de l'extension L252/,'L254 MAJEUR : brouillons « sans n° » ne se consomment plus sur client+réf seul (plus de perte silencieuse)');
has(/return hasNum && d\.label===newLabel;\n  \}\);/,'L254 : _supersededManualDrafts revenu au comportement sûr d\'avant L252');
has(/const _safe=v=>\{ let x=String\(v==null\?''.*replace\(\/\[;/,'L254 MAJEUR : csvMetaLine neutralise ; \\r \\n et les débuts de formule (=+-@) — anti-injection CSV');
has(/else if\(collection==='temps'\)\{ if\(typeof dujSamplesInvalidate==='function'\) dujSamplesInvalidate\(\);/,'L254 : restauration d\'un relevé invalide le mémo débit (Débit/estimateur/Planning à jour)');
has(/const mxReal=mx;/,'L254 : sparkline — étiquette « max » = vrai maximum (série plate ne montre plus max+1)');
has(/if\(last&&prev&&\(last\.i-prev\.i\)===1\)\{/,'L254 : tendances — flèche « vs mois préc. » seulement entre mois CONSÉCUTIFS (trous respectés)');
has(/const _lastCur=last&&last\.i===\(vals\.length-1\);/,'L254 : tendances — valeur en tête DATÉE si le dernier point n\'est pas le mois courant');
has(/allTemps\.map\(t=>_ymL2\(t\.date\)\)/,'L254 : filtre « Mois » construit en LOCAL + inclut les mois des fiches');

console.log('── L255 R7 (arbitrage Esteban 24/07) — pilotage voit le bloc Pilotage ──');
has(/function canViewPilotage\(\)/,'L255 : rôle pilotage habilité au bloc Pilotage (canViewPilotage = admin || pilotage)');
has(/id="pilotageScope"/,'L255 : conteneur dédié du bloc Pilotage pour le rôle pilotage');
has(/if\(!full && canViewPilotage\(\)\)\{/,'L255 : _applyAnalyseScope rend le Pilotage au pilotage SEUL (admin l\'a déjà dans analyseContent — pas de doublon)');
has(/AUCUNE règle Firestore modifiée/,'L255 : dérive de saves+temps déjà lisibles par le pilotage → zéro impact règles');

console.log('── L256 bug Esteban : bouton « Revenir à la fiche » de l\'étiquette solde ──');
absent(/<button class="back" onclick="window\.close\(\)">/,'L256 : plus de window.close() nu (no-op dans l\'iframe srcdoc)');
has(/getElementById\('printOverlayClose'\);\}catch\(e\)\{\}if\(b\)\{b\.click\(\);\}else\{window\.close\(\)/,'L256 : « Revenir à la fiche » ferme l\'overlay (révèle la fiche) + repli window.close desktop');

console.log('── L259 demande Esteban : Confirmer sans trou + progression unique ──');
has(/id="sendPlanWrap"/,'L259 : « Confirmer » déplacé DANS #ficheRight, juste après les bobines (remonte quand les coupées se masquent, aucun trou)');
absent(/id="sendPlanBtnTop"/,'L259 : ancien bouton dupliqué dans la bannière (L257) retiré');
absent(/<div id="ficheProgress"/,'L259 : suivi #ficheProgress dupliqué RETIRÉ (progression unique = coupeeBanner sticky en tête)');
absent(/:has\(#sendPlanBtn\)/,'L259 : montage grid-row:41 retiré (source du trou visuel)');

console.log('── L258 bugs Esteban : impression fantôme + nom machine multi-réf ──');
has(/_f\.onload=null;/,'L258 BUG1 : fr.onload nullifié à la fermeture → plus d\'impression fantôme (la croix ramène à la fiche)');
absent(/printOverlayClose'\)\.onclick=function\(\)\{ ov\.style\.display='none'; try\{ document\.getElementById\('printOverlayFrame'\)\.srcdoc/,'L258 BUG1 : ancien handler bugué (vide srcdoc AVANT de couper l\'auto-print) retiré');
has(/NOM DE MACHINE affiché dans la liste « Ordre de coupe »/,'L258 BUG2 : nom machine dans l\'ordre de coupe (colonne gauche)');
has(/const _hmChip=\(!validated&&_hml\)/,'L258 BUG2 : nom machine dans l\'en-tête du bloc de chaque réf (états à couper/verrouillé)');

console.log('── L260 lot retours terrain Esteban ──');
has(/const _b=document\.getElementById\('coupeeBanner'\); if\(_b\)\{ _b\.style\.display='none'; _b\.innerHTML=''; \} return;/,'L260 #1 : fiche vide → bannière progression MASQUÉE + vidée (plus d\'ancien avancement affiché après reset)');
has(/function onFmmMachineBtn\(btn,m\)/,'L260 #2 : machine multi-réf en BOUTONS colorés (handler dédié)');
has(/<input type="hidden" data-fmm="machine"/,'L260 #2 : input caché data-fmm="machine" → validation applyFicheRefPlanChange INCHANGÉE');
has(/couleur PAR RÉF \(même palette que l'ordre de coupe\)/,'L260 #3 : étiquette solde colorée par réf (distingue 2 réfs identiques)');
has(/\$\{d\.color\?`border-left:6px solid \$\{d\.color\};`:''\}/,'L260 #3 : bordure gauche couleur réf sur la carte étiquette solde');
has(/dRec=\{ type:'lame', categorie:'demonte', machine, lameNum:_prevLame/,'L260 #4 (durci L269) : lame remplacée → événement DÉMONTAGE daté du jour (désormais dans le MÊME batch que la pose)');
has(/laize\(s\) plus large\(s\) que la laize utile de leur référence/,'L260→L261 #5 : recalcul écarts — plus de REFUS SEC (alerte persistante, opérateur informé, ça passe)');
absent(/⛔ Recalcul bloqué/,'L260 #5 : ancien refus sec du recalcul retiré');

console.log('── L261 : ancien visuel progression + recalcul alerte persistante ──');
has(/ANCIEN VISUEL remis : nombre « X \/ N coupées » \+ barre COLORÉE/,'L261 : progression = nombre + barre colorée ok/nc/reste + % (ancien visuel #ficheProgress restauré dans la bannière)');
has(/_pct=total\?Math\.round\(done\/total\*100\):0/,'L261 : pourcentage recalculé dans la bannière');
has(/\.fp-bar\{/,'L261 : classes .fp-* rendues globales (réutilisées par la bannière)');
absent(/#ficheProgress \.fp-/,'L261 : plus aucune règle .fp-* scopée sur #ficheProgress (élément retiré en L259)');
has(/ALERTE PERSISTANTE \(modale native\) au lieu d'un toast éphémère/,'L261 : recalcul oversize → alerte MODALE persistante (plus écrasée par le toast succès)');
has(/Le recalcul continue sur le reste\.'\);\n  \}/,'L261 : après l\'alerte, le recalcul PASSE TOUJOURS (plus de blocage)');
has(/focus\/scroll vers les BOUTONS machine/,'L261 : « Valider la bobine mère » défile vers les boutons machine (fix focus input caché)');

console.log('── L262 : recalcul « bobine mère trop petite » ne bloque plus ──');
has(/const _unreadable=\[\], _tooLarge=\[\];/,'L262 : recalcul sépare « trop large » (sûr) des configs vraiment illisibles (danger)');
has(/if\(_reason\.indexOf\('trop large'\)===0\) _tooLarge\.push\(_entry\); else _unreadable\.push\(_entry\);/,'L262 : « trop large » routé vers avertissement, le reste reste bloquant');
has(/ont une découpe PLUS LARGE que la laize utile enregistrée/,'L262 : « trop large » = alerte modale + le recalcul CONTINUE (demande Esteban)');
has(/ressortiront dans le RESTE À PRODUIRE/,'L262→L269 : config illisible au recalcul = ALERTE persistante explicite (plus de blocage — demande Esteban 24/07), conséquence re-production DITE à l\'opérateur');

console.log('── L263 : récap recalcul honnête (plus de « couverte » mensongère) ──');
has(/const _ovc=\(c\.oversize\|\|\[\]\)\.filter\(r=>r&&Number\(r\.qty\)>0\);/,'L263 : le récap récupère les laizes oversize NON produites de chaque réf');
has(/reste des pièces NON produites \(voir ci-dessous\)/,'L263 : plus de « commande couverte » quand des laizes sont trop larges (sous-livraison rendue VISIBLE)');

console.log('── L267 : audit (choix Esteban) — indicateur test 2ᵉ + photos hors-ligne ──');
has(/classList\.toggle\('t2-todo',\(!!_t2nc\|\|ncMode\)&&!test2Resolved\(id\)\)/,'L267 (révisé L307, élargi L376) : t2-todo sur test-2ᵉ-NC ET bobine NC (le ✂ refusait en silence sur NC — grande analyse A4)');
has(/\.fiche-line\.t2-todo:not\(\.coupee\) \[id\^="coupeeBtn_"\]::after\{content:" · ⚠ test 2ᵉ à cocher"/,'L267 : le ✂ affiche « test 2ᵉ à cocher » (chrono tournant)');
has(/function flushPendingLocalPhotos\(\)/,'L267 : re-téléversement des photos gardées en base64 au retour réseau');
has(/window\.addEventListener\('online',function\(\)\{ setTimeout\(flushPendingLocalPhotos/,'L267 : déclenché sur l\'événement online');
has(/_pendingLocalPhotos\[lid\]=blob;/,'L267 : le Blob compressé est mis en file au timeout d\'upload');

console.log('── L268 : MOTEUR plan (revert L245 grosses-laizes + solde à la fin) + revue photos/impression ──');
absent(/rawPeak=_seqPeak\(prefix\.concat\(pg\)\)/,'L268 : L245 ANNULÉ — plus de candidat « ordre brut » dans _seqMinPalettes (grosses laizes d\'abord + solde en dernier, byte-identique pré-L245)');
has(/best\.keys=best\.keys\.map\(\(k,i\)=>\[k,i\]\)\.sort\(\(a,b\)=>\(slice\[a\[0\]\]\.phaseEndSolde-slice\[b\[0\]\]\.phaseEndSolde\)/,'L268 : _palRepack réordonne les phases → plus gros solde EN FIN (bug Prima « solde au milieu » corrigé, choix atelier « solde à la fin »)');
has(/<style>:root\{--red:#f65157;--alert:#f65157;--green:#45c97b;--orange:#f0742a/,'L268 : documents imprimés (autonomes) reçoivent les tokens sémantiques → rouge NC/perte plus jamais GRIS à l\'impression');
has(/const _stillPending=/,'L268 : re-téléversement photo AUTO-VALIDÉ (base64 encore présent + ligne existante, avant ET après await) → plus de photo supprimée ressuscitée ni d\'upload orphelin');
has(/delete _pendingLocalPhotos\[lineId\];/,'L268 : suppression d\'une photo purge aussi la file de re-téléversement');
has(/machCard\('FEBA','#4f9df2'\)/,'L268 : bloc KPI « Par machine » utilise les tokens couleur machine (harmonisé)');
has(/if\(mk==='feba'\)return'#4f9df2'/,'L268 : _opColor utilise les tokens couleur machine (harmonisé)');

console.log('── L269 : fin des interdictions opérateur + lames robustes (demandes Esteban 24/07) ──');
absent(/Recalcul BLOQUÉ — config illisible/,'L269 : plus AUCUN blocage au recalcul des écarts (alerte + continue)');
has(/Arrêt manque matière.*confirmDlg|confirmDlg\('⚠ Config illisible sur/,'L269 : arrêt manque matière = CONFIRMATION explicite au lieu d\'un blocage (solde reprenable → l\'opérateur décide)');
has(/const batch=db\.batch\(\); batch\.set\(iRef,rec\); if\(dRef\) batch\.set\(dRef,dRec\);/,'L269 : pose + démontage lame en UN batch ATOMIQUE (la trace demonte ne peut plus se perdre seule → plus de « démontée le » à la date de pose)');
has(/aAffuter\.push\(\{\.\.\.item,viaPose:true\}\)/,'L269 : à-affûter sans trace demonte marquée viaPose (classeur)');
has(/'posée le ⚠':dateLbl/,'L269 : carte lame honnête — « posée le ⚠ » quand le démontage n\'a pas été tracé (plus de « démontée le » mensonger)');

console.log('── L270→L281 : étiquette solde — N° de référence (case au feutre → saisie digitale) ──');
has(/N° de référence saisi DIGITALEMENT/,'L270→L281 : étiquette solde — N° de référence saisi DIGITALEMENT (repli case vide si non saisi)');

console.log('── L271 : anti-perte de référence (audit 27/07, lot 1) ──');
has(/confirmDlg\('Retirer la référence '/,'L271 #1 CRITIQUE : suppression d\'une réf entière exige une confirmation DANGER + trace (cause probable perte Tacflex/Prima)');
has(/logAudit\('delete','plan-ref'/,'L271 #1 : retrait de réf tracé dans l\'audit');
has(/rawRows\.push\(\{q:_rq,w:_rw,carton:_rc/,'L271 #2 : texte brut des lignes mal saisies capturé (getRefGroups, + carton/mandrin/client depuis la revue)');
has(/rawRows:g\.rawRows\|\|\[\]/,'L271 #2 : rawRows persistées (serializeRefGroups) → plus de perte de réf au ré-enregistrement/reprise');
has(/\(g0\.rawRows\|\|\[\]\)\.forEach\(r=>cont0\.appendChild\(makeOrderRow\(r\.q,r\.w,r\.carton/,'L271 #2 : rawRows restaurées (texte + attributs) → la bannière « config illisible » re-signale');
has(/else applySavedRef\(sel,prev,client\)/,'L271 #7 : réf hors-catalogue conservée au changement de client (plus vidée en silence)');
has(/\.replace\(\/\[Oo\]\/g,'0'\)/,'L271 #8 : parseNum normalise la lettre O→0 (anti quantité ÷100 silencieuse)');
has(/Promise\.race\(\[loadMaintenance\(\)/,'L271 #3 CRITIQUE : registre lames RAFRAÎCHI avant de tracer le démontage (fin du bug « démonté le 23 » sur tablette ouverte depuis des jours)');

console.log('── L272 : hors-ligne honnête + vérité lame + règles (audit 27/07, lot 2) ──');
has(/function boundedTx\(p,ms\)/,'L272 #5 CRITIQUE : helper boundedTx (timeout de transaction = message HONNÊTE « à refaire », PAS « en file »)');
absent(/boundedWrite\(db\.runTransaction\(/,'L272 #5 : plus aucune transaction enrobée par boundedWrite (validation/NC/stock/BL ne mentent plus « mise en file »)');
has(/boundedTx\(db\.runTransaction\(/,'L272 #5 : les 4 transactions critiques utilisent boundedTx');
has(/var _persistenceOK=true/,'L272 #9/#11 : drapeau + avertissement visible si la persistance hors-ligne échoue');
has(/function _warnPersistenceFailed/,'L272 #9/#11 : _warnPersistenceFailed prévient l\'opérateur (écritures non conservées au reload)');
has(/appVersion:\(typeof APP_VERSION!=='undefined'\?APP_VERSION:''\)/,'L272 #12 : version d\'app estampillée sur les écritures maintenance + archive fiche (traçabilité parc hétérogène)');
has(/if\(_pendingLocalPhotos && Object\.keys\(_pendingLocalPhotos\)\.length\) flushPendingLocalPhotos\(\); \}catch\(e\)\{\} \}, 45000\)/,'L272 #13 : file photos re-téléversée périodiquement (45 s), pas seulement à la reconnexion');
has(/const lastInstall=evts\.find\(r=>r\.categorie==='installation'\)/,'L272 #15 : lameActiveForMachine respecte un démontage postérieur (une seule vérité lame, encart = classeur)');
has(/new Date\(pose\)\.toLocaleDateString\('fr-FR'\)/,'L272 #17 : date de pose en heure LOCALE dans l\'audit (plus de recul d\'un jour la nuit)');
has(/function _laizeSortExcluded\(ref\)\{ return false; \}/,'L272 : exception de tri KX1046/47 PÉRIMÉE retirée (ces réfs re-suivent grosses-laizes-d\'abord)');
has(/CATALOGUE des définitions « chute \/ perte \/ solde »/,'L272 : définitions chute/perte/solde cataloguées (décision ISO documentée pour Esteban)');
console.log('── L272 · fixes de la revue adversariale (3) ──');
has(/function _activeLameIn\(cache,machine\)/,'revue : logique « lame active » factorisée dans _activeLameIn (partagée encart + alertes + classeur)');
has(/const cur=_activeLameIn\(cache,m\); if\(!cur\) return;/,'revue MAJEUR : lameAlerts (bandeau « À CHANGER ») aligné sur #15 → n\'alerte plus pour une lame démontée (fin de la contradiction encart/bandeau)');
has(/rawRows\.push\(\{q:_rq,w:_rw,carton:_rc/,'revue : rawRows garde carton/mandrin/client (plus de bobineau réattribué au mauvais client au restore)');
has(/const _hasChute=Array\.from\(block\.querySelectorAll\('\.rb-chute-row,\.rb-recut-row'\)\)/,'revue : removeRefBlock confirme aussi si le bloc n\'a que des chutes/recuts ou une réf (même classe de perte)');

console.log('── L273 : anti-doublon parcage (#6) + bouton plan rouge/vert (demandes Esteban) ──');
has(/return _same\(_newPlan\) && \(_ficheEmpty \|\| _same\(_newFiche\)\);/,'L273 #6 (+ revue sceptique) : parcage 💾 ne consomme le brouillon repris que si concordance sur le PLAN ET la FICHE — ferme le trou « fiche périmée » (plus de perte silencieuse / double découpe)');
has(/class="btn btn-red" id="planDriftApplyBtn"/,'L273 : bouton « Appliquer le changement de plan » en ROUGE tant que non appliqué');
has(/_b\.className='btn btn-green'; _b\.textContent='✓ Plan appliqué/,'L273 : bouton passe au VERT au clic (retour visuel « plan appliqué »)');

console.log('── L274 : impression = fiche (bug Esteban « le papier doit correspondre à la fiche ») ──');
has(/NOURRI PAR LES BOBINES DE LA FICHE/,'L275 : « Imprimer le plan » = ANCIEN modèle lisible NOURRI par les bobines de la fiche (papier = fiche, plus de plan recalculé renuméroté)');
has(/openPrintWindow\(_buildFichePlanPrintHTML\(\)\)/,'L275 : impression depuis la fiche via _buildFichePlanPrintHTML (ancien modèle, données fiche)');
has(/Le chrono tourne depuis '\+mins\+' min sans nouvelle bobine/,'L275 : rappel « pense à ⏸ » si le chrono tourne 30 min sans bobine coupée (ne fige rien)');

has(/jamais < plus grande découpe → chute ≥ 0/,'L276 : impression depuis fiche = utile de la FICHE, jamais < plus grande découpe → plus de chute négative');

has(/SÉPARER les rouleaux CHUTE recoupés/,'L277 : impression fiche = rouleaux chute (recut) rendus « ♻ rouleau chute — À RECOUPER EN 1ER » (distincts des bobines mères)');
has(/planGroups:pg, recutGroups:rg/,'L277 : recutGroups passés à buildPlanPrintHTML depuis la fiche');

console.log('── L278 : stock/chutes ajoutés en cours de découpe → recalcul du RESTE (garde les coupées) ──');
has(/function _snapFicheChutes\(\)/,'L278 : instantané des chutes stock à la génération/recalcul de la fiche');
has(/bobineaux en stock ajoutés → à imputer sur le reste/,'L278 : dérive « bobineaux stock » signalée MÊME sur réf engagée → bouton « Appliquer » qui garde les coupées + impute sur le reste');
has(/_snapFicheChutes\(\);   \/\/ \[L278\] chutes appliquées/,'L278 : instantané re-basé après recalcul → la bannière se referme (pas de harcèlement)');

has(/if\(!_gcRestored && typeof _snapFicheChutes==='function'\) _snapFicheChutes\(\);/,'L279→L286 : à la reprise, PRIORITÉ à l\'instantané chutes PERSISTÉ (st.genChutes) ; repli L279 (_snapFicheChutes) pour les anciens brouillons');
has(/let _ficheGenPlanSig=null;/,'L296 : signature du plan à la génération — l\'aller-retour Plan↔Fiche ne régénère plus (validation mère + ordre de coupe conservés)');
has(/_planSigOf\(\)===_ficheGenPlanSig\) return;/,'L296→L298 : import auto court-circuité si le plan COMPLET est inchangé — signature stable/normalisée _planSigOf');

console.log('── L298 : audit v2 (11 confirmés → corrigés) ──');
has(/function _planSigOf\(\)/,'L298 : _planSigOf — _stableSig + commandeFiles exclus (une photo ne régénère plus la fiche) + planManual trié déterministe + zéro data:');
has(/const doneKeys=new Set\(\), _riByBase=\{\}, _rollConsByBase=\{\}/,'L298 : compteur RESTE-/OP2- et conso rouleaux PAR CLÉ DE BASE (étiquettes jamais dupliquées entre blocs machine, rouleau coupé jamais ré-offert)');
has(/_riByBase\[_kb\]=ri;/,'L298 : continuité du compteur d\'étiquettes entre blocs frères');
has(/passation désarmée SEULEMENT une fois tous les confirms passés/,'L298 : tap + Annuler sur « Créer/Mettre à jour la fiche » = no-op (passation intacte)');
has(/la reprise CROSS-DAY d'une\n?\s*\/\/ commande partagée laissait « synchro en direct » gelé/,'L298 : gel du push libéré AUSSI en reprise cross-day');
has(/const CHRONO_MIR_LS_KEY='step_chrono_mir'/,'L298 (revue P1) : temps MIROIR sur une clé localStorage DÉDIÉE — le chrono perso ne peut plus l\'écraser');
has(/réinjection TOUJOURS FIGÉE \(wasRunning:false\)/,'L298 (revue P2) : réouverture d\'un partage = temps réinjecté FIGÉ (jamais de tick d\'autosave parasite avant la pose de _viewingSharedId)');
has(/le temps miroir en attente est jeté aussi/,'L298 (revue ×2) : clé MIR purgée à TOUT reset confirmé (manuel compris — un temps jeté ne ressuscite jamais)');
has(/localStorage\.removeItem\(CHRONO_MIR_LS_KEY\); \}catch\(e\)\{\} \}catch\(e2\)\{\}|clé consommée \+ geste conscient/,'L298 (revue) : clé MIR consommée à la réinjection + toast « appuie sur ▶ »');
has(/miroir \+ chrono EN PAUSE/,'L298 : chrono miroir en PAUSE persisté (16h15/⏸ + purge iOS ne perdent plus le temps du récepteur)');
has(/&& !live\.mir && !live\.paused\)/,'L298 : un chrono de vue MIROIR n\'est jamais greffé sur un brouillon perso');
has(/GARDE D'IDENTITÉ sur la préservation L294/,'L298 : le chrono d\'une AUTRE commande ne se déverse plus sur un miroir ouvert');
has(/function refDispCtx\(ref\)/,'L298 : noms courts en collision désambiguïsés par la longueur (KX1045-1 · 100 ml vs · 500 ml)');
has(/le PDF archive dit la MÊME consigne que le papier atelier/,'L298 : migration des vieux textes SPÉCIFICITÉ sur TOUTES les surfaces (écran, popup planning, PDF archive)');
has(/bobine\(s\) d\\'une réf RENOMMÉE ou RETIRÉE du plan/,'L296 : lignes ORPHELINES (réf renommée / bloc retiré) détectées → bannière needClick (fini le silence total)');
has(/Production sous une réf ABSENTE du plan/,'L296 : la production d\'une réf renommée n\'est plus classée « Coupé EN PLUS » (fausse trace ISO) — boîte dédiée « à vérifier »');

console.log('── L280 : brouillons (machine + anti-doublon), graphiques lames, client Mtechnologie (demandes Esteban) ──');
has(/"Mtechnologie": \[\{ref:"GHX173A",largeur:1290,longueur:1000\}\]/,'L280 : client Mtechnologie + réf GHX173A (1290 mm, 1000 ml) créés');
has(/const _post=d\.ownerPost\|\|_fMach\|\|_pMach\|\|'';/,'L280 : brouillon affiche la MACHINE même sans initiales d\'opérateur (plus de « ? » seul)');
has(/drafts=drafts\.filter\(d=>\{ if\(!d\.planDraft\) return true; const n=_numOf\(d\); if\(!n\|\|!\(n in _ficheNewest\)\) return true; return \(Date\.parse\(d\.savedAt\|\|0\)\|\|0\)>_ficheNewest\[n\]\+60000; \}\)/,'L280→L287 : doublon « saisie de plan » masqué SEULEMENT si la fiche est aussi récente (un brouillon plan plus frais — chutes saisies après 16h15 — reste visible)');
has(/barres à coins HAUTS arrondis/,'L280 : graphiques lames modernisés (coins arrondis, dégradé, ombre, liseré)');

has(/id="etiqRefNum_\$\{d\.key\}"/,'L281 : étiquette solde — input DIGITAL « N° de référence » (fini la case au feutre)');
has(/\$\{d\.refNum\?/,'L281 : étiquette imprimée avec le n° de référence rempli (repli case vide si non saisi)');

console.log('── L282 : audit « bouton bloqué » — plus de blocage SILENCIEUX à l\'envoi (demande Esteban) ──');
has(/Envoi en cours — patiente quelques secondes, ne re-tape pas\./,'L282 : envoi fiche déjà en cours → TOAST explicite au lieu d\'un blocage muet (l\'opérateur re-tape et croyait le bouton mort)');

console.log('── L283 : impasse multi-réf (réf couverte par le stock) — fix AFFICHAGE, 0 touche au verrou chrono/trace ISO ──');
has(/function _refHasFicheBob\(r\)/,'L283 : prédicat « cette réf a-t-elle une bobine à couper ? » (clé robuste, identique au sélecteur d\'ancre)');
has(/refKey:\(\(typeof _refIdKey==='function'\)\?_refIdKey\(g\):null\)/,'L283 : fmmRawRefs attache refKey calculée sur le GROUPE RÉEL (nom vide préservé) → plus de faux négatif sur réf sans nom');
has(/if\(!ficheRefValidated\.has\(r\.idx\) && _refHasFicheBob\(r\)\) return r\.idx;/,'L283 : fmmActiveIdx SAUTE les réfs sans bobine (curseur « réf en cours » atterrit sur une vraie réf avec bouton) — repli d\'origine préservé');
has(/if\(_anyBob && !_refHasFicheBob\(r\)\) return;/,'L283 : réf sans bobine → AUCUNE carte (ni fantôme pos0 ni 🔒 trompeur) ; gardé par _anyBob (fiche 100% stock = rendu d\'origine, pas de nouveau cul-de-sac)');
has(/rien à couper \(stock\)/,'L283 : réf couverte par le stock étiquetée « rien à couper (stock) » dans Ordre de coupe (visible mais rien à valider)');
has(/const _anyBob=refs\.some\(_refHasFicheBob\)/,'L283 : garde _anyBob — le traitement « réf sans bobine » ne s\'active que s\'il reste une vraie réf à couper');

console.log('── L284 : impression du plan = fiche live (récap « coupé en plus » + rebut + total commande d\'origine) ──');
has(/function _fichePrintSurplus\(\)/,'L284 : surplus « coupé en plus » calculé pour le papier (même sémantique que recalcEcartsFromFiche)');
has(/Coupé EN PLUS \(hors plan/,'L284 : le surplus (sur-coupe) est IMPRIMÉ dans le récap, plus seulement dans un toast éphémère');
has(/Rebut déjà coupé — NE PAS recouper/,'L284 : bobine 🗑 déchet sortie de la liste « à couper » et tracée à part (anti double-découpe)');
has(/Total commande d'origine/,'L284 : total multi-réf relibellé « commande d\'origine » (ne contredit plus le coupé réel par réf)');

console.log('── L285 : « ça change automatiquement » — détection auto de dérive/sur-coupe (bannière NON destructive) ──');
has(/function _scheduleDriftCheck\(\)/,'L285 : re-vérification auto de la dérive (débouncée) — la bannière apparaît seule, sans lancer le recalcul destructif');
has(/coupé\(s\) en plus → recalculer pour l/,'L285 : sur-coupe encore présente dans le reste → signalée (auto-refermante après recalcul)');
has(/_scheduleDriftCheck\(\);   \/\/ \[L285/,'L285 : la coche d\'une bobine déclenche la re-vérification auto (dérive/sur-coupe)');

console.log('── L286 : bug lima — synchro plan→fiche fiable (snapshot persisté + détecteurs sans état + auto-application) ──');
has(/genChutes:\(_ficheGenChutes\?JSON\.stringify\(_ficheGenChutes\):null\)/,'L286 : instantané chutes-stock PERSISTÉ dans l\'état (brouillons/autosave/partage) — il n\'existait qu\'en RAM → dérive stock indétectable après rechargement (cas lima)');
has(/DÉTECTEUR D'ÉQUILIBRE DU RESTE/,'L286 : détecteur d\'équilibre du reste (sans instantané) — manque/en-trop par largeur vs commande−stock−figé, survit au rechargement');
has(/rouleau\(x\) chute modifié\(s\) dans le plan/,'L286 : rouleaux chute comparés par MULTISET de largeurs (un rouleau REMPLACÉ 1-contre-1 était invisible) — rouleaux figés décomptés des deux côtés');
has(/appliqué AUTOMATIQUEMENT à la fiche/,'L286 : dérives SÛRES (stock/rouleaux) appliquées AUTOMATIQUEMENT à l\'arrivée sur la fiche (choix Esteban 30/07) — coupées conservées, toast de traçabilité');
has(/opts\.autoApply && !needClick && !shared && !_pm/,'L286 (revue P4) : JAMAIS d\'auto-application en plan MANUEL — le recalcul (moteur auto) écraserait le plan écrit main');
has(/const _eqAgg=\{\}, _cuAgg=\{\}, _recAgg=\{\}, _kSeen=new Set\(\)/,'L286 (revue P2) : agrégats PAR CLÉ (commande−stock, chutesUsed, rouleaux) — même réf scindée sur 2 machines ne fabrique plus de fausse dérive');
has(/const _firstOfKey=!_kSeen\.has\(key\); _kSeen\.add\(key\)/,'L286 (revue P2) : chaque check par-clé (stock/rouleaux/sur-coupe/équilibre) tourne UNE fois par clé d\'identité');

console.log('── L287 : enquête « brouillon qui ne s\'enregistre pas » (perte bobineaux stock / chutes) ──');
has(/\[L287\] idem flush plan/,'L287 : brouillon PLAN flushé à pagehide/visibilitychange (avant : jamais — perte sèche des saisies < 10 s à la fermeture)');
has(/planAutosaveTick\(\);                  \/\/ \[L287/,'L287 : capture IMMÉDIATE du brouillon plan à la 1re frappe (avant : 1er write à +10 s seulement)');
has(/Sauvegarde du brouillon REFUSÉE/,'L287 : écriture Firestore rejetée → signature invalidée + retrait du cache optimiste + toast (le tick ré-essaie au lieu de croire la saisie sauvée)');
has(/const chutes=\[\], rawChutes=\[\]/,'L287 : filet TEXTE BRUT pour les bobineaux stock mi-saisis (miroir rawRows L271) — plus jamais jetés en silence de la sauvegarde');
has(/const recuts=\[\], rawRecuts=\[\]/,'L287 : idem filet pour les rouleaux à recouper');
has(/rawChutes:g\.rawChutes\|\|\[\], rawRecuts:g\.rawRecuts\|\|\[\]/,'L287 : rawChutes/rawRecuts persistés dans serializeRefGroups');
has(/Une sauvegarde AUTO plus récente existe/,'L287 : reprise d\'un brouillon plus VIEUX que la dernière sauvegarde AUTO → confirmation explicite (sinon les ticks écrasaient la seule copie fraîche)');

console.log('── L288 : les 6 tâches du 29/07 (décisions Esteban) ──');
has(/body\.atelier \.nc-check\.ras,body\.atelier \.test2-sub,body\.atelier \.test2-nc\{font-size:17px;min-height:48px;padding:8px 14px\}/,'L288 T1 : test 2ᵉ compacté à 48px (plancher gants), puces Défaut inchangées à 60px');
has(/bandeau violet récap supprimé/,'L288 T2 (retiré L391 — décision Esteban) : bandeau violet supprimé, surlignage RESTE- conservé');
has(/bande orange « ✂ Chutes en stock utilisées » SUPPRIMÉE/,'L288 T3→L292 : le stock vit dans la colonne ✂ EN STOCK du tableau par laize (bande orange supprimée — feuille annotée Esteban 30/07)');

console.log('── L289 : PDF tableau par laize + Total supprimé + édition manuelle avec rouleaux (choix Esteban 30/07) ──');
has(/TABLEAU PAR LAIZE.*variante A allégée|maquette A allégée.*TABLEAU PAR LAIZE/,'L289 : tableau par laize (Laize | Commandé | ✂ En stock | À couper) — remplace la ligne 🧾 « dont » L288');
has(/une laize 100 % stock reste une LIGNE du tableau/,'L289→L292 : laize 100 % stock = ligne du tableau à 0 grisé (choix Esteban 30/07, plus de bande orange)');
has(/ligne « Total commande d'origine » multi-réf SUPPRIMÉE/,'L289 : Total global multi-réf supprimé (contradictions impossibles)');
absent(/🧾 Total commande d'origine/,'L289 : l\'ancien Total multi-réf a bien disparu du template');
has(/est SUPPRIMÉE \(redondante/,'L289 : bande verte « N rouleaux recoupés en 1er » retirée (info portée par les lignes ♻ du tableau) — seul « non utilisés » reste');
has(/le blocage « rouleaux saisis → pas d'édition manuelle » SAUTE/,'L289 : édition manuelle DÉBLOQUÉE avec rouleaux ♻ (rouleaux figés auto + mères éditables)');
absent(/Édition manuelle indisponible quand des rouleaux/,'L289 : l\'ancien message de blocage a disparu');
has(/rouleaux ♻ AUSSI en plan manuel : gérés en AUTO \(calcul moteur,/,'L289 : la fiche générée depuis un plan manuel inclut les rouleaux ♻ (recoupés en 1er)');
has(/leurs pièces \(calcul moteur, déterministe/,'L289 : planManualCoherence crédite les pièces des rouleaux (pas de faux « manque »)');
has(/géré automatiquement \(recoupé en 1er\) — modifiable via ♻ dans la saisie/,'L289 : rouleaux visibles en LECTURE SEULE dans l\'éditeur manuel');
has(/le PDF manuel les taisait/,'L289 : le PDF d\'un plan manuel imprime les rouleaux ♻ + stock (appariement auto)');
has(/imprimer ses lignes vertes \(le tableau par laize compte leurs pièces/,'L289 (revue) : printSavedPlan apparie AUSSI les rouleaux du plan manuel sauvegardé (toutes les surfaces)');
has(/const recMat=\(c\.recutGroups\|\|\[\]\)\.reduce/,'L289 (revue) : stats archive manuel+rouleaux = matière rouleau incluse (invariant L83#40, % perte juste)');

console.log('── L290 : multi-clients lisibles + fixes audit 30/07 (NC test2, dims plan, partage validation mère) ──');
has(/const CLI_COLORS=\{A:'#eab308',B:'#f472b6',C:'#22d3ee',D:'#c4b5fd'/,'L290 : palette clients RE-SÉPARÉE (jaune/rose/cyan/violet — fini orange≈jaune, lime≈jaune)');
has(/function cliPrintChip\(id\)/,'L290 : pastille client IMPRIMABLE distincte en NIVEAUX DE GRIS (A blanc bordé, B noir, C gris, D double anneau)');
has(/function cliAllocPrintHtml\(list\)/,'L290 : allocations PDF en pièces colorées + pastilles N&B (au lieu du texte violet 11px)');
has(/flTest2nc_'\+id\)\?\.checked\) return true;/,'L290 (audit #NC) : ⚠ NC test 2ᵉ FIGE la ligne (isLineFrozen) — le recalcul ne détruit plus la trace qualité');
has(/flTest2nc_'\+id\)\?\.checked\) return false;/,'L290 (audit #NC) : ⚠ NC test 2ᵉ = fiche « touchée » (isFicheUntouched) — l\'import auto ne l\'écrase plus');
has(/DIMENSIONS modifiées dans le plan/,'L290 (audit #1) : dérive de DIMENSION plan→fiche détectée (mère/laize/lame via clé divergée + repli nom) — bannière needClick, auto-refermante');
has(/valider\/modifier la bobine mère pendant un PARTAGE actif produisait un FAUX|Commande PARTAGÉE — arrête le partage avant de valider\/modifier la bobine mère/,'L290 (audit CRITIQUE) : validation mère bloquée pendant un partage actif (toast explicite, fini le faux succès)');
has(/rollRest\+=cnt\*Math\.max\(0,\(Number\(g\.rollW\)\|\|0\)-u\)/,'L290 (contre-revue) : chip % de l\'éditeur manuel intègre la matière rouleau — écran == archive');
has(/const _ln0=lines\.find\(d=>!d\.recut\)\|\|lines\[0\];/,'L290 (revue C3) : détecteur dims comparé à une ligne MÈRE, jamais un rouleau (fini « 190 → 946 » absurde)');
has(/return \(ms&&ms\.size>1\)\?\(l\.refIdKey\+'¦⚙'\+\(l\.machine\|\|''\)\):l\.refIdKey;/,'L290→L291 : papier fiche par CLÉ D\'IDENTITÉ, + machine SEULEMENT si le plan a 2 blocs machine (revue P1 : le changement de machine mono-bloc ne double plus le tableau laize)');
has(/_autosaveLastSig=_cur\?JSON\.stringify\(\{plan:_st\.plan,fiche:_st\.fiche,lines:_st\.lines\}\):'';/,'L291 (revue P2) : doLoad ne pose la signature fiche QUE si le doc d\'autosave existe (invariant B08 préservé — autosave jamais morte après envoi+chargement)');

console.log('── L291 : suite audit 30/07 (PDF-depuis-fiche + surplus + doLoad) ──');
has(/\|'\+\(l\.phaseEnd\?'P':''\)/,'L291 : FIN DE PHASE conservée sur le PDF-depuis-fiche (marquage « Solde à CONSERVER » plus jamais fusionné)');
has(/const cmd=\{\}, _disp=\{\};/,'L291 : récap « Coupé EN PLUS » clé par nom NORMALISÉ (une casse/espace ≠ ne fabrique plus une fausse sur-coupe totale)');
has(/signatures autosave posées sur l'état FINAL chargé \(swap compris\)/,'L291 : doLoad pose les signatures d autosave sur l état chargé (déplacées APRÈS le swap machine en L376) — la sauvegarde auto de la commande précédente survit');
has(/\{ref:"TacFlex® DH1006-2",largeur:2200,longueur:1000\}/,'L290→L295 : réf DH1006-2 transparent 1000 ml (« DH100-2 » = faute de frappe confirmée par Esteban) — MOREY + FEILO SYLVANIA + EPSOTECH');
absent(/DH100-2",largeur/,'L295 : plus aucune réf « DH100-2 » (faute de frappe corrigée)');

console.log('── L295 : colonne manuscrite + bi-machine option A (choix Esteban 30/07) ──');
has(/coupeCol:true,/,'L295 : PDF fiche — colonne « ✍ Bobines coupées final » (cases vides à remplir au stylo)');
has(/const refKey=c=>_refIdKey\(c\)\+'¦⚙'\+\(\(c&&c\.machine\)\|\|''\)/,'L295 : recalcul par clé COMPOSITE base+machine (option A) — chaque bloc machine garde sa part, ses rouleaux, sa machine');
has(/JAMAIS d'orpheline, sinon reliquat = commande complète/,'L295 : lignes re-taguées rattachées au 1er bloc de la clé de base (anti-surproduction)');
has(/clé de BASE \(jamais la composite interne\)/,'L295 : l.refIdKey resynchronisé en clé de BASE (la composite ne fuit jamais dans les données)');
has(/\{ref:"TacFlex® DH1006-2 micro perf",largeur:2200,longueur:500\}/,'L290 : réf DH1006-2 micro perf 500 ml créée (MOREY + FEILO SYLVANIA + EPSOTECH)');
absent(/"MOREY": \[\{ref:"41116850 - TacFlex® DH1006-2"/,'L290 : l\'ancienne réf unique MOREY a bien été remplacée');
has(/function _syncRefDonePills\(\)/,'L288 T4 : réf finie → carte repliée en pastille « ✓ Réf N terminée (déplier) », recorriger accessible, matching par refIdKey');
has(/Valide d\\'abord la bobine mère de la réf en cours/,'L288 T5 : chrono multi-réf bloqué → toast qui nomme le VRAI geste + scroll/pulse du bloc actif (fini le motif « dimension modifiée » faux)');
has(/Il reste '\+\(_tot-_dn\)\+' bobine\(s\) à marquer/,'L288 T5 : bouton d\'envoi jamais disabled — tap avant la fin = toast « reste N » + scroll (zéro tap mort)');
absent(/function _guideGo\(kind,id\)/,'L288 T6→L292 : guide permanent RETIRÉ en entier (demande Esteban 30/07 « ce texte est inutile ») — les toasts zéro-tap-mort T5 restent');
has(/GUIDE DE PROCHAINE ACTION \(T6\/L288\) RETIRÉ EN ENTIER/,'L292 : trace du retrait du guide documentée dans updateCoupeeStatus');
has(/#fmmHint ENTIÈREMENT muet/,'L292 : #fmmHint totalement supprimé (vert « Chrono autorisé » ET orange « Valide la bobine mère » — demande Esteban ×2) ; seuls bouton bleu + toast T5 informent');
absent(/hintEl\.innerHTML='⚠ Valide la bobine mère/,'L292 : plus aucun texte permanent « Valide la bobine mère » à l\'écran');
has(/case VIERGE : le pré-remplissage avec la réf commande/,'L292 : étiquette solde — case N° de référence VIERGE (le pré-rempli imprimait la réf commande à la place du vrai n°)');
console.log('── L293 : feuille annotée ×2 (violet) — noms courts partout, PDF minimal ──');
has(/function refDisp\(r\)/,'L293 : refDisp — affichage COURT des réfs (« 41312799 - TacFlex® KX1045-1 » → « KX1045-1 »), données/clés intactes');
has(/noms COURTS \(refDisp\) dédupliqués/,'L293 : en-tête PDF — noms courts dédupliqués (plus aucun n° de commande)');
has(/titre SUPPRIMÉ \(surligné violet/,'L293 : titre « Plan de découpe — STEP International » SUPPRIMÉ du PDF');
absent(/STEP International — Plan<\/div>/,'L293 : l\'ancien titre discret L292 a aussi disparu');
has(/« N références » supprimé \(violet\)/,'L293 : « · N références · » retiré de la ligne Machine/Date');
has(/colonne « À couper »\n {6}\/\/ et ligne « Total » SUPPRIMÉES|et ligne « Total » SUPPRIMÉES/,'L293 : tableau laize = Laize | Commandé | ✂ En stock (colonne À couper + ligne Total supprimées)');
has(/replace\(\/\\s\*\\\(\[\^\)\]\*\\\)\\s\*\$\/,''\)\)\}<\/b>/,'L293 : parenthèse du cerclage retirée du papier (« Standard » au lieu de « Standard (≤39mm + tous KX) »)');
has(/label:\(multi&&c\.ref\?refDisp\(c\.ref\)\+' · ':''\)/,'L293 : étiquettes BOB de la fiche en nom court');
has(/frs-name">🎞 \$\{esc\(refDisp\(ref\)\)\}/,'L293 : séparateurs de réf de la fiche en nom court (dataset complet préservé pour le matching)');
has(/pas de doublon : n° déjà présent dans le nom client/,'L292 : N° Cmd supprimé du PDF quand le numéro figure déjà dans le nom client');
has(/Cerclage : automatique \(film KX, toutes largeurs\)/,'L292 : SPÉCIFICITÉ LIMA réécrite courte (papier vert 1×, cerclage 1×)');
has(/la ligne « Film KX détecté → cerclage automatique » ne/,'L292 : plus d\'ajout auto « Film KX » quand les règles client le disent déjà (fini le triple cerclage)');

console.log('── L294 : audit 30/07 — partage/chrono/réinit ──');
has(/function _stableSig\(o\)/,'L294 : signature STABLE (clés triées) — la comparaison écran↔doc Firestore devient possible');
has(/delete _p\.planManual; _dsig=_stableSig/,'L294 : _dsig symétrique de _shareSig (planManual retiré des DEUX côtés) — le gel du push peut enfin se libérer par comparaison');
has(/ÉMETTEUR d'un partage reconstruit par la reprise AUTO : libérer le gel/,'L294 : reprise AUTO même-jour de l\'émetteur → gel du push libéré (fini « synchro en direct » menteur à vie)');
has(/PRÉSERVER LE CHRONO DU RÉCEPTEUR/,'L294 : rouvrir un partage après reload ne remet plus le chrono du récepteur à zéro (temps ISO préservé)');
has(/NE PURGER les brouillons auto QUE s'ils reflètent l'écran/,'L294 : ↺ Réinitialiser ne détruit plus la commande EN PAUSE du poste (copie locale de partage / autre n° de commande → brouillons auto conservés)');

console.log('── L295 (revue) + L297 : réventilation inter-blocs, migration textes, papier gamifié ──');
has(/RÉVENTILATION inter-blocs d'une même clé de BASE/,'L295 (revue B1) : excédent committed d\'un bloc → couvre le reliquat des blocs frères AVANT surplus (anti-surproduction bi-machine, bannière équilibre refermable)');
has(/const _OLD_NOTES=\[/,'L297 : migration des anciens textes SPÉCIFICITÉ stockés (correspondance EXACTE — un texte édité main n\'est jamais dénaturé)');
has(/function _chkBoxes\(n\)/,'L297 : cases ☐ par bobine sur le papier fiche (gamification demande Esteban) + compteur manuscrit Coupées __/N');
has(/tr:nth-child\(even\):not\(\[style\*="background"\]\) td\{background:#fafbfc\}/,'L297 (revue) : zébrage léger SANS écraser les fonds spéciaux inline (ligne ♻ turquoise, solde jaune)');
has(/genPlanSig:\(_ficheGenPlanSig\|\|null\)/,'L297 (revue) : signature du plan PERSISTÉE dans l\'état (comme genChutes) — jamais re-dérivée à la restauration');
has(/_ficheGenPlanSig=\(typeof st\.genPlanSig==='string'&&st\.genPlanSig\)\?st\.genPlanSig:null;/,'L297 (revue) : restauration = sig persistée ou null (legacy → régénération pré-L296, sûre)');

console.log('── L299 : demandes Esteban 31/07 ──');
has(/SYNCHRO MACHINE fiche → plan/,'L299 : machine fiche → select du bloc plan synchronisé (mono)');
has(/AUTO-APPLIQUÉ à l'arrivée sur la fiche \(plus de needClick — choix Esteban/,'L299 : machine plan → fiche AUTO-appliquée (reste re-machiné, coupées conservées — remplace la bannière L286)');
has(/return Ls\.length===1\?` · <b>\$\{esc\(Ls\[0\]\)\} ml<\/b>`:'';/,'L299 : les ml affichés à côté de la référence en haut du PDF (mono ou longueur commune)');

console.log('── L300 : retours Esteban 31/07 ──');
has(/bobine\$\{_nbMeres>1\?'s':''\} mère/,'L300 : « N bobines mères à monter » de retour sous chaque section (les 2 PDF)');
has(/🎞 \$\{esc\(refDisp\(c\.ref\)\|\|\('Référence '/,'L300 : titre de section en refDisp simple (le ml suit déjà — plus de « 1000 ml » en double)');

console.log('── L301 : audit boutons (mise en avant selon l usage réel) ──');
has(/btn btn-sm btn-ghost"[^>]*onclick="recalcEcartsFromFiche\(\)"/,'L301 : ♻ Recalculer DÉ-AMBRÉ (ghost) — l ambre redevient unique au prochain geste (accord Esteban)');
has(/class="btn btn-green" id="chronoStartBtn"/,'L301 : ▶ Démarrer promu btn-sm → bouton plein (cible gant)');
has(/animation:flashCut 1\.2s ease-out/,'L301 : flash ✂ Coupée épaissi+allongé (seul retour sans-regarder sur iPad)');
has(/\.fiche-line\.t2-todo:not\(\.coupee\) \.test2-sub:not\(\.sel\)\{color:var\(--text\)/,'L301 : puce test 2ᵉ à cocher FLÉCHÉE (liseré+contraste, non-ambre, hauteur inchangée)');

console.log('── L302 : filet anti-régression avant redesign (couplages DOM bruyants) ──');
has(/function _domGuardWarn\(key,msg\)/,'L302 : garde DOM bruyante (console + toast throttlé) — anomalie interface visible au lieu d échouer en silence');
has(/aucun \.ref-block trouvé alors que #refBlocks contient des éléments/,'L302 : getRefGroups alerte si .ref-block renommé (plan multi-réf perdu en silence sinon)');
has(/_checkPersistIds\(\);   \/\/ \[L302\]/,'L302 : serializeFicheState vérifie les champs de persistance critiques (id renommé → brouillon amputé)');
has(/affichage du chrono est cassé/,'L302 : chronoTick garde null sur #chronoDisplay (crash 1×/s évité)');

console.log('── L303 : message offline honnête selon _persistenceOK ──');
has(/mode hors-ligne indisponible sur ce poste/,'L303 : boundedWrite dit la vérité quand la file offline est indisponible (rechargement = perte) au lieu de « NE RE-SAISIS PAS » mensonger');
has(/_persistenceOK\n    \?/,'L303 : le message est conditionné au drapeau _persistenceOK (enfin LU)');

console.log('── L304 : REDESIGN LOT 1 — boutons arcade (CSS seul) ──');
has(/REDESIGN LOT 1 .*LANGAGE « BOUTON ARCADE »/,'L304 : bloc CSS arcade présent (chant + enfoncement, mode A)');
has(/@keyframes arcadePulse/,'L304 : halo pulsé ambre AVEC chant intégré aux keyframes (sinon écrasé)');
has(/\.fiche-line\.coupee \[id\^="coupeeBtn_"\]\{box-shadow:none/,'L304 : bouton FAIT à plat (coupée = déjà enfoncé)');
(function(){ const n=(src.match(/cursor:not-allowed/g)||[]).length; const okk=n===0;
  console.log((okk?'✅ ':'❌ ')+'L304→L321 : cursor:not-allowed = ZÉRO ('+n+') — les 2 pré-existants soldés par le LOT 19'); if(!okk)fail++; })();

console.log('── L305 : REDESIGN LOT 21 — nettoyage du texte en surplus (§2.20) ──');
absent(/Marque toutes les bobines comme Coupées/,'L305 : phrase permanente sous Confirmer retirée (garde au tap suffit)');
absent(/Mode édition manuelle — modifie les bobines/,'L305 : pavé explicatif du mode manuel réduit à une donnée');
absent(/Tu as modifié une dimension \(mère \/ bords \/ lame \/ chute\) — clique/,'L305 : message Changement plan raccourci (détail = toast de garde)');
has(/id="sendPlanHint"><\/div>/,'L305 : le nœud sendPlanHint RESTE (le JS le pilote) — seul le texte est parti');

console.log('── L306 : REDESIGN LOT 3 — chrono auto + bandeau chutes (§2.3, accord Q1) ──');
has(/DÉMARRAGE AUTO : le 1er ✂ lance le chrono/,'L306 : le ✂ appelle chronoStart() au lieu de refuser (gardes intactes)');
has(/refus de chronoStart → coupe NON enregistrée/,'L306 : refus de chronoStart → la coupe N EST PAS enregistrée (ancre EXACTE du return, plus de branche morte)');
has(/step_chutes_rappel_v2/,'L306 : mémoire du rappel chutes = liste bornée + clé datée sans n° (fix audit)');
has(/le bandeau chutes d'une VIEILLE commande ne survit pas au reset/,'L306 : resetAll masque le bandeau chutes (fix audit : bandeau fantôme inter-commandes)');
has(/arrêt automatique est suspendu pour aujourd/,'L306 : heures supp rendues VISIBLES (toast) — le cas devenait silencieux avec l auto-start');
absent(/Avez-vous des chutes ou des bobineaux SUR LA PALETTE/,'L306 : confirm() bloquant du 1er départ SUPPRIMÉ');
has(/id="chutesRappelBanner"/,'L306 : bandeau chutes NON bloquant présent (orange, 1×/commande)');
has(/maybeShowChutesRappel/,'L306 : rappel mémorisé par commande (localStorage step_chutes_rappel)');
absent(/content:" · ⏱ arrêté"/,'L306 : suffixe « ⏱ arrêté » retiré (faux avec l auto-start)');
has(/Reprise de commande : le plan n/,'L306 : le confirm() de REPRISE après crash (L89) est CONSERVÉ (garde de sécurité)');

console.log('── L307 : REDESIGN LOT 2 — tap unique ✂ Coupée — Test OK (§2.2, décision 03/08) ──');
has(/function coupeeTapOne\(id\)/,'L307 : coupeeTapOne existe (coche Dévidage/Droit selon machine LIGNE puis toggleCoupee)');
has(/rollback des coches automatiques/,'L307 : refus d une garde → DÉ-coche les cases auto (aucun test validé sans coupe)');
has(/coupeeTapOne\('\$\{id\}'\)/,'L307 : le bouton ✂ passe par coupeeTapOne (toggleCoupee reste le chemin gardé)');
has(/✂ Coupée — Test OK/,'L307 : libellé repos « ✂ Coupée — Test OK »');
has(/id="flDevi_\$\{id\}" aria-label/,'L307 : inputs test 2ᵉ CONSERVÉS avec aria-label (déplacés dans ⚠ Défaut, jamais supprimés)');
has(/\(!!_t2nc\|\|ncMode\)&&!test2Resolved\(id\)/,'L307 : indice t2-todo — chemin sain auto-résolu ; étendu aux bobines NC en L376');
has(/ncEl&&ncEl\.checked/,'L307 : NC cochée → AUCUNE coche auto (chemin défaut strictement inchangé)');

console.log('── L307b : fixes audit lot 2 + photos pied (décision Esteban 11/08) ──');
has(/'✂ Coupée — Test OK';/,'L307b : les 4 writers de repos harmonisés (dé-marquage + partage inclus)');
(function(){ const n=(src.match(/'✂ Coupée — Test OK'/g)||[]).length; const okk=n>=4;
  console.log((okk?'✅ ':'❌ ')+'L307b : libellé repos présent partout ('+n+'/≥4 writers JS (le libellé template est en HTML non quoté))'); if(!okk)fail++; })();
has(/on l'OUVRE au refus \(symétrie avec la garde action NC\)/,'L307b : refus test 2ᵉ → le volet ⚠ Défaut s OUVRE (les puces y vivent désormais)');
has(/!ncMotif/,'L307b : NC dimensionnelle cochée → AUCUNE attestation auto (ISO)');
has(/t2auto/,'L307b : attestation posée par le tap PURGÉE au dé-marquage (pas de test fantôme)');
has(/id="etiqPhotoZone"/,'L307b : bloc PHOTOS ÉTIQ. rétabli en pied (alarme _etiqCount à nouveau alimentable)');
has(/photoZone_\$\{id\}" style="margin-left:auto;display:none"/,'L307b : case 📷 par bobine masquée (nœud + infra conservés)');

console.log('── L308 : REDESIGN LOT 14 — un seul aplat ambre (§2.17-A) ──');
has(/fl-current/,'L308 : classe fl-current (carte en cours) posée par updateNextAction, retirée à chaque cycle');
has(/\.fiche-line\.fl-current\{border-color:var\(--action\)/,'L308 : SEUL aplat ambre = la carte en cours');
has(/\.fiche-line\.coupee:not\(\.flash-cut\)\{opacity:\.55\}/,'L308 : cartes coupées estompées (le flash de confirmation reste visible)');
has(/#ficheLines:has\(\.fl-current\):not\(\.chrono-off\) \.fiche-line:not\(\.fl-current\) button\[onclick="recalcEcartsFromFiche\(\)"\]\{display:none\}/,'L308 : ♻ écarts visible seulement sur la carte en cours (§2.13-B) — sauf chrono arrêté (L371 : A15 pose fl-current avant le chrono)');

console.log('── L309 : REDESIGN LOT 5 — HUD segmenté (1 cran/bobine, plafond 40) ──');
has(/fp-seg-wrap/,'L309 : barre segmentée présente dans le HUD coupeeBanner');
has(/total<=40/,'L309 : plafond 40 bobines → barre continue historique (perfs iPad, règle terrain 5)');
has(/fp-seg nc/,'L309 : cran NC hachuré (jamais couleur seule)');
has(/Chip SÉRIE → LOT 12/,'L309 : chip SÉRIE volontairement reportée au LOT 12 (G1)');

console.log('── L310 : REDESIGN LOT 23 — ordre de coupe lisible (§2.21) ──');
has(/foc-ml/,'L310 : pastille ml (discriminant) jamais tronquée — nowrap + flex:none');
has(/refDisp\(String\(r\.ref\)\)/,'L310 : nom produit via refDisp (sans code numérique) dans l ordre de coupe');
has(/\.fmm-order-name\.foc-name\{white-space:normal/,'L310 : le nom produit passe à la ligne au lieu de tronquer');
has(/Chip machine CONSERVÉE \(acquis L258/,'L310 : chip machine par réf conservée (acquis Esteban L258, prime sur §2.13-B)');

console.log('── L311 : REDESIGN LOT 9 — fiche paysage rail+centre (§2.7) ──');
has(/id="ficheRail"/,'L311 : wrapper rail présent (chrono+machines+partage+solde)');
has(/id="ficheMain"/,'L311 : wrapper centre présent (bandeau+entêtes+chg+ficheRight+cliRecap)');
has(/#ficheRail,#ficheMain\{display:contents\}/,'L311 : portrait = wrappers transparents + ordre historique par `order`');
has(/#chutesRappelBanner\{order:1\}/,'L311 : ordre portrait restauré explicitement (12 enfants)');
has(/grid-template-columns:320px minmax\(0,1fr\)/,'L311→L333 : paysage ≥1100px = rail 320px sticky + centre (§2.18/§2.21 — 336→320 au lot fidélité)');
has(/#ficheLines\{display:grid;grid-template-columns:1fr;/,'L311\u2192L334 : bobines en COLONNE UNIQUE pleine largeur en paysage (maquette 17 supers\u00e8de la grille 2 col \u00a72.7)');
has(/\.fiche-line\.fl-current,#ficheLines \.fmm-block/,'L311 : carte en cours + blocs réf traversent (grid-column 1/-1)');
has(/id="ficheChronoSec"/,'L311 : 3 ids AJOUTÉS (jamais renommés) — ficheChronoSec/ficheHeadSec/ficheChgSec');
has(/<div id="actionBar">/,'L311 : wrapper #actionBar PRÉSENT (barre du pouce ≤1099px — perdu une fois par le réassemblage, plus jamais)');
absent(/minmax\(400px,480px\)/,'L311 : ancien layout bureau L236 supprimé (il écrasait la grille paysage du lot 9)');

console.log('── L312 : REDESIGN LOT 17 — barre d action sticky paysage (§2.18) ──');
has(/#sendPlanWrap\{position:sticky;bottom:0/,'L312 : Confirmer/Manque matière ancrés en bas du centre (sticky, PAS un overlay)');
has(/border-top:3px solid var\(--action\)/,'L312 : filet ambre 3px + ombre + dégradé « la liste continue derrière »');

console.log('── L313 : REDESIGN LOT 10 — glisser-déposer de l ordre de coupe (§2.8) ──');
has(/function fmmDragStart/,'L313 : drag Pointer Events présent (prise 150ms, poignée seule)');
has(/function fmmMoveRefTo/,'L313 : dépose via fmmMoveRefTo — mêmes gardes que fmmMoveRef');
has(/_fmmOrderGuardsOk/,'L313 : gardes partagées (partage actif · production engagée) AVANT toute prise');
has(/Ordre de coupe mis à jour/,'L313 : bandeau ↩ Annuler après dépose (8s)');
has(/\.fmm-drag-handle\{[^}]*touch-action:none/,'L313 : touch-action:none sur la POIGNÉE seule (scroll naturel ailleurs)');
has(/\.fmm-order-btns \.btn\{min-width:52px;min-height:56px\}/,'L313 : ▲▼ secours agrandis 52×56');

console.log('── L314 : REDESIGN LOT 4 — Plan express (§2.4) ──');
has(/bumpDateLiv\(7\)/,'L314 : chips +7j/+14j à côté de la date (1 tap, calendrier natif en secours)');
has(/function _maybeAutoRow/,'L314 : ligne laize suivante auto quand la dernière du bloc est remplie');
has(/step_op_day/,'L314 : initiales mémorisées pour la journée (selectIni) + pré-sélection applyOpOfDay');
has(/jamais par-dessus une saisie/,'L314 : pré-remplissages JAMAIS par-dessus une saisie opérateur');

console.log('── L315 : REDESIGN LOT 15 — écran Plan simplifié (§2.14/§2.17-B) ──');
has(/id="planLeft"/,'L315 : wrapper saisie gauche présent');
has(/id="planRight"/,'L315 : colonne PLAN CALCULÉ droite présente (sticky 376px paysage)');
has(/id="btnStartCut"/,'L315 : bouton ✂ Commencer à couper (SEUL ambre de l écran Plan)');
has(/function startCutFromPlan/,'L315 : passage Plan→Fiche EXISTANT rendu explicite + refus poli plan vide');
has(/const PERTE_SEUIL_ORANGE=2\.5;/,'L315 : seuil perte orange 2,5% en CONSTANTE (validé Esteban 03/08)');
has(/pctCls=p=>p<PERTE_SEUIL_ORANGE/,'L315 : le seuil est branché sur la couleur partagée');
has(/couleur:.*var\(--blue\)|\.useful-display\{font-size:16px;color:var\(--blue\)/,'L315 : LARGEUR UTILE = repère bleu (§2.17-B)');
has(/#planResumeRow\{order:1\}/,'L315 : ordre portrait du Plan restauré explicitement');

console.log('── L316 : REDESIGN LOT 24 — optimisations parcours (§2.22, partiel assumé) ──');
has(/function doRedo/,'L316 : ⟳ REFAIRE réutilise doLoad + ses gardes, vide n° cmd + date livraison');
has(/⟳ Refaire \(nouveau n°\)/,'L316 : bouton dans la modale de chargement existante (pas un 4ᵉ chemin)');
has(/le bouton DIT l'état : client · n° cmd/,'L316 : ▶ Reprendre explicite (client · cmd · n\/N coupées)');

console.log('── L317 : REDESIGN LOT 16 — Données tactile (§2.16-B, structure d origine CONSERVÉE) ──');
has(/id="tabSaves"/,'L317 : les onglets d origine sont TOUS là (aucune refonte en tuiles — §2.16-B annule §2.15)');
has(/\.tab-btn\{min-height:52px\}/,'L317 : onglets 52px tactile');
has(/#page2 \.btn-sm,#page2 select\{min-height:50px\}/,'L317 : vues + filtres 50px');
has(/function renderDataSummary/,'L317 : ligne de résumé — données mémoire uniquement, valeur absente = —, AUCUNE requête');
has(/\.tab-btn\.active\{color:var\(--action\)/,'L317 : onglet actif AMBRE (l aplat ambre de l écran Données, maquette 19)');

console.log('── L318 : REDESIGN LOT 8 — confirm() de sécurité GELÉS (zéro migration, doctrine) ──');
has(/CONCLUSION DU RECENSEMENT \(12\/08\) : ZÉRO migration/,'L318 : recensement documenté dans le code (§6.7 : jamais supprimer un confirm de sécurité)');
(function(){ const n=(src.match(/!confirm\(/g)||[]).length; const okk=n>=16;
  console.log((okk?'✅ ':'❌ ')+'L318 : les confirm() de sécurité sont TOUS là ('+n+'/≥16) — toute disparition silencieuse échoue ici'); if(!okk)fail++; })();

console.log('── L319 : REDESIGN LOT 6 — volet de clôture-victoire (§2.5, maquette 2d) ──');
has(/id="victoryOverlay"/,'L319 : volet de clôture présent (remplace le confirm récap — SEUL dialogue non critique)');
has(/const _armed=_victoryArmed; _victoryArmed=false;/,'L319 : drapeau armé CONSOMMÉ EN TÊTE (fix audit : plus d armé fantôme) — les gardes se re-déroulent au tap réel');
has(/AVEZ-VOUS PRIS LA PHOTO DES ÉTIQUETTES \?<div/,'L319 : alarme étiquettes L243 reprise en BANDEAU ROUGE dans le volet');
has(/CHRONO À ZÉRO — aucun temps enregistré/,'L319 : avertissement chrono à zéro conservé dans le volet');
has(/jamais un envoi bloqué par le volet/,'L319 : repli ultime — le volet ne peut JAMAIS bloquer un envoi (fallback armé)');
absent(/if\(!confirm\(msg\)\) return;/,'L319 : le confirm() natif du récap a bien disparu (remplacé, pas supprimé de flux)');

console.log('── L320 : REDESIGN LOT 18 — fil du parcours + bannière MAINTENANT (§2.19-1/2) ──');
has(/id="flow" role="list"/,'L320 : fil 1·COMMANDE / 2·JE COUPE n\/T / 3·J ENVOIE sous la nav (≥48px)');
has(/function renderFlow/,'L320 : renderFlow = affichage pur (page active + progression existante, zéro logique métier)');
has(/id="nowBar"/,'L320 : bannière MAINTENANT en tête de fiche (bord ambre, PAS d aplat — déviation maquette assumée)');
has(/function gotoNextCut/,'L320 : Y ALLER → défile + surligne la carte .next-action (fl-spot)');
has(/#chutesRappelBanner\{order:1\}/,'L320 (recalibré L393 — #nowBar retiré) : order flex explicite sur les enfants restants');

console.log('── L321 : REDESIGN LOT 19 — zéro tap mort soldé (§2.19-3) ──');
absent(/cursor:not-allowed/,'L321 : plus AUCUN cursor:not-allowed dans l app');
absent(/ disabled onclick="doShareLocal/,'L321 : Partager jamais disabled (garde parlante existante)');
has(/btn\.disabled=false; btn\.style\.opacity=\(n===0\)/,'L321 : « pas prêt » = estompé, le tap explique');

console.log('── L322 : REDESIGN LOT 20 — accueil 3 cartes + indice débutant (§2.19-4/5) ──');
has(/function maybeWelcome/,'L322 : accueil une seule fois (step_welcome_v1), JAMAIS si chronoRunning, réaffichable via ?');
has(/id="welcomeHelpBtn"/,'L322 : « ? » discret dans l en-tête');
has(/step_hint_cut_/,'L322 : indice « 1 tap = coupée + test OK » sur les 3 premières bobines de la VIE de l opérateur (par initiales)');
has(/hintCoupeeCount/,'L322 : compté UNIQUEMENT sur coupe réussie (pas les refus)');

console.log('── L323 : REDESIGN LOT 22 — mode APPRENTI (§2.19-6, interprétation minimale) ──');
has(/step_appr_/,'L323 : apprenti par initiales, ON par défaut pour des initiales inconnues (compteur 5)');
has(/_apprentiTick\(ncCount\)/,'L323 : extinction auto — décrément à chaque envoi validé SANS NC');
has(/apprentiRearm/,'L323 : réactivable par l opérateur (accueil 🎓), jamais imposé');
absent(/step_appr.*firestore|collection\('step_appr/,'L323 : localStorage SEUL — jamais en base');

console.log('── L324 : REDESIGN LOT 12 — gamification G1 série sans NC (§2.5) ──');
has(/step_streak_/,'L324 : série par initiales, localStorage SEUL (jamais en base)');
has(/step_gamif_off/,'L324 : désactivable par poste (chip masquée, compteurs gelés)');
has(/streakBump\(\)/,'L324 : +1 par coupe SAINE (jamais la vitesse — règle d or)');
has(/streakReset\(\)/,'L324 : NC sur bobine coupée → série à 0, sans message culpabilisant');
has(/SÉRIE ×/,'L324 : chip SÉRIE dans le HUD (dès ×2, intensité ×5/×10/×25)');
has(/G2 \(objectif du jour\) et G4/,'L324 : G2/G4 REPORTÉS documentés (dépendance planning)');

console.log('── L325 : REDESIGN LOT 7 — Mon tableau (§2.5) ──');
has(/function openMonTableau/,'L325 : overlay lecture seule (fichesCache + localStorage, zéro écriture)');
has(/re-tap sur SES initiales/,'L325 : ouverture par re-tap sur ses initiales (sélection inchangée sinon)');
has(/Rien n\\'est enregistré/,'L325 : mention lecture seule affichée');

console.log('── L326 : REDESIGN LOT 11 — qui coupe quoi (§2.9, affichage pur) ──');
has(/id="shareWhoGrid"/,'L326 : grille dans le bloc partage actif');
has(/function renderShareWho/,'L326 : rendu DEPUIS le DOM — mécanique/verrous de partage INTOUCHÉS');
has(/toi, maintenant/,'L326 : la bobine du ✂ vif désignée');

console.log('── L327 : REDESIGN LOT 25 — mode ENTRAÎNEMENT (§2.19-7, garantie ISO) ──');
has(/let _trainingMode=false/,'L327 : flag entraînement + trainingGuard() unique');
has(/if\(trainingGuard\(\)\)\{ try\{ showToast\('🎓 ENTRAÎNEMENT — fiche NON envoyée/,'L327 : saveCommandeFiche (point de sortie unique) gardé EN TÊTE');
(function(){ const n=(src.match(/if\(trainingGuard\(\)\)/g)||[]).length; const okk=n>=9;
  console.log((okk?'✅ ':'❌ ')+'L327 : trainingGuard branché sur TOUS les points d écriture ('+n+'/≥9 : envoi, brouillons auto+manuel, plan, chrono, audit, partage, photos×2)'); if(!okk)fail++; })();
has(/#trainingBanner/,'L327 : bandeau permanent RIEN N EST ENVOYÉ + hachures bleues plein écran');
has(/function stopTraining/,'L327 : sortie propre (flag off + resetAll)');
has(/function persistDrafts\(arr\)\{\n  if\(trainingGuard\(\)\) return false;/,'L327 : persistDrafts gardé (fix audit : fuite solde manque-matière en base)');
has(/if\(trainingGuard\(\)&&i===2\)/,'L327 : écran Données bloqué en entraînement (ferme la surface d écriture admin : stock/lames/validation/BL)');
has(/function stopManqueMatiere\(\)\{\n  if\(trainingGuard\(\)\)/,'L327 : ⛔ manque matière gardé en tête (fix audit)');
has(/body\.training #actionBar\{bottom:calc/,'L327 : barre d action remontée au-dessus du bandeau (fix audit : geste inatteignable iPad)');
has(/function shareCutWrite\(idx,coupee,lineId\)\{\n  if\(trainingGuard\(\)\) return;/,'L327 : shareCutWrite gardé (fix contre-revue : miroir RÉCEPTEUR écrivait chez un collègue)');
has(/function openSharedCommand\(id\)\{\n  if\(trainingGuard\(\)\)/,'L327 : openSharedCommand bloqué en entraînement');

console.log('── L328 : REDESIGN LOT 28 — agent de test 24h/24 (§2.23-C, HORS index.html) ──');
(function(){ const ok=require('fs').existsSync(__dirname+'/agent.mjs'); console.log((ok?'✅ ':'❌ ')+'L328 : tests/agent.mjs présent (Node+Playwright, hors le fichier unique)'); if(!ok)fail++; })();
absent(/agent\.mjs/,'L328 : agent.mjs n est PAS référencé dans index.html (l app installée ne grossit pas)');

console.log('── L329 : grosse audit — 7e fuite entraînement (upload Fichiers commande client) ──');
has(/function triggerCommandeFiles\(\)\{\n  if\(trainingGuard\(\)\)/,'L329 : triggerCommandeFiles gardé (fuite Storage prod trouvée par la grosse audit)');
has(/if\(trainingGuard\(\)\)\{ this\.value=''; return; \}   \/\/ \[L329/,'L329 : backstop sur le change handler commandeFilesInput');

console.log('── L330 : correctifs grosse audit (cascade/paysage) ──');
has(/#page1\.active #shareBlock\{margin-top:0 !important\}/,'L330 : +8px portrait corrigé (marge inline → !important)');
has(/#ficheRail\{display:block;grid-column:1;grid-row:1;position:sticky;top:64px/,'L330 : rail paysage dégagé de la nav (top 8→64px, chrono XXL plus tronqué)');
has(/body\.training \.modal-overlay\{z-index:8100\}/,'L330 : modales au-dessus des hachures d entraînement');
has(/body:has\(#page2\.active\) #flow\{display:none\}/,'L330 : fil du parcours masqué sur l écran Données');

console.log('── L331 : changement d opérateur à la reprise (résout le HAUT op-du-jour) ──');
has(/function promptOperatorTakeover/,'L331 : à la reprise, demande « changement d opérateur ? »');
has(/function _pickTakeover/,'L331 : la liste des opérateurs active op.2 « à partir de la bobine en cours »');
has(/setTimeout\(promptOperatorTakeover,400\)/,'L331 : branché sur ▶ Reprendre ET reprise de brouillon');

console.log('── L332 : LOTS 26/27 — bulle de signalement + mail auto (§2.23) ──');
has(/id="reportBubble"/,'L332 : bulle permanente bas-droite (grise, jamais ambre)');
has(/REPORT_RECIPIENTS=\['esterozier42480@gmail\.com','sales@step-international\.com','celine\.rozier\.chabert@gmail\.com'\]/,'L332 (élargi L392) : mail auto aux 3 adresses (Esteban ×2 + Céline)');
has(/collection\('mail'\)\.add/,'L332 : écrit dans la collection « mail » (extension Trigger Email) via boundedWrite (file hors-ligne)');
has(/function reportAuto/,'L332 : erreurs JS remontées auto (regroupement 1\/h\/signature, silence sur refus métier)');
has(/reportAuto\(\(e\.error&&e\.error\.message\)/,'L332 : greffé sur window.error SANS changer son comportement (console+toast conservés)');
has(/if\(typeof trainingGuard==='function' && trainingGuard\(\)\) return Promise\.resolve\(false\)/,'L332 : aucun signalement en entraînement');
(function(){ try{ const r=require('fs').readFileSync(__dirname+'/../firestore.rules','utf8'); const ok=/to\.hasOnly\(\['esterozier42480@gmail\.com','sales@step-international\.com','celine\.rozier\.chabert@gmail\.com'\]\)/.test(r)&&/to\.size\(\) <= 3/.test(r); console.log((ok?'✅ ':'❌ ')+'L332 : firestore.rules fige les destinataires (anti-relais spam, fix audit)'); if(!ok)fail++; }catch(e){ console.log('⚠ firestore.rules non lu'); } })();

console.log('── L340 : fidélité maquette 17 — fiche paysage « premier écran = HUD + bobine en cours » ──');
has(/#ficheHeadSec:not\(\.reveal\),#ficheChgSec:not\(\.reveal\)\{display:none\}/,'L340 : en-tête fiche + 🔧 changements REPLIÉS par défaut en paysage (≥1100px seulement)');
has(/#ficheRail>#fMachineMono:not\(\.reveal\)\{display:none\}/,'L340 : bloc machine/mère/bords/changement plan replié dans le rail (paysage)');
has(/function renderFicheHeadPills/,'L340 : rangée de pastilles d en-tête (client · réf courte · machine · mère · bords · lame · jour · op) — tap = déplier');
has(/function toggleFicheHead/,'L340 : dépliage/repli des 3 sections en un geste');
has(/Element\.prototype\.scrollIntoView=wrapped/,'L340 : filet « jamais pointer un élément caché » — toute garde qui défile vers une section repliée la déplie (paysage seulement)');
has(/function renderSoldeSummary/,'L340 : carte 🏷️ ÉTIQUETTE SOLDE repliée avec résumé « n mm conservés » (formulaire au tap)');
has(/sendBtn\.dataset\.reste=String\(Math\.max\(0,total-done\)\)/,'L340 : RESTE n porté en data-attribut (pastille CSS ::after, §2.13-D)');
has(/#sendPlanBtn\.not-ready\{background:#14371f!important;border:1px solid #2a5c2a!important;color:#8fe0ab!important/,'L340 : CONFIRMER en VERT jamais grisé en paysage (§2.13-D / maquette 17)');
has(/<div class="cc-t">LAIZE \$\{p\.width\} mm<\/div>/,'L340 : « LAIZE n mm » — capitales dans la chaîne, plus d uppercase CSS (mm restait MM)');
absent(/\.cc-t\{[^}]*text-transform:uppercase/,'L340 : aucun uppercase CSS sur le titre de laize (unité)');
has(/\.fh-pills,#soldeSummary,\.fl-chute\{display:none\}/,'L340 : portrait STRICTEMENT inchangé (pastilles + résumé solde + chip CHUTE inexistants <1100px)');
has(/try\{ _l340SetupFichePills\(\); \}catch\(e\)\{\}   \/\/ \[L340/,'L340 : initialisation APRÈS _l79SetupChangements (leçon L339 : nœuds déplacés au boot)');
has(/el\.closest\('#ficheHeadSec,#fMachineMono,#ficheChgSec'\)&&!\(typeof fmmIsMulti==='function'&&fmmIsMulti\(\)&&el\.closest\('#fMachineMono'\)\)\)\{ try\{ _l340RevealBox\(el\.closest\('#ficheHeadSec,#fMachineMono,#ficheChgSec'\)\); \}catch\(_\)\{\} \}/,'L340 fix audit : garde chrono (initiales/lame manquantes) DÉPLIE la section repliée qui contient le champ au lieu de surligner la carte de réf (multi-réf paysage) — L343 : une seule section');
has(/function _l340SyncOrderStates/,'L340 fix : états ✓ FINI / EN COURS / À VENIR de l ordre de coupe dérivés des BOBINES coupées (validée ≠ finie), resynchronisés à chaque coche');
has(/function _l340RenderChuteChip/,'L340 : chip « CHUTE n mm » de la carte en cours (utile − laizes − lames, calcStats en lecture seule)');
has(/height:auto!important;pointer-events:none\}   \/\* \[fix audit\] height:auto/,'L340 fix audit : config compacte = résumé (tap déplie, plus de clavier) + hauteur du textarea jamais figée');
has(/#coupeeBanner\{top:calc\(65px \+ env\(safe-area-inset-top,0px\)\)!important\}/,'L340 fix audit : HUD sticky OPAQUE sous la nav dans tous les états (il se superposait au ✂ en défilant)');
has(/#sendPlanWrap #manqueMatiereBtn\{display:none!important\}/,'L340 : ⛔ manque matière hors de la barre en paysage (entrée ⚙ OUTILS conservée)');

console.log('── L341 : fidélité maquette 18 — plan paysage (cartes de saisie, 3 cotes, outils, emballage résumé) ──');
has(/function _l341PlanPolish/,'L341 : tuile LARGEUR UTILE déplacée dans .row3 en paysage (nœud unique #usefulDisplay, remis dans son champ en portrait)');
has(/function _l341RenderCondSummary/,'L341 : 📦 emballage en carte-résumé (tap = détail) — selects/notes/handlers inchangés');
has(/#cliSection:not\(\.reveal\):not\(:has\(#cliPanel>\*\)\)\{display:none\}/,'L341 : multi-clients replié en paysage SAUF actif (2e client) ou déplié via ⚙ OUTILS');
has(/closeOutilsDlg\('outilsPlanDlg'\);addRefBlock\(\)">＋ Ajouter une référence<\/button>/,'L341 : entrée « + Ajouter une référence » dans ⚙ OUTILS (conservée dans le DOM ; masquée en paysage depuis L357 — décision Esteban 19/08 : bouton direct sous la réf 1)');
has(/\.ref-block \.flex\.mt8 \.btn\.btn-orange,\.ref-block \.flex\.mt8 \.btn\.btn-recut\{background:linear-gradient/,'L341 : ✂ bobineaux / ♻ chute NEUTRES en paysage (§2.16-A)');
has(/#planCards \.bobine-card \.card-sub:has\(>\.v\)\{display:none\}/,'L341 : plan ligne par ligne sans sous-ligne « utilisé / utile » (maquette 18) — données intactes');
has(/class="stat-chip sc-utile"/,'L341 : chip utile classée (masquée en paysage : doublon de la tuile bleue)');
has(/\.cond-summary\{display:none\}/,'L341 : portrait STRICTEMENT inchangé (résumé emballage inexistant <1100px)');
has(/try\{ _l341SetupPlan\(\); \}catch\(e\)\{\}/,'L341 : initialisation au boot + rotation (matchMedia) — reparentage réversible');
absent(/#planLeft \.field>label\{[^}]*text-transform:uppercase/,'L341 : aucun uppercase global sur les labels du plan (unités (mm)/(m) préservées)');
has(/#statsBar \.stat-tile\{flex:1 1 0;min-width:0\}/,'L341 (recalibré L386) : tuiles du plan jamais écrasées, une seule rangée avec 💾');
has(/#planCondSec\.cond-has-alert\{border-color:#59584f;background:#1a1a18\}/,'L341 fix audit design : carte emballage NEUTRE même avec alerte (§2.17-B : pas de 3e orange sur le Plan)');
has(/const f=e\.target\.closest\('\.field'\); if\(!f\|\|!pl\.contains\(f\)\) return;/,'L341 fix audit : tap sur la carte de saisie (libellé/marge) → focus du champ (plus de bande morte)');

console.log('── L342 : fidélité maquette 19 — données paysage (historique dans le bandeau, cartes une rangée) ──');
has(/function _l342PlaceLoadFull/,'L342 : 📥 historique complet dans le bandeau résumé en paysage (nœud unique, retour dans l onglet Plans en portrait)');
has(/if\(_blfIn\) el\.removeChild\(_blf\);/,'L342 : le bouton est SORTI du bandeau avant la réécriture innerHTML (sinon détruit — bug attrapé en test)');
has(/\[L342 → retiré L386 · demande Esteban 21\/08\]/,'L342 (retiré L386 — décision Esteban) : cartes de fiche au format complet');
has(/card\.classList\.toggle\('fc-open'\)/,'L342 : dépliage au tap sur la carte, jamais sur un contrôle');
has(/try\{ _l342SetupDonnees\(\); \}catch\(e\)\{\}/,'L342 : initialisation au boot + rotation (matchMedia)');

console.log('── L343 : demandes Esteban 17/08 — fil retiré, barre fiche IMMOBILE, textes courts ──');
has(/#flow\{display:none!important\}/,'L343 : fil « 1·COMMANDE / 2·JE COUPE / 3·J ENVOIE » retiré de l écran (nœud + renderFlow conservés)');
has(/#ficheMain\{display:flex!important;flex-direction:column;height:calc\(100dvh - var\(--fiche-top,89px\)/,'L343 : fiche paysage = colonne centrale à la hauteur de l écran (barre immobile en bas), hauteur pilotée par la position réelle');
has(/#ficheRight>#ficheLines\{flex:1 1 auto;min-height:0;overflow-y:auto/,'L343 : seule la pile de bobines défile');
has(/#ficheMain>#ficheRight\{flex:1 1 auto;min-height:280px/,'L343 fix audit BLOQUANT : HUD + carte + barre toujours visibles même en-tête dépliée');
has(/function _l340RevealBox/,'L343 fix audit : une garde / ⚙ OUTILS déplie UNE seule section (pas les 3)');
has(/function _l343SyncFicheTop/,'L343 fix audit : bandeaux en flux (miroir partage, réception, lame) ne poussent plus la barre sous le bord');
has(/const _fl0=document\.getElementById\('ficheLines'\); const _flTop=_fl0\?_fl0\.scrollTop:0;/,'L343 fix audit : le récepteur du miroir garde sa position dans la liste');
has(/#cliRecapFiche:not\(\.reveal\)\{display:none\}/,'L343 fix audit : récap emballage par client replié en paysage (⚙ OUTILS → 📥 le déplie)');
has(/<label for="planDateLiv">Livraison<\/label>/,'L343 : libellés d écran courts (Livraison, Référence, Film, Machine, Bords, Laizes, + Ligne, Joindre, Temps, Partager, Cumul, Changements)');
has(/row\.style\.display=_empty\?'none':'';/,'L343 : pastilles d en-tête masquées sur fiche vide');

console.log('── L344 : big audit — couverture spec + hiérarchie/bruit (regard opérateur) ──');
has(/row\('Perte matière'/,'L344 : volet de clôture complété — perte % (§2.5, oublié depuis L319)');
has(/row\('Série sans NC'/,'L344 : volet de clôture — série sans NC (localStorage, jamais en base)');
has(/className='fp-jalon'/,'L344 : jalons mi-parcours / dernière bobine = chip 3 s dans le HUD, jamais une modale (§2.5)');
has(/id='railChgBtn'/,'L344 : 🔧 Changements en 1 tap dans le rail paysage (inventaire §2.10 : 3 taps → 2)');
has(/<span class="cs-auto">'\+\(_isCli\?'CLIENT':'DÉFAUT'\)\+'<\/span>/,'L344 : « AUTO ✓ » → « ✓ » (§2.20) — L363 A16 (analyse parcours, validée Esteban) : le ✓ dit maintenant CLIENT / DÉFAUT (la règle appliquée)');
has(/#btnStartCut\{min-height:84px!important;font-size:29px!important\}/,'L344 : COMMENCER À COUPER = geste n°1 du Plan, un cran au-dessus de tout');
has(/#planLeft #planClient\{font-size:30px\}/,'L344 : CLIENT en avant ; n° commande / livraison / fichier en retrait ; mère/bords en dessous de la largeur utile');

console.log('── L345 : retours Esteban n°2 (17/08 soir) ──');
has(/button\[onclick\^="bumpDateLiv"\]\{display:none!important\}/,'L345 : raccourcis +7 J / +14 J retirés (calendrier natif suffit)');
has(/if\(f\) f\.dataset\.mach=sel\.value\|\|'';/,'L345 : code couleur MACHINE sur la carte du plan (FEBA bleu · MAVEG vert · CEVENINI violet)');
has(/#planResultSec>#planCards\{flex:1 1 auto;min-height:0;overflow-y:auto/,'L345 : colonne droite du plan = hauteur écran, seules les lignes défilent (emballage + COMMENCER toujours visibles)');
has(/le confirm natif « BOBINEAUX ou CHUTES \\? » disparaît/,'L345 (retiré L405 — décision Esteban) : rappel stock porté par le bandeau pré-vol, sans pop-up');
has(/if\(_premierDepart\)\{ let _go=true; try\{ _go=\(maybeShowChutesRappel\(\)!==false\); \}catch\(e\)\{\} if\(!_go\) return; \}/,'L345 : chrono NON lancé si l opérateur choisit d ouvrir le plan');
has(/function _l345ConfDirty/,'L345 : MODIFIER et ÉCARTS = un bouton ; config modifiée → « ♻ RECALCULER »');
has(/if\(!line\.classList\.contains\('coupee'\)&&typeof _l345ConfDirty==='function'&&_l345ConfDirty\(id\)\)\{/,'L345 : garde ✂ — pas de coupe tant que les écarts ne sont pas recalculés après modification (toast + halo) — L351 : jamais sur le dé-marquage');
has(/data-conf0="\$\{esc\(\(data\.conf0!==undefined\?data\.conf0:data\.conf\)\|\|''\)\}"/,'L345 : config de référence posée à la création de la ligne (conf0 restauré prioritaire depuis L379)');
has(/#changementsZone\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\);gap:8px\}/,'L345 : 🔧 Changements = 3 choix compacts, le détail s ouvre pour le choix coché seulement (paysage)');
has(/\[L390 · demande Esteban 21\/08\] bandeau-résumé SUPPRIMÉ/,'L345/L377 (retirés L390 — décision Esteban) : bandeau Données supprimé, 📥 Historique conservé');

console.log('── L346 : audit Données (œil chef) — quick wins ──');
has(/lameAlerts\(maintenanceCache,Date\.now\(\)\):\[\];/,'L346 : chip LAME lu à la source (lameAlerts) — le bandeau éphémère le rendait faux 99 % du temps');
has(/if\(f\.valide===false\|\|f\.manqueMatiere\) return;   \/\* \[L346/,'L346 : bobines / perte du bandeau = règle du KPI mensuel (refusées + manque-matière exclues, perte pondérée)');
has(/todays\.length\)\{ let done=0;/,'L346 : planning du jour f/T calculé depuis la source du Planning (aucune requête)');
has(/  try\{ renderDataSummary\(\); \}catch\(e\)\{\}   \/\/ \[L346/,'L346 : bandeau rafraîchi à chaque entrée dans Données');
has(/\[f\.client,f\.numCmd,f\.name,refs,f\.ini,f\.ini2\]/,'L346 : recherche des fiches aussi par initiales');
has(/class="fc-btn fc-btn-ghost fc-btn-bl"/,'L346 : joindre le BL en 1 tap depuis la rangée compacte (pilotage)');

console.log('── L347 : simulation 200 commandes (tests/sim200.mjs) — correctif verrou RECALCULER ──');
has(/t\.dataset\.conf0=String\(t\.value\|\|''\)\.trim\(\); \} _l345SyncEditChips\(\);/,'L347 : après le tap ♻ RECALCULER la config saisie devient la référence → plus jamais de ✂ verrouillé sans issue (trouvé par la sim : 61/200 commandes bloquées)');
(function(){ const ok=require('fs').existsSync(__dirname+'/sim200.mjs'); console.log((ok?'✅ ':'❌ ')+'L347 : tests/sim200.mjs présent (simulation bout en bout, mode entraînement, hors index.html)'); if(!ok)fail++; })();
absent(/sim200\.mjs/,'L347 : sim200.mjs n est PAS référencé dans index.html');

console.log('── L348 : audit design & a11y (skills) — contrastes, cibles, textes, thème clair, feedback tactile ──');
has(/input::placeholder,textarea::placeholder\{color:var\(--text2\);opacity:\.8\}/,'L348 : placeholders lisibles (2,96:1 → 5,2:1)');
has(/#ficheRail \.chrono-status,\.fh-pill \.fh-l,\.cumul-head label,\.section \.section-title,\.ref-block \.flex\.mt8 \.btn\.btn-ghost,#planLeft \.ref-block-title\{color:var\(--text2\)\}/,'L348 : --text3 sur carte (4,18:1) → --text2 (8,3:1) sur les libellés secondaires');
has(/\.fc-cmd-badge\{color:#141310\}/,'L348 : N° cmd sur bleu lisible (2,8:1 → 6,6:1)');
has(/#verTag\{font-size:13px!important\}#roleTag\{font-size:13px\}/,'L348 : plus aucun texte < 13px (version, rôle, hint, auto, badge)');
has(/\.fh-pills::before\{content:"";position:absolute;inset:-4px 0\}/,'L348 : cibles 48px sans changer le visuel (pastilles, ? aide, carte solde repliée)');
has(/const a11yRows=function\(\)/,'L348 : rôles button + clavier (Entrée/Espace) + aria-expanded sur les rangées dépliables, HUD aria-live');
has(/html\.theme-light #sendPlanWrap\{box-shadow:0 -10px 22px rgba\(255,255,255,\.6\)\}/,'L348 : ombres pré-inversées pour le thème clair (doctrine du fichier)');
has(/#nav button,\.btn,\.machine-btn-fiche,\.fh-pills\{transition-property:background-color,border-color,color,box-shadow,transform,opacity\}/,'L348 : plus de transition:all');

console.log('── L349 : retours Esteban n°3 (18/08) ──');
has(/#planCards \.bobine-card \.card-sub\{display:none\}/,'L349 : cartes du plan compactes en paysage (plus de sous-lignes explicatives)');
has(/#chgBtnRow\{display:none\}   \/\* ligne 🔧 Changements du haut retirée/,'L349 : ligne 🔧 Changements du haut retirée en paysage (bouton du rail = bascule)');
has(/#ficheRail>#shareBlock>#shareBtn\{display:none\}/,'L349 : PARTAGER hors du rail (⚙ OUTILS), bloc conservé pour l état partagé');
has(/class="btn outils-share" onclick="closeOutilsDlg\('outilsFicheDlg'\);toggleSharePanel\(true\)"/,'L349 : entrée 🤝 Partager dans ⚙ OUTILS');
has(/hb\.classList\.add\('rail-hide'\)/,'L349 : 🙈/👁 coupées déplacé dans le rail en paysage (retour dans #chgBtnRow en portrait)');

console.log('── L350 : retours Esteban n°4 (18/08) ──');
has(/#tabStock,#tabContentStock\{display:none!important\}/,'L350 : onglet Stock retiré de Données (masqué, contenu conservé)');
has(/#reportBubble\{width:60px!important;height:60px!important;opacity:1!important;background:#1e3a5f!important/,'L350 : bulle 💬 bleue, 60px, pleinement visible');
has(/#etiqPhotoZone img\{width:48px!important;height:48px!important;border:2px solid var\(--green\)!important/,'L350 : vignette photo d étiquette 48px liseré vert dès la prise');
has(/#outilsFicheDlg \.outils-chg\{display:none\}/,'L350 : entrée 🔧 Changements retirée du tiroir en paysage (bouton du rail)');

console.log('── L351 : grosse audit de régression L303 ↔ L350 (3 agents) — correctifs ──');
has(/if\(!line\.classList\.contains\('coupee'\)&&typeof _l345ConfDirty==='function'/,'L351 : la garde config-modifiée ne bloque plus le DÉ-marquage');
has(/if\(started\|\|shareLock\) setTimeout/,'L351 : conf0 réinitialisée seulement si le recalcul est parti (ou partage = recalcul impossible)');
has(/if\(tab==='stock'\) tab='saves';/,'L351 : onglet Stock masqué → jamais un écran Données vide au boot');
has(/if\(confirm\('Enregistrer la fiche définitivement et vider le plan \?'\)\)\{ _victoryArmed=true; confirmCommandeRecap\(\); \}/,'L351 : replis du volet de clôture = envoi TOUJOURS confirmé');
has(/window\._lastPertePct=null;/,'L351 : perte % du volet remise à zéro au reset (plus de valeur périmée)');
has(/format papier L303 restauré/,'L351 : fiche papier printFiche — colonne Cumul au format L303 (« 502 mm : 5 / 9 »), régression L334 corrigée');
has(/👥 Multi-clients — ＋ 2ᵉ client/,'L351 : 2ᵉ client en 2 taps depuis ⚙ OUTILS Plan');
has(/l exception badge-rouge retirée/,'L351 (révisé L389 — décision Esteban) : le recalcul après NC passe par la bannière rouge / ✓ APPLIQUER');

console.log('── L352 : en-tête fiche compacte 2 colonnes (demande Esteban 19/08) ──');
has(/#ficheHeadSec\.reveal\.l352-idok \.hdr-mini\{display:none\}/,'L352 : Client + Réf. produit masqués dans l en-tête dépliée en paysage (déjà dans les pastilles) — seulement s ils sont renseignés (fix audit)');
has(/sec\.classList\.toggle\('l352-idok'/,'L352 fix audit : classe l352-idok posée par le sync (client + réf renseignés)');
has(/body\.atelier #ficheHeadSide \.machine-btn-fiche\{min-height:56px/,'L352 fix audit : échelle atelier conservée dans le slot (cibles ≥48px)');
has(/#ficheHeadSec\.reveal\.head-2col\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/,'L352 : en-tête dépliée = 2 colonnes (en-tête à gauche · réf + bobine mère + validation à droite)');
has(/function _l352SyncHeadSide\(\)/,'L352 : sync du slot #ficheHeadSide (bloc actif multi-réf / #fMachineMono mono) — jalon .l352-home = retour exact au repli / portrait');
has(/renderFicheMachineBlocks\.__l352=true/,'L352 : hook après renderFicheMachineBlocks (le bloc re-rendu revient dans le slot)');
has(/if\(typeof _l352SyncHeadSide==='function'\) _l352SyncHeadSide\(\);/,'L352 : sync appelée à chaque renderFicheHeadPills (déplié / replié / rotation)');
has(/\.fh-pills\.open \.fh-arrow\{background:var\(--blue\);border-color:var\(--blue\)/,'L352 : bouton ▴ REPLIER coloré (bleu) et visible');
has(/#ficheHeadSide>#fMachineMono button\[onclick="printFichePlan\(\)"\]\{display:none\}/,'L352 : 🖨 du bloc machine masqué DANS LE SLOT seulement (doublon exact de 🖨 IMPRIMER de la barre)');
has(/^#ficheHeadSide\{display:none\}$/m,'L352 : slot inerte hors paysage (portrait strictement identique)');

console.log('── L353 : backlog améliorations n°8 · 9 · 10 · 12 (19/08) ──');
has(/_ln\.classList\.toggle\('conf-long',String\(el\.value\|\|''\)\.replace\(\/\\s\+\/g,''\)\.length>17\)/,'L353 n°8 : config longue → classe conf-long (police réduite en paysage au lieu de 2 lignes) — seuil 22→17 en L360 (mesuré)');
has(/function _l353Overflow\(id\)/,'L353 n°9 : dépassement calculé comme le chip CHUTE (lecture calcStats)');
has(/Marquer quand même cette bobine COUPÉE \?'\)\)\{/,'L353 n°9 : confirmation de sécurité NATIVE synchrone au ✂ quand la config dépasse (jamais un blocage sec) — fix audit : halo après refus');
has(/return w<-0\.5\?-w:0; \}catch\(e\)\{ return 0; \} \}/,'L353 fix audit : tolérance 0,5 mm (seuil moteur) — plus de « dépasse de 0 mm »');
has(/const _dm=Date\.now\(\)-_lastCoupeeMarkMs; if\(_dm>=0&&_dm<700\) return;/,'L353 fix audit : anti-rebond B40 AVANT le dialogue de dépassement');
has(/animation:l353OverPulse 1\.8s ease-out infinite/,'L353 fix audit : halo rouge dédié sur DÉPASSE (plus arcadePulse ambre)');
has(/<span class="foc-cfg"> · ➜ '\+esc\(_cfg\)\+'<\/span>/,'L353 n°10 : ordre de coupe ligne 3 = n bobines · ➜ config à venir (§2.21)');
has(/const cf=row\.querySelector\('\.foc-cfg'\); if\(cf\)\{/,'L353 fix audit : config de la ligne 3 rafraîchie à chaque coche (_l340SyncOrderStates)');
has(/^\.foc-cfg\{display:none\}$/m,'L353 n°10 : config de la ligne 3 masquée en portrait (identique)');
has(/document\.body\.classList\.toggle\('apprenti',!!apprenti\)/,'L353 n°12 : body.apprenti posé par hintCoupeeApply (mode apprenti visible)');
has(/sous-texte retiré — juste DÉFAUT/,'L353 n°12 (retiré L402 — décision Esteban) : plus de sous-indice sous DÉFAUT');

console.log('── L354 : backlog n°16 · 17 · 19 (19/08) ──');
has(/id="saveFilterToday" aria-pressed="false" onclick="toggleSaveFilterToday\(\)"/,'L354 n°16 : filtre 📅 Aujourd hui (n) dans Données › Plans (source _plnSpanIsos, lecture seule)');
has(/function toggleSaveFilterToday\(\)/,'L354 n°16 : bascule du filtre + reset dans resetSaveFilters');
has(/📂 Charger ce plan<\/button>':''\)   \/\* \[L354/,'L354 n°16 : « 📂 Charger ce plan » depuis la fenêtre d une carte du planning (openLoadModal → doLoad, gardes intactes ; jamais sur une coupée)');
has(/@media\(max-width:600px\)\{#tabBtn1\{font-size:0!important/,'L354 n°17 : onglet « 📋 Fiche » court sur téléphone ≤600px');
has(/html\.theme-light \.btn-blue\{background:#12325e;color:#a9d3ff/,'L354 n°19 : thème clair — .btn-blue pré-inversé (≥7:1 après filtre)');
has(/html\.theme-light \.btn-orange\{background:#2a1c00;color:#ffbb70/,'L354 n°19 : thème clair — .btn-orange pré-inversé (≥7:1 après filtre)');

console.log('── L355 : §2.22-2/3 (19/08) ──');
has(/id="victoryGoSame" style="min-height:56px;display:none;flex-basis:100%;justify-content:center" onclick="victoryConfirmSame\(\)"/,'L355 §2.22-2 : bouton « ＋ Même client pour la commande suivante » dans le volet de clôture (masqué par défaut ; forme L356 après audit)');
has(/function victoryConfirmSame\(\)/,'L355 §2.22-2 : même envoi que victoryConfirm (aucune garde contournée)');
has(/const _l355Same=\(function\(\)\{ try\{ const v=window\._l355SameClient; window\._l355SameClient=null;/,'L355 §2.22-2 : intention consommée UNE fois en tête de saveCommandeFiche (avant trainingGuard)');
has(/if\(_l355Same\) setTimeout\(function\(\)\{ try\{ _l355PrefillClient\(_l355Same\); \}catch\(e\)\{\} \}, 450\);/,'L355 §2.22-2 : pré-remplissage APRÈS le resetAll du succès seulement');
has(/function _l355NcFrequent\(id\)/,'L355 §2.22-3 : « NC cause fréquente » = indication seule (fichesCache, ≥2 NC même type, rien coché, rien écrit)');
has(/fl\.addEventListener\('toggle',function\(e\)/,'L355 §2.22-3 : posée à l ouverture du volet ⚠ Défaut (toggle en capture)');

console.log('── L356 : correctifs des audits L353 · L354 · L355 (19/08) ──');
has(/const L=Array\.isArray\(f\.ficheDetail\)\?f\.ficheDetail:\(Array\.isArray\(f\.lines\)\?f\.lines:null\)/,'L356 (audit L355) : NC fréquente lit ficheDetail (les bobines d une fiche envoyée) — la feature était inerte');
has(/id="victoryGoSame" style="min-height:56px;display:none;flex-basis:100%;justify-content:center"/,'L356 (audit L355) : bouton « ＋ Même client » sur SA ligne, sans ✅ (3 boutons débordaient en atelier)');
has(/function _openVictory\(p\)\{\n  try\{ window\._l355SameClient=null; \}catch\(e\)\{\}/,'L356 (audit L355) : intention « même client » purgée à chaque ouverture du volet');
has(/!\(opts&&opts\.manqueMatiere\)&&\(Date\.now\(\)-v\.ts\)<120000/,'L356 (audit L355) : jamais de pré-remplissage sur un envoi manque-matière');
has(/\.nc-check\.nc-freq-hint:not\(\.sel\):not\(:focus-within\)/,'L356 (audit L355) : indication NC jamais par-dessus l état coché ni le focus');
has(/aria-label="Fiche de découpe" onclick="showPage\(1\)"/,'L356 (audit L354) : aria-label sur l onglet Fiche (nom accessible propre sur téléphone)');
has(/html\.theme-light \.btn-green\{background:#0e3a1c;color:#a7f3c0\}html\.theme-light \.btn-red\{background:#330a0a;color:#ffbdbd\}/,'L356 (audit L354) : thème clair — vert/rouge pré-inversés (≥9,5:1)');
has(/body\.atelier #saveFilterToday,body\.atelier #saveFilterMine\{font-size:15px/,'L356 (audit L354) : échelle atelier du filtre Aujourd hui');

console.log('── L357 : retours Esteban (19/08 soir) ──');
has(/#planLeft>\.flex\.mt8>button\[onclick="addRefBlock\(\)"\]\{display:inline-flex;flex:1;min-height:56px/,'L357 : « + Ajouter une référence » visible sous la réf 1 en paysage (56px, neutre)');
has(/#outilsPlanDlg button\[onclick="closeOutilsDlg\('outilsPlanDlg'\);addRefBlock\(\)"\]\{display:none\}/,'L357 : entrée « + référence » retirée de ⚙ OUTILS plan en paysage');
has(/<div class="fp-byref" style="flex-basis:100%/,'L357 : ligne par-réf du HUD = classe fp-byref (masquée ≥1100px, visible en portrait)');
has(/^  \.fp-byref\{display:none!important\}$/m,'L357 : ligne par-réf masquée en paysage (le rail ORDRE DE COUPE la porte)');
has(/block\.style\.setProperty\('--rc',rc\)/,'L357 : couleur de réf exposée en variable CSS sur le bloc');
has(/\(function _l357RefBand\(\)\{/,'L357 : tap sur la bande d une réf VALIDÉE = déplier/replier les détails (paysage seulement)');
has(/#ficheRight>\.fmm-inline-block\{flex:0 0 auto;max-height:/,'L357 : la bande de réf ne se comprime plus dans la colonne (plafond révisé L358)');
{ const _gone=!/body\.apprenti #coupeeBanner::after\{content:"🎓 APPRENTI"/.test(src); console.log((_gone?'✅ ':'❌ ')+'L357 : chip APPRENTI du HUD retirée (demande Esteban)'); if(!_gone) fail++; }

console.log('── L358 : correctifs audit L357 ──');
has(/#ficheLines \.fmm-inline-block\{min-width:0;max-width:100%\}/,'L358 : bande de réf dans #ficheLines = min-width:0 (plus de colonne élargie / ml hors écran)');
has(/\.fmm-inline-block:has\(\.fmm-badge\.val\):not\(\.ref-done\) \.fmm-head::after\{content:"▾"/,'L358 : chevron ▾/▴ (spécificité corrigée)');
has(/\.fmm-ref-chip\{font:800 14px\/1 var\(--f-head\);padding:6px 10px;border-radius:8px;white-space:nowrap;background:var\(--rc,#888\)!important;color:#141310!important/,'L358 : chip Réf N contrastée (≥6,2:1)');
has(/#ficheRight>\.fmm-inline-block\{flex:0 0 auto;max-height:min\(50vh,calc\(100dvh - 402px\)\)/,'L358 : plafond du bloc actif relatif à l écran (VALIDER visible à 744px)');
has(/\[L357 · fix audit a11y\] bande validée = bouton clavier/,'L358 : bande validée role=button + clavier en paysage');

console.log('── L359 : analyse des parcours (19/08) — quick wins 1 · 2 (ISO / cul-de-sac) ──');
has(/const _pm=computed\[0\]&&computed\[0\]\.machine;/,'L359 QW1 : mono-réf — la machine du plan devient celle de la fiche à l import (archive / papier / alertes lame justes)');
has(/if\(!_lel\.value\.trim\(\)\|\|\(_oldNum&&_lel\.value\.trim\(\)===_oldNum\)\) _lel\.value=_newNum;/,'L359 QW1 : n° de lame de l ancienne machine remplacé, saisie manuelle préservée');
has(/if\(_c\.some\(c=>c\.oversize&&c\.oversize\.length\)\)\{ showToast\('⛔ Une laize dépasse la largeur utile/,'L359 QW2 : COMMENCER refuse (toast) quand une laize dépasse l utile — plus de fiche vide silencieuse');
has(/showToast\(auto\?'⛔ Une laize dépasse la largeur utile — la fiche reste vide/,'L359 QW2 : import auto = toast non bloquant au lieu du silence');

console.log('── L360 : analyse des parcours — quick wins CSS ──');
has(/\.fl-current \.cumul-box\{grid-template-columns:repeat\(auto-fit,minmax\(180px,1fr\)\)\}/,'L360 n°3 : cumul de la carte en cours sur une rangée (paysage)');
has(/\.fiche-line\.fl-current \.fiche-grid>\.field:has\(\[id\^="flConf_"\]\)\{padding-left:130px;padding-right:145px\}/,'L360 n°4 : config de la carte en cours sur 1 ligne (313→388px)');
has(/<span class="fmm-btn-ref"> — '\+esc\(String\(r\.ref\)\)\+'<\/span>/,'L360 n°5 : réf du bouton VALIDER dans un span (masqué ≥1100, chaîne portrait identique)');
has(/#ficheRight>#sendPlanWrap>#sendPlanHint:empty\{display:none!important\}/,'L360 n°6 : hint vide de la barre = 0px');
has(/^  \.btn-blue\{background:#16283d\}/m,'L360 n°7 : .btn-blue ≥4,5:1 en paysage');
has(/#ficheRail>\*\{flex-shrink:0\}/,'L360 n°13 : boutons du rail ne rétrécissent plus');
has(/body:not\(:has\(\.fmm-inline-block\.active\)\) #ficheRail #chronoStartBtn\{min-height:64px/,'L360 n°14 : DÉMARRER mono à l échelle des gestes');
has(/\.cond-summary \.cs-l2\{-webkit-line-clamp:3\}/,'L360 n°16 : résumé emballage sur 3 lignes');

console.log('── L361 : retours Esteban (19/08 nuit) ──');
has(/body:not\(\.show-ref-bands\) #ficheRight>\.fmm-inline-block:not\(\.active\),body:not\(\.show-ref-bands\) #ficheLines \.fmm-inline-block:not\(\.active\)\{display:none\}/,'L361 : bandes Réf validée / verrouillée masquées en paysage (le rail les porte) — seul le bloc à couper reste');
has(/\[L361 → retiré L382 · décision Esteban 21\/08\] entrée « 🔄 Recorriger une bobine mère » supprimée/,'L361 (révisé L382) : entrée Recorriger retirée du tiroir — décision Esteban 21/08');
has(/function _l361SyncOutilsBadges\(\)/,'L361 : badge OUTILS = nombre d entrées réellement visibles (affichait 6 pour 4)');

console.log('── L362 : vocabulaire couleurs (analyse parcours D, décisions B1/B2/B7/B8/B9 validées par Esteban 19/08) ──');
has(/\.fl-current \.fl-pos\{background:transparent;border:1\.5px solid #b8860b;color:#ffd45e\}/,'L362 B1 : pastille BOBINE n/T en jaune outline (ambre = seul le ✂)');
has(/#nav button\.active\{color:#141310;background:var\(--text\);border-bottom-color:var\(--text\)\}/,'L362 B2 : onglet actif inversé neutre en paysage');
has(/\.machine-btn-fiche\.sel-maveg\{background:var\(--maveg\);border-color:var\(--maveg\);color:#141310\}/,'L362 A9 : machine sélectionnée = aplat couleur machine (bleu = FEBA seulement)');
has(/\.fmm-badge\.act\{background:transparent;border:1\.5px solid #b8860b;color:#ffd45e\}/,'L362 A10 : « à couper maintenant » en jaune outline comme le rail');
has(/body:has\(\.fmm-inline-block\.active\) #ficheRail #chronoStartBtn:not\(:disabled\)\{background:linear-gradient\(#33332f,#2e2e2b\)!important/,'L362 B7 : avant validation multi, DÉMARRER neutre et VALIDER ambre');
has(/\.fiche-line\.fl-current:has\(\.fl-badge\.badge-red\) \.fl-more\{background:#241010;border-color:#8a2b2f\}/,'L362 B8 : ⚠ DÉFAUT neutre, rouge plein seulement si NC réelle');
has(/\.fiche-ref-sep\.change\{border-color:var\(--warn\)/,'L362 B9 : changement de machine = orange vif (le rouge reste à la NC)');

console.log('── L363 : analyse des parcours — logique validée (B3 B4 B5 B11 B15 · A16 A17 A20) ──');
has(/function _l363DefaultMachine\(\)/,'L363 B3 : machine par défaut = compte Poste X > dernière machine du poste (resetAll + connexion)');
has(/if\(sel\.id==='planRef'&&!prev&&refs\.length===1&&!sel\.value\)\{ sel\.value=refs\[0\]\.ref; sel\.dataset\.l363auto=refs\[0\]\.ref; window\._l363RefAuto=true; \}/,'L363 B4 : client à réf unique → réf présélectionnée (interactif seulement ; marquée auto depuis L364)');
has(/var _keep=!!\(window\._l363PkgTouched&&window\._l363PkgClient===clientName\);/,'L363 B5 : emballage — après saisie manuelle la règle ne remplit que les vides');
has(/if\(t\.dataset\.l363edit!=='1'\) t\.readOnly=true;/,'L363 B11 : config en lecture seule tant que ✎ MODIFIER n est pas tapé (paysage)');
has(/function initDefaultRows\(\)\{for\(let i=0;i<3;i\+\+\) addOrderRow\(\);\}/,'L363 B15 : 3 lignes vides par défaut (la suivante s ajoute seule)');
has(/let delay=600;/,'L363 B15 : recalcul du plan léger à 600 ms');
has(/#planSaveBtn\{display:inline-flex;min-height:52px;width:auto/,'L363 A17 (révisé L385-L386) : 💾 Sauvegarder à 1 tap, à côté de la perte, une seule rangée');
has(/body\.calc-pending #planCards/,'L363 A20 : plan périmé signalé pendant le recalcul');

console.log('── L364 : correctifs audit L359→L363 ──');
has(/const _wasAuto=\(sel\.id==='planRef'&&!!sel\.value&&sel\.dataset\.l363auto===sel\.value\);/,'L364 : réf auto (B4) jamais retenue comme saisie au changement de client');
has(/if\(window\._l363RefAuto\)\{ window\._l363RefAuto=false; try\{ onRefChange\(\); \}catch\(e\)\{\} \}   \/\/ \[L364 · fix audit\] APRÈS les vidages/,'L364 : onRefChange après les vidages (la longueur catalogue n est plus effacée)');
has(/if\(window\._l363PkgClient!==clientName\) window\._l363PkgTouched=false;/,'L364 : saisie emballage manuelle = pour CE client seulement');
has(/var _v=String\(_nEl\.value\)\.replace\(\/\\n\?🔵 Film KX détecté\[\^\\n\]\*\/,''\);/,'L364 : ligne KX suit la réf même en mode « saisie gardée »');
has(/const _cur=!!\(_ln&&_ln\.classList\.contains\('fl-current'\)\); if\(!_ls\|\|!_cur\)\{ t\.readOnly=false; return; \}/,'L364 : lecture seule de la config sur la carte EN COURS seulement (carte dépliée éditable)');
has(/\.btn-blue:hover\{background:#1b3350\}/,'L364 : hover .btn-blue ≥4,5:1');

console.log('── L365 : brouillons par tablette (3 comptes machine) — demande Esteban 19/08 ──');
has(/fromSend:true,owner:_ini\(\),ownerPost:_machinePostName\(\)/,'L365 : le brouillon « non envoyé » porte le poste');
has(/function _draftPoste\(d\)/,'L365 : poste d un brouillon = ownerPost > machine fiche > machine plan');
has(/class="save-card\$\{_other\?' poste-other':''\}" style="--mc:\$\{_mcVar\};border-left:4px solid var\(--mc\)"/,'L365 : carte brouillon teintée machine + « autre tablette »');
has(/Brouillon \$\{esc\(_pst\|\|''\)\} du \$\{ds\}/,'L365 : libellé « Brouillon FEBA / MAVEG / CEVENINI »');
has(/if\(_myP&&d\.ownerPost\)\{ if\(String\(d\.ownerPost\)\.toUpperCase\(\)!==_myP\) return false; \}/,'L365 : identité brouillon = POSTE sur compte machine (💾 supersède l ancien du même poste + n°, jamais une autre tablette)');
has(/if\(_myP2&&d\.ownerPost\)\{ if\(String\(d\.ownerPost\)\.toUpperCase\(\)!==_myP2\) return false; \}/,'L365 : à l envoi, consommation des brouillons du même poste + n°');
has(/Brouillon de la tablette '\+_pD\+'\.\\n\\nLe reprendre ICI/,'L365 : reprise d un brouillon d une autre tablette = passation nominative (confirm)');
has(/const _dupKey=d=>\{ const n=_numOf\(d\); if\(!n\) return '';/,'L365 : une seule carte par (poste, client, n°) — versions plus anciennes repliées, rien détruit (clé + client en L367)');
has(/suppression depuis une autre tablette réservée au pilotage\/admin/,'L365 : 🗑️ d un brouillon d une autre tablette réservé au pilotage');

console.log('── L366 : plans & écran Données par tablette ──');
has(/if\(d\.fromFicheId&&!loadedSaveId\)\{ const _ff=\(fichesCache\|\|\[\]\)\.find/,'L366 D1 : solde ⛔ repris → plan du reste lié (archivé à l envoi)');
has(/x\.id==='d_solde_'\+s\.resteFromFiche&&!x\.consumed/,'L366 D2 : plan du reste chargé → brouillon solde jumeau consommé à l envoi');
has(/<details class="drafts-other"/,'L366 E1 : brouillons des autres tablettes repliés (passation à 1 tap), les miens dépliés');
has(/id="saveFilterMine" aria-pressed="false"/,'L366 E2 : Plans — « ⚙ MA MACHINE seulement » par défaut sur compte machine');
has(/return !m\.size\|\|m\.has\(_myPm\); \}\);/,'L366 E2 : plans sans machine toujours visibles');

console.log('── L367 : correctifs audit L365/L366 ──');
has(/let _loadedSoldeDraftId=null;/,'L367 : solde jumeau du plan du reste = variable dédiée (survit au VALIDER bobine mère)');
has(/if\(d\.id===_resumedDraftId\|\|\(_loadedSoldeDraftId&&d\.id===_loadedSoldeDraftId\)\)\{/,'L367 : consommé à l envoi via la branche concordance');
has(/const _openP=new Set\(Array\.from\(list\.querySelectorAll\('details\.drafts-other\[open\]'\)\)/,'L367 : état ouvert/fermé des groupes conservé au re-rendu (snapshot)');
has(/return _draftPoste\(d\)\+'¦'\+nrm\(f\.client\|\|p\.client\|\|''\)\+'¦'\+n; \};/,'L367 : clé de dédup = poste + client + n°');
has(/if\(!_myPg\)\{ list\.innerHTML=drafts\.map\(_card\)\.join\(''\); return; \}/,'L367 : compte personnel = liste chronologique');
has(/if\(d\.fromSend\)\{ const _pF=/,'L367 : filet non envoyé consommé dès que la MÊME commande est en base (toute tablette)');
has(/mb\.classList\.toggle\('sel',!!\(\(typeof _machinePostName==='function'\)\?_machinePostName\(\):''\)\)/,'L367 : Reset des filtres Plans = retour à « ma machine »');

console.log('── L368 : nav épurée (demande Esteban 19/08) ──');
has(/#verTag,#welcomeHelpBtn\{display:none!important\}/,'L368 : version et bouton ? retirés de la nav');
has(/id="appFooter" class="app-footer"><span class="app-ver"><\/span>/,'L368 : version + « Revoir l accueil » en pied de Données (rien de perdu)');
has(/document\.querySelectorAll\('\.app-ver'\)\.forEach\(function\(e\)\{ e\.textContent='v'\+APP_VERSION; \}\)/,'L368 : version posée dans les pieds (Données + ⚙ OUTILS)');
has(/\.modal>div:not\(\.outils-foot\)>button\.btn/,'L368 : le pied des tiroirs OUTILS ne compte pas dans le badge');

console.log('── L369 : bruit résiduel (audit 19/08) ──');
has(/document\.body\.classList\.toggle\('role-op',currentRole==='operateur'\)/,'L369 : classe rôle opérateur sur body');
has(/body\.role-op #atelierBtn\{display:none!important\}/,'L369 : ATELIER masqué pour l opérateur (forcé ON de toute façon)');
has(/@media\(max-width:1099px\)\{#nav\{overflow-x:auto;scrollbar-width:none\}\}/,'L369 : nav portrait défile seule (page immobile)');
has(/const _chef=\(typeof canManageData==='function'\)\?!!canManageData\(\):true;/,'L369 : KPI chef du bandeau Données réservés pilotage/admin (élargi au pilotage en L377 · B5)');
has(/if\(blf\) blf\.style\.display=canManage\?'':'none';/,'L369 : historique complet réservé pilotage/admin');
has(/\[L382\] CLAIR revient dans la nav/,'L369 (révisé L382) : CLAIR de retour dans la nav à côté d ADMIN — décision Esteban 21/08');

console.log('── L370 : analyse des parcours B13 · B14 · A15 · A19 ──');
has(/function _l370NcQuick\(id,btn\)/,'L370 B14 : puces détail NC = texte seulement, rien coché');
has(/function _l370RecentClients\(\)/,'L370 B13 : clients récents en tête du select (source mémoire)');
has(/function _l370HabitualWidths\(\)/,'L370 B13 : laizes habituelles de la réf en chips (paysage), tap = 1re ligne vide');
has(/const ln=document\.getElementById\(l\.id\); if\(ln\)\{ ln\.classList\.add\('fl-current'\); try\{ _confAutoH/,'L370 A15 : 1re bobine déjà « en cours » avant le chrono (paysage), ambre sur DÉMARRER — + _confAutoH (L371)');
has(/<div class="section-title" style="margin:12px 0 8px">Laizes<\/div><!-- \[L370 · A19\]/,'L370 A19 : bloc 2 « Laizes » comme le bloc 1');
has(/^\.l370-laizes,\.nc-quick\{display:none\}$/m,'L370 : chips/puces masquées en portrait (identique)');

console.log('── L371 : correctifs audit L370 ──');
has(/function _l370FillWidth\(w\)/,'L370 B13 : tap chip = largeur dans la 1re ligne vide (marqueur manquant, ajouté L371)');
has(/#ficheLines:has\(\.fl-current\):not\(\.chrono-off\) \.fiche-line:not\(\.fl-current\) button\[onclick="recalcEcartsFromFiche\(\)"\]\{display:none\}/,'L371 : chrono arrêté = les ♻ restent visibles (A15 posait fl-current)');
has(/if\(typeof planManual!=='undefined'&&planManual\)\{ const b0=document\.getElementById\('l370Laizes'\)/,'L371 : chips habituelles coupées en plan manuel');
has(/\[L371 · fix audit\] chips « Habituelles » vidées/,'L371 : chips vidées au resetAll (plus de laize fantôme)');
has(/coche le motif \(Angle · Casse · Larg\. · Qté\)/,'L371 : rappel non-attestant si détail rempli avec RAS coché');
has(/const _mqA15=window\.matchMedia\('\(min-width:1100px\)'\)/,'L371 : rotation = fl-current du mode start recalculé');

console.log('── L372 : retours recette Esteban (20/08) ──');
has(/if\(!bandHtml\) div\.classList\.add\('refonly'\);/,'L372 : bande de passage de réf toujours rendue (refonly sans changement de machine)');
has(/^\.fiche-ref-sep\.refonly\{display:none\}$/m,'L372 : bande refonly masquée en portrait (les blocs Réf N y restent)');
has(/SWAP MACHINE DU POSTE, version sûre et partagée/,'L372 (révisé L376) : plan chargé sur compte machine = machine du poste via le helper commun');
has(/t\.value=cur\.split\(' ; '\)\.map\(x=>x\.trim\(\)\)\.filter\(x=>x&&x!==txt\)\.join\(' ; '\);/,'L372 : puce détail NC = bascule (re-tap retire le texte, texte libre conservé)');

console.log('── L373 : audit intégral du chrono (20/08) ──');
has(/if\(!chronoRunning && !line\.classList\.contains\('coupee'\)\)\{   \/\/ \[L373 · audit chrono G1\]/,'L373 G1 : le dé-marquage d une coupée ne (re)lance plus le chrono');
has(/\[L373 · audit chrono P5\] refiger le brouillon/,'L373 P5 : chronoReset refige le brouillon (un chrono annulé ne ressuscite plus en marche)');
has(/paused:true\}\)\);\n      _wroteChronoLive=true;/,'L373 P4 : pause perso écrite en localStorage (repli si Firestore refuse)');
has(/la PAUSE locale fait foi/,'L373 P4 : la reprise respecte la pause locale');
has(/\[L373 · audit chrono P6\] un brouillon PARQUÉ n'est jamais « en marche »/,'L373 P6 : 💾 manuel = chrono figé (pas d interlude compté)');
has(/\[L373 · audit chrono E5\] rejet DUR après le timeout/,'L373 E5 : rejet Firestore tardif signalé (plus d alert mensongère)');
has(/\[L373 · audit chrono E6\] un listener mort gelait/,'L373 E6 : listener brouillons signalé + re-abonnement borné');
{ const rules=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/firestore.rules','utf8'); const okR=/email\.lower\(\)\.matches/.test(rules); console.log((okR?'✅ ':'❌ ')+'L373 : firestore.rules du repo — compte machine insensible à la casse (à PUBLIER en console)'); if(!okR) fail++; }

console.log('── L374 : retours recette Esteban (20/08 après-midi) ──');
has(/body\.plan-drift \.fiche-line\.conf-dirty \.fl-edit-chip,body\.plan-drift #ficheLines button\[onclick="recalcEcartsFromFiche\(\)"\]\{display:none!important\}/,'L374 : bannière « plan a changé » visible = le gros bouton est le SEUL chemin (♻ par carte masqués, paysage)');
has(/mère <b>'\+fmt\(mo\)\+' mm<\/b> — habituel <b>'\+fmt\(std\)\+' mm<\/b>\. Vérifie le rouleau\./,'L374 : avertissement bobine mère raccourci (écran)');
has(/#ficheRail>#hideCoupeesBtn\.rail-hide\{order:3;border:1px solid #2e6b47/,'L374 : VOIR LES COUPÉES teinté vert, au-dessus d OUTILS');
has(/^  #ficheRail>#etiquetteSoldeFiche\{order:9\}$/m,'L374 : ÉTIQUETTE SOLDE tout en bas du rail');
has(/function _l374PlanOutilsTop\(\)/,'L374 : lanceur ⚙ OUTILS au-dessus de chaque bloc réf du Plan (paysage, teinté, badge synchronisé)');

console.log('── L375 : enquête impression / dérive fiche→plan (20/08) ──');
has(/\[L375 · enquête impression 20\/08\] ✕ RETIRER = dérive fiche→plan signalée TOUT DE SUITE/,'L375 : retirer une bobine déclenche la bannière immédiatement');
has(/bobine retirée \?\) — ⚠ « Appliquer » RE-CRÉERA ces laizes/,'L375 : la bannière dit la vérité (le recalcul re-crée les laizes retirées)');
has(/Imprimer le PLAN RECALCULÉ à la place \? Il peut différer des bobines affichées/,'L375 : repli d impression jamais silencieux (confirm)');
has(/🖨 Instantané enregistré'\+\(_d\?' le '\+_d:''\)/,'L375 : impression d un plan archivé = toast « instantané »');

console.log('── L376 : grande analyse (12 agents, 20/08) — correctifs confirmés ──');
has(/#roleTag\.role-op,\.role-op:not\(body\)\{background:#142a1a/,'L376 A2 : fuite .role-op sur body corrigée (fond vert partout, portrait compris)');
has(/return \[\.\.\.cumEl\.children\]\.map\(function\(n\)\{ return n\.classList\.contains\('cumul-card'\)\?fmtCard\(n\):n\.innerText/,'L376 A1 : papier fiche — cumul dans l ORDRE DU DOCUMENT (multi-clients / rebut à leur place L303)');
has(/line\.classList\.toggle\('t2-todo',\(!!_t2nc\|\|ncMode\)&&!test2Resolved\(id\)\);/,'L376 A4 : indice test 2ᵉ aussi sur bobine NC');
has(/tape le bouton ROUGE de la bannière en haut/,'L376 A5 : garde ✂ sous plan-drift pointe le gros bouton');
has(/#page0 \.btn\.plan-outils-top/,'L376 2.3 : lanceur OUTILS réellement teinté (spécificité)');
has(/pré-vol court et impactant/,'L376 2.10 (retiré L405) : plus de question bloquante à reposer');
has(/if\(first\) document\.body\.classList\.add\('show-ref-bands'\);/,'L376 2.11 : recorriger sans réf validée = no-op propre');
has(/function _l376PostMachineSwap\(withFiche\)/,'L376 1.4/1.5/2.1 : swap machine du poste unifié (bords/lame personnalisés conservés)');
has(/signatures autosave posées sur l'état FINAL chargé \(swap compris\)/,'L376 1.4 : signatures autosave APRÈS le swap (protection L291 rétablie)');
has(/\[L376 · grande analyse 2\.1\] PASSATION/,'L376 2.1 : passation resumeDraft bascule réellement la machine');
has(/\[L376 · grande analyse A2\.6\] l'en-tête déplié par la GARDE/,'L376 2.6 : en-tête déplié par la garde initiales se replie après le choix');

console.log('── L377 : grande analyse — recommandations appliquées (go Esteban 20/08) ──');
has(/\[L377 · grande analyse B3 \(reco appliquée « go » Esteban 20\/08\)\]/,'L377 B3 : verrou dur — bobine d une réf non validée incoupable (multi)');
has(/⚠ PLAN MANUEL : ce retrait est DÉFINITIF/,'L377 B4 : confirm du ✕ en plan manuel dit que le retrait est définitif');
has(/\[L369 → L377 · B5\] KPI « œil chef » = pilotage ET admin/,'L377 B5 : KPI chef ouverts au pilotage (canManageData)');
absent(/chip\('À valider'/,'L377 B5+ (retiré L390) : plus de chips dans le bandeau');
has(/\[L377 · grande analyse B8\] config ÉDITÉE non recalculée = travail terrain/,'L377 B8 : conf-dirty protège la fiche de l import auto');
has(/function _l377NetWatch\(\)/,'L377 A9 : pastille HORS-LIGNE + flush repli + resync au retour réseau');
has(/shareWhoGridMirror/,'L377 A10 : grille qui-coupe-quoi visible côté récepteur (vue miroir)');
has(/window\._l377MachinePrep=_was;/,'L377 B2 : trace durable préparé X → coupé Y (pastille + champ machinePrep)');
has(/machine,machinePrep,machine2,/,'L377 B2 : champ machinePrep dans la fiche archivée (additif)');
has(/reportAuto\('\[G-CONSERVATION\] '/,'L377 §2.23-B : reportAuto sur anomalie moteur');
has(/reportAuto\('permission-denied au chargement/,'L377 §2.23-B : reportAuto sur permission refusée');
has(/reportAuto\('échec purge brouillons/,'L377 §2.23-B : reportAuto sur échec de purge');

console.log('── L378 : retouches design (grande analyse section 5) ──');
has(/\.fiche-line\.fl-current \[id\^="coupeeBtn_"\]\{min-height:92px!important/,'L378 (recalibré L386) : la carte en cours domine — ✂ COUPÉE 92px');
has(/\[L378 · A7\] rouge réservé aux NC réelles/,'L378 A7 : compteur de bande neutre sans NC');
has(/\.fiche-ref-sep \.frs-count,\.fiche-ref-sep \.frs-m\{font-size:13px\}/,'L378 : bande refonly ≥13px');
has(/html\.theme-light \.stat-tile\.pct-orange b\{color:#ff9d4d\}/,'L378 : thème clair — perte % lisible');

console.log('── L379 : correctifs audit L377/L378 ──');
has(/if\(typeof _ln\.refIdx==='number'\)\{ _blockCut=\(typeof ficheRefValidated!=='undefined'\)&&!ficheRefValidated\.has\(_ln\.refIdx\); \}/,'L379 n°2 : verrou B3 par INDEX de groupe (les homonymes ne mentent plus) — structurel');
has(/refIdKey:_refIdKey\(c\), refIdx:c\.idx,/,'L379 n°2 : refIdx posé à la génération des lignes');
has(/st\.fiche\.refValidated=\[\]; st\.fiche\.refOrder=\[\];/,'L379 n°3 : les mères du SOLDE se re-valident (index ré-alignés)');
has(/if\(_blockCut\)\{   \/\/ \[L379 · n°4\] décision HORS du try/,'L379 n°4 : verrou fail-closed');
has(/conf0:\(get\('flConf'\)\?\.dataset\.conf0!==undefined/,'L379 n°6 : baseline conf0 sérialisée (la protection B8 survit au brouillon)');
has(/valide==null/,'L379 n°7 : « À valider » = valide==null (compteurs restants : onglet Fiches)');
has(/annulé L386 · demande Esteban : « met tout en jaune »/,'L379 n°14 (annulé L386 — décision Esteban) : carte en cours 100 % ambre');
has(/\[L379 · fix audit n°12\] trace « prép\. X » d'une commande abandonnée/,'L379 n°12 : machinePrep purgé à doLoad');
has(/\[L379 · n°12\] la reprise repart proprement/,'L379 n°12 : machinePrep purgé à la reprise de brouillon');
has(/#shareWhoGridMirror\{max-height:240px;overflow-y:auto\}/,'L379 n°11 : grille miroir bornée');

console.log('── L380 : assistant IA de la bulle 💬 (demande Esteban 20/08) ──');
has(/function _l380Snapshot\(\)/,'L380 : scan de contexte texte (page, plan, fiche, erreurs) au signalement');
has(/_l380AssistSend\(_repKind,txt,shots\)/,'L380 (enrichi L388) : signalement → doc assist (fil IA) EN PLUS du mail, avec les écrans');
has(/if\(typeof trainingGuard==='function'&&trainingGuard\(\)\) return;   \/\/ entraînement : rien n'est écrit/,'L380 : assistant inactif en mode entraînement');
has(/db\.collection\('config'\)\.doc\('assistant'\)/,'L380 : interrupteur config/assistant (enabled) — mail-seul tant que non déployé');
has(/id="assistOverlay"/,'L380 : panneau de fil assistant');
has(/#reportBubble\.assist-new::after/,'L380 : pastille « réponse reçue » sur la bulle');
{ const fx=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/functions/index.js','utf8');
  const okF=/claude-opus-5/.test(fx)&&/stop_reason === "refusal"/.test(fx)&&/defineSecret\("ANTHROPIC_API_KEY"\)/.test(fx)&&/msgs\[msgs\.length - 1\]\.role !== "operator"/.test(fx);
  console.log((okF?'✅ ':'❌ ')+'L380 : Cloud Function assistReply (secret, anti-boucle, refus géré)'); if(!okF) fail++; }
{ const rules=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/firestore.rules','utf8');
  const okR=/match \/assist\/\{id\}/.test(rules)&&/match \/config\/\{id\}/.test(rules);
  console.log((okR?'✅ ':'❌ ')+'L380 : règles assist + config (à publier en console)'); if(!okR) fail++; }

console.log('── L381 : correctifs audit assistant IA ──');
has(/messages:firebase\.firestore\.FieldValue\.arrayUnion\(\{role:'operator'/,'L381 n°2 : relance en arrayUnion (s enfile hors-ligne — règle L272, plus de transaction nue)');
has(/\[L381 · fix audit n°4\] l'interrupteur assistant se relit à CHAQUE auth/,'L381 n°4 : interrupteur relu à l authentification');
has(/step_assist_doc/,'L381 n°12 : le fil survit à un reload (reprise ≤1 h)');
has(/hors-ligne — la réponse arrivera au retour du réseau/,'L381 n°9 : attente honnête hors-ligne');
{ const fx=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/functions/index.js','utf8');
  const okF=/data\.status !== "pending"/.test(fx)&&/cfg\.data\(\)\.enabled !== true\) return;/.test(fx)&&/CONTEXTE SCANNÉ/.test(fx)&&fx.indexOf('apiMessages = [')<fx.indexOf('msgs.forEach')&&/timeout: 90_000/.test(fx)&&/max_tokens: 3000/.test(fx);
  console.log((okF?'✅ ':'❌ ')+'L381 : fonction — interrupteur serveur, contexte en tour user de tête, timeout SDK, budget 3000'); if(!okF) fail++; }

console.log('── L382 : retours recette Esteban (21/08) ──');
has(/les chips « n références » \/ « n clients » remontent/,'L382 : chip n références à côté du titre Plan de découpe (purge anti-accumulation)');
has(/ttl\.querySelectorAll\('\.title-chip'\)\.forEach\(function\(o\)\{ o\.remove\(\); \}\);/,'L382 : purge des chips déplacées à chaque recalc');
has(/#statsBar \.stat-tile b\{font-size:20px\}/,'L382 (recalibré L386) : tuiles compactes — le plan des bobines se voit plus haut');
has(/\[L372 → retiré L382 · décision Esteban 21\/08\] la bande de passage de réf est MASQUÉE/,'L382 : bande refonly retirée (le rail suffit) — bandes rouges machine conservées');

console.log('── L383 : correctifs de l audit de fusion (nuit du 21/08) ──');
has(/else if\(ttl\)\{ const sb=document\.getElementById\('statsBar'\)/,'L383 : rotation en portrait — les chips reviennent dans #statsBar (layout historique)');
has(/\[L383 · audit fusion\] plan vidé \(✓ envoi \/ ↺ réinitialiser\) : les chips/,'L383 : plan vidé — les chips du titre partent aussi (plus de compteurs d une commande précédente)');
has(/les bobines DÉJÀ COUPÉES restent attribuées à la machine qui les a physiquement/,'L383 : passation — les bobines déjà coupées gardent leur machine (archive ISO juste)');
has(/lanceurs orphelins \(bloc réf supprimé/,'L383 : lanceurs ⚙ OUTILS orphelins purgés (plus d empilement au fil de la journée)');
has(/préservé autour du resetAll d'entrée\/sortie d'entraînement/,'L383 : temps miroir en attente préservé par l entraînement');
has(/re-dérivé depuis\n          \/\/ loadedSaveId|_loadedSoldeDraftId \(RAM\) meurt au rechargement/,'L383 : solde ⛔ jumeau re-dérivé après rechargement (consommé à l envoi du reste)');
{ const fx=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/functions/index.js','utf8');
  const okF=/maxRetries: 0/.test(fx);
  console.log((okF?'✅ ':'❌ ')+'L383 : fonction — maxRetries:0 (le repli d erreur s exécute toujours, plus de doc « pending » à vie)'); if(!okF) fail++; }

console.log('── L384 : contre-audit final (les casseurs avaient raison) ──');
{ const okP=src.indexOf('_l384DeriveSoldeTwin(); }catch(e){}')>=0&&src.indexOf('_l384DeriveSoldeTwin(); }catch(e){}')<src.indexOf('// #5 : si la fiche vient');
  console.log((okP?'✅ ':'❌ ')+'L384 : re-dérivation solde AVANT le bloc #5 (la v1 après = code mort, loadedSaveId déjà nul)'); if(!okP) fail++; }
has(/function _l384DeriveSoldeTwin\(\)/,'L384 : helper solde jumeau extrait (testable)');
has(/SAUF en entraînement : un reset\/envoi d'EXERCICE/,'L384 : chronoReset ne jette plus le temps miroir réel pendant l entraînement');
has(/_trainingLsBak=null; try\{ _trainingLsBak=localStorage\.getItem\(CHRONO_MIR_LS_KEY\)/,'L384 : backup miroir au niveau MODULE (survit à toute purge pendant l entraînement)');
has(/dataset\.l384Fresh='1'/,'L384 : drapeau rendu frais sur #statsBar');
has(/purge SEULEMENT après un rendu frais/,'L384 : un polish sans re-rendu ne mange plus les chips du titre');
has(/5e chemin de suppression/,'L384 : lanceur OUTILS purgé aussi à la fusion de blocs doublons');
has(/un chrono en marche\/en pause compte aussi/,'L384 : confirm d entraînement si un chrono tourne sur écran vide');

console.log('── L385 : retours prod Esteban (21/08 matin) ──');
has(/chargement INSTANTANÉ : plus de modale de confirmation/,'L385 : 📂 Charger = chargement direct (modale + Refaire supprimés, gardes doLoad intactes)');
absent(/onclick="doRedo\(\)"/,'L385 : bouton « ⟳ Refaire (nouveau n°) » retiré de la modale');
has(/l'en-tête suit la réf EN COURS même VALIDÉE/,'L385 : en-tête fiche = réf en cours toujours visible (recorrigeable), vidée quand tout est coupé');
has(/💾 SAUVEGARDER en GRAND, posé à côté de la tuile PERTE/,'L385 : 💾 à côté de la tuile perte, en grand');
has(/le sortir avant de réécrire innerHTML sinon il serait détruit/,'L385 : 💾 sauvé avant chaque réécriture de #statsBar (2 branches)');
has(/#planCards \.card-config\{font-size:26px;line-height:1\.1\}/,'L385 (recalibré L386) : compositions lisibles ET serrées — plus de lignes visibles');

console.log('── L386 : gros lot de retours prod Esteban (21/08) ──');
has(/\[L342 → retiré L386 · demande Esteban 21\/08\] cartes compactes une-rangée SUPPRIMÉES/,'L386 : fiches découpe — retour au format complet historique');
has(/#welcomeHelpBtn\{display:none!important\}/,'L386 : « ? Revoir l accueil » retiré (accueil+apprenti+entraînement)');
has(/accueil 3 cartes RETIRÉ \(avec ses entrées mode apprenti/,'L386 : maybeWelcome désarmé');
has(/✕ pour supprimer \(puis 📷＋ juste à côté/,'L386 : ✕ de suppression sur les photos étiquettes');
has(/blur = APPLIQUER : la config modifiée lance ELLE-MÊME le recalcul/,'L386 : appliquer une config modifiée relance le recalcul (1 seul geste)');
has(/tap sur la barre de config = ✎ MODIFIER/,'L386 : tap direct sur la barre de config');
has(/annulé L386 · demande Esteban : « met tout en jaune »/,'L386 : carte en cours 100 % ambre (plus de vert machine sur le bord)');
has(/la bobine À COUPER domine l'écran/,'L386 : bobine en cours agrandie (config 30px, ✂ 92px)');
has(/minmax\(0,…\) : une carte ne peut plus élargir la grille hors écran/,'L386 : brouillons — plus de glissement horizontal');
has(/sans le client : il prenait 3 lignes/,'L386 : titre 📦 EMBALLAGE court');
has(/titre discret à droite — toute la place au plan/,'L386 : titre Plan de découpe discret à droite');
has(/COMMENCER À COUPER discret/,'L386-L389 : COMMENCER À COUPER réduit en paysage');
has(/le résumé ✓ \(machine·mère·bords \+ ✎ MODIFIER\) TOUJOURS visible/,'L386 : résumé validé + ✎ MODIFIER visibles dans l en-tête');

console.log('── L387 : audit ambre du bouton COUPÉE ──');
{ const n=(src.match(/\[L387 · audit ambre\]/g)||[]).length;
  console.log((n===3?'✅ ':'❌ ')+'L387 : ambre re-calculé aux 3 sorties d état (quitter miroir, partage terminé, resetAll) — '+n+'/3'); if(n!==3) fail++; }

console.log('── L388 : captures d écran dans les signalements ──');
has(/html2canvas 1\.4\.1 EMBARQUÉ/,'L388 : html2canvas embarqué (hors-ligne, zéro CDN)');
has(/async function _l388CaptureShots/,'L388 : capture Plan + Fiche (JPEG, plafonnée, jamais bloquante)');
has(/ecran-plan\.jpg/,'L388 : pièces jointes du mail (Trigger Email télécharge les URLs)');
has(/Claude verra ce que voit l'opérateur/,'L388 : captures dans le doc assist');
{ const fx=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/functions/index.js','utf8');
  const okF=/type: "image", source: \{ type: "url"/.test(fx)&&/appendTo/.test(fx);
  console.log((okF?'✅ ':'❌ ')+'L388 : fonction — images en vision + fusion des tours compatible tableau'); if(!okF) fail++; }

console.log('── L389 : retours prod Esteban (21/08 après-midi) ──');
has(/fiches sur 2 COLONNES comme les Plans/,'L389 : fiches découpe sur 2 colonnes, cartes compactées');
absent(/Revoir l'accueil<\/button>/,'L389 : bouton « ? Revoir l accueil » supprimé du pied de page');
absent(/foot-accueil/,'L389 : boutons « ? Accueil » supprimés des tiroirs OUTILS');
has(/✓ APPLIQUER LES CHANGEMENTS/,'L389 : le chip dit APPLIQUER (recalcul auto, ✂ redevient jaune)');
has(/l exception badge-rouge retirée/,'L389 : plus de bouton ♻ écarts sur la carte en cours (bannière + APPLIQUER seuls)');
has(/#sendPlanBtn\{font-size:15px!important;min-height:42px\}/,'L389-L390 : COMMENCER À COUPER réduit ×3');
has(/idx0 = fiches SANS n°/,'L389 : hygiène auto étendue aux plans sans n° (décision Esteban)');
has(/hygiène auto après l'envoi/,'L389 : hygiène déclenchée après chaque envoi');
absent(/id="hygieneBtn"/,'L389 : bouton « 🧹 Nettoyer les plans déjà coupés » supprimé (devenu inutile)');

console.log('── L390 : simplifications Esteban (21/08 soir) ──');
{ const n=(src.match(/retiré L390 · décision Esteban|retiré L390 · décision Esteban 21\/08/g)||[]).length+(src.match(/\[retiré L390 · décision Esteban\]/g)||[]).length;
  console.log(((n>=4)?'✅ ':'❌ ')+'L390 : 4 confirm conservateurs retirés (décision Esteban — les coupées sont conservées, geste déjà explicite) — '+n); if(n<4) fail++; }
has(/après le gros bouton rouge, les configs À L'ÉCRAN deviennent la référence/,'L390 : gros bouton rouge → conf0 re-basé partout, chip APPLIQUER éteint');
has(/✂ redevient AMBRE tout de suite : on peut couper-tester dans la foulée/,'L390 : ✂ re-ambre juste après le gros bouton rouge');
has(/bandeau-résumé SUPPRIMÉ/,'L390 : bandeau Données supprimé');
has(/pleine largeur \+ colonne plan élargie/,'L390 : plan pleine largeur, colonne 430px');
has(/emballage compact/,'L390 : résumé emballage compact');

console.log('── L391 : fluidité après APPLIQUER (21/08 soir) ──');
has(/on RESTE sur la bobine en cours \(le défilement vers la ligne ajoutée/,'L391 : plus de descente auto après APPLIQUER — la bobine en cours reste en vue');
has(/bandeau violet récap supprimé/,'L391 : bandeau violet récap retiré (surlignage orange + RESTE- suffisent)');
has(/une ligne — le récap multi-lignes faisait pop-up/,'L391 : toast de recalcul en une ligne');
has(/alerte volume UNIQUEMENT à partir de 60 bobines mères/,'L391 : bannière volume seulement ≥60 bobines mères (sinon rien)');
absent(/Commande volumineuse \(nombreuses laizes distinctes/,'L391 : bannière « commande volumineuse » retirée');
has(/petit, à droite des onglets — plus de bande dédiée/,'L391 : 📥 Historique complet discret dans la rangée d onglets');

console.log('── L392 : destinataires signalements ──');
has(/celine\.rozier\.chabert@gmail\.com/,'L392 : Céline reçoit les signalements de la bulle 💬');

console.log('── L393 : bobine mère fluide + compteurs synchronisés (22/08) ──');
has(/#nowBar\{display:none!important\}/,'L393 : bandeau « MAINTENANT / Y ALLER » supprimé (photo Esteban)');
has(/un tap = validé, AUCUN « changement »/,'L393 : VALIDER avec valeurs inchangées = simple coche (multi)');
has(/\[L393 → corrigé L398\] valider SANS recalcul UNIQUEMENT/,'L393 (corrigé L398) : coche mono sans recalcul SEULEMENT si la fiche est déjà calée');
has(/_l393AutoApply/,'L393 : mère/bords/lame modifiés = application AUTO en sortant des champs');
has(/la commande CORRIGÉE devient la référence des compteurs/,'L393 : CUMUL x\/y re-basé après tout recalcul (audit modif-commande n°1/2)');
has(/le ✎ CORRIGER de l'en-tête \(fClient\) pilote aussi les chips du cumul/,'L393 : chips mandrin/cerclé suivent le client corrigé (audit n°4)');

console.log('── L394 : plans triés par livraison ──');
has(/tri par LIVRAISON : la commande à couper en premier TOUT EN HAUT/,'L394 : Données › Plans triés par date de livraison (urgent en haut, sans date en bas)');

console.log('── L395 : débit en m²/h ──');
has(/debitM2:_moM>0\?metres\*_moM\*3600\/sec:null/,'L395 : débit surface par relevé (métrage × laize mère du relevé)');
has(/SURFACE coupée \(métrage × laize mère\) : comparable/,'L395 : carte Analyse en m²/h médian (repli m/h sans laize)');

console.log('── L396 : validation fiches découpe ──');
has(/✓ Validation fiches découpe<\/button>/,'L396 : onglet renommé « Validation fiches découpe »');
has(/les plus ANCIENNES envoyées tout en haut/,'L396 : file de validation chronologique (anciennes en premier, archive inversée)');
has(/carte ALLÉGÉE \(« trop de données, trop de boutons »\)/,'L396 : carte fiche allégée — détail au tap');

console.log('── L397 : matière NC en m² + bulle plus claire ──');
has(/function ncLoss\(f,fd\)/,'L397 : perte NC calculée (q×w du détail × métrage) — 0 si acceptable/sans dimension');
has(/'Laize NC \(mm\)','Matière NC \(m²\)'/,'L397 : export CSV — 2 colonnes après Détail (fichier Excel Esteban)');
has(/m² en DÉCHET \(perdus\)/,'L397 (scindé L400) : m² au registre — déchet et chutes séparés');
has(/matière NC sur le PDF/,'L397 : perte m² sur le PDF de la fiche');
has(/Explique en quelques mots ce qui se passe/,'L397 : bulle — texte d invitation clair');

console.log('── L398 : lame qui suit, bouton mono qui dit vrai, singulier ──');
has(/la LAME d'en-tête suit la machine de la réf validée/,'L398 : fNumLame rempli aussi au chemin MULTI (validation de réf)');
has(/function _l398SyncPlanBtn/,'L398 : bouton mono dynamique ✓ Valider ↔ 🔄 Changement plan');
has(/le useful GRAVÉ dans les lignes à la génération/,'L398 : critère fiable (la saisie fiche propage au plan en continu — comparer fiche\/plan était toujours vrai)');
has(/Contrôle 2ᵉ bobineau <span/,'L398-L399 : singulier « 2ᵉ bobineau » (label devenu Contrôle)');
absent(/2ème bobineaux|2ᵉ bobineaux/,'L398 : plus aucun pluriel « bobineaux » sur le test 2ᵉ');

console.log('── L399 : le panneau DÉFAUT sépare contrôle et défauts (audit) ──');
has(/✔ Contrôle 2ᵉ bobineau/,'L399 : le contrôle obligatoire n est plus étiqueté « défaut »');
has(/⚠ Saisie des non-conformités/,'L399 (renommé L400) : famille défauts nommée');
has(/⚠ Test NC/,'L399 : la puce du test se distingue des NC réelles');
has(/famille CONTRÔLE = bleu/,'L399 : code couleur bleu contrôle / rouge défauts');
has(/badge distinct : défaut réel vs test non conforme/,'L399 : badge du volet différencié');

console.log('── L400 : règles NC Esteban (24/08) ──');
has(/⚠ Saisie des non-conformités/,'L400 : titre « Saisie des non-conformités »');
has(/la NC se CHIFFRE : quantité \+ laize obligatoires/,'L400 : 2 cases obligatoires (→ m² exacts)');
has(/DÉCHET automatique \(physiquement irrécupérable\)/,'L400 : angle/casse = déchet auto, largeur = choix, sans NC = zone masquée');
has(/label\.nc-check\.ras,label\[id\^="nc_qty_"\]\{display:none!important\}/,'L400 : puces R.A.S. et Qté retirées de la saisie');
has(/>Cerclage<\/button>/,'L400 : puce rapide Cerclage');
absent(/Largeur hors tolérance|Quantité manquante/,'L400 : puces rapides obsolètes retirées');
has(/m² en DÉCHET \(perdus\)/,'L400 : registre — déchet (perdu) ≠ chutes (réutilisables), chacun en m²');
has(/saisie structurée \(qty\+laize\) prioritaire/,'L400 : ncLoss utilise la saisie chiffrée d abord');
has(/le libellé disparaît en paysage \(place au plan\)/,'L400 : titre Plan de découpe retiré en paysage');
has(/case inutile \(la réf est déjà dans le plan\)/,'L400 : modale sauvegarder sans champ référence');

console.log('── L401 : action auto réversible + défaut compact + multi-clients ──');
has(/on note que c'est NOUS qui l'avons posé/,'L401 : le déchet AUTO se retire quand angle/casse sont décochés (bug Esteban) — le choix manuel est préservé');
has(/DÉFAUT en petit — la place au ✂/,'L401 : bouton DÉFAUT compact en paysage');
has(/m² de matière NC par mois/,'L401 : graphique mensuel déchets vs chutes au registre');
has(/résolution tolérante : « AGOFORM ALLEMAGNE » matche/,'L401 : packaging multi-client trouvé même avec suffixe');
has(/function _l402CliRecaps/,'L401 : « Sa commande » (bobineaux × laizes) sous chaque client');

console.log('── L402 : NC compact + % + pédagogies retirées ──');
has(/bulle « 1 TAP = COUPÉE \+ TEST OK » retirée/,'L402 : bulle 1-TAP retirée');
has(/sous-texte retiré — juste DÉFAUT/,'L402 : « bobine non conforme ? → ici » retiré');
has(/panneau NC COMPACT : on voit encore l'écran derrière/,'L402 : panneau NC compact');
has(/\(perdus\)<\/div><\/div>/,'L402 : tuiles déchet/chutes avec pourcentage');

console.log('── L403 : pré-vol chrono, série retirée, recharger direct ──');
has(/✂ Stock d'abord/,'L403-L405 : bandeau pré-vol court (stock + mère) avant le 1er lancement');
has(/gamification retirée de l'écran/,'L403 : badge SÉRIE retiré');
has(/Départ affûtage/,'L403 : libellé « Départ affûtage »');
has(/Recharger s'applique DIRECT/,'L403 : mise à jour sans confirm');

console.log('── L405 : pré-vol sans pop-up ──');
has(/le confirm natif « BOBINEAUX ou CHUTES \? » disparaît/,'L405 : pop-up natif du démarrage retiré (le bandeau pré-vol porte le rappel)');
has(/pré-vol court et impactant/,'L405 : bandeau raccourci');

console.log(fail?('\n💥 '+fail+' correctif(s) MANQUANT(S) — revert silencieux ?'):'\n🏆 '+'INTÉGRITÉ AUDIT OK : tous les correctifs L126→L405 présents dans index.html + sw.js');
process.exit(fail?1:0);
