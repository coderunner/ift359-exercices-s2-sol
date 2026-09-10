// SECTION 1 - MODEL

// Définition des actions possibles
interface Roche {
  readonly action: "roche";
  readonly affichage: "O";
  readonly commentaireSiGagnant?: string;
}

interface Papier {
  readonly action: "papier";
  readonly affichage: "[]";
  readonly commentaireSiPerdant?: string;
}

interface Ciseaux {
  readonly action: "ciseaux";
  readonly affichage: "V";
  readonly commentaire?: string;
}

// Le type action est un type union discriminée qui englobe les actions possibles dans une partie de RPC (roche, papier et ciseaux)
export type Action = Roche | Papier | Ciseaux;

// Table qui encode quel action bat quel autre action
const BATTU_PAR: Record<Action["action"], Action["action"]> = {
  roche: "ciseaux",
  papier: "roche",
  ciseaux: "papier",
};

// Type qui identifie le joueur (j1 ou j2)
export type IdJoueur = "j1" | "j2";

// Type qui indique le résultat d'un round (j1 = joueur 1 a gagné, j1 = joueur 2 a gagné, nul = aucun gagnant)
export type Resultat = "j1" | "j2" | "nul";

// Fonction qui détermine le résulat du round. a1 est l'action du joueur 1, a2 est l'action du joueur 2.
function resolution(a1: Action, a2: Action): Resultat {
  if (a1.action === a2.action) return "nul";
  return BATTU_PAR[a1.action] === a2.action ? "j1" : "j2";
}

// Fonctions de constructions des différents type d'action
export function roche(commentaireSiGagnant?: string): Roche {
  return { action: "roche", affichage: "O", commentaireSiGagnant };
}

export function papier(commentaireSiPerdant?: string): Papier {
  return { action: "papier", affichage: "[]", commentaireSiPerdant };
}

export function ciseaux(commentaire?: string): Ciseaux {
  return { action: "ciseaux", affichage: "V", commentaire };
}

// Type représentant le contexte de la partie à un round donné.
export interface Contexte {
  readonly moi: IdJoueur; // identité du joueur
  readonly historique: Round[]; // les rounds passés
  readonly historiqueDecisions: Decision[]; // historiques des décisons passées
  readonly pointage: Pointage; // le pointage au début du round
}

export interface Decision {
  strategie: string;
}

// Type qui représente une stratégie qui, a partir du contexte de la partie, retourne l'action du joueur
export type Strategie = (contexte: Contexte) => [Action, Decision];

// Interface représentant un joueur
export interface Joueur {
  readonly nom: string;
  strategie: Strategie;
}

// Interface représentant le pointage
export interface Pointage {
  readonly joueur1: number;
  readonly joueur2: number;
}

// Interface représentant un round complété.
export interface Round {
  readonly actionJoueur1: Action; // action du joueur 1
  readonly actionJoueur2: Action; // action du joueur 2
  readonly resultat: Resultat; // le résultat du round
  readonly pointage: Pointage; // le pointage à la fin du round
}

// Interface représentant une partie jouée
export interface PartieJouee {
  readonly joueur1: Joueur;
  readonly joueur2: Joueur;
  readonly rounds: Round[]; // l'historique des rounds de la partie
}

// SECTION 2 - Simulateur

/**
 * Fonction qui résout un round.
 * @param j1 joueur 1
 * @param j2 joueur 2
 * @param historique historique des rounds passés
 * @param pointage pointage au début du round
 * @returns le nouveau round à ajouter à l'historique de la partie
 */
export function jouerRound(
  j1: Joueur,
  j2: Joueur,
  historique: Round[],
  historiqueDecisions: [Decision, Decision][],
  pointage: Pointage,
): [Round, [Decision, Decision]] {
  const decisions1 = historiqueDecisions.map((d) => d[0]);
  const [a1, d1] = j1.strategie({ moi: "j1", historique, historiqueDecisions: decisions1, pointage });
  const decisions2 = historiqueDecisions.map((d) => d[1]);
  const [a2, d2] = j2.strategie({ moi: "j2", historique, historiqueDecisions: decisions2, pointage });
  const r = resolution(a1, a2);
  const nouveauPointage: Pointage = {
    joueur1: r === "j1" ? pointage.joueur1 + 1 : pointage.joueur1,
    joueur2: r === "j2" ? pointage.joueur2 + 1 : pointage.joueur2,
  };

  return [
    {
      actionJoueur1: a1,
      actionJoueur2: a2,
      resultat: r,
      pointage: nouveauPointage,
    },
    [d1, d2],
  ];
}

/**
 * Jouer la partie
 * @param j1 joueur 1
 * @param j2 joueur 2
 * @param pointageCible le pointage à atteindre pour gagner la partie
 * @returns Les détails de la partie complétée (joueurs et historique des rounds)
 */
export function jouerPartie(j1: Joueur, j2: Joueur, pointageCible: number): PartieJouee {
  function jouer(
    roundsJoues: Round[],
    decisionsPrises: [Decision, Decision][],
    pointageCourrant: Pointage,
  ): PartieJouee {
    if (pointageCourrant.joueur1 >= pointageCible || pointageCourrant.joueur2 >= pointageCible) {
      return { joueur1: j1, joueur2: j2, rounds: roundsJoues };
    }

    const [round, decisions] = jouerRound(j1, j2, roundsJoues, decisionsPrises, pointageCourrant);
    return jouer([...roundsJoues, round], [...decisionsPrises, decisions], round.pointage);
  }

  return jouer([], [], { joueur1: 0, joueur2: 0 });
}

// SECTION 3 - AFFICHAGE

/**
 * Fonction qui affiche une partie dans la console
 * @param partie Une partie jouée
 */
export function afficherPartie(partie: PartieJouee) {
  partie.rounds.forEach((r, index) => afficherRound(partie, r, index + 1));
}

/**
 * Fonction qui affiche un round dans la console.
 * @param partie la partie jouée
 * @param round le round à afficher
 * @param roundNumber le numéro du round
 */
function afficherRound(partie: PartieJouee, round: Round, roundNumber: number) {
  console.log(`##### Round #${roundNumber} #####`);
  console.log(
    `${partie.joueur1.nom} -> ${round.actionJoueur1.affichage} VS ${partie.joueur2.nom} -> ${round.actionJoueur2.affichage} : ${round.pointage.joueur1} à ${round.pointage.joueur2}`,
  );
  afficherCommentaire(
    partie.joueur1.nom,
    round.actionJoueur1,
    round.resultat === "j1" ? "gagnant" : round.resultat === "j2" ? "perdant" : "nul",
  );
  afficherCommentaire(
    partie.joueur2.nom,
    round.actionJoueur2,
    round.resultat === "j2" ? "gagnant" : round.resultat === "j1" ? "perdant" : "nul",
  );
}

/**
 * Fonction qui affiche un commentaire de joueur si nécessaire.
 * @param nom nom du joueur
 * @param action action du joueur
 * @param resultat résultat de round
 */
function afficherCommentaire(nom: string, action: Action, resultat: "gagnant" | "perdant" | "nul") {
  switch (action.action) {
    case "roche":
      if (resultat === "gagnant" && action.commentaireSiGagnant) {
        console.log(`${nom}: "${action.commentaireSiGagnant}"`);
      }
      break;
    case "papier":
      if (resultat === "perdant" && action.commentaireSiPerdant) {
        console.log(`${nom}: "${action.commentaireSiPerdant}"`);
      }
      break;
    case "ciseaux":
      if (action.commentaire) {
        console.log(`${nom}: "${action.commentaire}"`);
      }
      break;
  }
}
