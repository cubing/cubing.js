import {
  Color,
  Face3,
  Vector3,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  MeshBasicMaterial,
  Geometry,
  Object3D,
} from "three";
import Stats from "../../vendor/node_modules/three/examples/jsm/libs/stats.module";

let scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  cube: Object3D,
  stats: Stats;

let width: number, height: number;

const m = 60;
const useStats = true;

function init() {
  scene = new Scene();
  scene.background = new Color(0x808080);
  width = window.innerWidth - 20;
  height = window.innerHeight - 20;
  initCamera();
  initRenderer();
  initCube();
  document.body.appendChild(renderer.domElement);
  if (useStats) {
    stats = createStats();
    document.body.appendChild(stats.domElement);
  }
  requestAnimationFrame(render);
}
function initCamera() {
  camera = new PerspectiveCamera(70, width / height, 1, 10);
  camera.position.set(0, 0, 3);
  camera.lookAt(scene.position);
}
function initRenderer() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
}
function makepoint(
  geo: Geometry,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  y: number,
  m: number,
  off: number,
) {
  const r = new Vector3(0, 0, 0);
  const t = geo.vertices[a].clone();
  t.multiplyScalar((x * y) / (m * m));
  r.add(t);
  t.copy(geo.vertices[b]);
  t.multiplyScalar(((m - x) * y) / (m * m));
  r.add(t);
  t.copy(geo.vertices[c]);
  t.multiplyScalar(((m - x) * (m - y)) / (m * m));
  r.add(t);
  t.copy(geo.vertices[d]);
  t.multiplyScalar((x * (m - y)) / (m * m));
  r.add(t);
  r.multiplyScalar(1 + off);
  const ri = geo.vertices.length;
  geo.vertices.push(r);
  return ri;
}
function addface(
  geo: Geometry,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  y: number,
  m: number,
  black: Color,
  colors: any[],
) {
  const color = colors[Math.floor(6 * Math.random())];
  const u = 0.08;
  const off = 0.00002;
  let aa = makepoint(geo, a, b, c, d, x + u, y + u, m, off);
  let bb = makepoint(geo, a, b, c, d, x + 1 - u, y + u, m, off);
  let cc = makepoint(geo, a, b, c, d, x + 1 - u, y + 1 - u, m, off);
  let dd = makepoint(geo, a, b, c, d, x + u, y + 1 - u, m, off);
  let f1 = new Face3(aa, bb, cc);
  let f2 = new Face3(aa, cc, dd);
  f1.color = color;
  f2.color = color;
  geo.faces.push(f1);
  geo.faces.push(f2);
  aa = makepoint(geo, a, b, c, d, x, y, m, 0);
  bb = makepoint(geo, a, b, c, d, x + 1, y, m, 0);
  cc = makepoint(geo, a, b, c, d, x + 1, y + 1, m, 0);
  dd = makepoint(geo, a, b, c, d, x, y + 1, m, 0);
  f1 = new Face3(aa, cc, bb);
  f2 = new Face3(aa, dd, cc);
  const f3 = new Face3(aa, bb, cc);
  const f4 = new Face3(aa, cc, dd);
  f1.color = black;
  f2.color = black;
  f3.color = black;
  f4.color = black;
  geo.faces.push(f1);
  geo.faces.push(f2);
  geo.faces.push(f3);
  geo.faces.push(f4);
}
function getCube() {
  const geo = new Geometry();
  geo.vertices.push(
    new Vector3(-1, -1, -1),
    new Vector3(-1, -1, 1),
    new Vector3(-1, 1, -1),
    new Vector3(-1, 1, 1),
    new Vector3(1, -1, -1),
    new Vector3(1, -1, 1),
    new Vector3(1, 1, -1),
    new Vector3(1, 1, 1),
  );
  const black = new Color(0);
  const colors = [];
  for (let i = 0; i < 6; i++) {
    colors.push(new Color(Math.floor(0x1000000 * Math.random())));
  }
  for (let x = 0; x < m; x++) {
    for (let y = 0; y < m; y++) {
      addface(geo, 0, 1, 3, 2, x, y, m, black, colors);
      addface(geo, 4, 6, 7, 5, x, y, m, black, colors);
      addface(geo, 0, 2, 6, 4, x, y, m, black, colors);
      addface(geo, 1, 5, 7, 3, x, y, m, black, colors);
      addface(geo, 0, 4, 5, 1, x, y, m, black, colors);
      addface(geo, 2, 3, 7, 6, x, y, m, black, colors);
    }
  }
  return new Mesh(geo, new MeshBasicMaterial({ vertexColors: true }));
}
function initCube() {
  cube = getCube();
  scene.add(cube);
}

const speed = 0.01;
function rotateCube() {
  cube.rotation.x -= speed;
  cube.rotation.y -= speed;
  cube.rotation.z -= speed;
}
function render() {
  requestAnimationFrame(render);
  rotateCube();
  renderer.render(scene, camera);
  if (stats) {
    stats.update();
  }
}
function createStats() {
  stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0";
  stats.domElement.style.top = "0";
  return stats;
}
export function setup(): void {
  init();
}
