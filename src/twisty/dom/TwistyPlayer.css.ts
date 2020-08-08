import { CSSSource } from "./ManagedCustomElement";

// TODO: figure out why `:host(twisty-player):fullscreen { background-color: white }` doesn't work.
export const twistyPlayerCSS = new CSSSource(`
:host(twisty-player) {
  width: 384px;
  height: 256px;
  contain: content;
  display: grid;
}

.wrapper {
  display: grid;
  grid-template-rows: 7fr 1em 1fr;
  height: 100%;
  overflow: hidden;
}

twisty-scrubber {
  width: 100%;
}

* {
  background: rgba(0, 128, 255, 0.1);
}

.wrapper.back-view-side-by-side {
  grid-template-columns: 1fr 1fr;
}

.wrapper.back-view-side-by-side twisty-scrubber,
.wrapper.back-view-side-by-side twisty-control-button-panel {
  grid-column: 1 / 3;
}

.wrapper.back-view-upper-right twisty-3d-canvas:nth-child(2) {
  position: absolute;
  right: 0;
  top: 0;
  width: 25%;
  height: 25%;
}
`);
