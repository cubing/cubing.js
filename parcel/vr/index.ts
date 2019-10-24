import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085
import * as THREE from "three";

import {Room} from "./room";
import {VRCube} from "./vrcube";

import { BareBlockMove, BlockMove, Sequence } from "../../src/alg";
import { Cube3D } from "../../src/twisty/3d/cube3D";

import { tsThisType } from "@babel/types";
import { Color, Group, Intersection, Material, Mesh, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, WebGLRenderer, WebVRManager, Vector3 } from "three";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry.js";
import { WEBVR } from "../../src/vendor/three/examples/jsm/vr/WebVR";
import { VRGamepad } from "./gamepad";

class VRCubeDemo {
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;

  private room: Room;

  private gamepads: VRGamepad[] = [];

  constructor() {
    console.log("Constructing demo");
    this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.vr.enabled = true;

    this.gamepads.push(new VRGamepad(this.renderer, 0));
    this.gamepads.push(new VRGamepad(this.renderer, 1));

    this.room = new Room(this.gamepads);
    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(WEBVR.createButton(this.renderer));

    window.addEventListener("resize", this.onWindowResize.bind(this), false);

    this.animate();
  }

  public render(): void {
    for (const gamepad of this.gamepads) {
      gamepad.updatePose();
    }
    this.renderer.render(this.room.scene, this.camera);

    // handleController(controller0);
    // handleController(controller1);

    // if (areBothControllersSelecting()) {
    //   if (lastSelectingBoth === false) {
    //     selectingBothInitialDistance = controller0.position.distanceTo(controller1.position);
    //     selectingBothInitialScale = currentScale;
    //   } else {
    //     const newDistance = controller0.position.distanceTo(controller1.position);
    //     currentScale = selectingBothInitialScale * newDistance / selectingBothInitialDistance;
    //     setScale(currentScale);
    //   }
    //   lastSelectingBoth = true;
    // } else {
    //   lastSelectingBoth = false;
    // }

    // for (const controlPlane of controlPlanes) {
    //   if (controlPlane.userData.status[0] === Status.Pressed || controlPlane.userData.status[1] === Status.Pressed) {
    //     controlPlane.material.opacity = 0.4;
    //   } else if (controlPlane.userData.status[0] === Status.Targeted || controlPlane.userData.status[1] === Status.Targeted) {
    //     controlPlane.material.opacity = 0.2;
    //   } else {
    //     controlPlane.material.opacity = 0;
    //   }
    // }
  }

  private animate(): void {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// function handleController(controller: Group): void {
//   const euler = new THREE.Euler().setFromQuaternion(controller.quaternion);
//   const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(controller.quaternion);
//   const raycaster = new Raycaster(controller.position, direction);
//   const closestIntersection: Intersection | null = ((l) => l.length > 0 ? l[0] : null)(raycaster.intersectObjects(controlPlanes));
//   for (const controlPlane of controlPlanes) {
//     controlPlane.userData.status[controller.userData.controllerNumber] = Status.Untargeted;
//   }

//   if (closestIntersection) {
//     (closestIntersection.object as Mesh).userData.status[controller.userData.controllerNumber] = controller.userData.isSelecting ? Status.Pressed : Status.Targeted;
//   }

//   if (controller.userData.isSelecting) {
//     if (closestIntersection && !areBothControllersSelecting()) {
//       const side = closestIntersection.object.userData.side;
//       if (controller.userData.isSelecting !== controller.userData.lastIsSelecting || side !== controller.userData.lastSide) {
//         twisty.experimentalAddMove(BareBlockMove(side, controller.userData.direction));
//         navigator.getGamepads()[controller.userData.controllerNumber].hapticActuators[0].pulse(0.2, 100);
//       }
//       controller.userData.lastSide = side;
//     }
//     // if () {
//     //   console.log(max, x, y, z);
//     //   twisty.experimentalAddMove(BareBlockMove(side, controller.userData.direction));
//     // }
//     // controller.userData.lastSide = side;

//   }
//   controller.userData.lastIsSelecting = controller.userData.isSelecting;

// }

// //

// function areBothControllersSelecting(): boolean {
//   return controller0.userData.isSelecting && controller1.userData.isSelecting;
// }

// (window as any).setScale = setScale;

// let lastSelectingBoth = false;
// let selectingBothInitialDistance = 1;
// let selectingBothInitialScale = 1;
// let currentScale = 1;

(window as any).vrCubeDemo = new VRCubeDemo();

console.log("VR loaded");
