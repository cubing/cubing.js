var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};
var __exportStar = (target, module, desc) => {
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module) => {
  return __exportStar(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? {get: () => module.default, enumerable: true} : {value: module, enumerable: true})), module);
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// src/vendor/node_modules/three/examples/jsm/libs/stats.module.js
var require_stats_module = __commonJS((exports, module) => {
  var Stats2 = function() {
    var mode = 0;
    var container = document.createElement("div");
    container.style.cssText = "position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";
    container.addEventListener("click", function(event) {
      event.preventDefault();
      showPanel(++mode % container.children.length);
    }, false);
    function addPanel(panel) {
      container.appendChild(panel.dom);
      return panel;
    }
    function showPanel(id) {
      for (var i = 0; i < container.children.length; i++) {
        container.children[i].style.display = i === id ? "block" : "none";
      }
      mode = id;
    }
    var beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;
    var fpsPanel = addPanel(new Stats2.Panel("FPS", "#0ff", "#002"));
    var msPanel = addPanel(new Stats2.Panel("MS", "#0f0", "#020"));
    if (self.performance && self.performance.memory) {
      var memPanel = addPanel(new Stats2.Panel("MB", "#f08", "#201"));
    }
    showPanel(0);
    return {
      REVISION: 16,
      dom: container,
      addPanel,
      showPanel,
      begin: function() {
        beginTime = (performance || Date).now();
      },
      end: function() {
        frames++;
        var time = (performance || Date).now();
        msPanel.update(time - beginTime, 200);
        if (time >= prevTime + 1e3) {
          fpsPanel.update(frames * 1e3 / (time - prevTime), 100);
          prevTime = time;
          frames = 0;
          if (memPanel) {
            var memory = performance.memory;
            memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
          }
        }
        return time;
      },
      update: function() {
        beginTime = this.end();
      },
      domElement: container,
      setMode: showPanel
    };
  };
  Stats2.Panel = function(name, fg, bg) {
    var min = Infinity, max = 0, round = Math.round;
    var PR = round(window.devicePixelRatio || 1);
    var WIDTH = 80 * PR, HEIGHT = 48 * PR, TEXT_X = 3 * PR, TEXT_Y = 2 * PR, GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR, GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;
    var canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = "width:80px;height:48px";
    var context = canvas.getContext("2d");
    context.font = "bold " + 9 * PR + "px Helvetica,Arial,sans-serif";
    context.textBaseline = "top";
    context.fillStyle = bg;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = fg;
    context.fillText(name, TEXT_X, TEXT_Y);
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    return {
      dom: canvas,
      update: function(value, maxValue) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        context.fillStyle = bg;
        context.globalAlpha = 1;
        context.fillRect(0, 0, WIDTH, GRAPH_Y);
        context.fillStyle = fg;
        context.fillText(round(value) + " " + name + " (" + round(min) + "-" + round(max) + ")", TEXT_X, TEXT_Y);
        context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);
        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
        context.fillStyle = bg;
        context.globalAlpha = 0.9;
        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - value / maxValue) * GRAPH_HEIGHT));
      }
    };
  };
  module.exports = Stats2;
});

// src/cubing/twisty/dom/viewers/Twisty3DCanvas.ts
import {PerspectiveCamera, Vector3 as Vector32, WebGLRenderer} from "three";

// src/cubing/twisty/animation/RenderScheduler.ts
var RenderScheduler = class {
  constructor(callback) {
    this.callback = callback;
    this.animFrameID = null;
    this.animFrame = this.animFrameWrapper.bind(this);
  }
  requestAnimFrame() {
    if (!this.animFrameID) {
      this.animFrameID = requestAnimationFrame(this.animFrame);
    }
  }
  cancelAnimFrame() {
    if (this.animFrameID) {
      cancelAnimationFrame(this.animFrameID);
      this.animFrameID = 0;
    }
  }
  animFrameWrapper(timestamp) {
    this.animFrameID = 0;
    this.callback(timestamp);
  }
};

// src/cubing/twisty/dom/element/node-custom-element-shims.ts
var HTMLElementStub = class {
};
var HTMLElementShim;
if (typeof HTMLElement !== "undefined") {
  HTMLElementShim = HTMLElement;
} else {
  HTMLElementShim = HTMLElementStub;
}
var CustomElementsStub = class {
  define() {
  }
};
var customElementsShim;
if (typeof customElements !== "undefined") {
  customElementsShim = customElements;
} else {
  customElementsShim = new CustomElementsStub();
}

// src/cubing/twisty/dom/element/ManagedCustomElement.ts
var CSSSource = class {
  constructor(sourceText) {
    this.sourceText = sourceText;
  }
  getAsString() {
    return this.sourceText;
  }
};
var ManagedCustomElement = class extends HTMLElementShim {
  constructor(options) {
    super();
    this.cssSourceMap = new Map();
    this.shadow = this.attachShadow({mode: options?.mode ?? "closed"});
    this.contentWrapper = document.createElement("div");
    this.contentWrapper.classList.add("wrapper");
    this.shadow.appendChild(this.contentWrapper);
  }
  addCSS(cssSource) {
    if (this.cssSourceMap.get(cssSource)) {
      return;
    }
    const cssElem = document.createElement("style");
    cssElem.textContent = cssSource.getAsString();
    this.cssSourceMap.set(cssSource, cssElem);
    this.shadow.appendChild(cssElem);
  }
  removeCSS(cssSource) {
    const cssElem = this.cssSourceMap.get(cssSource);
    if (!cssElem) {
      return;
    }
    this.shadow.removeChild(cssElem);
    this.cssSourceMap.delete(cssSource);
  }
  addElement(element) {
    return this.contentWrapper.appendChild(element);
  }
  prependElement(element) {
    this.contentWrapper.prepend(element);
  }
  removeElement(element) {
    return this.contentWrapper.removeChild(element);
  }
};
customElementsShim.define("twisty-managed-custom-element", ManagedCustomElement);

// src/cubing/twisty/dom/viewers/canvas.ts
function pixelRatio() {
  return devicePixelRatio || 1;
}

// src/cubing/twisty/dom/viewers/Twisty3DCanvas.css.ts
var twisty3DCanvasCSS = new CSSSource(`
:host {
  width: 384px;
  height: 256px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
}

/* TODO: This is due to stats hack. Replace with \`canvas\`. */
.wrapper > canvas {
  max-width: 100%;
  max-height: 100%;
}

.wrapper.invisible {
  opacity: 0;
}
`);

// src/cubing/twisty/dom/viewers/TwistyOrbitControls.ts
import {Spherical, Vector3} from "three";
var EPSILON = 1e-8;
var INERTIA_DEFAULT = true;
var LATITUDE_LIMITS_DEFAULT = true;
var INERTIA_DURATION_MS = 500;
var INERTIA_TIMEOUT_MS = 50;
var VERTICAL_MOVEMENT_BASE_SCALE = 0.75;
function momentumScale(progress) {
  return (Math.exp(1 - progress) - (1 - progress)) / (1 - Math.E) + 1;
}
var Inertia = class {
  constructor(startTimestamp, momentumX, momentumY, callback) {
    this.startTimestamp = startTimestamp;
    this.momentumX = momentumX;
    this.momentumY = momentumY;
    this.callback = callback;
    this.scheduler = new RenderScheduler(this.render.bind(this));
    this.scheduler.requestAnimFrame();
    this.lastTimestamp = startTimestamp;
  }
  render(now) {
    const progressBefore = (this.lastTimestamp - this.startTimestamp) / INERTIA_DURATION_MS;
    const progressAfter = Math.min(1, (now - this.startTimestamp) / INERTIA_DURATION_MS);
    if (progressBefore === 0 && progressAfter > INERTIA_TIMEOUT_MS / INERTIA_DURATION_MS) {
      return;
    }
    const delta = momentumScale(progressAfter) - momentumScale(progressBefore);
    this.callback(this.momentumX * delta * 1e3, this.momentumY * delta * 1e3);
    if (progressAfter < 1) {
      this.scheduler.requestAnimFrame();
    }
    this.lastTimestamp = now;
  }
};
var TwistyOrbitControls = class {
  constructor(camera, canvas, scheduleRender) {
    this.camera = camera;
    this.canvas = canvas;
    this.scheduleRender = scheduleRender;
    this.experimentalInertia = INERTIA_DEFAULT;
    this.experimentalLatitudeLimits = LATITUDE_LIMITS_DEFAULT;
    this.lastTouchClientX = 0;
    this.lastTouchClientY = 0;
    this.currentTouchID = null;
    this.onMoveBound = this.onMove.bind(this);
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onMouseEndBound = this.onMouseEnd.bind(this);
    this.onTouchMoveBound = this.onTouchMove.bind(this);
    this.onTouchEndBound = this.onTouchEnd.bind(this);
    this.tempSpherical = new Spherical();
    this.lastTouchTimestamp = 0;
    this.lastTouchMoveMomentumX = 0;
    this.lastTouchMoveMomentumY = 0;
    this.lastMouseTimestamp = 0;
    this.lastMouseMoveMomentumX = 0;
    this.lastMouseMoveMomentumY = 0;
    this.experimentalHasBeenMoved = false;
    canvas.addEventListener("mousedown", this.onMouseStart.bind(this));
    canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
  }
  temperMovement(f) {
    return Math.sign(f) * Math.log(Math.abs(f * 10) + 1) / 6;
  }
  onMouseStart(e) {
    window.addEventListener("mousemove", this.onMouseMoveBound);
    window.addEventListener("mouseup", this.onMouseEndBound);
    this.onStart(e);
    this.lastMouseTimestamp = e.timeStamp;
  }
  onMouseMove(e) {
    if (e.buttons === 0) {
      this.onMouseEnd(e);
      return;
    }
    const minDim = Math.min(this.canvas.offsetWidth, this.canvas.offsetHeight);
    const movementX = this.temperMovement(e.movementX / minDim);
    const movementY = this.temperMovement(e.movementY / minDim * VERTICAL_MOVEMENT_BASE_SCALE);
    this.onMove(movementX, movementY);
    this.lastMouseMoveMomentumX = movementX / (e.timeStamp - this.lastMouseTimestamp);
    this.lastMouseMoveMomentumY = movementY / (e.timeStamp - this.lastMouseTimestamp);
    this.lastMouseTimestamp = e.timeStamp;
  }
  onMouseEnd(e) {
    window.removeEventListener("mousemove", this.onMouseMoveBound);
    window.removeEventListener("mouseup", this.onMouseEndBound);
    this.onEnd(e);
    if (this.experimentalInertia) {
      new Inertia(this.lastMouseTimestamp, this.lastMouseMoveMomentumX, this.lastMouseMoveMomentumY, this.onMoveBound);
    }
  }
  onTouchStart(e) {
    if (this.currentTouchID === null) {
      this.currentTouchID = e.changedTouches[0].identifier;
      this.lastTouchClientX = e.touches[0].clientX;
      this.lastTouchClientY = e.touches[0].clientY;
      window.addEventListener("touchmove", this.onTouchMoveBound);
      window.addEventListener("touchend", this.onTouchEndBound);
      window.addEventListener("touchcanel", this.onTouchEndBound);
      this.onStart(e);
      this.lastTouchTimestamp = e.timeStamp;
    }
  }
  onTouchMove(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.currentTouchID) {
        const minDim = Math.min(this.canvas.offsetWidth, this.canvas.offsetHeight);
        const movementX = this.temperMovement((touch.clientX - this.lastTouchClientX) / minDim);
        const movementY = this.temperMovement((touch.clientY - this.lastTouchClientY) / minDim * VERTICAL_MOVEMENT_BASE_SCALE);
        this.onMove(movementX, movementY);
        this.lastTouchClientX = touch.clientX;
        this.lastTouchClientY = touch.clientY;
        this.lastTouchMoveMomentumX = movementX / (e.timeStamp - this.lastTouchTimestamp);
        this.lastTouchMoveMomentumY = movementY / (e.timeStamp - this.lastTouchTimestamp);
        this.lastTouchTimestamp = e.timeStamp;
      }
    }
  }
  onTouchEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.currentTouchID) {
        this.currentTouchID = null;
        window.removeEventListener("touchmove", this.onTouchMoveBound);
        window.removeEventListener("touchend", this.onTouchEndBound);
        window.removeEventListener("touchcancel", this.onTouchEndBound);
        this.onEnd(e);
      }
    }
    if (this.experimentalInertia) {
      new Inertia(this.lastTouchTimestamp, this.lastTouchMoveMomentumX, this.lastTouchMoveMomentumY, this.onMoveBound);
    }
  }
  onStart(e) {
    e.preventDefault();
  }
  onMove(movementX, movementY) {
    this.tempSpherical.setFromVector3(this.camera.position);
    this.tempSpherical.theta += -2 * movementX;
    this.tempSpherical.phi += -2 * movementY;
    if (this.experimentalLatitudeLimits) {
      this.tempSpherical.phi = Math.max(this.tempSpherical.phi, Math.PI * 0.3);
      this.tempSpherical.phi = Math.min(this.tempSpherical.phi, Math.PI * 0.7);
    } else {
      this.tempSpherical.phi = Math.max(this.tempSpherical.phi, EPSILON);
      this.tempSpherical.phi = Math.min(this.tempSpherical.phi, Math.PI - EPSILON);
    }
    this.camera.position.setFromSpherical(this.tempSpherical);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.experimentalHasBeenMoved = true;
    this.scheduleRender();
    this.mirrorControls?.updateMirroredCamera(this.camera);
  }
  onEnd(e) {
    e.preventDefault();
  }
  setMirror(m) {
    this.mirrorControls = m;
  }
  updateMirroredCamera(c) {
    this.camera.position.copy(c.position);
    this.camera.position.multiplyScalar(-1);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.scheduleRender();
  }
};

// src/cubing/twisty/dom/viewers/Twisty3DCanvas.ts
var import_stats = __toModule(require_stats_module());
var SHOW_STATS = false;
function experimentalShowRenderStats(show) {
  SHOW_STATS = show;
}
var resizeObserverWarningShown = false;
var shareAllNewRenderers = false;
function experimentalSetShareAllNewRenderers(share) {
  shareAllNewRenderers = share;
}
var sharedRenderer = null;
function newRenderer() {
  return new WebGLRenderer({
    antialias: true,
    alpha: true
  });
}
function newSharedRenderer() {
  return sharedRenderer ?? (sharedRenderer = newRenderer());
}
var _invisible, _onRenderFinish;
var Twisty3DCanvas = class extends ManagedCustomElement {
  constructor(scene, options = {}) {
    super();
    this.legacyExperimentalShift = 0;
    this.scheduler = new RenderScheduler(this.render.bind(this));
    this.resizePending = false;
    this.stats = null;
    _invisible.set(this, false);
    _onRenderFinish.set(this, null);
    this.addCSS(twisty3DCanvasCSS);
    this.scene = scene;
    this.scene?.addRenderTarget(this);
    if (SHOW_STATS) {
      this.stats = (0, import_stats.default)();
      this.stats.dom.style.position = "absolute";
      this.addElement(this.stats.dom);
    }
    this.rendererIsShared = shareAllNewRenderers;
    this.renderer = this.rendererIsShared ? newSharedRenderer() : newRenderer();
    this.canvas = this.rendererIsShared ? document.createElement("canvas") : this.renderer.domElement;
    this.canvas2DContext = this.canvas.getContext("2d");
    this.addElement(this.canvas);
    this.camera = new PerspectiveCamera(20, 1, 0.1, 20);
    this.camera.position.copy(options.experimentalCameraPosition ?? new Vector32(2, 4, 4));
    if (options.negateCameraPosition) {
      this.camera.position.multiplyScalar(-1);
    }
    this.camera.lookAt(new Vector32(0, 0, 0));
    this.orbitControls = new TwistyOrbitControls(this.camera, this.canvas, this.scheduleRender.bind(this));
    if (window.ResizeObserver) {
      const observer = new window.ResizeObserver(this.onResize.bind(this));
      observer.observe(this.contentWrapper);
    } else {
      this.scheduleRender();
      if (!resizeObserverWarningShown) {
        console.warn("You are using an older browser that does not support `ResizeObserver`. Displayed puzzles will not be rescaled.");
        resizeObserverWarningShown = true;
      }
    }
  }
  setMirror(partner) {
    this.orbitControls.setMirror(partner.orbitControls);
    partner.orbitControls.setMirror(this.orbitControls);
  }
  experimentalSetLatitudeLimits(limits) {
    this.orbitControls.experimentalLatitudeLimits = limits;
  }
  connectedCallback() {
    this.resize();
    this.render();
  }
  scheduleRender() {
    this.scheduler.requestAnimFrame();
  }
  makeInvisibleUntilRender() {
    this.contentWrapper.classList.add("invisible");
    __privateSet(this, _invisible, true);
  }
  experimentalSetOnRenderFinish(f) {
    __privateSet(this, _onRenderFinish, f);
  }
  render() {
    this.stats?.begin();
    this.scheduler.cancelAnimFrame();
    if (this.resizePending) {
      this.resize();
    }
    if (this.rendererIsShared) {
      this.renderer.setSize(this.canvas.width, this.canvas.height, false);
      this.canvas2DContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.scene) {
      this.renderer.render(this.scene, this.camera);
    }
    if (this.rendererIsShared) {
      this.canvas2DContext.drawImage(this.renderer.domElement, 0, 0);
    }
    if (__privateGet(this, _invisible)) {
      this.contentWrapper.classList.remove("invisible");
    }
    this.stats?.end();
    if (__privateGet(this, _onRenderFinish)) {
      __privateGet(this, _onRenderFinish).call(this);
    }
  }
  onResize() {
    this.resizePending = true;
    this.scheduleRender();
  }
  resize() {
    this.resizePending = false;
    const w = this.contentWrapper.clientWidth;
    const h = this.contentWrapper.clientHeight;
    let off = 0;
    if (this.legacyExperimentalShift > 0) {
      off = Math.max(0, Math.floor((w - h) * 0.5));
    } else if (this.legacyExperimentalShift < 0) {
      off = -Math.max(0, Math.floor((w - h) * 0.5));
    }
    let yoff = 0;
    let excess = 0;
    if (h > w) {
      excess = h - w;
      yoff = -Math.floor(0.5 * excess);
    }
    this.camera.aspect = w / h;
    this.camera.setViewOffset(w, h - excess, off, yoff, w, h);
    this.camera.updateProjectionMatrix();
    if (this.rendererIsShared) {
      this.canvas.width = w * pixelRatio();
      this.canvas.height = h * pixelRatio();
      this.canvas.style.width = w.toString();
      this.canvas.style.height = w.toString();
    } else {
      this.renderer.setPixelRatio(pixelRatio());
      this.renderer.setSize(w, h, true);
    }
    this.scheduleRender();
  }
  renderToDataURL(options = {}) {
    this.render();
    if (!options.squareCrop || this.canvas.width === this.canvas.height) {
      return this.canvas.toDataURL();
    } else {
      const tempCanvas = document.createElement("canvas");
      const squareSize = Math.min(this.canvas.width, this.canvas.height);
      tempCanvas.width = squareSize;
      tempCanvas.height = squareSize;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(this.canvas, -(this.canvas.width - squareSize) / 2, -(this.canvas.height - squareSize) / 2);
      return tempCanvas.toDataURL();
    }
  }
};
_invisible = new WeakMap();
_onRenderFinish = new WeakMap();
customElementsShim.define("twisty-3d-canvas", Twisty3DCanvas);

// src/cubing/twisty/dom/TwistyPlayer.ts
import {Vector3 as Vector37} from "three";
import {Alg as Alg8, Move as Move7} from "cubing/alg";
import {experimentalAppendMove} from "cubing/alg";
import {puzzles as puzzles3} from "cubing/puzzles";

// src/cubing/twisty/3D/puzzles/Cube3D.ts
import {
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Euler,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  TextureLoader,
  Vector2,
  Vector3 as Vector35
} from "three";
import {puzzles} from "cubing/puzzles";

// src/cubing/twisty/animation/easing.ts
function smootherStep(x) {
  return x * x * x * (10 - x * (15 - 6 * x));
}

