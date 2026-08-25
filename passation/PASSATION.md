# Plan de découpe — passation

**STEP International · août 2026 · d'Esteban à Céline**

> 📄 **Version illustrée, à lire en priorité :** l'artefact « Passation Plan de découpe ».
> Ce fichier-ci en est la copie texte, pour que Claude puisse la lire à chaque session.

---

## Le logiciel en 30 secondes

STEP achète des **bobines mères** de film adhésif chez B+K et les redécoupe en bobineaux
pour les clients. Le logiciel répond à : *comment découper cette bobine en perdant le moins
de matière possible ?* Puis il accompagne l'opérateur et enregistre la traçabilité ISO 9001.

Il tourne tous les jours sur 3 tablettes, devant **FEBA**, **MAVEG** et **CEVENINI**.
En ligne à `step-international.github.io/step-plan-decoupe`.

**Trois écrans :** ✂️ Plan (le calcul) · 📋 Fiche de découpe (l'atelier) · 📊 Données (le pilotage).

---

## Les 3 règles d'or

1. **Une seule demande à la fois** — vérifier que la première marche avant d'enchaîner.
2. **Jamais pendant une découpe** — publier le matin tôt, à midi ou en fin de journée.
3. **Dans le doute, on ne publie pas** — hors zone verte, on appelle Esteban.

---

## 🟢 Zone verte — Céline le fait seule

Ces modifications ne touchent qu'à des listes, jamais au calcul.

- Ajouter un client, avec ses références habituelles
- Ajouter ou modifier une référence produit
- Modifier une règle d'emballage d'un client
- Corriger un texte, un libellé, une faute
- Ajouter quelqu'un aux mails de signalement

## 🔴 Zone rouge — appeler Esteban

- Le calcul du plan et la perte matière (11 fonctions gelées, vérifiées)
- Les impressions, PDF et étiquettes — documents qualité ISO
- L'affichage tablette en position verticale (portrait)
- Les `confirm()` de sécurité
- Les comptes, les droits, Firebase

**Repère :** si la demande contient *calcul, perte matière, impression, étiquette, PDF,
portrait, sécurité, compte, droits* → rouge.

---

## Comment demander

Céline ne tape aucune commande et ne lit aucun code. Elle ouvre Claude et parle en français.

- **Ajouter un client :** « Ajoute le client DUPONT INDUSTRIE avec la référence
  41117500 — SK 6008AD32, largeur 2100 mm, longueur 1000 m. Vérifie la syntaxe, puis mets en ligne. »
- **Avant publication :** « Vérifie la syntaxe, incrémente le numéro de version, et dis-moi ce que tu as modifié. »
- **En cas d'hésitation :** « Est-ce que c'est en zone verte ou en zone rouge ? »

### Mise en ligne, pas à pas
1. Choisir le moment (jamais pendant une découpe)
2. Une seule demande à Claude
3. Exiger les vérifications
4. « C'est bon, mets en ligne » → 2 minutes
5. Ouvrir le logiciel soi-même et vérifier
6. Prévenir Dominique de recharger

### Si ça casse
> « Le logiciel est cassé en production. Annule la dernière mise en ligne et remets la version précédente. »

Les tablettes non rechargées gardent l'ancienne version : une publication ratée ne bloque
jamais une découpe en cours.

Si Claude dit *push rejected* → « fais un `git pull --rebase`, puis republie. »

---

## Qui peut faire quoi

| Niveau | Qui | Droits |
|---|---|---|
| Administrateur | Esteban, Christian Rozier | Tout, audit et configuration compris |
| Pilote | Dominique Cotte | Stock, corrections, suppressions |
| Opérateur | Jordan, Taïeb, +1 compte | Fiches et saisie de production |
| Compte machine | `feba@` `maveg@` `cevenini@` | Compte partagé d'une tablette |

Ajouter ou retirer quelqu'un = créer le compte dans Firebase **puis** autoriser son UID dans
`firestore.rules` et publier les règles en console. Réservé à Esteban ou Christian.

⚠️ `data/Code.docx` est périmé : Dominique y est « opérateur » alors qu'il est **pilote**,
et le 3ᵉ compte opérateur n'y figure pas.

---

## Firebase — état vérifié en août 2026

Projet `plan-de-decoupe` sur un **compte STEP International**, **formule payante au nom de
l'entreprise**, console accessible à **Esteban et Christian** y compris après le départ d'Esteban.
Clé `ANTHROPIC_API_KEY` (assistant de la bulle 💬) sur le **compte Anthropic de l'entreprise**.

La bulle fait deux choses : elle **envoie un mail** (toujours, sans clé) et elle **ouvre une
discussion d'aide** avec Claude (nécessite la clé). Si la clé tombe, seule la discussion s'arrête.

---

## Sauvegardes — en place depuis le 25/08/2026

✅ **Fait, plus rien à faire.** Trois protections actives sur la base Firestore :

| Protection | Portée |
|---|---|
| Récupération à un moment précis | les **7 derniers jours, à la minute près** |
| Sauvegarde quotidienne | copie complète chaque jour, conservée **7 jours** |
| Sauvegarde hebdomadaire | copie complète chaque **vendredi**, conservée **98 jours** (14 semaines) |

Console Firebase → `plan-de-decoupe` → **Firestore** → onglet **Reprise après sinistre**.

**En cas de perte de données :** ne rien réécrire — chaque écriture supplémentaire complique la
restauration. Prévenir Esteban ou Christian, puis restaurer depuis cette page. Une restauration
**remplace** l'état actuel : tout ce qui a été saisi depuis le point choisi est perdu. D'où la règle :
plus on agit vite, moins on perd.

## À faire

### Un jour : sortir `CLIENT_DATA` du code

Les 85 clients et les 19 règles d'emballage sont écrits **dans `index.html`**, pas dans la base.
C'est pour ça qu'ajouter un client oblige à republier le logiciel entier. Les déplacer vers
Firestore rendrait ces modifications immédiates, sans publication ni risque.
Plusieurs jours de travail — **à faire tranquillement, pas avant la passation**.

---

## Notes techniques (PC Windows)

- Réglages Git en place dans `claude index\` : `core.autocrlf false` (sinon `index.html` est
  corrompu), `core.protectNTFS false`, sparse-checkout excluant `site internet ` (espace final
  dans le nom = chemin illégal sous Windows).
- **La batterie de tests fonctionne ici depuis le 24/08/2026** (16/16 vérifié), après avoir rendu
  portables 16 fichiers de `tests/` et le chemin de Chrome de `shot.mjs` / `sim200.mjs`.
  ⚠️ Mais elle est **lente** : ~25 min, contre quelques secondes sur le Mac — chaque test relit
  2,2 Mo à travers le partage réseau. L'exiger avant chaque publication n'est pas réaliste au
  quotidien : réserver la batterie complète aux modifications qui touchent autre chose qu'une liste.
- **Python 3.13 est installé** : la checklist du dépôt s'applique telle quelle (l'étape 1 a été
  rendue portable, l'étape 5 « miroir » est à sauter — elle ne concerne que le Mac).
- **Publication en liste blanche** : seuls `index.html`, `manifest.json` et `sw.js` sont servis sur
  le web. Tout nouveau fichier utile à l'app doit être ajouté au `cp` de `.github/workflows/static.yml`.
