import { AdditiveBlending } from "three/src/constants.js";
import { Float32BufferAttribute } from "three/src/core/BufferAttribute.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import { LineBasicMaterial } from "three/src/materials/LineBasicMaterial.js";
import { Vector3 } from "three/src/math/Vector3.js";
import type { Group } from "three/src/objects/Group.js";
import { Line } from "three/src/objects/Line.js";
import type { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js";

export enum Status {
  Untargeted,
  Targeted,
  Pressed,
}

const NUM_CONTROLLERS = 2;

export enum OculusButton {
  Trackpad = 0,
  Trigger = 1,
  Grip = 2,
  XorA = 3,
  YorB = 4,
}

export const controllerDirection: Vector3 = new Vector3(0, 0, -1);

const geometry = new BufferGeometry();
geometry.setAttribute(
  "position",
  new Float32BufferAttribute(
    [
      0,
      0,
      0,
      controllerDirection.x,
      controllerDirection.y,
      controllerDirection.z,
    ],
    3,
  ),
);
geometry.setAttribute(
  "color",
  new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3),
);

const material = new LineBasicMaterial({
  blending: AdditiveBlending,
  linewidth: 10,
  transparent: true,
  opacity: 0.5,
});

export enum ButtonGrouping {
  All = "all",
  Any = "any",
  Single = "single",
  None = "none",
}

export type ButtonListenerCallback = () => void;

export interface ButtonSpec {
  controllerIdx: number;
  buttonIdx: number;
  invert?: boolean;
}

class ButtonListener {
  // TODO: Calculate if the initial status is actually active.
  private activeLastTime: boolean = false;
  constructor(
    private grouping: ButtonGrouping,
    private buttonSpecs: ButtonSpec[],
    private activatedCallback: ButtonListenerCallback,
    private continuedActiveCallback?: ButtonListenerCallback,
    private deactivatedCallback?: ButtonListenerCallback,
  ) {}

  public update(buttonStates: ButtonStates): void {
    const active = this.currentlyActive(buttonStates);
    if (active) {
      if (!this.activeLastTime) {
        this.activatedCallback();
      } else {
        if (this.continuedActiveCallback) {
          this.continuedActiveCallback();
        }
      }
    }
    if (this.activeLastTime && !active && this.deactivatedCallback) {
      this.deactivatedCallback();
    }
    this.activeLastTime = active;
  }

  private currentlyActive(buttonStates: ButtonStates): boolean {
    switch (this.grouping) {
      case ButtonGrouping.All: {
        return this.numberPressed(buttonStates) === this.buttonSpecs.length;
      }
      case ButtonGrouping.Any: {
        return this.numberPressed(buttonStates, true) > 0;
      }
      case ButtonGrouping.Single: {
        return this.numberPressed(buttonStates) === 1;
      }
      case ButtonGrouping.None: {
        return this.numberPressed(buttonStates, true) === 0;
      }
      default:
        throw new Error("Unknown grouping");
    }
  }

  // Short-circuit: return count of 1 if count is > 0.
  // TODO: Is the small performance gain from short-circuiting worth the extra code?
  private numberPressed(
    buttonStates: ButtonStates,
    shortCircuit: boolean = false,
  ): number {
    let count = 0;
    for (const button of this.buttonSpecs) {
      if (this.isButtonPressed(buttonStates, button)) {
        if (shortCircuit) {
          return 1;
        }
        count++;
      }
    }
    return count;
  }

  private isButtonPressed(
    buttonStates: ButtonStates,
    buttonSpec: ButtonSpec,
  ): boolean {
    const controllerStates = buttonStates[buttonSpec.controllerIdx] || [];
    // Undefined (== missing) means "not pressed";
    return !buttonSpec.invert === !!controllerStates[buttonSpec.buttonIdx]; // TODO
  }
}

interface ButtonStates {
  [idx: number]: boolean[];
}

export class VRInput {
  public controllers: Group[] = [];
  private buttonListeners: ButtonListener[] = [];
  constructor(renderer: WebGLRenderer) {
    for (let i = 0; i < NUM_CONTROLLERS; i++) {
      const controller = renderer.xr.getController(i);
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
    for (let i = 0; gamepads.length; i++) {
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
  }

  public addButtonListener(
    grouping: ButtonGrouping,
    buttonSpecs: ButtonSpec[],
    activatedCallback: ButtonListenerCallback,
    continuedActiveCallback?: ButtonListenerCallback,
    deactivatedCallback?: ButtonListenerCallback,
  ): void {
    this.buttonListeners.push(
      new ButtonListener(
        grouping,
        buttonSpecs,
        activatedCallback,
        continuedActiveCallback,
        deactivatedCallback,
      ),
    );
  }

  public addSingleButtonListener(
    buttonSpec: ButtonSpec,
    activatedCallback: ButtonListenerCallback,
    continuedActiveCallback?: ButtonListenerCallback,
    deactivatedCallback?: ButtonListenerCallback,
  ): void {
    this.addButtonListener(
      ButtonGrouping.All,
      [buttonSpec],
      activatedCallback,
      continuedActiveCallback,
      deactivatedCallback,
    );
  }
}
