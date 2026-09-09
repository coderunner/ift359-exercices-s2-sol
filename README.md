# Exercices - Semaine 2 - Roche x Papier x Ciseaux

## Prérequis

- [Node.js](https://nodejs.org/) (version LTS recommandée)

## Installation

Une fois Node.js installé, ouvrez un terminal à la racine du projet et exécutez la commande `npm install` pour installer les dépendances nécessaires.

## Structure du projet

- Le code source TypeScript se trouve dans le répertoire `src/` (point d'entrée : `src/index.ts`).
- Le code JavaScript compilé est généré dans le répertoire `dist/`.

## Commandes disponibles

| Commande             | Description                                                                                   |
| :------------------- | :-------------------------------------------------------------------------------------------- |
| `npm run dev`        | Exécute le code TypeScript.                                                                   |
| `npm run dev:watch`  | Exécute et surveille le code TypeScript avec rechargement automatique à chaque sauvegarde.    |
| `npm run build`      | Vérifie les types et compile le projet TypeScript vers JavaScript dans le dossier `dist/src`. |
| `npm start`          | Exécute le code JavaScript compilé (`dist/src/index.js`) avec Node.js.                        |
| `npm run clean`      | Supprime le dossier `dist/` contenant les fichiers compilés.                                  |
| `npm run test`       | Exécute les tests.                                                                            |
| `npm run test:watch` | Exécute les tests et surveille le code TypeScript                                             |

# Exercices - Semaine 2 - Roche x Papier x Ciseaux

Nous allons développer un simulateur de partie de Roche - Papier - Ciseaux (RPC) en utilisant une approche fonctionnelle.

Mous utiliserons la récursion au lieu des boucles (for, while) et toutes nos structures de données seront immuables.

Nous définierons plusieurs petites fonctions simples que nous combinerons afin de créer des comportements complexes.

Enfin, nous allons éviter les effets de bord et isoler ces effets (log dans la console) dans des fonctions qui y sont dédiées. Ceci permettra au reste du programme d'utiliser des fonctions pures.

## Étape 0 - npm install

Si ce n'est pas déjà fait, exécuter npm install.

## Étape 1 - Le model pour la simulation

Décommenter la SECTION 1 du fichier rps.ts.

Compléter la définition du type Action.

## Étape 2 - Le simulateur

Décommenter la fonction joueurRound et écrire cette fonction.

Décommenter la fonction jouerPartie et écrire cette fonction.

## Étape 3 - Affichage

Nous aurions pu afficher les informations des rounds à mesure qu'ils se déroulent dans la fonction jouerRound ou jouerPartie, mais nous y aurions introduit des effets de bord. Pour les garder pures, nous créons donc des fonctions d'affichage dédiées pour les isoler.

Décommenter les fonctions afficherPartie, afficherRound et afficherCommentaire.

Écrire afficherCommentaire

## Étape 4 - Jouer

Dans le fichier index.ts, décommenter le code et exécuter le pour tester votre implémentation.

## Étape 5 - Stratégie - Extracteurs

Le jeu de RPC était un jeu stratégique, nous allons développer un API pour créer des stratégies de joueur en utilisant l'approche fonctionnelle.

Dans le fichier strategie.ts, décommenter la section 5 - Extracteurs.

Écrire les fonctions monPointage et pointageAdversaire (penser à réutiliser une ou plusieurs fonctions existantes).

## Étape 6 - Stratégie - Utilitaires

Décommenter la section 6.

Écrire les fonctions contre et combiner.

## Étape 7 - Stratégie - Prédicats

Décommenter la section 7.

## Étape 8 - Stratégies!

Nous allons maintenant écrire quelques stratégies simples (et combinables) pour le jeu de RPC.

Décommenter et écrire les fonctions:

- constant
- miroir
- inverse
- enBoucle
- si

## Étape 9 - Compétition

Dans le fichier index.ts, créer deux joueurs et implémenter leur stratégie en combinant les fonctions définies ci-dessus.

Joueur 1 - si je suis gagnant, je copie mon adversaire (defaut: roche) sinon je boucle sur ciseaux et roche.

Joueur 2 - si le match est nul, je boucle sur 3 x roche puis 2 x papier, sinon j'inverse le dernier coup de mon adversaire (defaut papier).
