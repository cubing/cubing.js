import {
  experimentalAppendBlockMove
} from "./chunk.JCC742NV.js";
import {
  EquivalentStates,
  SVG
} from "./chunk.JQRASIC7.js";
import {
  modifiedBlockMove
} from "./chunk.SBF4OERV.js";
import {
  parse
} from "./chunk.RSTIVU2H.js";
import {
  Combine,
  IdentityTransformation,
  Invert,
  KPuzzle,
  Puzzles,
  stateForBlockMove
} from "./chunk.OXN3TMHE.js";
import {
  BlockMove,
  Sequence,
  TraversalDownUp,
  TraversalUp,
  algPartToStringForTesting,
  algToString,
  blockMoveToString,
  expand,
  parser_pegjs
} from "./chunk.KHJLFQEA.js";
import {
  getPuzzleGeometryByName
} from "./chunk.CPGT2QR7.js";

// src/twisty/dom/viewers/Twisty3DCanvas.ts
import {PerspectiveCamera, Vector3 as Vector32, WebGLRenderer} from "three";

// src/twisty/animation/RenderScheduler.ts
class RenderScheduler {
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
}

// src/twisty/dom/element/node-custom-element-shims.ts
class HTMLElementStub {
}
let HTMLElementShim;
if (typeof HTMLElement !== "undefined") {
  HTMLElementShim = HTMLElement;
} else {
  HTMLElementShim = HTMLElementStub;
}
class CustomElementsStub {
  define() {
  }
}
let customElementsShim;
if (typeof customElements !== "undefined") {
  customElementsShim = customElements;
} else {
  customElementsShim = new CustomElementsStub();
}

// src/twisty/dom/element/ManagedCustomElement.ts
class CSSSource {
  constructor(sourceText) {
    this.sourceText = sourceText;
  }
  getAsString() {
    return this.sourceText;
  }
}
class ManagedCustomElement extends HTMLElementShim {
  constructor() {
    super();
    this.cssSourceMap = new Map();
    this.shadow = this.attachShadow({mode: "closed"});
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
}
customElementsShim.define("twisty-managed-custom-element", ManagedCustomElement);

// src/twisty/dom/viewers/canvas.ts
function pixelRatio() {
  return devicePixelRatio || 1;
}

// src/twisty/dom/viewers/Twisty3DCanvas.css.ts
const twisty3DCanvasCSS = new CSSSource(`
:host(twisty-3d-canvas) {
  contain: content;
  overflow: hidden;
}

.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  contain: content;
}

/* TODO: This is due to stats hack. Replace with \`canvas\`. */
.wrapper > canvas {
  position: absolute;
  max-width: 100%;
  max-height: 100%;
}

.wrapper.invisible {
  opacity: 0;
}
`);

// src/twisty/dom/viewers/vendor/OrbitControls.js
import {
  EventDispatcher,
  MOUSE,
  Quaternion,
  Spherical,
  TOUCH,
  Vector2,
  Vector3
} from "three";
const OrbitControls = function(object, domElement) {
  if (domElement === void 0)
    console.warn('THREE.OrbitControls: The second parameter "domElement" is now mandatory.');
  if (domElement === document)
    console.error('THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.');
  this.object = object;
  this.domElement = domElement;
  this.enabled = true;
  this.target = new Vector3();
  this.minDistance = 0;
  this.maxDistance = Infinity;
  this.minZoom = 0;
  this.maxZoom = Infinity;
  this.minPolarAngle = 0;
  this.maxPolarAngle = Math.PI;
  this.minAzimuthAngle = -Infinity;
  this.maxAzimuthAngle = Infinity;
  this.enableDamping = false;
  this.dampingFactor = 0.05;
  this.enableZoom = true;
  this.zoomSpeed = 1;
  this.enableRotate = true;
  this.rotateSpeed = 1;
  this.enablePan = true;
  this.panSpeed = 1;
  this.screenSpacePanning = true;
  this.keyPanSpeed = 7;
  this.autoRotate = false;
  this.autoRotateSpeed = 2;
  this.enableKeys = true;
  this.keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};
  this.mouseButtons = {
    LEFT: MOUSE.ROTATE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.PAN
  };
  this.touches = {ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN};
  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  this.zoom0 = this.object.zoom;
  this.getPolarAngle = function() {
    return spherical.phi;
  };
  this.getAzimuthalAngle = function() {
    return spherical.theta;
  };
  this.saveState = function() {
    scope.target0.copy(scope.target);
    scope.position0.copy(scope.object.position);
    scope.zoom0 = scope.object.zoom;
  };
  this.reset = function() {
    scope.target.copy(scope.target0);
    scope.object.position.copy(scope.position0);
    scope.object.zoom = scope.zoom0;
    scope.object.updateProjectionMatrix();
    scope.dispatchEvent(changeEvent);
    scope.update();
    state = STATE.NONE;
  };
  this.update = function() {
    const offset = new Vector3();
    const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
    const quatInverse = quat.clone().inverse();
    const lastPosition = new Vector3();
    const lastQuaternion = new Quaternion();
    const twoPI = 2 * Math.PI;
    return function update() {
      const position = scope.object.position;
      offset.copy(position).sub(scope.target);
      offset.applyQuaternion(quat);
      spherical.setFromVector3(offset);
      if (scope.autoRotate && state === STATE.NONE) {
        rotateLeft(getAutoRotationAngle());
      }
      if (scope.enableDamping) {
        spherical.theta += sphericalDelta.theta * scope.dampingFactor;
        spherical.phi += sphericalDelta.phi * scope.dampingFactor;
      } else {
        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;
      }
      let min = scope.minAzimuthAngle;
      let max = scope.maxAzimuthAngle;
      if (isFinite(min) && isFinite(max)) {
        if (min < -Math.PI)
          min += twoPI;
        else if (min > Math.PI)
          min -= twoPI;
        if (max < -Math.PI)
          max += twoPI;
        else if (max > Math.PI)
          max -= twoPI;
        if (min < max) {
          spherical.theta = Math.max(min, Math.min(max, spherical.theta));
        } else {
          spherical.theta = spherical.theta > (min + max) / 2 ? Math.max(min, spherical.theta) : Math.min(max, spherical.theta);
        }
      }
      spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
      spherical.makeSafe();
      spherical.radius *= scale;
      spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
      if (scope.enableDamping === true) {
        scope.target.addScaledVector(panOffset, scope.dampingFactor);
      } else {
        scope.target.add(panOffset);
      }
      offset.setFromSpherical(spherical);
      offset.applyQuaternion(quatInverse);
      position.copy(scope.target).add(offset);
      scope.object.lookAt(scope.target);
      if (scope.enableDamping === true) {
        sphericalDelta.theta *= 1 - scope.dampingFactor;
        sphericalDelta.phi *= 1 - scope.dampingFactor;
        panOffset.multiplyScalar(1 - scope.dampingFactor);
      } else {
        sphericalDelta.set(0, 0, 0);
        panOffset.set(0, 0, 0);
      }
      scale = 1;
      if (zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
        scope.dispatchEvent(changeEvent);
        lastPosition.copy(scope.object.position);
        lastQuaternion.copy(scope.object.quaternion);
        zoomChanged = false;
        return true;
      }
      return false;
    };
  }();
  this.dispose = function() {
    scope.domElement.removeEventListener("contextmenu", onContextMenu, false);
    scope.domElement.removeEventListener("mousedown", onMouseDown, false);
    scope.domElement.removeEventListener("wheel", onMouseWheel, false);
    scope.domElement.removeEventListener("touchstart", onTouchStart, false);
    scope.domElement.removeEventListener("touchend", onTouchEnd, false);
    scope.domElement.removeEventListener("touchmove", onTouchMove, false);
    scope.domElement.ownerDocument.removeEventListener("mousemove", onMouseMove, false);
    scope.domElement.ownerDocument.removeEventListener("mouseup", onMouseUp, false);
    scope.domElement.removeEventListener("keydown", onKeyDown, false);
  };
  var scope = this;
  var changeEvent = {type: "change"};
  const startEvent = {type: "start"};
  const endEvent = {type: "end"};
  var STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  };
  var state = STATE.NONE;
  var EPS = 1e-6;
  var spherical = new Spherical();
  var sphericalDelta = new Spherical();
  var scale = 1;
  var panOffset = new Vector3();
  var zoomChanged = false;
  const rotateStart = new Vector2();
  const rotateEnd = new Vector2();
  const rotateDelta = new Vector2();
  const panStart = new Vector2();
  const panEnd = new Vector2();
  const panDelta = new Vector2();
  const dollyStart = new Vector2();
  const dollyEnd = new Vector2();
  const dollyDelta = new Vector2();
  function getAutoRotationAngle() {
    return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
  }
  function getZoomScale() {
    return Math.pow(0.95, scope.zoomSpeed);
  }
  function rotateLeft(angle) {
    sphericalDelta.theta -= angle;
  }
  function rotateUp(angle) {
    sphericalDelta.phi -= angle;
  }
  const panLeft = function() {
    const v = new Vector3();
    return function panLeft2(distance, objectMatrix) {
      v.setFromMatrixColumn(objectMatrix, 0);
      v.multiplyScalar(-distance);
      panOffset.add(v);
    };
  }();
  const panUp = function() {
    const v = new Vector3();
    return function panUp2(distance, objectMatrix) {
      if (scope.screenSpacePanning === true) {
        v.setFromMatrixColumn(objectMatrix, 1);
      } else {
        v.setFromMatrixColumn(objectMatrix, 0);
        v.crossVectors(scope.object.up, v);
      }
      v.multiplyScalar(distance);
      panOffset.add(v);
    };
  }();
  const pan = function() {
    const offset = new Vector3();
    return function pan2(deltaX, deltaY) {
      const element = scope.domElement;
      if (scope.object.isPerspectiveCamera) {
        const position = scope.object.position;
        offset.copy(position).sub(scope.target);
        let targetDistance = offset.length();
        targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180);
        panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
        panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
      } else if (scope.object.isOrthographicCamera) {
        panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
        panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
      } else {
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.");
        scope.enablePan = false;
      }
    };
  }();
  function dollyOut(dollyScale) {
    if (scope.object.isPerspectiveCamera) {
      scale /= dollyScale;
    } else if (scope.object.isOrthographicCamera) {
      scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
      scope.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
      scope.enableZoom = false;
    }
  }
  function dollyIn(dollyScale) {
    if (scope.object.isPerspectiveCamera) {
      scale *= dollyScale;
    } else if (scope.object.isOrthographicCamera) {
      scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
      scope.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
      scope.enableZoom = false;
    }
  }
  function handleMouseDownRotate(event) {
    rotateStart.set(event.clientX, event.clientY);
  }
  function handleMouseDownDolly(event) {
    dollyStart.set(event.clientX, event.clientY);
  }
  function handleMouseDownPan(event) {
    panStart.set(event.clientX, event.clientY);
  }
  function handleMouseMoveRotate(event) {
    rotateEnd.set(event.clientX, event.clientY);
    rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
    const element = scope.domElement;
    rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
    rotateStart.copy(rotateEnd);
    scope.update();
  }
  function handleMouseMoveDolly(event) {
    dollyEnd.set(event.clientX, event.clientY);
    dollyDelta.subVectors(dollyEnd, dollyStart);
    if (dollyDelta.y > 0) {
      dollyOut(getZoomScale());
    } else if (dollyDelta.y < 0) {
      dollyIn(getZoomScale());
    }
    dollyStart.copy(dollyEnd);
    scope.update();
  }
  function handleMouseMovePan(event) {
    panEnd.set(event.clientX, event.clientY);
    panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
    pan(panDelta.x, panDelta.y);
    panStart.copy(panEnd);
    scope.update();
  }
  function handleMouseUp() {
  }
  function handleMouseWheel(event) {
    if (event.deltaY < 0) {
      dollyIn(getZoomScale());
    } else if (event.deltaY > 0) {
      dollyOut(getZoomScale());
    }
    scope.update();
  }
  function handleKeyDown(event) {
    let needsUpdate = false;
    switch (event.keyCode) {
      case scope.keys.UP:
        pan(0, scope.keyPanSpeed);
        needsUpdate = true;
        break;
      case scope.keys.BOTTOM:
        pan(0, -scope.keyPanSpeed);
        needsUpdate = true;
        break;
      case scope.keys.LEFT:
        pan(scope.keyPanSpeed, 0);
        needsUpdate = true;
        break;
      case scope.keys.RIGHT:
        pan(-scope.keyPanSpeed, 0);
        needsUpdate = true;
        break;
    }
    if (needsUpdate) {
      event.preventDefault();
      scope.update();
    }
  }
  function handleTouchStartRotate(event) {
    if (event.touches.length == 1) {
      rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      rotateStart.set(x, y);
    }
  }
  function handleTouchStartPan(event) {
    if (event.touches.length == 1) {
      panStart.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      panStart.set(x, y);
    }
  }
  function handleTouchStartDolly(event) {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    dollyStart.set(0, distance);
  }
  function handleTouchStartDollyPan(event) {
    if (scope.enableZoom)
      handleTouchStartDolly(event);
    if (scope.enablePan)
      handleTouchStartPan(event);
  }
  function handleTouchStartDollyRotate(event) {
    if (scope.enableZoom)
      handleTouchStartDolly(event);
    if (scope.enableRotate)
      handleTouchStartRotate(event);
  }
  function handleTouchMoveRotate(event) {
    if (event.touches.length == 1) {
      rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      rotateEnd.set(x, y);
    }
    rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
    const element = scope.domElement;
    rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
    rotateStart.copy(rotateEnd);
  }
  function handleTouchMovePan(event) {
    if (event.touches.length == 1) {
      panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      panEnd.set(x, y);
    }
    panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
    pan(panDelta.x, panDelta.y);
    panStart.copy(panEnd);
  }
  function handleTouchMoveDolly(event) {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    dollyEnd.set(0, distance);
    dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));
    dollyOut(dollyDelta.y);
    dollyStart.copy(dollyEnd);
  }
  function handleTouchMoveDollyPan(event) {
    if (scope.enableZoom)
      handleTouchMoveDolly(event);
    if (scope.enablePan)
      handleTouchMovePan(event);
  }
  function handleTouchMoveDollyRotate(event) {
    if (scope.enableZoom)
      handleTouchMoveDolly(event);
    if (scope.enableRotate)
      handleTouchMoveRotate(event);
  }
  function handleTouchEnd() {
  }
  function onMouseDown(event) {
    if (scope.enabled === false)
      return;
    event.preventDefault();
    scope.domElement.focus ? scope.domElement.focus() : window.focus();
    let mouseAction;
    switch (event.button) {
      case 0:
        mouseAction = scope.mouseButtons.LEFT;
        break;
      case 1:
        mouseAction = scope.mouseButtons.MIDDLE;
        break;
      case 2:
        mouseAction = scope.mouseButtons.RIGHT;
        break;
      default:
        mouseAction = -1;
    }
    switch (mouseAction) {
      case MOUSE.DOLLY:
        if (scope.enableZoom === false)
          return;
        handleMouseDownDolly(event);
        state = STATE.DOLLY;
        break;
      case MOUSE.ROTATE:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (scope.enablePan === false)
            return;
          handleMouseDownPan(event);
          state = STATE.PAN;
        } else {
          if (scope.enableRotate === false)
            return;
          handleMouseDownRotate(event);
          state = STATE.ROTATE;
        }
        break;
      case MOUSE.PAN:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (scope.enableRotate === false)
            return;
          handleMouseDownRotate(event);
          state = STATE.ROTATE;
        } else {
          if (scope.enablePan === false)
            return;
          handleMouseDownPan(event);
          state = STATE.PAN;
        }
        break;
      default:
        state = STATE.NONE;
    }
    if (state !== STATE.NONE) {
      scope.domElement.ownerDocument.addEventListener("mousemove", onMouseMove, false);
      scope.domElement.ownerDocument.addEventListener("mouseup", onMouseUp, false);
      scope.dispatchEvent(startEvent);
    }
  }
  function onMouseMove(event) {
    if (scope.enabled === false)
      return;
    event.preventDefault();
    switch (state) {
      case STATE.ROTATE:
        if (scope.enableRotate === false)
          return;
        handleMouseMoveRotate(event);
        break;
      case STATE.DOLLY:
        if (scope.enableZoom === false)
          return;
        handleMouseMoveDolly(event);
        break;
      case STATE.PAN:
        if (scope.enablePan === false)
          return;
        handleMouseMovePan(event);
        break;
    }
  }
  function onMouseUp(event) {
    if (scope.enabled === false)
      return;
    handleMouseUp(event);
    scope.domElement.ownerDocument.removeEventListener("mousemove", onMouseMove, false);
    scope.domElement.ownerDocument.removeEventListener("mouseup", onMouseUp, false);
    scope.dispatchEvent(endEvent);
    state = STATE.NONE;
  }
  function onMouseWheel(event) {
    if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE && state !== STATE.ROTATE)
      return;
    event.preventDefault();
    event.stopPropagation();
    scope.dispatchEvent(startEvent);
    handleMouseWheel(event);
    scope.dispatchEvent(endEvent);
  }
  function onKeyDown(event) {
    if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false)
      return;
    handleKeyDown(event);
  }
  function onTouchStart(event) {
    if (scope.enabled === false)
      return;
    event.preventDefault();
    switch (event.touches.length) {
      case 1:
        switch (scope.touches.ONE) {
          case TOUCH.ROTATE:
            if (scope.enableRotate === false)
              return;
            handleTouchStartRotate(event);
            state = STATE.TOUCH_ROTATE;
            break;
          case TOUCH.PAN:
            if (scope.enablePan === false)
              return;
            handleTouchStartPan(event);
            state = STATE.TOUCH_PAN;
            break;
          default:
            state = STATE.NONE;
        }
        break;
      case 2:
        switch (scope.touches.TWO) {
          case TOUCH.DOLLY_PAN:
            if (scope.enableZoom === false && scope.enablePan === false)
              return;
            handleTouchStartDollyPan(event);
            state = STATE.TOUCH_DOLLY_PAN;
            break;
          case TOUCH.DOLLY_ROTATE:
            if (scope.enableZoom === false && scope.enableRotate === false)
              return;
            handleTouchStartDollyRotate(event);
            state = STATE.TOUCH_DOLLY_ROTATE;
            break;
          default:
            state = STATE.NONE;
        }
        break;
      default:
        state = STATE.NONE;
    }
    if (state !== STATE.NONE) {
      scope.dispatchEvent(startEvent);
    }
  }
  function onTouchMove(event) {
    if (scope.enabled === false)
      return;
    event.preventDefault();
    event.stopPropagation();
    switch (state) {
      case STATE.TOUCH_ROTATE:
        if (scope.enableRotate === false)
          return;
        handleTouchMoveRotate(event);
        scope.update();
        break;
      case STATE.TOUCH_PAN:
        if (scope.enablePan === false)
          return;
        handleTouchMovePan(event);
        scope.update();
        break;
      case STATE.TOUCH_DOLLY_PAN:
        if (scope.enableZoom === false && scope.enablePan === false)
          return;
        handleTouchMoveDollyPan(event);
        scope.update();
        break;
      case STATE.TOUCH_DOLLY_ROTATE:
        if (scope.enableZoom === false && scope.enableRotate === false)
          return;
        handleTouchMoveDollyRotate(event);
        scope.update();
        break;
      default:
        state = STATE.NONE;
    }
  }
  function onTouchEnd(event) {
    if (scope.enabled === false)
      return;
    handleTouchEnd(event);
    scope.dispatchEvent(endEvent);
    state = STATE.NONE;
  }
  function onContextMenu(event) {
    if (scope.enabled === false)
      return;
    event.preventDefault();
  }
  scope.domElement.addEventListener("contextmenu", onContextMenu, false);
  scope.domElement.addEventListener("mousedown", onMouseDown, false);
  scope.domElement.addEventListener("wheel", onMouseWheel, false);
  scope.domElement.addEventListener("touchstart", onTouchStart, false);
  scope.domElement.addEventListener("touchend", onTouchEnd, false);
  scope.domElement.addEventListener("touchmove", onTouchMove, false);
  scope.domElement.addEventListener("keydown", onKeyDown, false);
  if (scope.domElement.tabIndex === -1) {
    scope.domElement.tabIndex = 0;
  }
  this.update();
};
OrbitControls.prototype = Object.create(EventDispatcher.prototype);
OrbitControls.prototype.constructor = OrbitControls;
const MapControls = function(object, domElement) {
  OrbitControls.call(this, object, domElement);
  this.screenSpacePanning = false;
  this.mouseButtons.LEFT = MOUSE.PAN;
  this.mouseButtons.RIGHT = MOUSE.ROTATE;
  this.touches.ONE = TOUCH.PAN;
  this.touches.TWO = TOUCH.DOLLY_ROTATE;
};
MapControls.prototype = Object.create(EventDispatcher.prototype);
MapControls.prototype.constructor = MapControls;

