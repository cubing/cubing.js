import { cssStyleSheetShim } from "../node-custom-element-shims";

export const twistyStreamSourceCSS = new cssStyleSheetShim();
twistyStreamSourceCSS.replaceSync(
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
