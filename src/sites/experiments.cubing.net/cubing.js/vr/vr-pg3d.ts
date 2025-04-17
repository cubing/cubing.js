// import { Group, Quaternion, Vector3 } from "three/src/Three.js";
// // Import index files from source.
// // This allows Parcel to be faster while only using values exported in the final distribution.import { BareBlockMove, Sequence } from "../../../../cubing/alg";
// import { Sequence, parse } from "../../../../cubing/alg";
// import { getPuzzleGeometryByName } from "../../../../cubing/puzzle-geometry";
// import { PG3D, Cube3D } from "../../../../cubing/twisty";
// import { ButtonGrouping, OculusButton, VRInput } from "./vr-input";
// import { Twisty3DPuzzle } from "../../../../cubing/twisty";
// import { Twisty3DScene } from "../../../../cubing/twisty/3D/Twisty3DScene";
// import { Timeline } from "../../../../cubing/twisty/animation/Timeline";
// import { AlgCursor } from "../../../../cubing/twisty/animation/alg/AlgCursor";
// import { Puzzles } from "../../../../cubing/kpuzzle";

// export class VRPG3D {
//   public group: Group = new Group();
//   private twisty: Twisty3DPuzzle;
//   private cachedPG3D: PG3D;

//   // TODO: Separate tracker abstraction for this?
//   private resizeInitialDistance: number;
//   private resizeInitialScale: number;

//   private moveInitialPuzzleQuaternion: Quaternion = new Quaternion();
//   private moveInitialControllerQuaternion: Quaternion = new Quaternion();

//   private moveLastControllerPosition: Vector3 = new Vector3();
//   private moveVelocity: Vector3 = new Vector3(); // TODO: Track elapsed time since last update?

//   // Wait for both move buttons to be released before allowing moves.
//   // This "locks" the input into resizing.
//   private waitForMoveButtonClear = false;

//   constructor(private vrInput: VRInput) {
//     // const p = PuzzleGeometry.parsedesc(descinput.value);
//     const pg = getPuzzleGeometryByName("megaminx");
//     const stickerDat = pg.get3d();

//     const scene = new Twisty3DScene();
//     const timeline = new Timeline();
//     const cursor = new AlgCursor(timeline, Puzzles["3x3x3"], parse("R U R'"));
//     const cube3D = new Cube3D(cursor);

//     this.twisty = new Twisty(document.createElement("twisty"), {
//       alg: new Sequence([]),
//       playerConfig: {
//         visualizationFormat: "PG3D",
//         experimentalPG3DViewConfig: {
//           stickerDat,
//         },
//       },
//     });

//     this.cachedPG3D = this.twisty
//       .experimentalGetPlayer()
//       .pg3DView.experimentalGetPG3D();
//     this.group.add(this.cachedPG3D.experimentalGetGroup());

//     // this.twisty.experimentalGetCursor().experimentalSetDurationScale(0.25);

//     // this.cachedCube3D = this.twisty.experimentalGetPlayer().cube3DView.experimentalGetCube3D();
//     // this.cachedCube3D.experimentalUpdateOptions({ showFoundation: true, showHintStickers: false });
//     // this.group.add(this.cachedCube3D.experimentalGetCube());

//     // for (const axis of axesInfo) {
//     //   const controlPlane = new Mesh(new PlaneGeometry(1, 1), axis.stickerMaterial);
//     //   controlPlane.userData.axis = axis;
//     //   controlPlane.position.copy(controlPlane.userData.axis.vector);
//     //   controlPlane.position.multiplyScalar(0.501);
//     //   controlPlane.setRotationFromEuler(controlPlane.userData.axis.fromZ);

//     //   controlPlane.userData.side = axis.side;
//     //   controlPlane.userData.status = [Status.Untargeted, Status.Untargeted];

//     //   this.controlPlanes.push(controlPlane);
//     //   this.group.add(controlPlane);
//     // }

//     // this.group.position.copy(new Vector3(0, initialHeight, 0));
//     // this.setScale(initialScale);

