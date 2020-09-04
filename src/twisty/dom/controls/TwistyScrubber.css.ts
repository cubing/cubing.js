import { CSSSource } from "../element/ManagedCustomElement";

export const twistyScrubberCSS = new CSSSource(`
:host(twisty-scrubber) {
  width: 384px;
  height: 16px;
  contain: content;
  display: grid;

  background: rgba(196, 196, 196, 0.5);
}

input {
  margin: 0; width: 100%;
}
`);
