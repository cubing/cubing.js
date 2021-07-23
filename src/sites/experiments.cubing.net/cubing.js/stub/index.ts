// // Stub file for testing.
// // Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Twisty3DCanvas, TwistyPlayer } from "../../../../cubing/twisty";

// import { Twisty3DCanvas, TwistyPlayer } from "../../../../cubing/twisty";

// // Note: this file needs to contain code to avoid a Snowpack error.
// // So we put a `console.log` here for now.
// console.log("Loading stub file.");

// // const twistyPlayer = document.body.appendChild(
// //   new TwistyPlayer({
// //     alg: "R U R'",
// //   }),
// // );
// // setTimeout(() => {
// //   const twisty3DCanvas = twistyPlayer.viewerElems[0] as Twisty3DCanvas;
// //   const stream = twisty3DCanvas.canvas.captureStream(0);
// //   // console.log(stream.getVideoTracks()[0]);
// //   const track = stream.getVideoTracks()[0];
// //   track.requestFrame();

// //   twistyPlayer.timeline.setTimestamp(700);
// //   twisty3DCanvas.experimentalSetOnRenderFinish(() => {
// //     console.log("frame!");
// //     track.requestFrame();
// //   });
// //   // track.stop();

// //   var options = { mimeType: "video/webm; codecs=vp9" };
// //   const mediaRecorder = new MediaRecorder(stream, options);

// //   mediaRecorder.ondataavailable = handleDataAvailable;
// //   mediaRecorder.start();

// //   var recordedChunks = [];
// //   function handleDataAvailable(event) {
// //     console.log("data-available");
// //     if (event.data.size > 0) {
// //       recordedChunks.push(event.data);
// //       console.log(recordedChunks);
// //       // download();
// //     } else {
// //       // ...
// //     }
// //   }
// //   function download() {
// //     console.log("downlaod!");
// //     var blob = new Blob(recordedChunks, {
// //       type: "video/webm",
// //     });
// //     var url = URL.createObjectURL(blob);
// //     var a = document.createElement("a");
// //     a.href = url;
// //     a.download = "test.webm";
// //     a.click();
// //     window.URL.revokeObjectURL(url);
// //   }

// //   const downloadButton = document.body.appendChild(
// //     document.createElement("button"),
// //   );
// //   downloadButton.textContent = "Download";
// //   downloadButton.addEventListener("click", download);

// //   (window as any).stream = stream;

// //   console.log(stream);
// // }, 100);

// const twistyPlayer = document.body.appendChild(
//   new TwistyPlayer({
//     alg: "R U R'",
//   }),
// );
// setTimeout(() => {
//   const twisty3DCanvas = twistyPlayer.viewerElems[0] as Twisty3DCanvas;
//   var canvas = twisty3DCanvas.canvas;

//   // Optional frames per second argument.
//   var stream = canvas.captureStream(25);
//   var recordedChunks = [];

//   console.log(stream);
//   var options = { mimeType: "video/webm; codecs=vp9" };
//   const mediaRecorder = new MediaRecorder(stream, options);

//   mediaRecorder.ondataavailable = handleDataAvailable;
//   mediaRecorder.start();

//   function handleDataAvailable(event) {
//     console.log("data-available");
//     if (event.data.size > 0) {
//       recordedChunks.push(event.data);
//       console.log(recordedChunks);
//       download();
//     } else {
//       // ...
//     }
//   }
//   function download() {
//     var blob = new Blob(recordedChunks, {
//       type: "video/webm",
//     });
//     var url = URL.createObjectURL(blob);
//     var a = document.createElement("a");
//     document.body.appendChild(a);
//     a.style = "display: none";
//     a.href = url;
//     a.download = "test.webm";
//     a.click();
//     window.URL.revokeObjectURL(url);
//   }

//   // demo: to download after 9sec
//   setTimeout((event) => {
//     console.log("stopping");
//     mediaRecorder.stop();
//   }, 9000);
// }, 100);

const twistyPlayer = document.body.appendChild(
  new TwistyPlayer({
    alg: "R U R'",
  }),
);
setTimeout(() => {
  const twisty3DCanvas = twistyPlayer.viewerElems[0] as Twisty3DCanvas;
  var c = twisty3DCanvas.canvas;

  const stream = c.captureStream(25);
  var recordedChunks = [];
  var options = {};
  const mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  // Chrome requires we draw on the canvas while recording
  mediaRecorder.onstart = animationLoop;

  function animationLoop() {
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
  }

  setTimeout(() => {
    console.clear();
    mediaRecorder.stop();
  }, 10000);
  console.log("please wait while recording (10s)");
}, 100);