//     // TODO: Better abstraction over controllers.
//     // this.vrInput.addSingleButtonListener({ controllerIdx: 1, buttonIdx: OculusButton.Grip }, this.gripStart.bind(this, 1), this.gripContinued.bind(this, 1));

//     // this.vrInput.addSingleButtonListener({ controllerIdx: 0, buttonIdx: daydream ? 0 : OculusButton.Trigger }, this.onPress.bind(this, 0));
//     // this.vrInput.addSingleButtonListener({ controllerIdx: 1, buttonIdx: daydream ? 0 : OculusButton.Trigger }, this.onPress.bind(this, 1));
//     // TODO: Generalize this to multiple platforms.
//     this.vrInput.addButtonListener(
//       ButtonGrouping.All,
//       [
//         { controllerIdx: 0, buttonIdx: OculusButton.XorA },
//         { controllerIdx: 1, buttonIdx: OculusButton.XorA, invert: true },
//       ],
//       this.onMoveStart.bind(this, 0),
//       this.onMoveContinued.bind(this, 0),
//     );
//     this.vrInput.addButtonListener(
//       ButtonGrouping.All,
//       [
//         { controllerIdx: 0, buttonIdx: OculusButton.XorA, invert: true },
//         { controllerIdx: 1, buttonIdx: OculusButton.XorA },
//       ],
//       this.onMoveStart.bind(this, 1),
//       this.onMoveContinued.bind(this, 1),
//     );
//     this.vrInput.addButtonListener(
//       ButtonGrouping.All,
//       [
//         { controllerIdx: 0, buttonIdx: OculusButton.XorA },
//         { controllerIdx: 1, buttonIdx: OculusButton.XorA },
//       ],
//       this.onResizeStart.bind(this),
//       this.onResizeContinued.bind(this),
//       this.onResizeEnd.bind(this),
//     );
//     this.vrInput.addButtonListener(
//       ButtonGrouping.None,
//       [
//         { controllerIdx: 0, buttonIdx: OculusButton.XorA },
//         { controllerIdx: 1, buttonIdx: OculusButton.XorA },
//       ],
//       this.moveButtonClear.bind(this),
//     );

//     // try {
//     //   this.proxyReceiver = new ProxyReceiver(this.onProxyEvent.bind(this));
//     // } catch (e) {
//     //   console.error("Unable to register proxy receiver", e);
//     // }
//   }

//   public update(): void {
//     this.group.position.add(this.moveVelocity);
//     this.moveVelocity.multiplyScalar(0.99);
//     if (this.moveVelocity.length() < 0.001) {
//       this.moveVelocity.setScalar(0);
//       // TODO: Set a flag to indicate that the puzzle is not moving?
//     }
//   }

//   // private yAngle(point: Vector3): number {
//   //   return point.projectOnPlane(new Vector3(0, 1, 0)).angleTo(new Vector3(0, 0, -1));
//   // }

//   // private gripStart(controllerIdx: number): void {
//   //   this.hapticPulse(controllerIdx, 0.1, 400);
//   //   this.lastAngle = this.yAngle(this.vrInput.controllers[controllerIdx].position);
//   // }

//   // private gripContinued(controllerIdx: number): void {
//   //   const angle = this.yAngle(this.vrInput.controllers[controllerIdx].position);
//   //   const deltaAngleQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle - this.lastAngle);
//   //   this.group.quaternion.multiply(deltaAngleQuat);
//   //   this.lastAngle = angle;
//   // }

//   private setScale(scale: number): void {
//     this.group.scale.setScalar(scale);
//   }

//   private controllerDistance(): number {
//     return this.vrInput.controllers[0].position.distanceTo(
//       this.vrInput.controllers[1].position,
//     );
//   }

//   private hapticPulse(
//     gamepadId: number,
//     value: number,
//     duration: number,
//   ): void {
//     const gamepad = navigator.getGamepads()[gamepadId];
//     if (gamepad && gamepad.hapticActuators) {
//       gamepad.hapticActuators[0].pulse(value, duration);
//     }
//   }

