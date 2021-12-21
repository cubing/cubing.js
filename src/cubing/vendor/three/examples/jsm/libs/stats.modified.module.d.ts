export class Stats {
  REVISION: number;
  dom: HTMLDivElement;
  addPanel(panel: StatsPanel): StatsPanel;
  showPanel(id: number): void;
  begin(): void;
  end(): void;
  update(): void;
  domElement: HTMLDivElement;
  setMode(id: number): void;
}

export class StatsPanel {
  dom: HTMLCanvasElement;
  update(value: number, maxValue: number): void;
  constructor(name?: string, fg?: string, bg?: string);
}
