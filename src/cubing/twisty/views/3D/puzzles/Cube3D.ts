import { BackSide, DoubleSide, FrontSide } from "three/src/constants.js";
import { BufferAttribute } from "three/src/core/BufferAttribute.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import { Object3D } from "three/src/core/Object3D.js";
import { BoxGeometry } from "three/src/geometries/BoxGeometry.js";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial.js";
import { Color } from "three/src/math/Color.js";
import { Euler } from "three/src/math/Euler.js";
import { Matrix4 } from "three/src/math/Matrix4.js";
import { Quaternion } from "three/src/math/Quaternion.js";
import { Vector2 } from "three/src/math/Vector2.js";
import { Vector3 } from "three/src/math/Vector3.js";
import { Group } from "three/src/objects/Group.js";
import { Mesh } from "three/src/objects/Mesh.js";
import type { Texture } from "three/src/textures/Texture.js";
import type { KPuzzle } from "../../../../kpuzzle";
import type { ExperimentalStickeringMask } from "../../../../puzzles/cubing-private";
import type {
  FaceletMeshStickeringMask,
  StickeringMask,
} from "../../../../puzzles/stickerings/mask";
import type {
  MillisecondTimestamp,
  PuzzlePosition,
} from "../../../controllers/AnimationTypes";
import { smootherStep } from "../../../controllers/easing";
import type { FaceletScale } from "../../../model/props/puzzle/display/FaceletScaleProp";
import {
  type HintFaceletStyle,
  hintFaceletStyles,
} from "../../../model/props/puzzle/display/HintFaceletProp";
import type { InitialHintFaceletsAnimation } from "../../../model/props/puzzle/display/InitialHintFaceletsAnimationProp";
import { TAU } from "../TAU";
import { haveStartedSharingRenderers } from "../Twisty3DVantage";
import type { Twisty3DPuzzle } from "./Twisty3DPuzzle";

const svgLoader = new TextureLoader();

const ignoredMaterial = new MeshBasicMaterial({
  color: new Color(0x666666).convertLinearToSRGB(),
});

const ignoredMaterialHint = new MeshBasicMaterial({
  color: new Color(0xcccccc).convertLinearToSRGB(),
  side: BackSide,
  transparent: true,
  opacity: 0.75,
});

const invisibleMaterial = new MeshBasicMaterial({
  visible: false,
});

const orientedMaterial = new MeshBasicMaterial({
  color: 0x44ddcc,
});

const orientedMaterialHint = new MeshBasicMaterial({
  color: 0x44ddcc,
  side: BackSide,
  transparent: true,
  opacity: 0.5,
});

const experimentalOriented2Material = new MeshBasicMaterial({
  color: 0xfffdaa,
});

const experimentalOriented2MaterialHint = new MeshBasicMaterial({
  color: 0xfff979,
  side: BackSide,
  transparent: true,
  opacity: 0.5,
});

const mysteryMaterial = new MeshBasicMaterial({
  color: 0xf2cbcb,
});

const mysterMaterialHint = new MeshBasicMaterial({
  color: 0xf2cbcb,
  side: BackSide,
  transparent: true,
  opacity: 0.5,
});

