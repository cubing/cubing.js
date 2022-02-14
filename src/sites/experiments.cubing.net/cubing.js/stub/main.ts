import { Twisty, TwistyAlgViewer } from "../../../../cubing/twisty";
import { randomScrambleForEvent } from "../../../../cubing/scramble";
class App {
  // Example of getting an element from the page.
  twistyPlayer: TwistyPlayer = document.querySelector("#twisty-player-left");
  tpc: TwistyPlayer = document.querySelector("#twisty-player-center");
  tpr: TwistyPlayer = document.querySelector("#twisty-player-right");
  // Example of creating a new element and adding it to the page.
  twistyAlgViewer = document.body.appendChild(
    new TwistyAlgViewer({ twistyPlayer: this.twistyPlayer })
  );
  constructor() {
    this.updateScramble();
    this.twistyPlayer.experimentalModel.detailedTimelineInfo.addFreshListener(
        (detailedTimelineInfo) => {
       this.tpc.timestamp = detailedTimelineInfo.timestamp;
       this.tpr.timestamp = detailedTimelineInfo.timestamp;
    },);
    this.twistyPlayer.experimentalModel.alg.addFreshListener(
         (algWithIssues: AlgWithIssues) => {
       this.tpc.alg = algWithIssues.alg ;
       this.tpr.alg = algWithIssues.alg ;
    },);
  }

  async updateScramble() {
    const alg = await randomScrambleForEvent("333");
    this.twistyPlayer.alg = alg ;
    this.tpc.alg = alg ;
    this.tpr.alg = alg ;
  }
}

globalThis.onload = function() {
   globalThis.app = new App();
}
