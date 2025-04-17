// import { svgFiles } from "./svg";
// import {
//   Color,
//   DoubleSide,
//   Group,
//   Mesh,
//   MeshBasicMaterial,
//   ShapeBufferGeometry,
//   Texture,
//   TextureLoader,
//   Vector3,
// } from "three/src/Three.js";
// import { SVGLoader, SVGResult } from "three/examples/jsm/loaders/SVGLoader";
// import {
//   Cube3D,
//   TimelineActionEvent,
//   Twisty3DCanvas,
//   TwistyPlayer,
// } from "../../../../../cubing/twisty";
// import { TAU } from "../../../../../cubing/twisty/views/3D/TAU";
// import type { TimeRange } from "../../../../../cubing/twisty/old/animation/cursor/AlgCursor";
// import type { MillisecondTimestamp } from "../../../../../cubing/twisty/old/animation/cursor/CursorTypes";
// import { smootherStep } from "../../../../../cubing/twisty/old/animation/easing";
// import { TimelineAction } from "../../../../../cubing/twisty/old/animation/Timeline";
// import { TwistyControlButton } from "../../../../../cubing/twisty/old/dom/controls/buttons";
// import { TwistyScrubber } from "../../../../../cubing/twisty/old/dom/controls/TwistyScrubber";
// import { experimentalSetDefaultStickerElevation } from "../../../../../cubing/twisty/views/3D/puzzles/Cube3D";
// import { Alg } from "../../../../../cubing/alg";
// import { JSZip } from "./jszip-wrapper";

// const checkeredBackground = new URL(
//   "./checkered-background.png",
//   import.meta.url,
// ).toString();

// experimentalSetDefaultStickerElevation(0.51);

// const FPS = 60;
// const MAX_QUALITY: boolean = false;
// const BLUR_FRAMES_PER_FRAME: number = 16;

// const SHORT_RECORDING_TEST = false;
// const SHORT_RECORDING_TEST_NUM_FRAMES = FPS * 1;

// if (MAX_QUALITY) {
//   document.body.classList.add("max-quality");
// }

// const twistyPlayer = new TwistyPlayer({
//   alg: Alg.fromString("(y y')6"),
//   controlPanel: "none",
//   hintFacelets: "none",
//   // experimentalStickering: "picture",
// });
// twistyPlayer.experimentalSetCursorIndexer("simultaneous");
// // twistyPlayer.timeline.tempoScale = 0.125;

// const sixth = 1 / 6;

// document.body.appendChild(twistyPlayer);

// // 0.1, 4.2, 7.3

// const cubeHeight = 0.5;
// const finalHeight = cubeHeight + 0.94 + 0.08;

// let lastFoundationOpacity = 1;

// const rawSVGStickerGap = (1 / 64) * 4;
// const svgStickerGap = (1 / 64) * 3;

// const initialStickerWidth = 0.85; // TODO;
// const finalStickerWidth = 1 - svgStickerGap;

// const cubeScaleFactor = 3;

// function clipEnd(timestamp: number, from: number, to: number): number {
//   return Math.min(1, (timestamp - from) / (to - from));
// }

// function clip(timestamp: number, from: number, to: number): number {
//   return Math.max(0, clipEnd(timestamp, from, to));
// }

// function interpolate(from: number, to: number, amount: number): number {
//   return from + (to - from) * amount;
// }

// const loader = new TextureLoader();

// setTimeout(async () => {
//   const twisty3DCanvas = twistyPlayer.viewerElems[0] as Twisty3DCanvas;

//   loader.load(checkeredBackground, (texture: Texture) => {
//     twistyPlayer.scene!.background = texture;
//   });

//   function setFoundationOpacity(opacity: number): void {
//     if (MAX_QUALITY) {
//       cube3D.experimentalSetFoundationOpacity(opacity);
//       return;
//     }

//     const roundedOpacity = Math.round(opacity * 100) / 100;
//     if (roundedOpacity !== lastFoundationOpacity) {
//       // console.log(roundedOpacity);
//       cube3D.experimentalSetFoundationOpacity(roundedOpacity);
//       lastFoundationOpacity = roundedOpacity;
//     }
//   }

//   async function onTimelineTimestampChange(
//     timestamp: MillisecondTimestamp,
//   ): Promise<void> {
//     // console.log({ timestamp });

//     let cam = new Vector3(
//       sixth, //
//       finalHeight, //
//       sixth, //
//     );
//     let lookAt = new Vector3(
//       sixth, //
//       cubeHeight, //
//       sixth, //
//     );

