import { DoubleSide } from "three/src/constants.js";
import { BufferAttribute } from "three/src/core/BufferAttribute.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import { Object3D } from "three/src/core/Object3D.js";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial.js";
import { Color } from "three/src/math/Color.js";
import { Quaternion } from "three/src/math/Quaternion.js";
import { Vector3 } from "three/src/math/Vector3.js";
import { Group } from "three/src/objects/Group.js";
import { Mesh } from "three/src/objects/Mesh.js";
import type { KPuzzle } from "../../../../kpuzzle";
import type { ExperimentalStickeringMask } from "../../../../puzzles/cubing-private";
import type { PuzzlePosition } from "../../../controllers/AnimationTypes";
import { smootherStep } from "../../../controllers/easing";
import { TAU } from "../TAU";
import type { Twisty3DPuzzle } from "./Twisty3DPuzzle";

const DEGREE = TAU / 360;

const SLOT_ANGLE_DEGREES = 30;
const WEDGES_PER_LAYER = 12;

const CUBE_HALF_EDGE = 1;
const EQUATOR_HALF_HEIGHT = 0.25;
const PUZZLE_SCALE = 0.5;

const DEFAULT_FACELET_SCALE = 0.85;
const STICKER_ELEVATION = 0.004;

const COLOR_UP = 0xffff00;
const COLOR_DOWN = 0xffffff;
const RING_COLORS = [0x2266ff, 0xff9900, 0x00ff00, 0xff0000];

const FRAME_OFFSET_DEGREES = 180;

const BODY_COLOR = 0x111111;

const MIRROR = -1;

const Y_AXIS = new Vector3(0, 1, 0);
const SLICE_AXIS = new Vector3(
  MIRROR * Math.sin(15 * DEGREE),
  0,
  Math.cos(15 * DEGREE),
).normalize();

const SLICE_QUATERNION = new Quaternion().setFromAxisAngle(SLICE_AXIS, TAU / 2);
const HALF_TURN_Y = new Quaternion().setFromAxisAngle(Y_AXIS, TAU / 2);

type Point2 = [x: number, z: number];

function slotAzimuthDegrees(slot: number): number {
  return (
    FRAME_OFFSET_DEGREES +
    (slot < WEDGES_PER_LAYER
      ? SLOT_ANGLE_DEGREES * slot + 120
      : 90 - SLOT_ANGLE_DEGREES * (slot - WEDGES_PER_LAYER))
  );
}

function slotQuaternion(slot: number): Quaternion {
  const quaternion = new Quaternion().setFromAxisAngle(
    Y_AXIS,
    MIRROR * slotAzimuthDegrees(slot) * DEGREE,
  );
  if (slot >= WEDGES_PER_LAYER) {
    quaternion.multiply(
      new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), TAU / 2),
    );
  }
  return quaternion;
}

const SLOT_QUATERNIONS: Quaternion[] = new Array(2 * WEDGES_PER_LAYER)
  .fill(null)
  .map((_, slot) => slotQuaternion(slot));

type WedgeShape = "cornerHigh" | "cornerLow" | "edge";

function wedgeShape(homeSlot: number): WedgeShape {
  const phase =
    homeSlot < WEDGES_PER_LAYER
      ? homeSlot % 3
      : (homeSlot - WEDGES_PER_LAYER + 2) % 3;
  return phase === 0 ? "cornerHigh" : phase === 1 ? "cornerLow" : "edge";
}

function outerFaceOffsetDegrees(shape: WedgeShape): number {
  switch (shape) {
    case "cornerHigh":
      return -30;
    case "cornerLow":
      return 30;
    case "edge":
      return 0;
  }
}

function squarePoint(phiDegrees: number): Point2 {
  return polarPoint(phiDegrees, Math.round(phiDegrees / 90) * 90);
}

function polarPoint(phiDegrees: number, faceCenterDegrees: number): Point2 {
  const radius =
    CUBE_HALF_EDGE / Math.cos((phiDegrees - faceCenterDegrees) * DEGREE);
  const phi = phiDegrees * DEGREE;
  return [MIRROR * radius * Math.sin(phi), radius * Math.cos(phi)];
}

