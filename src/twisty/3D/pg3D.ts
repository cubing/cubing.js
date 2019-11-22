import {Color, Euler, Face3, FaceColors, Geometry, Group, Mesh, MeshBasicMaterial, Vector3} from "three" ;
import {BlockMove} from "../../alg" ;
import {KPuzzleDefinition, stateForBlockMove, Transformation} from "../../kpuzzle" ;
import {Cursor} from "../cursor" ;
import {smootherStep} from "../easing" ;
import {Puzzle} from "../puzzle" ;
import {TAU, Twisty3D} from "./twisty3D" ;

class StickerDef {
  public origColor: Color ;
  public faceColor: Color ;
  public cubie: Group ;
  protected geo: Geometry ;
  constructor(stickerDat: any) {
    this.origColor = new Color(stickerDat.color) ;
    this.faceColor = new Color(stickerDat.color) ;
    this.cubie = new Group() ;
    this.geo = new Geometry() ;
    const coords = stickerDat.coords as number[][] ;
    const vertind: number[] = [] ;
    for (const coord of coords) {
       const v = new Vector3(coord[0]!, coord[1]!, coord[2]!) ;
       vertind.push(this.geo.vertices.length) ;
       this.geo.vertices.push(v) ;
    }
    for (let g = 1; g + 1 < vertind.length; g++) {
       const face = new Face3(vertind[0], vertind[g], vertind[g + 1]) ;
       face.color = this.faceColor ;
       this.geo.faces.push(face) ;
    }
    this.geo.computeFaceNormals() ;
    const obj = new Mesh(this.geo,
               new MeshBasicMaterial({vertexColors: FaceColors})) ;
    this.cubie.add(obj) ;
  }
  public setColor(c: Color): void {
    this.geo.colorsNeedUpdate = true ;
    this.faceColor.copy(c) ;
  }
}

class AxisInfo {
  public axis: Vector3 ;
  public order: number ;
  constructor(axisDat: any) {
    const vec = axisDat[0] as number[] ;
    this.axis = new Vector3(vec[0], vec[1], vec[2]) ;
    this.order = axisDat[2] ;
  }
}

const PG_SCALE = 0.5 ;

// TODO: Split into "scene model" and "view".
export class PG3D extends Twisty3D<Puzzle> {
  private stickers: {[key: string]: StickerDef[][]} ;
  private axesInfo: {[key: string]: AxisInfo} ;

  constructor(private definition: KPuzzleDefinition, pgdat: any) {
    super();
    this.axesInfo = {} ;
    const axesDef = pgdat.axis as any[] ;
    for (const axis of axesDef) {
       this.axesInfo[axis[1]] = new AxisInfo(axis) ;
    }
    const stickers = pgdat.stickers as any[] ;
    this.stickers = {} ;
    for (const sticker of stickers) {
      const orbit = sticker.orbit as number ;
      const ord = sticker.ord as number ;
      const ori = sticker.ori as number ;
      if (!this.stickers[orbit]) {
         this.stickers[orbit] = [] ;
      }
      if (!this.stickers[orbit][ori]) {
         this.stickers[orbit][ori] = [] ;
      }
      const stickerdef = new StickerDef(sticker) ;
      stickerdef.cubie.scale.set(PG_SCALE, PG_SCALE, PG_SCALE) ;
      this.stickers[orbit][ori][ord] = stickerdef ;
      this.scene.add(stickerdef.cubie) ;
    }
  }

  protected updateScene(p: Cursor.Position<Puzzle>): void {
    const pos = p.state as Transformation ;
    const noRotation = new Euler() ;
    for (const orbit in this.stickers) {
      const pieces = this.stickers[orbit];
      const pos2 = pos[orbit] ;
      const orin = pieces.length ;
      for (let ori = 0; ori < orin; ori++) {
        const pieces2 = pieces[ori] ;
        for (let i = 0; i < pieces2.length; i++) {
           pieces2[i].cubie.rotation.copy(noRotation) ;
           const nori = (ori + orin - pos2.orientation[i]) % orin ;
           const ni = pos2.permutation[i] ;
           pieces2[i].setColor(pieces[nori][ni].origColor) ;
        }
      }
      for (const moveProgress of p.moves) {
        const blockMove = moveProgress.move as BlockMove;
        const fullMove = stateForBlockMove(this.definition, blockMove) ;
        const ax = this.axesInfo[blockMove.family.toUpperCase()] ;
        const turnNormal = ax.axis ;
        const angle = - this.ease(moveProgress.fraction) *
                  moveProgress.direction * blockMove.amount * TAU / ax.order ;
        const mv = fullMove[orbit] ;
        for (let ori = 0; ori < orin; ori++) {
          const pieces2 = pieces[ori] ;
          for (let i = 0; i < pieces2.length; i++) {
             const ni = mv.permutation[i] ;
             if (ni !== i || mv.orientation[i] !== 0) {
               pieces2[i].cubie.rotateOnAxis(turnNormal, angle) ;
             }
          }
        }
      }
    }
  }
  private ease(fraction: number): number {
    return smootherStep(fraction) ;
  }

}
