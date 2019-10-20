import { BareBlockMove, BlockMove, Sequence } from "../../src/alg";
import { connect, MoveEvent } from "../../src/bluetooth";
import { Puzzles } from "../../src/kpuzzle";
import { Twisty } from "../../src/twisty";
import { Cube3D } from "../../src/twisty/3d/cube3D";

import { Vector3 } from "three";

let initialHeight = parseFloat(new URL(location.href).searchParams.get("height") || "1");
if (isNaN(initialHeight)) {
  initialHeight = 1;
}

let initialScale = parseFloat(new URL(location.href).searchParams.get("scale") || "1");
if (isNaN(initialScale)) {
  initialScale = 1;
}

const cubeCenter = new Vector3(0, initialHeight, 0);
const controlPlanes = [];
let cube3D: Cube3D;

// From `cube3D.ts`
class AxisInfo {
  public stickerMaterial: THREE.MeshBasicMaterial;
  constructor(public side: string, public vector: THREE.Vector3, public fromZ: THREE.Euler, public color: number) {
    // TODO: Make sticker material single-sided when cubie base is rendered?
    color = 0xffffff; // override
    this.stickerMaterial = new THREE.MeshBasicMaterial({color, side: THREE.DoubleSide});
    this.stickerMaterial.transparent = true;
    this.stickerMaterial.opacity = 0;
  }
}
const axesInfo: AxisInfo[] = [
  new AxisInfo("U", new THREE.Vector3( 0,  1,  0), new THREE.Euler(-TAU / 4,  0,  0), 0xffffff),
  new AxisInfo("L", new THREE.Vector3(-1,  0,  0), new THREE.Euler( 0, -TAU / 4,  0), 0xff8800),
  new AxisInfo("F", new THREE.Vector3( 0,  0,  1), new THREE.Euler( 0,  0,      0), 0x00ff00),
  new AxisInfo("R", new THREE.Vector3( 1,  0,  0), new THREE.Euler( 0,  TAU / 4,  0), 0xff0000),
  new AxisInfo("B", new THREE.Vector3( 0,  0, -1), new THREE.Euler( 0,  TAU / 2,  0), 0x0000ff),
  new AxisInfo("D", new THREE.Vector3( 0, -1,  0), new THREE.Euler( TAU / 4,  0,  0), 0xffff00),
];

class VRCube3D {
  private twisty: Twisty;
  constructor() {
    this.twisty = new Twisty(document.createElement("twisty"), {alg: new Sequence([])});

    cube3D = this.twisty.experimentalGetPlayer().cube3DView.experimentalGetCube3D();
    cube3D.experimentalGetCube().position.copy(cubeCenter);
    cube3D.experimentalUpdateOptions({showFoundation: false, showHintStickers: false});
    this.setCubeScale(cube3D, initialScale);
  }

 public setCubeScale(cube: Cube3D, scale: number): void {
    this.twisty.experimentalGetCube3D().experimentalGetCube().scale.setScalar(scale);
  }
}
