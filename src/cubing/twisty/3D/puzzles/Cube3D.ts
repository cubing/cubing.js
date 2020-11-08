import {
  BackSide,
  BoxGeometry,
  DoubleSide,
  Euler,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from "three";
import { BlockMove } from "../../../alg";
import { Puzzles, Transformation } from "../../../kpuzzle";
import { AlgCursor } from "../../animation/alg/AlgCursor";
import { PuzzlePosition } from "../../animation/alg/CursorTypes";
import { smootherStep } from "../../animation/easing";
import {
  ExperimentalStickering,
  experimentalStickerings,
  HintFaceletStyle,
  hintFaceletStyles,
} from "../../dom/TwistyPlayerConfig";
import { TAU } from "../TAU";
import { FaceletMeshAppearance, PuzzleAppearance } from "./appearance";
import { stickerings } from "./stickerings";
import { Twisty3DPuzzle } from "./Twisty3DPuzzle";

const ignoredMaterial = new MeshBasicMaterial({
  color: 0x444444,
  side: DoubleSide,
});

const ignoredMaterialHint = new MeshBasicMaterial({
  color: 0xcccccc,
  side: BackSide,
});

const invisibleMaterial = new MeshBasicMaterial({
  visible: false,
});

const orientedMaterial = new MeshBasicMaterial({
  color: 0xff88ff,
});

const orientedMaterialHint = new MeshBasicMaterial({
  color: 0xff88ff,
  side: BackSide,
});

interface MaterialMap extends Record<FaceletMeshAppearance, MeshBasicMaterial> {
  regular: MeshBasicMaterial;
  dim: MeshBasicMaterial;
  ignored: MeshBasicMaterial;
  invisible: MeshBasicMaterial;
}

class AxisInfo {
  public stickerMaterial: MaterialMap;
  public hintStickerMaterial: MaterialMap;
  constructor(
    public vector: Vector3,
    public fromZ: Euler,
    public color: number,
    public dimColor: number,
  ) {
    // TODO: Make sticker material single-sided when cubie foundation is opaque?
    this.stickerMaterial = {
      regular: new MeshBasicMaterial({
        color,
        side: DoubleSide,
      }),
      dim: new MeshBasicMaterial({
        color: dimColor,
        side: DoubleSide,
      }),
      oriented: orientedMaterial,
      ignored: ignoredMaterial,
      invisible: invisibleMaterial,
    };
    this.hintStickerMaterial = {
      regular: new MeshBasicMaterial({
        color,
        side: BackSide,
      }),
      dim: new MeshBasicMaterial({
        color: dimColor,
        side: BackSide,
        transparent: true,
        opacity: 0.75,
      }),
      oriented: orientedMaterialHint,
      ignored: ignoredMaterialHint,
      invisible: invisibleMaterial,
    };
  }
}

const axesInfo: AxisInfo[] = [
  new AxisInfo(
    new Vector3(0, 1, 0),
    new Euler(-TAU / 4, 0, 0),
    0xffffff,
    0xdddddd,
  ),
  new AxisInfo(
    new Vector3(-1, 0, 0),
    new Euler(0, -TAU / 4, 0),
    0xff8800,
    0x884400,
  ),
  new AxisInfo(new Vector3(0, 0, 1), new Euler(0, 0, 0), 0x00ff00, 0x008800),
  new AxisInfo(
    new Vector3(1, 0, 0),
    new Euler(0, TAU / 4, 0),
    0xff0000,
    0x660000,
  ),
  new AxisInfo(
    new Vector3(0, 0, -1),
    new Euler(0, TAU / 2, 0),
    0x0000ff,
    0x000088,
  ),
  new AxisInfo(
    new Vector3(0, -1, 0),
    new Euler(TAU / 4, 0, 0),
    0xffff00,
    0x888800,
  ),
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
  U: face.U,
  u: face.U,
  y: face.U,
  L: face.L,
  l: face.L,
  M: face.L,
  F: face.F,
  f: face.F,
  S: face.F,
  z: face.F,
  R: face.R,
  r: face.R,
  x: face.R,
  B: face.B,
  b: face.B,
  D: face.D,
  d: face.D,
  E: face.D,
};

const cubieDimensions = {
  stickerWidth: 0.85,
  stickerElevation: 0.501,
  foundationWidth: 1,
  hintStickerElevation: 1.45,
};

type OptionKey = "showMainStickers" | "hintFacelets" | "showFoundation";

interface Cube3DOptions {
  showMainStickers?: boolean;
  hintFacelets?: HintFaceletStyle;
  showFoundation?: boolean; // TODO: better name
  experimentalStickering?: ExperimentalStickering;
}

const cube3DOptionsDefaults: Cube3DOptions = {
  showMainStickers: true,
  hintFacelets: "floating",
  showFoundation: true,
  experimentalStickering: "full",
};

// TODO: Make internal foundation faces one-sided, facing to the outside of the cube.
const blackMesh = new MeshBasicMaterial({
  color: 0x000000,
  opacity: 0.3,
  transparent: true,
});

class CubieDef {
  public matrix: Matrix4;
  public stickerFaces: number[];
  // stickerFaceNames can be e.g. ["U", "F", "R"], "UFR" if every face is a single letter.
  constructor(
    public orbit: string,
    stickerFaceNames: string[] | string,
    q: Quaternion,
  ) {
    const individualStickerFaceNames =
      typeof stickerFaceNames === "string"
        ? stickerFaceNames.split("")
        : stickerFaceNames;
    this.stickerFaces = individualStickerFaceNames.map((s) => face[s]);
    this.matrix = new Matrix4();
    this.matrix.setPosition(firstPiecePosition[orbit]);
    this.matrix.premultiply(new Matrix4().makeRotationFromQuaternion(q));
  }
}

function t(v: Vector3, t4: number): Quaternion {
  return new Quaternion().setFromAxisAngle(v, (TAU * t4) / 4);
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

interface OrbitIndexed<T> {
  [s: string]: T;
}
type PieceIndexed<T> = OrbitIndexed<T[]>;

const firstPiecePosition: OrbitIndexed<Vector3> = {
  EDGES: new Vector3(0, 1, 1),
  CORNERS: new Vector3(1, 1, 1),
  CENTERS: new Vector3(0, 1, 0),
};
const orientationRotation: OrbitIndexed<Matrix4[]> = {
  EDGES: [0, 1].map((i) =>
    new Matrix4().makeRotationAxis(
      firstPiecePosition.EDGES.clone().normalize(),
      (-i * TAU) / 2,
    ),
  ),
  CORNERS: [0, 1, 2].map((i) =>
    new Matrix4().makeRotationAxis(
      firstPiecePosition.CORNERS.clone().normalize(),
      (-i * TAU) / 3,
    ),
  ),
  CENTERS: [0, 1, 2, 3].map((i) =>
    new Matrix4().makeRotationAxis(
      firstPiecePosition.CENTERS.clone().normalize(),
      (-i * TAU) / 4,
    ),
  ),
};
const cubieStickerOrder = [face.U, face.F, face.R];

const pieceDefs: PieceIndexed<CubieDef> = {
  EDGES: [
    new CubieDef("EDGES", "UF", t(r.O, 0)),
    new CubieDef("EDGES", "UR", t(r.U, 3)),
    new CubieDef("EDGES", "UB", t(r.U, 2)),
    new CubieDef("EDGES", "UL", t(r.U, 1)),
    new CubieDef("EDGES", "DF", t(r.F, 2)),
    new CubieDef("EDGES", "DR", t(r.F, 2).premultiply(t(r.D, 1))),
    new CubieDef("EDGES", "DB", t(r.F, 2).premultiply(t(r.D, 2))),
    new CubieDef("EDGES", "DL", t(r.F, 2).premultiply(t(r.D, 3))),
    new CubieDef("EDGES", "FR", t(r.U, 3).premultiply(t(r.R, 3))),
    new CubieDef("EDGES", "FL", t(r.U, 1).premultiply(t(r.R, 3))),
    new CubieDef("EDGES", "BR", t(r.U, 3).premultiply(t(r.R, 1))),
    new CubieDef("EDGES", "BL", t(r.U, 1).premultiply(t(r.R, 1))),
  ],
  CORNERS: [
    new CubieDef("CORNERS", "UFR", t(r.O, 0)),
    new CubieDef("CORNERS", "URB", t(r.U, 3)),
    new CubieDef("CORNERS", "UBL", t(r.U, 2)),
    new CubieDef("CORNERS", "ULF", t(r.U, 1)),
    new CubieDef("CORNERS", "DRF", t(r.F, 2).premultiply(t(r.D, 1))),
    new CubieDef("CORNERS", "DFL", t(r.F, 2).premultiply(t(r.D, 0))),
    new CubieDef("CORNERS", "DLB", t(r.F, 2).premultiply(t(r.D, 3))),
    new CubieDef("CORNERS", "DBR", t(r.F, 2).premultiply(t(r.D, 2))),
  ],
  CENTERS: [
    new CubieDef("CENTERS", "U", t(r.O, 0)),
    new CubieDef("CENTERS", "L", t(r.R, 3).premultiply(t(r.U, 1))),
    new CubieDef("CENTERS", "F", t(r.R, 3)),
    new CubieDef("CENTERS", "R", t(r.R, 3).premultiply(t(r.D, 1))),
    new CubieDef("CENTERS", "B", t(r.R, 3).premultiply(t(r.D, 2))),
    new CubieDef("CENTERS", "D", t(r.R, 2)),
  ],
};

const CUBE_SCALE = 1 / 3;

interface FaceletInfo {
  faceIdx: number;
  facelet: Mesh;
  hintFacelet?: Mesh;
}

// TODO: Split into "scene model" and "view".
export class Cube3D extends Object3D implements Twisty3DPuzzle {
  kpuzzleFaceletInfo: Record<string, FaceletInfo[][]>;
  private pieces: PieceIndexed<Object3D> = {};
  private options: Cube3DOptions;
  // TODO: Keep track of option-based meshes better.
  private experimentalHintStickerMeshes: Mesh[] = [];
  private experimentalFoundationMeshes: Mesh[] = [];
  constructor(
    cursor?: AlgCursor,
    private scheduleRenderCallback?: () => void,
    options: Cube3DOptions = {},
  ) {
    super();

    const def = Puzzles["3x3x3"];

    this.options = {};
    for (const key in cube3DOptionsDefaults) {
      // TODO:Don't use `any`.
      this.options[key as OptionKey] =
        key in options
          ? (options as any)[key]
          : (cube3DOptionsDefaults as any)[key];
    }

    if (def.name !== "3x3x3") {
      throw new Error("Invalid puzzle for this Cube3D implementation.");
    }
    this.kpuzzleFaceletInfo = {};
    for (const orbit in pieceDefs) {
      const orbitFaceletInfo: FaceletInfo[][] = [];
      this.kpuzzleFaceletInfo[orbit] = orbitFaceletInfo;
      this.pieces[orbit] = pieceDefs[orbit].map(
        this.createCubie.bind(this, orbitFaceletInfo),
      );
    }
    this.scale.set(CUBE_SCALE, CUBE_SCALE, CUBE_SCALE);

    // TODO: Can we construct this directly instead of applying it later? Would that be more code-efficient?
    if (options.experimentalStickering) {
      this.setAppearance(stickerings[options.experimentalStickering]);
    }

    cursor!.addPositionListener(this);
  }

  setAppearance(appearance: PuzzleAppearance): void {
    for (const [orbitName, orbitAppearance] of Object.entries(
      appearance.orbits,
    )) {
      for (
        let pieceIdx = 0;
        pieceIdx < orbitAppearance.pieces.length;
        pieceIdx++
      ) {
        const pieceAppearance = orbitAppearance.pieces[pieceIdx];
        if (pieceAppearance) {
          const pieceInfo = this.kpuzzleFaceletInfo[orbitName][pieceIdx];
          for (
            let faceletIdx = 0;
            faceletIdx < pieceInfo.length;
            faceletIdx++
          ) {
            const faceletAppearance = pieceAppearance.facelets[faceletIdx];
            if (faceletAppearance) {
              const faceletInfo = pieceInfo[faceletIdx];

              const appearance =
                typeof faceletAppearance === "string"
                  ? faceletAppearance
                  : faceletAppearance?.appearance;

              faceletInfo.facelet.material =
                axesInfo[faceletInfo.faceIdx].stickerMaterial[appearance];
              // TODO
              const hintAppearance =
                typeof faceletAppearance === "string"
                  ? appearance
                  : faceletAppearance.hintAppearance ?? appearance;
              if (faceletInfo.hintFacelet) {
                faceletInfo.hintFacelet.material =
                  axesInfo[faceletInfo.faceIdx].hintStickerMaterial[
                    hintAppearance
                  ];
              }
            }
          }
        }
      }
    }
    if (this.scheduleRenderCallback) {
      this.scheduleRenderCallback();
    }
  }

  /** @deprecated */
  public experimentalUpdateOptions(options: Cube3DOptions): void {
    if ("showMainStickers" in options) {
      throw new Error("Unimplemented");
    }

    const showFoundation = options.showFoundation;
    if (
      typeof showFoundation !== "undefined" &&
      this.options.showFoundation !== showFoundation
    ) {
      this.options.showFoundation = showFoundation;
      for (const foundation of this.experimentalFoundationMeshes) {
        foundation.visible = showFoundation;
      }
    }

    const hintFacelets = options.hintFacelets;
    if (
      typeof hintFacelets !== "undefined" &&
      this.options.hintFacelets !== hintFacelets &&
      hintFaceletStyles[hintFacelets] // TODO: test this
    ) {
      this.options.hintFacelets = hintFacelets;
      for (const hintSticker of this.experimentalHintStickerMeshes) {
        hintSticker.visible = hintFacelets === "floating";
      }
      this.scheduleRenderCallback!(); // TODO
    }

    const experimentalStickering = options.experimentalStickering;
    if (
      typeof experimentalStickering !== "undefined" &&
      this.options.experimentalStickering !== experimentalStickering &&
      experimentalStickerings[experimentalStickering] // TODO: test this
    ) {
      this.options.experimentalStickering = experimentalStickering;
      this.setAppearance(stickerings[experimentalStickering]);
      this.scheduleRenderCallback!(); // TODO
    }
  }

  public onPositionChange(p: PuzzlePosition): void {
    const reid333 = p.state as Transformation;
    for (const orbit in pieceDefs) {
      const pieces = pieceDefs[orbit];
      for (let i = 0; i < pieces.length; i++) {
        const j = reid333[orbit].permutation[i];
        this.pieces[orbit][j].matrix.copy(pieceDefs[orbit][i].matrix);
        this.pieces[orbit][j].matrix.multiply(
          orientationRotation[orbit][reid333[orbit].orientation[i]],
        );
      }
      for (const moveProgress of p.movesInProgress) {
        const blockMove = moveProgress.move as BlockMove;
        const turnNormal = axesInfo[familyToAxis[blockMove.family]].vector;
        const moveMatrix = new Matrix4().makeRotationAxis(
          turnNormal,
          (-this.ease(moveProgress.fraction) *
            moveProgress.direction *
            blockMove.amount *
            TAU) /
            4,
        );
        for (let i = 0; i < pieces.length; i++) {
          const k =
            Puzzles["3x3x3"].moves[blockMove.family][orbit].permutation[i];
          if (
            i !== k ||
            Puzzles["3x3x3"].moves[blockMove.family][orbit].orientation[i] !== 0
          ) {
            const j = reid333[orbit].permutation[i];
            this.pieces[orbit][j].matrix.premultiply(moveMatrix);
          }
        }
      }
    }
    this.scheduleRenderCallback!();
  }

  // TODO: Always create (but sometimes hide parts) so we can show them later,
  // or (better) support creating puzzle parts on demand.
  private createCubie(
    orbitFacelets: FaceletInfo[][],
    piece: CubieDef,
  ): Object3D {
    const cubieFaceletInfo: FaceletInfo[] = [];
    orbitFacelets.push(cubieFaceletInfo);
    const cubie = new Group();
    if (this.options.showFoundation) {
      const foundation = this.createCubieFoundation();
      cubie.add(foundation);
      this.experimentalFoundationMeshes.push(foundation);
    }
    for (let i = 0; i < piece.stickerFaces.length; i++) {
      const sticker = this.createSticker(
        axesInfo[cubieStickerOrder[i]],
        axesInfo[piece.stickerFaces[i]],
        false,
      );
      const faceletInfo: FaceletInfo = {
        faceIdx: piece.stickerFaces[i],
        facelet: sticker,
      };
      cubie.add(sticker);
      if (this.options.hintFacelets === "floating") {
        const hintSticker = this.createSticker(
          axesInfo[cubieStickerOrder[i]],
          axesInfo[piece.stickerFaces[i]],
          true,
        );
        cubie.add(hintSticker);
        faceletInfo.hintFacelet = hintSticker;
        this.experimentalHintStickerMeshes.push(hintSticker);
      }

      cubieFaceletInfo.push(faceletInfo);
    }
    cubie.matrix.copy(piece.matrix);
    cubie.matrixAutoUpdate = false;
    this.add(cubie);
    return cubie;
  }

  // TODO: Support creating only the outward-facing parts?
  private createCubieFoundation(): Mesh {
    const box = new BoxGeometry(
      cubieDimensions.foundationWidth,
      cubieDimensions.foundationWidth,
      cubieDimensions.foundationWidth,
    );
    return new Mesh(box, blackMesh);
  }

  private createSticker(
    posAxisInfo: AxisInfo,
    materialAxisInfo: AxisInfo,
    isHint: boolean,
  ): Mesh {
    const geo = new PlaneGeometry(
      cubieDimensions.stickerWidth,
      cubieDimensions.stickerWidth,
    );
    const stickerMesh = new Mesh(
      geo,
      isHint
        ? materialAxisInfo.hintStickerMaterial.regular
        : materialAxisInfo.stickerMaterial.regular,
    );
    stickerMesh.setRotationFromEuler(posAxisInfo.fromZ);
    stickerMesh.position.copy(posAxisInfo.vector);
    stickerMesh.position.multiplyScalar(
      isHint
        ? cubieDimensions.hintStickerElevation
        : cubieDimensions.stickerElevation,
    );
    return stickerMesh;
  }

  private ease(fraction: number): number {
    return smootherStep(fraction);
  }
}
