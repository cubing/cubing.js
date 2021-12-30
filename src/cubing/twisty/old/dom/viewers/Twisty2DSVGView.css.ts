import { CSSSource } from "../../../views/ManagedCustomElement";

// TODO: Can we do this without so much nesting, and styling all the nested elems?
export const twisty2DSVGCSS = new CSSSource(`
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
`);
