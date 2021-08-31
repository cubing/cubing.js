import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Triangle,
  Vector3,
} from "three";
import {
  areTransformationsEquivalent,
  KPuzzleDefinition,
  Transformation,
} from "../../../../kpuzzle";
import { experimentalTransformationForQuantumMove } from "../../../../kpuzzle";
import type {
  StickerDat,
  StickerDatSticker,
} from "../../../../puzzle-geometry";
import {
  ExperimentalFaceletMeshAppearance,
  experimentalGetFaceletAppearance,
  ExperimentalPuzzleAppearance,
} from "../../../../puzzles";
import type { AlgCursor } from "../../../old/animation/cursor/AlgCursor";
import type { PuzzlePosition } from "../../../old/animation/cursor/CursorTypes";
import { smootherStep } from "../../../old/animation/easing";
import type { HintFaceletStyle } from "../../../old/dom/TwistyPlayerConfig";
import { TAU } from "../TAU";

import type { Twisty3DPuzzle } from "./Twisty3DPuzzle";

const foundationMaterial = new MeshBasicMaterial({
  side: DoubleSide,
  color: 0x000000,
  // transparency doesn't work very well here
  // with duplicated center stickers
  //  transparent: true,
  //  opacity: 0.75,
});
const stickerMaterial = new MeshBasicMaterial({
  vertexColors: true,
  //    side: DoubleSide,
});
const polyMaterial = new MeshBasicMaterial({
  visible: false,
});

class Filler {
  pos: number;
  ipos: number;
  vertices: Float32Array;
  colors: Uint8Array;
  ind: Uint8Array;
  constructor(public sz: number, public colored: boolean = true) {
    this.vertices = new Float32Array(9 * sz);
    if (colored) {
      this.colors = new Uint8Array(18 * sz);
      this.ind = new Uint8Array(sz);
    }
    this.pos = 0;
    this.ipos = 0;
  }

  add(pt: number[], c: number) {
    this.vertices[this.pos] = pt[0];
    this.vertices[this.pos + 1] = pt[1];
    this.vertices[this.pos + 2] = pt[2];
    this.colors[this.pos] = c >> 16;
    this.colors[this.pos + 1] = (c >> 8) & 255;
    this.colors[this.pos + 2] = c & 255;
    this.pos += 3;
  }

  addUncolored(pt: number[]) {
    this.vertices[this.pos] = pt[0];
    this.vertices[this.pos + 1] = pt[1];
    this.vertices[this.pos + 2] = pt[2];
    this.pos += 3;
  }

  setind(i: number) {
    this.ind[this.ipos++] = i;
  }

  setAttributes(geo: BufferGeometry) {
    geo.setAttribute("position", new BufferAttribute(this.vertices, 3));
    if (this.colored) {
      geo.setAttribute("color", new BufferAttribute(this.colors, 3, true));
    }
  }

  makeGroups(geo: BufferGeometry) {
    geo.clearGroups();
    let groupCount = 0;
    for (let i = 0; i < this.ipos; ) {
      const si = i++;
      const iv = this.ind[si];
      while (this.ind[i] === iv) {
        i++;
      }
      groupCount++;
      geo.addGroup(3 * si, 3 * (i - si), iv);
    }
    console.log("Group count is " + groupCount);
  }

  saveOriginalColors() {
    this.colors.copyWithin(this.pos, 0, this.pos);
  }
}

function makePoly(
  filler: Filler,
  coords: number[][],
  color: number,
  scale: number,
  ind: number,
): void {
  let ncoords: number[][] = coords;
  if (scale !== 1) {
    ncoords = [];
    for (const v of coords) {
      const v2 = [v[0] * scale, v[1] * scale, v[2] * scale];
      ncoords.push(v2);
    }
  }
  for (let g = 1; g + 1 < ncoords.length; g++) {
    filler.add(ncoords[0], color);
    filler.add(ncoords[g], color);
    filler.add(ncoords[g + 1], color);
    filler.setind(ind);
  }
}

