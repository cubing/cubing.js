import { CSSSource } from "../element/ManagedCustomElement";

export const twistyViewerWrapperCSS = new CSSSource(`
.wrapper {
  display: grid;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.wrapper.back-view-side-by-side {
  grid-template-columns: 1fr 1fr;
}

.wrapper > * {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wrapper.back-view-top-right > :nth-child(2) {
  position: absolute;
  right: 0;
  top: 0;
  width: 25%;
  height: 25%;
}
`);
