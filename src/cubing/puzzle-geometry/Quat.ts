/* tslint:disable no-bitwise */
/* tslint:disable prefer-for-of */ // TODO

// We need a quaternion class.  We use this to represent rotations,
// planes, and points.

const eps = 1e-9; // TODO: Deduplicate with `PuzzleGeometry`?

export function centermassface(face: Quat[]): Quat {
  // calculate a center of a face by averaging points
  let s = new Quat(0, 0, 0, 0);
  for (let i = 0; i < face.length; i++) {
    s = s.sum(face[i]);
  }
  return s.smul(1.0 / face.length);
}

export function solvethreeplanes(
  p1: number,
  p2: number,
  p3: number,
  planes: Quat[],
): any {
  // find intersection of three planes but only if interior
  // Takes three indices into a plane array, and returns the point at the
  // intersection of all three, but only if it is internal to all planes.
  const p = planes[p1].intersect3(planes[p2], planes[p3]);
  if (!p) {
    return p;
  }
  for (let i = 0; i < planes.length; i++) {
    if (i !== p1 && i !== p2 && i !== p3) {
      const dt = planes[i].b * p.b + planes[i].c * p.c + planes[i].d * p.d;
      if (
        (planes[i].a > 0 && dt > planes[i].a) ||
        (planes[i].a < 0 && dt < planes[i].a)
      ) {
        return false;
      }
    }
  }
  return p;
}

export class Quat {
  constructor(
    public a: number,
    public b: number,
    public c: number,
    public d: number,
  ) {}

  public mul(q: Quat): Quat {
    // Quaternion multiplication
    return new Quat(
      this.a * q.a - this.b * q.b - this.c * q.c - this.d * q.d,
      this.a * q.b + this.b * q.a + this.c * q.d - this.d * q.c,
      this.a * q.c - this.b * q.d + this.c * q.a + this.d * q.b,
      this.a * q.d + this.b * q.c - this.c * q.b + this.d * q.a,
    );
  }

  public toString(): string {
    return `Q[${this.a},${this.b},${this.c},${this.d}]`;
  }

  public dist(q: Quat): number {
    // Euclidean distance
    return Math.hypot(this.a - q.a, this.b - q.b, this.c - q.c, this.d - q.d);
  }

  public len(): number {
    // Euclidean length
    return Math.hypot(this.a, this.b, this.c, this.d);
  }

  public cross(q: Quat): Quat {
    // cross product
    return new Quat(
      0,
      this.c * q.d - this.d * q.c,
      this.d * q.b - this.b * q.d,
      this.b * q.c - this.c * q.b,
    );
  }

  public dot(q: Quat): number {
    // dot product of two quaternions
    return this.b * q.b + this.c * q.c + this.d * q.d;
  }

  public normalize(): Quat {
    // make the magnitude be 1
    const d = Math.sqrt(this.dot(this));
    return new Quat(this.a / d, this.b / d, this.c / d, this.d / d);
  }

  public makenormal(): Quat {
    // make a normal vector from a plane or quat or point
    return new Quat(0, this.b, this.c, this.d).normalize();
  }

  public normalizeplane(): Quat {
    // normalize a plane
    const d = Math.hypot(this.b, this.c, this.d);
    return new Quat(this.a / d, this.b / d, this.c / d, this.d / d);
  }

  public smul(m: number): Quat {
    // scalar multiplication
    return new Quat(this.a * m, this.b * m, this.c * m, this.d * m);
  }

  public sum(q: Quat): Quat {
    // quaternion sum
    return new Quat(this.a + q.a, this.b + q.b, this.c + q.c, this.d + q.d);
  }

  public sub(q: Quat): Quat {
    // difference
    return new Quat(this.a - q.a, this.b - q.b, this.c - q.c, this.d - q.d);
  }

  public angle(): number {
    // quaternion angle
    return 2 * Math.acos(this.a);
  }

  public invrot(): Quat {
    // quaternion inverse rotation
    return new Quat(this.a, -this.b, -this.c, -this.d);
  }

  public det3x3(
    a00: number,
    a01: number,
    a02: number,
    a10: number,
    a11: number,
    a12: number,
    a20: number,
    a21: number,
    a22: number,
  ): number {
    // 3x3 determinant
    return (
      a00 * (a11 * a22 - a12 * a21) +
      a01 * (a12 * a20 - a10 * a22) +
      a02 * (a10 * a21 - a11 * a20)
    );
  }

  public rotateplane(q: Quat): Quat {
    // rotate a plane using a quaternion
    const t = q.mul(new Quat(0, this.b, this.c, this.d)).mul(q.invrot());
    t.a = this.a;
    return t;
  }

