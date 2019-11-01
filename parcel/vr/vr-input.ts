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

// TODO: Handle touched vs. pressed.
export enum ButtonTransitionDirection {
  Pressed = "pressed",
  Release = "released",
}

export enum ButtonGrouping {
  Any = "any",
  All = "all",
}

export enum ButtonListenerStatus {
  Inactive = "inactive",
  Active = "active",
}

export type ButtonListenerCallback = () => void;

export interface ButtonSpec {
  controllerIdx: number;
  buttonIdx: number;
}

// TODO: Simplify
export interface ButtonListenerSpec {
  grouping?: ButtonGrouping;
  direction?: ButtonTransitionDirection;
  buttons: ButtonSpec[];
}

class ButtonListener {
  // TODO: Calculate if the initial status is actually active.
  private lastStatus: ButtonListenerStatus = ButtonListenerStatus.Inactive;
  constructor(private spec: ButtonListenerSpec, public activatedCallback: ButtonListenerCallback, public deactivatedCallback?: ButtonListenerCallback) { }

  public update(buttonStates: ButtonStates): void {
    const direction = this.spec.direction || ButtonTransitionDirection.Pressed;
    const status = this.currentStatus(buttonStates, direction === ButtonTransitionDirection.Pressed);
    if (this.lastStatus === ButtonListenerStatus.Inactive && status === ButtonListenerStatus.Active) {
      this.activatedCallback();
    }
    if (this.lastStatus === ButtonListenerStatus.Active && status === ButtonListenerStatus.Inactive && this.deactivatedCallback) {
      this.deactivatedCallback();
    }
    this.lastStatus = status;
  }

  private currentStatus(buttonStates: ButtonStates, activeMeansPressed: boolean): ButtonListenerStatus {
    switch (this.spec.grouping || ButtonGrouping.All) {
      case ButtonGrouping.Any:
        return this.anyActive(buttonStates, activeMeansPressed);
        break;
      case ButtonGrouping.All:
        return this.allActive(buttonStates, activeMeansPressed);
        break;
      default:
        throw new Error("Unknown grouping");
    }
  }

  private anyActive(buttonStates: ButtonStates, activeMeansPressed: boolean): ButtonListenerStatus {
    for (const button of this.spec.buttons) {
      if (this.isButtonPressed(buttonStates, button) === activeMeansPressed) {
        return ButtonListenerStatus.Active;
      }
    }
    return ButtonListenerStatus.Inactive;
  }

  // TODO: Combine implementation with "any"?
  private allActive(buttonStates: ButtonStates, activeMeansPressed: boolean): ButtonListenerStatus {
    for (const button of this.spec.buttons) {
      if (this.isButtonPressed(buttonStates, button) !== activeMeansPressed) {
        return ButtonListenerStatus.Inactive;
      }
    }
    return ButtonListenerStatus.Active;
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

  // TODO: Single-button convenience.
  public addButtonListener(spec: ButtonListenerSpec, activatedCallback: ButtonListenerCallback, deactivatedCallback?: ButtonListenerCallback): void {
    this.buttonListeners.push(new ButtonListener(spec, activatedCallback, deactivatedCallback));
  }
}
