import { CSSSource } from "../ManagedCustomElement";

export const twistyStreamSourceCSS = new CSSSource(
  `
:host {
  width: 384px;
  height: 256px;
  display: grid;

  font-family: "Ubuntu", sans-serif;
}

.wrapper {
  display: grid;
  place-content: center;
  gap: 0.5em;
}
`,
);
