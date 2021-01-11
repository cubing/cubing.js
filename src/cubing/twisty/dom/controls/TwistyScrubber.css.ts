import { CSSSource } from "../element/ManagedCustomElement";

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

input {
  background: none;
}

::-moz-range-track {
  background: rgba(0, 0, 0, 0.25);
  height: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

::-webkit-slider-runnable-track {
  background: rgba(0, 0, 0, 0.05);
}

::-moz-range-progress {
  background: #3273F6;
  height: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

::-ms-fill-lower {
  background: #3273F6;
  height: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
`);
