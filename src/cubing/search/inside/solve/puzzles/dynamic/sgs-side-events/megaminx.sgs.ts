import { KPuzzle } from "../../../../../../kpuzzle";
import { parseSGS, type SGSCachedData } from "../../../parseSGS";

async function megaminxKPuzzleWithoutMO(): Promise<KPuzzle> {
  const { getPuzzleGeometryByName, ExperimentalPGNotation } = await import(
    "../../../../../../puzzle-geometry"
  );
  const pg = getPuzzleGeometryByName("megaminx", {
    allMoves: true,
    addRotations: true,
  });
  const kpuzzle = new KPuzzle(pg.getKPuzzleDefinition(true), {
    experimentalPGNotation: new ExperimentalPGNotation(
      pg,
      pg.getOrbitsDef(true),
    ),
  });
  kpuzzle.definition.name = "megaminx";
  return kpuzzle;
}

// TODO: Implement a general lazy Promise/ Promise cache wrapper
let defCache: Promise<KPuzzle> | null = null;
export async function cachedMegaminxKPuzzleWithoutMO(): Promise<KPuzzle> {
  return (defCache ??= megaminxKPuzzleWithoutMO());
}

let cachedData: Promise<SGSCachedData> | null = null;
export async function cachedSGSDataMegaminx() {
  return (cachedData ??= sgsDataMegaminx());
}