class StickerDef {
  public origColor: number;
  public origColorAppearance: number;
  public faceColor: number;
  public twistVal: number = -1;
  public stickerStart: number;
  public stickerEnd: number;
  public hintStart: number;
  public hintEnd: number;
  public foundationStart: number;
  public foundationEnd: number;
  public isDup: boolean;
  constructor(
    public filler: Filler,
    stickerDat: StickerDatSticker,
    options?: {
      appearance?: ExperimentalFaceletMeshAppearance;
    },
  ) {
    this.isDup = !!stickerDat.isDup;
    this.stickerStart = filler.ipos;
    const sdColor = new Color(stickerDat.color).getHex();
    this.origColor = sdColor;
    this.origColorAppearance = sdColor;
    if (options?.appearance) {
      this.setAppearance(options.appearance);
    }
    this.faceColor = sdColor;
    const coords = stickerDat.coords as number[][];
    makePoly(filler, coords, this.faceColor, 1, this.isDup ? 4 : 0);
    this.stickerEnd = filler.ipos;
  }

  addHint(
    stickerDat: StickerDatSticker,
    hintStickers: boolean,
    hintStickerHeightScale: number,
  ): void {
    this.hintStart = this.filler.ipos;
    const coords = stickerDat.coords as number[][];
    let highArea = 0;
    let goodFace = null;
    const v0 = new Vector3(coords[0][0], coords[0][1], coords[0][2]);
    let v1 = new Vector3(coords[1][0], coords[1][1], coords[1][2]);
    for (let g = 2; g < coords.length; g++) {
      const v2 = new Vector3(coords[g][0], coords[g][1], coords[g][2]);
      const t = new Triangle(v0, v1, v2);
      const a = t.getArea();
      if (a > highArea) {
        highArea = a;
        goodFace = t;
      }
      v1 = v2;
    }
    const norm = new Vector3();
    goodFace!.getNormal(norm);
    norm.multiplyScalar(0.5 * hintStickerHeightScale);
    const hintCoords = [];
    for (let i = 0; i < coords.length; i++) {
      const j = coords.length - 1 - i;
      hintCoords.push([
        coords[j][0] + norm.x,
        coords[j][1] + norm.y,
        coords[j][2] + norm.z,
      ]);
    }
    makePoly(
      this.filler,
      hintCoords,
      this.faceColor,
      1,
      hintStickers && !this.isDup ? 2 : 4,
    );
    this.hintEnd = this.filler.ipos;
  }

  public addFoundation(
    filler: Filler,
    foundationDat: StickerDatSticker,
    black: number,
  ) {
    this.foundationStart = filler.ipos;
    makePoly(
      filler,
      foundationDat.coords as number[][],
      black,
      0.999,
      this.isDup ? 4 : 6,
    );
    this.foundationEnd = filler.ipos;
  }

  public setHintStickers(hintStickers: boolean): void {
    let indv = this.isDup || !hintStickers ? 4 : 2;
    for (let i = this.hintStart; i < this.hintEnd; i++) {
      this.filler.ind[i] = indv;
    }
  }

  public setAppearance(
    faceletMeshAppearance: ExperimentalFaceletMeshAppearance,
  ): void {
    let c = 0;
    switch (faceletMeshAppearance) {
      case "regular":
        c = this.origColor;
        break;
      case "dim":
        if (this.origColor === 0xffffff) {
          c = 0xdddddd;
        } else {
          c = new Color(this.origColor).multiplyScalar(0.5).getHex();
        }
        break;
      case "oriented":
        c = 0xff88ff;
        break;
      case "ignored":
        c = 0x444444;
        break;
      case "invisible":
        c = this.origColor;
    }
    this.origColorAppearance = c;
    for (let i = 9 * this.stickerStart; i < 9 * this.stickerEnd; i += 3) {
      this.filler.colors[this.filler.pos + i] = c >> 16;
      this.filler.colors[this.filler.pos + i + 1] = (c >> 8) & 255;
      this.filler.colors[this.filler.pos + i + 2] = c & 255;
    }
    for (let i = 9 * this.hintStart; i < 9 * this.hintEnd; i += 3) {
      this.filler.colors[this.filler.pos + i] = c >> 16;
      this.filler.colors[this.filler.pos + i + 1] = (c >> 8) & 255;
      this.filler.colors[this.filler.pos + i + 2] = c & 255;
    }
    this.setHintStickers(faceletMeshAppearance !== "invisible" && !this.isDup);
  }

