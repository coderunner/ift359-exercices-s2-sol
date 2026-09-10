import { describe, it, expect, vi } from "vitest";
import { roche, papier, ciseaux, type Action, type Contexte, type Round, type Pointage, Resultat } from "../src/rps.js";
import {
  dernierRound,
  derniereActionJoueur,
  derniereActionAdversaire,
  pointage,
  monPointage,
  pointageAdversaire,
  contre,
  repeter,
  combiner,
  estNul,
  estGagnant,
  estPerdant,
  constant,
  miroir,
  inverse,
  enBoucle,
  si,
} from "../src/strategie.js";

function creerContexte(
  options: {
    moi?: "j1" | "j2";
    historique?: Round[];
    pointage?: Pointage;
  } = {},
): Contexte {
  return {
    moi: options.moi ?? "j1",
    historique: options.historique ?? [],
    pointage: options.pointage ?? { joueur1: 0, joueur2: 0 },
  };
}

function creerRound(a1: Action, a2: Action, resultat: Resultat, p: Pointage = { joueur1: 0, joueur2: 0 }): Round {
  return {
    actionJoueur1: a1,
    actionJoueur2: a2,
    resultat: resultat,
    pointage: p,
  };
}

describe("Extracteurs", () => {
  it("dernierRound retourne null si l'historique est vide", () => {
    const ctx = creerContexte({ historique: [] });
    expect(dernierRound(ctx)).toBeNull();
  });

  it("dernierRound extrait le dernier élément de l'historique", () => {
    const r1 = creerRound(roche(), papier(), "j2");
    const r2 = creerRound(ciseaux(), roche(), "j2");
    const ctx = creerContexte({ historique: [r1, r2] });

    expect(dernierRound(ctx)).toBe(r2);
  });

  it("derniereActionJoueur renvoie l'action selon le joueur demandé", () => {
    const r = creerRound(roche(), papier(), "j2");
    const ctx = creerContexte({ historique: [r] });

    expect(derniereActionJoueur("j1", ctx)?.action).toBe("roche");
    expect(derniereActionJoueur("j2", ctx)?.action).toBe("papier");
  });

  it("derniereActionAdversaire cible le bon joueur selon le point de vue (moi)", () => {
    const r = creerRound(roche(), papier(), "j2");

    const ctxJ1 = creerContexte({ moi: "j1", historique: [r] });
    expect(derniereActionAdversaire(ctxJ1)?.action).toBe("papier");

    const ctxJ2 = creerContexte({ moi: "j2", historique: [r] });
    expect(derniereActionAdversaire(ctxJ2)?.action).toBe("roche");
  });

  it("pointage, monPointage et pointageAdversaire extraient les scores correctement", () => {
    const ctx1 = creerContexte({
      moi: "j1",
      pointage: { joueur1: 3, joueur2: 1 },
    });

    const ctx2 = creerContexte({
      moi: "j2",
      pointage: { joueur1: 3, joueur2: 1 },
    });

    expect(pointage("j1", ctx1)).toBe(3);
    expect(pointage("j2", ctx2)).toBe(1);

    expect(monPointage(ctx1)).toBe(3);
    expect(pointageAdversaire(ctx1)).toBe(1);

    expect(monPointage(ctx2)).toBe(1);
    expect(pointageAdversaire(ctx2)).toBe(3);
  });
});

describe("Utilitaires", () => {
  it("contre retourne le coup gagnant contre chaque action", () => {
    expect(contre(roche()).action).toBe("papier");
    expect(contre(papier()).action).toBe("ciseaux");
    expect(contre(ciseaux()).action).toBe("roche");
  });

  it("repeter génère un tableau correctement", () => {
    const res = repeter(3, roche());
    expect(res).toHaveLength(3);
    expect(res.every((a) => a.action === "roche")).toBe(true);
  });

  it("combiner concatène deux séquences d'actions", () => {
    const seq1 = [roche()];
    const seq2 = [papier(), ciseaux()];
    const res = combiner(seq1, seq2);

    expect(res).toEqual([roche(), papier(), ciseaux()]);
  });
});

