/**
 * @jest-environment jsdom
 */

import { LatitudeLimitProp } from "../../model/depth-0/LatitudeLimit";
import { OrbitCoordinatesRequestProp } from "../../model/depth-0/OrbitCoordinatesRequestProp";
import { PuzzleIDRequestProp } from "../../model/depth-0/PuzzleIDRequestProp";
import { OrbitCoordinatesProp } from "../../model/depth-3/OrbitCoordinatesProp";
import { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { TwistyPropParent } from "../../model/TwistyProp";
import { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import { TwistyOrbitControlsV2 } from "./TwistyOrbitControlsV2";

describe("TwistyOrbitControlsV2", () => {
  it("should update correctly", async () => {
    const orbitCoordinatesRequestProp = new OrbitCoordinatesRequestProp();
    const latLimit = new LatitudeLimitProp();
    const puzzleIDRequestProp = new PuzzleIDRequestProp(
      "3x3x3",
    ) as TwistyPropParent<PuzzleID>;
    const orbitCoordinatesProp = new OrbitCoordinatesProp({
      orbitCoordinatesRequest: orbitCoordinatesRequestProp,
      latitudeLimit: latLimit,
      puzzleID: puzzleIDRequestProp,
    });
    const mockModel = {
      orbitCoordinatesRequestProp,
      orbitCoordinatesProp: orbitCoordinatesProp,
    };

    // Uncomment to watch changes.
    // mockModel.orbitCoordinatesProp.addFreshListener(console.log);

    expect(await orbitCoordinatesProp.get()).toEqual({
      latitude: 34.44990198795349,
      longitude: 30.96375653207353,
      distance: 5.656854249492381,
    });

    // Values are:true if currently set, false if previously set, undefined otherwise.
    const canvasEventListenersRegistered: Record<string, boolean> = {};
    const windowEventListenersRegistered: Record<string, boolean> = {};
    window.addEventListener = (event: string): void => {
      windowEventListenersRegistered[event] = true;
    };
    window.removeEventListener = (event: string): void => {
      windowEventListenersRegistered[event] = false;
    };

    const mockCanvas = {
      offsetWidth: 100,
      offsetHeight: 100,
      addEventListener: (event: string) => {
        canvasEventListenersRegistered[event] = true;
      },
      removeEventListener: (event: string) => {
        canvasEventListenersRegistered[event] = false;
      },
    } as any as HTMLCanvasElement;

    const orbitControls = new TwistyOrbitControlsV2(
      mockModel as TwistyPlayerModel,
      false,
      mockCanvas,
    );
    expect(canvasEventListenersRegistered).toEqual({
      mousedown: true,
      touchstart: true,
    });
    expect(windowEventListenersRegistered).toEqual({});

    expect(await orbitCoordinatesProp.get()).toEqual({
      latitude: 34.44990198795349,
      longitude: 30.96375653207353,
      distance: 5.656854249492381,
    });

    let preventedDefault = false;
    orbitControls.onMouseStart({
      timeStamp: 200,
      preventDefault: () => {
        preventedDefault = true;
      },
    } as MouseEvent);
    expect(preventedDefault).toBe(true);
    expect(canvasEventListenersRegistered).toEqual({
      mousedown: true,
      touchstart: true,
    });
    expect(windowEventListenersRegistered).toEqual({
      mousemove: true,
      mouseup: true,
    });

    expect(await orbitCoordinatesProp.get()).toEqual({
      latitude: 34.44990198795349,
      longitude: 30.96375653207353,
      distance: 5.656854249492381,
    });

    orbitControls.onMouseMove({
      timeStamp: 210,
      movementX: 10,
      movementY: 10,
    } as MouseEvent);

    expect(await orbitCoordinatesProp.get()).toEqual({
      latitude: 35,
      longitude: 17.72562052291437,
      distance: 5.656854249492381,
    });

    orbitControls.onMouseMove({
      timeStamp: 220,
      movementX: 1,
      movementY: -10,
    } as MouseEvent);

    expect(await orbitCoordinatesProp.get()).toEqual({
      latitude: 24.312125734137396,
      longitude: 15.905330173774018,
      distance: 5.656854249492381,
    });

    orbitControls.onMouseMove({
      timeStamp: 240,
      movementX: 0,
      movementY: 0,
    } as MouseEvent);

    expect(await orbitCoordinatesProp.get()).toEqual({
      latitude: 24.312125734137396,
      longitude: 15.905330173774018,
      distance: 5.656854249492381,
    });

    orbitControls.onMouseMove({
      timeStamp: 250,
      movementX: 2,
      movementY: 1,
    } as MouseEvent);

    expect(await orbitCoordinatesProp.get()).toEqual({
      latitude: 25.69334862750623,
      longitude: 12.423244934257923,
      distance: 5.656854249492381,
    });

    orbitControls.onMouseMove({
      timeStamp: 250,
      movementX: 10,
      movementY: 1,
    } as MouseEvent);
    // Protect against a regression.
    // https://www.speedsolving.com/threads/introducing-twizzle-alpha.85019/page-3#post-1454696
    expect((orbitControls as any).lastMouseMoveMomentumX).not.toBe(Infinity);

    expect(await orbitCoordinatesProp.get()).toEqual({
      latitude: 27.07457152087506,
      longitude: -0.8148910749011975,
      distance: 5.656854249492381,
    });

    orbitControls.onMouseMove({
      timeStamp: 1000,
      movementX: -3,
      movementY: 2,
    } as MouseEvent);
    expect(await orbitCoordinatesProp.get()).toEqual({
      latitude: 29.743827999090797,
      longitude: 4.195897274779327,
      distance: 5.656854249492381,
    });

    orbitControls.onMouseEnd({
      timeStamp: 1000, // Note: unused by the current implementation, but we provide it for consistency.
      preventDefault: () => {},
    } as MouseEvent);
    expect(await orbitCoordinatesProp.get()).toEqual({
      latitude: 29.743827999090797,
      longitude: 4.195897274779327,
      distance: 5.656854249492381,
    });
    expect(canvasEventListenersRegistered).toEqual({
      mousedown: true,
      touchstart: true,
    });
    expect(windowEventListenersRegistered).toEqual({
      mousemove: false,
      mouseup: false,
    });

    // TODO: test inertia separately?
  });
});
