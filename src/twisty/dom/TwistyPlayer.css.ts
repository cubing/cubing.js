import { CSSSource } from "./ManagedCustomElement";

export const twistyPlayerCSS = new CSSSource(`
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
  overflow: hidden;
}

* {
  background: rgba(0, 128, 255, 0.1);
}
`);
