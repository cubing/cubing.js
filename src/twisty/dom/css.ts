import { CSSSource } from "./CSSManager";

export const testCSS = new CSSSource(`
:host(twisty-player-test) {
  width: 384px;
  height: 256px;
  contain: content;
  display: grid;
}

.wrapper {
  display: grid;
  grid-template-rows: 1fr 1em 2em;
  height: 100%;
}

.svg-wrapper,
svg {
  width: 100%;
  height: 100%;
  display: grid;
}

* {
  background: rgba(255, 0, 0, 0.1);
}

twisty-control-button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

`);
