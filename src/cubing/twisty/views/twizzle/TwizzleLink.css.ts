import { CSSSource } from "../ManagedCustomElement";

export const twizzleLinkCSS = new CSSSource(
  `
.wrapper {
  background: rgb(255, 245, 235);
  display: grid;
  grid-template-columns: 1fr;
  border: 1px solid rgba(0, 0, 0, 0.25);
}

.setup-alg, twisty-alg-viewer {
  padding: 0.5em 1em;
}

.heading {
  background: rgba(255, 230, 210, 1);
  font-weight: bold;
  padding: 0.25em 0.5em;
}

.heading.title {
  background: rgb(255, 245, 235);
  font-size: 150%;
  white-space: pre;
}

twisty-player {
  width: 100%;
  resize: vertical;
  overflow-y: hidden;
}

twisty-player + .heading {
  padding-top: 0.5em;
}
`,
);
