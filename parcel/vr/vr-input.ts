import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial, Vector3, WebGLRenderer } from "three";

export enum Status {
  Untargeted,
  Targeted,
  Pressed,
}

const NUM_CONTROLLERS = 2;

export const controllerDirection: Vector3 = new Vector3(0, 0, -1);

const geometry = new BufferGeometry();
geometry.addAttribute("position", new Float32BufferAttribute([
  0, 0, 0,
  controllerDirection.x, controllerDirection.y, controllerDirection.z,
], 3));
geometry.addAttribute("color", new Float32BufferAttribute([
  0.5, 0.5, 0.5,
  0, 0, 0,
], 3));

const material = new LineBasicMaterial({
  blending: AdditiveBlending,
  linewidth: 10,
  transparent: true,
  opacity: 0.5,
});

export enum ButtonGrouping {
  All = "all",
  Any = "any",
  None = "none",
}

export type ButtonListenerCallback = () => void;

export interface ButtonSpec {
  controllerIdx: number;
  buttonIdx: number;
}

class ButtonListener {
  // TODO: Calculate if the initial status is actually active.
  private activeLastTime: boolean = false;
  constructor(private grouping: ButtonGrouping, private buttonSpecs: ButtonSpec[], public activatedCallback: ButtonListenerCallback, public deactivatedCallback?: ButtonListenerCallback) { }

  public update(buttonStates: ButtonStates): void {
    const active = this.currentlyActive(buttonStates);
    if (!this.activeLastTime && active) {
      this.activatedCallback();
    }
    if (this.activeLastTime && !active && this.deactivatedCallback) {
      this.deactivatedCallback();
    }
    this.activeLastTime = active;
  }

  private currentlyActive(buttonStates: ButtonStates): boolean {
    switch (this.grouping) {
      case ButtonGrouping.All:
        return this.allActive(buttonStates);
        break;
      case ButtonGrouping.Any:
        return this.anyActive(buttonStates);
        break;
      case ButtonGrouping.None:
        return this.noneActive(buttonStates);
        break;
      default:
        throw new Error("Unknown grouping");
    }
  }

  private noneActive(buttonStates: ButtonStates): boolean {
    for (const button of this.buttonSpecs) {
      if (this.isButtonPressed(buttonStates, button)) {
        return false;
      }
    }
    return true;
  }

  private anyActive(buttonStates: ButtonStates): boolean {
    for (const button of this.buttonSpecs) {
      if (this.isButtonPressed(buttonStates, button)) {
        return true;
      }
    }
    return false;
  }

  // TODO: Combine implementation with "any"?
  private allActive(buttonStates: ButtonStates): boolean {
    for (const button of this.buttonSpecs) {
      if (!this.isButtonPressed(buttonStates, button)) {
        return false;
      }
    }
    return true;
  }

  private isButtonPressed(buttonStates: ButtonStates, buttonSpec: ButtonSpec): boolean {
    const controllerStates = buttonStates[buttonSpec.controllerIdx] || [];
    // Undefined (== missing) means "not pressed";
    return !!controllerStates[buttonSpec.buttonIdx]; // TODO
  }
}

interface ButtonStates { [idx: number]: boolean[]; }

export class VRInput {
  public controllers: Group[] = [];
  private buttonListeners: ButtonListener[] = [];
  private previousButtonStates: ButtonStates;
  constructor(renderer: WebGLRenderer) {
    for (let i = 0; i < NUM_CONTROLLERS; i++) {
      const controller = renderer.vr.getController(i);
      controller.add(new Line(geometry, material));
      this.controllers.push(controller);
    }
  }

  // Needs to be called in the animation loop when input needs to be proceessed.
  // Note: calling this multiple times in a loop cycle may cause unexpected results.
  public update(): void {
    const gamepads = navigator.getGamepads();
    const buttonStates: ButtonStates = {};

    // // TODO: is it more performant if we don't read all gamepads/button states, but only the ones we're listening for?
    for (const i in gamepads) {
      const gamepad = gamepads[i] || { buttons: [] };
      buttonStates[i] = [];
      const buttons = gamepad.buttons || [];
      for (const button of buttons) {
        buttonStates[i].push(button.pressed);
      }
    }

    for (const buttonListener of this.buttonListeners) {
      buttonListener.update(buttonStates);
    }
    this.previousButtonStates = buttonStates;
  }

  public addButtonListener(grouping: ButtonGrouping, buttonSpecs: ButtonSpec[], activatedCallback: ButtonListenerCallback, deactivatedCallback?: ButtonListenerCallback): void {
    this.buttonListeners.push(new ButtonListener(grouping, buttonSpecs, activatedCallback, deactivatedCallback));
  }

  public addSingleButtonListener(buttonSpec: ButtonSpec, activatedCallback: ButtonListenerCallback, deactivatedCallback?: ButtonListenerCallback): void {
    this.addButtonListener(ButtonGrouping.All, [buttonSpec], activatedCallback, deactivatedCallback);
  }
}
