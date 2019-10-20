import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial, WebGLRenderer } from "three";

export enum Status {
  Untargeted,
  Targeted,
  Pressed,
}

const cursorGeometry = new BufferGeometry();
cursorGeometry.addAttribute( "position", new Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
cursorGeometry.addAttribute( "color", new Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

export class VRGamepad {
  public group: Group = new Group();
  constructor(renderer: WebGLRenderer, private gamepadIndex: number) {
    console.log(`Created gamepad #${this.gamepadIndex}`);
    // = renderer.vr.getController(gamepadIndex);

    const material = new LineBasicMaterial({
      blending: AdditiveBlending,
      linewidth: 10,
      transparent: true, opacity:
      0.5,
    });

    this.group.add(new Line( cursorGeometry, material));
  }

  public updatePose(): void {
    const gamepad = this.getGamepad();
    if (!gamepad) {
      return;
    }
    const pose = gamepad.pose;
    if (pose === null) {
      return;
    }
    console.log(this.gamepadIndex, pose);
  }

  // TODO: Cache when possible.
  private getGamepad(): Gamepad {
    return navigator.getGamepads()[this.gamepadIndex];
  }
}
