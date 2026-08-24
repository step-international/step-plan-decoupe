# Guide du logiciel — pour la personne qui reprend

À lire **une fois, tranquillement**, avant de toucher à quoi que ce soit.
Aucune connaissance technique nécessaire.

---

## À quoi ça sert

STEP International achète des **bobines mères** de film adhésif (TacFlex®, SK…)
au fournisseur **B+K**, et les redécoupe en **bobineaux** plus étroits pour les clients.

Le logiciel répond à une question : *« comment découper cette bobine mère pour
servir la commande en perdant le moins de matière possible ? »*

Puis il accompagne l'opérateur pendant la découpe et enregistre tout ce que la
norme **ISO 9001** exige de tracer.

---

## Les 3 écrans

En haut de l'application, trois onglets.

### ✂️ Plan
L'écran de **calcul**. On saisit le client, la référence, les largeurs demandées et
les quantités. Le logiciel propose la meilleure combinaison de coupes, affiche la
perte matière, et prépare le travail machine par machine.

### 📋 Fiche de découpe
L'écran de **l'atelier**. C'est ce que l'opérateur a sous les yeux pendant qu'il coupe :
bobine en cours, bobineaux à faire, contrôles à cocher, non-conformités, chronomètre.
C'est aussi l'enregistrement qualité qui remplace la fiche papier.

### 📊 Données
L'écran de **pilotage**, réservé aux responsables. Il contient plusieurs sections :

| Section | Contenu |
|---|---|
| **Analyse** | Indicateurs : bobines de la semaine, perte matière, top clients, débit m²/h |
| **Brouillons** | Travaux en cours sur chaque tablette — permet de reprendre une découpe |
| **Fiches** | Toutes les fiches de découpe terminées (l'archive qualité) |
| **Planning** | Les plans à couper, triés par date de livraison la plus proche |
| **Stock** | Articles et mouvements de stock |
| **Maintenance** | Suivi des machines et des lames |
| **Saves** | Plans sauvegardés |
| **Audit** | Journal des actions sensibles — réservé aux administrateurs |
| **Corbeille** | Éléments supprimés, récupérables |

---

## Qui a le droit de faire quoi

Le logiciel distingue **quatre niveaux**. Ce n'est pas un réglage dans l'application :
c'est inscrit dans les règles de sécurité côté serveur (voir document **03**).

| Niveau | Qui | Peut faire |
|---|---|---|
| **Administrateur** | Esteban, Christian Rozier | Tout, y compris consulter le journal d'audit et modifier la configuration |
| **Pilote** | Dominique Cotte | Gérer le stock, supprimer, corriger — tout sauf l'administration |
| **Opérateur** | Jordan, Taïeb (+ 1 autre compte) | Créer et remplir des fiches, saisir la production |
| **Compte machine** | `feba@` · `maveg@` · `cevenini@` | Compte partagé de la tablette posée devant chaque machine |

> ⚠️ **Le `Code.docx` dans `data\` est périmé sur ce point** : il classe Dominique
> comme « opérateur » alors qu'il a le niveau **pilote**, et il ne mentionne pas
> le 3ᵉ compte opérateur. Se fier à ce document-ci.

---

## Où sont rangées les données

Tout est stocké chez **Firebase** (service de Google), dans le projet `plan-de-decoupe`.
Rien n'est stocké sur le PC ni sur les tablettes de façon durable.

Les principales « boîtes » de données :

- **fiches** — les fiches de découpe terminées (l'archive ISO)
- **brouillons** — les découpes en cours, une par tablette
- **saves** — les plans de découpe sauvegardés
- **temps** — les relevés de chronomètre
- **stockArticles** / **stockMouvements** — le stock (le second est un grand-livre :
  on ne supprime jamais un mouvement, on écrit un mouvement inverse)
- **maintenance** — machines et lames
- **audit** — journal des actions sensibles, **jamais modifiable ni supprimable**

---

## Trois notions à connaître

### Le « gel de version »
Quand une nouvelle version est publiée, les tablettes **ne se mettent pas à jour
toutes seules**. Elles affichent une bannière « Recharger », et c'est l'opérateur
qui décide quand. Objectif : ne jamais changer le logiciel sous les mains de
quelqu'un en pleine découpe.

**Conséquence :** après une mise en ligne, l'atelier ne voit le changement que
lorsqu'il recharge. C'est normal.

### Le fonctionnement hors ligne
Le logiciel continue de fonctionner sans réseau. Les saisies sont mémorisées et
remontent automatiquement quand le wifi revient.

### Le numéro de version
Format `2026.08.22-L395` : la date, puis le numéro de **lot** de modifications.
Chaque modification publiée incrémente ce numéro. Il est visible en bas de l'écran
« Données », et il est estampillé sur chaque fiche créée — ce qui permet, en cas de
problème, de savoir avec quelle version une fiche a été produite.

---

## Ce qui est solide, et ce qui l'est moins

**Solide :** le moteur de calcul est verrouillé et vérifié. Les enregistrements
qualité ne peuvent pas être effacés. Le hors-ligne est éprouvé.

**Points de vigilance**, documentés pour la suite :

1. **La liste des clients et le catalogue de références sont écrits dans le code**
   du logiciel, pas dans une base de données. Ajouter un client ou changer une
   référence oblige donc à republier le logiciel — voir document **04**.
2. **Aucune sauvegarde automatique des données** n'a été mise en place à ce jour.
   Toute la traçabilité repose sur une seule base Firebase.
3. **Les vérifications automatiques ne fonctionnent que sur le Mac d'Esteban**
   (chemin de fichier écrit en dur dans 17 fichiers de test). Sur ce PC Windows,
   elles ne s'exécutent pas — d'où la procédure allégée du document **04**.
