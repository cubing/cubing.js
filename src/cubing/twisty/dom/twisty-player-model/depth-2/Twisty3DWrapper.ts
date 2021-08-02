import type { Cube3D } from "../../../3D/puzzles/Cube3D";
import type { PG3D } from "../../../3D/puzzles/PG3D";
import type { Twisty3DScene } from "../../../3D/Twisty3DScene";
import {
  CSSSource,
  ManagedCustomElement,
} from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { Twisty3DCanvas } from "../../viewers/Twisty3DCanvas";
import type { PuzzleProp } from "../depth-1/PuzzleProp";
import { ManagedSource } from "../ManagedSource";

export class Twisty3DWrapper extends ManagedCustomElement {
  #puzzleProp: ManagedSource<PuzzleProp>;
  constructor(puzzleProp: PuzzleProp) {
    super();
    this.addCSS(
      new CSSSource(`
:host {
  display: grid;
  width: 256px !important; height: 256px !important;
}

twisty-3d-canvas {
  width: 100%;
  height: 100%;
}
`),
    );
    this.#puzzleProp = new ManagedSource<PuzzleProp>(
      puzzleProp,
      this.onPuzzle.bind(this),
    );
  }

  onPuzzle(): void {
    console.log("Twisty3DWrapper.onPuzzle");
    this.#cachedTwisty3D = null;
    this.updateTwisty3D();
  }

  connectedCallback() {
    console.log("connected!");
    (async () => {
      this.updateTwisty3D(); // Note: we specifically don't await.
      this.contentWrapper.appendChild(await this.mainCanvas());

      // TODO: Draw when ready?
      setTimeout(async () => (await this.mainCanvas()).scheduleRender(), 100); // TODO
      setTimeout(async () => (await this.mainCanvas()).scheduleRender(), 1000); // TODO
    })();
  }

  // TODO can we remove the cached proxy?
  // In theory we can, but we've run into situations where imports are not properly cached.
  #cachedConstructorProxy: Promise<typeof import("./3d-proxy")> | null = null;
  async constructorProxy(): Promise<typeof import("./3d-proxy")> {
    return (this.#cachedConstructorProxy ??= import("./3d-proxy"));
  }

  #cachedScene: Promise<Twisty3DScene> | null = null;
  async scene(): Promise<Twisty3DScene> {
    return (this.#cachedScene ??= (async () =>
      new (await this.constructorProxy()).Twisty3DScene())());
  }

  #cachedMainCanvas: Promise<Twisty3DCanvas> | null = null;
  async mainCanvas(): Promise<Twisty3DCanvas> {
    return (this.#cachedMainCanvas ??= (async () =>
      new (await this.constructorProxy()).Twisty3DCanvas(
        await this.scene(),
      ))());
  }

  // TODO: Why can't we use `Twisty3DPuzzle` instead of `Cube3D | PG3D`?
  #cachedTwisty3D: Promise<Cube3D | PG3D> | null = null;
  async twisty3D(): Promise<Cube3D | PG3D> {
    return (this.#cachedTwisty3D ??= (async () => {
      const proxy = await this.constructorProxy();
      switch (this.#puzzleProp.target.puzzleID) {
        case "3x3x3":
          return await proxy.cube3DShim();
        default: {
          return await proxy.pg3dShim(this.#puzzleProp.target.puzzleID);
        }
      }
    })());
  }

  async updateTwisty3D(): Promise<void> {
    // TODO: Check if puzzle changed.
    const twisty3D = await this.twisty3D();
    this.#clearTwisty3DPuzzles();
    this.#addTwisty3D(twisty3D);
  }

  #twisty3DPuzzlesInScene: Set<Cube3D | PG3D> = new Set();
  async #addTwisty3D(twisty3D: Cube3D | PG3D): Promise<void> {
    if (!this.#twisty3DPuzzlesInScene.has(twisty3D)) {
      (await this.scene()).add(twisty3D); // TODO: Prevent double add?
      this.#twisty3DPuzzlesInScene.add(twisty3D);
    }
    this.scheduleRender();
  }

  async #clearTwisty3DPuzzles(): Promise<void> {
    for (const twisty3D of this.#twisty3DPuzzlesInScene) {
      (await this.scene()).remove(twisty3D);
    }
    this.#twisty3DPuzzlesInScene.clear();
    this.scheduleRender();
  }

  scheduleRender(): void {
    (async () => {
      (await this.scene()).scheduleRender();
    })();
  }
}
customElementsShim.define("twisty-3d-wrapper", Twisty3DWrapper);
