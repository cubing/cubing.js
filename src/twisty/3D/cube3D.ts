import { BackSide, BoxGeometry, DoubleSide, Euler, Group, Matrix4, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Quaternion, Vector3 } from "three";
import { BlockMove } from "../../alg";
import { KPuzzleDefinition, Puzzles, Transformation } from "../../kpuzzle";

import { Cursor } from "../cursor";
import { smootherStep } from "../easing";
import { Puzzle } from "../puzzle";

import { TAU, Twisty3D } from "./twisty3D";

class AxisInfo {
  public stickerMaterial: MeshBasicMaterial;
  public hintStickerMaterial: MeshBasicMaterial;
  constructor(public vector: Vector3, public fromZ: Euler, public color: number) {
    // TODO: Make sticker material single-sided when cubie base is rendered?
    this.stickerMaterial = new MeshBasicMaterial({ color, side: DoubleSide });
    this.hintStickerMaterial = new MeshBasicMaterial({ color, side: BackSide });
  }
}

const axesInfo: AxisInfo[] = [
  new AxisInfo(new Vector3(0, 1, 0), new Euler(-TAU / 4, 0, 0), 0xffffff),
  new AxisInfo(new Vector3(-1, 0, 0), new Euler(0, -TAU / 4, 0), 0xff8800),
  new AxisInfo(new Vector3(0, 0, 1), new Euler(0, 0, 0), 0x00ff00),
  new AxisInfo(new Vector3(1, 0, 0), new Euler(0, TAU / 4, 0), 0xff0000),
  new AxisInfo(new Vector3(0, 0, -1), new Euler(0, TAU / 2, 0), 0x0000ff),
  new AxisInfo(new Vector3(0, -1, 0), new Euler(TAU / 4, 0, 0), 0xffff00),
];

const face: { [s: string]: number } = {
  U: 0,
  L: 1,
  F: 2,
  R: 3,
  B: 4,
  D: 5,
};

const familyToAxis: { [s: string]: number } = {
  U: face.U, u: face.U, y: face.U,
  L: face.L, l: face.L, M: face.L,
  F: face.F, f: face.F, S: face.F, z: face.F,
  R: face.R, r: face.R, x: face.R,
  B: face.B, b: face.B,
  D: face.D, d: face.D, E: face.D,
};

const cubieDimensions = {
  stickerWidth: 0.85,
  stickerElevation: 0.501,
  foundationWidth: 1,
  hintStickerElevation: 1.45,
};

type OptionKey = "showMainStickers" | "showHintStickers" | "showFoundation";

interface Cube3DOptions {
  showMainStickers?: boolean;
  showHintStickers?: boolean;
  showFoundation?: boolean; // TODO: better name
}

const cube3DOptionsDefaults: Cube3DOptions = {
  showMainStickers: true,
  showHintStickers: true,
  showFoundation: true,
};

// TODO: Make internal foundation faces one-sided, facing to the outside of the cube.
const blackMesh = new MeshBasicMaterial({ color: 0x000000, opacity: 0.3, transparent: true });

class CubieDef {
  public matrix: Matrix4;
  public stickerFaces: number[];
  // stickerFaceNames can be e.g. ["U", "F", "R"], "UFR" if every face is a single letter.
  constructor(public orbit: string, stickerFaceNames: string[] | string, q: Quaternion) {
    const individualStickerFaceNames = typeof stickerFaceNames === "string" ? stickerFaceNames.split("") : stickerFaceNames;
    this.stickerFaces = individualStickerFaceNames.map((s) => face[s]);
    this.matrix = new Matrix4();
    this.matrix.setPosition(firstPiecePosition[orbit]);
    this.matrix.premultiply(new Matrix4().makeRotationFromQuaternion(q));
  }
}

function t(v: Vector3, t4: number): Quaternion {
  return new Quaternion().setFromAxisAngle(v, TAU * t4 / 4);
}

const r = {
  O: new Vector3(0, 0, 0),
  U: new Vector3(0, -1, 0),
  L: new Vector3(1, 0, 0),
  F: new Vector3(0, 0, -1),
  R: new Vector3(-1, 0, 0),
  B: new Vector3(0, 0, 1),
  D: new Vector3(0, 1, 0),
};

interface OrbitIndexed<T> { [s: string]: T; }
interface PieceIndexed<T> extends OrbitIndexed<T[]> { }