function wedgeCrossSection(shape: WedgeShape): Point2[] {
  const faceCenterDegrees = outerFaceOffsetDegrees(shape);
  return [
    [0, 0],
    polarPoint(-SLOT_ANGLE_DEGREES / 2, faceCenterDegrees),
    polarPoint(SLOT_ANGLE_DEGREES / 2, faceCenterDegrees),
  ];
}

function cornerCrossSection(): Point2[] {
  return [
    [0, 0],
    polarPoint(-SLOT_ANGLE_DEGREES / 2, -30),
    polarPoint(SLOT_ANGLE_DEGREES / 2, -30), // the cube corner, shared by both halves
    polarPoint(SLOT_ANGLE_DEGREES + SLOT_ANGLE_DEGREES / 2, 60),
  ];
}

const CORNER_PAIRS: [high: number, low: number][] = [];
for (let slot = 0; slot < 2 * WEDGES_PER_LAYER; slot++) {
  if (wedgeShape(slot) === "cornerHigh") {
    CORNER_PAIRS.push([slot, nextSlotInLayer(slot)]);
  }
}

function nextSlotInLayer(slot: number): number {
  return slot < WEDGES_PER_LAYER
    ? (slot + 1) % WEDGES_PER_LAYER
    : WEDGES_PER_LAYER + ((slot - WEDGES_PER_LAYER + 1) % WEDGES_PER_LAYER);
}

function wedgeSideColor(homeSlot: number): number {
  return ringColorAt(slotAzimuthDegrees(homeSlot));
}

interface PrismSpec {
  polygon: Point2[];
  yBottom: number;
  yTop: number;
  topColor: number | null;
  bottomColor: number | null;
  sideColors: (number | null)[];
}

interface StickerSpec {
  corners: Vector3[];
  normal: Vector3;
  color: number;
}

function prismBodyPositions(spec: PrismSpec): Float32Array {
  const { polygon, yBottom, yTop } = spec;
  const out: number[] = [];
  const n = polygon.length;
  for (const y of [yTop, yBottom]) {
    for (let i = 1; i < n - 1; i++) {
      out.push(
        polygon[0][0],
        y,
        polygon[0][1],
        polygon[i][0],
        y,
        polygon[i][1],
        polygon[i + 1][0],
        y,
        polygon[i + 1][1],
      );
    }
  }
  for (let i = 0; i < n; i++) {
    const [x0, z0] = polygon[i];
    const [x1, z1] = polygon[(i + 1) % n];
    out.push(x0, yBottom, z0, x1, yBottom, z1, x1, yTop, z1);
    out.push(x0, yBottom, z0, x1, yTop, z1, x0, yTop, z0);
  }
  return new Float32Array(out);
}

function prismStickerSpecs(spec: PrismSpec): StickerSpec[] {
  const { polygon, yBottom, yTop, topColor, bottomColor, sideColors } = spec;
  const specs: StickerSpec[] = [];
  if (topColor !== null) {
    specs.push({
      corners: polygon.map(([x, z]) => new Vector3(x, yTop, z)),
      normal: new Vector3(0, 1, 0),
      color: topColor,
    });
  }
  if (bottomColor !== null) {
    specs.push({
      corners: polygon.map(([x, z]) => new Vector3(x, yBottom, z)),
      normal: new Vector3(0, -1, 0),
      color: bottomColor,
    });
  }

  let centroidX = 0;
  let centroidZ = 0;
  for (const [x, z] of polygon) {
    centroidX += x / polygon.length;
    centroidZ += z / polygon.length;
  }

  for (let i = 0; i < polygon.length; i++) {
    const color = sideColors[i];
    if (color === null || color === undefined) {
      continue;
    }
    const [x0, z0] = polygon[i];
    const [x1, z1] = polygon[(i + 1) % polygon.length];
    const normal = new Vector3(z1 - z0, 0, -(x1 - x0)).normalize();
    const outward =
      normal.x * ((x0 + x1) / 2 - centroidX) +
      normal.z * ((z0 + z1) / 2 - centroidZ);
    if (outward < 0) {
      normal.negate();
    }
    specs.push({
      corners: [
        new Vector3(x0, yBottom, z0),
        new Vector3(x1, yBottom, z1),
        new Vector3(x1, yTop, z1),
        new Vector3(x0, yTop, z0),
      ],
      normal,
      color,
    });
  }
  return specs;
}

