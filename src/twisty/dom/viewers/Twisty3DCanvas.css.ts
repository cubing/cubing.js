import { CSSSource } from "../element/ManagedCustomElement";

// The `position` values are a hack for a bug in Safari where the canvas either
// grows infinitely, or takes up the full `fr` of any encompassing grid (making
// the contents of that element e.g. over 100% of its height). `contain:
// content` is a good fix for this, but there is no indication that Safari will
// support it soon. https://developer.mozilla.org/en-US/docs/Web/CSS/contain

export const twisty3DCanvasCSS = new CSSSource(`
:host(twisty-3d-canvas) {
  contain: content;
  overflow: hidden;
}

.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  contain: content;
}

canvas {
  position: absolute;
}
`);