//   private onResizeStart(): void {
//     this.waitForMoveButtonClear = true;
//     this.moveVelocity.setScalar(0);
//     this.hapticPulse(0, 0.2, 75);
//     this.hapticPulse(1, 0.2, 75);
//     this.resizeInitialDistance = this.controllerDistance();
//     this.resizeInitialScale = this.group.scale.x;
//   }

//   private onResizeContinued(): void {
//     const newDistance = this.controllerDistance();
//     this.setScale(
//       (this.resizeInitialScale * newDistance) / this.resizeInitialDistance,
//     );
//   }

//   private onResizeEnd(): void {
//     this.hapticPulse(0, 0.1, 75);
//     this.hapticPulse(1, 0.1, 75);
//   }

//   private moveButtonClear(): void {
//     this.waitForMoveButtonClear = false;
//   }

//   private onMoveStart(controllerIdx: number): void {
//     if (this.waitForMoveButtonClear) {
//       return;
//     }
//     this.hapticPulse(controllerIdx, 0.2, 50);
//     this.moveInitialPuzzleQuaternion.copy(this.group.quaternion);

//     const controller = this.vrInput.controllers[controllerIdx];
//     this.moveLastControllerPosition.copy(controller.position);
//     this.moveInitialControllerQuaternion.copy(controller.quaternion);
//   }

//   private onMoveContinued(controllerIdx: number): void {
//     if (this.waitForMoveButtonClear) {
//       return;
//     }
//     const controller = this.vrInput.controllers[controllerIdx];

//     this.moveVelocity
//       .copy(controller.position)
//       .sub(this.moveLastControllerPosition);
//     this.moveLastControllerPosition.copy(controller.position);

//     this.group.quaternion
//       .copy(this.moveInitialControllerQuaternion)
//       .inverse()
//       .premultiply(controller.quaternion)
//       .multiply(this.moveInitialPuzzleQuaternion);
//   }

//   // private onPress(controllerIdx: number): void {
//   //   const controller = this.vrInput.controllers[controllerIdx];

//   //   const direction = new Vector3().copy(controllerDirection);
//   //   direction.applyQuaternion(controller.quaternion);
//   //   const raycaster = new Raycaster(controller.position, direction);
//   //   const closestIntersection: Intersection | null = ((l) => l.length > 0 ? l[0] : null)(raycaster.intersectObjects(this.controlPlanes));

//   //   if (closestIntersection && showControlPlanes) {
//   //     ((closestIntersection.object as Mesh).material as Material).opacity = 0.2;
//   //   }

//   //   for (const controlPlane of this.controlPlanes) {
//   //     if (!closestIntersection || controlPlane !== closestIntersection.object) {
//   //       ((controlPlane as Mesh).material as Material).opacity = 0;
//   //     }
//   //   }

//   //   if (closestIntersection) {
//   //     (closestIntersection.object as Mesh).userData.status[controller.userData.controllerNumber] = controller.userData.isSelecting ? Status.Pressed : Status.Targeted;
//   //     const side = closestIntersection.object.userData.side;
//   //     this.twisty.experimentalAddMove(BareBlockMove(side, controllerIdx === 0 ? -1 : 1));
//   //     this.hapticPulse(controllerIdx, 0.1, 75);
//   //   }
//   // }

//   // private onProxyEvent(e: ProxyEvent): void {
//   //   switch (e.event) {
//   //     case "reset":
//   //       this.twisty.experimentalSetAlg(new Sequence([]));
//   //       break;
//   //     case "move":
//   //       this.twisty.experimentalAddMove(e.data.latestMove);
//   //       break;
//   //     case "orientation":
//   //       const { x, y, z, w } = e.data.quaternion;
//   //       const quat = new Quaternion(x, y, z, w);
//   //       this.twisty.experimentalGetPlayer().cube3DView.experimentalGetCube3D().experimentalGetCube().quaternion.copy(quat);
//   //       break;
//   //     default:
//   //       // The "as any" appeases the type checker, which (correctly) deduces
//   //       // that the `event` field can't have a valid value.
//   //       console.error("Unknown event:", (e as any).event);
//   //   }
//   // }
// }
