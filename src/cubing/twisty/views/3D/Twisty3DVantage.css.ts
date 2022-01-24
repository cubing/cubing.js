import { CSSSource } from "../ManagedCustomElement";

// The `position` values are a hack for a bug in Safari where the canvas either
// grows infinitely, or takes up the full `fr` of any encompassing grid (making
// the contents of that element e.g. over 100% of its height). `contain:
// content` is a good fix for this, but there is no indication that Safari will
// support it soon. https://developer.mozilla.org/en-US/docs/Web/CSS/contain

export const twisty3DVantageCSS = new CSSSource(`
:host {
  width: 384px;
  height: 256px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
}

/* TODO: This is due to stats hack. Replace with \`canvas\`. */
.wrapper > canvas {
  max-width: 100%;
  max-height: 100%;
  cursor: grab;
}

.wrapper > canvas:active {
  cursor: grabbing;
}

.wrapper.invisible {
  opacity: 0;
}
`);