interface MaterialMap
  extends Record<FaceletMeshStickeringMask, MeshBasicMaterial> {
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
    public hintOpacityScale: number, // TODO: make this work better across bright *and* dark backgrounds. Maybe tweak sticker compositing settings?
    options?: { hintColor?: number; hintDimColor?: number },
  ) {
    const colorLinearSRGB = new Color(color).convertLinearToSRGB();
    const dimColorLinearSRGB = new Color(dimColor).convertLinearToSRGB();
    // TODO: Make sticker material single-sided when cubie foundation is opaque?
    this.stickerMaterial = {
      regular: new MeshBasicMaterial({
        color: colorLinearSRGB,
        side: FrontSide, // TODO: set to `DoubleSide` when hint facelets are disabled.
      }),
      dim: new MeshBasicMaterial({
        color: dimColorLinearSRGB,
        side: FrontSide, // TODO: set to `DoubleSide` when hint facelets are disabled.
      }),
      oriented: orientedMaterial,
      experimentalOriented2: experimentalOriented2Material,
      ignored: ignoredMaterial,
      invisible: invisibleMaterial,
      mystery: mysteryMaterial,
    };
    this.hintStickerMaterial = {
      regular: new MeshBasicMaterial({
        color: new Color(options?.hintColor ?? color).convertLinearToSRGB(),
        side: BackSide,
        transparent: true,
        opacity: 0.5 * hintOpacityScale,
      }),
      dim: new MeshBasicMaterial({
        color: new Color(
          options?.hintDimColor ?? dimColor,
        ).convertLinearToSRGB(),
        side: BackSide,
        transparent: true,
        opacity: 0.5 * hintOpacityScale,
      }),
      oriented: orientedMaterialHint,
      experimentalOriented2: experimentalOriented2MaterialHint,
      ignored: ignoredMaterialHint,
      invisible: invisibleMaterial,
      mystery: mysterMaterialHint,
    };
  }
}

const axesInfo: AxisInfo[] = [
  new AxisInfo(
    new Vector3(0, 1, 0),
    new Euler(-TAU / 4, 0, 0),
    0xffffff,
    0xdddddd,
    1.25,
  ),
  new AxisInfo(
    new Vector3(-1, 0, 0),
    new Euler(0, -TAU / 4, 0),
    0xff9900,
    0x885500,
    1,
    { hintDimColor: 0x884400 },
  ),
  new AxisInfo(
    new Vector3(0, 0, 1),
    new Euler(0, 0, 0),
    0x00ff00,
    0x008800,
    1,
    { hintDimColor: 0x009900 },
  ),
  new AxisInfo(
    new Vector3(1, 0, 0),
    new Euler(0, TAU / 4, 0),
    0xff0000,
    0x660000,
    1,
    { hintDimColor: 0x660000 },
  ),
  new AxisInfo(
    new Vector3(0, 0, -1),
    new Euler(0, TAU / 2, 0),
    0x2266ff,
    0x113388,
    0.75,
    { hintDimColor: 0x001866 },
  ),
  new AxisInfo(
    new Vector3(0, -1, 0),
    new Euler(TAU / 4, 0, 0),
    0xffff00,
    0x888800,
    1.25,
    { hintDimColor: 0xdddd00 },
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
  U: face["U"],
  u: face["U"],
  Uw: face["U"],
  Uv: face["U"],
  y: face["U"],
  L: face["L"],
  l: face["L"],
  Lw: face["L"],
  Lv: face["L"],
  M: face["L"],
  F: face["F"],
  f: face["F"],
  Fw: face["F"],
  Fv: face["F"],
  S: face["F"],
  z: face["F"],
  R: face["R"],
  r: face["R"],
  Rw: face["R"],
  Rv: face["R"],
  x: face["R"],
  B: face["B"],
  b: face["B"],
  Bw: face["B"],
  Bv: face["B"],
  D: face["D"],
  d: face["D"],
  Dw: face["D"],
  Dv: face["D"],
  E: face["D"],
};

const cubieDimensions = {
  // stickerWidth: 0.85, // Now `faceletScale` in options.
  stickerElevation: 0.503,
  foundationWidth: 1,
  hintStickerElevation: 1.45,
};
const EXPERIMENTAL_PICTURE_CUBE_HINT_ELEVATION = 2;

/** @deprecated */
export function experimentalSetDefaultStickerElevation(
  stickerElevation: number,
): void {
  cubieDimensions.stickerElevation = stickerElevation;
}

export interface Cube3DOptions {
  showMainStickers?: boolean;
  hintFacelets?: HintFaceletStyle;
  showFoundation?: boolean; // TODO: better name
  experimentalStickeringMask?: ExperimentalStickeringMask;
  foundationSprite?: Texture | null;
  hintSprite?: Texture | null;
  initialHintFaceletsAnimation?: InitialHintFaceletsAnimation;
  faceletScale?: "auto" | number;
}

const cube3DOptionsDefaults: Cube3DOptions = {
  showMainStickers: true,
  hintFacelets: "floating",
  showFoundation: true,
  experimentalStickeringMask: undefined,
  foundationSprite: null,
  hintSprite: null,
  initialHintFaceletsAnimation: "auto",
  faceletScale: "auto",
};

const DEFAULT_STICKER_SCALE = 0.85;
function getFaceletScale(options: Cube3DOptions): number {
  if (
    typeof options.faceletScale === "undefined" ||
    options.faceletScale === "auto"
  ) {
    return DEFAULT_STICKER_SCALE;
  }
  return options.faceletScale;
}

// TODO: Make internal foundation faces one-sided, facing to the outside of the cube.
const blackMesh = new MeshBasicMaterial({
  color: 0x000000,
  opacity: 1,
  transparent: true,
});

const blackTranslucentMesh = new MeshBasicMaterial({
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
      firstPiecePosition["EDGES"].clone().normalize(),
      (-i * TAU) / 2,
    ),
  ),
  CORNERS: [0, 1, 2].map((i) =>
    new Matrix4().makeRotationAxis(
      firstPiecePosition["CORNERS"].clone().normalize(),
      (-i * TAU) / 3,
    ),
  ),
  CENTERS: [0, 1, 2, 3].map((i) =>
    new Matrix4().makeRotationAxis(
      firstPiecePosition["CENTERS"].clone().normalize(),
      (-i * TAU) / 4,
    ),
  ),
};
const cubieStickerOrder = [face["U"], face["F"], face["R"]];

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

