//SECTION 4 - Jouer!

import { afficherPartie, ciseaux, Contexte, jouerPartie, Joueur, papier, roche } from "./rps.js";
import { combiner, enBoucle, estGagnant, estNul, inverse, miroir, repeter, si } from "./strategie.js";

// Joueurs
export const j1: Joueur = {
  nom: "J1",
  strategie: si(estGagnant, miroir(roche()), enBoucle([ciseaux(), roche()])),
};

export const j2: Joueur = {
  nom: "J2",
  strategie: si(estNul, enBoucle(combiner(repeter(3, roche()), repeter(2, papier()))), inverse(miroir(papier()))),
};

const partieJouee = jouerPartie(j1, j2, 10);
afficherPartie(partieJouee);
