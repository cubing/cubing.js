import { DoubleSide, Euler, MeshBasicMaterial, Vector3 } from "three";
import { Sequence } from "../../src/alg";
import { Twisty } from "../../src/twisty";
import { Cube3D } from "../../src/twisty/3d/cube3D";
import { TAU } from "../../src/twisty/3D/twisty3D";

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
  public stickerMaterial: MeshBasicMaterial;
  constructor(public side: string, public vector: Vector3, public fromZ: Euler, public color: number) {
    // TODO: Make sticker material single-sided when cubie base is rendered?
    color = 0xffffff; // override
    this.stickerMaterial = new MeshBasicMaterial({ color, side: DoubleSide });
    this.stickerMaterial.transparent = true;
    this.stickerMaterial.opacity = 0;
  }
}
const axesInfo: AxisInfo[] = [
  new AxisInfo("U", new Vector3(0, 1, 0), new Euler(-TAU / 4, 0, 0), 0xffffff),
  new AxisInfo("L", new Vector3(-1, 0, 0), new Euler(0, -TAU / 4, 0), 0xff8800),
  new AxisInfo("F", new Vector3(0, 0, 1), new Euler(0, 0, 0), 0x00ff00),
  new AxisInfo("R", new Vector3(1, 0, 0), new Euler(0, TAU / 4, 0), 0xff0000),
  new AxisInfo("B", new Vector3(0, 0, -1), new Euler(0, TAU / 2, 0), 0x0000ff),
  new AxisInfo("D", new Vector3(0, -1, 0), new Euler(TAU / 4, 0, 0), 0xffff00),
];

class VRCube3D {
  private twisty: Twisty;
  constructor() {
    this.twisty = new Twisty(document.createElement("twisty"), { alg: new Sequence([]) });

    cube3D = this.twisty.experimentalGetPlayer().cube3DView.experimentalGetCube3D();
    cube3D.experimentalGetCube().position.copy(cubeCenter);
    cube3D.experimentalUpdateOptions({ showFoundation: false, showHintStickers: false });
    this.setCubeScale(cube3D, initialScale);
  }

  public setCubeScale(cube: Cube3D, scale: number): void {
    this.twisty.experimentalGetPlayer().cube3DView.experimentalGetCube3D().experimentalGetCube().scale.setScalar(scale);
  }
}
