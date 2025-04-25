import type { Milliseconds } from "./Timer";

// import "./db";
// function Stats() {

// };

type TimeParts = {
  secFirst: string;
  secRest: string;
  decimals: string;
};

// biome-ignore lint/complexity/noStaticOnlyClass: This is an old code pattern.
export class Stats {
  static timeParts(time: Milliseconds): TimeParts {
    // Each entry is [minimum number of digits if not first, separator before, value]
    const hours = Math.floor(time / (60 * 60 * 1000));
    const minutes = Math.floor(time / (60 * 1000)) % 60;
    const seconds = Math.floor(time / 1000) % 60;

    function pad(number: number, numDigitsAfterPadding: number) {
      let output = `${number}`;
      while (output.length < numDigitsAfterPadding) {
        output = `0${output}`;
      }
      return output;
    }

    let secFirstString = "";
    let secRestString: string;
    if (hours > 0) {
      secRestString = `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
    } else if (minutes > 0) {
      secRestString = `${minutes}:${pad(seconds, 2)}`;
    } else {
      secRestString = `${seconds}`;
      if (secRestString[0] === "1") {
        secFirstString = "1";
        secRestString = secRestString.substr(1);
      }
    }

    const centiseconds = Math.floor((time % 1000) / 10);

    return {
      secFirst: secFirstString,
      secRest: secRestString,
      decimals: `${pad(centiseconds, 2)}`,
    };
  }

  static formatTime(
    time: Milliseconds | null,
    options?: { partial: boolean },
  ): string {
    if (time === null) {
      return "—";
    }

    const parts = Stats.timeParts(time);
    let result = `${parts.secFirst + parts.secRest}`;
    if (options?.partial) {
      result = `(${result})`;
    }
    return result;
  }
}
