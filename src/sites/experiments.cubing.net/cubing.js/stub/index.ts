// // Stub file for testing.
// // Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Texture, TextureLoader } from "three";
import { Twisty3DCanvas, TwistyPlayer } from "../../../../cubing/twisty";

const checkeredBackground = new URL(
  "./twizzle-animation-background-16-9.png",
  import.meta.url,
).toString();

const twistyPlayer = document.body.appendChild(
  new TwistyPlayer({
    alg: "R U R'", // "U R U' R' U' R U' r2' u r U r2 u' r2' U' r' U r' U2 r y2",
  }),
);
setTimeout(async () => {
  const twisty3DCanvas = twistyPlayer.viewerElems[0] as Twisty3DCanvas;
  twisty3DCanvas.experimentalForceSize(512, 288);

  await new Promise<void>((resolve) => {
    const loader = new TextureLoader();
    loader.load(checkeredBackground, (texture: Texture) => {
      twistyPlayer.scene!.background = texture;
      resolve();
    });
  });

  var canvas = twisty3DCanvas.canvas;
  var ctx = canvas.getContext("webgl2")! as WebGL2RenderingContext;
  console.log("ctx", canvas, ctx);
  ctx.clearColor(1, 1, 1, 0);
  ctx.draw;

  const canMP4 = MediaRecorder.isTypeSupported("video/mp4");
  const mimeType = canMP4 ? "video/mp4" : "video/webm";

  const stream = canvas.captureStream(0);
  var recordedChunks = [];
  var options = {
    mimeType,
    videoBitsPerSecond: 10000000,
  };
  const mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  // Chrome requires we draw on the canvas while recording
  mediaRecorder.onstart = animationLoop;

  const track = stream.getVideoTracks()[0];
  // track.applyConstraints({ aspectRatio: 16 / 9 });
  // track.applyConstraints({ frameRate: 60 }); // TODO: Why doesn't this break recording?
  twistyPlayer.timeline.setTimestamp(0);
  twistyPlayer.timeline.tempoScale = 4;
  let startRemaining = 30; // TODO: Can we do 60fps in the output?
  let endRemaining = 30; // TODO: Can we do 60fps in the output?
  const end = twistyPlayer.timeline.timeRange().end;
  async function animationLoop() {
    // ctx.clear(ctx.COLOR_BUFFER_BIT);
    if (startRemaining > 0) {
      startRemaining--;
      twistyPlayer.timeline.setTimestamp(startRemaining / 100);
    } else if (twistyPlayer.timeline.timestamp === end && endRemaining > 0) {
      endRemaining--;
      twistyPlayer.timeline.setTimestamp(twistyPlayer.timeline.timestamp - 1);
      twistyPlayer.timeline.setTimestamp(twistyPlayer.timeline.timestamp);
    } else {
      twistyPlayer.timeline.setTimestamp(
        twistyPlayer.timeline.timestamp +
          (1000 / 60) * twistyPlayer.timeline.tempoScale,
      );
      twistyPlayer.timeline.timestamp = Math.min(
        twistyPlayer.timeline.timestamp,
        end,
      );
    }
    console.log("timestamp", twistyPlayer.timeline.timestamp, end);
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
        twistyPlayer.timeline.timestamp >=
          twistyPlayer.timeline.timeRange().end &&
        endRemaining === 0
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
    a.download = `twizzle.${canMP4 ? "mp4" : "webm"}`;
    a.href = url;
    a.click();
  }

  // setTimeout(() => {
  //   console.clear();
  //   mediaRecorder.stop();
  // }, 10000);
  // console.log("please wait while recording (10s)");
}, 100);
