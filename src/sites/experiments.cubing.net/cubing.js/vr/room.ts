import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry.js";
import { HemisphereLight } from "three/src/lights/HemisphereLight.js";
import { LineBasicMaterial } from "three/src/materials/LineBasicMaterial.js";
import { Color } from "three/src/math/Color.js";
import { LineSegments } from "three/src/objects/LineSegments.js";
import { Scene } from "three/src/scenes/Scene.js";
import type { VRInput } from "./vr-input";
import type { VRPuzzle } from "./vr-puzzle";

export class Room {
  public scene: Scene;
  private box: LineSegments;
  constructor(
    private vrInput: VRInput,
    private vrPuzzle: VRPuzzle,
  ) {
    this.scene = new Scene();
    this.scene.background = new Color(0x505050);

    this.scene.add(this.vrPuzzle.group);
    this.box = new LineSegments(
      new BoxLineGeometry(6, 6, 6, 10, 10, 10),
      new LineBasicMaterial({ color: 0x808080 }),
    );
    this.box.geometry.translate(0, 3, 0);
    this.scene.add(this.box);

    const light = new HemisphereLight(0xffffff, 0x444444);
    light.position.set(1, 1, 1);
    this.scene.add(light);

    for (const controller of this.vrInput.controllers) {
      this.scene.add(controller);
    }
  }

  public update(): void {
    this.vrPuzzle.update();
  }
}