  public setColor(sd: StickerDef): number {
    const c = sd.origColorAppearance;
    if (this.faceColor !== c) {
      this.faceColor = c;
      this.filler.colors.copyWithin(
        9 * this.stickerStart,
        9 * sd.stickerStart + this.filler.pos,
        9 * sd.stickerEnd + this.filler.pos,
      );
      return 1;
    } else {
      return 0;
    }
  }
}

class HitPlaneDef {
  public cubie: Group;
  protected geo: BufferGeometry;
  constructor(hitface: any) {
    this.cubie = new Group();
    const coords = hitface.coords as number[][];
    const filler = new Filler(coords.length - 2, true);
    for (let g = 1; g + 1 < coords.length; g++) {
      filler.addUncolored(coords[0]);
      filler.addUncolored(coords[g]);
      filler.addUncolored(coords[g + 1]);
    }
    this.geo = new BufferGeometry();
    filler.setAttributes(this.geo);
    const obj = new Mesh(this.geo, polyMaterial);
    obj.userData.name = hitface.name;
    this.cubie.scale.setScalar(0.99);
    this.cubie.add(obj);
  }
}

class AxisInfo {
  public axis: Vector3;
  public order: number;
  constructor(axisDat: any) {
    const vec = axisDat[0] as number[];
    this.axis = new Vector3(vec[0], vec[1], vec[2]);
    this.order = axisDat[2];
  }
}

export interface PG3DOptions {
  appearance?: ExperimentalPuzzleAppearance;
}

const PG_SCALE = 0.5;

// TODO: Split into "scene model" and "view".
/*
 *  PG3D uses a single geometry for the puzzle, with all the faces for
 *  each sticker (including the foundation stickers) in a single
 *  geometry.  We use the materialIndex in the face to point to a
 *  specific entry, which is either a colored sticker, invisible, or
 *  black (foundation).
 *
 *  To support general twisting of a subset of the puzzle, we then
 *  instantiate this same geometry in two different meshes with two
 *  distinct material arrays.  One, the fixed mesh, has the material
 *  array set up like:  [colored, invisible, black, invisible].
 *  The twisting mesh has the material array set up as
 *  [invisible, colored, invislble, black].  When not twisted, the
 *  two meshes are directly coincident, and the (shared) materialIndex
 *  in each face points to a non-invisible material in exactly one of
 *  the two meshes.  When we decide to twist some cubies, we make
 *  the cubies that move point to visible materials in the moving
 *  mesh (which makes them point to invisible materials in the static
 *  mesh).  This way, we only need to rotate the moving mesh as a
 *  single object---this should be very fast, and occur entirely in
 *  the GPU.  Unfortunately this doesn't quite work as fast as we'd
 *  like because three.js makes a draw call every time we have a change
 *  in the material index.  By moving the foundation triangles separate
 *  from the sticker triangles, we enhance the probability that many
 *  triangles can be rendered in one call speeding up the render.
 *  We also get some assistance from puzzleGeometry to try to keep
 *  nearby stickers close to each other.
 */
export class PG3D extends Object3D implements Twisty3DPuzzle {
  private stickers: { [key: string]: StickerDef[][] };
  private axesInfo: { [key: string]: AxisInfo };

  private stickerTargets: Object3D[] = [];
  private controlTargets: Object3D[] = [];