// TODO: Reduce info.
export async function sgsDataMegaminx(): Promise<SGSCachedData> {
  return parseSGS(
    await cachedMegaminxKPuzzleWithoutMO(),
    `SubgroupSizes 12 5 60 58 60 56 54 57 52 50 54 48 46 51 44 42 48 40 45 38 36 42 34 32 39 30 36 28 26 33 24 30 22 20 27 18 24 16 14 21 12 18 10 15 8 6 2 12 9 3

Alg Rv
Alg Rv2
Alg Rv2'
Alg Rv'
Alg Lv'
Alg Lv2
Alg Lv2'
Alg Fv
Alg Fv'
Alg BRv2
Alg Lv2 Rv'

Alg Uv
Alg Uv2
Alg Uv2'
Alg Uv'

Alg D
Alg D2
Alg D2'
Alg D'
Alg B
Alg B2
Alg B2'
Alg B'
Alg D DL
Alg D DL2
Alg D DL2'
Alg D DL'
Alg D2 FL
Alg D2 FL2
Alg D2 FL2'
Alg D2 FL'
Alg D2' FR
Alg D2' FR2
Alg D2' FR2'
Alg D2' FR'
Alg D' DR
Alg D' DR2
Alg D' DR2'
Alg D' DR'
Alg B DR
Alg B DR2'
Alg B DR'
Alg B2 BR2
Alg B2 BR2'
Alg B2 BR'
Alg B2' BL
Alg B2' BL2
Alg B2' BL2'
Alg B' DL
Alg B' DL2
Alg B' DL'
Alg D DL B
Alg D DL B2'
Alg D DL B'
Alg D DL2' L
Alg D DL2' L2
Alg D DL2' L2'
Alg D DL' FL
Alg D DL' FL2
Alg D DL' FL'
Alg D2 FL2' F
Alg D2 FL2' F2
Alg D2 FL2' F2'
Alg D2 FL' FR
Alg D2 FL' FR2
Alg D2 FL' FR'
Alg D2' FR2' R
Alg D2' FR2' R2
Alg D2' FR2' R2'
Alg B DR2' R2'
Alg B DR' BR2
Alg B2 BR' BL
Alg B2' BL2' L
Alg D DL2' L2' F
Alg DL
Alg DL2
Alg DL2'
Alg DL'
Alg DL BL
Alg DL BL2
Alg DL BL2'
Alg DL BL'
Alg DL2 L
Alg DL2 L2
Alg DL2 L2'
Alg DL2 L'
Alg DL2' FL
Alg DL2' FL2
Alg DL2' FL2'
Alg DL2' FL'
Alg D B D'
Alg D B2 D'
Alg D B2' D'
Alg D B' D'
Alg D2 B D2'
Alg D2 DL' D2'
Alg D2' DL' D2
Alg D' B D
Alg D' DL' D
Alg B2 DR2 B2'
Alg B2 DR2' B2'
Alg B2 DR' B2'
Alg B2' BR B2
Alg B2' BR2 B2
Alg B2' BR2' B2
Alg B' BL B
Alg B' BL2 B
Alg B' BL' B
Alg DL BL2' U
Alg DL BL2' U2
Alg DL BL2' U2'
Alg DL BL' L
Alg DL BL' L2
Alg DL BL' L'
Alg DL2 L2' F
Alg DL2 L2' F2
Alg DL2 L2' F2'
Alg DL2 L' FL
Alg DL2 L' FL2
Alg DL2 L' FL'
Alg DL2' FL2' FR
Alg DL2' FL2' FR2
Alg DL2' FL2' FR2'
Alg D B D' DR2
Alg D B D' DR'
Alg D2 B D2' FR2'
Alg D' B D DL
Alg B2 DR' B2' BR
Alg B2 DR' B2' BR'
Alg B2' BR2' B2 U
Alg DL BL2' U2' F
Alg D FL D'
Alg D FL2 D'
Alg D FL2' D'
Alg D FL' D'
Alg D2 FR D2'
Alg D2 FR2 D2'
Alg D2 FR2' D2'
Alg D2' DR D2
Alg D2' DR2 D2
Alg D2' DR2' D2
Alg DL2 BL DL2'
Alg DL2 BL2 DL2'
Alg DL2 BL2' DL2'
Alg DL2 BL' DL2'
Alg DL2' L2 DL2
Alg DL2' L2' DL2
Alg DL' FL2 DL
Alg DL' FL' DL
Alg D FL D' FL2'
Alg D FL L D'
Alg D FL L2 D'
Alg D FL L2' D'
Alg D FL2 F D'
Alg D FL2 F2 D'
Alg D FL2 F2' D'
Alg D FL2 L D'
Alg D FL2 L2 D'
Alg D FL2' D' FR
Alg D FL2' D' FR2
Alg D FL2' D' FR2'
Alg D FL2' F D'
Alg D FL2' F2' D'
Alg D FL2' FR2' D'
Alg D FL2' FR' D'
Alg D FL' D' FL
Alg D FL' FR D'
Alg D2 FR D2' FR2'
Alg D2 FR2 R D2'
Alg D2 FR2 R2 D2'
Alg D2 FR2 R2' D2'
Alg D2 FR2' D2' DR
Alg D2 FR2' D2' DR2
Alg D2 FR2' D2' DR2'
Alg D2 FR2' D2' DR'
Alg D2 FR2' R2' D2'
Alg D2 FR' DR2' D2'
Alg D2' DR D2 DR2'
Alg D2' DR2 BR D2
Alg D2' DR2 BR2' D2
Alg D2' DR2' BR2' D2
Alg D2' DR2' BR' D2
Alg DL2 BL2 DL2' BL'
Alg DL2 BL2 DL2' BR'
Alg DL2 BL' DL2' L'
Alg DL2' L2 DL2 BL2
Alg D FL L2 BL2 D'
Alg D FL L' FL2' D'
Alg D FL2 L FL' D'
Alg D FL2' D' FR2 DR2'
Alg B DL B'
Alg B DL2 B'
Alg B DL2' B'
Alg B DL' B'
Alg B2 D B2'
Alg B2 D2 B2'
Alg B2 D2' B2'
Alg B2 D' B2'
Alg B2 DL B2'
Alg B2' D' B2
Alg B2' DL B2
Alg B' D' B
Alg B DL B' BL
Alg B DL B' BL2
Alg B DL B' BL2'
Alg B DL B' BL'
Alg B DL2 B' BL2
Alg B DL2 B' BL2'
Alg B DL2 B' BL'
Alg B DL2' L2 B'
Alg B DL2' L2' B'
Alg B DL2' L' B'
Alg B DL' FL B'
Alg B DL' FL2 B'
Alg B DL' FL2' B'
Alg B DL' FL' B'
Alg B2 D FL B2'
Alg B2 D FL2' B2'
Alg B2 D FL' B2'
Alg B2 D2 FR2 B2'
Alg B2 D2 FR2' B2'
Alg B2 D2 FR' B2'
Alg B2 D2' B2' DR
Alg B2 D2' B2' DR2
Alg B2 D2' B2' DR2'
Alg B2 DL B2' BR
Alg B2 DL B2' BR2
Alg B2 DL B2' BR2'
Alg B2' D' B2 BR2
Alg B2' D' B2 BR2'
Alg B' D' B DR
Alg B' D' B DR2'
Alg D FL' D FR D2'
Alg D DL FL DL' D'
Alg D2' FR DR FR' D2
Alg B DL B D B2'
Alg B DL B D2' B2'
Alg B DL B' BL2 U2
Alg B DL B' BL2 U2'
Alg B DL B' BL2 U'
Alg B DL2 B' BL2' U2
Alg B DL2 B' BL2' U2'
Alg B DL2 B' BL' L2
Alg B DL2' L2' B' F2
Alg B2 D FL2' B2' F2'
Alg DR
Alg DR2
Alg DR2'
Alg DR'
Alg DR2 FR
Alg DR2 FR2
Alg DR2 FR2'
Alg DR2 FR'
Alg DR2' R
Alg DR2' R2
Alg DR2' R2'
Alg DR2' R'
Alg DR' BR
Alg DR' BR2
Alg DR' BR2'
Alg DR' BR'
Alg D DR D'
Alg D2 DR D2'
Alg B BR B'
Alg B BR2' B'
Alg B BR' B'
Alg B2 BL2 B2'
Alg B2 BL2' B2'
Alg B2 BL' B2'
Alg DR2 FR2 FL2
Alg DR2 FR2 FL2'
Alg DR2 FR2 FL'
Alg DR2 FR2' F
Alg DR2 FR2' F2
Alg DR2 FR2' F2'
Alg DR2 FR' R
Alg DR2 FR' R2
Alg DR2 FR' R'
Alg DR2' R FR
Alg DR2' R FR2'
Alg DR2' R FR'
Alg DR2' R2' U
Alg DR2' R2' U2
Alg DR2' R2' U2'
Alg DR2' R' BR2'
Alg DR' BR2' BL'
Alg D DR2 FR D'
Alg B BR B' DR
Alg B BR B' DR2
Alg B BR2' B' U2'
Alg B BR' B' BL2
Alg B BR' B' BL2'
Alg B BR' B' BL'
Alg B2 BL2' L' B2'
Alg DR2 FR2 FL' F
Alg DR2 FR2' F FL2'
Alg DR2 FR2' F FL'
Alg B BR2' U2' L2' B'
Alg D2' FL D2
Alg D2' FL2 D2
Alg D2' FL2' D2
Alg D2' FL' D2
Alg D' FR2 D
Alg D' FR2' D
Alg D' FR' D
Alg DR FR DR'
Alg DR FR2' DR'
Alg DR FR' DR'
Alg DR2 R2 DR2'
Alg DR2 R2' DR2'
Alg DR2' BR DR2
Alg DR2' BR2 DR2
Alg DR2' BR2' DR2
Alg D DR2 D' DR2'
Alg D DR2' D' DR2
Alg D2' FL D2 FR'
Alg D2' FL2 D2 FL2'
Alg D2' FL2 D2 FL'
Alg D2' FL2 L D2
Alg D2' FL2 L2 D2
Alg D2' FL2 L2' D2
Alg D2' FL2 L' D2
Alg D2' FL2' F D2
Alg D2' FL2' F2 D2
Alg D2' FL2' F2' D2
Alg D2' FL2' L D2
Alg D2' FL2' L2 D2
Alg D2' FL2' L2' D2
Alg D2' FL2' L' D2
Alg D2' FL' F D2
Alg D2' FL' F2' D2
Alg D' FR FL' D
Alg D' FR2 D FR'
Alg D' FR2 D FL2
Alg D' FR2 D FL2'
Alg D' FR2 FL D
Alg D' FR2' R2' D
Alg D' FR' R2' D
Alg DR2 R2 DR2' U2'
Alg DR2 R2' DR2' BR
Alg DR2 R2' DR2' BR2
Alg DR2 R2' DR2' BR2'
Alg DR2 R2' DR2' BR'
Alg DR2 R' BR2' DR2'
Alg DR2' BR DR2 BR2'
Alg DR2' BR2 BL DR2
Alg DR2' BR2 BL2' DR2
Alg DR2' BR2' BL' DR2
Alg D B2' BL2' B2 D'
Alg D2 B2 DL2 B2' D2'
Alg D2' FL2 L' FL2 D2
Alg D2' FL2' L D2 FL'
Alg D2' FL2' L FL2' D2
Alg D2' FL2' L2' BL2 D2
Alg B2' DR B2
Alg B2' DR2 B2
Alg B2' DR2' B2
Alg B2' DR' B2
Alg B' DR' B
Alg B2' DR FR B2
Alg B2' DR FR2 B2
Alg B2' DR FR2' B2
Alg B2' DR FR' B2
Alg B2' DR2 R B2
Alg B2' DR2 R2 B2
Alg B2' DR2 R2' B2
Alg B2' DR2 R' B2
Alg B2' DR2' B2 BR
Alg B2' DR2' B2 BR2
Alg B2' DR2' B2 BR2'
Alg B2' DR2' B2 BR'
Alg B2' DR' B2 BL2
Alg B2' DR' B2 BL2'
Alg B2' DR' B2 BL'
Alg B' DR2' BR' B
Alg B' DR' B BR
Alg B' DR' B BR2'
Alg B' DR' B BR'
Alg D2' FR2' FL FR2 D2
Alg D2' FR2' FL2 FR2 D2
Alg D2' FR2' FL2' FR2 D2
Alg D' DR2' FR DR2 D
Alg D' DR2' FR2 DR2 D
Alg D' DR' FR' DR D
Alg D' FR D' FL' D2
Alg B2 D2 DL2 D2' B2'
Alg B2 D2 DL2' D2' B2'
Alg B2 D2 DL' D2' B2'
Alg B2 D' FR' D B2'
Alg B2 DL D2' DL' B2'
Alg B2 DL D' DL' B2'
Alg B2' DR FR2' B2 F2
Alg B2' DR FR2' B2 F2'
Alg B2' DR FR' R B2
Alg B2' DR FR' R2 B2
Alg B2' DR2 R2' B2 U
Alg B2' DR2 R2' B2 U2
Alg B2' DR2 R2' B2 U2'
Alg B2' DR' B2 BL2 U'
Alg B' DR2' BR' B BL2'
Alg DR D FR D' DR'
Alg DL2' B D B' DL2
Alg D2' FR2' FL2' FR2 F D2
Alg D' DR2' FR DR2 D FL2'
Alg B2 D B D' DR B2
Alg FR
Alg FR2
Alg FR2'
Alg FR'
Alg FR2 FL
Alg FR2 FL2
Alg FR2 FL2'
Alg FR2 FL'
Alg FR2' F
Alg FR2' F2
Alg FR2' F2'
Alg FR2' F'
Alg FR' R
Alg FR' R2
Alg FR' R2'
Alg FR' R'
Alg D FR D'
Alg DR R DR'
Alg DR R2' DR'
Alg DR R' DR'
Alg DR2 BR2 DR2'
Alg DR2 BR2' DR2'
Alg DR2 BR' DR2'
Alg FR2 FL2' L
Alg FR2 FL2' L2
Alg FR2 FL2' L2'
Alg FR2 FL' F
Alg FR2 FL' F2
Alg FR2 FL' F'
Alg FR2' F FL
Alg FR2' F FL2'
Alg FR2' F FL'
Alg FR2' F2' U
Alg FR2' F2' U2
Alg FR2' F2' U2'
Alg FR2' F' R2'
Alg FR' R2' BR'
Alg DR R DR' FR
Alg DR R DR' FR2
Alg DR R2' DR' U2'
Alg DR R' DR' BR2
Alg DR R' DR' BR2'
Alg DR R' DR' BR'
Alg DR2 BR2' BL2' DR2'
Alg DR2 BR2' BL' DR2'
Alg FR2 FL' F L2
Alg FR2 FL' F L2'
Alg B' DR2 BR' DR2' B
Alg DR R2' U2' BL2 DR'
Alg D' FL D
Alg D' FL2 D
Alg D' FL2' D
Alg D' FL' D
Alg FR FL FR'
Alg FR FL2 FR'
Alg FR FL2' FR'
Alg FR FL' FR'
Alg FR2 F2 FR2'
Alg FR2 F2' FR2'
Alg FR2' R FR2
Alg FR2' R2 FR2
Alg FR2' R2' FR2
Alg D FR2 D' FR2'
Alg D FR2' D' FR2
Alg D' FL D FL'
Alg D' FL2 D FL'
Alg D' FL2 L D
Alg D' FL2 L2 D
Alg D' FL2 L2' D
Alg D' FL2 L' D
Alg D' FL2' F2' D
Alg D' FL2' L2 D
Alg D' FL2' L2' D
Alg D' FL2' L' D
Alg D' FL' F2' D
Alg FR FL2' F' FR'
Alg FR FL2' FR' L
Alg FR FL2' FR' L2
Alg FR FL2' FR' L2'
Alg FR2 F2 FR2' U2
Alg FR2 F2 FR2' U2'
Alg FR2 F2' FR2' U2'
Alg FR2 F2' FR2' R
Alg FR2 F2' FR2' R2
Alg FR2 F2' FR2' R2'
Alg FR2 F2' FR2' R'
Alg FR2 F' R2' FR2'
Alg FR2' R FR2 R2'
Alg FR2' R2 BR FR2
Alg FR2' R2 BR2 FR2
Alg FR2' R2 BR2' FR2
Alg FR2' R2' BR2' FR2
Alg FR2' R2' BR' FR2
Alg D DR2' BR2' DR2 D'
Alg D FR2' D' FR2 FL2
Alg D2' B DL B' D2
Alg D2' B2' D' B2 D2'
Alg D' FL2 L BL D
Alg D' FL2 L' FL2 D
Alg D' FL2' F2' R' D
Alg D' FL2' L FL2' D
Alg D' FL2' L2' BL2 D
Alg DR2' FR DR2
Alg DR2' FR2 DR2
Alg DR2' FR2' DR2
Alg DR2' FR' DR2
Alg DR' FR' DR
Alg DR2' FR FL DR2
Alg DR2' FR FL2 DR2
Alg DR2' FR FL2' DR2
Alg DR2' FR FL' DR2
Alg DR2' FR2 DR2 F
Alg DR2' FR2 DR2 F2
Alg DR2' FR2 DR2 F2'
Alg DR2' FR2 DR2 F'
Alg DR2' FR2' DR2 R
Alg DR2' FR2' DR2 R2
Alg DR2' FR2' DR2 R2'
Alg DR2' FR2' DR2 R'
Alg DR2' FR' DR2 BR2
Alg DR2' FR' DR2 BR2'
Alg DR2' FR' DR2 BR'
Alg DR' FR2' R' DR
Alg DR' FR' DR R
Alg DR' FR' DR R2'
Alg DR' FR' DR R'
Alg D' FR2' FL FR2 D
Alg D' FR2' FL2 FR2 D
Alg D' FR' FL' FR D
Alg B2' DR2 FR' DR2' B2
Alg B' DR2 FR' DR2' B
Alg DR2 D' FL' D DR2'
Alg DR2' FR FL2' DR2 L
Alg DR2' FR FL2' DR2 L2
Alg DR2' FR FL2' DR2 L2'
Alg DR2' FR FL' DR2 F
Alg DR2' FR FL' DR2 F2
Alg DR2' FR2 F FL2 DR2
Alg DR2' FR2 DR2 F2' U
Alg DR2' FR2 DR2 F2' U2
Alg DR2' FR2 DR2 F2' U2'
Alg DR2' FR' DR2 BR2 U'
Alg DR2' FR' DR2 BR2' BL2'
Alg DR' FR2' R' DR BR2'
Alg D' FR2' FL2 FR2 L D
Alg D' FR2' FL2 FR2 L2 D
Alg B2' DR2' FR2' R' DR2 B2
Alg DR2 D DR D' FR DR2
Alg DR2' FR' DR2 BR2 U' BL2
Alg FL
Alg FL2
Alg FL2'
Alg FL'
Alg FL L
Alg FL L2
Alg FL L2'
Alg FL L'
Alg FL2 F
Alg FL2 F2
Alg FL2 F2'
Alg FL2 F'
Alg FR2' FL2' FR2
Alg FR' FL2' FR
Alg FL L2 BL
Alg FL L2 BL2
Alg FL L2 BL2'
Alg FL L2 BL'
Alg FL L2' U
Alg FL L2' U2
Alg FL L2' U2'
Alg FL L' F
Alg FL L' F2
Alg FL L' F'
Alg FL2 F L
Alg FL2 F L2
Alg FL2 F L2'
Alg FL2 F L'
Alg FL2 F2' R
Alg FL2 F2' R2
Alg FL2 F2' R2'
Alg FR' FL2 F' FR
Alg FL L2 BL2' BR
Alg FL L2 BL2' BR2
Alg FL L2 BL' U
Alg FL L2' U BL2
Alg FL L2' U BL2'
Alg FL L2' U BL'
Alg FL L2' U2' R
Alg FL L2' U2' R2
Alg FL L' F' FL
Alg FL L' F' FL2
Alg FL L' F' FL2'
Alg B DL2' BL DL2 B'
Alg FL L2 BL' U BR2'
Alg FL2 L FL2'
Alg FL2 L2 FL2'
Alg FL2 L2' FL2'
Alg FL2 L' FL2'
Alg FL2' F2 FL2
Alg FL2' F2' FL2
Alg FL2' F' FL2
Alg FR2' FL' FR2 FL
Alg FL2 L2 FL2' L2'
Alg FL2 L2 FL2' L'
Alg FL2 L2 FL2' BL
Alg FL2 L2 FL2' BL2
Alg FL2 L2 FL2' BL2'
Alg FL2 L2 FL2' BL'
Alg FL2 L2' FL2' U
Alg FL2 L2' FL2' U2
Alg FL2 L2' FL2' U2'
Alg FL2 L2' FL2' BL
Alg FL2 L2' FL2' BL2
Alg FL2 L2' FL2' BL2'
Alg FL2 L2' FL2' BL'
Alg FL2 L' FL2' U
Alg FL2 L' FL2' U2'
Alg FL2 L' FL2' F
Alg FL2 L' FL2' F2
Alg FL2 L' FL2' F2'
Alg FL2 L' FL2' F'
Alg FL2' F L FL2
Alg FL2' F L' FL2
Alg FL2' F2 L FL2
Alg FL2' F2 L2 FL2
Alg FL2' F2 L2' FL2
Alg FL2' F2 FL2 F'
Alg FL2' F2 FL2 L2
Alg FL2' F2' R FL2
Alg FL2' F2' R2 FL2
Alg FL2' F2' R2' FL2
Alg FL2' F' R2' FL2
Alg FL2' F' R' FL2
Alg FL' FR2' FL FR2
Alg D DR2' FR2' DR2 D'
Alg D FR2' R' FR2 D'
Alg D' DL2 BL2 DL2' D
Alg B2 D2' B D2 B2
Alg DR2 D2 DR D2' DR2
Alg FR2 D FR D' FR2
Alg FL2 L2 BL' L2 FL2'
Alg FL2 L2 FL2' BL2 BR
Alg FL2 L2' BL L2' FL2'
Alg FL2 L2' FL2' BL L'
Alg DL FL DL'
Alg DL FL2 DL'
Alg DL FL2' DL'
Alg DL FL' DL'
Alg DL2 FL DL2'
Alg DL FL DL' L
Alg DL FL DL' L2
Alg DL FL DL' L2'
Alg DL FL DL' L'
Alg DL FL2 L DL'
Alg DL FL2 L2 DL'
Alg DL FL2 L2' DL'
Alg DL FL2 L' DL'
Alg DL FL2 DL' L
Alg DL FL2' DL' F2
Alg DL FL2' DL' F2'
Alg DL FL2' DL' F'
Alg DL2 FL DL2' BL
Alg DL2 FL DL2' BL2
Alg DL2 FL DL2' BL2'
Alg B DL2' FL DL2 B'
Alg B2 DL2' FL DL2 B2'
Alg FL2 F2 L' F2' FL2'
Alg FL2 F2' L' F2 FL2'
Alg FL2 F' L' F FL2'
Alg FL2' FR2' FL FR2 FL2
Alg FL2' FR' F' FR FL2
Alg DL FL DL' L BL2'
Alg DL FL DL' L BL'
Alg DL FL DL' L2 U2
Alg DL FL DL' L2 U2'
Alg DL FL2 L2' DL' U2
Alg DL FL2 L2' DL' U2'
Alg DL FL2 L' DL' F'
Alg DL FL2' DL' F2' R2
Alg DL FL2' DL' F2' R2'
Alg DL2 FL DL2' BL2 BR2
Alg B DL2 FL DL2' BL B'
Alg FL2 F2' L' F2 R2 FL2'
Alg FL2 F2' L' F2 R2' FL2'
Alg FL2' FR' F FR L FL2
Alg DL FL DL' L BL2' BR2
Alg DL FL2 L DL FL' DL2'
Alg FR F FR'
Alg FR F2 FR'
Alg FR F2' FR'
Alg FR F' FR'
Alg FR2 R FR2'
Alg FR2 R2 FR2'
Alg FR2 R2' FR2'
Alg FR2 R' FR2'
Alg FL2' L FL2
Alg FL2' L2 FL2
Alg FL2' L2' FL2
Alg FL' F FL
Alg FL' F2 FL
Alg FL' F' FL
Alg FR F FR' F'
Alg FR F2 FR' L
Alg FR F2' FR' U
Alg FR F2' FR' U2
Alg FR F2' FR' U2'
Alg FR F' FR' R
Alg FR F' FR' R2
Alg FR F' FR' R2'
Alg FR F' FR' R'
Alg FR2 R FR2' F2
Alg FR2 R FR2' R'
Alg FR2 R2' BR FR2'
Alg FR2 R2' BR2 FR2'
Alg FR2 R2' BR2' FR2'
Alg FR2 R2' BR' FR2'
Alg FL2' L2 FL2 BL
Alg FL2' L2 FL2 BL2
Alg FL2' L2' FL2 U
Alg FL' F L2 FL
Alg FL' F L2' FL
Alg FL' F FL L
Alg DR' FR2 R' FR2' DR
Alg FR F2' U2' BR FR'
Alg FR F2' U2' BR2 FR'
Alg FR F' FR R' FR2'
Alg FL2' L2' FL2 U BL2
Alg FL2' L2' FL2 U BL2'
Alg FR F L F' FR'
Alg FR F L2 F' FR'
Alg FR F L2' F' FR'
Alg FR F L' F' FR'
Alg FR F2 U F2' FR'
Alg FR F2 U2 F2' FR'
Alg FR F2 U2' F2' FR'
Alg FR F2' R F2 FR'
Alg FR F2' R2 F2 FR'
Alg FR F2' R2' F2 FR'
Alg FR FL' L FL FR'
Alg FR FL' L2 FL FR'
Alg FR FL' L' FL FR'
Alg FR2 F2' L F2 FR2'
Alg FR2 F2' L2 F2 FR2'
Alg FR2 F' U2 F FR2'
Alg FR2 F' U2' F FR2'
Alg FR2 R U R' FR2'
Alg FR2 R U' R' FR2'
Alg FR2 R2 BR2 R2' FR2'
Alg FR2 R2 BR2' R2' FR2'
Alg FR2' DR BR DR' FR2
Alg FR2' R2' U R2 FR2
Alg FR2' R2' U2 R2 FR2
Alg FR2' R' BR2 R FR2
Alg FR2' R' BR2' R FR2
Alg FR2' R' BR' R FR2
Alg FL2 L BL L' FL2'
Alg FL2 L2 U2' L2' FL2'
Alg FL2 DL' BL2 DL FL2'
Alg FL2' F2 R2' F2' FL2
Alg FL2' L2' BL2 L2 FL2
Alg FL' F2 L F2' FL
Alg FL' F2 L2 F2' FL
Alg FL' F' R' F FL
Alg FL' FR R' FR' FL
Alg FR F L2' F' FR' BL
Alg FR F L2' F' FR' BL2
Alg FR F L' F' FR' F'
Alg FR F2 U2 BR2 F2' FR'
Alg FR F2 U2 BR2' F2' FR'
Alg FR F2' R F2 R2' FR'
Alg FR F2' R2' F2 FR' R'
Alg FR FL' L FL FR' F'
Alg FR2 F' U2 F FR2' L2'
Alg FR F L2 BL' L2 F' FR'
Alg FR F L2' F U' F2' FR'
Alg R
Alg R2
Alg R2'
Alg R'
Alg R2 F
Alg R2 F2
Alg R2 F2'
Alg R2 F'
Alg R2' U
Alg R2' U2
Alg R2' U2'
Alg R2' U'
Alg R' BR
Alg R' BR2
Alg R' BR2'
Alg R' BR'
Alg DR BR DR'
Alg DR BR2' DR'
Alg DR BR' DR'
Alg FR R FR'
Alg R2 F2' L
Alg R2 F2' L2
Alg R2 F2' L2'
Alg R2 F' U
Alg R2 F' U2
Alg R2 F' U'
Alg R2' U F
Alg R2' U F2'
Alg R2' U F'
Alg R2' U2' BL
Alg R2' U2' BL2
Alg R2' U2' BL2'
Alg R2' U' BR2'
Alg DR BR DR' R
Alg DR BR DR' R2
Alg DR BR2' BL2' DR'
Alg DR BR2' BL' DR'
Alg R2 F' U L2
Alg R2 F' U L2'
Alg FR' F FR
Alg FR' F2 FR
Alg FR' F2' FR
Alg FR' F' FR
Alg R F R'
Alg R F2 R'
Alg R F2' R'
Alg R F' R'
Alg R2 U2 R2'
Alg R2 U2' R2'
Alg R2' BR R2
Alg R2' BR2 R2
Alg R2' BR2' R2
Alg FR R2 FR' R2'
Alg FR R2' FR' R2
Alg FR' F FR F'
Alg FR' F2 FR F'
Alg FR' F2 FR L
Alg FR' F2 FR L2
Alg FR' F2 FR L2'
Alg FR' F2 FR L'
Alg FR' F2' FR U2'
Alg FR' F2' FR L2
Alg FR' F2' FR L2'
Alg FR' F2' FR L'
Alg FR' F' FR U2'
Alg R F2' U' R'
Alg R F2' R' L
Alg R F2' R' L2
Alg R F2' R' L2'
Alg R2 U2 R2' BL2
Alg R2 U2 R2' BL2'
Alg R2 U2' BR R2'
Alg R2 U2' BR2 R2'
Alg R2 U2' R2' BL2'
Alg R2 U2' R2' BR2'
Alg R2 U2' R2' BR'
Alg R2 U' BR2' R2'
Alg R2' BR R2 BR2'
Alg DR BR2 BL2' BR2' DR'
Alg FR R2' FR' R2 F2
Alg FR' F2 L' F2 FR
Alg FR' F2' U2' BR' FR
Alg FR' F2' L F2' FR
Alg DR' R DR
Alg DR' R2 DR
Alg DR' R2' DR
Alg DR' R' DR
Alg DR' R DR F
Alg DR' R DR F2
Alg DR' R DR F2'
Alg DR' R DR F'
Alg DR' R2 DR U
Alg DR' R2 DR U2
Alg DR' R2 DR U2'
Alg DR' R2 DR U'
Alg DR' R2' DR BR
Alg DR' R2' DR BR2
Alg DR' R2' DR BR2'
Alg DR' R2' DR BR'
Alg DR' R' DR BR
Alg DR' R' DR BR2'
Alg DR' R' DR BR'
Alg B2' DR2' R' DR2 B2
Alg DR2' FR' F FR DR2
Alg DR2' FR' F2 FR DR2
Alg DR2' FR' F' FR DR2
Alg DR' R DR F2' L
Alg DR' R DR F2' L2
Alg DR' R DR F2' L2'
Alg DR' R DR F' U
Alg DR' R DR F' U2
Alg DR' R DR F' U'
Alg DR' R2 U2' BL DR
Alg DR' R2 U2' BL2 DR
Alg DR' R2 U2' BL2' DR
Alg DR' R2 DR U F2
Alg DR' R' DR BR2' BL2'
Alg DR2' FR' F2 FR DR2 L
Alg DR2' FR' F2 FR DR2 L2
Alg DR' FR' F' FR R' DR
Alg BR
Alg BR2
Alg BR2'
Alg BR'
Alg BR2' U
Alg BR2' U2
Alg BR2' U2'
Alg BR2' U'
Alg BR' BL
Alg BR' BL2
Alg BR' BL2'
Alg BR' BL'
Alg B BL B'
Alg B BL2' B'
Alg B BL' B'
Alg BR2' U2 F
Alg BR2' U2 F2
Alg BR2' U2 F2'
Alg BR2' U2 F'
Alg BR2' U2' L
Alg BR2' U2' L2
Alg BR2' U2' L2'
Alg BR2' U' BL2'
Alg BR' BL U
Alg BR' BL U2
Alg BR' BL U2'
Alg BR' BL U'
Alg B BL B' BR
Alg B BL B' BR2
Alg B BL B' BR2'
Alg B BL2' L2' B'
Alg B BL2' L' B'
Alg BR2' U2' L F2
Alg BR2' U2' L F2'
Alg BR2' U2' L F'
Alg BR2 U BR2'
Alg BR2 U2 BR2'
Alg BR2 U2' BR2'
Alg BR2 U' BR2'
Alg BR2' BL BR2
Alg BR2' BL2 BR2
Alg BR2' BL2' BR2
Alg BR R BR' R'
Alg BR2 U BR2' U2'
Alg BR2 U BR2' U'
Alg BR2 U BR2' F
Alg BR2 U BR2' F2
Alg BR2 U BR2' F2'
Alg BR2 U BR2' F'
Alg BR2 U2 BR2' F
Alg BR2 U2 BR2' F2
Alg BR2 U2 BR2' F2'
Alg BR2 U2 BR2' F'
Alg BR2 U2 BR2' L
Alg BR2 U2 BR2' L2
Alg BR2 U2 BR2' L2'
Alg BR2 U2' BL BR2'
Alg BR2 U2' BL2 BR2'
Alg BR2 U2' BL' BR2'
Alg BR2 U2' BR2' L
Alg BR2 U2' BR2' L2'
Alg BR2 U2' BR2' BL2'
Alg BR2 U2' BR2' BL'
Alg BR2 U' BL BR2'
Alg BR2 U' BL2' BR2'
Alg BR2 U' BL' BR2'
Alg BR2' BL BR2 U2
Alg BR2' BL BR2 U2'
Alg BR2' BL BR2 BL2'
Alg BR2' BL BR2 BL'
Alg B BL2 L2' BL2' B'
Alg DR' R2 F R2' DR
Alg BR2 U F' U2' BR2'
Alg BR2 U BR2' U2' BL'
Alg BR2 U2 F U' BR2'
Alg BR2 U2 BR2' L F2'
Alg B' BR B
Alg B' BR2 B
Alg B' BR2' B
Alg B' BR' B
Alg B' BR2 B U
Alg B' BR2 B U2
Alg B' BR2 B U2'
Alg B' BR2 B U'
Alg B' BR2' B BL
Alg B' BR2' B BL2
Alg B' BR2' B BL2'
Alg B' BR2' B BL'
Alg B' BR' B BL
Alg B' BR' B BL2'
Alg B' BR' B BL'
Alg B' BR2 U2' L B
Alg B' BR2 U2' L2 B
Alg B' BR2 U2' L2' B
Alg B' BR2 B U2 F
Alg B' BR2 B U2 F2
Alg B' BR2 B U2 F2'
Alg B' BR2 B U2 F'
Alg B' BR2' B BL U
Alg B' BR2' B BL U2
Alg B' BR2' B BL U2'
Alg B' BR2' B BL U'
Alg B' BR' B BL2' L2'
Alg B' BR' B BL2' L'
Alg BR2 R U R' BR2'
Alg B' BR2 U2' L B F2'
Alg B' BR2 U2' L B F'
Alg B' BR' B BR2 BL BR2'
Alg B' BR2 U R BR' R' B
Alg BR U BR'
Alg BR U2 BR'
Alg BR U2' BR'
Alg BR U' BR'
Alg BR2 BL BR2'
Alg BR2 BL2 BR2'
Alg BR2 BL2' BR2'
Alg BR2 BL' BR2'
Alg R2' F R2
Alg R2' F2 R2
Alg R2' F2' R2
Alg R' U R
Alg R' U2 R
Alg R' U' R
Alg BR U BR' U'
Alg BR U2 BR' F
Alg BR U2' BR' L
Alg BR U2' BR' L2
Alg BR U2' BR' L2'
Alg BR U' BL BR'
Alg BR U' BL2 BR'
Alg BR U' BL2' BR'
Alg BR U' BR' BL'
Alg BR2 BL BR2' U2
Alg BR2 BL BR2' BL'
Alg R2' F2' R2 L
Alg R2' F2' R2 L2
Alg R' U F2 R
Alg R' U F2' R
Alg R' U R F
Alg BR U' BR BL' BR2'
Alg BR U F U' BR'
Alg BR U F2 U' BR'
Alg BR U F2' U' BR'
Alg BR U F' U' BR'
Alg BR U2 L U2' BR'
Alg BR U2 L2 U2' BR'
Alg BR U2 L2' U2' BR'
Alg BR U2' BL U2 BR'
Alg BR U2' BL2 U2 BR'
Alg BR U2' BL2' U2 BR'
Alg BR R' F R BR'
Alg BR R' F2 R BR'
Alg BR R' F' R BR'
Alg BR2 U2' F U2 BR2'
Alg BR2 U2' F2 U2 BR2'
Alg BR2 U' L2 U BR2'
Alg BR2 U' L2' U BR2'
Alg BR2 BL L BL' BR2'
Alg BR2 BL L' BL' BR2'
Alg BR2' BL2' L BL2 BR2
Alg BR2' BL2' L2 BL2 BR2
Alg R2 F2 L F2' R2'
Alg R2 F2 L2 F2' R2'
Alg R2 F2 L2' F2' R2'
Alg R2' U2 BL2' U2' R2
Alg R' U2 F U2' R
Alg R' U2 F2 U2' R
Alg R' U' BL' U R
Alg R' BR BL' BR' R
Alg BR U F' U' BR' U'
Alg BR U2 L' BL2 U2' BR'
Alg BR U2' BL U2 BL2' BR'
Alg BR U2' BL2' U2 BR' BL'
Alg BR R' F R BR' U'
Alg BR2 U' L2 U BR2' F2'
Alg BR2 U' L2 U BR2' F'
Alg BR U F2' U L' U2' BR'
Alg BR U F2' L' F U' BR'
Alg F
Alg F2
Alg F2'
Alg F'
Alg F L
Alg F L2
Alg F L2'
Alg F L'
Alg F2 U
Alg F2 U2
Alg F2 U2'
Alg F2 U'
Alg F L2' BL
Alg F L2' BL2
Alg F L2' BL2'
Alg F L' U
Alg F L' U2
Alg F L' U2'
Alg F L' U'
Alg F2 U L
Alg F2 U L2
Alg F2 U L2'
Alg F2 U L'
Alg F L' U BL2
Alg F L' U BL2'
Alg F L' U BL'
Alg F L' U' F
Alg F L' U' F2
Alg F L' U' F2'
Alg F2 L F2'
Alg F2 L2 F2'
Alg F2 L2' F2'
Alg F2 L' F2'
Alg F2' U2 F2
Alg F2' U2' F2
Alg F2' U' F2
Alg F2 L2 F2' L2'
Alg F2 L2 F2' L'
Alg F2 L2' BL F2'
Alg F2 L2' BL2 F2'
Alg F2 L2' BL2' F2'
Alg F2 L' F2' U
Alg F2 L' F2' U2
Alg F2 L' F2' U2'
Alg F2 L' F2' U'
Alg F2 L' BL F2'
Alg F2 L' BL2 F2'
Alg F2 L' BL2' F2'
Alg F2' U L F2
Alg F2' U L2 F2
Alg F2' U L' F2
Alg F2' U2 F2 U2'
Alg F2' U2 F2 U'
Alg F2' U2 F2 L2
Alg F2' U2 F2 L2'
Alg F2' U2 F2 L'
Alg F2' U2 L F2
Alg F' R' F R
Alg F L2 BL L2' F'
Alg F L2 BL2 L2' F'
Alg F2 L2 F2' L2' U2'
Alg F2 L2' BL' L F2'
Alg F2 L' F U2' F2
Alg F2 L' F' U' F'
Alg FL F FL'
Alg FL F2 FL'
Alg FL F2' FL'
Alg FL F' FL'
Alg FL F FL' L
Alg FL F FL' L2
Alg FL F FL' L2'
Alg FL F FL' L'
Alg FL F2 FL' L
Alg FL F2 FL' L2
Alg FL F2 FL' L2'
Alg FL F2 FL' L'
Alg FL F2' FL' U2
Alg FL F2' FL' U2'
Alg FL F2' FL' U'
Alg F2 U2 L' U2' F2'
Alg F2 U2' L' U2 F2'
Alg F2 U' L' U F2'
Alg FL F FL' L2 BL
Alg FL F FL' L2 BL2
Alg FL F FL' L2 BL2'
Alg FL F2 FL' L2' BL
Alg FL F2 FL' L2' BL2
Alg FL F2 FL' L2' BL2'
Alg FL F2 FL' L' U'
Alg FL F FL' F2' L' F2
Alg F2 U F U L U2' F2'
Alg F2' L F2
Alg F2' L2 F2
Alg F2' L2' F2
Alg F2' L' F2
Alg F' U F
Alg F' U2 F
Alg F' U2' F
Alg F' U' F
Alg R U R'
Alg R U2' R'
Alg R U' R'
Alg F R' F' R
Alg F2' L F2 L'
Alg F2' L2' BL F2
Alg F2' L2' BL2 F2
Alg F2' L2' BL2' F2
Alg F' U F U'
Alg F' U F L
Alg F' U F L2
Alg F' U F L2'
Alg F' U F L'
Alg R U2' R' BL2
Alg R U2' R' BL2'
Alg R U2' R' BL'
Alg F2' L' F U' F
Alg F2 L2 BL L2' F2'
Alg F2 L2 BL2 L2' F2'
Alg F2 L2 BL2' L2' F2'
Alg F2 L2 BL' L2' F2'
Alg F2' U BL U' F2
Alg F2' U BL' U' F2
Alg F2' L' BL L F2
Alg F2' L' BL2 L F2
Alg F2' L' BL2' L F2
Alg F2' L' BL' L F2
Alg F' U2 L U2' F
Alg F' U2 L2 U2' F
Alg F' U2 L2' U2' F
Alg F' U2' BL2 U2 F
Alg R U L U' R'
Alg R U L' U' R'
Alg R F' L F R'
Alg R2 U2' L2 U2 R2'
Alg R2 U' BL2 U R2'
Alg R2 U' BL2' U R2'
Alg R2 U' BL' U R2'
Alg R2 BR BL' BR' R2'
Alg F2 L2 BL2' L2' F2' U2
Alg F2' U BL U' F2 L
Alg F2' U BL' U' F2 L2
Alg F2' U BL' U' F2 L2'
Alg F2' L' BL L F2 U2
Alg F2' L' BL L F2 U2'
Alg F2' L' BL' L F2 U
Alg F2' L' BL' L F2 U2
Alg F' U2 L' U BL2' U2 F
Alg F' U2' BL L' BL2' U2 F
Alg U
Alg U2
Alg U2'
Alg U'
Alg U L
Alg U L2
Alg U L2'
Alg U L'
Alg U2 BL
Alg U2 BL2
Alg U2 BL2'
Alg U2 BL'
Alg U L' BL
Alg U L' BL2
Alg U L' BL2'
Alg U L' BL'
Alg U2 BL L
Alg U2 BL L2
Alg U2 BL L2'
Alg U2 BL L'
Alg U F' L F
Alg U L' BL' U
Alg U L' BL' U2
Alg U2 L U2'
Alg U2 L2 U2'
Alg U2 L2' U2'
Alg U2 L' U2'
Alg U2' BL2 U2
Alg U2' BL2' U2
Alg U2' BL' U2
Alg U2 L2 U2' L2'
Alg U2 L2 U2' L'
Alg U2 L' U2' BL
Alg U2 L' U2' BL2
Alg U2 L' U2' BL2'
Alg U2 L' U2' BL'
Alg U2' BL L U2
Alg U2' BL L2 U2
Alg U2' BL L2' U2
Alg U2' BL L' U2
Alg U2' BL2 U2 L2
Alg U2' BL2 U2 L2'
Alg U2' BL2 U2 L'
Alg U2' BL2 U2 BL2'
Alg U2' BL2 U2 BL'
Alg U2' BL2 L U2
Alg U' BR' U BR
Alg U2 L' U BL2' U2
Alg U2 L2' U2' L2 BL2
Alg U2 L2' U2' L2 BL2'
Alg U2 L' U' BL' U'
Alg U2' BL2 U' L U2'
Alg F U F'
Alg F U2 F'
Alg F U2' F'
Alg F U' F'
Alg F U F' L
Alg F U F' L2
Alg F U F' L2'
Alg F U F' L'
Alg F U2 F' L
Alg F U2 F' L2
Alg F U2 F' L2'
Alg F U2 F' L'
Alg F U2' BL2 F'
Alg F U2' BL2' F'
Alg F U2' BL' F'
Alg U2 BL2 L' BL2' U2'
Alg U2 BL' L' BL U2'
Alg U2 BL2' L' BL2 U2'
Alg F U2 F' L' BL'
Alg F U F' U2' L' U2
Alg U2 L U2 L2' U' BL' U2
Alg U2' L U2
Alg U2' L2 U2
Alg U2' L2' U2
Alg U2' L' U2
Alg U' BL U
Alg U' BL2 U
Alg U' BL2' U
Alg U' BL' U
Alg BR BL BR'
Alg BR BL2' BR'
Alg BR BL' BR'
Alg U BR' U' BR
Alg U2' L U2 L'
Alg U' BL U L
Alg U' BL U L2
Alg U' BL U L2'
Alg U' BL U L'
Alg U' BL U BL'
Alg U2' L' U BL' U
Alg U' BL2 L BL2' U
Alg U' BL2 L2 BL2' U
Alg U' BL2 L2' BL2' U
Alg U' BL2 L' BL2' U
Alg BR U' L U BR'
Alg BR U' L2 U BR'
Alg BR U' L2' U BR'
Alg BR U' L' U BR'
Alg BR BL L BL' BR'
Alg BR BL L' BL' BR'
Alg BR2 BL2' L BL2 BR2'
Alg BR2 BL2' L2 BL2 BR2'
Alg U2' L BL2' L' BL2 U2
Alg U2' L2 F' L2' F U2
Alg U2' L' DL L DL' U2
Alg U2' BL2' L BL2 L' U2
Alg U2' BL2' L2 BL2 L2' U2
Alg U' BL2 L BL2' U BL
Alg U' BL2 L2 BL2' U L
Alg U' BL2 L2 BL2' U BL2'
Alg U' BL2 L2 BL2' U BL'
Alg U' BL2 L2 BL2' L2' U
Alg BR BL L' BL' BR' BL2'
Alg BR BL L' BL' BR' BL'
Alg U' BL U BL U' L2' BL2' U
Alg U' BL2 U' L2 U L' BL2' U
Alg L
Alg L2
Alg L2'
Alg L'
Alg L' BL
Alg L' BL2
Alg L' BL2'
Alg L' BL'
Alg U BL U'
Alg U BL2 U'
Alg U BL2' U'
Alg U BL' U'
Alg U BL U' L
Alg U BL U' L2
Alg U BL U' L2'
Alg U BL U' L'
Alg U BL U' BL'
Alg L2' BL L2
Alg L2' BL2 L2
Alg L2' BL2' L2
Alg L2' BL' L2
Alg L2 DL L2' DL'
Alg L2' BL L2 BL2'
Alg L2' BL L2 BL'
Alg F' L2 BL L2' F
Alg F' L2 BL2 L2' F
Alg F' L2 BL2' L2' F
Alg F' L2 BL' L2' F
Alg L2 DL L' DL' L'
Alg L2' U BL2' U' L2
Alg L2' BL L2' BL2' L'
Alg L2' BL L' BL2' L2'
Alg L2' DL L' DL' L2
Alg L' U' L' U L2
Alg U L' DL L DL' U'
Alg F' L2 BL L2' BL2' F
Alg L2 DL' BL DL2 L2' DL'
Alg L2' U BL2' U' BL L2
Alg L2' BL' U BL' U' L2
Alg L2' BL' L2 U' L' U
Alg U' L U
Alg U' L2 U
Alg U' L2' U
Alg U' L' U
Alg U' L2' U BL
Alg U' L2' U BL2
Alg U' L2' U BL2'
Alg U' L2' U BL'
Alg U' L' U BL
Alg U' L' U BL2
Alg U' L' U BL2'
Alg U' L' U BL'
Alg U' L' U L BL L'
Alg U' L' U L2 BL L2'
Alg U' L' U BL U' L2 U
Alg L2 BL L2'
Alg L2 BL2 L2'
Alg L2 BL2' L2'
Alg L2 BL' L2'
Alg L2 BL L2' BL'
Alg L DL L' DL'
Alg DL L DL' L'
Alg L U' L2 U L2
Alg L DL' BL DL L'
Alg L DL' BL2 DL L'
Alg L DL' BL' DL L'
Alg DL L DL' L' BL'
Alg L2 BL L' DL L' DL'
Alg FL' L BL L' FL
Alg FL' L BL2 L' FL
Alg FL' L BL2' L' FL
Alg FL' L BL' L' FL
Alg FL' DL' BL DL FL
Alg FL' DL' BL2 DL FL
Alg FL' DL' BL2' DL FL
Alg FL' DL' BL' DL FL
Alg L2 BL2' U BL2 U' L2'
Alg FL' L BL L' FL BL2'
Alg FL' L BL' L' FL BL
Alg U' F U BL U' F' U
Alg U' F U BL2 U' F' U
Alg U' F U BL2' U' F' U
Alg F' FL2' DL' BL' DL FL2 F
Alg L2' BL2 L2' BL' L2 BL' L2
Alg DL L DL2' BL' DL2 L' DL'
Alg DL2 FL2' DL2 BL' DL2' FL2 DL2'
Alg FL' L U BL2' U' BL L' FL
Alg FL' L2 U' L' U BL2 L' FL
Alg L BL L'
Alg L BL2 L'
Alg L BL2' L'
Alg L BL' L'
Alg DL' BL DL
Alg DL' BL2 DL
Alg DL' BL2' DL
Alg DL' BL' DL
Alg L BL L' BL'
Alg L' DL L DL'
Alg L BL2 L' DL' BL' DL
Alg L U BL2' U' BL2 L'
Alg L BL2' U BL2 U' L'
Alg DL' B' BL2 B BL2' DL
Alg DL' BL2 B' BL2' B DL
Alg U BL2' DL2' BL2 U' BL2' DL2
Alg B' BL2 L2 BL2' B BL2 L2'
Alg L U BL2' U' BL2 L' BL2'
Alg L U BL2' U' BL2 L' BL'
Alg L BL B BL' L' BL B'
Alg L BL2' U BL2 U' L' BL2
Alg L BL' U BL2 U' BL L'
Alg L BL' U BL2' U' BL L'
Alg L BL' U BL' U' BL L'
Alg L2 BL2 L2' BL' L2 BL' L2'
Alg DL' BL B' BL2' B BL' DL
Alg L BL2' L U2 BR' U' BR U' L2'
Alg L BL2' L BL L' BL L BL2' L2'
Alg BL
Alg BL2
Alg BL2'
Alg BL'
Alg U BR BL2 BR' BL2' U'
Alg B BL DL BL' DL' B'
Alg L' BL2' DL' BL2 DL L
Alg BR B BL B' BL' BR'
Alg U BR BL2 BR' BL2' U' BL2
Alg U BL BR BL' BR' U'
Alg U BR BL BR' BL' U'
Alg U' L' BL2' L BL2 U
Alg B' BR' BL2' BR BL2 B
Alg L BL2 U BL2' U' L'
Alg BR B BL2 B' BL2' BR'
Alg U BL2 U' BL' U BL' U'
Alg B BL DL BL DL' BL2' B'
Alg B BL2 DL BL' DL' BL' B'
Alg B' BL' B BL2' B' BL2' B
Alg U BL U' BL2 U BL2 U' BL2
Alg U BR2 B' BR2' U' BR B BR'
Alg BL2 BR B DL' B DL B2' BR'
Alg B BL2' B2' BR B BR' B BL2 B'
Alg U' BL' L' BL L U BL
Alg B' BL2 B BL B' BL2 B
Alg B' BL2' B BL' B' BL2' B
Alg B' BL' BR' BL' BR BL2 B
Alg B' BL2' BR' BL BR BL B
Alg U' BL' L' BL' L BL2 U BL'
Alg L' BL' L' DL L DL' BL L BL
Alg L U BL U' BL' L'
Alg L BL U BL' U' L'
Alg BR' U' BL' U BL BR
Alg L U2 BR' U' BR U' L'
Alg U BL U2' L U L2' BL L BL2'
Alg U' L2 F' L' F2 U' F' U2 L'
Alg U BR' U' L U BR U' L'
Alg U BR B BR' U' BR B' BR'
Alg U' L U BR' U' L' U BR
Alg B DL' B' BR B DL B' BR'
Alg L' DL' B DL L DL' B' DL
Alg BR B BR' U BR B' BR' U'
Alg BR B DL' B' BR' B DL B'
Alg U BR2' U2 L2 U2' BR2 U2 L2' U2
Alg U2' L2 U2' BR2' U2 L2' U2' BR2 U'
Alg U BL' B' BL U' L U2 BL' B BL U2' L'
Alg U BR' U' L F' L2' U BR U' L2 F L'
Alg U BR U' L U BR' U' L'
Alg U' BL2 B BL2' U BL2 B' BL2'
Alg L U BR U' L' U BR' U'
Alg L BL2' B' BL2 L' BL2' B BL2
Alg U BR' U2 L2 U2' BR U2 L2' U2
Alg L' BL2 L2' F' L2 BL2' L2' F L2'
Alg U BL2' U R U' BL2 U' L U2 R' U2' L'
Alg U BR U' L2 F L' U BR' U' L F' L2'
Alg U L' BL2 L' FL' L BL2' L U' L2' FL L2
Alg U BR2' U R' U2' L U2 R U' BR2 U' L'`,
  );
}
