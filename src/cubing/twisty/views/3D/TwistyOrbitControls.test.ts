import { expect, test } from "bun:test";
import {
  type PuzzleID,
  PuzzleIDRequestProp,
} from "../../model/props/puzzle/structure/PuzzleIDRequestProp";
import type { TwistyPropParent } from "../../model/props/TwistyProp";
import { LatitudeLimitProp } from "../../model/props/viewer/LatitudeLimit";
import { OrbitCoordinatesProp } from "../../model/props/viewer/OrbitCoordinatesProp";
import { OrbitCoordinatesRequestProp } from "../../model/props/viewer/OrbitCoordinatesRequestProp";
import { VisualizationFormatProp } from "../../model/props/viewer/VisualizationProp";
import { VisualizationStrategyProp } from "../../model/props/viewer/VisualizationStrategyProp";

test("TwistyOrbitControls should update correctly", async () => {
  const orbitCoordinatesRequestProp = new OrbitCoordinatesRequestProp();
  const latLimit = new LatitudeLimitProp();
  const puzzleIDRequestProp = new PuzzleIDRequestProp(
    "3x3x3",
  ) as TwistyPropParent<PuzzleID>;
  const visualizationRequestProp = new VisualizationFormatProp();
  const visualizationStrategyProp = new VisualizationStrategyProp({
    puzzleID: puzzleIDRequestProp,
    visualizationRequest: visualizationRequestProp,
  });
  const orbitCoordinatesProp = new OrbitCoordinatesProp({
    orbitCoordinatesRequest: orbitCoordinatesRequestProp,
    latitudeLimit: latLimit,
    puzzleID: puzzleIDRequestProp,
    strategy: visualizationStrategyProp,
  });
  // const mockModel = {
  //   orbitCoordinatesRequestProp,
  //   orbitCoordinatesProp: orbitCoordinatesProp,
  // };

  // Uncomment to watch changes.
  // mockModel.orbitCoordinatesProp.addFreshListener(console.log);

  expect(await orbitCoordinatesProp.get()).toEqual({
    latitude: 35,
    longitude: 30,
    distance: 6,
  });

  expect(await orbitCoordinatesProp.get()).toEqual({
    latitude: 35,
    longitude: 30,
    distance: 6,
  });
  // TODO

  //   // Values are:true if currently set, false if previously set, undefined otherwise.
  //   const canvasEventListenersRegistered: Record<string, boolean> = {};
  //   const windowEventListenersRegistered: Record<string, boolean> = {};
  //   window.addEventListener = (event: string): void => {
  //     windowEventListenersRegistered[event] = true;
  //   };
  //   window.removeEventListener = (event: string): void => {
  //     windowEventListenersRegistered[event] = false;
  //   };

  //   const mockCanvas = {
  //     offsetWidth: 100,
  //     offsetHeight: 100,
  //     addEventListener: (event: string) => {
  //       canvasEventListenersRegistered[event] = true;
  //     },
  //     removeEventListener: (event: string) => {
  //       canvasEventListenersRegistered[event] = false;
  //     },
  //   } as any as HTMLCanvasElement;

  //   const mockDragTracker = {} as DragTracker;

  //   const orbitControls = new TwistyOrbitControls(
  //     mockModel as TwistyPlayerModel,
  //     false,
  //     mockCanvas,
  //     mockDragTracker,
  //   );
  //   expect(canvasEventListenersRegistered).toStrictEqual({
  //     mousedown: true,
  //     touchstart: true,
  //   });
  //   expect(windowEventListenersRegistered).toStrictEqual({});

  //   expect(await orbitCoordinatesProp.get()).toStrictEqual({
  //     latitude: 35,
  //     longitude: 30,
  //     distance: 6,
  //   });

  //   let preventedDefault = false;
  //   orbitControls.onMouseStart({
  //     timeStamp: 200,
  //     preventDefault: () => {
  //       preventedDefault = true;
  //     },
  //   } as MouseEvent);
  //   expect(preventedDefault).toBe(true);
  //   expect(canvasEventListenersRegistered).toStrictEqual({
  //     mousedown: true,
  //     touchstart: true,
  //   });
  //   expect(windowEventListenersRegistered).toStrictEqual({
  //     mousemove: true,
  //     mouseup: true,
  //   });

  //   expect(await orbitCoordinatesProp.get()).toStrictEqual({
  //     latitude: 35,
  //     longitude: 30,
  //     distance: 6,
  //   });

  //   orbitControls.onMouseMove({
  //     timeStamp: 210,
  //     movementX: 10,
  //     movementY: 10,
  //   } as MouseEvent);

  //   expect(await orbitCoordinatesProp.get()).toStrictEqual({
  //     latitude: 35,
  //     longitude: 16.76186399084088,
  //     distance: 6,
  //   });

  //   orbitControls.onMouseMove({
  //     timeStamp: 220,
  //     movementX: 1,
  //     movementY: -10,
  //   } as MouseEvent);

  //   expect(await orbitCoordinatesProp.get()).toStrictEqual({
  //     latitude: 24.312125734137396,
  //     longitude: 14.941573641700643,
  //     distance: 6,
  //   });

  //   orbitControls.onMouseMove({
  //     timeStamp: 240,
  //     movementX: 0,
  //     movementY: 0,
  //   } as MouseEvent);

  //   expect(await orbitCoordinatesProp.get()).toStrictEqual({
  //     latitude: 24.312125734137396,
  //     longitude: 14.941573641700643,
  //     distance: 6,
  //   });

  //   orbitControls.onMouseMove({
  //     timeStamp: 250,
  //     movementX: 2,
  //     movementY: 1,
  //   } as MouseEvent);

  //   expect(await orbitCoordinatesProp.get()).toStrictEqual({
  //     latitude: 25.69334862750623,
  //     longitude: 11.459488402184547,
  //     distance: 6,
  //   });

  //   orbitControls.onMouseMove({
  //     timeStamp: 250,
  //     movementX: 10,
  //     movementY: 1,
  //   } as MouseEvent);
  //   // Protect against a regression.
  //   // https://www.speedsolving.com/threads/introducing-twizzle-alpha.85019/page-3#post-1454696
  //   expect((orbitControls as any).lastMouseMoveMomentumX).not.toBe(Infinity);

  //   expect(await orbitCoordinatesProp.get()).toStrictEqual({
  //     latitude: 27.07457152087506,
  //     longitude: -1.7786476069745731,
  //     distance: 6,
  //   });

  //   orbitControls.onMouseMove({
  //     timeStamp: 1000,
  //     movementX: -3,
  //     movementY: 2,
  //   } as MouseEvent);
  //   expect(await orbitCoordinatesProp.get()).toStrictEqual({
  //     latitude: 29.743827999090797,
  //     longitude: 3.232140742705951,
  //     distance: 6,
  //   });

  //   orbitControls.onMouseEnd({
  //     timeStamp: 1000, // Note: unused by the current implementation, but we provide it for consistency.
  //     preventDefault: () => {},
  //   } as MouseEvent);
  //   expect(await orbitCoordinatesProp.get()).toStrictEqual({
  //     latitude: 29.743827999090797,
  //     longitude: 3.232140742705951,
  //     distance: 6,
  //   });
  //   expect(canvasEventListenersRegistered).toStrictEqual({
  //     mousedown: true,
  //     touchstart: true,
  //   });
  //   expect(windowEventListenersRegistered).toStrictEqual({
  //     mousemove: false,
  //     mouseup: false,
  //   });

  //   // TODO: test inertia separately?
});