// TODO: Compatibility with Randelshofer or standard net layout? Offer a
// conversion function?
const pictureStickerCoords: Record<string, number[][][]> = {
  EDGES: [
    [
      [0, 4, 6],
      [0, 4, 5],
    ],
    [
      [3, 5, 7],
      [0, 7, 5],
    ],
    [
      [2, 4, 8],
      [0, 10, 5],
    ],
    [
      [1, 3, 7],
      [0, 1, 5],
    ],
    [
      [2, 4, 2],
      [2, 4, 3],
    ],
    [
      [3, 5, 1],
      [2, 7, 3],
    ],
    [
      [0, 4, 0],
      [2, 10, 3],
    ],
    [
      [1, 3, 1],
      [2, 1, 3],
    ],
    [
      [3, 5, 4],
      [3, 6, 4],
    ],
    [
      [1, 3, 4],
      [1, 2, 4],
    ],
    [
      [1, 9, 4],
      [1, 8, 4],
    ],
    [
      [3, 11, 4],
      [3, 0, 4],
    ],
  ],
  CORNERS: [
    [
      [0, 5, 6],
      [0, 5, 5],
      [0, 6, 5],
    ],
    [
      [3, 5, 8],
      [0, 8, 5],
      [0, 9, 5],
    ],
    [
      [2, 3, 8],
      [0, 11, 5],
      [0, 0, 5],
    ],
    [
      [1, 3, 6],
      [0, 2, 5],
      [0, 3, 5],
    ],
    [
      [3, 5, 2],
      [2, 6, 3],
      [2, 5, 3],
    ],
    [
      [2, 3, 2],
      [2, 3, 3],
      [2, 2, 3],
    ],
    [
      [1, 3, 0],
      [2, 0, 3],
      [2, 11, 3],
    ],
    [
      [0, 5, 0],
      [2, 9, 3],
      [2, 8, 3],
    ],
  ],
  CENTERS: [
    [[0, 4, 7]],
    [[0, 1, 4]],
    [[0, 4, 4]],
    [[0, 7, 4]],
    [[0, 10, 4]],
    [[0, 4, 1]],
  ],
};

