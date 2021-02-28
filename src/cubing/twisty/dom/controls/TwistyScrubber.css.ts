import { CSSSource } from "../element/ManagedCustomElement";

export const twistyScrubberCSS = new CSSSource(`
:host {
  width: 384px;
  height: 16px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
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
