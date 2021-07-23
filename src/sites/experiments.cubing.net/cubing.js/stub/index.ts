// // Stub file for testing.
// // Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Twisty3DCanvas, TwistyPlayer } from "../../../../cubing/twisty";

const twistyPlayer = document.body.appendChild(
  new TwistyPlayer({
    alg: "U R U' R' U' R U' r2' u r U r2 u' r2' U' r' U r' U2 r y2",
  }),
);
setTimeout(() => {
  const twisty3DCanvas = twistyPlayer.viewerElems[0] as Twisty3DCanvas;
  var c = twisty3DCanvas.canvas;

  const stream = c.captureStream(0);
  var recordedChunks = [];
  var options = {
    mimeType: "video/mp4",
    videoBitsPerSecond: 2500000,
  };
  const mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  // Chrome requires we draw on the canvas while recording
  mediaRecorder.onstart = animationLoop;

  const track = stream.getVideoTracks()[0];
  // track.applyConstraints({ frameRate: 60 });
  twistyPlayer.timeline.setTimestamp(0);
  twistyPlayer.timeline.tempoScale = 4;
  async function animationLoop() {
    twistyPlayer.timeline.setTimestamp(
      twistyPlayer.timeline.timestamp +
        (1000 / 60) * twistyPlayer.timeline.tempoScale,
    );
    twistyPlayer.timeline.timestamp = Math.min(
      twistyPlayer.timeline.timestamp,
      twistyPlayer.timeline.timeRange().end,
    );
    console.log(
      "timestamp",
      twistyPlayer.timeline.timestamp,
      twistyPlayer.timeline.timeRange().end,
    );
    twisty3DCanvas.experimentalSetOnRenderFinish(() => {
      console.log("frame!");
      track.requestFrame();
      twisty3DCanvas.experimentalSetOnRenderFinish(null);
      console.log(
        "sdfd",
        twistyPlayer.timeline.timestamp >=
          twistyPlayer.timeline.timeRange().end,
      );
      if (
        twistyPlayer.timeline.timestamp >= twistyPlayer.timeline.timeRange().end
      ) {
        console.log("end");
        mediaRecorder.stop();
      } else {
        animationLoop();
      }
    });
    // // draw nothing, but still draw
    // ctx.globalAlpha = 0;
    // ctx.fillRect(0, 0, 1, 1);
    // // while we're recording
    // if (mediaRecorder.state !== "inactive") {
    //   requestAnimationFrame(animationLoop);
    // }
  }
  // wait for the stop event to export the final video
  // the dataavailable can fire before
  mediaRecorder.onstop = (evt) => download();

  function handleDataAvailable(event) {
    recordedChunks.push(event.data);
  }

  function download() {
    var blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    var url = URL.createObjectURL(blob);
    // exporting to a video element for that demo
    // the downloaded video will still not work in some programs
    // For this one would need to fix the markers using something like ffmpeg.
    var video = document.getElementById("video");
    video.src = url;
    // hack to make the video seekable in the browser
    // see https://stackoverflow.com/questions/38443084/
    video.onloadedmetadata = (evt) => {
      video.currentTime = 10e6;
      video.addEventListener("seeked", () => (video.currentTime = 0), {
        once: true,
      });
    };

    const a = document.createElement("a");
    a.download = "a.webm";
    a.href = url;
    a.click();
  }

  // setTimeout(() => {
  //   console.clear();
  //   mediaRecorder.stop();
  // }, 10000);
  // console.log("please wait while recording (10s)");
}, 100);
