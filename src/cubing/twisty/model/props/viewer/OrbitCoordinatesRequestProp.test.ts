import { expect, test } from "bun:test";
import {
  type OrbitCoordinates,
  OrbitCoordinatesRequestProp,
} from "./OrbitCoordinatesRequestProp";

test("longitude wraps from 180 to -180", async () => {
  const orbitCoordinatesRequestProp = new OrbitCoordinatesRequestProp();
  async function roundTripLongitude(longitude: number) {
    orbitCoordinatesRequestProp.set({ longitude });
    return ((await orbitCoordinatesRequestProp.get()) as OrbitCoordinates)
      .longitude;
  }

  expect(await roundTripLongitude(0)).toStrictEqual(0);
  expect(await roundTripLongitude(180)).toStrictEqual(180);
  expect(await roundTripLongitude(181)).toStrictEqual(-179);
  expect(await roundTripLongitude(-180)).toStrictEqual(180);
  expect(await roundTripLongitude(270)).toStrictEqual(-90);
  expect(await roundTripLongitude(1000)).toStrictEqual(-80);
});