// src/cubing/twisty/dom/TwistyPlayerConfig.ts
import {Vector3 as Vector34} from "three";

// src/cubing/twisty/dom/element/ElementConfig.ts
import {Vector3 as Vector33} from "three";
import {Alg} from "cubing/alg";
var AlgAttribute = class {
  constructor(initialValue) {
    if (initialValue) {
      if (typeof initialValue === "string") {
        this.setString(initialValue);
      } else {
        this.setValue(initialValue);
      }
    } else {
      this.setValue(this.defaultValue());
    }
  }
  setString(str) {
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = this.toValue(str);
    return true;
  }
  setValue(val) {
    const str = this.toString(val);
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = val;
    return true;
  }
  defaultValue() {
    return new Alg([]);
  }
  toValue(s) {
    return Alg.fromString(s);
  }
  toString(val) {
    return val.toString();
  }
};
var StringEnumAttribute = class {
  constructor(enumVal, initialValue) {
    this.enumVal = enumVal;
    this.setString(initialValue ?? this.defaultValue());
  }
  setString(str) {
    if (this.string === str) {
      return false;
    }
    if (!(str in this.enumVal)) {
      throw new Error(`Invalid string for attribute!: ${str}`);
    }
    this.string = str;
    this.value = this.toValue(str);
    return true;
  }
  setValue(val) {
    return this.setString(val);
  }
  defaultValue() {
    return Object.keys(this.enumVal)[0];
  }
  toValue(s) {
    return s;
  }
};
var _defaultValue;
var Vector3Attribute = class {
  constructor(defaultValue, initialValue) {
    _defaultValue.set(this, void 0);
    __privateSet(this, _defaultValue, defaultValue);
    this.setValue(initialValue ?? this.defaultValue());
  }
  setString(str) {
    return this.setValue(str === "" ? null : this.toValue(str));
  }
  setValue(val) {
    const str = this.toString(val);
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = val;
    return true;
  }
  defaultValue() {
    return __privateGet(this, _defaultValue);
  }
  toValue(s) {
    if (!s.startsWith("[")) {
      throw new Error("TODO");
    }
    if (!s.endsWith("]")) {
      throw new Error("TODO");
    }
    const coords = s.slice(1, s.length - 1).split(",");
    if (coords.length !== 3) {
      throw new Error("TODO");
    }
    const [x, y, z] = coords.map((c) => parseInt(c, 10));
    return new Vector33(x, y, z);
  }
  toString(v) {
    return v ? `[${v.x}, ${v.y}, ${v.z}]` : "";
  }
};
_defaultValue = new WeakMap();

// src/cubing/twisty/dom/element/ClassListManager.ts
var _currentClassName;
var ClassListManager = class {
  constructor(elem, prefix, validSuffixes) {
    this.elem = elem;
    this.prefix = prefix;
    this.validSuffixes = validSuffixes;
    _currentClassName.set(this, null);
  }
  clearValue() {
    if (__privateGet(this, _currentClassName)) {
      this.elem.contentWrapper.classList.remove(__privateGet(this, _currentClassName));
    }
    __privateSet(this, _currentClassName, null);
  }
  setValue(suffix) {
    if (!this.validSuffixes.includes(suffix)) {
      throw new Error(`Invalid suffix: ${suffix}`);
    }
    const newClassName = `${this.prefix}${suffix}`;
    const changed = __privateGet(this, _currentClassName) !== newClassName;
    if (changed) {
      this.clearValue();
      this.elem.contentWrapper.classList.add(newClassName);
      __privateSet(this, _currentClassName, newClassName);
    }
    return changed;
  }
};
_currentClassName = new WeakMap();

// src/cubing/twisty/dom/viewers/TwistyViewerWrapper.css.ts
var twistyViewerWrapperCSS = new CSSSource(`
:host {
  width: 384px;
  height: 256px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
}

.wrapper > * {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wrapper.back-view-side-by-side {
  grid-template-columns: 1fr 1fr;
}

.wrapper.back-view-top-right {
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr 3fr;
}

.wrapper.back-view-top-right > :nth-child(1) {
  grid-row: 1 / 3;
  grid-column: 1 / 3;
}

.wrapper.back-view-top-right > :nth-child(2) {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
}
`);

// src/cubing/twisty/dom/viewers/TwistyViewerWrapper.ts
var backViewLayouts = {
  none: true,
  "side-by-side": true,
  "top-right": true
};
var _backViewClassListManager;
var TwistyViewerWrapper = class extends ManagedCustomElement {
  constructor(config = {}) {
    super();
    _backViewClassListManager.set(this, new ClassListManager(this, "back-view-", ["none", "side-by-side", "top-right"]));
    this.addCSS(twistyViewerWrapperCSS);
    if (config.backView && config.backView in backViewLayouts) {
      __privateGet(this, _backViewClassListManager).setValue(config.backView);
    }
  }
  setBackView(backView) {
    return __privateGet(this, _backViewClassListManager).setValue(backView);
  }
  clear() {
    this.contentWrapper.innerHTML = "";
  }
};
_backViewClassListManager = new WeakMap();
customElementsShim.define("twisty-viewer-wrapper", TwistyViewerWrapper);

// src/cubing/twisty/dom/TwistyPlayerConfig.ts
var DEFAULT_CAMERA_Z = 5;
var DEFAULT_CAMERA_Y = DEFAULT_CAMERA_Z * (2 / (1 + Math.sqrt(5)));
var centeredCameraPosition = new Vector34(0, DEFAULT_CAMERA_Y, DEFAULT_CAMERA_Z);
var cubeCameraPosition = new Vector34(3, 4, 5);
var setupToLocations = {
  start: true,
  end: true
};
var visualizationFormats = {
  "3D": true,
  "2D": true,
  "experimental-2D-LL": true,
  PG3D: true
};
var backgroundThemes = {
  checkered: true,
  none: true
};
var hintFaceletStyles = {
  floating: true,
  none: true
};
var experimentalStickerings = {
  full: true,
  "centers-only": true,
  PLL: true,
  CLS: true,
  OLL: true,
  COLL: true,
  OCLL: true,
  CLL: true,
  ELL: true,
  ELS: true,
  LL: true,
  F2L: true,
  ZBLL: true,
  ZBLS: true,
  WVLS: true,
  VLS: true,
  LS: true,
  EO: true,
  CMLL: true,
  L6E: true,
  L6EO: true,
  Daisy: true,
  Cross: true,
  "2x2x2": true,
  "2x2x3": true,
  "Void Cube": true,
  invisible: true,
  picture: true,
  "experimental-centers-U": true,
  "experimental-centers-U-D": true,
  "experimental-centers-U-L-D": true,
  "experimental-centers-U-L-B-D": true,
  "experimental-centers": true,
  "experimental-fto-fc": true,
  "experimental-fto-f2t": true,
  "experimental-fto-sc": true,
  "experimental-fto-l2c": true,
  "experimental-fto-lbt": true
};
var controlsLocations = {
  "bottom-row": true,
  none: true
};
var puzzleIDs = {
  "3x3x3": true,
  custom: true,
  "2x2x2": true,
  "4x4x4": true,
  "5x5x5": true,
  "6x6x6": true,
  "7x7x7": true,
  "40x40x40": true,
  megaminx: true,
  pyraminx: true,
  square1: true,
  clock: true,
  skewb: true,
  fto: true,
  gigaminx: true
};
var viewerLinkPages = {
  twizzle: true,
  none: true
};
var twistyPlayerAttributeMap = {
  alg: "alg",
  "experimental-setup-alg": "experimentalSetupAlg",
  "experimental-setup-anchor": "experimentalSetupAnchor",
  puzzle: "puzzle",
  visualization: "visualization",
  "hint-facelets": "hintFacelets",
  "experimental-stickering": "experimentalStickering",
  background: "background",
  "control-panel": "controlPanel",
  "back-view": "backView",
  "experimental-camera-position": "experimentalCameraPosition",
  "viewer-link": "viewerLink"
};
var TwistyPlayerConfig = class {
  constructor(twistyPlayer, initialValues) {
    this.twistyPlayer = twistyPlayer;
    this.attributes = {
      alg: new AlgAttribute(initialValues.alg),
      "experimental-setup-alg": new AlgAttribute(initialValues.experimentalSetupAlg),
      "experimental-setup-anchor": new StringEnumAttribute(setupToLocations, initialValues.experimentalSetupAnchor),
      puzzle: new StringEnumAttribute(puzzleIDs, initialValues.puzzle),
      visualization: new StringEnumAttribute(visualizationFormats, initialValues.visualization),
      "hint-facelets": new StringEnumAttribute(hintFaceletStyles, initialValues.hintFacelets),
      "experimental-stickering": new StringEnumAttribute(experimentalStickerings, initialValues.experimentalStickering),
      background: new StringEnumAttribute(backgroundThemes, initialValues.background),
      "control-panel": new StringEnumAttribute(controlsLocations, initialValues.controlPanel),
      "back-view": new StringEnumAttribute(backViewLayouts, initialValues["backView"]),
      "experimental-camera-position": new Vector3Attribute(null, initialValues["experimentalCameraPosition"]),
      "viewer-link": new StringEnumAttribute(viewerLinkPages, initialValues.viewerLink)
    };
  }
  static get observedAttributes() {
    return Object.keys(twistyPlayerAttributeMap);
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    const managedAttribute = this.attributes[attributeName];
    if (managedAttribute) {
      if (oldValue !== null && managedAttribute.string !== oldValue) {
        console.warn("Attribute out of sync!", attributeName, managedAttribute.string, oldValue);
      }
      managedAttribute.setString(newValue);
      const propertyName = twistyPlayerAttributeMap[attributeName];
      this.twistyPlayer[propertyName] = managedAttribute.value;
    }
  }
};

// src/cubing/twisty/3D/TAU.ts
var TAU = Math.PI * 2;