function stickerPositions(
  spec: StickerSpec,
  faceletScale: number,
): Float32Array {
  const center = new Vector3();
  for (const corner of spec.corners) {
    center.addScaledVector(corner, 1 / spec.corners.length);
  }
  const placed = spec.corners.map((corner) =>
    center
      .clone()
      .addScaledVector(corner.clone().sub(center), faceletScale)
      .addScaledVector(spec.normal, STICKER_ELEVATION),
  );
  const out: number[] = [];
  for (let i = 1; i < placed.length - 1; i++) {
    out.push(
      placed[0].x,
      placed[0].y,
      placed[0].z,
      placed[i].x,
      placed[i].y,
      placed[i].z,
      placed[i + 1].x,
      placed[i + 1].y,
      placed[i + 1].z,
    );
  }
  return new Float32Array(out);
}

const bodyMaterial = new MeshBasicMaterial({
  color: new Color(BODY_COLOR).convertLinearToSRGB(),
  side: DoubleSide,
});

const stickerMaterialCache = new Map<number, MeshBasicMaterial>();
function stickerMaterial(color: number): MeshBasicMaterial {
  let material = stickerMaterialCache.get(color);
  if (!material) {
    material = new MeshBasicMaterial({
      color: new Color(color).convertLinearToSRGB(),
      side: DoubleSide,
    });
    stickerMaterialCache.set(color, material);
  }
  return material;
}

class Square1Piece extends Group {
  readonly body: Mesh;
  readonly #stickerSpecs: StickerSpec[];
  readonly #stickerMeshes: Mesh[] = [];

  constructor(spec: PrismSpec, faceletScale: number) {
    super();

    const bodyGeometry = new BufferGeometry();
    bodyGeometry.setAttribute(
      "position",
      new BufferAttribute(prismBodyPositions(spec), 3),
    );
    this.body = new Mesh(bodyGeometry, bodyMaterial);
    this.add(this.body);

    this.#stickerSpecs = prismStickerSpecs(spec);
    for (const stickerSpec of this.#stickerSpecs) {
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new BufferAttribute(stickerPositions(stickerSpec, faceletScale), 3),
      );
      const mesh = new Mesh(geometry, stickerMaterial(stickerSpec.color));
      this.#stickerMeshes.push(mesh);
      this.add(mesh);
    }
  }

  setFaceletScale(faceletScale: number): void {
    for (let i = 0; i < this.#stickerMeshes.length; i++) {
      const geometry = this.#stickerMeshes[i].geometry;
      geometry.setAttribute(
        "position",
        new BufferAttribute(
          stickerPositions(this.#stickerSpecs[i], faceletScale),
          3,
        ),
      );
    }
  }

  setFoundationVisible(visible: boolean): void {
    this.body.visible = visible;
  }
}

function wedgePrismSpec(homeSlot: number): PrismSpec {
  const shape = wedgeShape(homeSlot);
  return {
    polygon: wedgeCrossSection(shape),
    yBottom: EQUATOR_HALF_HEIGHT,
    yTop: CUBE_HALF_EDGE,
    topColor: homeSlot < WEDGES_PER_LAYER ? COLOR_UP : COLOR_DOWN,
    bottomColor: null,
    sideColors: [null, wedgeSideColor(homeSlot), null],
  };
}

function cornerPrismSpec([high, low]: [number, number]): PrismSpec {
  return {
    polygon: cornerCrossSection(),
    yBottom: EQUATOR_HALF_HEIGHT,
    yTop: CUBE_HALF_EDGE,
    topColor: high < WEDGES_PER_LAYER ? COLOR_UP : COLOR_DOWN,
    bottomColor: null,
    sideColors: [null, wedgeSideColor(high), wedgeSideColor(low), null],
  };
}