describe("Prédicats de score", () => {
  it("estNul renvoie true uniquement si les scores sont à égalité", () => {
    expect(estNul(creerContexte({ pointage: { joueur1: 2, joueur2: 2 } }))).toBe(true);
    expect(estNul(creerContexte({ pointage: { joueur1: 1, joueur2: 2 } }))).toBe(false);
  });

  it("estGagnant vérifie si le joueur courant a plus de points", () => {
    const ctx = creerContexte({ moi: "j1", pointage: { joueur1: 2, joueur2: 1 } });
    expect(estGagnant(ctx)).toBe(true);

    const ctxPerdant = creerContexte({ moi: "j1", pointage: { joueur1: 0, joueur2: 1 } });
    expect(estGagnant(ctxPerdant)).toBe(false);
  });

  it("estPerdant vérifie si l'adversaire mène au score", () => {
    const ctx = creerContexte({ moi: "j1", pointage: { joueur1: 0, joueur2: 2 } });
    expect(estPerdant(ctx)).toBe(true);

    const ctxEgalite = creerContexte({ moi: "j1", pointage: { joueur1: 1, joueur2: 1 } });
    expect(estPerdant(ctxEgalite)).toBe(false);
  });
});

describe("Combinateurs de stratégies", () => {
  it("constant renvoie l'action spécifiée", () => {
    const strategie = constant(ciseaux());
    const ctx = creerContexte();

    expect(strategie(ctx).action).toBe("ciseaux");

    const ctx2 = creerContexte({ historique: [creerRound(ciseaux(), ciseaux(), "nul")] });
    expect(strategie(ctx2).action).toBe("ciseaux");
  });

  describe("miroir", () => {
    it("renvoie la valeur par défaut au premier round (historique vide)", () => {
      const strategie = miroir(papier());
      const ctx = creerContexte({ historique: [] });

      expect(strategie(ctx).action).toBe("papier");
    });

    it("rejoue la dernière action jouée par l'adversaire", () => {
      const strategie = miroir(roche());
      const ctx = creerContexte({
        moi: "j1",
        historique: [creerRound(roche(), ciseaux(), "j1")],
      });

      expect(strategie(ctx).action).toBe("ciseaux");
    });
  });

  it("inverse applique contre sur le coup de la stratégie enveloppée", () => {
    const strategieDeBase = constant(roche());
    const strategieInverse = inverse(strategieDeBase);
    const ctx = creerContexte();

    expect(strategieInverse(ctx).action).toBe("papier");
  });

  it("enBoucle cycle indéfiniment sur la séquence en fonction du round actuel", () => {
    const sequence = [roche(), papier(), ciseaux()];
    const strategie = enBoucle(sequence);

    // Tour 0 (historique vide)
    expect(strategie(creerContexte({ historique: [] })).action).toBe("roche");

    // Tour 1
    const hist1 = [creerRound(roche(), roche(), "nul")];
    expect(strategie(creerContexte({ historique: hist1 })).action).toBe("papier");

    // Tour 2
    const hist2 = [...hist1, creerRound(roche(), roche(), "nul")];
    expect(strategie(creerContexte({ historique: hist2 })).action).toBe("ciseaux");

    // Tour 3
    const hist3 = [...hist2, creerRound(roche(), roche(), "nul")];
    expect(strategie(creerContexte({ historique: hist3 })).action).toBe("roche");
  });

  it("si aiguille vers la branche 'alors' ou 'sinon' selon le résultat du prédicat", () => {
    const alors = vi.fn().mockReturnValue(ciseaux());
    const sinon = vi.fn().mockReturnValue(papier());
    const predicatVrai = () => true;
    const predicatFaux = () => false;

    const ctx = creerContexte();

    const strategieVraie = si(predicatVrai, alors, sinon);
    expect(strategieVraie(ctx).action).toBe("ciseaux");
    expect(alors).toHaveBeenCalledWith(ctx);
    expect(sinon).not.toHaveBeenCalled();

    alors.mockClear();
    sinon.mockClear();

    const strategieFausse = si(predicatFaux, alors, sinon);
    expect(strategieFausse(ctx).action).toBe("papier");
    expect(sinon).toHaveBeenCalledWith(ctx);
    expect(alors).not.toHaveBeenCalled();
  });
});