//     const zoomStart = 1500;
//     const zoomEnd = 2810 - 200;
//     const stickerWidthStart = zoomStart;
//     const stickerWidthEnd = zoomEnd;

//     const rotateStart = 849;
//     const rotateEnd = 4310 - 200 - 200;

//     const textStart = 2510;
//     const textEnd = 4310;

//     const lineStart = 3510 - 300 - 200 + 200 + 600 - 1200;
//     const lineEnd = 5060 - 200 + 200 - 200;

//     const greenStart = lineEnd - 2000;
//     const greenEnd = lineEnd - 1000;

//     const transitionStart = 4865;
//     const transitionEnd = 4982;

//     let stickerWidth = initialStickerWidth;
//     {
//       const smoothFrac = smootherStep(
//         clip(timestamp, stickerWidthStart, stickerWidthEnd),
//       );
//       stickerWidth = interpolate(
//         initialStickerWidth,
//         finalStickerWidth,
//         smoothFrac,
//       );
//     }
//     let cube3DCenterStickerWidth = stickerWidth;
//     if (timestamp > lineStart) {
//       cube3DCenterStickerWidth = 2 + stickerWidth;
//     }
//     // console.log({ stickerWidth, cube3DCenterStickerWidth });
//     cube3D.experimentalSetStickerWidth(stickerWidth);
//     cube3D.experimentalSetCenterStickerWidth(cube3DCenterStickerWidth);

//     {
//       const smoothFrac = clip(timestamp, zoomStart, stickerWidthEnd);
//       // const quadFrac = frac * frac;
//       setFoundationOpacity(interpolate(0.3, 1, smoothFrac));
//     }

//     {
//       const fracSmooth =
//         clip(timestamp, textStart, textEnd) -
//         0 * clip(timestamp, transitionStart, transitionEnd);
//       const textScale = 1 - (1 - fracSmooth) * (1 - fracSmooth);
//       // console.log({ textScale });
//       (await svgMeshes.tw).setRelativeScale(textScale, stickerWidth);
//       (await svgMeshes.zz).setRelativeScale(textScale, stickerWidth);
//       (await svgMeshes.e).setRelativeScale(textScale, stickerWidth);
//     }

//     {
//       if (timestamp >= lineStart - 10) {
//         greenGroup.visible = true;
//       } else {
//         greenGroup.visible = false;
//       }

//       const frac =
//         1 -
//         clip(timestamp, lineStart, lineEnd) +
//         clip(timestamp, transitionStart, transitionEnd);
//       const startBurstPortion = 0.2;
//       const startBurst =
//         (1 / startBurstPortion) * Math.max(frac - 1 + startBurstPortion, 0);
//       const fracSmooth = 0.7 * frac * frac + 0.3 * startBurst * startBurst;

//       // const smoothFrac = smootherStep(clip(timestamp, zoomStart, lineStart));
//       setSVGGreenFrac(
//         clip(timestamp, greenStart, greenEnd) -
//           clip(timestamp, transitionStart, transitionEnd),
//       );

//       const vert = fracSmooth * 0.45;
//       const antiVert = fracSmooth * 0.02;
//       for (let i = 0; i < svgMeshes.i.length; i++) {
//         (await svgMeshes.i[i]).translate(
//           0,
//           -((vert * i) / (svgMeshes.i.length - 1) - antiVert),
//         );
//       }

//       for (let i = 0; i < svgMeshes.l.length; i++) {
//         (await svgMeshes.l[i]).translate(
//           0,
//           (vert * i) / (svgMeshes.l.length - 1) - antiVert,
//         );
//       }

//       // const xScale =
//       //   1 - smootherStep(clip(timestamp, transitionStart, transitionEnd));
//       const horiz = fracSmooth * 0.85;
//       // if (timestamp > transitionStart) {
//       //   horiz = 0;
//       // }
//       for (let i = 0; i < svgMeshes.line.length; i++) {
//         const perSide = (svgMeshes.line.length - 1) / 2;
//         // (await svgMeshes.line[i]).setXScale(xScale);
//         (await svgMeshes.line[i]).translate(
//           (horiz * (i - perSide)) / perSide + 0.195 * horiz,
//           0,
//         );
//       }
//     }
//     {
//       // const frac = clip(timestamp, zoomStart, zoomEnd);
//       const fracSmooth = smootherStep(clip(timestamp, zoomStart, zoomEnd));

//       cam = new Vector3(
//         sixth, //
//         finalHeight + (1 - fracSmooth * fracSmooth) * 2, //
//         sixth + (1 - fracSmooth) * 4, //
//       );