let sharedCubieFoundationGeometryCache: BoxGeometry | null = null;
function sharedCubieFoundationGeometry(): BoxGeometry {
  return (
    sharedCubieFoundationGeometryCache ??
    (sharedCubieFoundationGeometryCache = new BoxGeometry(
      cubieDimensions.foundationWidth,
      cubieDimensions.foundationWidth,
      cubieDimensions.foundationWidth,
    ))
  );
}

function newStickerGeometry(): BufferGeometry {
  const r = new BufferGeometry();
  const half = 0.5;
  r.setAttribute(
    "position",
    new BufferAttribute(
      new Float32Array([
        half,
        half,
        0,
        -half,
        half,
        0,
        half,
        -half,
        0,
        -half,
        half,
        0,
        -half,
        -half,
        0,
        half,
        -half,
        0,
      ]),
      3,
    ),
  );
  r.setAttribute(
    "uv",
    new BufferAttribute(
      new Float32Array([
        1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1,
      ]),
      2,
    ),
  );
  //  r.setAttribute('normals', new BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]), 3));
  return r;
}

let sharedStickerGeometryCache: BufferGeometry | null = null;
function sharedStickerGeometry(): BufferGeometry {
  return (
    sharedStickerGeometryCache ??
    (sharedStickerGeometryCache = newStickerGeometry())
  );
}

// TODO: Split into "scene model" and "view".
export class Cube3D extends Object3D implements Twisty3DPuzzle {
  kpuzzleFaceletInfo: Record<string, FaceletInfo[][]>;
  private pieces: PieceIndexed<Object3D> = {};
  private options: Cube3DOptions;
  // TODO: Keep track of option-based meshes better.
  private experimentalHintStickerMeshes: Mesh[] = [];
  private experimentalFoundationMeshes: Mesh[] = [];