const firstPiecePosition: OrbitIndexed<Vector3> = {
  EDGE: new Vector3(0, 1, 1),
  CORNER: new Vector3(1, 1, 1),
  CENTER: new Vector3(0, 1, 0),
};
const orientationRotation: OrbitIndexed<Matrix4[]> = {
  EDGE: [0, 1].map((i) => new Matrix4().makeRotationAxis(firstPiecePosition.EDGE.clone().normalize(), -i * TAU / 2)),
  CORNER: [0, 1, 2].map((i) => new Matrix4().makeRotationAxis(firstPiecePosition.CORNER.clone().normalize(), -i * TAU / 3)),
  CENTER: [0, 1, 2, 3].map((i) => new Matrix4().makeRotationAxis(firstPiecePosition.CENTER.clone().normalize(), -i * TAU / 4)),
};
const cubieStickerOrder = [
  face.U,
  face.F,
  face.R,
];

const pieceDefs: PieceIndexed<CubieDef> = {
  EDGE: [
    new CubieDef("EDGE", "UF", t(r.O, 0)),
    new CubieDef("EDGE", "UR", t(r.U, 3)),
    new CubieDef("EDGE", "UB", t(r.U, 2)),
    new CubieDef("EDGE", "UL", t(r.U, 1)),
    new CubieDef("EDGE", "DF", t(r.F, 2)),
    new CubieDef("EDGE", "DR", t(r.F, 2).premultiply(t(r.D, 1))),
    new CubieDef("EDGE", "DB", t(r.F, 2).premultiply(t(r.D, 2))),
    new CubieDef("EDGE", "DL", t(r.F, 2).premultiply(t(r.D, 3))),
    new CubieDef("EDGE", "FR", t(r.U, 3).premultiply(t(r.R, 3))),
    new CubieDef("EDGE", "FL", t(r.U, 1).premultiply(t(r.R, 3))),
    new CubieDef("EDGE", "BR", t(r.U, 3).premultiply(t(r.R, 1))),
    new CubieDef("EDGE", "BL", t(r.U, 1).premultiply(t(r.R, 1))),
  ],
  CORNER: [
    new CubieDef("CORNER", "UFR", t(r.O, 0)),
    new CubieDef("CORNER", "URB", t(r.U, 3)),
    new CubieDef("CORNER", "UBL", t(r.U, 2)),
    new CubieDef("CORNER", "ULF", t(r.U, 1)),
    new CubieDef("CORNER", "DRF", t(r.F, 2).premultiply(t(r.D, 1))),
    new CubieDef("CORNER", "DFL", t(r.F, 2).premultiply(t(r.D, 0))),
    new CubieDef("CORNER", "DLB", t(r.F, 2).premultiply(t(r.D, 3))),
    new CubieDef("CORNER", "DBR", t(r.F, 2).premultiply(t(r.D, 2))),
  ],
  CENTER: [
    new CubieDef("CENTER", "U", t(r.O, 0)),
    new CubieDef("CENTER", "L", t(r.R, 3).premultiply(t(r.U, 1))),
    new CubieDef("CENTER", "F", t(r.R, 3)),
    new CubieDef("CENTER", "R", t(r.R, 3).premultiply(t(r.D, 1))),
    new CubieDef("CENTER", "B", t(r.R, 3).premultiply(t(r.D, 2))),
    new CubieDef("CENTER", "D", t(r.R, 2)),
  ],
};

const CUBE_SCALE = 1 / 3;

// TODO: Split into "scene model" and "view".
export class Cube3D extends Twisty3D<Puzzle> {
  private cube: Group = new Group();
  private pieces: PieceIndexed<Object3D> = {};
  private options: Cube3DOptions;
  // TODO: Keep track of option-based meshes better.
  private experimentalHintStickerMeshes: Mesh[] = [];
  private experimentalFoundationMeshes: Mesh[] = [];
  constructor(def: KPuzzleDefinition, options: Cube3DOptions = {}) {
    super();

    this.options = {};
    for (const key in cube3DOptionsDefaults) {
      // TODO:Don't use `any`.
      this.options[key as OptionKey] = (key in options) ? (options as any)[key] : (cube3DOptionsDefaults as any)[key];
    }

    if (def.name !== "3x3x3") {
      throw new Error("Invalid puzzle for this Cube3D implementation.");
    }
    for (const orbit in pieceDefs) {
      this.pieces[orbit] = pieceDefs[orbit].map(this.createCubie.bind(this));
    }
    this.cube.scale.set(CUBE_SCALE, CUBE_SCALE, CUBE_SCALE);
    this.scene.add(this.cube);
  }