// src/twisty/dom/viewers/TwistyOrbitControls.ts
const INERTIA_DEFAULT = true;
class TwistyOrbitControls {
  constructor(camera, canvas2, scheduleRender) {
    this.camera = camera;
    this.scheduleRender = scheduleRender;
    this.threeOrbitControls = new OrbitControls(camera, canvas2);
    this.threeOrbitControls.enableDamping = INERTIA_DEFAULT;
    this.threeOrbitControls.rotateSpeed = 0.5;
    this.threeOrbitControls.enablePan = false;
    this.threeOrbitControls.enableZoom = false;
    const eventHandler = this.onOrbitControlEvent.bind(this);
    this.threeOrbitControls.addEventListener("start", eventHandler);
    this.threeOrbitControls.addEventListener("change", eventHandler);
    this.threeOrbitControls.addEventListener("end", eventHandler);
  }
  setInertia(enabled) {
    this.threeOrbitControls.enableDamping = enabled;
  }
  onOrbitControlEvent() {
    this.scheduleRender();
    this.mirrorControls?.updateMirroredCamera(this.camera);
  }
  setMirror(m) {
    this.mirrorControls = m;
  }
  updateMirroredCamera(c) {
    this.camera.position.copy(c.position);
    this.camera.position.multiplyScalar(-1);
    this.scheduleRender();
  }
  updateAndSchedule() {
    if (this.threeOrbitControls.update()) {
      this.scheduleRender();
    }
  }
}

// src/vendor/node_modules/three/examples/jsm/libs/stats.module.js
var Stats = function() {
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
    for (var i2 = 0; i2 < container.children.length; i2++) {
      container.children[i2].style.display = i2 === id ? "block" : "none";
    }
    mode = id;
  }
  var beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;
  var fpsPanel = addPanel(new Stats.Panel("FPS", "#0ff", "#002"));
  var msPanel = addPanel(new Stats.Panel("MS", "#0f0", "#020"));
  if (self.performance && self.performance.memory) {
    var memPanel = addPanel(new Stats.Panel("MB", "#f08", "#201"));
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
Stats.Panel = function(name, fg, bg) {
  var min = Infinity, max = 0, round = Math.round;
  var PR = round(window.devicePixelRatio || 1);
  var WIDTH = 80 * PR, HEIGHT = 48 * PR, TEXT_X = 3 * PR, TEXT_Y = 2 * PR, GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR, GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;
  var canvas2 = document.createElement("canvas");
  canvas2.width = WIDTH;
  canvas2.height = HEIGHT;
  canvas2.style.cssText = "width:80px;height:48px";
  var context = canvas2.getContext("2d");
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
    dom: canvas2,
    update: function(value, maxValue) {
      min = Math.min(min, value);
      max = Math.max(max, value);
      context.fillStyle = bg;
      context.globalAlpha = 1;
      context.fillRect(0, 0, WIDTH, GRAPH_Y);
      context.fillStyle = fg;
      context.fillText(round(value) + " " + name + " (" + round(min) + "-" + round(max) + ")", TEXT_X, TEXT_Y);
      context.drawImage(canvas2, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);
      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
      context.fillStyle = bg;
      context.globalAlpha = 0.9;
      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - value / maxValue) * GRAPH_HEIGHT));
    }
  };
};
var stats_module_default = Stats;

