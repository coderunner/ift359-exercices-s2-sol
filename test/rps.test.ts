import { describe, it, expect } from "vitest";
import { jouerRound, jouerPartie, roche, papier, ciseaux, type Joueur, type Pointage, type Round } from "../src/rps.js";

describe("Simulateur Roche Papier Ciseaux", () => {
  const joueurRoche: Joueur = {
    nom: "Joueur Roche",
    strategie: () => [roche(), { strategie: "fix" }],
  };

  const joueurPapier: Joueur = {
    nom: "Joueur Papier",
    strategie: () => [papier(), { strategie: "fix" }],
  };

  const joueurCiseaux: Joueur = {
    nom: "Joueur Ciseaux",
    strategie: () => [ciseaux(), { strategie: "fix" }],
  };

  const pointageInitial: Pointage = { joueur1: 0, joueur2: 0 };

  describe("jouerRound", () => {
    it("détermine la victoire du joueur 1 (roche bat ciseaux)", () => {
      const [round, _] = jouerRound(joueurRoche, joueurCiseaux, [], [], pointageInitial);

      expect(round.resultat).toBe("j1");
      expect(round.actionJoueur1.action).toBe("roche");
      expect(round.actionJoueur2.action).toBe("ciseaux");
      expect(round.pointage).toEqual({ joueur1: 1, joueur2: 0 });
    });

    it("détermine la victoire du joueur 2 (ciseaux battus par roche pour j2)", () => {
      const [round, _] = jouerRound(joueurCiseaux, joueurRoche, [], [], pointageInitial);

      expect(round.resultat).toBe("j2");
      expect(round.pointage).toEqual({ joueur1: 0, joueur2: 1 });
    });

    it("résout une partie nulle lorsque les deux actions sont identiques", () => {
      const [round, _] = jouerRound(joueurPapier, joueurPapier, [], [], pointageInitial);

      expect(round.resultat).toBe("nul");
      expect(round.pointage).toEqual({ joueur1: 0, joueur2: 0 });
    });

    it("incrémente le pointage à partir d'un score préexistant", () => {
      const scoreEnCours: Pointage = { joueur1: 2, joueur2: 1 };

      const [round, _] = jouerRound(joueurPapier, joueurRoche, [], [], scoreEnCours);

      expect(round.resultat).toBe("j1");
      expect(round.pointage).toEqual({ joueur1: 3, joueur2: 1 });
    });
  });

  describe("jouerPartie", () => {
    it("arrête la partie immédiatement si pointageCible vaut 0", () => {
      const partie = jouerPartie(joueurRoche, joueurCiseaux, 0);

      expect(partie.rounds).toHaveLength(0);
      expect(partie.joueur1).toBe(joueurRoche);
      expect(partie.joueur2).toBe(joueurCiseaux);
    });

    it("termine la partie dès que le joueur 1 atteint la cible", () => {
      // j1 gagne tous les rounds
      const partie = jouerPartie(joueurRoche, joueurCiseaux, 3);

      expect(partie.rounds).toHaveLength(3);
      expect(partie.rounds[2].pointage).toEqual({ joueur1: 3, joueur2: 0 });
      expect(partie.rounds.every((r) => r.resultat === "j1")).toBe(true);
    });

    it("continue de jouer lors des rounds nuls jusqu'à atteindre la cible", () => {
      let tour = 0;
      // j1 joue papier, puis roche
      const j1: Joueur = {
        nom: "J1",
        strategie: () => {
          const a = tour === 0 ? papier() : roche();
          tour++;
          return [a, { strategie: "test" }];
        },
      };

      const partie = jouerPartie(j1, joueurPapier, 1);

      expect(partie.rounds).toHaveLength(2);
      expect(partie.rounds[0].resultat).toBe("nul");
      expect(partie.rounds[1].resultat).toBe("j2");
      expect(partie.rounds[1].pointage).toEqual({ joueur1: 0, joueur2: 1 });
    });

    it("accumule fidèlement l'historique transmis aux rounds subséquents", () => {
      const partie = jouerPartie(joueurRoche, joueurCiseaux, 2);

      expect(partie.rounds).toHaveLength(2);
      expect(partie.rounds[0].pointage).toEqual({ joueur1: 1, joueur2: 0 });
      expect(partie.rounds[1].pointage).toEqual({ joueur1: 2, joueur2: 0 });
    });
  });
});
