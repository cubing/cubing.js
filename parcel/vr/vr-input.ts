import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial, Vector3, WebGLRenderer } from "three";

export enum Status {
  Untargeted,
  Targeted,
  Pressed,
}

const NUM_CONTROLLERS = 2;

export const controllerDirection: Vector3 = new Vector3(0, 0, -1);

const geometry = new BufferGeometry();
geometry.addAttribute("position", new Float32BufferAttribute([
  0, 0, 0,
  controllerDirection.x, controllerDirection.y, controllerDirection.z,
], 3));
geometry.addAttribute("color", new Float32BufferAttribute([
  0.5, 0.5, 0.5,
  0, 0, 0,
], 3));

const material = new LineBasicMaterial({
  blending: AdditiveBlending,
  linewidth: 10,
  transparent: true,
  opacity: 0.5,
});

export class VRInput {
  public controllers: Group[] = [];
  constructor(renderer: WebGLRenderer) {
    for (let i = 0; i < NUM_CONTROLLERS; i++) {
      const controller = renderer.vr.getController(i);
      controller.add(new Line(geometry, material));
      this.controllers.push(controller);
    }
  }
}
