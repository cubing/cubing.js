import type { TwistyPlayerConfig } from "../../../cubing/twisty";

export const examples: Record<string, TwistyPlayerConfig> = {
  wr: {
    experimentalSetupAlg: `F U2 L2 B2 F' U L2 U R2 D2 L' B L2 B' R2 U2`,
    alg: `y x' // inspection
U R2 U' F' L F' U' L' // XX-Cross + EO
U' R U R' // 3rd slot
R' U R U2' R' U R // 4th slot
U R' U' R U' R' U2 R // OLL / ZBLL
U // AUF

// from http://cubesolv.es/solve/5757`,
    experimentalStickering: "full",
    experimentalSetupAnchor: "start",
  },

  tperm: {
    experimentalSetupAlg: "",
    alg: `R U R' U' R' F R2 U' R' U' R U R' F'`,
    experimentalStickering: "PLL",
    experimentalSetupAnchor: "end",
    experimentalTitle: "T-Perm",
  },

  sune: {
    experimentalSetupAlg: "",
    alg: "[[R: U]: [U, R]]",
    experimentalStickering: "PLL",
    experimentalSetupAnchor: "end",
    experimentalTitle: "Sune",
  },

  notation: {
    experimentalSetupAlg: "",
    alg: `R L U D B F // Single moves, variable spacing.
B' F' D' U' L' R' // Inverses.
R L2 R3 L2' R5 L8' R7 // Move amount
U . U . U . . . U // Pauses.
M' E2 S2 M S2 E2 m2 e2 s2 m2 e2 s2 // Slice turns.
M2' U' M2' U2' M2' U' M2' // H'perm.
x y z // Rotations.
R2 L2 R2' L2' // Half turns.
Rw r' Lw l' Uw u' Dw d' Bw b' Fw f' // Wide turns.
4Rw x L' // Very wide turns
2-3Lw 3-4r // Wide block turns
[[R: U], D2] // commutator/conjugate/nesting
([R: U'] D2)2' [R: U2] // Grouping and repetition`,
    experimentalStickering: "PLL",
    experimentalSetupAnchor: "start",
    puzzle: "5x5x5",
  },
};
