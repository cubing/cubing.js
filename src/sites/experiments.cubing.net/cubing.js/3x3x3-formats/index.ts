import { Alg } from "../../../../cubing/alg";
import type { KStateData } from "../../../../cubing/kpuzzle";
import { KState } from "../../../../cubing/kpuzzle/KState";
import {
  binaryComponentsToReid3x3x3,
  reid3x3x3ToBinaryComponents,
  reid3x3x3ToTwizzleBinary,
  twizzleBinaryToReid3x3x3,
} from "../../../../cubing/protocol/binary/binary3x3x3";
import { cube3x3x3 } from "../../../../cubing/puzzles";
import { experimental3x3x3KPuzzle } from "../../../../cubing/puzzles/cubing-private";
import { ExperimentalKPuzzleSVGWrapper } from "../../../../cubing/twisty";
import {
  kpuzzleToReidString,
  kpuzzleToStickers,
  stateToString as kstateToString,
  reidStringToKState,
  stickersToKPuzzle,
} from "./convert";

export function bufferToSpacedHex(buffer: ArrayBuffer): string {
  // buffer is an ArrayBuffer
  return (
    Array.prototype.map.call(new Uint8Array(buffer), (x: number) =>
      `00${x.toString(16)}`.slice(-2),
    ) as string[]
  ).join(" ");
}

export function spacedHexToBuffer(hex: string): Uint8Array {
  return new Uint8Array(hex.split(" ").map((c) => parseInt(c, 16)));
}

class App {
  state = experimental3x3x3KPuzzle.startState();
  svg = (async () => {
    return new ExperimentalKPuzzleSVGWrapper(
      experimental3x3x3KPuzzle,
      await cube3x3x3.svg(),
    );
  })();
  algTextarea = document.querySelector("#alg") as HTMLTextAreaElement;
  kstateTextarea = document.querySelector("#kstate") as HTMLTextAreaElement;
  reidStringTextarea = document.querySelector(
    "#reid-string",
  ) as HTMLTextAreaElement;

  orderElem = document.querySelector("#order")!;
  isSolvedWithCenterOriElem = document.querySelector(
    "#is-solved-with-center-ori",
  )!;
  isSolvedIgnoringCenterOriElem = document.querySelector(
    "#is-solved-ignoring-center-ori",
  )!;

  stickersTextarea = document.querySelector("#stickers") as HTMLTextAreaElement;

  componentsTextarea = document.querySelector(
    "#components",
  ) as HTMLTextAreaElement;

  binaryTextarea = document.querySelector("#binary") as HTMLTextAreaElement;
  constructor() {
    const svgWrapper = document
      .querySelector("#viewer")!
      .appendChild(document.createElement("div"));
    (async () => {
      svgWrapper.appendChild((await this.svg).wrapperElement);
    })();

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
      this.setKStateData(JSON.parse(this.kstateTextarea.value));
    });
    document.querySelector("#set-binary")!.addEventListener("click", () => {
      this.setBinary(this.binaryTextarea.value);
    });

    // const scene = new Twisty3DScene();
    // const cube3D = new Cube3D();
    // scene.add(cube3D);
    // const canvas = new Twisty3DCanvas(scene);
    // document.body.appendChild(canvas);
    this.reset();
  }

  reset(): void {
    this.setState(experimental3x3x3KPuzzle.startState());
  }

  applyAlg(s: string): void {
    this.state = this.state.applyAlg(Alg.fromString(s));
    this.setState(this.state);
  }

  setKStateData(kstateData: KStateData): void {
    this.setState(new KState(experimental3x3x3KPuzzle, kstateData));
  }

  setReidString(s: string): void {
    this.setState(reidStringToKState(s));
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

  setState(state: KState): void {
    this.state = state;
    (async () => {
      (await this.svg).draw(state);
    })();
    this.kstateTextarea.value = kstateToString(state);
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
    this.orderElem.textContent = state
      .experimentalToTransformation()!
      .repetitionOrder()
      .toString();
    this.isSolvedIgnoringCenterOriElem.textContent = state
      .experimentalIsSolved({
        ignoreCenterOrientation: true,
        ignorePuzzleOrientation: true,
      })
      .toString();
    this.isSolvedWithCenterOriElem.textContent = state
      .experimentalIsSolved({
        ignoreCenterOrientation: false,
        ignorePuzzleOrientation: true,
      })
      .toString();
  }
}
const app = new App();
(window as any).app = app;
