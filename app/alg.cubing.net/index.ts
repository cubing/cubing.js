import { parse } from "../../src/alg/index";
import { Puzzles } from "../../src/kpuzzle";
import "../../src/twisty";
import { App } from "./app";

window.addEventListener("load", () => {
  const appElement = document.querySelector("app")!;
  (window as any).app = new App(appElement, {
    puzzle: Puzzles["333"],
    alg: parse(""),
  });
});