// src/cubing/twisty/3D/puzzles/Cube3D.ts
var svgLoader = new TextureLoader();
var ignoredMaterial = new MeshBasicMaterial({
  color: 4473924,
  side: DoubleSide
});
var ignoredMaterialHint = new MeshBasicMaterial({
  color: 13421772,
  side: BackSide
});
var invisibleMaterial = new MeshBasicMaterial({
  visible: false
});
var orientedMaterial = new MeshBasicMaterial({
  color: 16746751
});
var orientedMaterialHint = new MeshBasicMaterial({
  color: 16746751,
  side: BackSide
});
var AxisInfo = class {
  constructor(vector, fromZ, color, dimColor) {
    this.vector = vector;
    this.fromZ = fromZ;
    this.color = color;
    this.dimColor = dimColor;
    this.stickerMaterial = {
      regular: new MeshBasicMaterial({
        color,
        side: DoubleSide
      }),
      dim: new MeshBasicMaterial({
        color: dimColor,
        side: DoubleSide
      }),
      oriented: orientedMaterial,
      ignored: ignoredMaterial,
      invisible: invisibleMaterial
    };
    this.hintStickerMaterial = {
      regular: new MeshBasicMaterial({
        color,
        side: BackSide
      }),
      dim: new MeshBasicMaterial({
        color: dimColor,
        side: BackSide,
        transparent: true,
        opacity: 0.75
      }),
      oriented: orientedMaterialHint,
      ignored: ignoredMaterialHint,
      invisible: invisibleMaterial
    };
  }
};
var axesInfo = [
  new AxisInfo(new Vector35(0, 1, 0), new Euler(-TAU / 4, 0, 0), 16777215, 14540253),
  new AxisInfo(new Vector35(-1, 0, 0), new Euler(0, -TAU / 4, 0), 16746496, 8930304),
  new AxisInfo(new Vector35(0, 0, 1), new Euler(0, 0, 0), 65280, 34816),
  new AxisInfo(new Vector35(1, 0, 0), new Euler(0, TAU / 4, 0), 16711680, 6684672),
  new AxisInfo(new Vector35(0, 0, -1), new Euler(0, TAU / 2, 0), 255, 136),
  new AxisInfo(new Vector35(0, -1, 0), new Euler(TAU / 4, 0, 0), 16776960, 8947712)
];
var face = {
  U: 0,
  L: 1,
  F: 2,
  R: 3,
  B: 4,
  D: 5
};
var familyToAxis = {
  U: face.U,
  u: face.U,
  Uw: face.U,
  y: face.U,
  L: face.L,
  l: face.L,
  Lw: face.L,
  M: face.L,
  F: face.F,
  f: face.F,
  Fw: face.F,
  S: face.F,
  z: face.F,
  R: face.R,
  r: face.R,
  Rw: face.R,
  x: face.R,
  B: face.B,
  b: face.B,
  Bw: face.B,
  D: face.D,
  d: face.D,
  Dw: face.D,
  E: face.D
};
var cubieDimensions = {
  stickerWidth: 0.85,
  stickerElevation: 0.503,
  foundationWidth: 1,
  hintStickerElevation: 1.45
};
var EXPERIMENTAL_PICTURE_CUBE_HINT_ELEVATION = 2;
var cube3DOptionsDefaults = {
  showMainStickers: true,
  hintFacelets: "floating",
  showFoundation: true,
  experimentalStickering: "full"
};
var blackMesh = new MeshBasicMaterial({
  color: 0,
  opacity: 1,
  transparent: true
});
var blackTranslucentMesh = new MeshBasicMaterial({
  color: 0,
  opacity: 0.3,
  transparent: true
});
var CubieDef = class {
  constructor(orbit, stickerFaceNames, q) {
    this.orbit = orbit;
    const individualStickerFaceNames = typeof stickerFaceNames === "string" ? stickerFaceNames.split("") : stickerFaceNames;
    this.stickerFaces = individualStickerFaceNames.map((s) => face[s]);
    this.matrix = new Matrix4();
    this.matrix.setPosition(firstPiecePosition[orbit]);
    this.matrix.premultiply(new Matrix4().makeRotationFromQuaternion(q));
  }
};
function t(v, t4) {
  return new Quaternion().setFromAxisAngle(v, TAU * t4 / 4);
}
var r = {
  O: new Vector35(0, 0, 0),
  U: new Vector35(0, -1, 0),
  L: new Vector35(1, 0, 0),
  F: new Vector35(0, 0, -1),
  R: new Vector35(-1, 0, 0),
  B: new Vector35(0, 0, 1),
  D: new Vector35(0, 1, 0)
};
var firstPiecePosition = {
  EDGES: new Vector35(0, 1, 1),
  CORNERS: new Vector35(1, 1, 1),
  CENTERS: new Vector35(0, 1, 0)
};
var orientationRotation = {
  EDGES: [0, 1].map((i) => new Matrix4().makeRotationAxis(firstPiecePosition.EDGES.clone().normalize(), -i * TAU / 2)),
  CORNERS: [0, 1, 2].map((i) => new Matrix4().makeRotationAxis(firstPiecePosition.CORNERS.clone().normalize(), -i * TAU / 3)),
  CENTERS: [0, 1, 2, 3].map((i) => new Matrix4().makeRotationAxis(firstPiecePosition.CENTERS.clone().normalize(), -i * TAU / 4))
};
var cubieStickerOrder = [face.U, face.F, face.R];
var pieceDefs = {
  EDGES: [
    new CubieDef("EDGES", "UF", t(r.O, 0)),
    new CubieDef("EDGES", "UR", t(r.U, 3)),
    new CubieDef("EDGES", "UB", t(r.U, 2)),
    new CubieDef("EDGES", "UL", t(r.U, 1)),
    new CubieDef("EDGES", "DF", t(r.F, 2)),
    new CubieDef("EDGES", "DR", t(r.F, 2).premultiply(t(r.D, 1))),
    new CubieDef("EDGES", "DB", t(r.F, 2).premultiply(t(r.D, 2))),
    new CubieDef("EDGES", "DL", t(r.F, 2).premultiply(t(r.D, 3))),
    new CubieDef("EDGES", "FR", t(r.U, 3).premultiply(t(r.R, 3))),
    new CubieDef("EDGES", "FL", t(r.U, 1).premultiply(t(r.R, 3))),
    new CubieDef("EDGES", "BR", t(r.U, 3).premultiply(t(r.R, 1))),
    new CubieDef("EDGES", "BL", t(r.U, 1).premultiply(t(r.R, 1)))
  ],
  CORNERS: [
    new CubieDef("CORNERS", "UFR", t(r.O, 0)),
    new CubieDef("CORNERS", "URB", t(r.U, 3)),
    new CubieDef("CORNERS", "UBL", t(r.U, 2)),
    new CubieDef("CORNERS", "ULF", t(r.U, 1)),
    new CubieDef("CORNERS", "DRF", t(r.F, 2).premultiply(t(r.D, 1))),
    new CubieDef("CORNERS", "DFL", t(r.F, 2).premultiply(t(r.D, 0))),
    new CubieDef("CORNERS", "DLB", t(r.F, 2).premultiply(t(r.D, 3))),
    new CubieDef("CORNERS", "DBR", t(r.F, 2).premultiply(t(r.D, 2)))
  ],
  CENTERS: [
    new CubieDef("CENTERS", "U", t(r.O, 0)),
    new CubieDef("CENTERS", "L", t(r.R, 3).premultiply(t(r.U, 1))),
    new CubieDef("CENTERS", "F", t(r.R, 3)),
    new CubieDef("CENTERS", "R", t(r.R, 3).premultiply(t(r.D, 1))),
    new CubieDef("CENTERS", "B", t(r.R, 3).premultiply(t(r.D, 2))),
    new CubieDef("CENTERS", "D", t(r.R, 2))
  ]
};
var CUBE_SCALE = 1 / 3;
var pictureStickerCoords = {
  EDGES: [
    [
      [0, 4, 6],
      [0, 4, 5]
    ],
    [
      [3, 5, 7],
      [0, 7, 5]
    ],
    [
      [2, 4, 8],
      [0, 10, 5]
    ],
    [
      [1, 3, 7],
      [0, 1, 5]
    ],
    [
      [2, 4, 2],
      [2, 4, 3]
    ],
    [
      [3, 5, 1],
      [2, 7, 3]
    ],
    [
      [2, 4, 2],
      [2, 10, 3]
    ],
    [
      [1, 3, 1],
      [2, 1, 3]
    ],
    [
      [3, 5, 4],
      [3, 6, 4]
    ],
    [
      [1, 3, 4],
      [1, 2, 4]
    ],
    [
      [1, 9, 4],
      [1, 8, 4]
    ],
    [
      [3, 11, 4],
      [3, 0, 4]
    ]
  ],
  CORNERS: [
    [
      [0, 5, 6],
      [0, 5, 5],
      [0, 6, 5]
    ],
    [
      [3, 5, 8],
      [0, 8, 5],
      [0, 9, 5]
    ],
    [
      [2, 3, 8],
      [0, 11, 5],
      [0, 0, 5]
    ],
    [
      [1, 3, 6],
      [0, 2, 5],
      [0, 3, 5]
    ],
    [
      [3, 5, 2],
      [2, 6, 3],
      [2, 5, 3]
    ],
    [
      [2, 3, 2],
      [2, 3, 3],
      [2, 2, 3]
    ],
    [
      [1, 3, 0],
      [2, 0, 3],
      [2, 11, 3]
    ],
    [
      [0, 5, 0],
      [2, 9, 3],
      [2, 8, 3]
    ]
  ],
  CENTERS: [
    [[0, 4, 7]],
    [[0, 1, 4]],
    [[0, 4, 4]],
    [[0, 7, 4]],
    [[0, 10, 4]],
    [[0, 4, 1]]
  ]
};
var sharedCubieFoundationGeometryCache = null;
function sharedCubieFoundationGeometry() {
  return sharedCubieFoundationGeometryCache ?? (sharedCubieFoundationGeometryCache = new BoxGeometry(cubieDimensions.foundationWidth, cubieDimensions.foundationWidth, cubieDimensions.foundationWidth));
}
function newStickerGeometry() {
  const r2 = new BufferGeometry();
  const half = 0.5 * cubieDimensions.stickerWidth;
  r2.setAttribute("position", new BufferAttribute(new Float32Array([
    half,
    half,
    0,
    -half,
    half,
    0,
    half,
    -half,
    0,
    -half,
    half,
    0,
    -half,
    -half,
    0,
    half,
    -half,
    0
  ]), 3));
  r2.setAttribute("uv", new BufferAttribute(new Float32Array([
    1,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1
  ]), 2));
  return r2;
}
var sharedStickerGeometryCache = null;
function sharedStickerGeometry() {
  return sharedStickerGeometryCache ?? (sharedStickerGeometryCache = newStickerGeometry());
}
var Cube3D = class extends Object3D {
  constructor(def, cursor, scheduleRenderCallback, options = {}) {
    super();
    this.def = def;
    this.scheduleRenderCallback = scheduleRenderCallback;
    this.pieces = {};
    this.experimentalHintStickerMeshes = [];
    this.experimentalFoundationMeshes = [];
    this.sprite = new Promise((resolve) => {
      this.setSpriteURL = (url) => {
        svgLoader.load(url, resolve);
      };
    });
    this.hintSprite = new Promise((resolve) => {
      this.setHintSpriteURL = (url) => {
        svgLoader.load(url, resolve);
      };
    });
    this.options = {...cube3DOptionsDefaults};
    Object.assign(this.options, options);
    if (this.def.name !== "3x3x3") {
      throw new Error(`Invalid puzzle for this Cube3D implementation: ${this.def.name}`);
    }
    this.kpuzzleFaceletInfo = {};
    for (const orbit in pieceDefs) {
      const orbitFaceletInfo = [];
      this.kpuzzleFaceletInfo[orbit] = orbitFaceletInfo;
      this.pieces[orbit] = pieceDefs[orbit].map(this.createCubie.bind(this, orbit, orbitFaceletInfo));
    }
    this.scale.set(CUBE_SCALE, CUBE_SCALE, CUBE_SCALE);
    if (this.options.experimentalStickering) {
      this.setStickering(this.options.experimentalStickering);
    }
    cursor?.addPositionListener(this);
  }
  experimentalSetStickerSpriteURL(stickerSpriteURL) {
    this.setSpriteURL(stickerSpriteURL);
  }
  experimentalSetHintStickerSpriteURL(hintStickerSpriteURL) {
    this.setHintSpriteURL(hintStickerSpriteURL);
  }
  setStickering(stickering) {
    (async () => {
      const appearance = await puzzles["3x3x3"].appearance(stickering ?? "full");
      this.setAppearance(appearance ?? await puzzles["3x3x3"].appearance("full"));
    })();
  }
  setAppearance(appearance) {
    for (const [orbitName, orbitAppearance] of Object.entries(appearance.orbits)) {
      for (let pieceIdx = 0; pieceIdx < orbitAppearance.pieces.length; pieceIdx++) {
        const pieceAppearance = orbitAppearance.pieces[pieceIdx];
        if (pieceAppearance) {
          const pieceInfo = this.kpuzzleFaceletInfo[orbitName][pieceIdx];
          for (let faceletIdx = 0; faceletIdx < pieceInfo.length; faceletIdx++) {
            const faceletAppearance = pieceAppearance.facelets[faceletIdx];
            if (faceletAppearance) {
              const faceletInfo = pieceInfo[faceletIdx];
              const appearance2 = typeof faceletAppearance === "string" ? faceletAppearance : faceletAppearance?.appearance;
              faceletInfo.facelet.material = axesInfo[faceletInfo.faceIdx].stickerMaterial[appearance2];
              const hintAppearance = typeof faceletAppearance === "string" ? appearance2 : faceletAppearance.hintAppearance ?? appearance2;
              if (faceletInfo.hintFacelet) {
                faceletInfo.hintFacelet.material = axesInfo[faceletInfo.faceIdx].hintStickerMaterial[hintAppearance];
              }
            }
          }
        }
      }
    }
    if (this.scheduleRenderCallback) {
      this.scheduleRenderCallback();
    }
  }
  experimentalUpdateOptions(options) {
    if ("showMainStickers" in options) {
      throw new Error("Unimplemented");
    }
    const showFoundation = options.showFoundation;
    if (typeof showFoundation !== "undefined" && this.options.showFoundation !== showFoundation) {
      this.options.showFoundation = showFoundation;
      for (const foundation of this.experimentalFoundationMeshes) {
        foundation.visible = showFoundation;
      }
    }
    const hintFacelets = options.hintFacelets;
    if (typeof hintFacelets !== "undefined" && this.options.hintFacelets !== hintFacelets && hintFaceletStyles[hintFacelets]) {
      this.options.hintFacelets = hintFacelets;
      for (const hintSticker of this.experimentalHintStickerMeshes) {
        hintSticker.visible = hintFacelets === "floating";
      }
      this.scheduleRenderCallback();
    }
    const experimentalStickering = options.experimentalStickering;
    if (typeof experimentalStickering !== "undefined" && this.options.experimentalStickering !== experimentalStickering && experimentalStickerings[experimentalStickering]) {
      this.options.experimentalStickering = experimentalStickering;
      this.setStickering(experimentalStickering);
      this.scheduleRenderCallback();
    }
  }
  onPositionChange(p) {
    const reid333 = p.state;
    for (const orbit in pieceDefs) {
      const pieces = pieceDefs[orbit];
      for (let i = 0; i < pieces.length; i++) {
        const j = reid333[orbit].permutation[i];
        this.pieces[orbit][j].matrix.copy(pieceDefs[orbit][i].matrix);
        this.pieces[orbit][j].matrix.multiply(orientationRotation[orbit][reid333[orbit].orientation[i]]);
      }
      for (const moveProgress of p.movesInProgress) {
        const move = moveProgress.move;
        const turnNormal = axesInfo[familyToAxis[move.family]].vector;
        const moveMatrix = new Matrix4().makeRotationAxis(turnNormal, -this.ease(moveProgress.fraction) * moveProgress.direction * move.effectiveAmount * TAU / 4);
        for (let i = 0; i < pieces.length; i++) {
          const k = this.def.moves[move.family][orbit].permutation[i];
          if (i !== k || this.def.moves[move.family][orbit].orientation[i] !== 0) {
            const j = reid333[orbit].permutation[i];
            this.pieces[orbit][j].matrix.premultiply(moveMatrix);
          }
        }
      }
    }
    this.scheduleRenderCallback();
  }
  createCubie(orbit, orbitFacelets, piece, orbitPieceIdx) {
    const cubieFaceletInfo = [];
    orbitFacelets.push(cubieFaceletInfo);
    const cubie = new Group();
    if (this.options.showFoundation) {
      const foundation = this.createCubieFoundation();
      cubie.add(foundation);
      this.experimentalFoundationMeshes.push(foundation);
    }
    for (let i = 0; i < piece.stickerFaces.length; i++) {
      const sticker = this.createSticker(axesInfo[cubieStickerOrder[i]], axesInfo[piece.stickerFaces[i]], false);
      const faceletInfo = {
        faceIdx: piece.stickerFaces[i],
        facelet: sticker
      };
      cubie.add(sticker);
      if (this.options.hintFacelets === "floating") {
        const hintSticker = this.createSticker(axesInfo[cubieStickerOrder[i]], axesInfo[piece.stickerFaces[i]], true);
        cubie.add(hintSticker);
        faceletInfo.hintFacelet = hintSticker;
        this.experimentalHintStickerMeshes.push(hintSticker);
      }
      if (this.options.experimentalStickering === "picture" && pictureStickerCoords[orbit] && pictureStickerCoords[orbit][orbitPieceIdx] && pictureStickerCoords[orbit][orbitPieceIdx][i]) {
        const [rotate, offsetX, offsetY] = pictureStickerCoords[orbit][orbitPieceIdx][i];
        (async () => {
          const addImageSticker = async (hint) => {
            const texture = await (hint ? this.hintSprite : this.sprite);
            const mesh = this.createSticker(axesInfo[cubieStickerOrder[i]], axesInfo[piece.stickerFaces[i]], hint);
            mesh.material = new MeshBasicMaterial({
              map: texture,
              side: hint ? BackSide : DoubleSide,
              transparent: true
            });
            const x1 = offsetX / 12;
            const x2 = (offsetX + 1) / 12;
            const y1 = offsetY / 9;
            const y2 = (offsetY + 1) / 9;
            let v1 = new Vector2(x1, y1);
            let v2 = new Vector2(x1, y2);
            let v3 = new Vector2(x2, y2);
            let v4 = new Vector2(x2, y1);
            switch (rotate) {
              case 1:
                [v1, v2, v3, v4] = [v2, v3, v4, v1];
                break;
              case 2:
                [v1, v2, v3, v4] = [v3, v4, v1, v2];
                break;
              case 3:
                [v1, v2, v3, v4] = [v4, v1, v2, v3];
                break;
            }
            mesh.geometry.setAttribute("uv", new BufferAttribute(new Float32Array([
              v3.x,
              v3.y,
              v2.x,
              v2.y,
              v4.x,
              v4.y,
              v2.x,
              v2.y,
              v1.x,
              v1.y,
              v4.x,
              v4.y
            ]), 2));
            cubie.add(mesh);
          };
          addImageSticker(true);
          addImageSticker(false);
        })();
      }
      cubieFaceletInfo.push(faceletInfo);
    }
    cubie.matrix.copy(piece.matrix);
    cubie.matrixAutoUpdate = false;
    this.add(cubie);
    return cubie;
  }
  createCubieFoundation() {
    const box = sharedCubieFoundationGeometry();
    return new Mesh(box, this.options.experimentalStickering === "picture" ? blackMesh : blackTranslucentMesh);
  }
  createSticker(posAxisInfo, materialAxisInfo, isHint) {
    const geo = this.options.experimentalStickering === "picture" ? newStickerGeometry() : sharedStickerGeometry();
    const stickerMesh = new Mesh(geo, isHint ? materialAxisInfo.hintStickerMaterial.regular : materialAxisInfo.stickerMaterial.regular);
    stickerMesh.setRotationFromEuler(posAxisInfo.fromZ);
    stickerMesh.position.copy(posAxisInfo.vector);
    stickerMesh.position.multiplyScalar(isHint ? this.options.experimentalStickering === "picture" ? EXPERIMENTAL_PICTURE_CUBE_HINT_ELEVATION : cubieDimensions.hintStickerElevation : cubieDimensions.stickerElevation);
    return stickerMesh;
  }
  experimentalSetFoundationOpacity(opacity) {
    this.experimentalFoundationMeshes[0].material.opacity = opacity;
  }
  experimentalSetStickerWidth(width) {
    for (const orbitInfo of Object.values(this.kpuzzleFaceletInfo)) {
      for (const pieceInfo of orbitInfo) {
        for (const faceletInfo of pieceInfo) {
          faceletInfo.facelet.scale.setScalar(width / cubieDimensions.stickerWidth);
        }
      }
    }
  }
  experimentalSetCenterStickerWidth(width) {
    for (const orbitInfo of [this.kpuzzleFaceletInfo["CENTERS"]]) {
      for (const pieceInfo of orbitInfo) {
        for (const faceletInfo of pieceInfo) {
          faceletInfo.facelet.scale.setScalar(width / cubieDimensions.stickerWidth);
        }
      }
    }
  }
  ease(fraction) {
    return smootherStep(fraction);
  }
};

// src/cubing/twisty/3D/puzzles/PG3D.ts
import {
  BufferAttribute as BufferAttribute2,
  BufferGeometry as BufferGeometry2,
  Color,
  DoubleSide as DoubleSide2,
  Euler as Euler2,
  Group as Group2,
  Mesh as Mesh2,
  MeshBasicMaterial as MeshBasicMaterial2,
  Object3D as Object3D2,
  Triangle,
  Vector3 as Vector36
} from "three";
import {
  areTransformationsEquivalent
} from "cubing/kpuzzle";
import {experimentalTransformationForQuantumMove} from "cubing/kpuzzle";
import {
  experimentalGetFaceletAppearance
} from "cubing/puzzles";
var foundationMaterial = new MeshBasicMaterial2({
  side: DoubleSide2,
  color: 0
});
var stickerMaterial = new MeshBasicMaterial2({
  vertexColors: true
});
var polyMaterial = new MeshBasicMaterial2({
  visible: false
});
var Filler = class {
  constructor(sz, colored = true) {
    this.sz = sz;
    this.colored = colored;
    this.vertices = new Float32Array(9 * sz);
    if (colored) {
      this.colors = new Uint8Array(9 * sz);
      this.ind = new Uint8Array(sz);
    }
    this.pos = 0;
    this.ipos = 0;
  }
  add(pt, c) {
    this.vertices[this.pos] = pt[0];
    this.vertices[this.pos + 1] = pt[1];
    this.vertices[this.pos + 2] = pt[2];
    this.colors[this.pos] = c >> 16;
    this.colors[this.pos + 1] = c >> 8 & 255;
    this.colors[this.pos + 2] = c & 255;
    this.pos += 3;
  }
  addUncolored(pt) {
    this.vertices[this.pos] = pt[0];
    this.vertices[this.pos + 1] = pt[1];
    this.vertices[this.pos + 2] = pt[2];
    this.pos += 3;
  }
  setind(i) {
    this.ind[this.ipos++] = i;
  }
  setAttributes(geo) {
    geo.setAttribute("position", new BufferAttribute2(this.vertices, 3));
    if (this.colored) {
      geo.setAttribute("color", new BufferAttribute2(this.colors, 3, true));
    }
  }
  makeGroups(geo) {
    geo.clearGroups();
    for (let i = 0; i < this.ipos; ) {
      const si = i++;
      const iv = this.ind[si];
      while (this.ind[i] === iv) {
        i++;
      }
      geo.addGroup(3 * si, 3 * (i - si), iv);
    }
  }
};
function makePoly(filler, coords, color, scale, ind, faceArray) {
  let ncoords = coords;
  if (scale !== 1) {
    ncoords = [];
    for (const v of coords) {
      const v2 = [v[0] * scale, v[1] * scale, v[2] * scale];
      ncoords.push(v2);
    }
  }
  for (let g = 1; g + 1 < ncoords.length; g++) {
    faceArray.push(filler.ipos);
    filler.add(ncoords[0], color);
    filler.add(ncoords[g], color);
    filler.add(ncoords[g + 1], color);
    filler.setind(ind);
  }
}
var StickerDef = class {
  constructor(filler, stickerDat, hintStickers, options) {
    this.filler = filler;
    this.faceArray = [];
    this.twistVal = -1;
    const sdColor = new Color(stickerDat.color).getHex();
    this.origColor = sdColor;
    this.origColorAppearance = sdColor;
    if (options?.appearance) {
      this.setAppearance(options.appearance);
    }
    this.faceColor = sdColor;
    const coords = stickerDat.coords;
    makePoly(filler, coords, this.faceColor, 1, 0, this.faceArray);
    if (hintStickers) {
      let highArea = 0;
      let goodFace = null;
      for (const f of this.faceArray) {
        const t2 = new Triangle(new Vector36(filler.vertices[9 * f], filler.vertices[9 * f + 1], filler.vertices[9 * f + 2]), new Vector36(filler.vertices[9 * f + 3], filler.vertices[9 * f + 4], filler.vertices[9 * f + 5]), new Vector36(filler.vertices[9 * f + 6], filler.vertices[9 * f + 7], filler.vertices[9 * f + 8]));
        const a = t2.getArea();
        if (a > highArea) {
          highArea = a;
          goodFace = t2;
        }
      }
      const norm = new Vector36();
      goodFace.getNormal(norm);
      norm.multiplyScalar(0.5);
      const hintCoords = [];
      for (let i = 0; i < coords.length; i++) {
        const j = coords.length - 1 - i;
        hintCoords.push([
          coords[j][0] + norm.x,
          coords[j][1] + norm.y,
          coords[j][2] + norm.z
        ]);
      }
      makePoly(filler, hintCoords, this.faceColor, 1, 0, this.faceArray);
    }
  }
  addFoundation(filler, foundationDat, black) {
    makePoly(filler, foundationDat.coords, black, 0.999, 2, this.faceArray);
  }
  setAppearance(faceletMeshAppearance) {
    switch (faceletMeshAppearance) {
      case "regular":
        this.origColorAppearance = this.origColor;
        break;
      case "dim":
        if (this.origColor === 16777215) {
          this.origColorAppearance = 14540253;
        } else {
          this.origColorAppearance = new Color(this.origColor).multiplyScalar(0.5).getHex();
        }
        break;
      case "oriented":
        this.origColorAppearance = 16746751;
        break;
      case "ignored":
        this.origColorAppearance = 4473924;
        break;
      case "invisible":
        throw new Error("unimplemented");
    }
  }
  setColor(c) {
    if (this.faceColor !== c) {
      this.faceColor = c;
      const r2 = c >> 16;
      const g = c >> 8 & 255;
      const b = c & 255;
      for (const f of this.faceArray) {
        for (let i = 0; i < 9; i += 3) {
          this.filler.colors[9 * f + i] = r2;
          this.filler.colors[9 * f + i + 1] = g;
          this.filler.colors[9 * f + i + 2] = b;
        }
      }
      return 1;
    } else {
      return 0;
    }
  }
};
var HitPlaneDef = class {
  constructor(hitface) {
    this.cubie = new Group2();
    const coords = hitface.coords;
    const filler = new Filler(coords.length - 2, true);
    for (let g = 1; g + 1 < coords.length; g++) {
      filler.addUncolored(coords[0]);
      filler.addUncolored(coords[g]);
      filler.addUncolored(coords[g + 1]);
    }
    this.geo = new BufferGeometry2();
    filler.setAttributes(this.geo);
    const obj = new Mesh2(this.geo, polyMaterial);
    obj.userData.name = hitface.name;
    this.cubie.scale.setScalar(0.99);
    this.cubie.add(obj);
  }
};
var AxisInfo2 = class {
  constructor(axisDat) {
    const vec = axisDat[0];
    this.axis = new Vector36(vec[0], vec[1], vec[2]);
    this.order = axisDat[2];
  }
};
var PG_SCALE = 0.5;
var _pendingStickeringUpdate;
var PG3D = class extends Object3D2 {
  constructor(cursor, scheduleRenderCallback, definition, pgdat, showFoundation = false, hintStickers = false, params = {}) {
    super();
    this.scheduleRenderCallback = scheduleRenderCallback;
    this.definition = definition;
    this.pgdat = pgdat;
    this.params = params;
    this.stickerTargets = [];
    this.controlTargets = [];
    _pendingStickeringUpdate.set(this, false);
    this.axesInfo = {};
    const axesDef = this.pgdat.axis;
    for (const axis of axesDef) {
      this.axesInfo[axis[1]] = new AxisInfo2(axis);
    }
    const stickers = this.pgdat.stickers;
    this.stickers = {};
    const materialArray1 = [
      stickerMaterial,
      polyMaterial,
      foundationMaterial,
      polyMaterial
    ];
    const materialArray2 = [
      polyMaterial,
      stickerMaterial,
      polyMaterial,
      foundationMaterial
    ];
    let triangleCount = 0;
    let multiplier = 1;
    if (hintStickers) {
      multiplier++;
    }
    if (showFoundation) {
      multiplier++;
    }
    for (let si = 0; si < stickers.length; si++) {
      const sides = stickers[si].coords.length;
      triangleCount += multiplier * (sides - 2);
    }
    const filler = new Filler(triangleCount);
    const black = 0;
    for (let si = 0; si < stickers.length; si++) {
      const sticker = stickers[si];
      const orbit = sticker.orbit;
      const ord = sticker.ord;
      const ori = sticker.ori;
      if (!this.stickers[orbit]) {
        this.stickers[orbit] = [];
      }
      if (!this.stickers[orbit][ori]) {
        this.stickers[orbit][ori] = [];
      }
      const options = {};
      if (params.appearance) {
        options.appearance = experimentalGetFaceletAppearance(params.appearance, orbit, ord, ori, false);
      }
      const stickerdef = new StickerDef(filler, sticker, hintStickers, options);
      this.stickers[orbit][ori][ord] = stickerdef;
    }
    this.foundationBound = filler.ipos;
    if (showFoundation) {
      for (let si = 0; si < stickers.length; si++) {
        const sticker = stickers[si];
        const foundation = this.pgdat.foundations[si];
        const orbit = sticker.orbit;
        const ord = sticker.ord;
        const ori = sticker.ori;
        this.stickers[orbit][ori][ord].addFoundation(filler, foundation, black);
      }
    }
    const fixedGeo = new BufferGeometry2();
    filler.setAttributes(fixedGeo);
    filler.makeGroups(fixedGeo);
    const obj = new Mesh2(fixedGeo, materialArray1);
    obj.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
    this.add(obj);
    const obj2 = new Mesh2(fixedGeo, materialArray2);
    obj2.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
    this.add(obj2);
    const hitfaces = this.pgdat.faces;
    this.movingObj = obj2;
    this.fixedGeo = fixedGeo;
    this.filler = filler;
    for (const hitface of hitfaces) {
      const facedef = new HitPlaneDef(hitface);
      facedef.cubie.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
      this.add(facedef.cubie);
      this.controlTargets.push(facedef.cubie.children[0]);
    }
    cursor.addPositionListener(this);
  }
  dispose() {
    if (this.fixedGeo) {
      this.fixedGeo.dispose();
    }
  }
  experimentalGetStickerTargets() {
    return this.stickerTargets;
  }
  experimentalGetControlTargets() {
    return this.controlTargets;
  }
  experimentalSetAppearance(appearance) {
    this.params.appearance = appearance;
    for (const orbitName in this.definition.orbits) {
      const {numPieces, orientations} = this.definition.orbits[orbitName];
      for (let pieceIdx = 0; pieceIdx < numPieces; pieceIdx++) {
        for (let faceletIdx = 0; faceletIdx < orientations; faceletIdx++) {
          const faceletAppearance = experimentalGetFaceletAppearance(appearance, orbitName, pieceIdx, faceletIdx, false);
          const stickerDef = this.stickers[orbitName][faceletIdx][pieceIdx];
          stickerDef.setAppearance(faceletAppearance);
        }
      }
    }
    if (this.scheduleRenderCallback) {
      __privateSet(this, _pendingStickeringUpdate, true);
      this.onPositionChange(this.lastPos);
      this.scheduleRenderCallback();
    }
  }
  onPositionChange(p) {
    const state = p.state;
    const noRotation = new Euler2();
    this.movingObj.rotation.copy(noRotation);
    let colormods = 0;
    if (!this.lastPos || __privateGet(this, _pendingStickeringUpdate) || !areTransformationsEquivalent(this.definition, this.lastPos.state, state)) {
      for (const orbit in this.stickers) {
        const pieces = this.stickers[orbit];
        const pos2 = state[orbit];
        const orin = pieces.length;
        if (orin === 1) {
          const pieces2 = pieces[0];
          for (let i = 0; i < pieces2.length; i++) {
            const ni = pos2.permutation[i];
            colormods += pieces2[i].setColor(pieces2[ni].origColorAppearance);
          }
        } else {
          for (let ori = 0; ori < orin; ori++) {
            const pieces2 = pieces[ori];
            for (let i = 0; i < pieces2.length; i++) {
              const nori = (ori + orin - pos2.orientation[i]) % orin;
              const ni = pos2.permutation[i];
              colormods += pieces2[i].setColor(pieces[nori][ni].origColorAppearance);
            }
          }
        }
      }
      this.lastPos = p;
      __privateSet(this, _pendingStickeringUpdate, false);
    }
    let vismods = 0;
    for (const moveProgress of p.movesInProgress) {
      const externalMove = moveProgress.move;
      const unswizzled = this.pgdat.unswizzle(externalMove);
      const move = this.pgdat.notationMapper.notationToInternal(externalMove);
      if (move === null) {
        throw Error("Bad blockmove " + externalMove.family);
      }
      const quantumTransformation = experimentalTransformationForQuantumMove(this.definition, externalMove.quantum);
      const ax = this.axesInfo[unswizzled];
      const turnNormal = ax.axis;
      const angle = -this.ease(moveProgress.fraction) * moveProgress.direction * move.effectiveAmount * TAU / ax.order;
      this.movingObj.rotateOnAxis(turnNormal, angle);
      if (this.lastMove !== quantumTransformation) {
        for (const orbit in this.stickers) {
          const pieces = this.stickers[orbit];
          const orin = pieces.length;
          const bmv = quantumTransformation[orbit];
          for (let ori = 0; ori < orin; ori++) {
            const pieces2 = pieces[ori];
            for (let i = 0; i < pieces2.length; i++) {
              const ni = bmv.permutation[i];
              let tv = 0;
              if (ni !== i || bmv.orientation[i] !== 0) {
                tv = 1;
              }
              if (tv !== pieces2[i].twistVal) {
                if (tv) {
                  for (const f of pieces2[i].faceArray) {
                    this.filler.ind[f] |= 1;
                  }
                } else {
                  for (const f of pieces2[i].faceArray) {
                    this.filler.ind[f] &= ~1;
                  }
                }
                pieces2[i].twistVal = tv;
                vismods++;
              }
            }
          }
        }
        this.lastMove = quantumTransformation;
      }
    }
    if (vismods) {
      this.filler.makeGroups(this.fixedGeo);
    }
    if (colormods) {
      this.fixedGeo.getAttribute("color").updateRange = {
        offset: 0,
        count: 9 * this.foundationBound
      };
      this.fixedGeo.getAttribute("color").needsUpdate = true;
    }
    this.scheduleRenderCallback();
  }
  ease(fraction) {
    return smootherStep(fraction);
  }
};
_pendingStickeringUpdate = new WeakMap();