// src/twisty/dom/viewers/Twisty3DCanvas.ts
let SHOW_STATS = false;
function experimentalShowRenderStats(show) {
  SHOW_STATS = show;
}
let resizeObserverWarningShown = false;
let shareAllNewRenderers = false;
function experimentalSetShareAllNewRenderers(share) {
  shareAllNewRenderers = share;
}
let sharedRenderer = null;
function newRenderer() {
  return new WebGLRenderer({
    antialias: true,
    alpha: true
  });
}
function newSharedRenderer() {
  return sharedRenderer ?? (sharedRenderer = newRenderer());
}
class Twisty3DCanvas2 extends ManagedCustomElement {
  constructor(scene, options = {}) {
    super();
    this.legacyExperimentalShift = 0;
    this.scheduler = new RenderScheduler(this.render.bind(this));
    this.resizePending = false;
    this.stats = null;
    this.#invisible = false;
    this.addCSS(twisty3DCanvasCSS);
    this.scene = scene;
    this.scene.addRenderTarget(this);
    if (SHOW_STATS) {
      this.stats = stats_module_default();
      this.stats.dom.style.position = "absolute";
      this.addElement(this.stats.dom);
    }
    this.rendererIsShared = shareAllNewRenderers;
    this.renderer = this.rendererIsShared ? newSharedRenderer() : newRenderer();
    this.canvas = this.rendererIsShared ? document.createElement("canvas") : this.renderer.domElement;
    this.canvas2DContext = this.canvas.getContext("2d");
    this.addElement(this.canvas);
    this.camera = new PerspectiveCamera(20, 1, 0.1, 1e3);
    this.camera.position.copy(options.cameraPosition ?? new Vector32(2, 4, 4));
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
  #invisible;
  setMirror(partner) {
    this.orbitControls.setMirror(partner.orbitControls);
    partner.orbitControls.setMirror(this.orbitControls);
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
    this.#invisible = true;
  }
  render() {
    this.stats?.begin();
    this.scheduler.cancelAnimFrame();
    if (this.resizePending) {
      this.resize();
    }
    this.orbitControls.updateAndSchedule();
    if (this.rendererIsShared) {
      this.renderer.setSize(this.canvas.width, this.canvas.height, false);
      this.canvas2DContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.renderer.render(this.scene, this.camera);
    if (this.rendererIsShared) {
      this.canvas2DContext.drawImage(this.renderer.domElement, 0, 0);
    }
    if (this.#invisible) {
      this.contentWrapper.classList.remove("invisible");
    }
    this.stats?.end();
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
}
customElementsShim.define("twisty-3d-canvas", Twisty3DCanvas2);

// src/alg/traversal.ts
function experimentalBlockMoveQuantumName(move) {
  return algPartToStringForTesting(new BlockMove(move.outerLayer, move.innerLayer, move.family, 1));
}

// app/twizzle/move-counter.ts
class MoveCounter extends TraversalUp {
  constructor(metric) {
    super();
    this.metric = metric;
  }
  traverseSequence(sequence) {
    let r3 = 0;
    for (let i2 = 0; i2 < sequence.nestedUnits.length; i2++) {
      r3 += this.traverse(sequence.nestedUnits[i2]);
    }
    return r3;
  }
  traverseGroup(group) {
    return this.traverse(group.nestedSequence) * Math.abs(group.amount);
  }
  traverseBlockMove(move) {
    return this.metric(move);
  }
  traverseCommutator(commutator) {
    return Math.abs(commutator.amount) * 2 * (this.traverse(commutator.A) + this.traverse(commutator.B));
  }
  traverseConjugate(conjugate) {
    return Math.abs(conjugate.amount) * (2 * this.traverse(conjugate.A) + this.traverse(conjugate.B));
  }
  traversePause(_pause) {
    return 0;
  }
  traverseNewLine(_newLine) {
    return 0;
  }
  traverseComment(_comment) {
    return 0;
  }
}
function isCharUppercase(c) {
  return "A" <= c && c <= "Z";
}
function baseMetric(move) {
  const fam = move.family;
  if (isCharUppercase(fam[0]) && fam[fam.length - 1] === "v" || fam === "x" || fam === "y" || fam === "z") {
    return 0;
  } else {
    return 1;
  }
}
const baseCounter = new MoveCounter(baseMetric);
const countMoves = baseCounter.traverse.bind(baseCounter);

// src/twisty/3D/puzzles/Cube3D.ts
import {
  BackSide,
  BoxGeometry,
  DoubleSide,
  Euler,
  Group as Group2,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion as Quaternion2,
  Vector3 as Vector35
} from "three";

// src/twisty/animation/easing.ts
function smootherStep(x) {
  return x * x * x * (10 - x * (15 - 6 * x));
}

// src/twisty/dom/TwistyPlayerConfig.ts
import {Vector3 as Vector34} from "three";

// src/twisty/dom/element/ElementConfig.ts
import {Vector3 as Vector33} from "three";
class AlgAttribute {
  constructor(initialValue) {
    this.setValue(initialValue ?? this.defaultValue());
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
    return new Sequence([]);
  }
  toValue(s) {
    return parse(s);
  }
  toString(s) {
    return algToString(s);
  }
}
class StringEnumAttribute {
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
}
class Vector3Attribute {
  #defaultValue;
  constructor(defaultValue, initialValue) {
    this.#defaultValue = defaultValue;
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
    return this.#defaultValue;
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
}

// src/twisty/dom/element/ClassListManager.ts
class ClassListManager {
  constructor(elem, prefix, validSuffixes) {
    this.elem = elem;
    this.prefix = prefix;
    this.validSuffixes = validSuffixes;
    this.#currentClassName = null;
  }
  #currentClassName;
  clearValue() {
    if (this.#currentClassName) {
      this.elem.contentWrapper.classList.remove(this.#currentClassName);
    }
    this.#currentClassName = null;
  }
  setValue(suffix) {
    if (!this.validSuffixes.includes(suffix)) {
      throw new Error(`Invalid suffix: ${suffix}`);
    }
    const newClassName = `${this.prefix}${suffix}`;
    const changed = this.#currentClassName !== newClassName;
    if (changed) {
      this.clearValue();
      this.elem.contentWrapper.classList.add(newClassName);
      this.#currentClassName = newClassName;
    }
    return changed;
  }
}

// src/twisty/dom/viewers/TwistyViewerWrapper.css.ts
const twistyViewerWrapperCSS = new CSSSource(`
.wrapper {
  display: grid;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.wrapper.back-view-side-by-side {
  grid-template-columns: 1fr 1fr;
}

.wrapper > * {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wrapper.back-view-upper-right > :nth-child(2) {
  position: absolute;
  right: 0;
  top: 0;
  width: 25%;
  height: 25%;
}
`);

// src/twisty/dom/viewers/TwistyViewerWrapper.ts
const backViewLayouts = {
  none: true,
  "side-by-side": true,
  "upper-right": true
};
class TwistyViewerWrapper2 extends ManagedCustomElement {
  constructor(config = {}) {
    super();
    this.#backViewClassListManager = new ClassListManager(this, "back-view-", [
      "none",
      "side-by-side",
      "upper-right"
    ]);
    this.addCSS(twistyViewerWrapperCSS);
    if (config.backView && config.backView in backViewLayouts) {
      this.#backViewClassListManager.setValue(config.backView);
    }
  }
  #backViewClassListManager;
  setBackView(backView) {
    return this.#backViewClassListManager.setValue(backView);
  }
}
customElementsShim.define("twisty-viewer-wrapper", TwistyViewerWrapper2);

// src/twisty/dom/TwistyPlayerConfig.ts
const DEFAULT_CAMERA_Z = 5;
const DEFAULT_CAMERA_Y = DEFAULT_CAMERA_Z * (2 / (1 + Math.sqrt(5)));
const centeredCameraPosition = new Vector34(0, DEFAULT_CAMERA_Y, DEFAULT_CAMERA_Z);
const cubeCameraPosition = new Vector34(3, 4, 5);
const visualizationFormats = {
  "3D": true,
  "2D": true,
  PG3D: true
};
const backgroundThemes = {
  checkered: true,
  none: true
};
const hintFaceletStyles = {
  floating: true,
  none: true
};
const experimentalStickerings = {
  full: true,
  "centers-only": true,
  PLL: true,
  CLS: true,
  OLL: true,
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
  "Void Cube": true
};
const controlsLocations = {
  "bottom-row": true,
  none: true
};
const puzzleIDs = {
  "3x3x3": true,
  custom: true,
  "2x2x2": true,
  "4x4x4": true,
  "5x5x5": true,
  "6x6x6": true,
  "7x7x7": true,
  megaminx: true,
  pyraminx: true,
  sq1: true,
  clock: true,
  skewb: true,
  FTO: true
};
const twistyPlayerAttributeMap = {
  alg: "alg",
  "experimental-start-setup": "experimentalStartSetup",
  puzzle: "puzzle",
  visualization: "visualization",
  "hint-facelets": "hintFacelets",
  "experimental-stickering": "experimentalStickering",
  background: "background",
  controls: "controls",
  "back-view": "backView",
  "camera-position": "cameraPosition"
};
class TwistyPlayerConfig {
  constructor(twistyPlayer, initialValues) {
    this.twistyPlayer = twistyPlayer;
    this.attributes = {
      alg: new AlgAttribute(initialValues.alg),
      "experimental-start-setup": new AlgAttribute(initialValues.experimentalStartSetup),
      puzzle: new StringEnumAttribute(puzzleIDs, initialValues.puzzle),
      visualization: new StringEnumAttribute(visualizationFormats, initialValues.visualization),
      "hint-facelets": new StringEnumAttribute(hintFaceletStyles, initialValues.hintFacelets),
      "experimental-stickering": new StringEnumAttribute(experimentalStickerings, initialValues.experimentalStickering),
      background: new StringEnumAttribute(backgroundThemes, initialValues.background),
      controls: new StringEnumAttribute(controlsLocations, initialValues.controls),
      "back-view": new StringEnumAttribute(backViewLayouts, initialValues["backView"]),
      "camera-position": new Vector3Attribute(null, initialValues["cameraPosition"])
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
}

// src/twisty/3D/TAU.ts
const TAU = Math.PI * 2;

// src/twisty/3D/puzzles/stickerings.ts
const r = {
  facelets: ["regular", "regular", "regular"]
};
const d = {
  facelets: ["dim", "dim", "dim"]
};
const di = {
  facelets: ["dim", "ignored", "ignored"]
};
const p = {
  facelets: ["dim", "regular", "regular"]
};
const o = {
  facelets: ["regular", "ignored", "ignored"]
};
const i = {
  facelets: ["ignored", "ignored", "ignored"]
};
const oi = {
  facelets: ["oriented", "ignored", "ignored"]
};
const invis = {
  facelets: ["invisible", "invisible", "invisible"]
};
const stickerings = {
  full: {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, r, r, r, r, r, r, r, r]
      },
      CORNERS: {
        pieces: [r, r, r, r, r, r, r, r]
      },
      CENTERS: {
        pieces: [r, r, r, r, r, r]
      }
    }
  },
  "centers-only": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, i, i, i, i, i, i, i, i]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i]
      },
      CENTERS: {
        pieces: [r, r, r, r, r, r]
      }
    }
  },
  PLL: {
    orbits: {
      EDGES: {
        pieces: [p, p, p, p, d, d, d, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [p, p, p, p, d, d, d, d]
      },
      CENTERS: {
        pieces: [p, d, d, d, d, d]
      }
    }
  },
  CLS: {
    orbits: {
      EDGES: {
        pieces: [di, di, di, di, d, d, d, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [o, o, o, o, o, d, d, d]
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d]
      }
    }
  },
  OLL: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [o, o, o, o, d, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  ELS: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  LL: {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, d, d, d, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  F2L: {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, r, r, r, r, r, r, r, r]
      },
      CORNERS: {
        pieces: [i, i, i, i, r, r, r, r]
      },
      CENTERS: {
        pieces: [d, r, r, r, r, r]
      }
    }
  },
  ZBLL: {
    orbits: {
      EDGES: {
        pieces: [p, p, p, p, d, d, d, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  ZBLS: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d]
      },
      CORNERS: {
        pieces: [i, i, i, i, r, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  WVLS: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d]
      },
      CORNERS: {
        pieces: [o, o, o, o, r, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  VLS: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d]
      },
      CORNERS: {
        pieces: [o, o, o, o, r, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  LS: {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, d, d, d, d, r, d, d, d]
      },
      CORNERS: {
        pieces: [i, i, i, i, r, d, d, d]
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d]
      }
    }
  },
  EO: {
    orbits: {
      EDGES: {
        pieces: [oi, oi, oi, oi, oi, oi, oi, oi, oi, oi, oi, oi]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i]
      }
    }
  },
  CMLL: {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, i, d, i, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d]
      },
      CENTERS: {
        pieces: [i, d, i, d, i, i]
      }
    }
  },
  L6E: {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, r, d, r, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [d, d, d, d, d, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, r, d, r, r]
      }
    }
  },
  L6EO: {
    orbits: {
      EDGES: {
        pieces: [oi, oi, oi, oi, oi, d, oi, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [d, d, d, d, d, d, d, d]
      },
      CENTERS: {
        pieces: [oi, d, i, d, i, oi]
      }
    }
  },
  Daisy: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, i, i, i, i, i, i, i, i]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i]
      },
      CENTERS: {
        pieces: [d, d, d, d, d, o]
      }
    }
  },
  Cross: {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, r, r, r, r, i, i, i, i]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i]
      },
      CENTERS: {
        pieces: [d, d, d, d, d, r]
      }
    }
  },
  "2x2x2": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, i, i, r, r, i, i, i, r]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, r, i]
      },
      CENTERS: {
        pieces: [d, r, d, d, r, r]
      }
    }
  },
  "2x2x3": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, r, i, d, d, i, r, i, d]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, r, d, i]
      },
      CENTERS: {
        pieces: [d, d, r, d, d, d]
      }
    }
  },
  "Void Cube": {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, r, r, r, r, r, r, r, r]
      },
      CORNERS: {
        pieces: [r, r, r, r, r, r, r, r]
      },
      CENTERS: {
        pieces: [invis, invis, invis, invis, invis, invis]
      }
    }
  }
};