  // return any vector orthogonal to the given one.  Find the smallest
  // component (in absolute value) and return the cross product of that
  // axis with the given vector.
  public orthogonal(): Quat {
    const ab = Math.abs(this.b);
    const ac = Math.abs(this.c);
    const ad = Math.abs(this.d);
    if (ab < ac && ab < ad) {
      return this.cross(new Quat(0, 1, 0, 0)).normalize();
    } else if (ac < ab && ac < ad) {
      return this.cross(new Quat(0, 0, 1, 0)).normalize();
    } else {
      return this.cross(new Quat(0, 0, 0, 1)).normalize();
    }
  }

  // return the Quaternion that will rotate the this vector
  // to the b vector through rotatepoint.
  public pointrotation(b: Quat): Quat {
    const a = this.normalize();
    b = b.normalize();
    if (a.sub(b).len() < eps) {
      return new Quat(1, 0, 0, 0);
    }
    let h = a.sum(b);
    if (h.len() < eps) {
      h = h.orthogonal();
    } else {
      h = h.normalize();
    }
    const r = a.cross(h);
    r.a = a.dot(h);
    return r;
  }

  // given two vectors, return the portion of the first that
  // is not in the direction of the second.
  public unproject(b: Quat): Quat {
    return this.sum(b.smul(-this.dot(b) / (this.len() * b.len())));
  }

  public rotatepoint(q: Quat): Quat {
    // rotate a point
    return q.mul(this).mul(q.invrot());
  }

  public rotateface(face: Quat[]): Quat[] {
    // rotate a face by this Q.
    return face.map((_: Quat) => _.rotatepoint(this));
  }

  public intersect3(p2: Quat, p3: Quat): Quat | false {
    // intersect three planes if there is one
    const det = this.det3x3(
      this.b,
      this.c,
      this.d,
      p2.b,
      p2.c,
      p2.d,
      p3.b,
      p3.c,
      p3.d,
    );
    if (Math.abs(det) < eps) {
      return false; // TODO: Change to `null` or `undefined`?
    }
    return new Quat(
      0,
      this.det3x3(this.a, this.c, this.d, p2.a, p2.c, p2.d, p3.a, p3.c, p3.d) /
        det,
      this.det3x3(this.b, this.a, this.d, p2.b, p2.a, p2.d, p3.b, p3.a, p3.d) /
        det,
      this.det3x3(this.b, this.c, this.a, p2.b, p2.c, p2.a, p3.b, p3.c, p3.a) /
        det,
    );
  }

  public side(x: number): number {
    // is this point close to the origin, or on one or the other side?
    if (x > eps) {
      return 1;
    }
    if (x < -eps) {
      return -1;
    }
    return 0;
  }

  /**
   * Cuts a face by this plane, or returns null if there
   * is no intersection.
   * @param face The face to cut.
   */
  public cutface(face: Quat[]): Quat[][] | null {
    const d = this.a;
    let seen = 0;
    let r = null;
    for (let i = 0; i < face.length; i++) {
      seen |= 1 << (this.side(face[i].dot(this) - d) + 1);
    }
    if ((seen & 5) === 5) {
      r = [];
      // saw both sides
      const inout = face.map((_: Quat) => this.side(_.dot(this) - d));
      for (let s = -1; s <= 1; s += 2) {
        const nface = [];
        for (let k = 0; k < face.length; k++) {
          if (inout[k] === s || inout[k] === 0) {
            nface.push(face[k]);
          }
          const kk = (k + 1) % face.length;
          if (inout[k] + inout[kk] === 0 && inout[k] !== 0) {
            const vk = face[k].dot(this) - d;
            const vkk = face[kk].dot(this) - d;
            const r = vk / (vk - vkk);
            const pt = face[k].smul(1 - r).sum(face[kk].smul(r));
            nface.push(pt);
          }
        }
        r.push(nface);
      }
    }
    return r;
  }

  public cutfaces(faces: Quat[][]): Quat[][] {
    // Cut a set of faces by a plane and return new set
    const nfaces = [];
    for (let j = 0; j < faces.length; j++) {
      const face = faces[j];
      const t = this.cutface(face);
      if (t) {
        nfaces.push(t[0]);
        nfaces.push(t[1]);
      } else {
        nfaces.push(face);
      }
    }
    return nfaces;
  }

  public faceside(face: Quat[]): number {
    // which side of a plane is a face on?
    const d = this.a;
    for (let i = 0; i < face.length; i++) {
      const s = this.side(face[i].dot(this) - d);
      if (s !== 0) {
        return s;
      }
    }
    throw new Error("Could not determine side of plane in faceside");
  }

  public sameplane(p: Quat): boolean {
    // are two planes the same?
    const a = this.normalize();
    const b = p.normalize();
    return a.dist(b) < eps || a.dist(b.smul(-1)) < eps;
  }

  public makecut(r: number): Quat {
    // make a cut from a normal vector
    return new Quat(r, this.b, this.c, this.d);
  }
}
