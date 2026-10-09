import type { MillisecondTimestamp } from "./AnimationTypes.ts";

// Debounces `requestAnimationFrame()`.
export class RenderScheduler {
  private animFrameID: number | null = null;
  private animFrame = this.animFrameWrapper.bind(this);
  private callback: (timestamp: MillisecondTimestamp) => void;
  constructor(callback: (timestamp: MillisecondTimestamp) => void) {
    this.callback = callback;
  }

  requestIsPending(): boolean {
    return !!this.animFrameID;
  }

  requestAnimFrame(): void {
    if (!this.animFrameID) {
      this.animFrameID = requestAnimationFrame(this.animFrame);
    }
  }

  cancelAnimFrame(): void {
    if (this.animFrameID) {
      cancelAnimationFrame(this.animFrameID);
      this.animFrameID = 0;
    }
  }

  private animFrameWrapper(timestamp: DOMHighResTimeStamp): void {
    this.animFrameID = 0;
    this.callback(timestamp as MillisecondTimestamp);
  }
}

// An interface for classes to use to expose their scheduling.
export interface Schedulable {
  scheduleRender(): void;
}