// src/cubing/twisty/3D/Twisty3DScene.ts
import {Scene as ThreeScene} from "three";
var Twisty3DScene = class extends ThreeScene {
  constructor() {
    super();
    this.renderTargets = new Set();
    this.twisty3Ds = new Set();
  }
  addRenderTarget(renderTarget) {
    this.renderTargets.add(renderTarget);
  }
  scheduleRender() {
    for (const renderTarget of this.renderTargets) {
      renderTarget.scheduleRender();
    }
  }
  addTwisty3DPuzzle(twisty3DPuzzle) {
    this.twisty3Ds.add(twisty3DPuzzle);
    this.add(twisty3DPuzzle);
  }
  removeTwisty3DPuzzle(twisty3DPuzzle) {
    this.twisty3Ds.delete(twisty3DPuzzle);
    this.remove(twisty3DPuzzle);
  }
  clearPuzzles() {
    for (const puz of this.twisty3Ds) {
      this.remove(puz);
    }
    this.twisty3Ds.clear();
  }
};

// src/cubing/twisty/animation/cursor/AlgCursor.ts
import {KPuzzle} from "cubing/kpuzzle";

// src/cubing/twisty/3D/puzzles/KPuzzleWrapper.ts
import {
  combineTransformations,
  areStatesEquivalent,
  identityTransformation,
  invertTransformation,
  transformationForMove
} from "cubing/kpuzzle";
import {puzzles as puzzles2} from "cubing/puzzles";
var PuzzleWrapper = class {
  multiply(state, amount) {
    if (amount < 0) {
      return this.invert(this.multiply(state, -amount));
    }
    if (amount === 0) {
      return this.identity();
    }
    while (amount % 2 === 0) {
      amount = amount / 2;
      state = this.combine(state, state);
    }
    let newState = state;
    amount--;
    while (amount > 0) {
      if (amount % 2 === 1) {
        newState = this.combine(newState, state);
      }
      amount = Math.floor(amount / 2);
      if (amount > 0) {
        state = this.combine(state, state);
      }
    }
    return newState;
  }
};
var KPuzzleWrapper = class extends PuzzleWrapper {
  constructor(definition) {
    super();
    this.definition = definition;
    this.moveCache = {};
  }
  static async fromID(id) {
    return new KPuzzleWrapper(await puzzles2[id].def());
  }
  startState() {
    return this.definition.startPieces;
  }
  invert(state) {
    return invertTransformation(this.definition, state);
  }
  combine(s1, s2) {
    return combineTransformations(this.definition, s1, s2);
  }
  stateFromMove(move) {
    const key = move.toString();
    if (!this.moveCache[key]) {
      this.moveCache[key] = transformationForMove(this.definition, move);
    }
    return this.moveCache[key];
  }
  identity() {
    return identityTransformation(this.definition);
  }
  equivalent(s1, s2) {
    return areStatesEquivalent(this.definition, s1, s2);
  }
};

// src/cubing/twisty/animation/indexer/tree/chunkAlgs.ts
import {
  Conjugate,
  Grouping,
  TraversalUp
} from "cubing/alg";
import {AlgBuilder} from "cubing/alg";
var MIN_CHUNKING_THRESHOLD = 16;
function chunkifyAlg(alg, chunkMaxLength) {
  const mainAlgBuilder = new AlgBuilder();
  const chunkAlgBuilder = new AlgBuilder();
  for (const unit of alg.units()) {
    chunkAlgBuilder.push(unit);
    if (chunkAlgBuilder.experimentalNumUnits() >= chunkMaxLength) {
      mainAlgBuilder.push(new Grouping(chunkAlgBuilder.toAlg()));
      chunkAlgBuilder.reset();
    }
  }
  mainAlgBuilder.push(new Grouping(chunkAlgBuilder.toAlg()));
  return mainAlgBuilder.toAlg();
}
var ChunkAlgs = class extends TraversalUp {
  traverseAlg(alg) {
    const algLength = alg.experimentalNumUnits();
    if (algLength < MIN_CHUNKING_THRESHOLD) {
      return alg;
    }
    return chunkifyAlg(alg, Math.ceil(Math.sqrt(algLength)));
  }
  traverseGrouping(grouping) {
    return new Grouping(this.traverseAlg(grouping.experimentalAlg), grouping.experimentalEffectiveAmount);
  }
  traverseMove(move) {
    return move;
  }
  traverseCommutator(commutator) {
    return new Conjugate(this.traverseAlg(commutator.A), this.traverseAlg(commutator.B), commutator.experimentalEffectiveAmount);
  }
  traverseConjugate(conjugate) {
    return new Conjugate(this.traverseAlg(conjugate.A), this.traverseAlg(conjugate.B), conjugate.experimentalEffectiveAmount);
  }
  traversePause(pause) {
    return pause;
  }
  traverseNewline(newline) {
    return newline;
  }
  traverseLineComment(comment) {
    return comment;
  }
};
var chunkAlgsInstance = new ChunkAlgs();
var chunkAlgs = chunkAlgsInstance.traverseAlg.bind(chunkAlgsInstance);

// src/cubing/twisty/animation/indexer/tree/walker.ts
import {
  Alg as Alg4,
  TraversalDownUp,
  TraversalUp as TraversalUp3
} from "cubing/alg";
import {
  experimentalDirectedGenerator,
  ExperimentalIterationDirection
} from "cubing/alg";

// src/cubing/twisty/animation/indexer/AlgDuration.ts
import {
  TraversalUp as TraversalUp2
} from "cubing/alg";
function defaultDurationForAmount(amount) {
  switch (Math.abs(amount)) {
    case 0:
      return 0;
    case 1:
      return 1e3;
    case 2:
      return 1500;
    default:
      return 2e3;
  }
}
var AlgDuration = class extends TraversalUp2 {
  constructor(durationForAmount = defaultDurationForAmount) {
    super();
    this.durationForAmount = durationForAmount;
  }
  traverseAlg(alg) {
    let total = 0;
    for (const unit of alg.units()) {
      total += this.traverseUnit(unit);
    }
    return total;
  }
  traverseGrouping(grouping) {
    return grouping.experimentalEffectiveAmount * this.traverseAlg(grouping.experimentalAlg);
  }
  traverseMove(move) {
    return this.durationForAmount(move.effectiveAmount);
  }
  traverseCommutator(commutator) {
    return commutator.experimentalEffectiveAmount * 2 * (this.traverseAlg(commutator.A) + this.traverseAlg(commutator.B));
  }
  traverseConjugate(conjugate) {
    return conjugate.experimentalEffectiveAmount * (2 * this.traverseAlg(conjugate.A) + this.traverseAlg(conjugate.B));
  }
  traversePause(_pause) {
    return this.durationForAmount(1);
  }
  traverseNewline(_newline) {
    return this.durationForAmount(1);
  }
  traverseLineComment(_comment) {
    return this.durationForAmount(0);
  }
};

// src/cubing/twisty/animation/indexer/tree/walker.ts
var AlgPartDecoration = class {
  constructor(_puz, moveCount, duration, forward, backward, children = []) {
    this.moveCount = moveCount;
    this.duration = duration;
    this.forward = forward;
    this.backward = backward;
    this.children = children;
  }
};
var DecoratorConstructor = class extends TraversalUp3 {
  constructor(puz) {
    super();
    this.puz = puz;
    this.durationFn = new AlgDuration(defaultDurationForAmount);
    this.cache = {};
    this.identity = puz.identity();
    this.dummyLeaf = new AlgPartDecoration(puz, 0, 0, this.identity, this.identity, []);
  }
  traverseAlg(alg) {
    let moveCount = 0;
    let duration = 0;
    let state = this.identity;
    const child = [];
    for (const unit of alg.units()) {
      const apd = this.traverseUnit(unit);
      moveCount += apd.moveCount;
      duration += apd.duration;
      if (state === this.identity) {
        state = apd.forward;
      } else {
        state = this.puz.combine(state, apd.forward);
      }
      child.push(apd);
    }
    return new AlgPartDecoration(this.puz, moveCount, duration, state, this.puz.invert(state), child);
  }
  traverseGrouping(grouping) {
    const dec = this.traverseAlg(grouping.experimentalAlg);
    return this.mult(dec, grouping.experimentalEffectiveAmount, [dec]);
  }
  traverseMove(move) {
    const key = move.toString();
    let r2 = this.cache[key];
    if (r2) {
      return r2;
    }
    r2 = new AlgPartDecoration(this.puz, 1, this.durationFn.traverseUnit(move), this.puz.stateFromMove(move), this.puz.stateFromMove(move.invert()));
    this.cache[key] = r2;
    return r2;
  }
  traverseCommutator(commutator) {
    const decA = this.traverseAlg(commutator.A);
    const decB = this.traverseAlg(commutator.B);
    const AB = this.puz.combine(decA.forward, decB.forward);
    const ApBp = this.puz.combine(decA.backward, decB.backward);
    const ABApBp = this.puz.combine(AB, ApBp);
    const dec = new AlgPartDecoration(this.puz, 2 * (decA.moveCount + decB.moveCount), 2 * (decA.duration + decB.duration), ABApBp, this.puz.invert(ABApBp), [decA, decB]);
    return this.mult(dec, commutator.experimentalEffectiveAmount, [
      dec,
      decA,
      decB
    ]);
  }
  traverseConjugate(conjugate) {
    const decA = this.traverseAlg(conjugate.A);
    const decB = this.traverseAlg(conjugate.B);
    const AB = this.puz.combine(decA.forward, decB.forward);
    const ABAp = this.puz.combine(AB, decA.backward);
    const dec = new AlgPartDecoration(this.puz, 2 * decA.moveCount + decB.moveCount, 2 * decA.duration + decB.duration, ABAp, this.puz.invert(ABAp), [decA, decB]);
    return this.mult(dec, conjugate.experimentalEffectiveAmount, [
      dec,
      decA,
      decB
    ]);
  }
  traversePause(pause) {
    return new AlgPartDecoration(this.puz, 1, this.durationFn.traverseUnit(pause), this.identity, this.identity);
  }
  traverseNewline(_newline) {
    return this.dummyLeaf;
  }
  traverseLineComment(_comment) {
    return this.dummyLeaf;
  }
  mult(apd, n, child) {
    const absn = Math.abs(n);
    const st = this.puz.multiply(apd.forward, n);
    return new AlgPartDecoration(this.puz, apd.moveCount * absn, apd.duration * absn, st, this.puz.invert(st), child);
  }
};
var WalkerDown = class {
  constructor(apd, back) {
    this.apd = apd;
    this.back = back;
  }
};
var AlgWalker = class extends TraversalDownUp {
  constructor(puz, algOrUnit, apd) {
    super();
    this.puz = puz;
    this.algOrUnit = algOrUnit;
    this.apd = apd;
    this.i = -1;
    this.dur = -1;
    this.goali = -1;
    this.goaldur = -1;
    this.move = void 0;
    this.back = false;
    this.moveDuration = 0;
    this.st = this.puz.identity();
    this.root = new WalkerDown(this.apd, false);
  }
  moveByIndex(loc) {
    if (this.i >= 0 && this.i === loc) {
      return this.move !== void 0;
    }
    return this.dosearch(loc, Infinity);
  }
  moveByDuration(dur) {
    if (this.dur >= 0 && this.dur < dur && this.dur + this.moveDuration >= dur) {
      return this.move !== void 0;
    }
    return this.dosearch(Infinity, dur);
  }
  dosearch(loc, dur) {
    this.goali = loc;
    this.goaldur = dur;
    this.i = 0;
    this.dur = 0;
    this.move = void 0;
    this.moveDuration = 0;
    this.back = false;
    this.st = this.puz.identity();
    const r2 = this.algOrUnit.is(Alg4) ? this.traverseAlg(this.algOrUnit, this.root) : this.traverseUnit(this.algOrUnit, this.root);
    return r2;
  }
  traverseAlg(alg, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    let i = wd.back ? alg.experimentalNumUnits() - 1 : 0;
    for (const unit of experimentalDirectedGenerator(alg.units(), wd.back ? ExperimentalIterationDirection.Backwards : ExperimentalIterationDirection.Forwards)) {
      if (this.traverseUnit(unit, new WalkerDown(wd.apd.children[i], wd.back))) {
        return true;
      }
      i += wd.back ? -1 : 1;
    }
    return false;
  }
  traverseGrouping(grouping, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, grouping.experimentalEffectiveAmount);
    return this.traverseAlg(grouping.experimentalAlg, new WalkerDown(wd.apd.children[0], back));
  }
  traverseMove(move, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    this.move = move;
    this.moveDuration = wd.apd.duration;
    this.back = wd.back;
    return true;
  }
  traverseCommutator(commutator, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, commutator.experimentalEffectiveAmount);
    if (back) {
      return this.traverseAlg(commutator.B, new WalkerDown(wd.apd.children[2], !back)) || this.traverseAlg(commutator.A, new WalkerDown(wd.apd.children[1], !back)) || this.traverseAlg(commutator.B, new WalkerDown(wd.apd.children[2], back)) || this.traverseAlg(commutator.A, new WalkerDown(wd.apd.children[1], back));
    } else {
      return this.traverseAlg(commutator.A, new WalkerDown(wd.apd.children[1], back)) || this.traverseAlg(commutator.B, new WalkerDown(wd.apd.children[2], back)) || this.traverseAlg(commutator.A, new WalkerDown(wd.apd.children[1], !back)) || this.traverseAlg(commutator.B, new WalkerDown(wd.apd.children[2], !back));
    }
  }
  traverseConjugate(conjugate, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, conjugate.experimentalEffectiveAmount);
    if (back) {
      return this.traverseAlg(conjugate.A, new WalkerDown(wd.apd.children[1], !back)) || this.traverseAlg(conjugate.B, new WalkerDown(wd.apd.children[2], back)) || this.traverseAlg(conjugate.A, new WalkerDown(wd.apd.children[1], back));
    } else {
      return this.traverseAlg(conjugate.A, new WalkerDown(wd.apd.children[1], back)) || this.traverseAlg(conjugate.B, new WalkerDown(wd.apd.children[2], back)) || this.traverseAlg(conjugate.A, new WalkerDown(wd.apd.children[1], !back));
    }
  }
  traversePause(pause, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    this.move = pause;
    this.moveDuration = wd.apd.duration;
    this.back = wd.back;
    return true;
  }
  traverseNewline(_newline, _wd) {
    return false;
  }
  traverseLineComment(_lineComment, _wd) {
    return false;
  }
  firstcheck(wd) {
    if (wd.apd.moveCount + this.i <= this.goali && wd.apd.duration + this.dur < this.goaldur) {
      return this.keepgoing(wd);
    }
    return true;
  }
  domult(wd, amount) {
    let back = wd.back;
    if (amount === 0) {
      return back;
    }
    if (amount < 0) {
      back = !back;
      amount = -amount;
    }
    const base = wd.apd.children[0];
    const full = Math.min(Math.floor((this.goali - this.i) / base.moveCount), Math.ceil((this.goaldur - this.dur) / base.duration - 1));
    if (full > 0) {
      this.keepgoing(new WalkerDown(base, back), full);
    }
    return back;
  }
  keepgoing(wd, mul = 1) {
    this.i += mul * wd.apd.moveCount;
    this.dur += mul * wd.apd.duration;
    if (mul !== 1) {
      if (wd.back) {
        this.st = this.puz.combine(this.st, this.puz.multiply(wd.apd.backward, mul));
      } else {
        this.st = this.puz.combine(this.st, this.puz.multiply(wd.apd.forward, mul));
      }
    } else {
      if (wd.back) {
        this.st = this.puz.combine(this.st, wd.apd.backward);
      } else {
        this.st = this.puz.combine(this.st, wd.apd.forward);
      }
    }
    return false;
  }
};

