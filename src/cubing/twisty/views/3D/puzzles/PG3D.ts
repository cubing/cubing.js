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
  Vector3,
} from "three";
import {
  KPuzzleDefinition,
  experimentalTransformationForQuantumMove,
  Transformation,
} from "../../../../kpuzzle";
import type { StickerDat, StickerDatSticker } from "../../../../puzzle-geometry";
import type { AlgCursor } from "../../../old/animation/cursor/AlgCursor";
import { TAU } from "../TAU";
import type { Twisty3DPuzzle } from "./Twisty3DPuzzle";
import { smootherStep } from "../../../old/animation/easing";
import type { PuzzlePosition } from "../../../old/animation/cursor/CursorTypes";

const foundationMaterial = new MeshBasicMaterial({
  side: DoubleSide,
  color: 0x000000,
  transparent: true,
  opacity: 0.75,
});
const stickerMaterial = new MeshBasicMaterial({
  vertexColors: true,
  //    side: DoubleSide,
});
const polyMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  color: 0x000000,
});

class StickerDef {
  public origColor: Color;
  public faceColor: Color;
  public cubie: Group;
  protected geo: BufferGeometry;
  protected vertices: Float32Array;
  protected colors: Uint8Array;
  constructor(stickerDat: StickerDatSticker, showFoundation: boolean) {
    this.origColor = new Color(stickerDat.color);
    this.faceColor = new Color(stickerDat.color);
    this.cubie = new Group();
    this.geo = new BufferGeometry();
    const coords = stickerDat.coords as number[][];
    let sz = 3*(coords.length-2);
    this.vertices = new Float32Array(3*sz);
    this.colors = new Uint8Array(3*sz);
    let pos = 0;
    for (let g=1; g+1<coords.length; g++) {
      this.fill(pos, coords[0]);
      this.fill(pos+3, coords[g]);
      this.fill(pos+6, coords[g+1]);
      this.fillc(pos);
      this.fillc(pos+3);
      this.fillc(pos+6);
      pos += 9;
    }
    this.geo.setAttribute('position', new BufferAttribute(this.vertices, 3));
    this.geo.setAttribute('color', new BufferAttribute(this.colors, 3, true));
    const obj = new Mesh(this.geo, stickerMaterial);
    obj.userData.name =
      stickerDat.orbit + " " + (1 + stickerDat.ord) + " " + stickerDat.ori;
    this.cubie.add(obj);
    if (false && showFoundation) {
      const foundation = new Mesh(this.geo, foundationMaterial);
      foundation.scale.setScalar(0.99); // TODO: hacky
      this.cubie.add(foundation);
    }
  }

  fill(pos: number, coord: number[]): void {
    this.vertices[pos] = coord[0];
    this.vertices[pos+1] = coord[1];
    this.vertices[pos+2] = coord[2];
  }

  fillc(pos: number): void {
    const h = this.faceColor.getHex();
    this.colors[pos] = h >> 16;
    this.colors[pos+1] = (h >> 8) & 255;
    this.colors[pos+2] = h & 255;
  }

  public setColor(c: Color): void {
    this.faceColor.copy(c);
  }
}

class HitPlaneDef {
  public cubie: Group;
  protected geo: BufferGeometry;
  protected vertices: Float32Array;
  constructor(hitface: any) {
    this.cubie = new Group();
    this.geo = new BufferGeometry();
    const coords = hitface.coords as number[][];
    let sz = 3*(coords.length-2);
    this.vertices = new Float32Array(3*sz);
    let pos = 0;
    for (let g=1; g+1<coords.length; g++) {
      this.fill(pos, coords[0]);
      this.fill(pos+3, coords[g]);
      this.fill(pos+6, coords[g+1]);
      pos += 9;
    }
    this.geo.setAttribute('position', new BufferAttribute(this.vertices, 3));
    const obj = new Mesh(this.geo, polyMaterial);
    obj.userData.name = hitface.name;
    this.cubie.scale.setScalar(0.99);
    this.cubie.add(obj);
  }

