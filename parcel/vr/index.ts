import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085
import * as THREE from "three";

import {VRCube} from "./vrcube";

import { BareBlockMove, BlockMove, Sequence } from "../../src/alg";
import { Cube3D } from "../../src/twisty/3d/cube3D";

import { Color, Group, Intersection, Material, Mesh, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, WebGLRenderer, WebVRManager } from "three";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry.js";
import { WEBVR } from "../../src/vendor/three/examples/jsm/vr/WebVR";

let camera;
let scene;
let renderer: WebGLRenderer;
let controller0;
let controller1;

let room;

init();
animate();

function init(): void {

  scene = new Scene();
  scene.background = new Color( 0x505050 );

  camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000);

  const vrCube = new VRCube();
  scene.add(vrCube.group);
  room = new THREE.LineSegments(
    new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
    new THREE.LineBasicMaterial( { color: 0x808080 } ),
  );
  room.geometry.translate( 0, 3, 0 );
  scene.add( room );

  const light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  //

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.vr.enabled = true;
  document.body.appendChild( renderer.domElement );

  //

  document.body.appendChild( WEBVR.createButton( renderer ) );

  // controllers

  function onSelectStart(): void {

    this.userData.isSelecting = true;

  }

  function onSelectEnd(): void {

    this.userData.isSelecting = false;

  }

  controller0 = renderer.vr.getController( 0 );
  controller0.addEventListener( "selectstart", onSelectStart );
  controller0.addEventListener( "selectend", onSelectEnd );
  controller0.userData.controllerNumber = 0;
  controller0.userData.direction = 1;
  controller0.userData.lastIsSelecting = false;
  controller0.userData.lastSide = "";
  scene.add( controller0 );

  controller1 = renderer.vr.getController( 1 );
  controller1.addEventListener( "selectstart", onSelectStart );
  controller1.addEventListener( "selectend", onSelectEnd );
  controller1.userData.controllerNumber = 1;
  controller1.userData.direction = -1;
  controller1.userData.lastIsSelecting = false;
  controller1.userData.lastSide = "";
  scene.add( controller1 );

  // helpers

  const geometry2 = new THREE.BufferGeometry();
  geometry2.addAttribute( "position", new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
  geometry2.addAttribute( "color", new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

  const material = new THREE.LineBasicMaterial( { /*vertexColors: true,*/ blending: THREE.AdditiveBlending, linewidth: 10, transparent: true, opacity: 0.5 } );

  controller0.add( new THREE.Line( geometry2, material ) );
  controller1.add( new THREE.Line( geometry2, material ) );

  //

  window.addEventListener( "resize", onWindowResize, false );

}

function onWindowResize(): void {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

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

function animate(): void {
  renderer.setAnimationLoop( render );
}

// function areBothControllersSelecting(): boolean {
//   return controller0.userData.isSelecting && controller1.userData.isSelecting;
// }

// (window as any).setScale = setScale;

// let lastSelectingBoth = false;
// let selectingBothInitialDistance = 1;
// let selectingBothInitialScale = 1;
// let currentScale = 1;

function render(): void {

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

  renderer.render( scene, camera );

}
