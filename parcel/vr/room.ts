import { VRInput as VRInput } from "./vr-input";
import { VRCube } from "./vrcube";

import { Color, Group, HemisphereLight, LineBasicMaterial, LineSegments, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry";

export class Room {
  public scene: Scene;
  private box: LineSegments;
  constructor(private vrInput: VRInput) {
    this.scene = new Scene();
    this.scene.background = new Color( 0x505050 );

    const vrCube = new VRCube();
    this.scene.add(vrCube.group);
    this.box = new LineSegments(
          new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
          new LineBasicMaterial( { color: 0x808080 } ),
        );
    this.box.geometry.translate( 0, 3, 0 );
    this.scene.add( this.box );

    const light = new HemisphereLight( 0xffffff, 0x444444 );
    light.position.set( 1, 1, 1 );
    this.scene.add( light );

    for (const controller of vrInput.controllers) {
      this.scene.add(controller);
    }
  }
}