// src/twisty/3D/puzzles/Cube3D.ts
const ignoredMaterial = new MeshBasicMaterial({
  color: 4473924,
  side: DoubleSide
});
const ignoredMaterialHint = new MeshBasicMaterial({
  color: 13421772,
  side: BackSide
});
const invisibleMaterial = new MeshBasicMaterial({
  visible: false
});
const orientedMaterial = new MeshBasicMaterial({
  color: 16746751
});
const orientedMaterialHint = new MeshBasicMaterial({
  color: 16746751,
  side: BackSide
});
class AxisInfo {
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
}
const axesInfo = [
  new AxisInfo(new Vector35(0, 1, 0), new Euler(-TAU / 4, 0, 0), 16777215, 14540253),
  new AxisInfo(new Vector35(-1, 0, 0), new Euler(0, -TAU / 4, 0), 16746496, 8930304),
  new AxisInfo(new Vector35(0, 0, 1), new Euler(0, 0, 0), 65280, 34816),
  new AxisInfo(new Vector35(1, 0, 0), new Euler(0, TAU / 4, 0), 16711680, 6684672),
  new AxisInfo(new Vector35(0, 0, -1), new Euler(0, TAU / 2, 0), 255, 136),
  new AxisInfo(new Vector35(0, -1, 0), new Euler(TAU / 4, 0, 0), 16776960, 8947712)
];
const face = {
  U: 0,
  L: 1,
  F: 2,
  R: 3,
  B: 4,
  D: 5
};
const familyToAxis = {
  U: face.U,
  u: face.U,
  y: face.U,
  L: face.L,
  l: face.L,
  M: face.L,
  F: face.F,
  f: face.F,
  S: face.F,
  z: face.F,
  R: face.R,
  r: face.R,
  x: face.R,
  B: face.B,
  b: face.B,
  D: face.D,
  d: face.D,
  E: face.D
};
const cubieDimensions = {
  stickerWidth: 0.85,
  stickerElevation: 0.501,
  foundationWidth: 1,
  hintStickerElevation: 1.45
};
const cube3DOptionsDefaults = {
  showMainStickers: true,
  hintFacelets: "floating",
  showFoundation: true,
  experimentalStickering: "full"
};
const blackMesh = new MeshBasicMaterial({
  color: 0,
  opacity: 0.3,
  transparent: true
});
class CubieDef {
  constructor(orbit, stickerFaceNames, q) {
    this.orbit = orbit;
    const individualStickerFaceNames = typeof stickerFaceNames === "string" ? stickerFaceNames.split("") : stickerFaceNames;
    this.stickerFaces = individualStickerFaceNames.map((s) => face[s]);
    this.matrix = new Matrix4();
    this.matrix.setPosition(firstPiecePosition[orbit]);
    this.matrix.premultiply(new Matrix4().makeRotationFromQuaternion(q));
  }
}
function t(v, t4) {
  return new Quaternion2().setFromAxisAngle(v, TAU * t4 / 4);
}
const r2 = {
  O: new Vector35(0, 0, 0),
  U: new Vector35(0, -1, 0),
  L: new Vector35(1, 0, 0),
  F: new Vector35(0, 0, -1),
  R: new Vector35(-1, 0, 0),
  B: new Vector35(0, 0, 1),
  D: new Vector35(0, 1, 0)
};
const firstPiecePosition = {
  EDGES: new Vector35(0, 1, 1),
  CORNERS: new Vector35(1, 1, 1),
  CENTERS: new Vector35(0, 1, 0)
};
const orientationRotation = {
  EDGES: [0, 1].map((i2) => new Matrix4().makeRotationAxis(firstPiecePosition.EDGES.clone().normalize(), -i2 * TAU / 2)),
  CORNERS: [0, 1, 2].map((i2) => new Matrix4().makeRotationAxis(firstPiecePosition.CORNERS.clone().normalize(), -i2 * TAU / 3)),
  CENTERS: [0, 1, 2, 3].map((i2) => new Matrix4().makeRotationAxis(firstPiecePosition.CENTERS.clone().normalize(), -i2 * TAU / 4))
};
const cubieStickerOrder = [face.U, face.F, face.R];
const pieceDefs = {
  EDGES: [
    new CubieDef("EDGES", "UF", t(r2.O, 0)),
    new CubieDef("EDGES", "UR", t(r2.U, 3)),
    new CubieDef("EDGES", "UB", t(r2.U, 2)),
    new CubieDef("EDGES", "UL", t(r2.U, 1)),
    new CubieDef("EDGES", "DF", t(r2.F, 2)),
    new CubieDef("EDGES", "DR", t(r2.F, 2).premultiply(t(r2.D, 1))),
    new CubieDef("EDGES", "DB", t(r2.F, 2).premultiply(t(r2.D, 2))),
    new CubieDef("EDGES", "DL", t(r2.F, 2).premultiply(t(r2.D, 3))),
    new CubieDef("EDGES", "FR", t(r2.U, 3).premultiply(t(r2.R, 3))),
    new CubieDef("EDGES", "FL", t(r2.U, 1).premultiply(t(r2.R, 3))),
    new CubieDef("EDGES", "BR", t(r2.U, 3).premultiply(t(r2.R, 1))),
    new CubieDef("EDGES", "BL", t(r2.U, 1).premultiply(t(r2.R, 1)))
  ],
  CORNERS: [
    new CubieDef("CORNERS", "UFR", t(r2.O, 0)),
    new CubieDef("CORNERS", "URB", t(r2.U, 3)),
    new CubieDef("CORNERS", "UBL", t(r2.U, 2)),
    new CubieDef("CORNERS", "ULF", t(r2.U, 1)),
    new CubieDef("CORNERS", "DRF", t(r2.F, 2).premultiply(t(r2.D, 1))),
    new CubieDef("CORNERS", "DFL", t(r2.F, 2).premultiply(t(r2.D, 0))),
    new CubieDef("CORNERS", "DLB", t(r2.F, 2).premultiply(t(r2.D, 3))),
    new CubieDef("CORNERS", "DBR", t(r2.F, 2).premultiply(t(r2.D, 2)))
  ],
  CENTERS: [
    new CubieDef("CENTERS", "U", t(r2.O, 0)),
    new CubieDef("CENTERS", "L", t(r2.R, 3).premultiply(t(r2.U, 1))),
    new CubieDef("CENTERS", "F", t(r2.R, 3)),
    new CubieDef("CENTERS", "R", t(r2.R, 3).premultiply(t(r2.D, 1))),
    new CubieDef("CENTERS", "B", t(r2.R, 3).premultiply(t(r2.D, 2))),
    new CubieDef("CENTERS", "D", t(r2.R, 2))
  ]
};
const CUBE_SCALE = 1 / 3;
class Cube3D extends Object3D {
  constructor(cursor, scheduleRenderCallback, options = {}) {
    super();
    this.scheduleRenderCallback = scheduleRenderCallback;
    this.pieces = {};
    this.experimentalHintStickerMeshes = [];
    this.experimentalFoundationMeshes = [];
    const def = Puzzles["3x3x3"];
    this.options = {};
    for (const key in cube3DOptionsDefaults) {
      this.options[key] = key in options ? options[key] : cube3DOptionsDefaults[key];
    }
    if (def.name !== "3x3x3") {
      throw new Error("Invalid puzzle for this Cube3D implementation.");
    }
    this.kpuzzleFaceletInfo = {};
    for (const orbit in pieceDefs) {
      const orbitFaceletInfo = [];
      this.kpuzzleFaceletInfo[orbit] = orbitFaceletInfo;
      this.pieces[orbit] = pieceDefs[orbit].map(this.createCubie.bind(this, orbitFaceletInfo));
    }
    this.scale.set(CUBE_SCALE, CUBE_SCALE, CUBE_SCALE);
    if (options.experimentalStickering) {
      this.setAppearance(stickerings[options.experimentalStickering]);
    }
    cursor.addPositionListener(this);
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
      this.setAppearance(stickerings[experimentalStickering]);
      this.scheduleRenderCallback();
    }
  }
  onPositionChange(p2) {
    const reid333 = p2.state;
    for (const orbit in pieceDefs) {
      const pieces = pieceDefs[orbit];
      for (let i2 = 0; i2 < pieces.length; i2++) {
        const j = reid333[orbit].permutation[i2];
        this.pieces[orbit][j].matrix.copy(pieceDefs[orbit][i2].matrix);
        this.pieces[orbit][j].matrix.multiply(orientationRotation[orbit][reid333[orbit].orientation[i2]]);
      }
      for (const moveProgress of p2.movesInProgress) {
        const blockMove = moveProgress.move;
        const turnNormal = axesInfo[familyToAxis[blockMove.family]].vector;
        const moveMatrix = new Matrix4().makeRotationAxis(turnNormal, -this.ease(moveProgress.fraction) * moveProgress.direction * blockMove.amount * TAU / 4);
        for (let i2 = 0; i2 < pieces.length; i2++) {
          const k = Puzzles["3x3x3"].moves[blockMove.family][orbit].permutation[i2];
          if (i2 !== k || Puzzles["3x3x3"].moves[blockMove.family][orbit].orientation[i2] !== 0) {
            const j = reid333[orbit].permutation[i2];
            this.pieces[orbit][j].matrix.premultiply(moveMatrix);
          }
        }
      }
    }
    this.scheduleRenderCallback();
  }
  createCubie(orbitFacelets, piece) {
    const cubieFaceletInfo = [];
    orbitFacelets.push(cubieFaceletInfo);
    const cubie = new Group2();
    if (this.options.showFoundation) {
      const foundation = this.createCubieFoundation();
      cubie.add(foundation);
      this.experimentalFoundationMeshes.push(foundation);
    }
    for (let i2 = 0; i2 < piece.stickerFaces.length; i2++) {
      const sticker = this.createSticker(axesInfo[cubieStickerOrder[i2]], axesInfo[piece.stickerFaces[i2]], false);
      const faceletInfo = {
        faceIdx: piece.stickerFaces[i2],
        facelet: sticker
      };
      cubie.add(sticker);
      if (this.options.hintFacelets === "floating") {
        const hintSticker = this.createSticker(axesInfo[cubieStickerOrder[i2]], axesInfo[piece.stickerFaces[i2]], true);
        cubie.add(hintSticker);
        faceletInfo.hintFacelet = hintSticker;
        this.experimentalHintStickerMeshes.push(hintSticker);
      }
      cubieFaceletInfo.push(faceletInfo);
    }
    cubie.matrix.copy(piece.matrix);
    cubie.matrixAutoUpdate = false;
    this.add(cubie);
    return cubie;
  }
  createCubieFoundation() {
    const box = new BoxGeometry(cubieDimensions.foundationWidth, cubieDimensions.foundationWidth, cubieDimensions.foundationWidth);
    return new Mesh(box, blackMesh);
  }
  createSticker(posAxisInfo, materialAxisInfo, isHint) {
    const geo = new PlaneGeometry(cubieDimensions.stickerWidth, cubieDimensions.stickerWidth);
    const stickerMesh = new Mesh(geo, isHint ? materialAxisInfo.hintStickerMaterial.regular : materialAxisInfo.stickerMaterial.regular);
    stickerMesh.setRotationFromEuler(posAxisInfo.fromZ);
    stickerMesh.position.copy(posAxisInfo.vector);
    stickerMesh.position.multiplyScalar(isHint ? cubieDimensions.hintStickerElevation : cubieDimensions.stickerElevation);
    return stickerMesh;
  }
  ease(fraction) {
    return smootherStep(fraction);
  }
}

