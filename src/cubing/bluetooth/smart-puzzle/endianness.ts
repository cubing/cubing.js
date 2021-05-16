export function flipBitOrder(v: number, numBits: number): number {
  let result = 0;
  for (let i = 0; i < numBits; i++) {
    const shiftLeft = numBits - 1 - 2 * i;
    const unShiftedBit = v & (0b1 << i);
    // console.log(
    //   unShiftedBit,
    //   shiftLeft,
    //   shiftLeft < 0 ? unShiftedBit >> -shiftLeft : unShiftedBit << shiftLeft,
    // );
    result +=
      shiftLeft < 0 ? unShiftedBit >> -shiftLeft : unShiftedBit << shiftLeft;
  }
  return result;
}