// src/cubing/twisty/animation/indexer/tree/TreeAlgIndexer.ts
var TreeAlgIndexer = class {
  constructor(puzzle, alg) {
    this.puzzle = puzzle;
    const deccon = new DecoratorConstructor(this.puzzle);
    const chunkedAlg = chunkAlgs(alg);
    this.decoration = deccon.traverseAlg(chunkedAlg);
    this.walker = new AlgWalker(this.puzzle, chunkedAlg, this.decoration);
  }
  getMove(index) {
    if (this.walker.moveByIndex(index)) {
      if (!this.walker.move) {
        throw new Error("`this.walker.mv` missing");
      }
      const move = this.walker.move;
      if (this.walker.back) {
        return move.invert();
      }
      return move;
    }
    return null;
  }
  indexToMoveStartTimestamp(index) {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error("Out of algorithm: index " + index);
  }
  indexToMovesInProgress(index) {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error("Out of algorithm: index " + index);
  }
  stateAtIndex(index, startTransformation) {
    this.walker.moveByIndex(index);
    return this.puzzle.combine(startTransformation ?? this.puzzle.startState(), this.walker.st);
  }
  transformAtIndex(index) {
    this.walker.moveByIndex(index);
    return this.walker.st;
  }
  numMoves() {
    return this.decoration.moveCount;
  }
  timestampToIndex(timestamp) {
    this.walker.moveByDuration(timestamp);
    return this.walker.i;
  }
  algDuration() {
    return this.decoration.duration;
  }
  moveDuration(index) {
    this.walker.moveByIndex(index);
    return this.walker.moveDuration;
  }
};

// src/cubing/twisty/animation/cursor/CursorTypes.ts
var Direction;
(function(Direction2) {
  Direction2[Direction2["Forwards"] = 1] = "Forwards";
  Direction2[Direction2["Paused"] = 0] = "Paused";
  Direction2[Direction2["Backwards"] = -1] = "Backwards";
})(Direction || (Direction = {}));
function directionScalar(direction) {
  return direction;
}
var BoundaryType;
(function(BoundaryType2) {
  BoundaryType2[BoundaryType2["Move"] = 0] = "Move";
  BoundaryType2[BoundaryType2["EntireTimeline"] = 1] = "EntireTimeline";
})(BoundaryType || (BoundaryType = {}));

// src/cubing/twisty/animation/cursor/AlgCursor.ts
var AlgCursor = class {
  constructor(timeline, def, alg, startStateAlg, indexerConstructor) {
    this.timeline = timeline;
    this.def = def;
    this.alg = alg;
    this.positionListeners = new Set();
    this.indexerConstructor = TreeAlgIndexer;
    this.ksolvePuzzle = new KPuzzleWrapper(def);
    if (indexerConstructor) {
      this.indexerConstructor = this.indexerConstructor;
    }
    this.instantiateIndexer(alg);
    this.startState = startStateAlg ? this.algToState(startStateAlg) : this.ksolvePuzzle.startState();
    timeline.addTimestampListener(this);
  }
  setStartState(startState) {
    this.startState = startState;
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
  }
  experimentalSetIndexer(indexerConstructor) {
    this.indexerConstructor = indexerConstructor;
    this.instantiateIndexer(this.alg);
    this.timeline.onCursorChange(this);
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
  }
  instantiateIndexer(alg) {
    this.indexer = new this.indexerConstructor(this.ksolvePuzzle, alg);
  }
  algToState(s) {
    const kpuzzle = new KPuzzle(this.def);
    kpuzzle.applyAlg(s);
    return this.ksolvePuzzle.combine(this.def.startPieces, kpuzzle.state);
  }
  timeRange() {
    return {
      start: 0,
      end: this.indexer.algDuration()
    };
  }
  experimentalTimestampForStartOfLastMove() {
    const numMoves = this.indexer.numMoves();
    if (numMoves > 0) {
      return this.indexer.indexToMoveStartTimestamp(numMoves - 1);
    }
    return 0;
  }
  addPositionListener(positionListener) {
    this.positionListeners.add(positionListener);
    this.dispatchPositionForTimestamp(this.timeline.timestamp, [
      positionListener
    ]);
  }
  removePositionListener(positionListener) {
    this.positionListeners.delete(positionListener);
  }
  onTimelineTimestampChange(timestamp) {
    this.dispatchPositionForTimestamp(timestamp);
  }
  dispatchPositionForTimestamp(timestamp, listeners = this.positionListeners) {
    let position;
    if (this.indexer.timestampToPosition) {
      position = this.indexer.timestampToPosition(timestamp, this.startState);
    } else {
      const idx = this.indexer.timestampToIndex(timestamp);
      const state = this.indexer.stateAtIndex(idx, this.startState);
      position = {
        state,
        movesInProgress: []
      };
      if (this.indexer.numMoves() > 0) {
        const fraction = (timestamp - this.indexer.indexToMoveStartTimestamp(idx)) / this.indexer.moveDuration(idx);
        if (fraction === 1) {
          position.state = this.ksolvePuzzle.combine(state, this.ksolvePuzzle.stateFromMove(this.indexer.getMove(idx)));
        } else if (fraction > 0) {
          const move = this.indexer.getMove(idx);
          if (move) {
            position.movesInProgress.push({
              move,
              direction: Direction.Forwards,
              fraction
            });
          }
        }
      }
    }
    for (const listener of listeners) {
      listener.onPositionChange(position);
    }
  }
  onTimeRangeChange(_timeRange) {
  }
  setAlg(alg, indexerConstructor) {
    if (alg.isIdentical(this.alg) && this.indexerConstructor === indexerConstructor) {
      return;
    }
    this.indexerConstructor = indexerConstructor;
    this.alg = alg;
    this.instantiateIndexer(alg);
    this.timeline.onCursorChange(this);
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
  }
  moveBoundary(timestamp, direction) {
    if (this.indexer.numMoves() === 0) {
      return null;
    }
    const offsetHack = directionScalar(direction) * 1e-3;
    const idx = this.indexer.timestampToIndex(timestamp + offsetHack);
    const moveStart = this.indexer.indexToMoveStartTimestamp(idx);
    if (direction === Direction.Backwards) {
      return timestamp >= moveStart ? moveStart : null;
    } else {
      const moveEnd = moveStart + this.indexer.moveDuration(idx);
      return timestamp <= moveEnd ? moveEnd : null;
    }
  }
  setPuzzle(def, alg = this.alg, startStateAlg) {
    this.ksolvePuzzle = new KPuzzleWrapper(def);
    this.def = def;
    this.indexer = new this.indexerConstructor(this.ksolvePuzzle, alg);
    if (alg !== this.alg) {
      this.timeline.onCursorChange(this);
    }
    this.setStartState(startStateAlg ? this.algToState(startStateAlg) : this.ksolvePuzzle.startState());
    this.alg = alg;
  }
  experimentalTimestampFromIndex(index) {
    return this.indexer.indexToMoveStartTimestamp(index);
  }
  experimentalIndexFromTimestamp(timestamp) {
    return this.indexer.timestampToIndex(timestamp);
  }
};

// src/cubing/twisty/animation/indexer/SimpleAlgIndexer.ts
import {Alg as Alg5} from "cubing/alg";
import {countAnimatedMoves} from "cubing/notation";
var SimpleAlgIndexer = class {
  constructor(puzzle, alg) {
    this.puzzle = puzzle;
    this.durationFn = new AlgDuration(defaultDurationForAmount);
    this.moves = new Alg5(alg.experimentalExpand());
  }
  getMove(index) {
    return Array.from(this.moves.units())[index];
  }
  indexToMoveStartTimestamp(index) {
    const alg = new Alg5(Array.from(this.moves.units()).slice(0, index));
    return this.durationFn.traverseAlg(alg);
  }
  timestampToIndex(timestamp) {
    let cumulativeTime = 0;
    let i;
    for (i = 0; i < this.numMoves(); i++) {
      cumulativeTime += this.durationFn.traverseMove(this.getMove(i));
      if (cumulativeTime >= timestamp) {
        return i;
      }
    }
    return i;
  }
  stateAtIndex(index) {
    return this.puzzle.combine(this.puzzle.startState(), this.transformAtIndex(index));
  }
  transformAtIndex(index) {
    let state = this.puzzle.identity();
    for (const move of Array.from(this.moves.units()).slice(0, index)) {
      state = this.puzzle.combine(state, this.puzzle.stateFromMove(move));
    }
    return state;
  }
  algDuration() {
    return this.durationFn.traverseAlg(this.moves);
  }
  numMoves() {
    return countAnimatedMoves(this.moves);
  }
  moveDuration(index) {
    return this.durationFn.traverseMove(this.getMove(index));
  }
};

// src/cubing/twisty/animation/indexer/simultaneous-moves/SimultaneousMoveIndexer.ts
import {Move as Move6} from "cubing/alg";

// src/cubing/twisty/animation/indexer/simultaneous-moves/simul-moves.ts
import {
  TraversalUp as TraversalUp5,
  Move as Move5
} from "cubing/alg";
var axisLookup = {
  u: "y",
  l: "x",
  f: "z",
  r: "x",
  b: "z",
  d: "y",
  m: "x",
  e: "y",
  s: "z",
  x: "x",
  y: "y",
  z: "z"
};
function isSameAxis(move1, move2) {
  return axisLookup[move1.family[0].toLowerCase()] === axisLookup[move2.family[0].toLowerCase()];
}
var LocalSimulMoves = class extends TraversalUp5 {
  traverseAlg(alg) {
    const processed = [];
    for (const nestedUnit of alg.units()) {
      processed.push(this.traverseUnit(nestedUnit));
    }
    return Array.prototype.concat(...processed);
  }
  traverseGroupingOnce(alg) {
    if (alg.experimentalIsEmpty()) {
      return [];
    }
    for (const unit of alg.units()) {
      if (!unit.is(Move5))
        return this.traverseAlg(alg);
    }
    const moves = Array.from(alg.units());
    let maxSimulDur = defaultDurationForAmount(moves[0].effectiveAmount);
    for (let i = 0; i < moves.length - 1; i++) {
      for (let j = 1; j < moves.length; j++) {
        if (!isSameAxis(moves[i], moves[j])) {
          return this.traverseAlg(alg);
        }
      }
      maxSimulDur = Math.max(maxSimulDur, defaultDurationForAmount(moves[i].effectiveAmount));
    }
    const localMovesWithRange = moves.map((blockMove) => {
      return {
        move: blockMove,
        msUntilNext: 0,
        duration: maxSimulDur
      };
    });
    localMovesWithRange[localMovesWithRange.length - 1].msUntilNext = maxSimulDur;
    return localMovesWithRange;
  }
  traverseGrouping(grouping) {
    const processed = [];
    const segmentOnce = grouping.experimentalEffectiveAmount > 0 ? grouping.experimentalAlg : grouping.experimentalAlg.invert();
    for (let i = 0; i < Math.abs(grouping.experimentalEffectiveAmount); i++) {
      processed.push(this.traverseGroupingOnce(segmentOnce));
    }
    return Array.prototype.concat(...processed);
  }
  traverseMove(move) {
    const duration = defaultDurationForAmount(move.effectiveAmount);
    return [
      {
        move,
        msUntilNext: duration,
        duration
      }
    ];
  }
  traverseCommutator(commutator) {
    const processed = [];
    const segmentsOnce = commutator.experimentalEffectiveAmount > 0 ? [
      commutator.A,
      commutator.B,
      commutator.A.invert(),
      commutator.B.invert()
    ] : [
      commutator.B,
      commutator.A,
      commutator.B.invert(),
      commutator.A.invert()
    ];
    for (let i = 0; i < Math.abs(commutator.experimentalEffectiveAmount); i++) {
      for (const segment of segmentsOnce) {
        processed.push(this.traverseGroupingOnce(segment));
      }
    }
    return Array.prototype.concat(...processed);
  }
  traverseConjugate(conjugate) {
    const processed = [];
    const segmentsOnce = conjugate.experimentalEffectiveAmount > 0 ? [conjugate.A, conjugate.B, conjugate.A.invert()] : [conjugate.A, conjugate.B.invert(), conjugate.A.invert()];
    for (let i = 0; i < Math.abs(conjugate.experimentalEffectiveAmount); i++) {
      for (const segment of segmentsOnce) {
        processed.push(this.traverseGroupingOnce(segment));
      }
    }
    return Array.prototype.concat(...processed);
  }
  traversePause(_pause) {
    return [];
  }
  traverseNewline(_newline) {
    return [];
  }
  traverseLineComment(_comment) {
    return [];
  }
};
var localSimulMovesInstance = new LocalSimulMoves();
var localSimulMoves = localSimulMovesInstance.traverseAlg.bind(localSimulMovesInstance);
function simulMoves(a) {
  let timestamp = 0;
  const l = localSimulMoves(a).map((localSimulMove) => {
    const moveWithRange = {
      move: localSimulMove.move,
      start: timestamp,
      end: timestamp + localSimulMove.duration
    };
    timestamp += localSimulMove.msUntilNext;
    return moveWithRange;
  });
  return l;
}

// src/cubing/twisty/animation/indexer/simultaneous-moves/SimultaneousMoveIndexer.ts
var demos = {
  "y' y' U' E D R2 r2 F2 B2 U E D' R2 L2' z2 S2 U U D D S2 F2' B2": [
    {move: new Move6("y", -1), start: 0, end: 1e3},
    {move: new Move6("y", -1), start: 1e3, end: 2e3},
    {move: new Move6("U", -1), start: 1e3, end: 1600},
    {move: new Move6("E", 1), start: 1200, end: 1800},
    {move: new Move6("D"), start: 1400, end: 2e3},
    {move: new Move6("R", 2), start: 2e3, end: 3500},
    {move: new Move6("r", 2), start: 2e3, end: 3500},
    {move: new Move6("F", 2), start: 3500, end: 4200},
    {move: new Move6("B", 2), start: 3800, end: 4500},
    {move: new Move6("U", 1), start: 4500, end: 5500},
    {move: new Move6("E", 1), start: 4500, end: 5500},
    {move: new Move6("D", -1), start: 4500, end: 5500},
    {move: new Move6("R", 2), start: 5500, end: 6500},
    {move: new Move6("L", -2), start: 5500, end: 6500},
    {move: new Move6("z", 2), start: 5500, end: 6500},
    {move: new Move6("S", 2), start: 6500, end: 7500},
    {move: new Move6("U"), start: 7500, end: 8e3},
    {move: new Move6("U"), start: 8e3, end: 8500},
    {move: new Move6("D"), start: 7750, end: 8250},
    {move: new Move6("D"), start: 8250, end: 8750},
    {move: new Move6("S", 2), start: 8750, end: 9250},
    {move: new Move6("F", -2), start: 8750, end: 1e4},
    {move: new Move6("B", 2), start: 8750, end: 1e4}
  ],
  "M' R' U' D' M R": [
    {move: new Move6("M", -1), start: 0, end: 1e3},
    {move: new Move6("R", -1), start: 0, end: 1e3},
    {move: new Move6("U", -1), start: 1e3, end: 2e3},
    {move: new Move6("D", -1), start: 1e3, end: 2e3},
    {move: new Move6("M"), start: 2e3, end: 3e3},
    {move: new Move6("R"), start: 2e3, end: 3e3}
  ],
  "U' E' r E r2' E r U E": [
    {move: new Move6("U", -1), start: 0, end: 1e3},
    {move: new Move6("E", -1), start: 0, end: 1e3},
    {move: new Move6("r"), start: 1e3, end: 2500},
    {move: new Move6("E"), start: 2500, end: 3500},
    {move: new Move6("r", -2), start: 3500, end: 5e3},
    {move: new Move6("E"), start: 5e3, end: 6e3},
    {move: new Move6("r"), start: 6e3, end: 7e3},
    {move: new Move6("U"), start: 7e3, end: 8e3},
    {move: new Move6("E"), start: 7e3, end: 8e3}
  ]
};
var SimultaneousMoveIndexer = class {
  constructor(puzzle, alg) {
    this.puzzle = puzzle;
    this.moves = demos[alg.toString()] ?? simulMoves(alg);
  }
  getMove(index) {
    return this.moves[Math.min(index, this.moves.length - 1)].move;
  }
  getMoveWithRange(index) {
    return this.moves[Math.min(index, this.moves.length - 1)];
  }
  indexToMoveStartTimestamp(index) {
    let start = 0;
    if (this.moves.length > 0) {
      start = this.moves[Math.min(index, this.moves.length - 1)].start;
    }
    return start;
  }
  timestampToIndex(timestamp) {
    let i = 0;
    for (i = 0; i < this.moves.length; i++) {
      if (this.moves[i].start >= timestamp) {
        return Math.max(0, i - 1);
      }
    }
    return Math.max(0, i - 1);
  }
  timestampToPosition(timestamp, startTransformation) {
    const position = {
      state: startTransformation ?? this.puzzle.identity(),
      movesInProgress: []
    };
    for (const moveWithRange of this.moves) {
      if (moveWithRange.end <= timestamp) {
        position.state = this.puzzle.combine(position.state, this.puzzle.stateFromMove(moveWithRange.move));
      } else if (moveWithRange.start < timestamp && timestamp < moveWithRange.end) {
        position.movesInProgress.push({
          move: moveWithRange.move,
          direction: Direction.Forwards,
          fraction: (timestamp - moveWithRange.start) / (moveWithRange.end - moveWithRange.start)
        });
      } else if (timestamp < moveWithRange.start) {
        continue;
      }
    }
    return position;
  }
  stateAtIndex(index, startTransformation) {
    let state = startTransformation ?? this.puzzle.startState();
    for (let i = 0; i < this.moves.length && i < index; i++) {
      const moveWithRange = this.moves[i];
      state = this.puzzle.combine(state, this.puzzle.stateFromMove(moveWithRange.move));
    }
    return state;
  }
  transformAtIndex(index) {
    let state = this.puzzle.identity();
    for (const moveWithRange of this.moves.slice(0, index)) {
      state = this.puzzle.combine(state, this.puzzle.stateFromMove(moveWithRange.move));
    }
    return state;
  }
  algDuration() {
    let max = 0;
    for (const moveWithRange of this.moves) {
      max = Math.max(max, moveWithRange.end);
    }
    return max;
  }
  numMoves() {
    return this.moves.length;
  }
  moveDuration(index) {
    const move = this.getMoveWithRange(index);
    return move.end - move.start;
  }
};