function equatorPrismSpec(homePiece: number): PrismSpec {
  const startDegrees = FRAME_OFFSET_DEGREES + (homePiece === 0 ? 105 : 285);
  const boundaries = [startDegrees];
  for (
    let corner = Math.ceil((startDegrees - 45) / 90) * 90 + 45;
    corner < startDegrees + 180;
    corner += 90
  ) {
    boundaries.push(corner);
  }
  boundaries.push(startDegrees + 180);
  return {
    polygon: boundaries.map((phiDegrees) => squarePoint(phiDegrees)),
    yBottom: -EQUATOR_HALF_HEIGHT,
    yTop: EQUATOR_HALF_HEIGHT,
    topColor: null,
    bottomColor: null,
    sideColors: [
      ...boundaries
        .slice(0, -1)
        .map((phiDegrees, i) =>
          ringColorAt((phiDegrees + boundaries[i + 1]) / 2),
        ),
      null,
    ],
  };
}

function ringColorAt(phiDegrees: number): number {
  const faceIndex = Math.round(phiDegrees / 90);
  return RING_COLORS[((faceIndex % 4) + 4) % 4];
}

export interface Square1_3DOptions {
  showFoundation?: boolean;
  faceletScale?: "auto" | number;
  hintFacelets?: unknown;
  hintFaceletsElevation?: unknown;
}

export class Square1_3D extends Object3D implements Twisty3DPuzzle {
  #wedgePieces: Square1Piece[] = [];
  #cornerPieces: Square1Piece[] = [];
  #equatorPieces: Square1Piece[] = [];
  #faceletScale: number = DEFAULT_FACELET_SCALE;
  #showFoundation = true;