  fill(pos: number, coord: number[]): void {
    this.vertices[pos] = coord[0];
    this.vertices[pos+1] = coord[1];
    this.vertices[pos+2] = coord[2];
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

const PG_SCALE = 0.5;

// TODO: Split into "scene model" and "view".
export class PG3D extends Object3D implements Twisty3DPuzzle {
  private stickers: { [key: string]: StickerDef[][] };
  private axesInfo: { [key: string]: AxisInfo };

  private stickerTargets: Object3D[] = [];
  private controlTargets: Object3D[] = [];

  constructor(
    cursor: AlgCursor,
    private scheduleRenderCallback: () => void,
    private definition: KPuzzleDefinition,
    private pgdat: StickerDat,
    showFoundation: boolean = false,
  ) {
    super();
    cursor!.addPositionListener(this);

    this.axesInfo = {};
    const axesDef = pgdat.axis as any[];
    for (const axis of axesDef) {
      this.axesInfo[axis[1]] = new AxisInfo(axis);
    }
    const stickers = pgdat.stickers as any[];
    this.stickers = {};
    for (const sticker of stickers) {
      const orbit = sticker.orbit as number;
      const ord = sticker.ord as number;
      const ori = sticker.ori as number;
      if (!this.stickers[orbit]) {
        this.stickers[orbit] = [];
      }
      if (!this.stickers[orbit][ori]) {
        this.stickers[orbit][ori] = [];
      }
      const stickerdef = new StickerDef(sticker, showFoundation);
      stickerdef.cubie.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
      this.stickers[orbit][ori][ord] = stickerdef;
      this.add(stickerdef.cubie);
      this.stickerTargets.push(stickerdef.cubie.children[0]);
    }
    const hitfaces = pgdat.faces as any[];
    for (const hitface of hitfaces) {
      const facedef = new HitPlaneDef(hitface);
      facedef.cubie.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
      this.add(facedef.cubie);
      this.controlTargets.push(facedef.cubie.children[0]);
      console.log(facedef.cubie.children[0]);
    }
  }

  public experimentalGetStickerTargets(): Object3D[] {
    return this.stickerTargets;
  }

  public experimentalGetControlTargets(): Object3D[] {
    return this.controlTargets;
  }

  public onPositionChange(p: PuzzlePosition): void {
    const pos = p.state as Transformation;
    const noRotation = new Euler();
    for (const orbit in this.stickers) {
      const pieces = this.stickers[orbit];
      const pos2 = pos[orbit];
      const orin = pieces.length;
      for (let ori = 0; ori < orin; ori++) {
        const pieces2 = pieces[ori];
        for (let i = 0; i < pieces2.length; i++) {
          pieces2[i].cubie.rotation.copy(noRotation);
          const nori = (ori + orin - pos2.orientation[i]) % orin;
          const ni = pos2.permutation[i];
          pieces2[i].setColor(pieces[nori][ni].origColor);
        }
      }
    }
    for (const moveProgress of p.movesInProgress) {
      const blockMove = moveProgress.move;
      const unswizzled = this.pgdat.unswizzle(blockMove);
      const move = this.pgdat.notationMapper.notationToInternal(blockMove);
      if (move === null) {
        throw Error("Bad blockmove " + blockMove.family);
      }
      const quantumTransformation = experimentalTransformationForQuantumMove(
        this.definition,
        blockMove.quantum,
      );
      const ax = this.axesInfo[unswizzled];
      const turnNormal = ax.axis;
      const angle =
        (-this.ease(moveProgress.fraction) *
          moveProgress.direction *
          blockMove.amount *
          TAU) /
        ax.order;
      for (const orbit in this.stickers) {
        const pieces = this.stickers[orbit];
        const orin = pieces.length;
        const bmv = quantumTransformation[orbit];
        for (let ori = 0; ori < orin; ori++) {
          const pieces2 = pieces[ori];
          for (let i = 0; i < pieces2.length; i++) {
            const ni = bmv.permutation[i];
            if (ni !== i || bmv.orientation[i] !== 0) {
              pieces2[i].cubie.rotateOnAxis(turnNormal, angle);
            }
          }
        }
      }
    }
    this.scheduleRenderCallback!();
  }

  private ease(fraction: number): number {
    return smootherStep(fraction);
  }

  public dispose(): void {
  }
}
