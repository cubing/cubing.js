import { cssStyleSheetShim } from "../node-custom-element-shims";

export const twistyScrubberCSS = new cssStyleSheetShim();
twistyScrubberCSS.replaceSync(
  `
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
  background: rgba(196, 196, 196, 0.75);
}

input:not(:disabled) {
  cursor: ew-resize;
}

.wrapper.dark-mode {
  background: #666666;
}
`,
);
