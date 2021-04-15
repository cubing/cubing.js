import {
  Color,
  Vector3,
  Scene,
  Group,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  MeshBasicMaterial,
  BufferGeometry,
  Object3D,
  BufferAttribute,
} from "three";
import Stats from "../../vendor/node_modules/three/examples/jsm/libs/stats.module";

let scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  cube: Object3D,
  cube2: Object3D,
  stats: Stats;

let width: number, height: number;

const m = 100;
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
let pos: Float32Array;
let posLoc: number = 0;
let color: Float32Array;
let colorLoc: number = 0;
function makepoint(
  verts: Vector3[],
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  y: number,
  m: number,
  off: number,
): void {
  const r = new Vector3(0, 0, 0);
  const t = verts[a].clone();
  t.multiplyScalar((x * y) / (m * m));
  r.add(t);
  t.copy(verts[b]);
  t.multiplyScalar(((m - x) * y) / (m * m));
  r.add(t);
  t.copy(verts[c]);
  t.multiplyScalar(((m - x) * (m - y)) / (m * m));
  r.add(t);
  t.copy(verts[d]);
  t.multiplyScalar((x * (m - y)) / (m * m));
  r.add(t);
  r.multiplyScalar(1 + off);
  const ri = posLoc;
  pos[ri] = r.x;
  pos[ri + 1] = r.y;
  pos[ri + 2] = r.z;
  posLoc += 3;
}
function makecolor(c: Color, n: number): void {
  for (let i = 0; i < n; i++) {
    color[colorLoc] = c.r;
    color[colorLoc + 1] = c.g;
    color[colorLoc + 2] = c.b;
    colorLoc += 3;
  }
}
function addface(
  verts: Vector3[],
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  y: number,
  m: number,
  color: Color,
  front: boolean,
) {
  if (front) {
    const u = 0.08;
    const off = 0.00002;
    makepoint(verts, a, b, c, d, x + u, y + u, m, off);
    makepoint(verts, a, b, c, d, x + 1 - u, y + u, m, off);
    makepoint(verts, a, b, c, d, x + 1 - u, y + 1 - u, m, off);
    makepoint(verts, a, b, c, d, x + u, y + u, m, off);
    makepoint(verts, a, b, c, d, x + 1 - u, y + 1 - u, m, off);
    makepoint(verts, a, b, c, d, x + u, y + 1 - u, m, off);
    makecolor(color, 6);
  } else {
    makepoint(verts, a, b, c, d, x, y, m, 0);
    makepoint(verts, a, b, c, d, x + 1, y, m, 0);
    makepoint(verts, a, b, c, d, x + 1, y + 1, m, 0);
    makepoint(verts, a, b, c, d, x, y, m, 0);
    makepoint(verts, a, b, c, d, x + 1, y + 1, m, 0);
    makepoint(verts, a, b, c, d, x, y + 1, m, 0);
    makecolor(color, 6);
  }
}
function addface2(
  verts: Vector3[],
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  y: number,
  m: number,
  black: Color,
  colors: Color[],
) {
  addface(
    verts,
    a,
    b,
    c,
    d,
    x,
    y,
    m,
    colors[Math.floor(6 * Math.random())],
    true,
  );
  addface(verts, a, b, c, d, x, y, m, black, false);
}
function getCube() {
  const geo = new BufferGeometry();
  const vertices = [];
  vertices.push(
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
      addface2(vertices, 0, 1, 3, 2, x, y, m, black, colors);
      addface2(vertices, 4, 6, 7, 5, x, y, m, black, colors);
      addface2(vertices, 0, 2, 6, 4, x, y, m, black, colors);
      addface2(vertices, 1, 5, 7, 3, x, y, m, black, colors);
      addface2(vertices, 0, 4, 5, 1, x, y, m, black, colors);
      addface2(vertices, 2, 3, 7, 6, x, y, m, black, colors);
    }
  }
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("color", new BufferAttribute(color, 3));
  return new Mesh(geo, new MeshBasicMaterial({ vertexColors: true }));
}

function initCube() {
  const nfloats = 4 * 3 * 3 * m * m * 6;
  pos = new Float32Array(nfloats);
  color = new Float32Array(nfloats);
  cube = getCube();
  if (pos.length !== nfloats || color.length !== nfloats) {
    console.log("Wrong lengths");
  }
  cube2 = cube.clone();
  const gr = new Group();
  gr.add(cube);
  gr.add(cube2);
  scene.add(gr);
}

const speed = 0.01;

function rotateCube() {
  cube.rotation.x -= speed;
  cube.rotation.y -= speed * 1.6181;
  cube.rotation.z -= speed * 2.6181;
  cube2.rotation.x -= speed * 1.31;
  cube2.rotation.y -= speed * 1.009391;
  cube2.rotation.z -= speed * 0.39391;
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
