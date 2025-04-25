import { Alg } from "../../../../cubing/alg";
import type { KPatternData } from "../../../../cubing/kpuzzle";
import { KPattern } from "../../../../cubing/kpuzzle/KPattern";
import {
  binaryComponentsToReid3x3x3,
  reid3x3x3ToBinaryComponents,
  reid3x3x3ToTwizzleBinary,
  twizzleBinaryToReid3x3x3,
} from "../../../../cubing/protocol/binary/binary3x3x3";
import { cube3x3x3 } from "../../../../cubing/puzzles";
import { experimental3x3x3KPuzzle } from "../../../../cubing/puzzles/cubing-private";
import { ExperimentalSVGAnimator } from "../../../../cubing/twisty";
import {
  kpatternToReidString,
  patternToString as kpatternToString,
  patternToStickers,
  reidStringToKPattern,
  stickersToKPattern,
} from "./convert";

export function bufferToSpacedHex(buffer: ArrayBuffer | Uint8Array): string {
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
  pattern = experimental3x3x3KPuzzle.defaultPattern();
  svg = (async () => {
    return new ExperimentalSVGAnimator(
      experimental3x3x3KPuzzle,
      await cube3x3x3.svg(),
    );
  })();
  algTextarea = document.querySelector("#alg") as HTMLTextAreaElement;
  kpatternTextarea = document.querySelector("#kpattern") as HTMLTextAreaElement;
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
      this.setKPatternData(JSON.parse(this.kpatternTextarea.value));
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
    this.setPattern(experimental3x3x3KPuzzle.defaultPattern());
  }

  applyAlg(s: string): void {
    this.pattern = this.pattern.applyAlg(Alg.fromString(s));
    this.setPattern(this.pattern);
  }

  setKPatternData(kpatternData: KPatternData): void {
    this.setPattern(new KPattern(experimental3x3x3KPuzzle, kpatternData));
  }

  setReidString(s: string): void {
    this.setPattern(reidStringToKPattern(s));
  }

  setStickers(s: string): void {
    this.setPattern(stickersToKPattern(JSON.parse(s)));
  }

  setComponents(s: string): void {
    this.setPattern(binaryComponentsToReid3x3x3(JSON.parse(s)));
  }

  setBinary(s: string): void {
    this.setPattern(twizzleBinaryToReid3x3x3(spacedHexToBuffer(s)));
  }

  setPattern(pattern: KPattern): void {
    this.pattern = pattern;
    (async () => {
      (await this.svg).draw(pattern);
    })();
    this.kpatternTextarea.value = kpatternToString(pattern);
    this.reidStringTextarea.value = kpatternToReidString(pattern);
    this.stickersTextarea.value = JSON.stringify(patternToStickers(pattern));
    this.componentsTextarea.value = JSON.stringify(
      reid3x3x3ToBinaryComponents(pattern),
      null,
      "  ",
    );
    this.binaryTextarea.value = bufferToSpacedHex(
      reid3x3x3ToTwizzleBinary(pattern),
    );
    this.orderElem.textContent = pattern
      .experimentalToTransformation()!
      .repetitionOrder()
      .toString();
    this.isSolvedIgnoringCenterOriElem.textContent = pattern
      .experimentalIsSolved({
        ignoreCenterOrientation: true,
        ignorePuzzleOrientation: true,
      })
      .toString();
    this.isSolvedWithCenterOriElem.textContent = pattern
      .experimentalIsSolved({
        ignoreCenterOrientation: false,
        ignorePuzzleOrientation: true,
      })
      .toString();
  }
}
const app = new App();
(window as any).app = app;
