import { CSSSource } from "../ManagedCustomElement";

export const twistyScrubberCSS = new CSSSource(`
:host(twisty-scrubber) {
  width: 384px;
  height: 16px;
  contain: content;
  display: grid;
}

input {
  margin: 0; width: 100%;
}
`);