//       lookAt = new Vector3(
//         sixth * smootherStep(fracSmooth), //
//         cubeHeight * fracSmooth, //
//         sixth * fracSmooth, //
//       );

//       twistyPlayer.twisty3D?.setRotationFromAxisAngle(new Vector3(0, 1, 0), 0);
//       twistyPlayer.twisty3D?.position.set(0, 0, 0);

//       twistyPlayer.twisty3D?.translateX(sixth * fracSmooth);
//       twistyPlayer.twisty3D?.translateZ(sixth * fracSmooth);

//       const openFrac =
//         (0.8 + 0.3 * clip(timestamp, rotateStart - 200, rotateStart + 200)) *
//           clip(timestamp, rotateStart, rotateEnd) +
//         0.3 *
//           1 *
//           clip(timestamp, 0, rotateEnd) *
//           (1 - clip(timestamp, rotateStart, rotateEnd));
//       let angle =
//         openFrac > 1 / 2
//           ? Math.pow((1 - openFrac) * 2, 4)
//           : 8 * (1 - openFrac) - 3; // TODO: spin so that faces pass with the same frequency as to the beat
//       // console.log(openFrac);
//       if (openFrac < -1) {
//         angle = -5;
//       }
//       twistyPlayer.twisty3D?.rotateOnWorldAxis(
//         new Vector3(0, 1, 0),
//         -angle * 1.4057, // Adjusted to start with a symmetric cube view.
//       );
//       twistyPlayer.twisty3D?.translateX(-sixth * fracSmooth);
//       twistyPlayer.twisty3D?.translateZ(-sixth * fracSmooth);

//       twisty3DCanvas.camera.position.set(cam.x, cam.y, cam.z);
//       twisty3DCanvas.camera.lookAt(lookAt);
//     }

//     twisty3DCanvas.scheduleRender();
//   }

//   twistyPlayer.timeline.addTimestampListener({
//     onTimelineTimestampChange,
//     onTimeRangeChange: (_timeRange: TimeRange): void => {
//       // console.log({ timeRange });
//     },
//   });

//   const audioElem = document.querySelector("audio");

//   twistyPlayer.timeline.addActionListener({
//     onTimelineAction: (actionEvent: TimelineActionEvent): void => {
//       if (actionEvent.action === TimelineAction.Jumping) {
//         audioElem!.currentTime = twistyPlayer.timeline.timestamp / 1000;
//       }
//       if (actionEvent.action === TimelineAction.StartingToPlay) {
//         audioElem!.currentTime = twistyPlayer.timeline.timestamp / 1000;
//         // console.log(audioElem!.currentTime);
//         audioElem?.play();
//       }
//       if (actionEvent.action === TimelineAction.Pausing) {
//         audioElem?.pause();
//       }
//       // console.log(actionEvent);
//     },
//   });

//   const twistyScrubber = new TwistyScrubber(twistyPlayer.timeline);
//   document.body.appendChild(twistyScrubber);

//   document.body.appendChild(
//     new TwistyControlButton(twistyPlayer.timeline, "play-pause"),
//   );

//   const cube3D = twistyPlayer.twisty3D! as Cube3D;
//   cube3D.experimentalSetStickerWidth(initialStickerWidth);
//   const greenGroup = new Group();
//   cube3D.add(greenGroup);
//   const textGroup = new Group();
//   cube3D.add(textGroup);

//   const svgLoader = new SVGLoader();
//   // console.log(svgLoader);
//   async function loadSVG(
//     parentGroup: Group,
//     svgSrc: string,
//     offsetX: number,
//     offsetY: number,
//   ) {
//     // const data: SVGResult = await new Promise((resolve, _reject) => {
//     //   svgLoader.load(svgSrc, resolve);
//     // });
//     const data: SVGResult = svgLoader.parse(svgSrc);
//     const paths = data.paths;
//     const group = new Group();
//     group.scale.setScalar(1 / 1024);
//     // group.scale.multiplyScalar(3);
//     group.rotateX(TAU / 4);
//     // console.log(offsetX * cube3DstickerGapWidth);
//     group.translateX(-1);
//     group.translateY(-1);

//     const materials: {
//       originalColor: Color;
//       material: MeshBasicMaterial;
//     }[] = [];

//     for (let i = 0; i < paths.length; i++) {
//       const path = paths[i];

//       const color: Color = (path as any).color;
//       const material = new MeshBasicMaterial({
//         color,
//         side: DoubleSide,
//         depthWrite: false,
//       });
//       materials.push({ originalColor: color, material });