// src/cubing/twisty/animation/Timeline.ts
var PAUSE_ON_JUMP = true;
var TimelineAction;
(function(TimelineAction2) {
  TimelineAction2["StartingToPlay"] = "StartingToPlay";
  TimelineAction2["Pausing"] = "Pausing";
  TimelineAction2["Jumping"] = "Jumping";
})(TimelineAction || (TimelineAction = {}));
var TimestampLocationType;
(function(TimestampLocationType2) {
  TimestampLocationType2["StartOfTimeline"] = "Start";
  TimestampLocationType2["EndOfTimeline"] = "End";
  TimestampLocationType2["StartOfMove"] = "StartOfMove";
  TimestampLocationType2["EndOfMove"] = "EndOfMove";
  TimestampLocationType2["MiddleOfMove"] = "MiddleOfMove";
  TimestampLocationType2["BetweenMoves"] = "BetweenMoves";
})(TimestampLocationType || (TimestampLocationType = {}));
function getNow() {
  return Math.round(performance.now());
}
var Timeline = class {
  constructor() {
    this.animating = false;
    this.tempoScale = 1;
    this.cursors = new Set();
    this.timestampListeners = new Set();
    this.actionListeners = new Set();
    this.timestamp = 0;
    this.lastAnimFrameNow = 0;
    this.direction = Direction.Forwards;
    this.boundaryType = BoundaryType.EntireTimeline;
    const animFrame = (_now) => {
      if (this.animating) {
        const now = getNow();
        this.timestamp = this.timestamp + this.tempoScale * directionScalar(this.direction) * (now - this.lastAnimFrameNow);
        this.lastAnimFrameNow = now;
        const atOrPastBoundary = this.direction === Direction.Backwards ? this.timestamp <= this.cachedNextBoundary : this.timestamp >= this.cachedNextBoundary;
        if (atOrPastBoundary) {
          this.timestamp = this.cachedNextBoundary;
          if (this.animating) {
            this.animating = false;
            this.dispatchAction(TimelineAction.Pausing);
          }
        }
      }
      if (this.timestamp !== this.lastAnimFrameTimestamp) {
        this.dispatchTimestamp();
        this.lastAnimFrameTimestamp = this.timestamp;
      }
      if (this.animating) {
        this.scheduler.requestAnimFrame();
      }
    };
    this.scheduler = new RenderScheduler(animFrame);
  }
  addCursor(cursor) {
    this.cursors.add(cursor);
    this.dispatchTimeRange();
  }
  removeCursor(cursor) {
    this.cursors.delete(cursor);
    this.clampTimestampToRange();
    this.dispatchTimeRange();
  }
  clampTimestampToRange() {
    const timeRange = this.timeRange();
    if (this.timestamp < timeRange.start) {
      this.setTimestamp(timeRange.start);
    }
    if (this.timestamp > timeRange.end) {
      this.setTimestamp(timeRange.end);
    }
  }
  onCursorChange(_cursor) {
    if (this.timestamp > this.maxTimestamp()) {
      this.timestamp = this.maxTimestamp();
    }
    this.dispatchTimeRange();
  }
  timeRange() {
    let start = 0;
    let end = 0;
    for (const cursor of this.cursors) {
      const cursorTimeRange = cursor.timeRange();
      start = Math.min(start, cursorTimeRange.start);
      end = Math.max(end, cursorTimeRange.end);
    }
    return {start, end};
  }
  minTimestamp() {
    return this.timeRange().start;
  }
  maxTimestamp() {
    return this.timeRange().end;
  }
  dispatchTimeRange() {
    const timeRange = this.timeRange();
    for (const listener of this.cursors) {
      listener.onTimeRangeChange(timeRange);
    }
    for (const listener of this.timestampListeners) {
      listener.onTimeRangeChange(timeRange);
    }
  }
  dispatchTimestamp() {
    for (const listener of this.cursors) {
      listener.onTimelineTimestampChange(this.timestamp);
    }
    for (const listener of this.timestampListeners) {
      listener.onTimelineTimestampChange(this.timestamp);
    }
  }
  addTimestampListener(timestampListener) {
    this.timestampListeners.add(timestampListener);
  }
  removeTimestampListener(timestampListener) {
    this.timestampListeners.delete(timestampListener);
  }
  addActionListener(actionListener) {
    this.actionListeners.add(actionListener);
  }
  removeActionListener(actionListener) {
    this.actionListeners.delete(actionListener);
  }
  play() {
    this.experimentalPlay(Direction.Forwards, BoundaryType.EntireTimeline);
  }
  experimentalPlay(direction, boundaryType = BoundaryType.EntireTimeline) {
    this.direction = direction;
    this.boundaryType = boundaryType;
    const nextBoundary = this.nextBoundary(this.timestamp, direction, this.boundaryType);
    if (nextBoundary === null) {
      return;
    }
    this.cachedNextBoundary = nextBoundary;
    if (!this.animating) {
      this.animating = true;
      this.lastAnimFrameNow = getNow();
      this.dispatchAction(TimelineAction.StartingToPlay);
      this.scheduler.requestAnimFrame();
    }
  }
  nextBoundary(timestamp, direction, boundaryType = BoundaryType.EntireTimeline) {
    switch (boundaryType) {
      case BoundaryType.EntireTimeline: {
        switch (direction) {
          case Direction.Backwards:
            return timestamp <= this.minTimestamp() ? null : this.minTimestamp();
          case Direction.Forwards:
            return timestamp >= this.maxTimestamp() ? null : this.maxTimestamp();
          default:
            throw new Error("invalid direction");
        }
      }
      case BoundaryType.Move: {
        let result = null;
        for (const cursor of this.cursors) {
          const boundaryTimestamp = cursor.moveBoundary(timestamp, direction);
          if (boundaryTimestamp !== null) {
            switch (direction) {
              case Direction.Backwards: {
                result = Math.min(result ?? boundaryTimestamp, boundaryTimestamp);
                break;
              }
              case Direction.Forwards: {
                result = Math.max(result ?? boundaryTimestamp, boundaryTimestamp);
                break;
              }
              default:
                throw new Error("invalid direction");
            }
          }
        }
        return result;
      }
      default:
        throw new Error("invalid boundary type");
    }
  }
  pause() {
    if (this.animating) {
      this.animating = false;
      this.dispatchAction(TimelineAction.Pausing);
      this.scheduler.requestAnimFrame();
    }
  }
  playPause() {
    if (this.animating) {
      this.pause();
    } else {
      if (this.timestamp >= this.maxTimestamp()) {
        this.timestamp = 0;
      }
      this.experimentalPlay(Direction.Forwards, BoundaryType.EntireTimeline);
    }
  }
  setTimestamp(timestamp) {
    const oldTimestamp = this.timestamp;
    this.timestamp = timestamp;
    this.lastAnimFrameNow = getNow();
    if (oldTimestamp !== timestamp) {
      this.dispatchAction(TimelineAction.Jumping);
      this.scheduler.requestAnimFrame();
    }
    if (PAUSE_ON_JUMP) {
      this.animating = false;
      this.dispatchAction(TimelineAction.Pausing);
    }
  }
  jumpToStart() {
    this.setTimestamp(this.minTimestamp());
  }
  jumpToEnd() {
    this.setTimestamp(this.maxTimestamp());
  }
  experimentalJumpToLastMove() {
    let max = 0;
    for (const cursor of this.cursors) {
      max = Math.max(max, cursor.experimentalTimestampForStartOfLastMove() ?? 0);
    }
    this.setTimestamp(max);
  }
  dispatchAction(event) {
    let locationType = TimestampLocationType.MiddleOfMove;
    switch (this.timestamp) {
      case this.minTimestamp():
        locationType = TimestampLocationType.StartOfTimeline;
        break;
      case this.maxTimestamp():
        locationType = TimestampLocationType.EndOfTimeline;
        break;
    }
    const actionEvent = {
      action: event,
      locationType
    };
    for (const listener of this.actionListeners) {
      listener.onTimelineAction(actionEvent);
    }
  }
};

// src/cubing/twisty/dom/TwistyPlayer.ts
import {countMoves} from "cubing/notation";

// src/cubing/twisty/dom/controls/buttons.css.ts
var buttonGridCSS = new CSSSource(`
:host {
  width: 384px;
  height: 24px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.wrapper {
  grid-auto-flow: column;
}

.viewer-link-none .twizzle-link-button {
  display: none;
}

.wrapper twisty-control-button {
  width: inherit;
  height: inherit;
}
`);
var buttonCSS = new CSSSource(`
:host {
  width: 48px;
  height: 24px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
}

button {
  width: 100%;
  height: 100%;
  border: none;
  
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;

  background-color: rgba(196, 196, 196, 0.75);
}

button:enabled {
  background-color: rgba(196, 196, 196, 0.75)
}

button:disabled {
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0.25;
  pointer-events: none;
}

button:enabled:hover {
  background-color: rgba(255, 255, 255, 0.75);
  box-shadow: 0 0 1em rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

/* TODO: fullscreen icons have too much padding?? */
button.svg-skip-to-start {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNjQzIDEwMzdxMTktMTkgMzItMTN0MTMgMzJ2MTQ3MnEwIDI2LTEzIDMydC0zMi0xM2wtNzEwLTcxMHEtOS05LTEzLTE5djcxMHEwIDI2LTEzIDMydC0zMi0xM2wtNzEwLTcxMHEtOS05LTEzLTE5djY3OHEwIDI2LTE5IDQ1dC00NSAxOUg5NjBxLTI2IDAtNDUtMTl0LTE5LTQ1VjEwODhxMC0yNiAxOS00NXQ0NS0xOWgxMjhxMjYgMCA0NSAxOXQxOSA0NXY2NzhxNC0xMSAxMy0xOWw3MTAtNzEwcTE5LTE5IDMyLTEzdDEzIDMydjcxMHE0LTExIDEzLTE5eiIvPjwvc3ZnPg==");
}

button.svg-skip-to-end {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik05NDEgMjU0N3EtMTkgMTktMzIgMTN0LTEzLTMyVjEwNTZxMC0yNiAxMy0zMnQzMiAxM2w3MTAgNzEwcTggOCAxMyAxOXYtNzEwcTAtMjYgMTMtMzJ0MzIgMTNsNzEwIDcxMHE4IDggMTMgMTl2LTY3OHEwLTI2IDE5LTQ1dDQ1LTE5aDEyOHEyNiAwIDQ1IDE5dDE5IDQ1djE0MDhxMCAyNi0xOSA0NXQtNDUgMTloLTEyOHEtMjYgMC00NS0xOXQtMTktNDV2LTY3OHEtNSAxMC0xMyAxOWwtNzEwIDcxMHEtMTkgMTktMzIgMTN0LTEzLTMydi03MTBxLTUgMTAtMTMgMTl6Ii8+PC9zdmc+");
}

button.svg-step-forward {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNjg4IDE1NjhxMCAyNi0xOSA0NWwtNTEyIDUxMnEtMTkgMTktNDUgMTl0LTQ1LTE5cS0xOS0xOS0xOS00NXYtMjU2aC0yMjRxLTk4IDAtMTc1LjUgNnQtMTU0IDIxLjVxLTc2LjUgMTUuNS0xMzMgNDIuNXQtMTA1LjUgNjkuNXEtNDkgNDIuNS04MCAxMDF0LTQ4LjUgMTM4LjVxLTE3LjUgODAtMTcuNSAxODEgMCA1NSA1IDEyMyAwIDYgMi41IDIzLjV0Mi41IDI2LjVxMCAxNS04LjUgMjV0LTIzLjUgMTBxLTE2IDAtMjgtMTctNy05LTEzLTIydC0xMy41LTMwcS03LjUtMTctMTAuNS0yNC0xMjctMjg1LTEyNy00NTEgMC0xOTkgNTMtMzMzIDE2Mi00MDMgODc1LTQwM2gyMjR2LTI1NnEwLTI2IDE5LTQ1dDQ1LTE5cTI2IDAgNDUgMTlsNTEyIDUxMnExOSAxOSAxOSA0NXoiLz48L3N2Zz4=");
}

button.svg-step-backward {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNjg4IDIwNDhxMCAxNjYtMTI3IDQ1MS0zIDctMTAuNSAyNHQtMTMuNSAzMHEtNiAxMy0xMyAyMi0xMiAxNy0yOCAxNy0xNSAwLTIzLjUtMTB0LTguNS0yNXEwLTkgMi41LTI2LjV0Mi41LTIzLjVxNS02OCA1LTEyMyAwLTEwMS0xNy41LTE4MXQtNDguNS0xMzguNXEtMzEtNTguNS04MC0xMDF0LTEwNS41LTY5LjVxLTU2LjUtMjctMTMzLTQyLjV0LTE1NC0yMS41cS03Ny41LTYtMTc1LjUtNmgtMjI0djI1NnEwIDI2LTE5IDQ1dC00NSAxOXEtMjYgMC00NS0xOWwtNTEyLTUxMnEtMTktMTktMTktNDV0MTktNDVsNTEyLTUxMnExOS0xOSA0NS0xOXQ0NSAxOXExOSAxOSAxOSA0NXYyNTZoMjI0cTcxMyAwIDg3NSA0MDMgNTMgMTM0IDUzIDMzM3oiLz48L3N2Zz4=");
}

button.svg-pause {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNTYwIDEwODh2MTQwOHEwIDI2LTE5IDQ1dC00NSAxOWgtNTEycS0yNiAwLTQ1LTE5dC0xOS00NVYxMDg4cTAtMjYgMTktNDV0NDUtMTloNTEycTI2IDAgNDUgMTl0MTkgNDV6bS04OTYgMHYxNDA4cTAgMjYtMTkgNDV0LTQ1IDE5aC01MTJxLTI2IDAtNDUtMTl0LTE5LTQ1VjEwODhxMC0yNiAxOS00NXQ0NS0xOWg1MTJxMjYgMCA0NSAxOXQxOSA0NXoiLz48L3N2Zz4=");
}

button.svg-play {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNDcyLjUgMTgyM2wtMTMyOCA3MzhxLTIzIDEzLTM5LjUgM3QtMTYuNS0zNlYxMDU2cTAtMjYgMTYuNS0zNnQzOS41IDNsMTMyOCA3MzhxMjMgMTMgMjMgMzF0LTIzIDMxeiIvPjwvc3ZnPg==");
}

button.svg-enter-fullscreen {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgd2lkdGg9IjI4Ij48cGF0aCBkPSJNMiAyaDI0djI0SDJ6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTkgMTZIN3Y1aDV2LTJIOXYtM3ptLTItNGgyVjloM1Y3SDd2NXptMTIgN2gtM3YyaDV2LTVoLTJ2M3pNMTYgN3YyaDN2M2gyVjdoLTV6Ii8+PC9zdmc+");
}

button.svg-exit-fullscreen {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgd2lkdGg9IjI4Ij48cGF0aCBkPSJNMiAyaDI0djI0SDJ6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTcgMThoM3YzaDJ2LTVIN3Yyem0zLThIN3YyaDVWN2gtMnYzem02IDExaDJ2LTNoM3YtMmgtNXY1em0yLTExVjdoLTJ2NWg1di0yaC0zeiIvPjwvc3ZnPg==");
}

button.svg-twizzle-tw {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODY0IiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzk3LjU4MSAxNTEuMTh2NTcuMDg0aC04OS43MDN2MjQwLjM1MmgtNjYuOTU1VjIwOC4yNjRIMTUxLjIydi01Ny4wODNoMjQ2LjM2MXptNTQuMzEgNzEuNjc3bDcuNTEyIDMzLjY5MmMyLjcxOCAxMi4xNiA1LjU4IDI0LjY4IDguNTg0IDM3LjU1NWEyMTgwLjc3NSAyMTgwLjc3NSAwIDAwOS40NDIgMzguODQzIDEyNjYuMyAxMjY2LjMgMCAwMDEwLjA4NiAzNy41NTVjMy43Mi0xMi41OSA3LjM2OC0yNS40NjYgMTAuOTQ1LTM4LjYyOCAzLjU3Ni0xMy4xNjIgNy4wMS0yNi4xMSAxMC4zLTM4Ljg0M2w1Ljc2OS0yMi40NTZjMS4yNDgtNC44ODcgMi40NzItOS43MDUgMy42NzQtMTQuNDU1IDMuMDA0LTExLjg3NSA1LjY1MS0yMi45NjIgNy45NC0zMy4yNjNoNDYuMzU0bDIuMzg0IDEwLjU2M2EyMDAwLjc3IDIwMDAuNzcgMCAwMDMuOTM1IDE2LjgyOGw2LjcxMSAyNy43MWMxLjIxMyA0Ljk1NiAyLjQ1IDkuOTggMy43MDkgMTUuMDczYTMxMTkuNzc3IDMxMTkuNzc3IDAgMDA5Ljg3MSAzOC44NDMgMTI0OS4yMjcgMTI0OS4yMjcgMCAwMDEwLjczIDM4LjYyOCAxOTA3LjYwNSAxOTA3LjYwNSAwIDAwMTAuMzAxLTM3LjU1NSAxMzk3Ljk0IDEzOTcuOTQgMCAwMDkuNjU3LTM4Ljg0M2w0LjQtMTkuMDQ2Yy43MTUtMy4xMyAxLjQyMS02LjIzNiAyLjExOC05LjMyMWw5LjU3Ny00Mi44OGg2Ni41MjZhMjk4OC43MTggMjk4OC43MTggMCAwMS0xOS41MjkgNjYuMzExbC01LjcyOCAxOC40ODJhMzIzNy40NiAzMjM3LjQ2IDAgMDEtMTQuMDE1IDQzLjc1MmMtNi40MzggMTkuNi0xMi43MzMgMzcuNjk4LTE4Ljg4NSA1NC4yOTRsLTMuMzA2IDguODI1Yy00Ljg4NCAxMi44OTgtOS40MzMgMjQuMjYzLTEzLjY0NyAzNC4wOTVoLTQ5Ljc4N2E4NDE3LjI4OSA4NDE3LjI4OSAwIDAxLTIxLjAzMS02NC44MDkgMTI4OC42ODYgMTI4OC42ODYgMCAwMS0xOC44ODUtNjQuODEgMTk3Mi40NDQgMTk3Mi40NDQgMCAwMS0xOC4yNCA2NC44MSAyNTc5LjQxMiAyNTc5LjQxMiAwIDAxLTIwLjM4OCA2NC44MWgtNDkuNzg3Yy00LjY4Mi0xMC45MjYtOS43Mi0yMy43NDMtMTUuMTEtMzguNDUxbC0xLjYyOS00LjQ3Yy01LjI1OC0xNC41MjEtMTAuNjgtMzAuMTkyLTE2LjI2Ni00Ny4wMTRsLTIuNDA0LTcuMjhjLTYuNDM4LTE5LjYtMTMuMDItNDAuMzQ0LTE5Ljc0My02Mi4yMzRhMjk4OC43MDcgMjk4OC43MDcgMCAwMS0xOS41MjktNjYuMzExaDY3LjM4NXoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==");
}
`);