  #setSpriteURL: ((url: string) => void) | undefined;
  private sprite: Texture | Promise<Texture> = new Promise((resolve) => {
    this.#setSpriteURL = (url: string): void => {
      svgLoader.load(url, resolve);
    };
  });

  // TODO: Don't overwrite the static function.
  // TODO: This doesn't work dynamically yet.
  setSprite(texture: Texture): void {
    this.sprite = texture;
  }

  #setHintSpriteURL: ((url: string) => void) | undefined;
  private hintSprite: Texture | Promise<Texture> = new Promise((resolve) => {
    this.#setHintSpriteURL = (url: string): void => {
      svgLoader.load(url, resolve);
    };
  });

  // TODO: Don't overwrite the static function.
  // TODO: This doesn't work dynamically yet.
  setHintSprite(texture: Texture): void {
    this.hintSprite = texture;
  }

  constructor(
    private kpuzzle: KPuzzle,
    private scheduleRenderCallback?: () => void,
    options: Cube3DOptions = {},
  ) {
    super();

    this.options = { ...cube3DOptionsDefaults };
    Object.assign(this.options, options); // TODO: check if this works

    if (this.kpuzzle.name() !== "3x3x3") {
      throw new Error(
        `Invalid puzzle for this Cube3D implementation: ${this.kpuzzle.name()}`,
      );
    }

    if (options.foundationSprite) {
      this.setSprite(options.foundationSprite);
    }
    if (options.hintSprite) {
      this.setHintSprite(options.hintSprite);
    }

    this.kpuzzleFaceletInfo = {};
    for (const orbit in pieceDefs) {
      const orbitFaceletInfo: FaceletInfo[][] = [];
      this.kpuzzleFaceletInfo[orbit] = orbitFaceletInfo;
      this.pieces[orbit] = pieceDefs[orbit].map(
        this.createCubie.bind(this, orbit, orbitFaceletInfo),
      );
    }
    this.scale.set(CUBE_SCALE, CUBE_SCALE, CUBE_SCALE);

    // TODO: Can we construct this directly instead of applying it later? Would that be more code-efficient?
    if (this.options.experimentalStickeringMask) {
      this.setStickeringMask(this.options.experimentalStickeringMask);
    }
    this.#animateRaiseHintFacelets();

    if (this.options.faceletScale) {
      this.experimentalSetFaceletScale(this.options.faceletScale);
    }
  }

  #sharedHintStickerGeometryCache: BufferGeometry | null = null;
  #sharedHintStickerGeometry(): BufferGeometry {
    return (this.#sharedHintStickerGeometryCache ??= newStickerGeometry());
  }

  // TODO: Generalize this into an animation mechanism.
  #animateRaiseHintFacelets(): void {
    if (
      this.options.initialHintFaceletsAnimation === "none" ||
      (this.options.initialHintFaceletsAnimation !== "always" &&
        haveStartedSharingRenderers())
    ) {
      return;
    }
    const translationRange =
      cubieDimensions.hintStickerElevation - cubieDimensions.stickerElevation;
    this.#sharedHintStickerGeometry().translate(0, 0, -translationRange);
    setTimeout(() => {
      const hintStartTime = performance.now();
      let lastTranslation = 0;
      const translationDuration: MillisecondTimestamp = 1000;
      function ease(x: number) {
        return x * (2 - x);
      }
      const animateRaiseHintSticker = () => {
        const elapsed = performance.now() - hintStartTime;
        const newTranslation =
          ease(elapsed / translationDuration) * translationRange;
        this.#sharedHintStickerGeometry().translate(
          0,
          0,
          newTranslation - lastTranslation,
        );
        lastTranslation = newTranslation;
        if (elapsed < translationDuration) {
          requestAnimationFrame(animateRaiseHintSticker);
          this.scheduleRenderCallback?.();
        }
      };
      animateRaiseHintSticker();
    }, 500);
  }

  // Can only be called once.
  /** @deprecated */
  experimentalSetStickerSpriteURL(stickerSpriteURL: string): void {
    this.#setSpriteURL?.(stickerSpriteURL);
  }

  // Can only be called once.
  /** @deprecated */
  experimentalSetHintStickerSpriteURL(hintStickerSpriteURL: string): void {
    this.#setHintSpriteURL?.(hintStickerSpriteURL);
  }

  setStickeringMask(stickeringMask: StickeringMask): void {
    if (stickeringMask.specialBehaviour === "picture") {
      // TODO: if the latest stickering mask was already "picture", don't redo work.
      for (const pieceInfos of Object.values(this.kpuzzleFaceletInfo)) {
        for (const faceletInfos of pieceInfos) {
          for (const faceletInfo of faceletInfos) {
            faceletInfo.facelet.material = invisibleMaterial;
            const { hintFacelet } = faceletInfo;
            if (hintFacelet) {
              hintFacelet.material = invisibleMaterial;
            }
          }
        }
      }
      return;
    }
    this.options.experimentalStickeringMask = stickeringMask;
    for (const [orbitName, orbitStickeringMask] of Object.entries(
      stickeringMask.orbits,
    )) {
      for (
        let pieceIdx = 0;
        pieceIdx < orbitStickeringMask.pieces.length;
        pieceIdx++
      ) {
        const pieceStickeringMask = orbitStickeringMask.pieces[pieceIdx];
        if (pieceStickeringMask) {
          const pieceInfo = this.kpuzzleFaceletInfo[orbitName][pieceIdx];
          for (
            let faceletIdx = 0;
            faceletIdx < pieceInfo.length;
            faceletIdx++
          ) {
            const faceletStickeringMask =
              pieceStickeringMask.facelets[faceletIdx];
            if (faceletStickeringMask) {
              const faceletInfo = pieceInfo[faceletIdx];

              const stickeringMask =
                typeof faceletStickeringMask === "string"
                  ? faceletStickeringMask
                  : faceletStickeringMask?.mask;

              faceletInfo.facelet.material =
                axesInfo[faceletInfo.faceIdx].stickerMaterial[stickeringMask];
              // TODO
              const hintStickeringMask =
                typeof faceletStickeringMask === "string"
                  ? stickeringMask
                  : (faceletStickeringMask.hintMask ?? stickeringMask);
              if (faceletInfo.hintFacelet) {
                faceletInfo.hintFacelet.material =
                  axesInfo[faceletInfo.faceIdx].hintStickerMaterial[
                    hintStickeringMask
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

    const { experimentalStickeringMask } = options;
    if (typeof experimentalStickeringMask !== "undefined") {
      this.options.experimentalStickeringMask = experimentalStickeringMask;
      this.setStickeringMask(experimentalStickeringMask);
      this.scheduleRenderCallback!(); // TODO
    }

    const { faceletScale } = options;
    if (typeof faceletScale !== "undefined") {
      this.experimentalSetFaceletScale(faceletScale);
    }
  }

  public onPositionChange(p: PuzzlePosition): void {
    const reid333 = p.pattern;
    for (const orbit in pieceDefs) {
      const pieces = pieceDefs[orbit];
      for (let i = 0; i < pieces.length; i++) {
        const j = reid333.patternData[orbit].pieces[i];
        this.pieces[orbit][j].matrix.copy(pieceDefs[orbit][i].matrix);
        this.pieces[orbit][j].matrix.multiply(
          orientationRotation[orbit][reid333.patternData[orbit].orientation[i]],
        );
      }
      for (const moveProgress of p.movesInProgress) {
        const move = moveProgress.move;
        const turnNormal = axesInfo[familyToAxis[move.family]].vector;
        const moveMatrix = new Matrix4().makeRotationAxis(
          turnNormal,
          (-this.ease(moveProgress.fraction) *
            moveProgress.direction *
            move.amount *
            TAU) /
            4,
        );
        for (let i = 0; i < pieces.length; i++) {
          const quantumTransformation = this.kpuzzle.moveToTransformation(
            move.modified({ amount: 1 }),
          );
          const k =
            quantumTransformation.transformationData[orbit].permutation[i];
          if (
            i !== k ||
            quantumTransformation.transformationData[orbit].orientationDelta[
              i
            ] !== 0
          ) {
            const j = reid333.patternData[orbit].pieces[i];
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
    orbit: string,
    orbitFacelets: FaceletInfo[][],
    piece: CubieDef,
    orbitPieceIdx: number,
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

      if (
        this.options.experimentalStickeringMask?.specialBehaviour ===
          "picture" &&
        pictureStickerCoords[orbit] &&
        pictureStickerCoords[orbit][orbitPieceIdx] &&
        pictureStickerCoords[orbit][orbitPieceIdx][i]
      ) {
        const [rotate, offsetX, offsetY] =
          pictureStickerCoords[orbit][orbitPieceIdx][i];
        (async () => {
          const addImageSticker = async (hint: boolean) => {
            const texture: Texture = await (hint
              ? this.hintSprite
              : this.sprite);

            const mesh = this.createSticker(
              axesInfo[cubieStickerOrder[i]],
              axesInfo[piece.stickerFaces[i]],
              hint,
            );
            mesh.material = new MeshBasicMaterial({
              map: texture,
              side: hint ? BackSide : DoubleSide,
              transparent: true,
            });

            const x1 = offsetX / 12;
            const x2 = (offsetX + 1) / 12;
            const y1 = offsetY / 9;
            const y2 = (offsetY + 1) / 9;

            let v1 = new Vector2(x1, y1);
            let v2 = new Vector2(x1, y2);
            let v3 = new Vector2(x2, y2);
            let v4 = new Vector2(x2, y1);

            switch (rotate) {
              case 1: {
                [v1, v2, v3, v4] = [v2, v3, v4, v1];
                break;
              }
              case 2: {
                [v1, v2, v3, v4] = [v3, v4, v1, v2];
                break;
              }
              case 3: {
                [v1, v2, v3, v4] = [v4, v1, v2, v3];
                break;
              }
            }
            mesh.geometry.setAttribute(
              "uv",
              new BufferAttribute(
                new Float32Array([
                  v3.x,
                  v3.y,
                  v2.x,
                  v2.y,
                  v4.x,
                  v4.y,
                  v2.x,
                  v2.y,
                  v1.x,
                  v1.y,
                  v4.x,
                  v4.y,
                ]),
                2,
              ),
            );
            cubie.add(mesh);
          };
          // const delay: number = ({
          //   CENTERS: 1000,
          //   EDGES: 2000,
          //   CORNERS: 3500,
          // } as Record<string, number>)[orbit];
          // if (orbit === "CENTERS" && orbitPieceIdx === 5) {
          addImageSticker(true);
          addImageSticker(false);
          // } else {
          //   await this.sprite;
          //   await this.hintSprite;
          //   setTimeout(
          //     () => addImageSticker(true),
          //     delay + orbitPieceIdx * 100,
          //   );
          //   setTimeout(
          //     () => addImageSticker(false),
          //     delay + orbitPieceIdx * 100,
          //   );
          // }
        })();
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
    const box = sharedCubieFoundationGeometry();
    return new Mesh(
      box,
      this.options.experimentalStickeringMask?.specialBehaviour === "picture"
        ? blackMesh
        : blackTranslucentMesh,
    );
  }

  private createSticker(
    posAxisInfo: AxisInfo,
    materialAxisInfo: AxisInfo,
    isHint: boolean,
  ): Mesh {
    const geo =
      this.options.experimentalStickeringMask?.specialBehaviour === "picture"
        ? newStickerGeometry()
        : isHint
          ? this.#sharedHintStickerGeometry()
          : sharedStickerGeometry();
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
        ? this.options.experimentalStickeringMask?.specialBehaviour ===
          "picture"
          ? EXPERIMENTAL_PICTURE_CUBE_HINT_ELEVATION
          : cubieDimensions.hintStickerElevation
        : cubieDimensions.stickerElevation,
    );
    stickerMesh.scale.setScalar(getFaceletScale(this.options));
    return stickerMesh;
  }

  /** @deprecated */
  experimentalSetFoundationOpacity(opacity: number): void {
    (
      this.experimentalFoundationMeshes[0].material as MeshBasicMaterial
    ).opacity = opacity;
  }

  /** @deprecated */
  experimentalSetFaceletScale(faceletScale: FaceletScale): void {
    this.options.faceletScale = faceletScale;
    for (const orbitInfo of Object.values(this.kpuzzleFaceletInfo)) {
      for (const pieceInfo of orbitInfo) {
        for (const faceletInfo of pieceInfo) {
          faceletInfo.facelet.scale.setScalar(getFaceletScale(this.options));
          faceletInfo.hintFacelet?.scale.setScalar(
            getFaceletScale(this.options),
          );
          // faceletInfo.facelet.setRotationFromAxisAngle(new Vector3(0, 1, 0), 0);
          // faceletInfo.facelet.rotateOnAxis(new Vector3(1, 0, 1), TAU / 6);
        }
      }
    }
  }

  // /** @deprecated */
  // experimentalSetCenterStickerWidth(width: number): void {
  //   for (const orbitInfo of [this.kpuzzleFaceletInfo["CENTERS"]]) {
  //     for (const pieceInfo of orbitInfo) {
  //       for (const faceletInfo of pieceInfo) {
  //         faceletInfo.facelet.scale.setScalar(
  //           width / getStickerScale(this.options),
  //         );
  //         // faceletInfo.facelet.setRotationFromAxisAngle(new Vector3(0, 1, 0), 0);
  //         // faceletInfo.facelet.rotateOnAxis(new Vector3(1, 0, 1), TAU / 6);
  //       }
  //     }
  //   }
  // }

  private ease(fraction: number): number {
    return smootherStep(fraction);
  }
}
