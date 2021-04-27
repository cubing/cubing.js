// JSZip requires synthetic default imports to be used "properly", but we don't
// need synthetic default imports anywhere else in `cubing.js`. Rather than
// turning on `allowSyntheticDefaultImports` for the entire project, we wrap the
// default export here. Unfortunately, that means we give up typing information.
// But this is just used once in a demo right now.

import * as JSZipGlob from "jszip";
export const JSZip = (JSZipGlob as any).default; // Avoid synthetic imports
