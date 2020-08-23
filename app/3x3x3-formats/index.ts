import { parse } from "../../src/alg";
import { KPuzzle, Puzzles, SVG, Transformation } from "../../src/kpuzzle";
import {
  binaryComponentsToReid3x3x3,
  reid3x3x3ToBinaryComponents,
  reid3x3x3ToTwizzleBinary,
  twizzleBinaryToReid3x3x3,
} from "../../src/protocol/binary/binary3x3x3";
import {
  kpuzzleToReidString,
  kpuzzleToStickers,
  kpuzzleToString,
  reidStringToKPuzzle,
  stickersToKPuzzle,
} from "./convert";

export function bufferToSpacedHex(buffer: ArrayBuffer): string {
  // buffer is an ArrayBuffer
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x: number) =>
      ("00" + x.toString(16)).slice(-2),
    )
    .join(" ");
}

export function spacedHexToBuffer(hex: string): Uint8Array {
  return new Uint8Array(hex.split(" ").map((c) => parseInt(c, 16)));
}

const def = Puzzles["3x3x3"];

class App {
  kpuzzle = new KPuzzle(def);
  svg = new SVG(def);
  algTextarea = document.querySelector("#alg")! as HTMLTextAreaElement;
  kpuzzleTextarea = document.querySelector("#kpuzzle")! as HTMLTextAreaElement;
  reidStringTextarea = document.querySelector(
    "#reid-string",
  )! as HTMLTextAreaElement;

  stickersTextarea = document.querySelector(
    "#stickers",
  )! as HTMLTextAreaElement;

  componentsTextarea = document.querySelector(
    "#components",
  )! as HTMLTextAreaElement;

  binaryTextarea = document.querySelector("#binary")! as HTMLTextAreaElement;
  constructor() {
    document.querySelector("#viewer")!.appendChild(this.svg.element);

    document.querySelector("#reset")!.addEventListener("click", () => {
      this.reset();
    });
    document.querySelector("#apply-alg")!.addEventListener("click", () => {
      this.applyAlg(this.algTextarea.value);
    });
    document
      .querySelector("#set-reid-string")
      ?.addEventListener("click", () => {
        this.setReidString(this.reidStringTextarea.value);
      });
    document.querySelector("#set-stickers")!.addEventListener("click", () => {
      this.setStickers(this.stickersTextarea.value);
    });
    document.querySelector("#set-components")!.addEventListener("click", () => {
      this.setComponents(this.componentsTextarea.value);
    });
    document.querySelector("#set-kpuzzle")!.addEventListener("click", () => {
      this.setKPuzzle(this.kpuzzleTextarea.value);
    });
    document.querySelector("#set-binary")!.addEventListener("click", () => {
      this.setBinary(this.binaryTextarea.value);
    });

    this.setState(this.kpuzzle.state);

    // const scene = new Twisty3DScene();
    // const cube3D = new Cube3D();
    // scene.add(cube3D);
    // const canvas = new Twisty3DCanvas(scene);
    // document.body.appendChild(canvas);
  }

  reset(): void {
    this.kpuzzle.reset();
    this.setState(this.kpuzzle.state);
  }

  applyAlg(s: string): void {
    this.kpuzzle.applyAlg(parse(s));
    this.setState(this.kpuzzle.state);
  }

  setKPuzzle(s: string): void {
    this.setState(JSON.parse(s));
  }

  setReidString(s: string): void {
    this.setState(reidStringToKPuzzle(s));
  }

  setStickers(s: string): void {
    this.setState(stickersToKPuzzle(JSON.parse(s)));
  }

  setComponents(s: string): void {
    this.setState(binaryComponentsToReid3x3x3(JSON.parse(s)));
  }

  setBinary(s: string): void {
    this.setState(twizzleBinaryToReid3x3x3(spacedHexToBuffer(s)));
  }

  setState(state: Transformation): void {
    this.kpuzzle.state = state;
    this.svg.draw(def, state);
    this.kpuzzleTextarea.value = kpuzzleToString(state);
    this.reidStringTextarea.value = kpuzzleToReidString(state);
    this.stickersTextarea.value = JSON.stringify(kpuzzleToStickers(state));
    this.componentsTextarea.value = JSON.stringify(
      reid3x3x3ToBinaryComponents(state),
      null,
      "  ",
    );
    this.binaryTextarea.value = bufferToSpacedHex(
      reid3x3x3ToTwizzleBinary(state),
    );
  }
}

const app = new App();
(window as any).app = app;
