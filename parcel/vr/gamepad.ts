import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial, WebGLRenderer } from "three";

export enum Status {
  Untargeted,
  Targeted,
  Pressed,
}

const cursorGeometry = new BufferGeometry();
cursorGeometry.addAttribute( "position", new Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
cursorGeometry.addAttribute( "color", new Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

class VRGamepad {
  private group: Group;
  constructor(renderer: WebGLRenderer, private gamepadIndex: number) {
    this.group = renderer.vr.getController(0);

    const material = new LineBasicMaterial({
      blending: AdditiveBlending,
      linewidth: 10,
      transparent: true, opacity:
      0.5,
    });

    this.group.add(new Line( cursorGeometry, material));
  }
}