  #slotOfPiece = new Int8Array(2 * WEDGES_PER_LAYER);
  #slotMoveMask = new Uint8Array(2 * WEDGES_PER_LAYER);
  #slotRotation: (Quaternion | null)[] = new Array(2 * WEDGES_PER_LAYER).fill(
    null,
  );

  constructor(
    kpuzzle: KPuzzle,
    private scheduleRenderCallback?: () => void,
    options: Square1_3DOptions = {},
  ) {
    super();

    if (kpuzzle.name() !== "Square-1") {
      throw new Error(
        `Invalid puzzle for this Square1_3D implementation: ${kpuzzle.name()}`,
      );
    }

    if (typeof options.faceletScale === "number") {
      this.#faceletScale = options.faceletScale;
    }
    if (typeof options.showFoundation === "boolean") {
      this.#showFoundation = options.showFoundation;
    }

    for (let piece = 0; piece < 2 * WEDGES_PER_LAYER; piece++) {
      const wedge = new Square1Piece(wedgePrismSpec(piece), this.#faceletScale);
      wedge.setFoundationVisible(this.#showFoundation);
      wedge.quaternion.copy(SLOT_QUATERNIONS[piece]);
      this.#wedgePieces.push(wedge);
      this.add(wedge);
    }
    for (const pair of CORNER_PAIRS) {
      const corner = new Square1Piece(
        cornerPrismSpec(pair),
        this.#faceletScale,
      );
      corner.setFoundationVisible(this.#showFoundation);
      corner.visible = false; // Until `onPositionChange` decides.
      this.#cornerPieces.push(corner);
      this.add(corner);
    }
    for (let piece = 0; piece < 2; piece++) {
      const equator = new Square1Piece(
        equatorPrismSpec(piece),
        this.#faceletScale,
      );
      equator.setFoundationVisible(this.#showFoundation);
      this.#equatorPieces.push(equator);
      this.add(equator);
    }

    this.scale.set(PUZZLE_SCALE, PUZZLE_SCALE, PUZZLE_SCALE);
  }

  onPositionChange(position: PuzzlePosition): void {
    const wedges = position.pattern.patternData["WEDGES"];
    const equator = position.pattern.patternData["EQUATOR"];

    for (let slot = 0; slot < 2 * WEDGES_PER_LAYER; slot++) {
      this.#slotOfPiece[wedges.pieces[slot]] = slot;
      this.#slotMoveMask[slot] = 0;
      this.#slotRotation[slot] = null;
    }

    let equatorRotation: Quaternion | null = null;
    let moveBit = 1;
    for (const moveInProgress of position.movesInProgress) {
      const { family, amount } = moveInProgress.move;
      const turns =
        smootherStep(moveInProgress.fraction) *
        moveInProgress.direction *
        amount;

      let slotStart: number;
      let slotEnd: number;
      const quaternion = new Quaternion();
      switch (family) {
        case "U_SQ_":
          quaternion.setFromAxisAngle(
            Y_AXIS,
            MIRROR * turns * SLOT_ANGLE_DEGREES * DEGREE,
          );
          slotStart = 0;
          slotEnd = WEDGES_PER_LAYER;
          break;
        case "D_SQ_":
          quaternion.setFromAxisAngle(
            Y_AXIS,
            -MIRROR * turns * SLOT_ANGLE_DEGREES * DEGREE,
          );
          slotStart = WEDGES_PER_LAYER;
          slotEnd = 2 * WEDGES_PER_LAYER;
          break;
        case "_SLASH_":
          quaternion.setFromAxisAngle(SLICE_AXIS, (turns * TAU) / 2);
          slotStart = WEDGES_PER_LAYER / 2;
          slotEnd = WEDGES_PER_LAYER + WEDGES_PER_LAYER / 2;
          equatorRotation = quaternion;
          break;
        default:
          continue;
      }

      for (let slot = slotStart; slot < slotEnd; slot++) {
        const existing = this.#slotRotation[slot];
        this.#slotRotation[slot] = existing
          ? existing.clone().premultiply(quaternion)
          : quaternion;
        this.#slotMoveMask[slot] |= moveBit;
      }
      moveBit = (moveBit << 1) & 0xff;
    }

    for (let piece = 0; piece < 2 * WEDGES_PER_LAYER; piece++) {
      this.#placeWedge(this.#wedgePieces[piece], this.#slotOfPiece[piece]);
    }

    for (let i = 0; i < CORNER_PAIRS.length; i++) {
      const [high, low] = CORNER_PAIRS[i];
      const highSlot = this.#slotOfPiece[high];
      const lowSlot = this.#slotOfPiece[low];
      const joined =
        nextSlotInLayer(highSlot) === lowSlot &&
        this.#slotMoveMask[highSlot] === this.#slotMoveMask[lowSlot];
      this.#cornerPieces[i].visible = joined;
      this.#wedgePieces[high].visible = !joined;
      this.#wedgePieces[low].visible = !joined;
      if (joined) {
        this.#placeWedge(this.#cornerPieces[i], highSlot);
      }
    }

    for (let slot = 0; slot < 2; slot++) {
      const piece = equator.pieces[slot];
      const quaternion = this.#equatorPieces[piece].quaternion;
      quaternion.identity();
      if (piece !== slot) {
        quaternion.multiply(HALF_TURN_Y);
      }
      if (((equator.orientation[slot] % 6) + 6) % 6 >= 3) {
        quaternion.premultiply(SLICE_QUATERNION);
      }
      if (slot === 1 && equatorRotation) {
        quaternion.premultiply(equatorRotation);
      }
    }
  }

  #placeWedge(piece: Square1Piece, slot: number): void {
    const quaternion = piece.quaternion.copy(SLOT_QUATERNIONS[slot]);
    const rotation = this.#slotRotation[slot];
    if (rotation) {
      quaternion.premultiply(rotation);
    }
  }

  setStickeringMask(_stickeringMask: ExperimentalStickeringMask): void {}

  experimentalUpdateOptions(options: Square1_3DOptions): void {
    let changed = false;

    if (typeof options.showFoundation === "boolean") {
      if (options.showFoundation !== this.#showFoundation) {
        this.#showFoundation = options.showFoundation;
        for (const piece of this.#allPieces()) {
          piece.setFoundationVisible(this.#showFoundation);
        }
        changed = true;
      }
    }

    if (typeof options.faceletScale !== "undefined") {
      const faceletScale =
        options.faceletScale === "auto"
          ? DEFAULT_FACELET_SCALE
          : options.faceletScale;
      if (faceletScale !== this.#faceletScale) {
        this.#faceletScale = faceletScale;
        for (const piece of this.#allPieces()) {
          piece.setFaceletScale(faceletScale);
        }
        changed = true;
      }
    }

    if (changed) {
      this.scheduleRenderCallback?.();
    }
  }

  *#allPieces(): Generator<Square1Piece> {
    yield* this.#wedgePieces;
    yield* this.#cornerPieces;
    yield* this.#equatorPieces;
  }
}