// src/twisty/3D/puzzles/PG3D.ts
import {
  Color,
  DoubleSide as DoubleSide2,
  Euler as Euler2,
  Face3,
  Geometry,
  Group as Group3,
  Mesh as Mesh2,
  MeshBasicMaterial as MeshBasicMaterial2,
  Object3D as Object3D2,
  Vector3 as Vector36
} from "three";
const foundationMaterial = new MeshBasicMaterial2({
  side: DoubleSide2,
  color: 0
});
const stickerMaterial = new MeshBasicMaterial2({
  vertexColors: true
});
const polyMaterial = new MeshBasicMaterial2({
  transparent: true,
  opacity: 0,
  color: 0
});
function makePoly(coords, color) {
  const geo = new Geometry();
  const vertind = [];
  for (const coord of coords) {
    const v = new Vector36(coord[0], coord[1], coord[2]);
    vertind.push(geo.vertices.length);
    geo.vertices.push(v);
  }
  for (let g = 1; g + 1 < vertind.length; g++) {
    const face2 = new Face3(vertind[0], vertind[g], vertind[g + 1]);
    face2.color = color;
    geo.faces.push(face2);
  }
  geo.computeFaceNormals();
  return geo;
}
class StickerDef {
  constructor(stickerDat, foundationDat) {
    this.origColor = new Color(stickerDat.color);
    this.faceColor = new Color(stickerDat.color);
    this.cubie = new Group3();
    this.geo = makePoly(stickerDat.coords, this.faceColor);
    const obj = new Mesh2(this.geo, stickerMaterial);
    obj.userData.name = stickerDat.orbit + " " + (1 + stickerDat.ord) + " " + stickerDat.ori;
    this.cubie.add(obj);
    if (foundationDat) {
      const fgeo = makePoly(foundationDat.coords, this.faceColor);
      const foundation = new Mesh2(fgeo, foundationMaterial);
      foundation.scale.setScalar(0.999);
      this.cubie.add(foundation);
    }
  }
  setColor(c) {
    this.geo.colorsNeedUpdate = true;
    this.faceColor.copy(c);
  }
}
class HitPlaneDef {
  constructor(hitface) {
    this.cubie = new Group3();
    this.geo = new Geometry();
    const coords = hitface.coords;
    const vertind = [];
    for (const coord of coords) {
      const v = new Vector36(coord[0], coord[1], coord[2]);
      vertind.push(this.geo.vertices.length);
      this.geo.vertices.push(v);
    }
    for (let g = 1; g + 1 < vertind.length; g++) {
      const face2 = new Face3(vertind[0], vertind[g], vertind[g + 1]);
      this.geo.faces.push(face2);
    }
    this.geo.computeFaceNormals();
    const obj = new Mesh2(this.geo, polyMaterial);
    obj.userData.name = hitface.name;
    this.cubie.scale.setScalar(0.99);
    this.cubie.add(obj);
  }
}
class AxisInfo2 {
  constructor(axisDat) {
    const vec = axisDat[0];
    this.axis = new Vector36(vec[0], vec[1], vec[2]);
    this.order = axisDat[2];
  }
}
const PG_SCALE = 0.5;
class PG3D extends Object3D2 {
  constructor(cursor, scheduleRenderCallback, definition, pgdat, showFoundation = false) {
    super();
    this.scheduleRenderCallback = scheduleRenderCallback;
    this.definition = definition;
    this.pgdat = pgdat;
    this.stickerTargets = [];
    this.controlTargets = [];
    this.axesInfo = {};
    const axesDef = this.pgdat.axis;
    for (const axis of axesDef) {
      this.axesInfo[axis[1]] = new AxisInfo2(axis);
    }
    const stickers = this.pgdat.stickers;
    this.stickers = {};
    for (let si = 0; si < stickers.length; si++) {
      const sticker = stickers[si];
      const foundation = showFoundation ? this.pgdat.foundations[si] : void 0;
      const orbit = sticker.orbit;
      const ord = sticker.ord;
      const ori = sticker.ori;
      if (!this.stickers[orbit]) {
        this.stickers[orbit] = [];
      }
      if (!this.stickers[orbit][ori]) {
        this.stickers[orbit][ori] = [];
      }
      const stickerdef = new StickerDef(sticker, foundation);
      stickerdef.cubie.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
      this.stickers[orbit][ori][ord] = stickerdef;
      this.add(stickerdef.cubie);
      this.stickerTargets.push(stickerdef.cubie.children[0]);
    }
    const hitfaces = this.pgdat.faces;
    for (const hitface of hitfaces) {
      const facedef = new HitPlaneDef(hitface);
      facedef.cubie.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
      this.add(facedef.cubie);
      this.controlTargets.push(facedef.cubie.children[0]);
    }
    cursor.addPositionListener(this);
  }
  experimentalGetStickerTargets() {
    return this.stickerTargets;
  }
  experimentalGetControlTargets() {
    return this.controlTargets;
  }
  onPositionChange(p2) {
    const pos = p2.state;
    const noRotation = new Euler2();
    for (const orbit in this.stickers) {
      const pieces = this.stickers[orbit];
      const pos2 = pos[orbit];
      const orin = pieces.length;
      for (let ori = 0; ori < orin; ori++) {
        const pieces2 = pieces[ori];
        for (let i2 = 0; i2 < pieces2.length; i2++) {
          pieces2[i2].cubie.rotation.copy(noRotation);
          const nori = (ori + orin - pos2.orientation[i2]) % orin;
          const ni = pos2.permutation[i2];
          pieces2[i2].setColor(pieces[nori][ni].origColor);
        }
      }
    }
    for (const moveProgress of p2.movesInProgress) {
      const externalBlockMove = moveProgress.move;
      const unswizzled = this.pgdat.unswizzle(externalBlockMove);
      const blockMove = this.pgdat.notationMapper.notationToInternal(externalBlockMove);
      const simpleMove = modifiedBlockMove(externalBlockMove, {amount: 1});
      const baseMove = stateForBlockMove(this.definition, simpleMove);
      const ax = this.axesInfo[unswizzled];
      const turnNormal = ax.axis;
      const angle = -this.ease(moveProgress.fraction) * moveProgress.direction * blockMove.amount * TAU / ax.order;
      for (const orbit in this.stickers) {
        const pieces = this.stickers[orbit];
        const orin = pieces.length;
        const bmv = baseMove[orbit];
        for (let ori = 0; ori < orin; ori++) {
          const pieces2 = pieces[ori];
          for (let i2 = 0; i2 < pieces2.length; i2++) {
            const ni = bmv.permutation[i2];
            if (ni !== i2 || bmv.orientation[i2] !== 0) {
              pieces2[i2].cubie.rotateOnAxis(turnNormal, angle);
            }
          }
        }
      }
    }
    this.scheduleRenderCallback();
  }
  ease(fraction) {
    return smootherStep(fraction);
  }
}

// src/twisty/3D/Twisty3DScene.ts
import {Scene as ThreeScene, PointLight} from "three";
class Twisty3DScene extends ThreeScene {
  constructor() {
    super();
    this.renderTargets = new Set();
    this.twisty3Ds = new Set();
    const lights = [];
    lights[0] = new PointLight(16777215, 1, 0);
    lights[1] = new PointLight(16777215, 1, 0);
    lights[2] = new PointLight(16777215, 1, 0);
    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);
    this.add(lights[0]);
    this.add(lights[1]);
    this.add(lights[2]);
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
}

// src/twisty/3D/puzzles/KPuzzleWrapper.ts
class PuzzleWrapper {
  multiply(state, amount) {
    if (amount < 0) {
      return this.invert(this.multiply(state, -amount));
    }
    let newState = this.identity();
    while (amount > 0) {
      if (amount % 2 === 1) {
        newState = this.combine(newState, state);
      }
      amount = Math.floor(amount / 2);
      state = this.combine(state, state);
    }
    return newState;
  }
}
class KPuzzleWrapper extends PuzzleWrapper {
  constructor(definition) {
    super();
    this.definition = definition;
    this.moveStash = {};
  }
  static fromID(id) {
    return new KPuzzleWrapper(Puzzles[id]);
  }
  startState() {
    return this.definition.startPieces;
  }
  invert(state) {
    return Invert(this.definition, state);
  }
  combine(s1, s2) {
    return Combine(this.definition, s1, s2);
  }
  stateFromMove(blockMove) {
    const key = blockMoveToString(blockMove);
    if (!this.moveStash[key]) {
      this.moveStash[key] = stateForBlockMove(this.definition, blockMove);
    }
    return this.moveStash[key];
  }
  identity() {
    return IdentityTransformation(this.definition);
  }
  equivalent(s1, s2) {
    return EquivalentStates(this.definition, s1, s2);
  }
}

