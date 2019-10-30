import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial, WebGLRenderer } from "three";

export enum Status {
  Untargeted,
  Targeted,
  Pressed,
}

const NUM_CONTROLLERS = 2;

const geometry = new BufferGeometry();
geometry.addAttribute("position", new Float32BufferAttribute([
  0, 0, 0,
  0, 0, -1,
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

  public update(): void {
    // TODO: anything?
  }
}

// const cursorGeometry = new BufferGeometry();
// cursorGeometry.addAttribute( "position", new Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
// cursorGeometry.addAttribute( "color", new Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

// export class VRGamepad {
//   public group: Group = new Group();
//   private sphere: Sphere = new Sphere(new Vector3(0, 0, 0), 0.1);
//   constructor(renderer: WebGLRenderer, private gamepadIndex: number) {
//     console.log(`Created gamepad #${this.gamepadIndex}`);
//     // = renderer.vr.getController(gamepadIndex);

//     const material = new LineBasicMaterial({
//       blending: AdditiveBlending,
//       linewidth: 10,
//       transparent: true, opacity:
//       0.5,
//     });

//     this.group.add(new Line(cursorGeometry, material));
//   }

//   public updatePose(): void {
//     const gamepad = this.getGamepad();
//     if (!gamepad) {
//       return;
//     }
//     const pose = gamepad.pose;
//     if (pose === null) {
//       return;
//     }

//     this.group.position.fromArray(pose.position);
//     this.group.quaternion.fromArray( pose.orientation);
//     this.group.matrixWorldNeedsUpdate = true;
//     this.group.visible = true;

//     const position = new Vector3().fromArray(pose.position);
//     if (this.gamepadIndex === 1) {
//       console.log(position);
//     }
//     position.y += 1;
//     this.sphere.set(position, 0.1);

//     // console.log(this.gamepadIndex, pose);
//   }

//   // TODO: Cache when possible.
//   private getGamepad(): Gamepad {
//     return navigator.getGamepads()[this.gamepadIndex];
//   }
// }
