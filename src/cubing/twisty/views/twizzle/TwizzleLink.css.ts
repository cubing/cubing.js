import { CSSSource } from "../ManagedCustomElement";

export const twizzleLinkCSS = new CSSSource(
  `
.wrapper {
  background: rgb(255, 245, 235);
  display: grid;
  border: 1px solid rgba(0, 0, 0, 0.25);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.setup-alg, twisty-alg-viewer {
  padding: 0.5em 1em;
}

.heading {
  background: rgba(255, 230, 210, 1);
  font-weight: bold;
  padding: 0.25em 0.5em;
  display: grid;
  grid-template-columns: 1fr auto;
}

.heading.title {
  background: rgb(255, 245, 235);
  font-size: 150%;
  white-space: pre;
}

.heading a {
  text-decoration: none;
  color: inherit;
}

twisty-player {
  width: 100%;
  height: 320px;
  resize: vertical;
  overflow-y: hidden;
}

twisty-player + .heading {
  padding-top: 0.5em;
}

twisty-alg-viewer {
  display: inline-block;
}

.wrapper:fullscreen {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr 1fr;
}

.wrapper:fullscreen twisty-player,
.wrapper:fullscreen .scrollable-region {
  height: unset;
  max-height: unset
}
`,
);

export const twizzleLinkForumTweaksCSS = new CSSSource(`
.wrapper {
  background: white;
}

.heading {
  background: #4285f422;
}

.scrollable-region {
  min-height: 320px;
  contain: strict;
  overflow-y: auto;
}

.wrapper.dark-mode {
  background: #262626;
  color: #929292;
  border-color: #FFFFFF44;
  color-scheme: dark;
}

.wrapper.dark-mode .heading:not(.title) {
  background: #1d1d1d;
  color: #ececec;
}

.heading.title {
  background: none;
}
`);