// src/twisty/animation/alg/CursorTypes.ts
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
function DefaultDurationForAmount(amount) {
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

// src/twisty/animation/alg/AlgDuration.ts
class AlgDuration extends TraversalUp {
  constructor(durationForAmount = DefaultDurationForAmount) {
    super();
    this.durationForAmount = durationForAmount;
  }
  traverseSequence(sequence) {
    let total = 0;
    for (const alg11 of sequence.nestedUnits) {
      total += this.traverse(alg11);
    }
    return total;
  }
  traverseGroup(group) {
    return group.amount * this.traverse(group.nestedSequence);
  }
  traverseBlockMove(blockMove) {
    return this.durationForAmount(blockMove.amount);
  }
  traverseCommutator(commutator) {
    return commutator.amount * 2 * (this.traverse(commutator.A) + this.traverse(commutator.B));
  }
  traverseConjugate(conjugate) {
    return conjugate.amount * (2 * this.traverse(conjugate.A) + this.traverse(conjugate.B));
  }
  traversePause(_pause) {
    return this.durationForAmount(1);
  }
  traverseNewLine(_newLine) {
    return this.durationForAmount(1);
  }
  traverseComment(_comment) {
    return this.durationForAmount(0);
  }
}

// src/twisty/animation/alg/AlgIndexer.ts
class CountAnimatedMoves extends TraversalUp {
  traverseSequence(sequence) {
    let total = 0;
    for (const part of sequence.nestedUnits) {
      total += this.traverse(part);
    }
    return total;
  }
  traverseGroup(group) {
    return this.traverseSequence(group.nestedSequence);
  }
  traverseBlockMove(_blockMove) {
    return 1;
  }
  traverseCommutator(commutator) {
    return 2 * (this.traverseSequence(commutator.A) + this.traverseSequence(commutator.B));
  }
  traverseConjugate(conjugate) {
    return 2 * this.traverseSequence(conjugate.A) + this.traverseSequence(conjugate.B);
  }
  traversePause(_pause) {
    return 0;
  }
  traverseNewLine(_newLine) {
    return 0;
  }
  traverseComment(_comment) {
    return 0;
  }
}
class AlgPartDecoration {
  constructor(_puz, moveCount, duration, forward, backward, children = []) {
    this.moveCount = moveCount;
    this.duration = duration;
    this.forward = forward;
    this.backward = backward;
    this.children = children;
  }
}
class DecoratorConstructor extends TraversalUp {
  constructor(puz) {
    super();
    this.puz = puz;
    this.durationFn = new AlgDuration(DefaultDurationForAmount);
    this.identity = puz.identity();
    this.dummyLeaf = new AlgPartDecoration(puz, 0, 0, this.identity, this.identity, []);
  }
  traverseSequence(sequence) {
    let moveCount = 0;
    let duration = 0;
    let state = this.identity;
    const child = [];
    for (const part of sequence.nestedUnits) {
      const apd = this.traverse(part);
      moveCount += apd.moveCount;
      duration += apd.duration;
      state = this.puz.combine(state, apd.forward);
      child.push(apd);
    }
    return new AlgPartDecoration(this.puz, moveCount, duration, state, this.puz.invert(state), child);
  }
  traverseGroup(group) {
    const dec = this.traverseSequence(group.nestedSequence);
    return this.mult(dec, group.amount, [dec]);
  }
  traverseBlockMove(blockMove) {
    return new AlgPartDecoration(this.puz, 1, this.durationFn.traverse(blockMove), this.puz.stateFromMove(blockMove), this.puz.stateFromMove(invertBlockMove(blockMove)));
  }
  traverseCommutator(commutator) {
    const decA = this.traverseSequence(commutator.A);
    const decB = this.traverseSequence(commutator.B);
    const AB = this.puz.combine(decA.forward, decB.forward);
    const ApBp = this.puz.combine(decA.backward, decB.backward);
    const ABApBp = this.puz.combine(AB, ApBp);
    const dec = new AlgPartDecoration(this.puz, 2 * (decA.moveCount + decB.moveCount), 2 * (decA.duration + decB.duration), ABApBp, this.puz.invert(ABApBp), [decA, decB]);
    return this.mult(dec, commutator.amount, [dec, decA, decB]);
  }
  traverseConjugate(conjugate) {
    const decA = this.traverseSequence(conjugate.A);
    const decB = this.traverseSequence(conjugate.B);
    const AB = this.puz.combine(decA.forward, decB.forward);
    const ABAp = this.puz.combine(AB, decA.backward);
    const dec = new AlgPartDecoration(this.puz, 2 * decA.moveCount + decB.moveCount, 2 * decA.duration + decB.duration, ABAp, this.puz.invert(ABAp), [decA, decB]);
    return this.mult(dec, conjugate.amount, [dec, decA, decB]);
  }
  traversePause(pause) {
    return new AlgPartDecoration(this.puz, 1, this.durationFn.traverse(pause), this.identity, this.identity);
  }
  traverseNewLine(_newLine) {
    return this.dummyLeaf;
  }
  traverseComment(_comment) {
    return this.dummyLeaf;
  }
  mult(apd, n, child) {
    const absn = Math.abs(n);
    const st = this.puz.multiply(apd.forward, n);
    return new AlgPartDecoration(this.puz, apd.moveCount * absn, apd.duration * absn, st, this.puz.invert(st), child);
  }
}
class WalkerDown {
  constructor(apd, back) {
    this.apd = apd;
    this.back = back;
  }
}
class AlgWalker extends TraversalDownUp {
  constructor(puz, alg11, apd) {
    super();
    this.puz = puz;
    this.alg = alg11;
    this.apd = apd;
    this.i = -1;
    this.dur = -1;
    this.goali = -1;
    this.goaldur = -1;
    this.mv = void 0;
    this.back = false;
    this.moveDur = 0;
    this.st = this.puz.identity();
    this.root = new WalkerDown(this.apd, false);
  }
  moveByIndex(loc) {
    if (this.i >= 0 && this.i === loc) {
      return this.mv !== void 0;
    }
    return this.dosearch(loc, Infinity);
  }
  moveByDuration(dur) {
    if (this.dur >= 0 && this.dur < dur && this.dur + this.moveDur >= dur) {
      return this.mv !== void 0;
    }
    return this.dosearch(Infinity, dur);
  }
  dosearch(loc, dur) {
    this.goali = loc;
    this.goaldur = dur;
    this.i = 0;
    this.dur = 0;
    this.mv = void 0;
    this.moveDur = 0;
    this.back = false;
    this.st = this.puz.identity();
    const r3 = this.traverse(this.alg, this.root);
    return r3;
  }
  traverseSequence(sequence, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    if (wd.back) {
      for (let i2 = sequence.nestedUnits.length - 1; i2 >= 0; i2--) {
        const part = sequence.nestedUnits[i2];
        if (this.traverse(part, new WalkerDown(wd.apd.children[i2], wd.back))) {
          return true;
        }
      }
    } else {
      for (let i2 = 0; i2 < sequence.nestedUnits.length; i2++) {
        const part = sequence.nestedUnits[i2];
        if (this.traverse(part, new WalkerDown(wd.apd.children[i2], wd.back))) {
          return true;
        }
      }
    }
    return false;
  }
  traverseGroup(group, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, group.amount);
    return this.traverse(group.nestedSequence, new WalkerDown(wd.apd.children[0], back));
  }
  traverseBlockMove(blockMove, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    this.mv = blockMove;
    this.moveDur = wd.apd.duration;
    this.back = wd.back;
    return true;
  }
  traverseCommutator(commutator, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, commutator.amount);
    if (back) {
      return this.traverse(commutator.B, new WalkerDown(wd.apd.children[2], !back)) || this.traverse(commutator.A, new WalkerDown(wd.apd.children[1], !back)) || this.traverse(commutator.B, new WalkerDown(wd.apd.children[2], back)) || this.traverse(commutator.A, new WalkerDown(wd.apd.children[1], back));
    } else {
      return this.traverse(commutator.A, new WalkerDown(wd.apd.children[1], back)) || this.traverse(commutator.B, new WalkerDown(wd.apd.children[2], back)) || this.traverse(commutator.A, new WalkerDown(wd.apd.children[1], !back)) || this.traverse(commutator.B, new WalkerDown(wd.apd.children[2], !back));
    }
  }
  traverseConjugate(conjugate, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, conjugate.amount);
    if (back) {
      return this.traverse(conjugate.A, new WalkerDown(wd.apd.children[1], !back)) || this.traverse(conjugate.B, new WalkerDown(wd.apd.children[2], back)) || this.traverse(conjugate.A, new WalkerDown(wd.apd.children[1], back));
    } else {
      return this.traverse(conjugate.A, new WalkerDown(wd.apd.children[1], back)) || this.traverse(conjugate.B, new WalkerDown(wd.apd.children[2], back)) || this.traverse(conjugate.A, new WalkerDown(wd.apd.children[1], !back));
    }
  }
  traversePause(pause, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    this.mv = pause;
    this.moveDur = wd.apd.duration;
    this.back = wd.back;
    return true;
  }
  traverseNewLine(_newLine, _wd) {
    return false;
  }
  traverseComment(_comment, _wd) {
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
}
function invertBlockMove(bm) {
  return new BlockMove(bm.outerLayer, bm.innerLayer, bm.family, -bm.amount);
}
const countAnimatedMovesInstance = new CountAnimatedMoves();
const countAnimatedMoves = countAnimatedMovesInstance.traverse.bind(countAnimatedMovesInstance);

// src/twisty/animation/alg/TreeAlgIndexer.ts
class TreeAlgIndexer {
  constructor(puzzle, alg11) {
    this.puzzle = puzzle;
    const deccon = new DecoratorConstructor(this.puzzle);
    this.decoration = deccon.traverse(alg11);
    this.walker = new AlgWalker(this.puzzle, alg11, this.decoration);
  }
  getMove(index) {
    if (this.walker.moveByIndex(index)) {
      if (!this.walker.mv) {
        throw new Error("`this.walker.mv` missing");
      }
      const bm = this.walker.mv;
      if (this.walker.back) {
        return invertBlockMove(bm);
      }
      return bm;
    }
    throw new Error("Out of algorithm: index " + index);
  }
  indexToMoveStartTimestamp(index) {
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
    return this.walker.moveDur;
  }
}

