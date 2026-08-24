# Activer la sauvegarde des données

**À faire une fois. Ensuite ça tourne tout seul.**
Durée : environ 20 minutes. Nécessite un accès à la console Firebase
(Esteban ou Christian).

---

## Pourquoi

Google garantit que la base ne disparaîtra pas. Il ne garantit pas que son
**contenu** restera correct. Une sauvegarde protège contre une suppression en masse,
une publication de règles ratée, ou une modification du logiciel qui écrit de travers.

Les fiches de découpe sont des **enregistrements qualité ISO 9001** : elles prouvent,
pour chaque commande livrée, quelle bobine mère, quelle lame, quelle machine, quels
contrôles et quelles non-conformités. Sans sauvegarde, une perte est définitive —
y compris sur les mois déjà écoulés.

---

## Deux protections complémentaires

| | Ce que ça fait | Ce que ça ne fait pas |
|---|---|---|
| **A. Récupération à un instant T** | Permet de revenir à l'état de la base à n'importe quelle minute des 7 derniers jours | Ne protège pas au-delà de 7 jours |
| **B. Sauvegardes planifiées** | Copie complète de la base, tous les jours, conservée plusieurs semaines | Ne permet pas de revenir à une minute précise |

**Activer les deux.** La première rattrape une bêtise remarquée dans la journée,
la seconde couvre celle qu'on découvre trois semaines plus tard.

Les deux nécessitent la formule payante — **elle est déjà en place**.

---

## A. Récupération à un instant T

1. Ouvrir la **console Firebase** → projet `plan-de-decoupe`.
2. Menu de gauche : **Firestore Database**.
3. Onglet **Sauvegardes** (ou *Backups* selon la langue de la console).
4. Chercher **Récupération à un instant donné** (*Point-in-time recovery*, ou **PITR**).
5. **Activer.**

C'est tout. À partir de là, Firestore conserve en continu de quoi restaurer la base
telle qu'elle était à n'importe quel moment des 7 derniers jours.

> 💡 Cette option a un léger coût de stockage, proportionnel au volume de la base.
> Pour une base de cette taille, c'est négligeable — quelques euros par mois au plus.

---

## B. Sauvegardes planifiées

Toujours dans **Firestore Database → Sauvegardes** :

1. Cliquer sur **Créer une planification** (*Create backup schedule*).
2. Choisir **Tous les jours** (*Daily*).
3. Choisir la durée de conservation. **Recommandation : le maximum proposé**
   pour une sauvegarde quotidienne (7 jours).
4. Créer une **deuxième planification**, **Toutes les semaines** (*Weekly*), avec la
   conservation la plus longue proposée (jusqu'à 14 semaines).
5. Valider.

Vous obtenez ainsi : les 7 derniers jours au jour près, et les ~3 derniers mois à
la semaine près.

> ℹ️ Les libellés exacts peuvent varier légèrement selon les mises à jour de la
> console Google. La logique, elle, ne change pas : *Firestore → Sauvegardes →
> créer une planification*.

---

## Vérifier que ça marche — à faire 3 jours après

C'est l'étape que tout le monde saute, et c'est celle qui compte.

1. Retourner dans **Firestore Database → Sauvegardes**.
2. Vérifier qu'une **liste de sauvegardes** est apparue, avec des dates récentes.
3. Si la liste est vide au bout de 3 jours : la planification n'est pas active.
   Recommencer, ou demander de l'aide.

- [ ] Vérification faite le : ____________

---

## En cas de besoin réel

**Si des données sont perdues ou corrompues :**

1. **Ne rien faire d'autre.** Ne pas tenter de « réparer » à la main : chaque
   écriture supplémentaire complique la restauration.
2. Prévenir immédiatement Esteban ou Christian.
3. Depuis la console : **Firestore Database → Sauvegardes**, choisir le point de
   restauration voulu, et restaurer.

> ⚠️ Une restauration **remplace** l'état actuel. Tout ce qui a été saisi depuis le
> point choisi est perdu. D'où le point 1 : plus on agit vite, moins on perd.

---

## Coûts

Les sauvegardes sont facturées au volume stocké. Pour une base de cette taille,
comptez quelques euros par mois.

- [ ] Vérifier qu'une **alerte de budget** existe sur le projet, et qui la reçoit.
      Console Firebase → ⚙️ **Paramètres du projet** → **Usage et facturation**.