// src/cubing/twisty/dom/controls/buttons.ts
var TwistyControlButton = class extends ManagedCustomElement {
  constructor(timeline, timelineCommand, options) {
    super();
    this.currentIconName = null;
    this.button = document.createElement("button");
    this.fullscreenElement = null;
    this.visitTwizzleLinkCallback = null;
    this.fullscreenElement = options?.fullscreenElement ?? null;
    this.visitTwizzleLinkCallback = options?.visitTwizzleLinkCallback ?? null;
    if (!timeline) {
      console.warn("Must have timeline!");
    }
    this.timeline = timeline;
    if (!timelineCommand) {
      console.warn("Must have timelineCommand!");
    }
    this.timelineCommand = timelineCommand;
    this.addCSS(buttonCSS);
    this.setIcon(this.initialIcon());
    this.setHoverTitle(this.initialHoverTitle());
    this.addElement(this.button);
    this.addEventListener("click", this.onPress.bind(this));
    switch (this.timelineCommand) {
      case "fullscreen":
        if (!document.fullscreenEnabled) {
          this.button.disabled = true;
        }
        break;
      case "jump-to-start":
      case "play-step-backwards":
        this.button.disabled = true;
        break;
    }
    if (this.timeline) {
      this.timeline.addActionListener(this);
      switch (this.timelineCommand) {
        case "play-pause":
        case "play-step-backwards":
        case "play-step":
          this.timeline.addTimestampListener(this);
          break;
      }
      this.autoSetTimelineBasedDisabled();
    }
  }
  autoSetTimelineBasedDisabled() {
    switch (this.timelineCommand) {
      case "jump-to-start":
      case "play-pause":
      case "play-step-backwards":
      case "play-step":
      case "jump-to-end": {
        const timeRange = this.timeline.timeRange();
        if (timeRange.start === timeRange.end) {
          this.button.disabled = true;
          return;
        }
        switch (this.timelineCommand) {
          case "jump-to-start":
          case "play-step-backwards":
            this.button.disabled = this.timeline.timestamp < this.timeline.maxTimestamp();
            break;
          case "jump-to-end":
          case "play-step":
            this.button.disabled = this.timeline.timestamp > this.timeline.minTimestamp();
            break;
          default:
            this.button.disabled = false;
        }
        break;
      }
    }
  }
  setIcon(buttonIconName) {
    if (this.currentIconName === buttonIconName) {
      return;
    }
    if (this.currentIconName) {
      this.button.classList.remove(`svg-${this.currentIconName}`);
    }
    this.button.classList.add(`svg-${buttonIconName}`);
    this.currentIconName = buttonIconName;
  }
  initialIcon() {
    const map = {
      "jump-to-start": "skip-to-start",
      "play-pause": "play",
      "play-step": "step-forward",
      "play-step-backwards": "step-backward",
      "jump-to-end": "skip-to-end",
      fullscreen: "enter-fullscreen",
      "twizzle-link": "twizzle-tw"
    };
    return map[this.timelineCommand];
  }
  initialHoverTitle() {
    const map = {
      "jump-to-start": "Restart",
      "play-pause": "Play",
      "play-step": "Step forward",
      "play-step-backwards": "Step backward",
      "jump-to-end": "Skip to End",
      fullscreen: "Enter fullscreen",
      "twizzle-link": "View at Twizzle"
    };
    return map[this.timelineCommand];
  }
  setHoverTitle(title) {
    this.button.title = title;
  }
  onPress() {
    switch (this.timelineCommand) {
      case "fullscreen":
        if (document.fullscreenElement === this.fullscreenElement) {
          document.exitFullscreen();
        } else {
          this.setIcon("exit-fullscreen");
          this.fullscreenElement.requestFullscreen().then(() => {
            const onFullscreen = () => {
              if (document.fullscreenElement !== this.fullscreenElement) {
                this.setIcon("enter-fullscreen");
                window.removeEventListener("fullscreenchange", onFullscreen);
              }
            };
            window.addEventListener("fullscreenchange", onFullscreen);
          });
        }
        break;
      case "jump-to-start":
        this.timeline.setTimestamp(0);
        break;
      case "jump-to-end":
        this.timeline.jumpToEnd();
        break;
      case "play-pause":
        this.timeline.playPause();
        break;
      case "play-step":
        this.timeline.experimentalPlay(Direction.Forwards, BoundaryType.Move);
        break;
      case "play-step-backwards":
        this.timeline.experimentalPlay(Direction.Backwards, BoundaryType.Move);
        break;
      case "twizzle-link":
        if (this.visitTwizzleLinkCallback) {
          this.visitTwizzleLinkCallback();
        }
        break;
    }
  }
  onTimelineAction(actionEvent) {
    switch (this.timelineCommand) {
      case "jump-to-start":
        this.button.disabled = actionEvent.locationType === TimestampLocationType.StartOfTimeline && actionEvent.action !== TimelineAction.StartingToPlay;
        break;
      case "jump-to-end":
        this.button.disabled = actionEvent.locationType === TimestampLocationType.EndOfTimeline && actionEvent.action !== TimelineAction.StartingToPlay;
        break;
      case "play-pause":
        switch (actionEvent.action) {
          case TimelineAction.Pausing:
            this.setIcon("play");
            this.setHoverTitle("Play");
            break;
          case TimelineAction.StartingToPlay:
            this.setIcon("pause");
            this.setHoverTitle("Pause");
            break;
        }
        break;
      case "play-step":
        this.button.disabled = actionEvent.locationType === TimestampLocationType.EndOfTimeline && actionEvent.action !== TimelineAction.StartingToPlay;
        break;
      case "play-step-backwards":
        this.button.disabled = actionEvent.locationType === TimestampLocationType.StartOfTimeline && actionEvent.action !== TimelineAction.StartingToPlay;
        break;
    }
  }
  onTimelineTimestampChange(_timestamp) {
  }
  onTimeRangeChange(_timeRange) {
    this.autoSetTimelineBasedDisabled();
  }
};
customElementsShim.define("twisty-control-button", TwistyControlButton);
var _viewerLinkClassListManager;
var TwistyControlButtonPanel = class extends ManagedCustomElement {
  constructor(timeline, options) {
    super();
    _viewerLinkClassListManager.set(this, new ClassListManager(this, "viewer-link-", ["none", "twizzle"]));
    this.addCSS(buttonGridCSS);
    __privateGet(this, _viewerLinkClassListManager).setValue(options?.viewerLink ?? "none");
    this.addElement(new TwistyControlButton(timeline, "fullscreen", {
      fullscreenElement: options?.fullscreenElement
    }));
    this.addElement(new TwistyControlButton(timeline, "jump-to-start"));
    this.addElement(new TwistyControlButton(timeline, "play-step-backwards"));
    this.addElement(new TwistyControlButton(timeline, "play-pause"));
    this.addElement(new TwistyControlButton(timeline, "play-step"));
    this.addElement(new TwistyControlButton(timeline, "jump-to-end"));
    this.addElement(new TwistyControlButton(timeline, "twizzle-link", {
      visitTwizzleLinkCallback: options?.viewerLinkCallback
    })).classList.add("twizzle-link-button");
  }
  setViewerLink(viewerLink) {
    __privateGet(this, _viewerLinkClassListManager).setValue(viewerLink);
  }
};
_viewerLinkClassListManager = new WeakMap();
customElementsShim.define("twisty-control-button-panel", TwistyControlButtonPanel);

// src/cubing/twisty/dom/controls/TwistyScrubber.css.ts
var twistyScrubberCSS = new CSSSource(`
:host {
  width: 384px;
  height: 16px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

input {
  margin: 0; width: 100%;
}

input {
  background: none;
}

::-moz-range-track {
  background: rgba(0, 0, 0, 0.25);
  height: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

::-webkit-slider-runnable-track {
  background: rgba(0, 0, 0, 0.05);
}

::-moz-range-progress {
  background: #3273F6;
  height: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

::-ms-fill-lower {
  background: #3273F6;
  height: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
`);

// src/cubing/twisty/dom/controls/TwistyScrubber.ts
var TwistyScrubber = class extends ManagedCustomElement {
  constructor(timeline) {
    super();
    this.range = document.createElement("input");
    this.timeline = timeline;
    this.addCSS(twistyScrubberCSS);
    this.timeline?.addTimestampListener(this);
    this.range.type = "range";
    this.range.step = 1 .toString();
    this.range.min = this.timeline?.minTimestamp().toString();
    this.range.max = this.timeline?.maxTimestamp().toString();
    this.range.value = this.timeline?.timestamp.toString();
    this.range.addEventListener("input", this.onInput.bind(this));
    this.addElement(this.range);
  }
  onTimelineTimestampChange(timestamp) {
    this.range.value = timestamp.toString();
  }
  onTimeRangeChange(timeRange) {
    this.range.min = timeRange.start.toString();
    this.range.max = timeRange.end.toString();
  }
  onInput() {
    this.timeline.setTimestamp(parseInt(this.range.value, 10));
  }
};
customElementsShim.define("twisty-scrubber", TwistyScrubber);

// src/cubing/twisty/dom/TwistyPlayer.css.ts
var twistyPlayerCSS = new CSSSource(`
:host {
  width: 384px;
  height: 256px;
  display: grid;
}

.wrapper {
  display: grid;
  overflow: hidden;
  grid-template-rows: 7fr 1em 1fr;
}

.wrapper > * {
  width: inherit;
  height: inherit;
  overflow: hidden;
}

.wrapper.controls-none {
  grid-template-rows: 7fr;
}

.wrapper.controls-none twisty-scrubber,
.wrapper.controls-none twisty-control-button-panel {
  display: none;
}

twisty-scrubber {
  background: rgba(196, 196, 196, 0.5);
}

.wrapper.checkered {
  background-color: #EAEAEA;
  background-image: linear-gradient(45deg, #DDD 25%, transparent 25%, transparent 75%, #DDD 75%, #DDD),
    linear-gradient(45deg, #DDD 25%, transparent 25%, transparent 75%, #DDD 75%, #DDD);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
}
`);

// src/cubing/twisty/dom/viewers/Twisty2DSVG.ts
import {
  combineTransformations as combineTransformations2,
  KPuzzleSVGWrapper,
  transformationForMove as transformationForMove2
} from "cubing/kpuzzle";

// src/cubing/twisty/dom/viewers/Twisty2DSVGView.css.ts
var twisty2DSVGCSS = new CSSSource(`
:host {
  width: 384px;
  height: 256px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
}

.svg-wrapper,
twisty-2d-svg,
svg {
  width: 100%;
  height: 100%;
  display: grid;
  min-height: 0;
}
`);

// src/cubing/twisty/dom/viewers/Twisty2DSVG.ts
var _cachedPosition;
var Twisty2DSVG = class extends ManagedCustomElement {
  constructor(cursor, def, svgSource, options, puzzleLoader) {
    super();
    this.svgSource = svgSource;
    this.options = options;
    this.puzzleLoader = puzzleLoader;
    this.scheduler = new RenderScheduler(this.render.bind(this));
    _cachedPosition.set(this, null);
    this.addCSS(twisty2DSVGCSS);
    this.definition = def;
    this.resetSVG();
    cursor?.addPositionListener(this);
    if (this.options?.experimentalStickering) {
      this.experimentalSetStickering(this.options.experimentalStickering);
    }
  }
  onPositionChange(position) {
    if (position.movesInProgress.length > 0) {
      const move = position.movesInProgress[0].move;
      const def = this.definition;
      let partialMove = move;
      if (position.movesInProgress[0].direction === Direction.Backwards) {
        partialMove = move.invert();
      }
      const newState = combineTransformations2(def, position.state, transformationForMove2(def, partialMove));
      this.svg.draw(this.definition, position.state, newState, position.movesInProgress[0].fraction);
    } else {
      this.svg.draw(this.definition, position.state);
      __privateSet(this, _cachedPosition, position);
    }
  }
  scheduleRender() {
    this.scheduler.requestAnimFrame();
  }
  experimentalSetStickering(stickering) {
    (async () => {
      if (!this.puzzleLoader?.appearance) {
        return;
      }
      const appearance = await this.puzzleLoader.appearance(stickering);
      this.resetSVG(appearance);
    })();
  }
  resetSVG(appearance) {
    if (this.svg) {
      this.removeElement(this.svg.element);
    }
    if (!this.definition) {
      return;
    }
    this.svg = new KPuzzleSVGWrapper(this.definition, this.svgSource, appearance);
    this.addElement(this.svg.element);
    if (__privateGet(this, _cachedPosition)) {
      this.onPositionChange(__privateGet(this, _cachedPosition));
    }
  }
  render() {
  }
};
_cachedPosition = new WeakMap();
customElementsShim.define("twisty-2d-svg", Twisty2DSVG);

