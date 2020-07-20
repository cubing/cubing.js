import { CSSSource } from "../ManagedCustomElement";

export const twistyScrubberCSS = new CSSSource(`
:host(twisty-scrubber) {
  width: 384px;
  height: 16px;
  contain: content;
  display: grid;
}

.wrapper {
  background: rgba(255, 0, 0, 0.2);
}

input {
  margin: 0; width: 100%;
}
`);
