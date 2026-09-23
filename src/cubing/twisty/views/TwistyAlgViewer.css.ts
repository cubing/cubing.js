import { cssStyleSheetShim } from "./node-custom-element-shims";

export const twistyAlgViewerCSS = new cssStyleSheetShim();
twistyAlgViewerCSS.replaceSync(
  `
:host {
  display: inline;
  --comment-shade: oklab(0.69 -0.19 0.14);
  --comment-opacity: 0.6;
  --active-background-shade: rgba(66, 133, 244);
}

.wrapper {
  display: inline;
  --current-color: currentColor
}

a {
  color: currentColor;

  &:not(:hover) {
    text-decoration: none;
  }

  &:hover {
    background: color-mix(in oklab, currentColor 20%, transparent);
  }

  &:active {
    color: currentColor;
    animation: 1s linear flash;
  }
}

@keyframes flash {
  from { opacity: 0.5; }
  to { opacity: 1; }
}

twisty-alg-leaf-elem.twisty-alg-line-comment {
  color: color-mix(in oklab, var(--comment-shade) 75%, currentColor);
  opacity: var(--comment-opacity);
}

.current-move {
  background: color-mix(in oklab, var(--active-background-shade) 30%, transparent);
  margin-left: -0.1em;
  margin-right: -0.1em;
  padding-left: 0.1em;
  padding-right: 0.1em;
  border-radius: 0.1em;
}
`,
);
