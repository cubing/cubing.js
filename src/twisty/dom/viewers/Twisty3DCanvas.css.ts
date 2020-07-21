import { CSSSource } from "../ManagedCustomElement";

export const twisty3DCanvasCSS = new CSSSource(`
:host(twisty-3d-canvas) {
  contain: content;
  display: grid;
  overflow: hidden;
}

.wrapper,
canvas {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

* {
  background: rgba(0, 128, 255, 0.1);
}
`);
