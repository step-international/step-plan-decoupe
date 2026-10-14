// fiche_print_l553_test.js — [L553 · demande Dominique via Celine (admin) 14/10/2026] la fiche validee (PDF / apercu / impression)
// etait le SEUL document papier sur fond sombre : body #111 + print-color-adjust:exact → page NOIRE, texte gris clair, bobines
// coupees a moitie effacees. Ce test verifie : (1) le <style> du gabarit est en clair ; (2) la palette papier traduit CHAQUE
// couleur du theme sombre utilisee dans showFicheDetail / buildFichePrintHTML (completude : un nouveau literal sombre ajoute
// plus tard fait rougir ce test) ; (3) le corps du gabarit passe reellement par la palette ; (4) plus d opacity sur les coupees.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const mM=src.match(/^const _L553_PAPIER=(\{[\s\S]*?\n\});/m); if(!mM) throw new Error('introuvable _L553_PAPIER'); global._L553_PAPIER=eval('('+mM[1]+')');
const PAL=eval('('+fnOf('_l553PalettePapier')+')'); global._l553PalettePapier=PAL;
const SRC_SFD=fnOf('showFicheDetail'), SRC_BUILD=fnOf('buildFichePrintHTML');
const KEYS=Object.keys(_L553_PAPIER), VALS=Object.values(_L553_PAPIER);
console.log('── 1. le <style> du gabarit est en clair ──');
ok(/body\{background:#fff;color:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;font-size:14px\}/.test(SRC_BUILD),'body : fond blanc, texte fonce');
ok(!/background:#111;color:#e5e5e3/.test(SRC_BUILD)&&!/\.card\{background:#1a1a18/.test(SRC_BUILD),'plus aucun fond sombre dans le <style> (body, .card)');
ok(/:root\{--red:#b91c1c;--alert:#b91c1c;--green:#166534;--orange:#92400e;--action:#78350f;--blue:#1d4ed8\}/.test(SRC_BUILD),'tokens semantiques FONCES definis dans le gabarit (openPrintWindow n injecte les vifs que si « --red: » est absent)');
ok(/@media print\{body\{padding:12px\}button\{display:none\}html\{filter:grayscale\(1\)!important;-webkit-print-color-adjust:exact;print-color-adjust:exact\}\}/.test(SRC_BUILD),'impression : toujours en niveaux de gris, couleurs forcees conservees (les pastilles N&B de L290 et la pastille machine gardent leur fond)');
console.log('── 2. COMPLETUDE de la palette : chaque literal de couleur des deux fonctions est une cle ou une couleur papier ──');
const ALLOW=new Set(VALS.concat(['#111','#fff','#1a1a1a','#141310','#141414','#fff7e6','#7a5200','#b45309','#4f9df2','#2fb85f','#9b7cf0','#f7f7f6','#b8b8b3','#eeeeea','#999','#555','#6b6b6b','#000','#c7cdd6','#eee','rgba(245,158,11,0.08)']));   /* #000 / #c7cdd6 / #eee : pastilles N&B de cliPrintChip (L290) */   /* #111 / #1a1a1a : un commentaire HTML et des textes fonces, jamais un fond ; #4f9df2 / #2fb85f / #9b7cf0 : fonds des pastilles machine (texte sombre dessus) */
const SRC_CHIP=fnOf('cliPrintChip');
const lits=[...new Set((SRC_SFD+SRC_BUILD+SRC_CHIP).match(/#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])|rgba?\([^)]*\)/g)||[])];
const inconnus=lits.filter(l=>!_L553_PAPIER.hasOwnProperty(l)&&!ALLOW.has(l));
ok(lits.length>=35&&inconnus.length===0,lits.length+' literaux de couleur releves dans showFicheDetail + buildFichePrintHTML + cliPrintChip ; inconnus de la palette : '+(inconnus.length?inconnus.join(', '):'aucun'));
{ /* cliPrintChip garde ses styles dans une table de chaines injectee ensuite dans un attribut : couverte par le rendu PAL(CHIP(x)) ci-dessous */
  const sansStyle=(SRC_SFD+SRC_BUILD).replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,'').replace(/ style="[^"]*"/g,'').replace(/const _cliCol=[^\n]*|const col=OP_COLORS[^\n]*|const machCol=[^\n]*|_L553_PAPIER/g,'');
  const horsPortee=[...new Set(sansStyle.match(/#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])|rgba?\([^)]*\)/g)||[])].filter(c=>!ALLOW.has(c)||/^#(3d|3a|10|14|33|1f|22|2a)/.test(c));
  ok(horsPortee.length===0&&!/[^ ]style="|style\s+=|bgcolor|<font/.test(SRC_SFD+SRC_BUILD),'PORTEE : hors des attributs style="…" (et hors commentaires et tables de couleurs), les deux fonctions ne portent AUCUNE couleur sombre — tout ce qui est traduit est atteignable par la passe → '+(horsPortee.length?horsPortee.join(', '):'ok')); }
ok(KEYS.length>=32&&KEYS.every(k=>/^#[0-9a-f]{3,6}$|^rgba\(/.test(k)),KEYS.length+' entrees dans la palette, toutes des couleurs');
// couleurs fournies A L EXECUTION (pas dans le texte des deux fonctions) : clients, operateurs, pastille machine
const mCli=src.match(/^const CLI_COLORS=(\{[^\n]*\});/m), mOp=src.match(/^const OP_COLORS=(\{[^\n]*\});/m), mMach=SRC_SFD.match(/const machCol=(\{[^}]*\})\[machLbl\]\|\|'(#[0-9a-f]{3,6})'/);
ok(!!mCli&&!!mOp&&!!mMach,'tables d execution trouvees : CLI_COLORS, OP_COLORS, machCol');
const RUN=[].concat(Object.values(eval('('+mCli[1]+')')),Object.values(eval('('+mOp[1]+')')));
const runInconnus=[...new Set(RUN)].filter(c=>!_L553_PAPIER.hasOwnProperty(c)&&!ALLOW.has(c));
ok(runInconnus.length===0,'COMPLETUDE a l execution : chaque couleur de client (A/B/C/D/+) et d operateur (JF, TB, MR, MT, DC, ER, CH, ?) est traduite ou deja papier → inconnues : '+(runInconnus.length?runInconnus.join(', '):'aucune'));
// CONTRASTE WCAG (couleur) et en NIVEAUX DE GRIS (le @media print applique grayscale(1)) — jamais sous 4,5:1 sur un document que Dominique lit en N&B
const hex=c=>{ let h=String(c).replace('#',''); if(h.length===3) h=h.split('').map(x=>x+x).join(''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255); };
const lin=v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);
const Y=c=>{ const [r,g,b]=hex(c); return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b); };
const Ygris=c=>{ const [r,g,b]=hex(c); return lin(0.2126*r+0.7152*g+0.0722*b); };
const ratio=(a,b,f)=>{ const x=f(a), y=f(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
const PASTILLES=Object.values(eval('('+mMach[1]+')')).concat([mMach[2]]);
ok(PASTILLES.every(c=>ratio('#141310',c,Y)>=4.5&&ratio('#141310',c,Ygris)>=4.5),'pastille machine : texte #141310 lisible sur chacun des 4 fonds (FEBA, MAVEG, CEVENINI, defaut #a78bfa), en couleur et en gris → '+PASTILLES.map(c=>c+' '+ratio('#141310',c,Ygris).toFixed(1)).join(' · '));
const PAIRES=[['#166534','#e2f5e8','badge RAS'],['#b91c1c','#fde2e2','badge NC'],['#92400e','#fff3d6','bandeau lame / ecart'],['#1e3a8a','#e3eefb','bandeau relais'],['#be185d','#fbe4ef','bandeau partage'],['#4b5563','#eceff3','bandeau multi-clients'],['#111','#f7f7f6','texte carte'],['#555','#f7f7f6','libelles'],['#6b6b6b','#f7f7f6','tirets —'],['#166534','#f7f7f6','vert sur carte'],['#92400e','#f7f7f6','orange sur carte'],['#1d4ed8','#f7f7f6','bleu'],['#6d28d9','#f7f7f6','violet'],['#854d0e','#f7f7f6','client A'],['#155e75','#f7f7f6','client C'],['#5b21b6','#f7f7f6','client D'],['#3f6212','#f7f7f6','op JF'],['#a21caf','#f7f7f6','op DC'],['#065f46','#f7f7f6','op CH']];
const faibles=PAIRES.filter(p=>ratio(p[0],p[1],Y)<4.5||ratio(p[0],p[1],Ygris)<4.5).map(p=>p[2]+' ('+ratio(p[0],p[1],Y).toFixed(2)+' / gris '+ratio(p[0],p[1],Ygris).toFixed(2)+')');
ok(faibles.length===0,PAIRES.length+' paires texte/fond du papier a 4,5:1 ou plus, en couleur ET en gris → faibles : '+(faibles.length?faibles.join(', '):'aucune'));
const SOMBRES=['#e5e5e3','#2a2a28','#222','#3d2a00','#3a2e0a','#102a40','#3d1414','#14371f','#331021','#141d10','#1f2937'];
ok(SOMBRES.every(k=>KEYS.indexOf(k)>=0),'les fonds et textes du theme sombre (body, cartes, bandeaux lame / machine / relais / ecart / partage / clients, badges NC et RAS) sont tous traduits');
console.log('── 3. la palette traduit, sans chainage, et le corps du gabarit y passe ──');
const frag='<tr style="border-bottom:1px solid #2a2a28"><td style="color:#a78bfa">Bobine 1</td><td style="color:#60a5fa">1200 mm</td><td style="color:#888">Perte 60</td><span style="background:#14371f;color:#4ade80">RAS</span><span style="background:#3d1414;color:var(--red)">NC</span><span style="color:#555">—</span><div style="background:#3a2e0a;color:#f59e0b">LAME</div><div style="background:#102a40;color:#9ecbf0">RELAIS</div><span style="border:1px solid rgba(255,255,255,.4);color:#141414;background:#4f9df2">A</span><div style="background:#fff7e6;color:#7a5200">chutes stock</div></tr>';
const out=PAL(frag);
ok(out.indexOf('color:#111')<0&&out.indexOf('color:#6d28d9')>=0&&out.indexOf('color:#1d4ed8')>=0&&out.indexOf('background:#e2f5e8;color:#166534')>=0&&out.indexOf('background:#fde2e2;color:var(--red)')>=0&&out.indexOf('background:#fff3d6;color:#92400e')>=0&&out.indexOf('background:#e3eefb;color:#1e3a8a')>=0,'violet, bleu, badge RAS, badge NC, bandeau lame, bandeau relais → couleurs papier');
ok(out.indexOf('color:#555">Perte')>=0&&out.indexOf('color:#6b6b6b">—')>=0,'SANS chainage : #888 → #555 et #555 → #6b6b6b en une seule passe (un #888 ne finit pas en #6b6b6b)');
ok(PAL('<td style="color:#888">CDE #555 · note #222</td><!-- fond #111 -->')==='<td style="color:#555">CDE #555 · note #222</td><!-- fond #111 -->','la palette ne touche QUE les attributs style="…" : le texte saisi et les commentaires HTML ne sont jamais reecrits (document qualite : contenu inchange)');
ok(PAL('<span style="color:#eab308;border:1px solid #22d3ee">[A]</span><span style="border:1px solid #a3e635;color:#a3e635;background:rgba(0,0,0,.25)">✂ JF</span>')==='<span style="color:#854d0e;border:1px solid #155e75">[A]</span><span style="border:1px solid #3f6212;color:#3f6212;background:transparent">✂ JF</span>','clients A / C et operateur JF (couleurs d execution) → couleurs papier ; le fond noir translucide du chip devient transparent');
ok(!/style='/.test(SRC_SFD+SRC_BUILD),'tous les styles inline des deux fonctions sont entre guillemets doubles (la passe ne les manquerait pas)');
ok(out.indexOf('rgba(0,0,0,.35)')>=0&&out.indexOf('rgba(255,255,255,.4)')<0,'la bordure blanche de la pastille client devient foncee (invisible sur blanc sinon)');
ok(out.indexOf('background:#fff7e6;color:#7a5200')>=0&&out.indexOf('background:#4f9df2')>=0&&out.indexOf('color:#141414')>=0,'les couleurs deja « papier » (bandeau chutes en stock, pastille machine, texte sombre sur pastille) sont INCHANGEES');
{ global.esc=global.esc||(s=>String(s==null?'':s)); const CHIP=eval('('+SRC_CHIP+')'); const chips=['A','B','C','D','E'].map(x=>CHIP(x));
  ok(chips.slice(0,4).every(h=>PAL(h)===h),'pastilles client N&B (cliPrintChip L290, le VRAI chemin) : A, B, C, D ressortent byte-identiques de la passe (noir / blanc / gris)');
  ok(/border:2px solid #555/.test(PAL(chips[4])),'pastille de repli (client inconnu) : sa bordure #888 devient #555, foncee'); }
ok(SOMBRES.every(k=>PAL(out).indexOf(k)<0),'une 2e passe ne reintroduit aucun fond sombre');
// le vrai buildFichePrintHTML, avec des fragments qui portent les couleurs du theme sombre
global.esc=s=>String(s==null?'':s); global._l471FicheM2=()=>0; global._l513MatiereOf=()=>({ok:false}); global._l513M2=v=>(v==null?'—':String(v)); global.parseNum=v=>Number(v)||0; global.fmt=v=>String(v); global.ficheBLs=()=>[]; global.safeUrl=u=>u; global.readCommandeFiles=()=>[]; global.getMachineLabel=m=>m;
const BUILD=eval('('+SRC_BUILD+')');
const d={f:{name:'Test L553',client:'Client',date:'2026-10-14T10:00:00Z',totalBobines:2,ini:'JF',ref:'KX1006-1',machine:'MAVEG',mother:1260,useful:1200,blade:1,longueur:1000,lame:'12',numJour:'1',tempsStr:'1 h 12',valide:true,rows:[{qty:2,width:100}],ficheDetail:[]},
  ecartBanner:'<div style="background:#3d2a00;border:2px solid #f59e0b;color:#f59e0b">ECART <div style="color:#fbbf24">x</div></div>',partageBanner:'<div style="background:#331021;color:#f472b6"><div style="color:#f9a8d4">p</div></div>',op2Line:'',machLbl:'MAVEG',machCol:'#2fb85f',pkgLine:'',notesLine:'',
  planRows:frag,horsPlanRows:'<tr style="background:rgba(245,158,11,0.08)"><td style="background:#3d2a00;color:#f59e0b">HORS PLAN</td></tr>',shareCol:false,cliBanner:'<div style="background:#1f2937;border:2px solid #9ca3af;color:#e5e5e3"><div style="color:#9ca3af">c</div></div>',cliRecapCard:'<div style="color:#888">r</div>',cliCol:false};
const html=BUILD(d);
const body=html.slice(html.indexOf('<body>')).replace(/<!--[\s\S]*?-->/g,'');   /* les commentaires HTML du gabarit (ex. « couleur EN DUR #f59e0b », L132) ne sont PAS des couleurs affichees : la palette les laisse, le test les ignore */
const restent=KEYS.filter(k=>k!=='#555'&&body.indexOf(k)>=0);
ok(restent.length===0,'corps du gabarit genere : plus AUCUNE couleur du theme sombre (hors #555, qui est aussi une couleur papier) → '+(restent.length?restent.join(', '):'ok'));
ok(html.indexOf('<style>')>=0&&html.indexOf('background:#fff;color:#111')>=0&&html.indexOf(':root{--red:#b91c1c')>=0,'en-tete : style clair + tokens fonces presents dans le document genere');
ok(body.indexOf('color:#141310;background:#2fb85f')>=0,'la pastille machine garde sa couleur et son texte sombre');
{ const d2=Object.assign({},d,{machLbl:'',machCol:'#a78bfa'}); const b2=BUILD(d2); ok(b2.indexOf('color:#141310;background:#a78bfa')>=0&&b2.indexOf('__MACHCOL553__')<0,'machine vide / inconnue : la pastille par defaut #a78bfa reste CLAIRE sous son texte sombre (posee apres la passe, aucun placeholder residuel)'); }
ok(/border:1px solid #92400e;border-top:0">🔪 CHANGEMENT DE LAME/.test(PAL('<div style="background:#3a2e0a;color:#f59e0b;border:1px solid #f59e0b;border-top:0">🔪 CHANGEMENT DE LAME'))&&/border:1px solid #f59e0b;border-top:0/.test(SRC_SFD)&&/border:1px solid #60a5fa;border-top:0/.test(SRC_SFD)&&/border:1px solid #f87171;border-top:0/.test(SRC_SFD),'decision 3c dans le tableau aussi : les bandeaux LAME / RELAIS / MACHINE ont un cadre a bordure foncee');
ok(body.indexOf('border:1px solid #999;background:#eeeeea;color:#111;font-size:13px;cursor:pointer">🖨 Imprimer')>=0,'le bouton Imprimer de l apercu est passe en clair (il etait #222 / #e5e5e3)');
console.log('── 4. les bobines coupees ne sont plus estompees ──');
ok(!/';opacity:\.5':''/.test(SRC_SFD)&&!/';opacity:\.6':''/.test(SRC_SFD)&&!/opacity:\.[56]/.test(SRC_SFD),'plus d opacity .5 / .6 sur les lignes coupees et hors plan (sur une fiche validee, TOUT le tableau etait a moitie efface)');
ok(/✓ Coupée/.test(SRC_SFD),'le statut « ✓ Coupée » reste ecrit en toutes lettres dans la colonne Etat');
console.log('── 5. jumeaux : les autres documents papier etaient deja sur fond blanc ──');
ok(/function printKpiMois[\s\S]{0,1500}color:#111;padding:6mm/.test(src),'KPI mensuel : deja en clair (L79 · AN-6)');
ok((src.match(/body\{background:#111;color:#e5e5e3/g)||[]).length===0,'plus aucun gabarit d impression avec body sombre dans le fichier');
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 FICHE PRINT L553 OK : '+total+' verifications'));
process.exit(fail?1:0);
