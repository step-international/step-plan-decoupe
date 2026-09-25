// build_public.mjs — [L537 · outillage 24/09/2026] construit _site/ : le fichier PUBLIE = le source MOINS les commentaires.
// Pourquoi : index.html est servi publiquement par GitHub Pages ; ses commentaires (26 000 lignes de journal de
// bord) citent des clients, des salaries, des incidents. La version de travail du depot les GARDE ; seul le
// fichier servi aux tablettes en est prive. Le CODE n est pas touche d un octet hors commentaires. Les commentaires
// HTML ecrits DANS des chaines JS (gabarits d ecran) sont du code : ils restent (les retirer changerait le DOM).
// Preuve embarquee : chaque bloc <script> est reparse (acorn, vendore dans tests/vendor/) et son ARBRE
// SYNTAXIQUE doit etre identique avant/apres (positions exclues) ; zero commentaire restant ; blocs <style>
// aux accolades equilibrees ; aucun <!-- --> hors script. Toute difference = sortie 1, rien n est ecrit.
// Usage : node tests/build_public.mjs [--out DIR]   (defaut : _site/ a la racine du depot)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from './vendor/acorn.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : join(ROOT, '_site');
const POS = new Set(['start', 'end', 'loc', 'range']);
const noPos = (k, v) => POS.has(k) ? undefined : (v instanceof RegExp ? String(v) : v);

// JS : retrait des commentaires par positions exactes du parseur (jamais par regex : chaines, regex literales,
// gabarits `${}` contiennent des // et /* legitimes). Un commentaire bloc multi-ligne vaut un retour a la ligne
// (il compte comme LineTerminator pour l insertion automatique de point-virgule : `return /*\n*/ x`), un
// commentaire bloc sur une ligne vaut une espace (`a/**/b` ne doit pas devenir `ab`).
function stripJs(code, label) {
  const comments = [];
  const opts = { ecmaVersion: 'latest', sourceType: 'script', onComment: comments, locations: false };
  const before = acorn.parse(code, opts);
  let out = '', pos = 0;
  for (const c of comments.sort((a, b) => a.start - b.start)) {
    out += code.slice(pos, c.start);
    if (c.type === 'Block' && c.value[0] === '!') { out += code.slice(c.start, c.end); pos = c.end; continue; }   // /*! … */ : avis de licence (html2canvas MIT), conserves comme le font les minifieurs
    out += c.type === 'Line' ? '' : (( /[\n\r]/.test(c.value) || c.value.includes(String.fromCharCode(0x2028)) || c.value.includes(String.fromCharCode(0x2029)) ) ? '\n' : ' ');
    pos = c.end;
  }
  out += code.slice(pos);
  const rest = [];
  const after = acorn.parse(out, { ...opts, onComment: rest });
  if (rest.some(c => !(c.type === 'Block' && c.value[0] === '!'))) throw new Error(`${label} : commentaire(s) restant(s) apres retrait (hors avis de licence /*! */)`);
  if (JSON.stringify(before, noPos) !== JSON.stringify(after, noPos)) throw new Error(`${label} : l arbre syntaxique a CHANGE apres retrait des commentaires — rien n est publie`);
  return { out, removed: comments.length };
}
// CSS : /* */ hors chaines (les chaines CSS peuvent contenir /* dans un content:).
function stripCss(css, label) {
  let out = '', i = 0, removed = 0;
  while (i < css.length) {
    const ch = css[i];
    if (ch === '"' || ch === "'") { let j = i + 1; while (j < css.length && css[j] !== ch) { if (css[j] === '\\') j++; j++; } out += css.slice(i, j + 1); i = j + 1; continue; }
    if (ch === '/' && css[i + 1] === '*') { const j = css.indexOf('*/', i + 2); if (j < 0) throw new Error(`${label} : commentaire CSS non ferme`); removed++; i = j + 2; continue; }
    out += ch; i++;
  }
  const open = (out.match(/\{/g) || []).length, close = (out.match(/\}/g) || []).length;
  if (open !== close) throw new Error(`${label} : accolades desequilibrees apres retrait (${open} / ${close})`);
  if (/\/\*/.test(out)) throw new Error(`${label} : /* restant`);
  return { out, removed };
}
// HTML : on decoupe en segments script / style / reste ; chaque segment est traite par son propre outil.
function buildHtml(html, label) {
  const re = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  let out = '', pos = 0, m, n = { js: 0, css: 0, html: 0, scripts: 0, styles: 0 };
  const htmlPart = s => { const r = s.replace(/<!--[\s\S]*?-->/g, () => { n.html++; return ''; }); if (/<!--/.test(r)) throw new Error(`${label} : <!-- restant hors script`); return r; };
  while ((m = re.exec(html))) {
    out += htmlPart(html.slice(pos, m.index));
    const [whole, tag, attrs, body] = m;
    if (tag === 'script') {
      if (/\bsrc\s*=/.test(attrs) || !body.trim()) out += whole;   // SDK externes : rien a retirer
      else { n.scripts++; const r = stripJs(body, `${label} <script> n°${n.scripts}`); n.js += r.removed; out += `<script${attrs}>${r.out}</script>`; }
    } else { n.styles++; const r = stripCss(body, `${label} <style> n°${n.styles}`); n.css += r.removed; out += `<style${attrs}>${r.out}</style>`; }
    pos = m.index + whole.length;
  }
  out += htmlPart(html.slice(pos));
  return { out, n };
}

mkdirSync(OUT, { recursive: true });
const src = readFileSync(join(ROOT, 'index.html'), 'utf8');
const h = buildHtml(src, 'index.html');
const ver = (src.match(/APP_VERSION='([^']*)'/) || [])[1], ver2 = (h.out.match(/APP_VERSION='([^']*)'/) || [])[1];
if (!ver || ver !== ver2) throw new Error('APP_VERSION introuvable ou modifiee par la construction');
writeFileSync(join(OUT, 'index.html'), h.out);
const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const s = stripJs(sw, 'sw.js');
writeFileSync(join(OUT, 'sw.js'), s.out);
copyFileSync(join(ROOT, 'manifest.json'), join(OUT, 'manifest.json'));
copyFileSync(join(ROOT, 'robots.txt'), join(OUT, 'robots.txt'));   /* [L539] demande de ne pas etre indexe, en plus de la balise meta */
for (const f of readdirSync(ROOT)) if (/^icon-.*\.png$/.test(f)) copyFileSync(join(ROOT, f), join(OUT, f));
console.log(`🏆 fichier public construit dans ${OUT} — ${ver} — index.html : ${h.n.scripts} scripts (${h.n.js} commentaires JS retires), ${h.n.styles} styles (${h.n.css} CSS), ${h.n.html} commentaires HTML ; ${(src.length / 1024).toFixed(0)} Ko → ${(h.out.length / 1024).toFixed(0)} Ko ; sw.js : ${s.removed} commentaires retires. Arbres syntaxiques identiques avant/apres.`);
