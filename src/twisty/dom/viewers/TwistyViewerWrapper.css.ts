import { CSSSource } from "../ManagedCustomElement";

export const twistyViewerWrapperCSS = new CSSSource(`
.wrapper {
  display: grid;
  width: 100%;
  height: 100%;
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

.wrapper.back-view-upper-right > :nth-child(2) {
  position: absolute;
  right: 0;
  top: 0;
  width: 25%;
  height: 25%;
}

.wrapper.checkered {
  background-color: #EAEAEA;
  background-image: linear-gradient(45deg, #DDD 25%, transparent 25%, transparent 75%, #DDD 75%, #DDD),
    linear-gradient(45deg, #DDD 25%, transparent 25%, transparent 75%, #DDD 75%, #DDD);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
}
`);