  protected movingObj: Object3D;
  protected filler: Filler;
  protected foundationBound: number; // before this: colored; after: black
  protected fixedGeo: BufferGeometry;
  protected lastPos: PuzzlePosition;
  protected lastMove: Transformation;
  protected hintMaterial: MeshBasicMaterial;
  protected materialArray1: MeshBasicMaterial[];
  protected materialArray2: MeshBasicMaterial[];

  #pendingStickeringUpdate: boolean = false;

  constructor(
    cursor: AlgCursor,
    private scheduleRenderCallback: () => void,
    private definition: KPuzzleDefinition,
    private pgdat: StickerDat,
    showFoundation: boolean = false,
    hintStickers: boolean = false,
    hintStickerHeightScale: number = 1,
    private params: PG3DOptions = {},
  ) {
    super();
    this.hintMaterial = new MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
    });
    this.axesInfo = {};
    const axesDef = this.pgdat.axis as any[];
    for (const axis of axesDef) {
      this.axesInfo[axis[1]] = new AxisInfo(axis);
    }
    const stickers = this.pgdat.stickers as any[];
    console.log("Constructor with " + stickers.length);
    this.stickers = {};
    this.materialArray1 = [
      stickerMaterial,
      polyMaterial,
      this.hintMaterial,
      polyMaterial,
      polyMaterial,
      polyMaterial,
      foundationMaterial,
      polyMaterial,
    ];
    this.materialArray2 = [
      polyMaterial,
      stickerMaterial,
      polyMaterial,
      this.hintMaterial,
      polyMaterial,
      polyMaterial,
      polyMaterial,
      foundationMaterial,
    ];
    this.enableFoundation(showFoundation);
    let triangleCount = 0;
    let multiplier = 1;
    // to support dynamic updating of hint stickers, we always build in hint
    // stickers, but we permit the Material to be toggled on and off.
    multiplier++;
    multiplier++;
    for (let si = 0; si < stickers.length; si++) {
      const sides = stickers[si].coords.length;
      triangleCount += multiplier * (sides - 2);
    }
    const filler = new Filler(triangleCount);
    const black = 0;
    for (let si = 0; si < stickers.length; si++) {
      const sticker = stickers[si];
      const orbit = sticker.orbit as string;
      const ord = sticker.ord as number;
      const ori = sticker.ori as number;
      if (!this.stickers[orbit]) {
        this.stickers[orbit] = [];
      }
      if (!this.stickers[orbit][ori]) {
        this.stickers[orbit][ori] = [];
      }
      const options: { appearance?: ExperimentalFaceletMeshAppearance } = {};
      if (params.appearance) {
        options.appearance = experimentalGetFaceletAppearance(
          params.appearance,
          orbit,
          ord,
          ori,
          false,
        );
      }
      const stickerdef = new StickerDef(filler, sticker, options);
      this.stickers[orbit][ori][ord] = stickerdef;
    }
    for (let si = 0; si < stickers.length; si++) {
      const sticker = stickers[si];
      const orbit = sticker.orbit as number;
      const ord = sticker.ord as number;
      const ori = sticker.ori as number;
      this.stickers[orbit][ori][ord].addHint(
        sticker,
        hintStickers,
        hintStickerHeightScale,
      );
    }
    this.foundationBound = filler.ipos;
    for (let si = 0; si < stickers.length; si++) {
      const sticker = stickers[si];
      const foundation = this.pgdat.foundations[si];
      const orbit = sticker.orbit as number;
      const ord = sticker.ord as number;
      const ori = sticker.ori as number;
      this.stickers[orbit][ori][ord].addFoundation(filler, foundation, black);
    }
    const fixedGeo = new BufferGeometry();
    filler.setAttributes(fixedGeo);
    filler.makeGroups(fixedGeo);
    const obj = new Mesh(fixedGeo, this.materialArray1);
    obj.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
    this.add(obj);
    const obj2 = new Mesh(fixedGeo, this.materialArray2);
    obj2.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
    this.add(obj2);
    const hitfaces = this.pgdat.faces as any[];
    this.movingObj = obj2;
    this.fixedGeo = fixedGeo;
    this.filler = filler;
    for (const hitface of hitfaces) {
      const facedef = new HitPlaneDef(hitface);
      facedef.cubie.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
      this.add(facedef.cubie);
      this.controlTargets.push(facedef.cubie.children[0]);
    }
    filler.saveOriginalColors();
    cursor!.addPositionListener(this);
  }

  public dispose(): void {
    if (this.fixedGeo) {
      this.fixedGeo.dispose();
    }
  }

  public experimentalGetStickerTargets(): Object3D[] {
    return this.stickerTargets;
  }

  public experimentalGetControlTargets(): Object3D[] {
    return this.controlTargets;
  }

  experimentalSetAppearance(appearance: ExperimentalPuzzleAppearance): void {
    this.params.appearance = appearance;
    for (const orbitName in this.definition.orbits) {
      const { numPieces, orientations } = this.definition.orbits[orbitName];
      for (let pieceIdx = 0; pieceIdx < numPieces; pieceIdx++) {
        for (let faceletIdx = 0; faceletIdx < orientations; faceletIdx++) {
          const faceletAppearance = experimentalGetFaceletAppearance(
            appearance,
            orbitName,
            pieceIdx,
            faceletIdx,
            false,
          );
          const stickerDef = this.stickers[orbitName][faceletIdx][pieceIdx];
          stickerDef.setAppearance(faceletAppearance);
        }
      }
    }
    if (this.scheduleRenderCallback) {
      this.#pendingStickeringUpdate = true;
      this.onPositionChange(this.lastPos);
      this.scheduleRenderCallback();
    }
  }

  public onPositionChange(p: PuzzlePosition): void {
    const state = p.state as Transformation;
    const noRotation = new Euler();
    this.movingObj.rotation.copy(noRotation);
    let colormods = 0;
    if (
      !this.lastPos ||
      this.#pendingStickeringUpdate ||
      !areTransformationsEquivalent(this.definition, this.lastPos.state, state)
    ) {
      for (const orbit in this.stickers) {
        const pieces = this.stickers[orbit];
        const pos2 = state[orbit];
        const orin = pieces.length;
        if (orin === 1) {
          const pieces2 = pieces[0];
          for (let i = 0; i < pieces2.length; i++) {
            const ni = pos2.permutation[i];
            colormods += pieces2[i].setColor(pieces2[ni]);
          }
        } else {
          for (let ori = 0; ori < orin; ori++) {
            const pieces2 = pieces[ori];
            for (let i = 0; i < pieces2.length; i++) {
              const nori = (ori + orin - pos2.orientation[i]) % orin;
              const ni = pos2.permutation[i];
              colormods += pieces2[i].setColor(pieces[nori][ni]);
            }
          }
        }
      }
      this.lastPos = p;
      this.#pendingStickeringUpdate = false;
    }
    let vismods = 0;
    for (const moveProgress of p.movesInProgress) {
      const externalMove = moveProgress.move;
      // TODO: unswizzle goes external to internal, and so does the call after that
      // and so does the stateForBlockMove call
      const unswizzled = this.pgdat.unswizzle(externalMove);
      const move = this.pgdat.notationMapper.notationToInternal(externalMove);
      if (move === null) {
        throw Error("Bad blockmove " + externalMove.family);
      }
      const quantumTransformation = experimentalTransformationForQuantumMove(
        this.definition,
        externalMove.quantum,
      );
      const ax = this.axesInfo[unswizzled];
      const turnNormal = ax.axis;
      const angle =
        (-this.ease(moveProgress.fraction) *
          moveProgress.direction *
          move.amount *
          TAU) /
        ax.order;
      this.movingObj.rotateOnAxis(turnNormal, angle);
      if (this.lastMove !== quantumTransformation) {
        for (const orbit in this.stickers) {
          const pieces = this.stickers[orbit];
          const orin = pieces.length;
          const bmv = quantumTransformation[orbit];
          for (let ori = 0; ori < orin; ori++) {
            const pieces2 = pieces[ori];
            for (let i = 0; i < pieces2.length; i++) {
              const ni = bmv.permutation[i];
              let tv = 0;
              if (ni !== i || bmv.orientation[i] !== 0) {
                tv = 1;
              }
              if (tv !== pieces2[i].twistVal) {
                if (tv) {
                  for (
                    let j = pieces2[i].stickerStart;
                    j < pieces2[i].stickerEnd;
                    j++
                  ) {
                    this.filler.ind[j] |= 1;
                  }
                  for (
                    let j = pieces2[i].hintStart;
                    j < pieces2[i].hintEnd;
                    j++
                  ) {
                    this.filler.ind[j] |= 1;
                  }
                  for (
                    let j = pieces2[i].foundationStart;
                    j < pieces2[i].foundationEnd;
                    j++
                  ) {
                    this.filler.ind[j] |= 1;
                  }
                } else {
                  for (
                    let j = pieces2[i].stickerStart;
                    j < pieces2[i].stickerEnd;
                    j++
                  ) {
                    this.filler.ind[j] &= ~1;
                  }
                  for (
                    let j = pieces2[i].hintStart;
                    j < pieces2[i].hintEnd;
                    j++
                  ) {
                    this.filler.ind[j] &= ~1;
                  }
                  for (
                    let j = pieces2[i].foundationStart;
                    j < pieces2[i].foundationEnd;
                    j++
                  ) {
                    this.filler.ind[j] &= ~1;
                  }
                }
                pieces2[i].twistVal = tv;
                vismods++;
              }
            }
          }
        }
        this.lastMove = quantumTransformation;
      }
    }
    if (vismods) {
      this.filler.makeGroups(this.fixedGeo);
    }
    if (colormods) {
      (this.fixedGeo.getAttribute("color") as BufferAttribute).updateRange = {
        offset: 0,
        count: 9 * this.foundationBound,
      };
      (this.fixedGeo.getAttribute("color") as BufferAttribute).needsUpdate =
        true;
    }
    this.scheduleRenderCallback!();
  }

  private ease(fraction: number): number {
    return smootherStep(fraction);
  }

  private enableHintFacelets(v: boolean) {
    if (v) {
      this.materialArray1[2] = this.hintMaterial;
      this.materialArray2[3] = this.hintMaterial;
    } else {
      this.materialArray1[2] = polyMaterial;
      this.materialArray2[3] = polyMaterial;
    }
  }

  private enableFoundation(v: boolean) {
    if (v) {
      this.materialArray1[6] = foundationMaterial;
      this.materialArray2[7] = foundationMaterial;
    } else {
      this.materialArray1[6] = polyMaterial;
      this.materialArray2[7] = polyMaterial;
    }
  }

  private setHintStickerOpacity(v: number): void {
    if (v === 0) {
      this.hintMaterial = polyMaterial;
    } else if (v === 1) {
      this.hintMaterial = stickerMaterial;
    } else {
      this.hintMaterial = new MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
      });
    }
  }

  public experimentalUpdateOptions(options: {
    showMainStickers?: boolean;
    hintFacelets?: HintFaceletStyle;
    showFoundation?: boolean; // TODO: better name
    hintStickerOpacity?: number;
  }): void {
    if (options.hintFacelets !== undefined) {
      this.enableHintFacelets(options.hintFacelets !== "none");
    }
    if (options.showFoundation !== undefined) {
      this.enableFoundation(options.showFoundation);
    }
    if (options.hintStickerOpacity !== undefined) {
      this.setHintStickerOpacity(options.hintStickerOpacity);
    }
    this.#pendingStickeringUpdate = true;
    if (this.lastPos) {
      this.onPositionChange(this.lastPos);
    }
    this.scheduleRenderCallback();
  }
}
