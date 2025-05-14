// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import {
  AlgBuilder,
  type AlgNode,
  Grouping,
  Move,
} from "../../../../cubing/alg";
import { experimentalCountMoves } from "../../../../cubing/notation";
import { TwistyPlayer } from "../../../../cubing/twisty";

(async () => {
  const devilsAlgDef = {
    V: "U'",
    S: "R'",
    G: "F'",
    b: "U R U R U R",
    a: "b U R U R",
    i: "b b U R",
    c: "V R i i V R",
    n: "V R a",
    d: "n n",
    e: "n c U R",
    f: "U R c a V R",
    g: "n c a b V R",
    h: "n b c a V R",
    j: "c c a V R",
    k: "b b V R",
    l: "n c c",
    m: "n U R",
    o: "V R U R",
    r: "a d c U R e f k n b h a o d c U R f c c n c a b d o d c U R j a b V R d c c f c g d c c f c c V R i c a U R d n V R d l j U R U R e j a o c d c c f c g l c c a d V R d d U R c i V R c j U R c e c m c U R c a d V R d g a b o U R n b e c c a d",
    s: "n b g a V R d b l i n V R e c k d b c a n b V R m c U R m c i d o U R",
    t: "U R U R n U U a U R d V R i h k h c e c n c a b d V R d c U R f U R U R h a V R d l f a b n b V R d e c k c f V R i g k U R d U R c f c c a U R d V R d e j h h e j a o U R d c U R U R e f a V R e g k g l U R c a d V R d d U R c i V R c h e j a o l i V R V R i g m c i d V R n b e U R e U R c a d V R d c a b V R h U R e f a V R d h c j U R g m e f U R m c i d d U U a U R d V R i c k n b e f a o d c U R j a b n o d l i n b o U R e U R n b c a d V R d g c i V R c g n c g c a U R d V R d d U R U R c k U R j U R c e U R n c a b d V R c c d c U R f U R U R l U R V R i c a U R d n V R d m c c V R i j a V R h c V R i j a V R n b e f a o d U R U R g l f a V R e c k d c U R f a b V R m h i d n U U a U R d e e f k n b h a o d c U R f c c n c a b d o d c U R j a b V R d c c f c g d c c f c c V R i c a U R d n V R d l j U R U R e j a o c d c c f c g l c c a d V R d d U R c i V R c j U R c e c m c U R c a d V R d g a b o U R n b e c c a d V R n b g a V R d b l i n V R e c k d b c a n b V R m c U R m c i d d U U a U R d V R i h k h c e c n c a b d V R d c U R f U R U R h a V R d l f a b n b V R d e c k c f V R i g k U R d U R c f c c a U R d V R d e j h h e j a o U R d c U R U R e f a V R e g k g l U R c a d V R d d U R c i V R c h e j a o l i V R V R i g m c i d V R n b e U R e U R c a d V R d c a b V R h U R e f a V R d h c j U R g m e f U R m c i d d U U a U R d V R i c k n b e f a o d c U R j a b n o d l i n b o U R e U R n b c a d V R d g c i V R c g n c g c a U R d V R d d U R U R c k U R j U R c e U R n c a b d V R c c d c U R f U R U R l U R V R i c a U R d n V R d m c c V R i j a V R h c V R i j a V R n b e f a o d U R U R g l f a V R e c k d c U R f a b V R m h i d n U U a U R d e e f k n b h a o d c U R f c c n c a b d o d c U R j a b V R d c c f c g d c c f c c V R i c a U R d n V R d l j U R U R e j a o c d c c f c g l c c a d V R d d U R c i V R c j U R c e c m c U R c a d V R d g a b o U R n b e c c a d V R n b g a V R d b l i n V R e c k d b c a n b V R m c U R m c i d d U U a U R d V R i h k h c e c n c a b d V R d c U R f U R U R h a V R d l f a b n b V R d e c k c f V R i g k U R d U R c f c c a U R d V R d e j h h e j a o U R d c U R U R e f a V R e g k g l U R c a d V R d d U R c i V R c h e j a o l i V R V R i g m c i d V R n b e U R e U R c a d V R d c a b V R h U R e f a V R d h c j U R g m e f U R m c i d d U U a U R d V R i c k n b e f a o d c U R j a b n o d l i n b o U R e U R n b c a d V R d g c i V R c g n c g c a U R d V R d d U R U R c k U R j U R c e U R n c a b d V R c c d c U R f U R U R l U R V R i c a U R d n V R d m c",
    w: "c V R i j a V R h c V R i j a V R n b e f a o d U R U R g l f a V R e c k d c U R f a b V R m h i d n U",
    u: "k r V R s U R t w F",
    v: "u u u u u u u u a V R r V R s U R t w U U G",
    p: "F V w' t' S V s' R R R U r' S U S V b' S F R b U R V R r V S S S s U R t w U G",
    q: "G V w' t' S V s' S U r' S U a' S F V V w' t' S V s' S U r' S U a' F R r V R s U S S S t w U a G",
    x: "k r V R s U R t c V R i j a V R h c V R i j a V R n b e f a o d U R U R g l f a V R n V R U p b U R U p b U R U p b o c k d c U R f a b V R V R k a b o U R U p b U R U p b U R U p U R d U R U R d n U F k r V R s U R t V R U p a a b V R V R i j a V R h c V R i c n a U p b d V R n b e f a o d U R U R g n o U R U p b U R U p b U R U p U R V R c f a V R e c k V p a V R U p b U R c U R U R c U R U p b n b V R V R k a b n b U R U p b U R d U R U R d n U F a V R r V R s U R t V R U p a a b V R V R i j a V R h c V R i j a V R n b e U R o U p a i d o d U R U R g l f a V R e n b U R U q b U R V R k n V R U p b U R n a b U R V p U R f a b V R V R k U R U p U p b U p U p c U p U R U p U p U R V R b U p b V R b U R U p V R U p b U R o U p b U U U G",
    z: "v v v v v v u u u u u u x",
  };

  const constructed: Record<string, AlgNode> = {
    U: new Move("U"),
    R: new Move("R"),
    F: new Move("F"),
    "U'": new Move("U'"),
    "R'": new Move("R'"),
    "F'": new Move("F'"),
  };

  const progress = document.querySelector("#progress") as HTMLDivElement;
  for (const [varName, def] of Object.entries(devilsAlgDef)) {
    const update = progress.appendChild(document.createElement("div"));
    update.textContent = `${varName} = // ...`;
    await new Promise((resolve) => setTimeout(resolve, 10));
    const algBuilder = new AlgBuilder();
    for (const tidbit of def.split(" ")) {
      // let inverted = false
      // if (tidbit.endsWith("'")) {
      //   inverted = true
      //   tidbit = tidbit.slice(0, -1);
      // }
      const existing = constructed[tidbit];
      if (!existing) {
        throw new Error(`aaaargh ${tidbit}`);
      }
      const toPush = existing;
      // if (inverted) {
      //   toPush = toPush.invert();
      // }
      algBuilder.push(toPush);
    }
    const alg = algBuilder.toAlg();
    const grouping = new Grouping(algBuilder.toAlg());
    constructed[varName] = grouping;
    constructed[`${varName}'`] = grouping.invert();
    const c = experimentalCountMoves(alg);
    console.log(`Alg ${varName} has ${c} move${c === 1 ? "" : "s"}`);
    update.textContent = `${varName} = ${def} // ${c} move${
      c === 1 ? "" : "s"
    }`;
    update.scrollIntoView();
    await new Promise((resolve) => setTimeout(resolve, 1));
  }

  const playerWrapper = document.querySelector("#player-wrapper")!;

  playerWrapper.textContent = "";
  playerWrapper.appendChild(
    new TwistyPlayer({
      puzzle: "2x2x2",
      alg: (constructed["z"] as Grouping).alg,
      backView: "top-right",
    }),
  );
})();
