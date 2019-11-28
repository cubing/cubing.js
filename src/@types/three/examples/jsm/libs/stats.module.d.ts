declare module 'three/examples/jsm/libs/stats.module' {
  interface Stats {
    REVISION: number;
    dom: HTMLDivElement;
    addPanel(panel: Stats.Panel): Stats.Panel;
    showPanel(id: number): void;
    begin(): void;
    end(): void;
    update(): void;
    domElement: HTMLDivElement;
    setMode(id: number): void;
  }

  function Stats(): Stats;

  namespace Stats {
    interface Panel {
      dom: HTMLCanvasElement;
      update(value: number, maxValue: number): void;
    }

    function Panel(): Panel;
  }

  export default Stats
}
