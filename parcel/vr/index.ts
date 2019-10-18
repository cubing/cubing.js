import * as THREE from "three";

// import { Puzzles } from "../../src/kpuzzle";
// import {Cube3D} from "../../src/twisty/3d/cube3D";

import { Group, WebGLRenderer } from "three";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry.js";
import { WEBVR } from "../../src/vendor/three/examples/jsm/vr/WebVR";

let camera;
let scene;
let renderer: WebGLRenderer;
let controller1;
let controller2;

let room;

let count = 0;
const radius = 0.08;
let normal = new THREE.Vector3();
const relativeVelocity = new THREE.Vector3();

const clock = new THREE.Clock();

init();
animate();

function init(): void {

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x505050 );

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10 );

  // const cube3D = new Cube3D(Puzzles["333"]);
  // cube3D.cube.translateY(0.8);
  // cube3D.cube.translateZ(-0.5);
  // cube3D.cube.scale.setScalar(0.03);
  // scene.add(cube3D.cube);

  room = new THREE.LineSegments(
    new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
    new THREE.LineBasicMaterial( { color: 0x808080 } ),
  );
  room.geometry.translate( 0, 3, 0 );
  scene.add( room );

  const light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  const geometry = new THREE.IcosahedronBufferGeometry( radius, 2 );

  for ( let i = 0; i < 200; i ++ ) {

    const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

    object.position.x = Math.random() * 4 - 2;
    object.position.y = Math.random() * 4;
    object.position.z = Math.random() * 4 - 2;

    object.userData.velocity = new THREE.Vector3();
    object.userData.velocity.x = Math.random() * 0.01 - 0.005;
    object.userData.velocity.y = Math.random() * 0.01 - 0.005;
    object.userData.velocity.z = Math.random() * 0.01 - 0.005;

    room.add( object );

  }

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

  controller1 = renderer.vr.getController( 0 );
  controller1.addEventListener( "selectstart", onSelectStart );
  controller1.addEventListener( "selectend", onSelectEnd );
  scene.add( controller1 );

  controller2 = renderer.vr.getController( 1 );
  controller2.addEventListener( "selectstart", onSelectStart );
  controller2.addEventListener( "selectend", onSelectEnd );
  scene.add( controller2 );

  // helpers

  const geometry2 = new THREE.BufferGeometry();
  geometry2.addAttribute( "position", new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
  geometry2.addAttribute( "color", new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

  const material = new THREE.LineBasicMaterial( { /*vertexColors: true,*/ blending: THREE.AdditiveBlending } );

  controller1.add( new THREE.Line( geometry2, material ) );
  controller2.add( new THREE.Line( geometry2, material ) );

  //

  window.addEventListener( "resize", onWindowResize, false );

}

function onWindowResize(): void {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function handleController( controller: Group ): void {

  if ( controller.userData.isSelecting ) {

    const object = room.children[ count ++ ];

    object.position.copy( controller.position );
    object.userData.velocity.x = ( Math.random() - 0.5 ) * 3;
    object.userData.velocity.y = ( Math.random() - 0.5 ) * 3;
    object.userData.velocity.z = ( Math.random() - 9 );
    object.userData.velocity.applyQuaternion( controller.quaternion );

    if ( count === room.children.length ) { count = 0; }

  }

}

//

function animate(): void {

  renderer.setAnimationLoop( render );

}

function render(): void {

  handleController( controller1 );
  handleController( controller2 );

  //

  const delta = clock.getDelta() * 0.8; // slow down simulation

  const range = 3 - radius;

  for ( let i = 0; i < room.children.length; i ++ ) {

    const object = room.children[ i ];

    object.position.x += object.userData.velocity.x * delta;
    object.position.y += object.userData.velocity.y * delta;
    object.position.z += object.userData.velocity.z * delta;

    // keep objects inside room

    if ( object.position.x < - range || object.position.x > range ) {

      object.position.x = THREE.Math.clamp( object.position.x, - range, range );
      object.userData.velocity.x = - object.userData.velocity.x;

    }

    if ( object.position.y < radius || object.position.y > 6 ) {

      object.position.y = Math.max( object.position.y, radius );

      object.userData.velocity.x *= 0.98;
      object.userData.velocity.y = - object.userData.velocity.y * 0.8;
      object.userData.velocity.z *= 0.98;

    }

    if ( object.position.z < - range || object.position.z > range ) {

      object.position.z = THREE.Math.clamp( object.position.z, - range, range );
      object.userData.velocity.z = - object.userData.velocity.z;

    }

    for ( let j = i + 1; j < room.children.length; j ++ ) {

      const object2 = room.children[ j ];

      normal.copy( object.position ).sub( object2.position );

      const distance = normal.length();

      if ( distance < 2 * radius ) {

        normal.multiplyScalar( 0.5 * distance - radius );

        object.position.sub( normal );
        object2.position.add( normal );

        normal.normalize();

        relativeVelocity.copy( object.userData.velocity ).sub( object2.userData.velocity );

        normal = normal.multiplyScalar( relativeVelocity.dot( normal ) );

        object.userData.velocity.sub( normal );
        object2.userData.velocity.add( normal );

      }

    }

    object.userData.velocity.y -= 9.8 * delta;

  }

  renderer.render( scene, camera );

}
