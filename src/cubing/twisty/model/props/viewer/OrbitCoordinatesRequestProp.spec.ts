import { expect } from "../../../../../test/chai-workarounds";
import {
  OrbitCoordinatesRequestProp,
  type OrbitCoordinates,
} from "./OrbitCoordinatesRequestProp";

it("longitude wraps from 180 to -180", async () => {
  const orbitCoordinatesRequestProp = new OrbitCoordinatesRequestProp();
  async function roundTripLongitude(longitude: number) {
    orbitCoordinatesRequestProp.set({ longitude });
    return ((await orbitCoordinatesRequestProp.get()) as OrbitCoordinates)
      .longitude;
  }

  expect(await roundTripLongitude(0)).to.equal(0);
  expect(await roundTripLongitude(180)).to.equal(180);
  expect(await roundTripLongitude(181)).to.equal(-179);
  expect(await roundTripLongitude(-180)).to.equal(180);
  expect(await roundTripLongitude(270)).to.equal(-90);
  expect(await roundTripLongitude(1000)).to.equal(-80);
});