  public experimentalGetCube(): Group {
    return this.cube;
  }

  public experimentalUpdateOptions(options: Cube3DOptions): void {
    if ("showMainStickers" in options) {
      throw new Error("Unimplemented");
    }

    const showFoundation = options.showFoundation;
    if (typeof showFoundation !== "undefined" && this.options.showFoundation !== showFoundation) {
      this.options.showFoundation = showFoundation;
      for (const foundation of this.experimentalFoundationMeshes) {
        foundation.visible = showFoundation;
      }
    }

    const showHintStickers = options.showHintStickers;
    if (typeof showHintStickers !== "undefined" && this.options.showHintStickers !== showHintStickers) {
      this.options.showHintStickers = showHintStickers;
      for (const hintSticker of this.experimentalHintStickerMeshes) {
        hintSticker.visible = showHintStickers;
      }
    }
  }

  protected updateScene(p: Cursor.Position<Puzzle>): void {
    const reid333 = p.state as Transformation;
    for (const orbit in pieceDefs) {
      const pieces = pieceDefs[orbit];
      for (let i = 0; i < pieces.length; i++) {
        const j = reid333[orbit].permutation[i];
        this.pieces[orbit][j].matrix.copy(pieceDefs[orbit][i].matrix);
        this.pieces[orbit][j].matrix.multiply(orientationRotation[orbit][reid333[orbit].orientation[i]]);
      }
      for (const moveProgress of p.moves) {
        const blockMove = moveProgress.move as BlockMove;
        const turnNormal = axesInfo[familyToAxis[blockMove.family]].vector;
        const moveMatrix = new Matrix4().makeRotationAxis(turnNormal, - this.ease(moveProgress.fraction) * moveProgress.direction * blockMove.amount * TAU / 4);
        for (let i = 0; i < pieces.length; i++) {
          const k = Puzzles["3x3x3"].moves[blockMove.family][orbit].permutation[i];
          if (i !== k || Puzzles["3x3x3"].moves[blockMove.family][orbit].orientation[i] !== 0) {
            const j = reid333[orbit].permutation[i];
            this.pieces[orbit][j].matrix.premultiply(moveMatrix);
          }
        }
      }
    }
  }

  // TODO: Always create (but sometimes hide parts) so we can show them later,
  // or (better) support creating puzzle parts on demand.
  private createCubie(edge: CubieDef): Object3D {
    const cubie = new Group();
    if (this.options.showFoundation) {
      const foundation = this.createCubieFoundation();
      cubie.add(foundation);
      this.experimentalFoundationMeshes.push(foundation);
    }
    for (let i = 0; i < edge.stickerFaces.length; i++) {
      cubie.add(this.createSticker(axesInfo[cubieStickerOrder[i]], axesInfo[edge.stickerFaces[i]], false));
      if (this.options.showHintStickers) {
        const hintSticker = this.createSticker(axesInfo[cubieStickerOrder[i]], axesInfo[edge.stickerFaces[i]], true);
        cubie.add(hintSticker);
        this.experimentalHintStickerMeshes.push(hintSticker);
      }
    }
    cubie.matrix.copy(edge.matrix);
    cubie.matrixAutoUpdate = false;
    this.cube.add(cubie);
    return cubie;
  }

  // TODO: Support creating only the outward-facing parts?
  private createCubieFoundation(): Mesh {
    const box = new BoxGeometry(cubieDimensions.foundationWidth, cubieDimensions.foundationWidth, cubieDimensions.foundationWidth);
    return new Mesh(box, blackMesh);
  }

  private createSticker(posAxisInfo: AxisInfo, materialAxisInfo: AxisInfo, isHint: boolean): Mesh {
    const geo = new PlaneGeometry(cubieDimensions.stickerWidth, cubieDimensions.stickerWidth);
    const stickerMesh = new Mesh(geo, isHint ? materialAxisInfo.hintStickerMaterial : materialAxisInfo.stickerMaterial);
    stickerMesh.setRotationFromEuler(posAxisInfo.fromZ);
    stickerMesh.position.copy(posAxisInfo.vector);
    stickerMesh.position.multiplyScalar(isHint ? cubieDimensions.hintStickerElevation : cubieDimensions.stickerElevation);
    return stickerMesh;
  }

  private ease(fraction: number): number {
    return smootherStep(fraction);
  }
}
