import type { Group } from "three/src/Three.js";

export interface VRPuzzle {
  group: Group;
  update(): void;
}
