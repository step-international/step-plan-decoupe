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
has(/if\(!bandHtml\) return;/,'L224 : bande verte de réf supprimée (séparateur rendu SEULEMENT au changement de machine)');
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
has(/function _fichePlanDriftCheck\(\)/,'L221 : détecteur de dérive plan→fiche présent');
has(/id="planDriftBanner"/,'L221 : bannière de dérive dans la page Fiche');
has(/if\(typeof _fichePlanDriftCheck==='function'\) _fichePlanDriftCheck\(\);/,'L221 : check branché sur l\'arrivée onglet Fiche (showPage 1)');
has(/if\(lines\.some\(engagedOf\)\) return;/,'L221 : réf ENGAGÉE jamais signalée (le travail terrain prime — zéro faux positif)');
has(/function _applyPlanDriftFix\(\)\{[\s\S]{0,400}?recalcEcartsFromFiche\(\{force:true\}\)/,'L221 : bouton bannière route vers recalcEcartsFromFiche({force:true}) — chemin éprouvé qui conserve les coupées');
has(/_applyPlanDriftFix\(\)\{\n?\s*if\(typeof _shareCurrentDocId==='function'&&_shareCurrentDocId\(\)\)/,'L221 : garde partage AVANT toute mutation (verrous cuts par position protégés)');

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
has(/'JF':'#a3e635','MT':'#f59e0b','DC':'#e879f9','ER':'#f87171','CH':'#10b981'/,'R5 : palette opérateurs — JF/CH séparés (lime vs émeraude), plus AUCUNE identité avec les couleurs machine');
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

console.log(fail?('\n💥 '+fail+' correctif(s) MANQUANT(S) — revert silencieux ?'):'\n🏆 '+'INTÉGRITÉ AUDIT OK : tous les correctifs L126→L146 présents dans index.html + sw.js');
process.exit(fail?1:0);