//       const shapes = path.toShapes(true);

//       for (let j = 0; j < shapes.length; j++) {
//         const shape = shapes[j];
//         const geometry = new ShapeBufferGeometry(shape);
//         const mesh = new Mesh(geometry, material);

//         group.add(mesh);
//       }
//     }
//     const initialStickerGap = 1 - initialStickerWidth;

//     const group2 = new Group();
//     group2.add(group);
//     group2.scale.setScalar(svgStickerGap / rawSVGStickerGap);

//     const group3 = new Group();
//     group3.add(group2);
//     // console.log((offsetX * cube3DstickerGapWidth) / 2);
//     const offsetFactor = initialStickerGap / 2;
//     group3.position.x = -offsetX * offsetFactor;
//     group3.position.z = -offsetY * offsetFactor;

//     // group3.scale.setScalar(4);

//     const group4 = new Group();
//     group4.add(group3);

//     const group5 = new Group();
//     group5.translateX(sixth * cubeScaleFactor + offsetX * offsetFactor);
//     group5.translateZ(sixth * cubeScaleFactor + offsetY * offsetFactor);
//     group5.translateY(0.51 * cubeScaleFactor);
//     group5.add(group4);

//     parentGroup.add(group5);

//     twisty3DCanvas.scheduleRender();

//     return {
//       setSVGGreenFrac: (frac: number) => {
//         for (const part of materials) {
//           part.material.color.copy(
//             part.originalColor
//               .clone()
//               .convertGammaToLinear()
//               .multiplyScalar(frac)
//               .convertLinearToGamma(),
//           );
//         }
//       },
//       setXScale: (scale: number) => {
//         console.log(scale);
//         group3.scale.x = scale;
//       },
//       setSVGBlueOpacity: (opacity: number) => {
//         for (const part of materials) {
//           part.material.color.copy(
//             part.originalColor
//               .clone()
//               .convertGammaToLinear()
//               .lerp(new Color(1, 1, 1), opacity)
//               .convertLinearToGamma(),
//           );
//         }
//       },
//       setRelativeScale: (scale: number, stickerWidth: number) => {
//         const offsetFactor = (1 - stickerWidth) / 2;
//         group3.position.x = -offsetX * offsetFactor;
//         group3.position.z = -offsetY * offsetFactor;
//         group4.scale.setScalar(scale);
//         group5.position.x = sixth * cubeScaleFactor + offsetX * offsetFactor;
//         group5.position.z = sixth * cubeScaleFactor + offsetY * offsetFactor;
//       },
//       translate: (x: number, z: number) => {
//         group4.position.set(x, 0, z);
//       },
//     };
//   }

//   // function svgURL(s: keyof typeof svgFiles): string {
//   //   return URL.createObjectURL(new Blob([svgFiles[s], "text/svg"]));
//   // }

//   const svgTw = svgFiles["tw.svg"];
//   const svgZz = svgFiles["zz.svg"];
//   const svgE = svgFiles["e.svg"];
//   const svgIStem = svgFiles["i-stem.svg"];
//   const svgI = svgFiles["i.svg"];
//   const svgLStem = svgFiles["l-stem.svg"];
//   const svgL = svgFiles["l.svg"];
//   const svgLine = svgFiles["line.svg"];

//   const svgMeshes = {
//     tw: loadSVG(textGroup, svgTw, -1, -1),
//     zz: loadSVG(textGroup, svgZz, -1, 1),
//     e: loadSVG(textGroup, svgE, 1, 1),
//     i: [
//       loadSVG(greenGroup, svgIStem, 0, 0),
//       loadSVG(greenGroup, svgIStem, 0, 0),
//       loadSVG(greenGroup, svgIStem, 0, 0),
//       loadSVG(greenGroup, svgIStem, 0, 0),
//       loadSVG(greenGroup, svgIStem, 0, 0),
//       loadSVG(greenGroup, svgIStem, 0, 0),
//       loadSVG(greenGroup, svgIStem, 0, 0),
//       loadSVG(greenGroup, svgIStem, 0, 0),
//       loadSVG(greenGroup, svgI, 0, 0),
//     ],
//     l: [
//       loadSVG(greenGroup, svgLStem, 0, 0),
//       loadSVG(greenGroup, svgLStem, 0, 0),
//       loadSVG(greenGroup, svgLStem, 0, 0),
//       loadSVG(greenGroup, svgLStem, 0, 0),
//       loadSVG(greenGroup, svgLStem, 0, 0),
//       loadSVG(greenGroup, svgLStem, 0, 0),
//       loadSVG(greenGroup, svgLStem, 0, 0),
//       loadSVG(greenGroup, svgLStem, 0, 0),
//       loadSVG(greenGroup, svgL, 0, 0),
//     ],
//     line: [
//       loadSVG(greenGroup, svgLine, 0, 0),
//       loadSVG(greenGroup, svgLine, 0, 0),
//       loadSVG(greenGroup, svgLine, 0, 0),
//       loadSVG(greenGroup, svgLine, 0, 0),
//       loadSVG(greenGroup, svgLine, 0, 0),
//       loadSVG(greenGroup, svgLine, 0, 0),
//       loadSVG(greenGroup, svgLine, 0, 0),
//       loadSVG(greenGroup, svgLine, 0, 0),
//       loadSVG(greenGroup, svgLine, 0, 0),
//     ],
//   };

