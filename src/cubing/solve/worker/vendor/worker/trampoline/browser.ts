import type { URLReference } from "../strategy/types";

// We cannot directly instantiate a worker with a cross-origin URL, even if the
// script that is trying to initiate it shares the worker origin. However, we
// *can* construct a stub worker that imports the worker implementation from the
// other origin, so we do that.
//
// Only works in browers, because:
//
// - `node` doesn't have `Blob`.
// - `node` doesn't like absolute import paths. It needs a direct `new URL()`
//   object instead of a URL string to import file paths.
export function trampolineBrowser(url: URLReference): string {
  const importSrc = `import "${url}";`;
  const blob = new Blob([importSrc], {
    type: "text/javascript",
  });
  return URL.createObjectURL(blob);
}
