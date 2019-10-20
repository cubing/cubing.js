import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085
import * as THREE from "three";

import {VRCube} from "./vrcube";

import { BareBlockMove, BlockMove, Sequence } from "../../src/alg";
import { Cube3D } from "../../src/twisty/3d/cube3D";

import { Color, Group, Intersection, Material, Mesh, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, WebGLRenderer, WebVRManager } from "three";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry.js";
import { WEBVR } from "../../src/vendor/three/examples/jsm/vr/WebVR";

class VRCubeDemo {
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  private renderer: WebGLRenderer;
  private controller0: THREE.Group;

  private controller1: THREE.Group;
  private room: THREE.LineSegments;

  constructor() {

    this.scene = new Scene();
    this.scene.background = new Color( 0x505050 );

    this.camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000);

    const vrCube = new VRCube();
    this.scene.add(vrCube.group);
    this.room = new THREE.LineSegments(
      new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
      new THREE.LineBasicMaterial( { color: 0x808080 } ),
    );
    this.room.geometry.translate( 0, 3, 0 );
    this.scene.add( this.room );

    const light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    light.position.set( 1, 1, 1 );
    this.scene.add( light );

    //

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.vr.enabled = true;
    document.body.appendChild( this.renderer.domElement );

    //

    document.body.appendChild( WEBVR.createButton( this.renderer ) );

    // controllers

    function onSelectStart(): void {

      this.userData.isSelecting = true;

    }

    function onSelectEnd(): void {

      this.userData.isSelecting = false;

    }

    this.controller0 = this.renderer.vr.getController( 0 );
    this.controller0.addEventListener( "selectstart", onSelectStart );
    this.controller0.addEventListener( "selectend", onSelectEnd );
    this.controller0.userData.controllerNumber = 0;
    this.controller0.userData.direction = 1;
    this.controller0.userData.lastIsSelecting = false;
    this.controller0.userData.lastSide = "";
    this.scene.add( this.controller0 );

    this.controller1 = this.renderer.vr.getController( 1 );
    this.controller1.addEventListener( "selectstart", onSelectStart );
    this.controller1.addEventListener( "selectend", onSelectEnd );
    this.controller1.userData.controllerNumber = 1;
    this.controller1.userData.direction = -1;
    this.controller1.userData.lastIsSelecting = false;
    this.controller1.userData.lastSide = "";
    this.scene.add( this.controller1 );

    // helpers

    const geometry2 = new THREE.BufferGeometry();
    geometry2.addAttribute( "position", new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
    geometry2.addAttribute( "color", new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

    const material = new THREE.LineBasicMaterial( { /*vertexColors: true,*/ blending: THREE.AdditiveBlending, linewidth: 10, transparent: true, opacity: 0.5 } );

    this.controller0.add( new THREE.Line( geometry2, material ) );
    this.controller1.add( new THREE.Line( geometry2, material ) );

    //

    window.addEventListener( "resize", this.onWindowResize.bind(this), false );

    this.animate();
  }

  public render(): void {

    // handleController( controller0 );
    // handleController( controller1 );

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

    this.renderer.render( this.scene, this.camera );
  }

  private animate(): void {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  private onWindowResize(): void {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

  }
}

// function handleController( controller: Group ): void {
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

//   if ( controller.userData.isSelecting ) {
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
