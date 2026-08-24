# Dossier de passation — Logiciel « Plan de découpe »

**STEP International · août 2026**
Rédigé par Esteban avant transmission à Céline.

---

## En une page

Le logiciel **Plan de découpe** calcule comment découper une bobine mère en bobineaux
en perdant le moins de matière possible, puis accompagne l'opérateur pendant la découpe
et enregistre la traçabilité qualité (ISO 9001).

Il est utilisé **tous les jours en atelier**, sur 3 tablettes iPad, devant les machines
**FEBA**, **MAVEG** et **CEVENINI**.

- **Adresse du logiciel :** https://step-international.github.io/step-plan-decoupe/
- **Version en service :** visible en bas de l'écran « Données »
- **Développé de mai à août 2026**, par Esteban, avec Claude.

---

## Les 4 documents et quand les lire

| Document | Pour qui | Quand |
|---|---|---|
| **01 — Fiche terrain opérateurs** | Dominique, Jordan, Taïeb | À imprimer et laisser près des machines |
| **02 — Guide du logiciel** | Céline | À lire en premier, une fois, tranquillement |
| **03 — Comptes et sécurité** | Céline | Quand il faut ajouter ou retirer quelqu'un |
| **04 — Modifier et mettre en ligne** | Céline | **À chaque fois** qu'une modification est demandée |

---

## Les 3 règles d'or

### 1. Une seule demande à la fois
Ne jamais enchaîner plusieurs modifications avant d'avoir vérifié que la première
fonctionne en atelier. Si quelque chose casse, on doit pouvoir dire quoi l'a cassé.

### 2. Ne jamais publier pendant une découpe en cours
Une mise en ligne fait apparaître une bannière « Recharger » sur les 3 tablettes.
Un opérateur au milieu d'une bobine n'a pas à voir ça. Publier le matin tôt,
le midi, ou en fin de journée.

### 3. En cas de doute, on ne publie pas
Le document **04** décrit précisément ce qui est sûr et ce qui ne l'est pas.
Tout ce qui n'est pas explicitement dans la zone verte se traite avec Esteban.

---

## En cas d'urgence

**Le logiciel ne s'ouvre plus / affiche n'importe quoi en atelier :**

1. Faire recharger la page sur la tablette (tirer l'écran vers le bas).
2. Si ça ne suffit pas, ouvrir Claude sur le PC et dire exactement :
   > « Le logiciel est cassé en production. Annule la dernière mise en ligne
   > et remets la version précédente. »
   Claude sait faire — c'est prévu, ça prend 2 minutes.
3. Prévenir l'atelier : en attendant, les tablettes qui n'ont **pas** rechargé
   continuent de fonctionner normalement (le logiciel garde sa version en mémoire).

**Rien n'est jamais perdu.** Chaque version du logiciel est archivée automatiquement.
On peut toujours revenir en arrière.

---

## Où se trouvent les choses

| Quoi | Où |
|---|---|
| Le logiciel (code) | `K:\...\claude\claude index\` — copie de travail sur ce PC |
| Ce dossier de passation | `K:\...\claude\passation\` |
| Consignes techniques pour Claude | `claude index\CLAUDE.md` — **fait autorité, ne pas contredire** |
| Anciens documents, référentiels Excel | `K:\...\claude\data\` |
| Historique complet des modifications | Sur GitHub, compte `step-international` |
