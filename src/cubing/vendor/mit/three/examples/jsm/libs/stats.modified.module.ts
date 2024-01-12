/**
 * @author mrdoob / http://mrdoob.com/
 * ESM conversion by Lucas Garron, 2021-12-21
 */

const performance:
  | null
  | (Performance & {
      memory?: {
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }) = globalThis.performance;

export class Stats {
  mode = 0;

  dom = document.createElement("div");

  constructor() {
    this.dom.style.cssText =
      "position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";
    this.dom.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        this.showPanel(++this.mode % this.dom.children.length);
      },
      false,
    );

    this.showPanel(0);
  }

  addPanel(panel: StatsPanel): StatsPanel {
    this.dom.appendChild(panel.dom);
    return panel;
  }

  showPanel(id: number): void {
    for (let i = 0; i < this.dom.children.length; i++) {
      (this.dom.children[i] as HTMLElement).style.display =
        i === id ? "block" : "none";
    }

    this.mode = id;
  }

  beginTime = (performance || Date).now();
  prevTime = this.beginTime;
  frames = 0;

  fpsPanel = this.addPanel(new StatsPanel("FPS", "#0ff", "#002"));
  msPanel = this.addPanel(new StatsPanel("MS", "#0f0", "#020"));
  memPanel = performance?.memory
    ? this.addPanel(new StatsPanel("MB", "#f08", "#201"))
    : null;
  REVISION = 16;

  begin() {
    this.beginTime = (performance || Date).now();
  }

  end() {
    this.frames++;

    const time = (performance || Date).now();

    this.msPanel.update(time - this.beginTime, 200);

    if (time >= this.prevTime + 1000) {
      this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);

      this.prevTime = time;
      this.frames = 0;

      if (this.memPanel) {
        const memory = performance!.memory!;
        this.memPanel.update(
          memory.usedJSHeapSize / 1048576,
          memory.jsHeapSizeLimit / 1048576,
        );
      }
    }

    return time;
  }

  update() {
    this.beginTime = this.end();
  }
}

const PR = Math.round(globalThis?.window?.devicePixelRatio ?? 1);

const WIDTH = 80 * PR;
const HEIGHT = 48 * PR;
const TEXT_X = 3 * PR;
const TEXT_Y = 2 * PR;
const GRAPH_X = 3 * PR;
const GRAPH_Y = 15 * PR;
const GRAPH_WIDTH = 74 * PR;
const GRAPH_HEIGHT = 30 * PR;

export class StatsPanel {
  min = Infinity;
  max = 0;
  dom = document.createElement("canvas");
  context = this.dom.getContext("2d")!;
  constructor(
    private name: string,
    private fg: string,
    private bg: string,
  ) {
    this.dom.width = WIDTH;
    this.dom.height = HEIGHT;
    this.dom.style.cssText = "width:80px;height:48px";

    this.context.font = `bold ${9 * PR}px Helvetica,Arial,sans-serif`;
    this.context.textBaseline = "top";

    this.context.fillStyle = bg;
    this.context.fillRect(0, 0, WIDTH, HEIGHT);

    this.context.fillStyle = fg;
    this.context.fillText(name, TEXT_X, TEXT_Y);
    this.context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    this.context.fillStyle = bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
  }

  update(value: number, maxValue: number) {
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 1;
    this.context.fillRect(0, 0, WIDTH, GRAPH_Y);
    this.context.fillStyle = this.fg;
    this.context.fillText(
      `${Math.round(value)} ${this.name} (${Math.round(this.min)}-${Math.round(
        this.max,
      )})`,
      TEXT_X,
      TEXT_Y,
    );

    this.context.drawImage(
      this.dom,
      GRAPH_X + PR,
      GRAPH_Y,
      GRAPH_WIDTH - PR,
      GRAPH_HEIGHT,
      GRAPH_X,
      GRAPH_Y,
      GRAPH_WIDTH - PR,
      GRAPH_HEIGHT,
    );

    this.context.fillRect(
      GRAPH_X + GRAPH_WIDTH - PR,
      GRAPH_Y,
      PR,
      GRAPH_HEIGHT,
    );

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(
      GRAPH_X + GRAPH_WIDTH - PR,
      GRAPH_Y,
      PR,
      Math.round((1 - value / maxValue) * GRAPH_HEIGHT),
    );
  }
}