// src/twisty/animation/alg/AlgCursor.ts
class AlgCursor {
  constructor(timeline, def, alg11, startStateSequence) {
    this.timeline = timeline;
    this.def = def;
    this.alg = alg11;
    this.positionListeners = new Set();
    timeline.addTimestampListener(this);
    this.ksolvePuzzle = new KPuzzleWrapper(def);
    this.todoIndexer = new TreeAlgIndexer(this.ksolvePuzzle, alg11);
    this.startState = startStateSequence ? this.algToState(startStateSequence) : this.ksolvePuzzle.startState();
  }
  setStartState(startState) {
    this.startState = startState;
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
  }
  algToState(s) {
    const kpuzzle7 = new KPuzzle(this.def);
    kpuzzle7.applyAlg(s);
    return this.ksolvePuzzle.combine(this.def.startPieces, kpuzzle7.state);
  }
  timeRange() {
    return {
      start: 0,
      end: this.todoIndexer.algDuration()
    };
  }
  experimentalTimestampForStartOfLastMove() {
    const numMoves = this.todoIndexer.numMoves();
    if (numMoves > 0) {
      return this.todoIndexer.indexToMoveStartTimestamp(numMoves - 1);
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
    const idx = this.todoIndexer.timestampToIndex(timestamp);
    const state = this.todoIndexer.stateAtIndex(idx, this.startState);
    const position = {
      state,
      movesInProgress: []
    };
    if (this.todoIndexer.numMoves() > 0) {
      const fraction = (timestamp - this.todoIndexer.indexToMoveStartTimestamp(idx)) / this.todoIndexer.moveDuration(idx);
      if (fraction === 1) {
        position.state = this.ksolvePuzzle.combine(state, this.ksolvePuzzle.stateFromMove(this.todoIndexer.getMove(idx)));
      } else if (fraction > 0) {
        position.movesInProgress.push({
          move: this.todoIndexer.getMove(idx),
          direction: Direction.Forwards,
          fraction
        });
      }
    }
    for (const listener of listeners) {
      listener.onPositionChange(position);
    }
  }
  onTimeRangeChange(_timeRange) {
  }
  setAlg(alg11) {
    this.todoIndexer = new TreeAlgIndexer(this.ksolvePuzzle, alg11);
    this.timeline.onCursorChange(this);
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
  }
  moveBoundary(timestamp, direction) {
    if (this.todoIndexer.numMoves() === 0) {
      return null;
    }
    const offsetHack = directionScalar(direction) * 1e-3;
    const idx = this.todoIndexer.timestampToIndex(timestamp + offsetHack);
    const moveStart = this.todoIndexer.indexToMoveStartTimestamp(idx);
    if (direction === Direction.Backwards) {
      return timestamp >= moveStart ? moveStart : null;
    } else {
      const moveEnd = moveStart + this.todoIndexer.moveDuration(idx);
      return timestamp <= moveEnd ? moveEnd : null;
    }
  }
  setPuzzle(def, alg11 = this.alg, startStateSequence) {
    this.ksolvePuzzle = new KPuzzleWrapper(def);
    this.def = def;
    this.todoIndexer = new TreeAlgIndexer(this.ksolvePuzzle, alg11);
    if (alg11 !== this.alg) {
      this.timeline.onCursorChange(this);
    }
    this.setStartState(startStateSequence ? this.algToState(startStateSequence) : this.ksolvePuzzle.startState());
    this.alg = alg11;
  }
}

// src/twisty/animation/Timeline.ts
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
class Timeline {
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
    this.animating = false;
    const oldTimestamp = this.timestamp;
    this.timestamp = timestamp;
    this.lastAnimFrameNow = getNow();
    if (oldTimestamp !== timestamp) {
      this.dispatchAction(TimelineAction.Jumping);
      this.scheduler.requestAnimFrame();
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
}

// src/twisty/dom/controls/buttons.css.ts
const buttonGridCSS = new CSSSource(`
.wrapper {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: repeat(6, 1fr);
}
`);
const buttonCSS = new CSSSource(`
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
`);

// src/twisty/dom/controls/buttons.ts
class TwistyControlButton extends ManagedCustomElement {
  constructor(timeline, timelineCommand, fullscreenElement) {
    super();
    this.fullscreenElement = fullscreenElement;
    this.currentIconName = null;
    this.button = document.createElement("button");
    if (!timeline) {
      console.log("Must have timeline!");
    }
    this.timeline = timeline;
    if (!timelineCommand) {
      console.log("Must have timelineCommand!");
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
      fullscreen: "enter-fullscreen"
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
      fullscreen: "Enter fullscreen"
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
}
customElementsShim.define("twisty-control-button", TwistyControlButton);
class TwistyControlButtonPanel extends ManagedCustomElement {
  constructor(timeline, fullscreenElement) {
    super();
    this.addCSS(buttonGridCSS);
    this.addElement(new TwistyControlButton(timeline, "fullscreen", fullscreenElement));
    this.addElement(new TwistyControlButton(timeline, "jump-to-start"));
    this.addElement(new TwistyControlButton(timeline, "play-step-backwards"));
    this.addElement(new TwistyControlButton(timeline, "play-pause"));
    this.addElement(new TwistyControlButton(timeline, "play-step"));
    this.addElement(new TwistyControlButton(timeline, "jump-to-end"));
  }
}
customElementsShim.define("twisty-control-button-panel", TwistyControlButtonPanel);

// src/twisty/dom/controls/TwistyScrubber.css.ts
const twistyScrubberCSS = new CSSSource(`
:host(twisty-scrubber) {
  width: 384px;
  height: 16px;
  contain: content;
  display: grid;

  background: rgba(196, 196, 196, 0.5);
}

input {
  margin: 0; width: 100%;
}
`);

// src/twisty/dom/controls/TwistyScrubber.ts
class TwistyScrubber2 extends ManagedCustomElement {
  constructor(timeline) {
    super();
    this.range = document.createElement("input");
    this.timeline = timeline;
    this.addCSS(twistyScrubberCSS);
    this.timeline.addTimestampListener(this);
    this.range.type = "range";
    this.range.step = 1 .toString();
    this.range.min = this.timeline.minTimestamp().toString();
    this.range.max = this.timeline.maxTimestamp().toString();
    this.range.value = this.timeline.timestamp.toString();
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
}
customElementsShim.define("twisty-scrubber", TwistyScrubber2);

// src/twisty/dom/TwistyPlayer.css.ts
const twistyPlayerCSS = new CSSSource(`
:host(twisty-player) {
  width: 384px;
  height: 256px;
  contain: content;
  display: grid;
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.wrapper {
  display: grid;
  grid-template-rows: 7fr 1em 1fr;
  overflow: hidden;
}

.wrapper.controls-none {
  grid-template-rows: 7fr;
}

.wrapper.controls-none twisty-scrubber,
.wrapper.controls-none twisty-control-button-panel {
  display: none;
}

twisty-viewer-wrapper {
  overflow: hidden;
}

twisty-scrubber {
  width: 100%;
}

.wrapper.checkered {
  background-color: #EAEAEA;
  background-image: linear-gradient(45deg, #DDD 25%, transparent 25%, transparent 75%, #DDD 75%, #DDD),
    linear-gradient(45deg, #DDD 25%, transparent 25%, transparent 75%, #DDD 75%, #DDD);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
}
`);

// src/twisty/dom/viewers/Twisty2DSVGView.css.ts
const twisty2DSVGCSS = new CSSSource(`
.wrapper,
.svg-wrapper,
twisty-2d-svg,
svg {
  width: 100%;
  height: 100%;
  display: grid;
  min-height: 0;
}
`);

// src/twisty/dom/viewers/Twisty2DSVG.ts
class Twisty2DSVG extends ManagedCustomElement {
  constructor(cursor, def = Puzzles["3x3x3"]) {
    super();
    this.scheduler = new RenderScheduler(this.render.bind(this));
    this.addCSS(twisty2DSVGCSS);
    this.definition = def;
    this.svg = new SVG(this.definition);
    this.addElement(this.svg.element);
    cursor.addPositionListener(this);
  }
  onPositionChange(position) {
    if (position.movesInProgress.length > 0) {
      const move = position.movesInProgress[0].move;
      const def = this.definition;
      const partialMove = new BlockMove(move.outerLayer, move.innerLayer, move.family, move.amount * position.movesInProgress[0].direction);
      const newState = Combine(def, position.state, stateForBlockMove(def, partialMove));
      this.svg.draw(this.definition, position.state, newState, position.movesInProgress[0].fraction);
    } else {
      this.svg.draw(this.definition, position.state);
    }
  }
  scheduleRender() {
    this.scheduler.requestAnimFrame();
  }
  render() {
  }
}
customElementsShim.define("twisty-2d-svg", Twisty2DSVG);

// src/twisty/dom/TwistyPlayer.ts
function createPG(puzzleName) {
  const pg = getPuzzleGeometryByName(puzzleName, [
    "allmoves",
    "true",
    "orientcenters",
    "true"
  ]);
  return pg;
}
function is3DVisualization(visualizationFormat) {
  return ["3D", "PG3D"].includes(visualizationFormat);
}
class TwistyPlayer2 extends ManagedCustomElement {
  constructor(initialConfig = {}, legacyExperimentalPG3DViewConfig = null) {
    super();
    this.scene = null;
    this.twisty3D = null;
    this.viewerElems = [];
    this.controlElems = [];
    this.#hackyPendingFinalMoveCoalesce = false;
    this.legacyExperimentalCoalesceModFunc = (_mv) => 0;
    this.#controlsClassListManager = new ClassListManager(this, "controls-", ["none", "bottom-row"]);
    this.legacyExperimentalPG3D = null;
    this.addCSS(twistyPlayerCSS);
    this.#config = new TwistyPlayerConfig(this, initialConfig);
    this.contentWrapper.classList.add("checkered");
    this.legacyExperimentalPG3DViewConfig = legacyExperimentalPG3DViewConfig;
  }
  #config;
  #hackyPendingFinalMoveCoalesce;
  #viewerWrapper;
  #controlsClassListManager;
  set alg(seq) {
    if (seq?.type !== "sequence") {
      console.warn("`alg` for a `TwistyPlayer` was set using a string. It should be set using a `Sequence`!");
      seq = parser_pegjs.parse(seq);
    }
    this.#config.attributes["alg"].setValue(seq);
    this.cursor?.setAlg(seq);
  }
  get alg() {
    return this.#config.attributes["alg"].value;
  }
  set experimentalStartSetup(seq) {
    if (seq?.type !== "sequence") {
      console.warn("`experimentalStartSetup` for a `TwistyPlayer` was set using a string. It should be set using a `Sequence`!");
      seq = parser_pegjs.parse(seq);
    }
    this.#config.attributes["experimental-start-setup"].setValue(seq);
    if (this.cursor) {
      this.cursor.setStartState(this.cursor.algToState(seq));
    }
  }
  get experimentalStartSetup() {
    return this.#config.attributes["experimental-start-setup"].value;
  }
  set puzzle(puzzle) {
    if (this.#config.attributes["puzzle"].setValue(puzzle)) {
      this.setPuzzle(puzzle);
    }
  }
  get puzzle() {
    return this.#config.attributes["puzzle"].value;
  }
  set visualization(visualization) {
    if (this.#config.attributes["visualization"].setValue(visualization)) {
      this.setPuzzle(this.puzzle);
    }
  }
  get visualization() {
    return this.#config.attributes["visualization"].value;
  }
  set hintFacelets(hintFacelets) {
    if (this.#config.attributes["hint-facelets"].setValue(hintFacelets)) {
      if (this.twisty3D instanceof Cube3D) {
        this.twisty3D.experimentalUpdateOptions({hintFacelets});
      }
    }
  }
  get hintFacelets() {
    return this.#config.attributes["hint-facelets"].value;
  }
  get experimentalStickering() {
    return this.#config.attributes["experimental-stickering"].value;
  }
  set experimentalStickering(experimentalStickering) {
    if (this.#config.attributes["experimental-stickering"].setValue(experimentalStickering)) {
      if (this.twisty3D instanceof Cube3D) {
        this.twisty3D.experimentalUpdateOptions({
          experimentalStickering
        });
      }
    }
  }
  set background(background) {
    if (this.#config.attributes["background"].setValue(background)) {
      this.contentWrapper.classList.toggle("checkered", background === "checkered");
    }
  }
  get background() {
    return this.#config.attributes["background"].value;
  }
  set controls(controls) {
    this.#controlsClassListManager.setValue(controls);
  }
  get controls() {
    return this.#config.attributes["controls"].value;
  }
  set backView(backView) {
    if (backView !== "none" && this.viewerElems.length === 1) {
      this.createBackViewer();
    }
    if (backView === "none" && this.viewerElems.length > 1) {
      this.removeBackViewerElem();
    }
    if (this.#viewerWrapper && this.#viewerWrapper.setBackView(backView)) {
      for (const viewer of this.viewerElems) {
        viewer.makeInvisibleUntilRender();
      }
    }
  }
  get backView() {
    return this.#config.attributes["back-view"].value;
  }
  set cameraPosition(cameraPosition) {
    this.#config.attributes["camera-position"].setValue(cameraPosition);
    if (this.viewerElems && ["3D", "PG3D"].includes(this.#config.attributes["visualization"].value)) {
      this.viewerElems[0]?.camera.position.copy(this.effectiveCameraPosition);
      this.viewerElems[0]?.scheduleRender();
      this.viewerElems[1]?.camera.position.copy(this.effectiveCameraPosition).multiplyScalar(-1);
      this.viewerElems[1]?.scheduleRender();
    }
  }
  get cameraPosition() {
    return this.#config.attributes["camera-position"].value;
  }
  get effectiveCameraPosition() {
    return this.cameraPosition ?? this.defaultCameraPosition;
  }
  get defaultCameraPosition() {
    return this.puzzle[1] === "x" ? cubeCameraPosition : centeredCameraPosition;
  }
  static get observedAttributes() {
    return TwistyPlayerConfig.observedAttributes;
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    this.#config.attributeChangedCallback(attributeName, oldValue, newValue);
  }
  connectedCallback() {
    this.timeline = new Timeline();
    this.timeline.addActionListener(this);
    this.contentWrapper.classList.toggle("checkered", this.background === "checkered");
    const setBackView = this.backView && this.visualization !== "2D";
    const backView = setBackView ? this.backView : "none";
    this.#viewerWrapper = new TwistyViewerWrapper2({
      backView
    });
    this.addElement(this.#viewerWrapper);
    this.createViewers(this.timeline, this.alg, this.visualization, this.puzzle, this.backView !== "none");
    const scrubber = new TwistyScrubber2(this.timeline);
    const controlButtonGrid = new TwistyControlButtonPanel(this.timeline, this);
    this.controlElems = [scrubber, controlButtonGrid];
    this.#controlsClassListManager.setValue(this.controls);
    this.addElement(this.controlElems[0]);
    this.addElement(this.controlElems[1]);
  }
  createViewers(timeline, alg11, visualization, puzzleName, backView) {
    switch (visualization) {
      case "2D": {
        try {
          this.cursor = new AlgCursor(timeline, Puzzles[puzzleName], alg11, this.experimentalStartSetup);
        } catch (e) {
          this.cursor = new AlgCursor(timeline, Puzzles[puzzleName], new Sequence([]), this.experimentalStartSetup);
        }
        this.cursor.setStartState(this.cursor.algToState(this.experimentalStartSetup));
        this.timeline.addCursor(this.cursor);
        if (this.experimentalStartSetup.nestedUnits.length === 0) {
          this.timeline.jumpToEnd();
        }
        const mainViewer = new Twisty2DSVG(this.cursor, Puzzles[puzzleName]);
        this.viewerElems = [mainViewer];
        this.#viewerWrapper.addElement(mainViewer);
        return;
      }
      case "3D":
        if (puzzleName === "3x3x3") {
          try {
            this.cursor = new AlgCursor(timeline, Puzzles[puzzleName], alg11, this.experimentalStartSetup);
          } catch (e) {
            this.cursor = new AlgCursor(timeline, Puzzles[puzzleName], new Sequence([]), this.experimentalStartSetup);
          }
          this.cursor.setStartState(this.cursor.algToState(this.experimentalStartSetup));
          this.scene = new Twisty3DScene();
          this.twisty3D = new Cube3D(this.cursor, this.scene.scheduleRender.bind(this.scene), {
            hintFacelets: this.hintFacelets,
            experimentalStickering: this.experimentalStickering
          });
          this.scene.addTwisty3DPuzzle(this.twisty3D);
          const mainViewer = new Twisty3DCanvas2(this.scene, {
            cameraPosition: this.effectiveCameraPosition
          });
          this.#viewerWrapper.addElement(mainViewer);
          this.viewerElems = [mainViewer];
          if (backView) {
            this.createBackViewer();
          }
          this.timeline.addCursor(this.cursor);
          if (this.experimentalStartSetup.nestedUnits.length === 0) {
            this.timeline.jumpToEnd();
          }
          return;
        }
      case "PG3D": {
        const [kpuzzleDef, stickerDat] = this.pgHelper(puzzleName);
        try {
          this.cursor = new AlgCursor(timeline, kpuzzleDef, alg11, this.experimentalStartSetup);
        } catch (e) {
          this.cursor = new AlgCursor(timeline, kpuzzleDef, new Sequence([]), this.experimentalStartSetup);
        }
        this.scene = new Twisty3DScene();
        const pg3d = new PG3D(this.cursor, this.scene.scheduleRender.bind(this.scene), kpuzzleDef, stickerDat, this.legacyExperimentalPG3DViewConfig?.showFoundation ?? true);
        this.twisty3D = pg3d;
        this.legacyExperimentalPG3D = pg3d;
        this.scene.addTwisty3DPuzzle(this.twisty3D);
        const mainViewer = new Twisty3DCanvas2(this.scene, {
          cameraPosition: this.effectiveCameraPosition
        });
        this.viewerElems = [mainViewer];
        this.#viewerWrapper.addElement(mainViewer);
        if (backView) {
          this.createBackViewer();
        }
        this.timeline.addCursor(this.cursor);
        if (this.experimentalStartSetup.nestedUnits.length === 0) {
          this.timeline.jumpToEnd();
        }
        return;
      }
      default:
        throw new Error("Unknown visualization");
    }
  }
  pgHelper(puzzleName) {
    let kpuzzleDef;
    let stickerDat;
    if (this.legacyExperimentalPG3DViewConfig) {
      kpuzzleDef = this.legacyExperimentalPG3DViewConfig.def;
      stickerDat = this.legacyExperimentalPG3DViewConfig.stickerDat;
    } else {
      const pg = createPG(puzzleName);
      stickerDat = pg.get3d();
      kpuzzleDef = pg.writekpuzzle();
    }
    return [kpuzzleDef, stickerDat];
  }
  createBackViewer() {
    if (!is3DVisualization(this.visualization)) {
      throw new Error("Back viewer requires a 3D visualization");
    }
    const backViewer = new Twisty3DCanvas2(this.scene, {
      cameraPosition: this.effectiveCameraPosition,
      negateCameraPosition: true
    });
    this.viewerElems.push(backViewer);
    this.viewerElems[0].setMirror(backViewer);
    this.#viewerWrapper.addElement(backViewer);
  }
  removeBackViewerElem() {
    if (this.viewerElems.length !== 2) {
      throw new Error("Tried to remove non-existent back view!");
    }
    this.#viewerWrapper.removeElement(this.viewerElems.pop());
  }
  setPuzzle(puzzleName, legacyExperimentalPG3DViewConfig) {
    this.puzzle = puzzleName;
    this.legacyExperimentalPG3DViewConfig = legacyExperimentalPG3DViewConfig ?? null;
    switch (this.visualization) {
      case "PG3D": {
        const scene = this.scene;
        scene.remove(this.twisty3D);
        this.cursor.removePositionListener(this.twisty3D);
        const [def, dat] = this.pgHelper(this.puzzle);
        this.cursor.setPuzzle(def, void 0, this.experimentalStartSetup);
        const pg3d = new PG3D(this.cursor, scene.scheduleRender.bind(scene), def, dat, this.legacyExperimentalPG3DViewConfig?.showFoundation);
        scene.addTwisty3DPuzzle(pg3d);
        this.twisty3D = pg3d;
        this.legacyExperimentalPG3D = pg3d;
        for (const viewer of this.viewerElems) {
          viewer.scheduleRender();
        }
        return;
      }
    }
    const oldCursor = this.cursor;
    for (const oldViewer of this.viewerElems) {
      this.#viewerWrapper.removeElement(oldViewer);
    }
    this.createViewers(this.timeline, this.alg, this.visualization, puzzleName, this.backView !== "none");
    this.timeline.removeCursor(oldCursor);
    this.timeline.removeTimestampListener(oldCursor);
  }
  experimentalAddMove(move, coalesce = false, coalesceDelayed = false) {
    if (this.#hackyPendingFinalMoveCoalesce) {
      this.hackyCoalescePending();
    }
    const oldNumMoves = countMoves(this.alg);
    const newAlg = experimentalAppendBlockMove(this.alg, move, coalesce && !coalesceDelayed, this.legacyExperimentalCoalesceModFunc(move));
    if (coalesce && coalesceDelayed) {
      this.#hackyPendingFinalMoveCoalesce = true;
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
    if (actionEvent.action === TimelineAction.Pausing && actionEvent.locationType === TimestampLocationType.EndOfTimeline && this.#hackyPendingFinalMoveCoalesce) {
      this.hackyCoalescePending();
      this.timeline.jumpToEnd();
    }
  }
  hackyCoalescePending() {
    const units = this.alg.nestedUnits;
    const length = units.length;
    const pending = this.#hackyPendingFinalMoveCoalesce;
    this.#hackyPendingFinalMoveCoalesce = false;
    if (pending && length > 1 && units[length - 1].type === "blockMove") {
      const finalMove = units[length - 1];
      const newAlg = experimentalAppendBlockMove(new Sequence(units.slice(0, length - 1)), finalMove, true, this.legacyExperimentalCoalesceModFunc(finalMove));
      this.alg = newAlg;
    }
  }
  fullscreen() {
    this.requestFullscreen();
  }
}
customElementsShim.define("twisty-player", TwistyPlayer2);

// src/twisty/animation/alg/SimpleAlgIndexer.ts
class SimpleAlgIndexer {
  constructor(puzzle, alg11) {
    this.puzzle = puzzle;
    this.durationFn = new AlgDuration(DefaultDurationForAmount);
    this.moves = expand(alg11);
  }
  getMove(index) {
    return this.moves.nestedUnits[index];
  }
  indexToMoveStartTimestamp(index) {
    const seq = new Sequence(this.moves.nestedUnits.slice(0, index));
    return this.durationFn.traverse(seq);
  }
  timestampToIndex(timestamp) {
    let cumulativeTime = 0;
    let i2;
    for (i2 = 0; i2 < this.numMoves(); i2++) {
      cumulativeTime += this.durationFn.traverseBlockMove(this.getMove(i2));
      if (cumulativeTime >= timestamp) {
        return i2;
      }
    }
    return i2;
  }
  stateAtIndex(index) {
    return this.puzzle.combine(this.puzzle.startState(), this.transformAtIndex(index));
  }
  transformAtIndex(index) {
    let state = this.puzzle.identity();
    for (const move of this.moves.nestedUnits.slice(0, index)) {
      state = this.puzzle.combine(state, this.puzzle.stateFromMove(move));
    }
    return state;
  }
  algDuration() {
    return this.durationFn.traverse(this.moves);
  }
  numMoves() {
    return countAnimatedMoves(this.moves);
  }
  moveDuration(index) {
    return this.durationFn.traverseBlockMove(this.getMove(index));
  }
}

// src/twisty/animation/stream/timeline-move-calculation-draft.ts
function isSameAxis(move1, move2) {
  const familyRoots = move1.family[0].toLowerCase() + move2.family[0].toLowerCase();
  return ![
    "uu",
    "ud",
    "du",
    "dd",
    "ll",
    "lr",
    "rl",
    "rr",
    "ff",
    "fb",
    "bf",
    "bb"
  ].includes(familyRoots);
}
function toAxes(events, diameterMs) {
  const axes = [];
  const axisMoveTracker = new Map();
  let lastEntry = null;
  for (const event of events) {
    if (!lastEntry) {
      lastEntry = {
        event,
        start: event.timeStamp - diameterMs / 2,
        end: event.timeStamp + diameterMs / 2
      };
      axes.push([lastEntry]);
      axisMoveTracker.set(experimentalBlockMoveQuantumName(lastEntry.event.move), lastEntry);
      continue;
    }
    const newEntry = {
      event,
      start: event.timeStamp - diameterMs / 2,
      end: event.timeStamp + diameterMs / 2
    };
    if (isSameAxis(lastEntry.event.move, event.move)) {
      const quarterName = experimentalBlockMoveQuantumName(newEntry.event.move);
      const prev = axisMoveTracker.get(quarterName);
      if (prev && prev.end > newEntry.start && Math.sign(prev.event.move.amount) === Math.sign(newEntry.event.move.amount)) {
        prev.event.move = new BlockMove(prev.event.move.outerLayer, prev.event.move.innerLayer, prev.event.move.family, prev.event.move.amount + newEntry.event.move.amount);
      } else {
        axes[axes.length - 1].push(newEntry);
        axisMoveTracker.set(quarterName, newEntry);
      }
    } else {
      axes.push([newEntry]);
      axisMoveTracker.clear();
      axisMoveTracker.set(experimentalBlockMoveQuantumName(newEntry.event.move), newEntry);
      if (newEntry.start < lastEntry.end) {
        const midpoint = (newEntry.start + lastEntry.end) / 2;
        newEntry.start = midpoint;
        lastEntry.end = midpoint;
      }
    }
    lastEntry = newEntry;
  }
  return axes;
}
const defaultDiameterMs = 200;
function toTimeline(events, diameterMs = defaultDiameterMs) {
  const axes = toAxes(events, diameterMs);
  return axes.flat();
}

export {
  TreeAlgIndexer,
  SimpleAlgIndexer,
  experimentalShowRenderStats,
  toTimeline,
  KPuzzleWrapper,
  experimentalSetShareAllNewRenderers,
  Twisty3DCanvas2 as Twisty3DCanvas,
  PG3D,
  TwistyPlayer2 as TwistyPlayer,
  Cube3D
};
//# sourceMappingURL=chunk.DAURLJ5Q.js.map
