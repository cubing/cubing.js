// This should only be implemented by classes with a private `render()` method
// that draws to the screen.
export interface Twisty3DRenderTarget {
  scheduleRender(): void;
}
