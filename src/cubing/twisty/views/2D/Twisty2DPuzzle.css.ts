import { cssStyleSheetShim } from "../node-custom-element-shims";

// TODO: Can we do this without so much nesting, and styling all the nested elems?
export const twisty2DSVGCSS = new cssStyleSheetShim();
twisty2DSVGCSS.replaceSync(
  `
:host {
  width: 384px;
  height: 256px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
}

.svg-wrapper,
twisty-2d-svg,
svg {
  width: 100%;
  height: 100%;
  display: grid;
  min-height: 0;
}

svg {
  animation: fade-in 0.25s ease-in;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
`,
);