// src/cubing/twisty/dom/TwistyPlayer.ts
function is3DVisualization(visualizationFormat) {
  return ["3D", "PG3D"].includes(visualizationFormat);
}
var indexerMap = {
  simple: SimpleAlgIndexer,
  tree: TreeAlgIndexer,
  simultaneous: SimultaneousMoveIndexer
};
var _config, _connected, _legacyExperimentalPG3DViewConfig, _experimentalStartStateOverride, _hackyPendingFinalMoveCoalesce, _viewerWrapper, _controlsClassListManager, _cursorIndexerName, _pendingPuzzleUpdates, _renderMode;
var TwistyPlayer = class extends ManagedCustomElement {
  constructor(initialConfig = {}, legacyExperimentalPG3DViewConfig = null, experimentalInvalidInitialAlgCallback = () => {
  }) {
    super();
    this.experimentalInvalidInitialAlgCallback = experimentalInvalidInitialAlgCallback;
    _config.set(this, void 0);
    this.scene = null;
    this.twisty3D = null;
    _connected.set(this, false);
    _legacyExperimentalPG3DViewConfig.set(this, null);
    this.legacyExperimentalPG3D = null;
    _experimentalStartStateOverride.set(this, null);
    this.viewerElems = [];
    this.controlElems = [];
    _hackyPendingFinalMoveCoalesce.set(this, false);
    _viewerWrapper.set(this, void 0);
    this.legacyExperimentalCoalesceModFunc = (_move) => 0;
    _controlsClassListManager.set(this, new ClassListManager(this, "controls-", ["none", "bottom-row"]));
    _cursorIndexerName.set(this, "tree");
    _pendingPuzzleUpdates.set(this, []);
    _renderMode.set(this, null);
    this.addCSS(twistyPlayerCSS);
    __privateSet(this, _config, new TwistyPlayerConfig(this, initialConfig));
    this.timeline = new Timeline();
    this.timeline.addActionListener(this);
    this.contentWrapper.classList.add("checkered");
    __privateSet(this, _legacyExperimentalPG3DViewConfig, legacyExperimentalPG3DViewConfig);
  }
  set alg(newAlg) {
    if (typeof newAlg === "string") {
      newAlg = Alg8.fromString(newAlg);
    }
    __privateGet(this, _config).attributes["alg"].setValue(newAlg);
    this.cursor?.setAlg(newAlg, this.indexerConstructor());
    this.setCursorStartState();
  }
  get alg() {
    return __privateGet(this, _config).attributes["alg"].value;
  }
  set experimentalSetupAlg(newAlg) {
    if (typeof newAlg === "string") {
      console.warn("`experimentalSetupAlg` for a `TwistyPlayer` was set using a string. It should be set using a `Sequence`!");
      newAlg = new Alg8(newAlg);
    }
    __privateGet(this, _config).attributes["experimental-setup-alg"].setValue(newAlg);
    this.setCursorStartState();
  }
  get experimentalSetupAlg() {
    return __privateGet(this, _config).attributes["experimental-setup-alg"].value;
  }
  setCursorStartState() {
    if (this.cursor) {
      this.cursor.setStartState(__privateGet(this, _experimentalStartStateOverride) ?? this.cursor.algToState(this.cursorStartAlg()));
    }
  }
  cursorStartAlg() {
    let startAlg = this.experimentalSetupAlg;
    if (this.experimentalSetupAnchor === "end") {
      startAlg = startAlg.concat(this.alg.invert());
    }
    return startAlg;
  }
  set experimentalSetupAnchor(setupToLocation) {
    __privateGet(this, _config).attributes["experimental-setup-anchor"].setValue(setupToLocation);
    this.setCursorStartState();
  }
  get experimentalSetupAnchor() {
    return __privateGet(this, _config).attributes["experimental-setup-anchor"].value;
  }
  set puzzle(puzzle) {
    if (__privateGet(this, _config).attributes["puzzle"].setValue(puzzle)) {
      this.updatePuzzleDOM();
    }
  }
  get puzzle() {
    return __privateGet(this, _config).attributes["puzzle"].value;
  }
  set visualization(visualization) {
    if (__privateGet(this, _config).attributes["visualization"].setValue(visualization)) {
      this.updatePuzzleDOM();
    }
  }
  get visualization() {
    return __privateGet(this, _config).attributes["visualization"].value;
  }
  set hintFacelets(hintFacelets) {
    if (__privateGet(this, _config).attributes["hint-facelets"].setValue(hintFacelets)) {
      if (this.twisty3D instanceof Cube3D) {
        this.twisty3D.experimentalUpdateOptions({hintFacelets});
      }
    }
  }
  get hintFacelets() {
    return __privateGet(this, _config).attributes["hint-facelets"].value;
  }
  get experimentalStickering() {
    return __privateGet(this, _config).attributes["experimental-stickering"].value;
  }
  set experimentalStickering(experimentalStickering) {
    if (__privateGet(this, _config).attributes["experimental-stickering"].setValue(experimentalStickering)) {
      const twisty3D = this.twisty3D;
      if (twisty3D instanceof Cube3D) {
        twisty3D.experimentalUpdateOptions({
          experimentalStickering
        });
      }
      if (twisty3D instanceof PG3D) {
        (async () => {
          const appearance = await this.getPG3DAppearance();
          twisty3D.experimentalSetAppearance(appearance);
        })();
      }
      if (this.viewerElems[0] instanceof Twisty2DSVG) {
        this.viewerElems[0].experimentalSetStickering(this.experimentalStickering);
      }
    }
  }
  set background(background) {
    if (__privateGet(this, _config).attributes["background"].setValue(background)) {
      this.contentWrapper.classList.toggle("checkered", background === "checkered");
    }
  }
  get background() {
    return __privateGet(this, _config).attributes["background"].value;
  }
  set controlPanel(controlPanel) {
    __privateGet(this, _config).attributes["control-panel"].setValue(controlPanel);
    __privateGet(this, _controlsClassListManager).setValue(controlPanel);
  }
  get controlPanel() {
    return __privateGet(this, _config).attributes["control-panel"].value;
  }
  set controls(controls) {
    this.controlPanel = controls;
  }
  get controls() {
    return this.controlPanel;
  }
  set backView(backView) {
    __privateGet(this, _config).attributes["back-view"].setValue(backView);
    if (backView !== "none" && this.viewerElems.length === 1) {
      this.createBackViewer();
    }
    if (backView === "none" && this.viewerElems.length > 1) {
      this.removeBackViewerElem();
    }
    if (__privateGet(this, _viewerWrapper) && __privateGet(this, _viewerWrapper).setBackView(backView)) {
      for (const viewer of this.viewerElems) {
        viewer.makeInvisibleUntilRender();
      }
    }
  }
  get backView() {
    return __privateGet(this, _config).attributes["back-view"].value;
  }
  set experimentalCameraPosition(cameraPosition) {
    __privateGet(this, _config).attributes["experimental-camera-position"].setValue(cameraPosition);
    if (this.viewerElems && ["3D", "PG3D"].includes(__privateGet(this, _config).attributes["visualization"].value)) {
      this.viewerElems[0]?.camera.position.copy(this.effectiveCameraPosition);
      this.viewerElems[0]?.camera.lookAt(new Vector37(0, 0, 0));
      this.viewerElems[0]?.scheduleRender();
      this.viewerElems[1]?.camera.position.copy(this.effectiveCameraPosition).multiplyScalar(-1);
      this.viewerElems[1]?.camera.lookAt(new Vector37(0, 0, 0));
      this.viewerElems[1]?.scheduleRender();
    }
  }
  get experimentalCameraPosition() {
    return __privateGet(this, _config).attributes["experimental-camera-position"].value;
  }
  set viewerLink(viewerLinkPage) {
    __privateGet(this, _config).attributes["viewer-link"].setValue(viewerLinkPage);
    const maybePanel = this.controlElems[1];
    if (maybePanel?.setViewerLink) {
      maybePanel.setViewerLink(viewerLinkPage);
    }
  }
  get viewerLink() {
    return __privateGet(this, _config).attributes["viewer-link"].value;
  }
  get effectiveCameraPosition() {
    return this.experimentalCameraPosition ?? this.defaultCameraPosition;
  }
  get defaultCameraPosition() {
    return this.puzzle[1] === "x" ? cubeCameraPosition : centeredCameraPosition;
  }
  static get observedAttributes() {
    return TwistyPlayerConfig.observedAttributes;
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    __privateGet(this, _config).attributeChangedCallback(attributeName, oldValue, newValue);
  }
  experimentalSetStartStateOverride(state) {
    __privateSet(this, _experimentalStartStateOverride, state);
    this.setCursorStartState();
  }
  experimentalSetCursorIndexer(cursorName) {
    if (__privateGet(this, _cursorIndexerName) === cursorName) {
      return;
    }
    __privateSet(this, _cursorIndexerName, cursorName);
    this.cursor?.experimentalSetIndexer(this.indexerConstructor());
  }
  indexerConstructor() {
    return indexerMap[__privateGet(this, _cursorIndexerName)];
  }
  connectedCallback() {
    this.contentWrapper.classList.toggle("checkered", this.background === "checkered");
    const setBackView = this.backView && is3DVisualization(this.visualization);
    const backView = setBackView ? this.backView : "none";
    __privateSet(this, _viewerWrapper, new TwistyViewerWrapper({
      backView
    }));
    this.addElement(__privateGet(this, _viewerWrapper));
    const scrubber = new TwistyScrubber(this.timeline);
    const controlButtonGrid = new TwistyControlButtonPanel(this.timeline, {
      fullscreenElement: this,
      viewerLinkCallback: this.visitTwizzleLink.bind(this),
      viewerLink: this.viewerLink
    });
    this.controlElems = [scrubber, controlButtonGrid];
    __privateGet(this, _controlsClassListManager).setValue(this.controlPanel);
    this.addElement(this.controlElems[0]);
    this.addElement(this.controlElems[1]);
    __privateSet(this, _connected, true);
    this.updatePuzzleDOM(true);
  }
  twizzleLink() {
    const url = new URL("https://experiments.cubing.net/cubing.js/alg.cubing.net/index.html");
    if (!this.alg.experimentalIsEmpty()) {
      url.searchParams.set("alg", this.alg.toString());
    }
    if (!this.experimentalSetupAlg.experimentalIsEmpty()) {
      url.searchParams.set("experimental-setup-alg", this.experimentalSetupAlg.toString());
    }
    if (this.experimentalSetupAnchor !== "start") {
      url.searchParams.set("experimental-setup-anchor", this.experimentalSetupAnchor);
    }
    if (this.experimentalStickering !== "full") {
      url.searchParams.set("experimental-stickering", this.experimentalStickering);
    }
    if (this.puzzle !== "3x3x3") {
      url.searchParams.set("puzzle", this.puzzle);
    }
    return url.toString();
  }
  visitTwizzleLink() {
    const a = document.createElement("a");
    a.href = this.twizzleLink();
    a.target = "_blank";
    a.click();
  }
  clearRenderMode() {
    switch (__privateGet(this, _renderMode)) {
      case "3D":
        this.scene = null;
        this.twisty3D = null;
        this.legacyExperimentalPG3D = null;
        this.viewerElems = [];
        __privateGet(this, _viewerWrapper).clear();
        break;
      case "2D":
        this.viewerElems = [];
        __privateGet(this, _viewerWrapper).clear();
        break;
    }
    __privateSet(this, _renderMode, null);
  }
  setRenderMode2D() {
    if (__privateGet(this, _renderMode) === "2D") {
      return;
    }
    this.clearRenderMode();
    __privateSet(this, _renderMode, "2D");
  }
  setTwisty2DSVG(twisty2DSVG) {
    this.setRenderMode2D();
    __privateGet(this, _viewerWrapper).clear();
    __privateGet(this, _viewerWrapper).addElement(twisty2DSVG);
    this.viewerElems.push(twisty2DSVG);
  }
  setRenderMode3D() {
    if (__privateGet(this, _renderMode) === "3D") {
      return;
    }
    this.clearRenderMode();
    this.scene = new Twisty3DScene();
    const mainViewer = new Twisty3DCanvas(this.scene, {
      experimentalCameraPosition: this.effectiveCameraPosition
    });
    this.viewerElems.push(mainViewer);
    __privateGet(this, _viewerWrapper).addElement(mainViewer);
    if (this.backView !== "none") {
      this.createBackViewer();
    }
    __privateSet(this, _renderMode, "3D");
  }
  setTwisty3D(twisty3D) {
    if (this.twisty3D) {
      this.scene.removeTwisty3DPuzzle(this.twisty3D);
      if (this.twisty3D instanceof PG3D) {
        this.twisty3D.dispose();
      }
      this.twisty3D = null;
    }
    this.twisty3D = twisty3D;
    this.scene.addTwisty3DPuzzle(twisty3D);
  }
  setCursor(cursor) {
    const oldCursor = this.cursor;
    this.cursor = cursor;
    try {
      this.cursor.setAlg(this.alg, this.indexerConstructor());
      this.setCursorStartState();
    } catch (e) {
      this.cursor.setAlg(new Alg8(), this.indexerConstructor());
      this.cursor.setStartState(this.cursor.algToState(new Alg8()));
      this.experimentalInvalidInitialAlgCallback(this.alg);
    }
    this.setCursorStartState();
    this.timeline.addCursor(cursor);
    if (oldCursor) {
      this.timeline.removeCursor(oldCursor);
      this.timeline.removeTimestampListener(oldCursor);
    }
    this.experimentalSetCursorIndexer(__privateGet(this, _cursorIndexerName));
  }
  async updatePuzzleDOM(initial = false) {
    if (!__privateGet(this, _connected)) {
      return;
    }
    let puzzleLoader;
    if (this.puzzle === "custom") {
      puzzleLoader = {
        id: "custom",
        fullName: "Custom (PG3D)",
        def: () => Promise.resolve(__privateGet(this, _legacyExperimentalPG3DViewConfig).def),
        svg: async () => {
          throw "unimplemented";
        }
      };
    } else {
      puzzleLoader = puzzles3[this.puzzle];
    }
    for (const pendingPuzzleUpdate2 of __privateGet(this, _pendingPuzzleUpdates)) {
      pendingPuzzleUpdate2.cancelled = true;
    }
    __privateSet(this, _pendingPuzzleUpdates, []);
    const pendingPuzzleUpdate = {cancelled: false};
    __privateGet(this, _pendingPuzzleUpdates).push(pendingPuzzleUpdate);
    const def = await puzzleLoader.def();
    if (pendingPuzzleUpdate.cancelled) {
      return;
    }
    let cursor;
    try {
      cursor = new AlgCursor(this.timeline, def, this.alg, this.cursorStartAlg(), this.indexerConstructor());
      this.setCursor(cursor);
    } catch (e) {
      if (initial) {
        this.experimentalInvalidInitialAlgCallback(this.alg);
      }
      cursor = new AlgCursor(this.timeline, def, new Alg8(), new Alg8(), this.indexerConstructor());
      this.setCursor(cursor);
    }
    if (initial && this.experimentalSetupAlg.experimentalIsEmpty() && this.experimentalSetupAnchor !== "end") {
      this.timeline.jumpToEnd();
    }
    switch (this.visualization) {
      case "2D":
      case "experimental-2D-LL":
        {
          const options = {};
          if (this.experimentalStickering) {
            options.experimentalStickering = this.experimentalStickering;
          }
          this.setRenderMode2D();
          const svgPromiseFn = this.visualization === "2D" ? puzzleLoader.svg : puzzleLoader.llSVG ?? puzzleLoader.svg;
          const mainViewer = new Twisty2DSVG(cursor, def, await svgPromiseFn(), options, puzzleLoader);
          if (!pendingPuzzleUpdate.cancelled) {
            this.setTwisty2DSVG(mainViewer);
          }
        }
        break;
      case "3D":
      case "PG3D":
        {
          this.setRenderMode3D();
          const scene = this.scene;
          let twisty3D;
          if (this.visualization === "3D" && this.puzzle === "3x3x3") {
            twisty3D = new Cube3D(def, cursor, scene.scheduleRender.bind(scene), {
              hintFacelets: this.hintFacelets,
              experimentalStickering: this.experimentalStickering
            });
          } else {
            let def2;
            let stickerDat;
            const pgGetter = puzzleLoader.pg;
            if (this.puzzle === "custom") {
              def2 = __privateGet(this, _legacyExperimentalPG3DViewConfig).def;
              stickerDat = __privateGet(this, _legacyExperimentalPG3DViewConfig).stickerDat;
            } else if (pgGetter) {
              const pg = await pgGetter();
              if (pendingPuzzleUpdate.cancelled) {
                return;
              }
              def2 = pg.writekpuzzle(true);
              stickerDat = pg.get3d();
            } else {
              throw "Unimplemented!";
            }
            const options = {};
            const pg3d = new PG3D(cursor, scene.scheduleRender.bind(scene), def2, stickerDat, __privateGet(this, _legacyExperimentalPG3DViewConfig)?.showFoundation ?? true, __privateGet(this, _legacyExperimentalPG3DViewConfig)?.hintStickers ?? this.hintFacelets === "floating", options);
            (async () => {
              const appearance = await this.getPG3DAppearance();
              if (appearance) {
                pg3d.experimentalSetAppearance(appearance);
              }
            })();
            this.legacyExperimentalPG3D = pg3d;
            twisty3D = pg3d;
          }
          this.setTwisty3D(twisty3D);
        }
        break;
    }
  }
  async getPG3DAppearance() {
    const puzzleLoader = puzzles3[this.puzzle];
    if (puzzleLoader?.appearance) {
      return puzzleLoader.appearance(this.experimentalStickering ?? "full");
    }
    return null;
  }
  createBackViewer() {
    if (!is3DVisualization(this.visualization)) {
      throw new Error("Back viewer requires a 3D visualization");
    }
    const backViewer = new Twisty3DCanvas(this.scene, {
      experimentalCameraPosition: this.effectiveCameraPosition,
      negateCameraPosition: true
    });
    this.viewerElems.push(backViewer);
    this.viewerElems[0].setMirror(backViewer);
    __privateGet(this, _viewerWrapper).addElement(backViewer);
  }
  removeBackViewerElem() {
    if (this.viewerElems.length !== 2) {
      throw new Error("Tried to remove non-existent back view!");
    }
    __privateGet(this, _viewerWrapper).removeElement(this.viewerElems.pop());
  }
  async setCustomPuzzleGeometry(legacyExperimentalPG3DViewConfig) {
    this.puzzle = "custom";
    __privateSet(this, _legacyExperimentalPG3DViewConfig, legacyExperimentalPG3DViewConfig);
    await this.updatePuzzleDOM();
  }
  experimentalAddMove(move, coalesce = false, coalesceDelayed = false) {
    if (__privateGet(this, _hackyPendingFinalMoveCoalesce)) {
      this.hackyCoalescePending();
    }
    const oldNumMoves = countMoves(this.alg);
    const newAlg = experimentalAppendMove(this.alg, move, {
      coalesce: coalesce && !coalesceDelayed,
      mod: this.legacyExperimentalCoalesceModFunc(move)
    });
    if (coalesce && coalesceDelayed) {
      __privateSet(this, _hackyPendingFinalMoveCoalesce, true);
    }
    this.alg = newAlg;
    if (oldNumMoves <= countMoves(newAlg)) {
      this.timeline.experimentalJumpToLastMove();
    } else {
      this.timeline.jumpToEnd();
    }
    this.timeline.play();
  }
  onTimelineAction(actionEvent) {
    if (actionEvent.action === TimelineAction.Pausing && actionEvent.locationType === TimestampLocationType.EndOfTimeline && __privateGet(this, _hackyPendingFinalMoveCoalesce)) {
      this.hackyCoalescePending();
      this.timeline.jumpToEnd();
    }
  }
  hackyCoalescePending() {
    const units = Array.from(this.alg.units());
    const length = units.length;
    const pending = __privateGet(this, _hackyPendingFinalMoveCoalesce);
    __privateSet(this, _hackyPendingFinalMoveCoalesce, false);
    if (pending && length > 1 && units[length - 1].is(Move7)) {
      const finalMove = units[length - 1];
      const newAlg = experimentalAppendMove(new Alg8(units.slice(0, length - 1)), finalMove, {
        coalesce: true,
        mod: this.legacyExperimentalCoalesceModFunc(finalMove)
      });
      this.alg = newAlg;
    }
  }
  fullscreen() {
    this.requestFullscreen();
  }
};
_config = new WeakMap();
_connected = new WeakMap();
_legacyExperimentalPG3DViewConfig = new WeakMap();
_experimentalStartStateOverride = new WeakMap();
_hackyPendingFinalMoveCoalesce = new WeakMap();
_viewerWrapper = new WeakMap();
_controlsClassListManager = new WeakMap();
_cursorIndexerName = new WeakMap();
_pendingPuzzleUpdates = new WeakMap();
_renderMode = new WeakMap();
customElementsShim.define("twisty-player", TwistyPlayer);

// src/cubing/twisty/dom/TwistyAlgViewer.ts
import {
  TraversalDownUp as TraversalDownUp2
} from "cubing/alg";
import {experimentalDirect, ExperimentalIterationDirection as ExperimentalIterationDirection2} from "cubing/alg";
var TwistyAlgLeafElem = class extends HTMLElementShim {
  constructor(className, text, dataDown) {
    super();
    this.textContent = text;
    this.classList.add(className);
    this.addEventListener("click", () => {
      dataDown.twistyAlgViewer.jumpToIndex(dataDown.earliestMoveIndex);
    });
  }
  pathToIndex(_index) {
    return [];
  }
};
customElementsShim.define("twisty-alg-leaf-elem", TwistyAlgLeafElem);
var TwistyAlgWrapperElem = class extends HTMLElementShim {
  constructor(className) {
    super();
    this.queue = [];
    this.classList.add(className);
  }
  addString(str) {
    this.queue.push(document.createTextNode(str));
  }
  addElem(dataUp) {
    this.queue.push(dataUp.element);
    return dataUp.moveCount;
  }
  flushQueue(direction = ExperimentalIterationDirection2.Forwards) {
    for (const node of maybeReverseList(this.queue, direction)) {
      this.append(node);
    }
    this.queue = [];
  }
  pathToIndex(_index) {
    return [];
  }
};
customElementsShim.define("twisty-alg-wrapper-elem", TwistyAlgWrapperElem);
function oppositeDirection(direction) {
  return direction === ExperimentalIterationDirection2.Forwards ? ExperimentalIterationDirection2.Backwards : ExperimentalIterationDirection2.Forwards;
}
function updateDirectionByAmount(currentDirection, amount) {
  return amount < 0 ? oppositeDirection(currentDirection) : currentDirection;
}
function maybeReverseList(l, direction) {
  if (direction === ExperimentalIterationDirection2.Forwards) {
    return l;
  }
  const copy = Array.from(l);
  copy.reverse();
  return copy;
}
var AlgToDOMTree = class extends TraversalDownUp2 {
  traverseAlg(alg, dataDown) {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-sequence");
    let first = true;
    for (const unit of experimentalDirect(alg.units(), dataDown.direction)) {
      if (!first) {
        element.addString(" ");
      }
      first = false;
      moveCount += element.addElem(this.traverseUnit(unit, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction: dataDown.direction
      }));
    }
    element.flushQueue(dataDown.direction);
    return {
      moveCount,
      element
    };
  }
  traverseGrouping(grouping, dataDown) {
    const direction = updateDirectionByAmount(dataDown.direction, grouping.experimentalEffectiveAmount);
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-group");
    element.addString("(");
    moveCount += element.addElem(this.traverseAlg(grouping.experimentalAlg, {
      earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
      twistyAlgViewer: dataDown.twistyAlgViewer,
      direction
    }));
    element.addString(")" + grouping.experimentalRepetitionSuffix);
    element.flushQueue();
    return {
      moveCount: moveCount * Math.abs(grouping.experimentalEffectiveAmount),
      element
    };
  }
  traverseMove(blockMove, dataDown) {
    return {
      moveCount: 1,
      element: new TwistyAlgLeafElem("twisty-alg-blockMove", blockMove.toString(), dataDown)
    };
  }
  traverseCommutator(commutator, dataDown) {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-commutator");
    element.addString("[");
    element.flushQueue();
    const direction = updateDirectionByAmount(dataDown.direction, commutator.experimentalEffectiveAmount);
    const [first, second] = maybeReverseList([commutator.A, commutator.B], direction);
    moveCount += element.addElem(this.traverseAlg(first, {
      earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
      twistyAlgViewer: dataDown.twistyAlgViewer,
      direction
    }));
    element.addString(", ");
    moveCount += element.addElem(this.traverseAlg(second, {
      earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
      twistyAlgViewer: dataDown.twistyAlgViewer,
      direction
    }));
    element.flushQueue(direction);
    element.addString("]" + commutator.experimentalRepetitionSuffix);
    element.flushQueue();
    return {
      moveCount: moveCount * 2 * Math.abs(commutator.experimentalEffectiveAmount),
      element
    };
  }
  traverseConjugate(conjugate, dataDown) {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-conjugate");
    element.addString("[");
    const direction = updateDirectionByAmount(dataDown.direction, conjugate.experimentalEffectiveAmount);
    const aLen = element.addElem(this.traverseAlg(conjugate.A, {
      earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
      twistyAlgViewer: dataDown.twistyAlgViewer,
      direction
    }));
    moveCount += aLen;
    element.addString(": ");
    moveCount += element.addElem(this.traverseAlg(conjugate.B, {
      earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
      twistyAlgViewer: dataDown.twistyAlgViewer,
      direction
    }));
    element.addString("]" + conjugate.experimentalRepetitionSuffix);
    element.flushQueue();
    return {
      moveCount: (moveCount + aLen) * Math.abs(conjugate.experimentalEffectiveAmount),
      element
    };
  }
  traversePause(_pause, dataDown) {
    return {
      moveCount: 1,
      element: new TwistyAlgLeafElem("twisty-alg-pause", ".", dataDown)
    };
  }
  traverseNewline(_newLine, _dataDown) {
    const element = new TwistyAlgWrapperElem("twisty-alg-newLine");
    element.append(document.createElement("br"));
    return {
      moveCount: 0,
      element
    };
  }
  traverseLineComment(comment, dataDown) {
    return {
      moveCount: 0,
      element: new TwistyAlgLeafElem("twisty-alg-comment", `//${comment.text}`, dataDown)
    };
  }
};
var algToDOMTreeInstance = new AlgToDOMTree();
var algToDOMTree = algToDOMTreeInstance.traverseAlg.bind(algToDOMTreeInstance);
var _domTree;
var ExperimentalTwistyAlgViewer = class extends HTMLElementShim {
  constructor(options) {
    super();
    _domTree.set(this, void 0);
    this.twistyPlayer = null;
    this.lastClickTimestamp = null;
    if (options?.twistyPlayer) {
      this.setTwistyPlayer(options?.twistyPlayer);
    }
  }
  connectedCallback() {
  }
  setAlg(alg) {
    __privateSet(this, _domTree, algToDOMTree(alg, {
      earliestMoveIndex: 0,
      twistyAlgViewer: this,
      direction: ExperimentalIterationDirection2.Forwards
    }).element);
    this.textContent = "";
    this.appendChild(__privateGet(this, _domTree));
  }
  setTwistyPlayer(twistyPlayer) {
    if (this.twistyPlayer) {
      console.warn("twisty-player reassignment is not supported");
      return;
    }
    this.twistyPlayer = twistyPlayer;
    this.setAlg(this.twistyPlayer.alg);
    twistyPlayer.timeline.addTimestampListener({
      onTimelineTimestampChange: (timestamp) => {
        if (timestamp !== this.lastClickTimestamp) {
          this.lastClickTimestamp = null;
        }
        const index = this.twistyPlayer?.cursor?.experimentalIndexFromTimestamp(timestamp) ?? null;
        if (index !== null) {
        }
      },
      onTimeRangeChange: (_timeRange) => {
      }
    });
  }
  jumpToIndex(index) {
    if (this.twistyPlayer && this.twistyPlayer.cursor) {
      const timestamp = (this.twistyPlayer.cursor.experimentalTimestampFromIndex(index) ?? -250) + 250;
      this.twistyPlayer?.timeline.setTimestamp(timestamp);
      if (this.lastClickTimestamp === timestamp) {
        this.twistyPlayer.timeline.play();
        this.lastClickTimestamp = null;
      } else {
        this.lastClickTimestamp = timestamp;
      }
    }
  }
  attributeChangedCallback(attributeName, _oldValue, newValue) {
    if (attributeName === "for") {
      const elem = document.getElementById(newValue);
      if (!elem) {
        console.warn("for= elem does not exist");
        return;
      }
      if (!(elem instanceof TwistyPlayer)) {
        console.warn("for= elem is not a twisty-player");
        return;
      }
      this.setTwistyPlayer(elem);
    }
  }
  static get observedAttributes() {
    return ["for"];
  }
};
_domTree = new WeakMap();
customElementsShim.define("experimental-twisty-alg-viewer", ExperimentalTwistyAlgViewer);
export {
  Cube3D,
  ExperimentalTwistyAlgViewer,
  KPuzzleWrapper as KSolvePuzzle,
  PG3D,
  SimpleAlgIndexer,
  TimestampLocationType,
  TreeAlgIndexer,
  Twisty3DCanvas,
  TwistyPlayer,
  experimentalSetShareAllNewRenderers,
  experimentalShowRenderStats
};
