# Modifier le logiciel et le mettre en ligne

**Le document à ouvrir à chaque demande de modification.**

---

## Le principe

Vous ne tapez **aucune commande** et vous ne lisez **aucun code**.
Vous ouvrez **Claude** sur ce PC, dans le dossier
`K:\STEP INTERNATIONAL\ESTEBAN Alternance 2025 2026\claude`,
et vous lui parlez normalement, en français.

Claude lit automatiquement le fichier `CLAUDE.md` du projet, qui contient les règles
techniques à respecter. **Vous n'avez pas à les connaître** — mais vous devez savoir
ce qui est de votre ressort et ce qui ne l'est pas. C'est tout l'objet de ce document.

> ⚠️ **Un point à comprendre une fois pour toutes :**
> publier une modification met le logiciel en ligne **immédiatement**, pour l'atelier.
> Il n'y a pas d'étape de validation intermédiaire.

---

## 🟢 Zone verte — vous le faites seule

Ces modifications ne touchent qu'à des **listes**, jamais à la façon dont le logiciel
calcule. Le pire qui puisse arriver est une faute de frappe, corrigeable en 2 minutes.

- **Ajouter un client**, avec ses références et dimensions habituelles
- **Ajouter ou modifier une référence produit** (largeur, longueur, libellé)
- **Modifier une règle d'emballage** d'un client (palette, caisse, cerclage, étiquetage)
- **Corriger un libellé, un texte, une faute** à l'écran
- **Ajouter un destinataire** aux mails de signalement

### Comment demander

Soyez précise et donnez toutes les valeurs. Exemple :

> « Ajoute le client **DUPONT INDUSTRIE** avec la référence
> **41117500 - SK 6008AD32**, largeur **2100 mm**, longueur **1000 m**.
> Vérifie la syntaxe, puis mets en ligne. »

Ou :

> « Pour le client **EPCO**, la règle d'emballage passe en palette **100×120**
> au lieu de 80×120. Le reste ne change pas. »

---

## 🔴 Zone rouge — vous appelez Esteban

Ne jamais lancer seule une modification qui touche à :

| | Pourquoi |
|---|---|
| **Le calcul du plan de découpe** | 11 fonctions sont verrouillées et vérifiées. Une modification invisible fausserait tous les plans |
| **Les impressions, PDF, étiquettes** | Ce sont des documents qualité ISO. Leur format ne doit pas bouger |
| **L'affichage sur tablette en position verticale** | Le format historique de l'atelier ne doit pas changer |
| **Les demandes de confirmation** (« êtes-vous sûr ? ») | Ce sont des garde-fous voulus |
| **Les règles de sécurité, les comptes, Firebase** | Voir document **03** |

**Comment savoir ?** Si la demande contient les mots *calcul, optimisation, perte
matière, impression, étiquette, PDF, portrait, sécurité, compte, droits* → zone rouge.

**Dans le doute, demandez à Claude :**

> « Est-ce que cette modification est en zone verte ou en zone rouge
> d'après le dossier de passation ? »

---

## La procédure, à chaque fois

### 1. Choisir le moment
**Jamais pendant une découpe en cours.** Le matin tôt, à midi, ou en fin de journée.
Un coup de fil à l'atelier coûte moins cher qu'une bannière au mauvais moment.

### 2. Faire la demande à Claude
Une seule modification à la fois. Décrivez le résultat voulu, pas la manière.

### 3. Exiger les vérifications
Dites explicitement :

> « Avant de mettre en ligne : vérifie la syntaxe des scripts, incrémente le numéro
> de version, et dis-moi ce que tu as modifié. »

**Ce qui fonctionne sur ce PC :**
- ✅ le contrôle de syntaxe du code
- ✅ l'aperçu du logiciel en local avant publication
- ✅ la vérification de la version en ligne après publication

**Ce qui ne fonctionne pas sur ce PC :**
- ❌ la batterie de tests automatiques et le simulateur — ils ne tournent que sur le
  Mac d'Esteban (un chemin de fichier y est écrit en dur).

C'est précisément pour cela que la zone verte est étroite.

### 4. Mettre en ligne
> « C'est bon, mets en ligne. »

Comptez **2 minutes** avant que ce soit effectif.

### 5. Vérifier
Demandez :

> « Vérifie que la nouvelle version est bien en ligne. »

Puis **ouvrez vous-même le logiciel** dans le navigateur, rechargez la page, et
regardez que votre modification est bien là.

### 6. Prévenir l'atelier
Un message à Dominique : *« nouvelle version en ligne, vous pouvez recharger. »*
Sans ça, les tablettes garderont l'ancienne version tant qu'elles ne rechargent pas.

---

## 🚨 Si ça casse

Restez calme : **rien n'est perdu, et le retour arrière est prévu.**

Dites à Claude, exactement :

> « Le logiciel est cassé en production. Annule la dernière mise en ligne
> et remets la version précédente. »

Puis prévenez l'atelier de recharger.

**Bon à savoir :** les tablettes qui n'ont pas encore rechargé continuent de
fonctionner avec l'ancienne version. Une mise en ligne ratée ne bloque donc
jamais une découpe en cours.

---

## Si Claude dit « push rejected »

Cela veut dire qu'une modification a été envoyée depuis une autre machine
entre-temps. Ce n'est pas une erreur et rien n'est perdu. Répondez :

> « Fais un `git pull --rebase`, puis republie. »

---

## Les deux limites à connaître

**1. La liste des clients et le catalogue de références sont dans le code.**
C'est pour cette raison qu'ajouter un client oblige à republier le logiciel entier.
Ce n'est pas idéal : le jour où ces listes vivront dans la base de données, ces
modifications se feront directement depuis l'application, sans publication ni risque.
**C'est l'amélioration la plus utile à prévoir.**

**2. Les vérifications automatiques ne tournent pas sur ce PC.**
Tant que c'est le cas, s'en tenir strictement à la zone verte.
