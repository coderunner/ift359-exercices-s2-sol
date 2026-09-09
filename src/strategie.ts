import { ciseaux, Joueur, roche, Round, papier, Action, IdJoueur, Contexte, Strategie } from "./rps.js";

// Extracteurs
export function dernierRound(contexte: Contexte): Round | null {
  return contexte.historique.length > 0 ? contexte.historique[contexte.historique.length - 1] : null;
}

export function derniereActionJoueur(joueur: IdJoueur, contexte: Contexte): Action | null {
  const round = dernierRound(contexte);
  return (joueur === "j1" ? round?.actionJoueur1 : round?.actionJoueur2) ?? null;
}

export function derniereActionAdversaire(contexte: Contexte): Action | null {
  return derniereActionJoueur(contexte.moi === "j1" ? "j2" : "j1", contexte);
}

export function pointage(joueur: IdJoueur, contexte: Contexte) {
  return joueur === "j1" ? contexte.pointage.joueur1 : contexte.pointage.joueur2;
}

export function monPointage(contexte: Contexte): number {
  return pointage(contexte.moi, contexte);
}

export function pointageAdversaire(contexte: Contexte): number {
  return pointage(contexte.moi === "j1" ? "j2" : "j1", contexte);
}

// Utilitaires
export function contre(action: Action): Action {
  switch (action.action) {
    case "roche":
      return papier();
    case "papier":
      return ciseaux();
    case "ciseaux":
      return roche();
  }
}

export function repeter(repetition: number, action: Action): Action[] {
  return new Array(repetition).fill(action);
}

export function combiner(seq1: Action[], seq2: Action[]): Action[] {
  return [...seq1, ...seq2];
}

// Prédicats
export function estNul(contexte: Contexte): boolean {
  return monPointage(contexte) === pointageAdversaire(contexte);
}

export function estGagnant(contexte: Contexte): boolean {
  return monPointage(contexte) > pointageAdversaire(contexte);
}

export function estPerdant(contexte: Contexte): boolean {
  return monPointage(contexte) < pointageAdversaire(contexte);
}

// Stratégies
export function constant(action: Action): Strategie {
  return (contexte: Contexte) => action;
}

export function miroir(defaut: Action): Strategie {
  return (contexte: Contexte) => derniereActionAdversaire(contexte) ?? defaut;
}

export function inverse(strategie: Strategie): Strategie {
  return (contexte: Contexte) => contre(strategie(contexte));
}

export function enBoucle(sequence: Action[]): Strategie {
  return (contexte: Contexte) => sequence[contexte.historique.length % sequence.length];
}

export function si(predicat: (contexte: Contexte) => boolean, alors: Strategie, sinon: Strategie): Strategie {
  return (contexte: Contexte) => (predicat(contexte) ? alors(contexte) : sinon(contexte));
}