//   async function setSVGGreenFrac(frac: number) {
//     for (const parts of [svgMeshes.i, svgMeshes.l, svgMeshes.line]) {
//       for (const part of parts) {
//         (await part).setSVGGreenFrac(frac);
//       }
//     }
//   }

//   // async function setSVGBlueOpacity(opacity: number) {
//   //   for (const part of [svgMeshes.tw, svgMeshes.zz, svgMeshes.e]) {
//   //     (await part).setSVGBlueOpacity(opacity);
//   //   }
//   // }

//   twistyPlayer.timeline.jumpToStart();
//   onTimelineTimestampChange(0);

//   // const frame = 0;
//   const recordButton = document.body.appendChild(
//     document.createElement("button"),
//   );
//   recordButton.textContent = "Record";
//   recordButton.addEventListener("click", async () => {
//     const zip = new JSZip();
//     let frameNumber = 0;
//     function nextFrame() {
//       twisty3DCanvas.experimentalSetOnRenderFinish(null);
//       // console.log(frameNumber);
//       const url = twisty3DCanvas.renderToDataURL();

//       // if (frameNumber > 0) {
//       const mainFrameNumber = Math.floor(frameNumber / BLUR_FRAMES_PER_FRAME);
//       const subFrameNumber = frameNumber % BLUR_FRAMES_PER_FRAME;
//       const mainFrameNumberPadded = mainFrameNumber.toString().padStart(4, "0");
//       const subFrameNumberPadded = subFrameNumber.toString().padStart(2, "0");
//       const frameName = `frame-${mainFrameNumberPadded}-${subFrameNumberPadded}`;
//       console.log(frameName);
//       zip.file(`${frameName}.png`, url.slice("data:image/png;base64,".length), {
//         base64: true,
//       });
//       // }

//       frameNumber++;
//       const timestamp = (frameNumber * 1000) / FPS / BLUR_FRAMES_PER_FRAME;
//       // console.log(timestamp);
//       if (
//         timestamp <= twistyPlayer.timeline.timeRange().end &&
//         !(
//           SHORT_RECORDING_TEST &&
//           frameNumber > SHORT_RECORDING_TEST_NUM_FRAMES * BLUR_FRAMES_PER_FRAME
//         )
//       ) {
//         twisty3DCanvas.experimentalSetOnRenderFinish(nextFrame);
//         twistyPlayer.timeline.setTimestamp(timestamp);
//       } else {
//         const filename = `${Date.now()}.zip`;
//         console.log("generating zip!", filename);
//         zip.generateAsync({ type: "blob" }).then(function (blob: Blob) {
//           const url = URL.createObjectURL(blob);
//           const a = document.createElement("a");
//           a.href = url;
//           a.download = filename;
//           a.click();
//         }, console.log);
//         console.log("zip download initiated!", filename);
//         // ffmpeg -r 60 -f image2 -i frame-%, 03d.png -i ZOOM413-accompaniment-take-1a-reverb-end-transferred-bass-shorter-by-3350ms.mp3 -pix_fmt yuv420p out.mp4
//       }
//     }
//     twisty3DCanvas.experimentalSetOnRenderFinish(nextFrame);
//     // twistyPlayer.timeline.setTimestamp(100);
//     setTimeout(() => {
//       twistyPlayer.timeline.setTimestamp(0);
//       twistyPlayer.timeline.setTimestamp(0.1);
//     }, 100);
//   });
//   setTimeout(() => {
//     twisty3DCanvas.scheduleRender();
//   }, 50);
//   setTimeout(() => {
//     twisty3DCanvas.scheduleRender();
//   }, 250);
//   setTimeout(() => {
//     twisty3DCanvas.scheduleRender();
//   }, 1000);
// }, 10);
