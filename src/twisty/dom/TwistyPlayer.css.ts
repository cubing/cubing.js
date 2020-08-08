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

twisty-viewer-wrapper {
  overflow: hidden;
}

twisty-scrubber {
  width: 100%;
}

* {
  background: rgba(0, 128, 255, 0.1);
}
`);
