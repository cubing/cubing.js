import { CSSSource } from "./element/ManagedCustomElement";

// TODO: figure out why `:host(twisty-player):fullscreen { background-color: white }` doesn't work.
export const twistyPlayerCSS = new CSSSource(`
:host {
  width: 384px;
  height: 256px;
  display: grid;
}

.wrapper {
  display: grid;
  overflow: hidden;
  grid-template-rows: 7fr 1em 1fr;
}

.wrapper > * {
  width: inherit;
  height: inherit;
  overflow: hidden;
}

.wrapper.controls-none {
  grid-template-rows: 7fr;
}

.wrapper.controls-none twisty-scrubber,
.wrapper.controls-none twisty-control-button-panel {
  display: none;
}

twisty-scrubber {
  background: rgba(196, 196, 196, 0.5);
}

.wrapper.checkered {
  background-color: #707070;
  background-image: linear-gradient(45deg, #666 25%, transparent 25%, transparent 75%, #666 75%, #666),
    linear-gradient(45deg, #666 25%, transparent 25%, transparent 75%, #666 75%, #666);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
}
`);
