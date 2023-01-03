/*

scramble_sq1.js

Square-1 Solver / Scramble Generator in JavaScript.

Code by by Shuang Chen.
Compiled to JavaScript using GWT.

*/

import { randomUIntBelow } from "random-uint-below";

function FullCube_copy(obj, c) {
  obj.ul = c.ul;
  obj.ur = c.ur;
  obj.dl = c.dl;
  obj.dr = c.dr;
  obj.ml = c.ml;
}

function FullCube_doMove(obj, move) {
  var temp;
  move <<= 2;
  if (move > 24) {
    move = 48 - move;
    temp = obj.ul;
    obj.ul = ((~~obj.ul >> move) | (obj.ur << (24 - move))) & 16777215;
    obj.ur = ((~~obj.ur >> move) | (temp << (24 - move))) & 16777215;
  } else if (move > 0) {
    temp = obj.ul;
    obj.ul = ((obj.ul << move) | (~~obj.ur >> (24 - move))) & 16777215;
    obj.ur = ((obj.ur << move) | (~~temp >> (24 - move))) & 16777215;
  } else if (move === 0) {
    temp = obj.ur;
    obj.ur = obj.dl;
    obj.dl = temp;
    obj.ml = 1 - obj.ml;
  } else if (move >= -24) {
    move = -move;
    temp = obj.dl;
    obj.dl = ((obj.dl << move) | (~~obj.dr >> (24 - move))) & 16777215;
    obj.dr = ((obj.dr << move) | (~~temp >> (24 - move))) & 16777215;
  } else if (move < -24) {
    move = 48 + move;
    temp = obj.dl;
    obj.dl = ((~~obj.dl >> move) | (obj.dr << (24 - move))) & 16777215;
    obj.dr = ((~~obj.dr >> move) | (temp << (24 - move))) & 16777215;
  }
}

function FullCube_getParity(obj) {
  var a;
  var b;
  var cnt;
  var i;
  var p;
  cnt = 0;
  obj.arr[0] = FullCube_pieceAt(obj, 0);
  for (i = 1; i < 24; ++i) {
    FullCube_pieceAt(obj, i) !== obj.arr[cnt] &&
      (obj.arr[++cnt] = FullCube_pieceAt(obj, i));
  }
  p = 0;
  for (a = 0; a < 16; ++a) {
    for (b = a + 1; b < 16; ++b) {
      obj.arr[a] > obj.arr[b] && (p ^= 1);
    }
  }
  return p;
}

function FullCube_getShapeIdx(obj) {
  var dlx;
  var drx;
  var ulx;
  var urx;
  urx = obj.ur & 1118481;
  urx |= ~~urx >> 3;
  urx |= ~~urx >> 6;
  urx = (urx & 15) | ((~~urx >> 12) & 48);
  ulx = obj.ul & 1118481;
  ulx |= ~~ulx >> 3;
  ulx |= ~~ulx >> 6;
  ulx = (ulx & 15) | ((~~ulx >> 12) & 48);
  drx = obj.dr & 1118481;
  drx |= ~~drx >> 3;
  drx |= ~~drx >> 6;
  drx = (drx & 15) | ((~~drx >> 12) & 48);
  dlx = obj.dl & 1118481;
  dlx |= ~~dlx >> 3;
  dlx |= ~~dlx >> 6;
  dlx = (dlx & 15) | ((~~dlx >> 12) & 48);
  return Shape_getShape2Idx(
    (FullCube_getParity(obj) << 24) |
      (ulx << 18) |
      (urx << 12) |
      (dlx << 6) |
      drx,
  );
}

function FullCube_getSquare(obj, sq) {
  var a;
  var b;
  for (a = 0; a < 8; ++a) {
    obj.prm[a] = ~~((~~FullCube_pieceAt(obj, a * 3 + 1) >> 1) << 24) >> 24;
  }
  sq.cornperm = get8Perm(obj.prm);
  sq.topEdgeFirst = FullCube_pieceAt(obj, 0) === FullCube_pieceAt(obj, 1);
  a = sq.topEdgeFirst ? 2 : 0;
  for (b = 0; b < 4; a += 3, ++b) {
    obj.prm[b] = ~~((~~FullCube_pieceAt(obj, a) >> 1) << 24) >> 24;
  }
  sq.botEdgeFirst = FullCube_pieceAt(obj, 12) === FullCube_pieceAt(obj, 13);
  a = sq.botEdgeFirst ? 14 : 12;
  for (; b < 8; a += 3, ++b) {
    obj.prm[b] = ~~((~~FullCube_pieceAt(obj, a) >> 1) << 24) >> 24;
  }
  sq.edgeperm = get8Perm(obj.prm);
  sq.ml = obj.ml;
}

function FullCube_pieceAt(obj, idx) {
  var ret;
  idx < 6
    ? (ret = ~~obj.ul >> ((5 - idx) << 2))
    : idx < 12
    ? (ret = ~~obj.ur >> ((11 - idx) << 2))
    : idx < 18
    ? (ret = ~~obj.dl >> ((17 - idx) << 2))
    : (ret = ~~obj.dr >> ((23 - idx) << 2));
  return ~~((ret & 15) << 24) >> 24;
}

function FullCube_setPiece(obj, idx, value) {
  if (idx < 6) {
    obj.ul &= ~(0xf << ((5 - idx) << 2));
    obj.ul |= value << ((5 - idx) << 2);
  } else if (idx < 12) {
    obj.ur &= ~(0xf << ((11 - idx) << 2));
    obj.ur |= value << ((11 - idx) << 2);
  } else if (idx < 18) {
    obj.dl &= ~(0xf << ((17 - idx) << 2));
    obj.dl |= value << ((17 - idx) << 2);
  } else {
    obj.dr &= ~(0xf << ((23 - idx) << 2));
    obj.dr |= value << ((23 - idx) << 2);
  }
}

function FullCube_FullCube__Ljava_lang_String_2V() {
  this.arr = [];
  this.prm = [];
}

function FullCube_randomCube() {
  var f;
  var i;
  var shape;
  var edge;
  var corner;
  var n_edge;
  var n_corner;
  var rnd;
  var m;
  f = new FullCube_FullCube__Ljava_lang_String_2V();
  shape = Shape_ShapeIdx[randomUIntBelow(3678)];
  corner = (0x01234567 << 1) | 0x11111111;
  edge = 0x01234567 << 1;
  n_corner = n_edge = 8;
  for (i = 0; i < 24; i++) {
    if (((shape >> i) & 1) === 0) {
      //edge
      rnd = randomUIntBelow(n_edge) << 2;
      FullCube_setPiece(f, 23 - i, (edge >> rnd) & 0xf);
      m = (1 << rnd) - 1;
      edge = (edge & m) + ((edge >> 4) & ~m);
      --n_edge;
    } else {
      //corner
      rnd = randomUIntBelow(n_corner) << 2;
      FullCube_setPiece(f, 23 - i, (corner >> rnd) & 0xf);
      FullCube_setPiece(f, 22 - i, (corner >> rnd) & 0xf);
      m = (1 << rnd) - 1;
      corner = (corner & m) + ((corner >> 4) & ~m);
      --n_corner;
      ++i;
    }
  }
  f.ml = randomUIntBelow(2);
  //	console.log(f);
  return f;
}

function FullCube() {}

let _ = (FullCube_FullCube__Ljava_lang_String_2V.prototype =
  FullCube.prototype);
_.dl = 10062778;
_.dr = 14536702;
_.ml = 0;
_.ul = 70195;
_.ur = 4544119;
function Search_init2(obj) {
  var corner;
  var edge;
  var i;
  var j;
  var ml;
  var prun;
  FullCube_copy(obj.Search_d, obj.Search_c);
  for (i = 0; i < obj.Search_length1; ++i) {
    FullCube_doMove(obj.Search_d, obj.Search_move[i]);
  }
  FullCube_getSquare(obj.Search_d, obj.Search_sq);
  edge = obj.Search_sq.edgeperm;
  corner = obj.Search_sq.cornperm;
  ml = obj.Search_sq.ml;
  prun = Math.max(
    SquarePrun[(obj.Search_sq.edgeperm << 1) | ml],
    SquarePrun[(obj.Search_sq.cornperm << 1) | ml],
  );
  for (i = prun; i < obj.Search_maxlen2; ++i) {
    if (
      Search_phase2(
        obj,
        edge,
        corner,
        obj.Search_sq.topEdgeFirst,
        obj.Search_sq.botEdgeFirst,
        ml,
        i,
        obj.Search_length1,
        0,
      )
    ) {
      for (j = 0; j < i; ++j) {
        FullCube_doMove(obj.Search_d, obj.Search_move[obj.Search_length1 + j]);
        //console.log(obj.Search_move[obj.Search_length1 + j]);
      }
      //console.log(obj.Search_d);
      //console.log(obj.Search_move);
      obj.Search_sol_string = Search_move2string(obj, i + obj.Search_length1);
      return true;
    }
  }
  return false;
}

function Search_move2string(obj, len) {
  var s = "";
  var top = 0;
  var bottom = 0;
  for (var i = len - 1; i >= 0; i--) {
    var val = obj.Search_move[i];
    //console.log(val);
    if (val > 0) {
      val = 12 - val;
      top = val > 6 ? val - 12 : val;
    } else if (val < 0) {
      val = 12 + val;
      bottom = val > 6 ? val - 12 : val;
    } else {
      if (top === 0 && bottom === 0) {
        s += " / ";
      } else {
        s += `(${top}, ${bottom}) / `;
      }
      top = bottom = 0;
    }
  }
  if (top !== 0 || bottom !== 0) {
    s += `(${top}, ${bottom})`;
  }
  return s; // + " (" + len + "t)";
}

function Search_phase1(obj, shape, prunvalue, maxl, depth, lm) {
  var m;
  var prunx;
  var shapex;
  if (prunvalue === 0 && maxl < 4) {
    return maxl === 0 && Search_init2(obj);
  }
  if (lm !== 0) {
    shapex = Shape_TwistMove[shape];
    prunx = ShapePrun[shapex];
    if (prunx < maxl) {
      obj.Search_move[depth] = 0;
      if (Search_phase1(obj, shapex, prunx, maxl - 1, depth + 1, 0)) {
        return true;
      }
    }
  }
  shapex = shape;
  if (lm <= 0) {
    m = 0;
    for (;;) {
      m += Shape_TopMove[shapex];
      shapex = ~~m >> 4;
      m &= 15;
      if (m >= 12) {
        break;
      }
      prunx = ShapePrun[shapex];
      if (prunx > maxl) {
        break;
      } else if (prunx < maxl) {
        obj.Search_move[depth] = m;
        if (Search_phase1(obj, shapex, prunx, maxl - 1, depth + 1, 1)) {
          return true;
        }
      }
    }
  }
  shapex = shape;
  if (lm <= 1) {
    m = 0;
    for (;;) {
      m += Shape_BottomMove[shapex];
      shapex = ~~m >> 4;
      m &= 15;
      if (m >= 6) {
        break;
      }
      prunx = ShapePrun[shapex];
      if (prunx > maxl) {
        break;
      } else if (prunx < maxl) {
        obj.Search_move[depth] = -m;
        if (Search_phase1(obj, shapex, prunx, maxl - 1, depth + 1, 2)) {
          return true;
        }
      }
    }
  }
  return false;
}

function Search_phase2(
  obj,
  edge,
  corner,
  topEdgeFirst,
  botEdgeFirst,
  ml,
  maxl,
  depth,
  lm,
) {
  var botEdgeFirstx;
  var cornerx;
  var edgex;
  var m;
  var prun1;
  var prun2;
  var topEdgeFirstx;
  if (maxl === 0 && !topEdgeFirst && botEdgeFirst) {
    return true;
  }
  if (lm !== 0 && topEdgeFirst === botEdgeFirst) {
    edgex = Square_TwistMove[edge];
    cornerx = Square_TwistMove[corner];
    if (
      SquarePrun[(edgex << 1) | (1 - ml)] < maxl &&
      SquarePrun[(cornerx << 1) | (1 - ml)] < maxl
    ) {
      obj.Search_move[depth] = 0;
      if (
        Search_phase2(
          obj,
          edgex,
          cornerx,
          topEdgeFirst,
          botEdgeFirst,
          1 - ml,
          maxl - 1,
          depth + 1,
          0,
        )
      ) {
        return true;
      }
    }
  }
  if (lm <= 0) {
    topEdgeFirstx = !topEdgeFirst;
    edgex = topEdgeFirstx ? Square_TopMove[edge] : edge;
    cornerx = topEdgeFirstx ? corner : Square_TopMove[corner];
    m = topEdgeFirstx ? 1 : 2;
    prun1 = SquarePrun[(edgex << 1) | ml];
    prun2 = SquarePrun[(cornerx << 1) | ml];
    while (m < 12 && prun1 <= maxl && prun1 <= maxl) {
      if (prun1 < maxl && prun2 < maxl) {
        obj.Search_move[depth] = m;
        if (
          Search_phase2(
            obj,
            edgex,
            cornerx,
            topEdgeFirstx,
            botEdgeFirst,
            ml,
            maxl - 1,
            depth + 1,
            1,
          )
        ) {
          return true;
        }
      }
      topEdgeFirstx = !topEdgeFirstx;
      if (topEdgeFirstx) {
        edgex = Square_TopMove[edgex];
        prun1 = SquarePrun[(edgex << 1) | ml];
        m += 1;
      } else {
        cornerx = Square_TopMove[cornerx];
        prun2 = SquarePrun[(cornerx << 1) | ml];
        m += 2;
      }
    }
  }
  if (lm <= 1) {
    botEdgeFirstx = !botEdgeFirst;
    edgex = botEdgeFirstx ? Square_BottomMove[edge] : edge;
    cornerx = botEdgeFirstx ? corner : Square_BottomMove[corner];
    m = botEdgeFirstx ? 1 : 2;
    prun1 = SquarePrun[(edgex << 1) | ml];
    prun2 = SquarePrun[(cornerx << 1) | ml];
    while (m < (maxl > 3 ? 6 : 12) && prun1 <= maxl && prun1 <= maxl) {
      if (prun1 < maxl && prun2 < maxl) {
        obj.Search_move[depth] = -m;
        if (
          Search_phase2(
            obj,
            edgex,
            cornerx,
            topEdgeFirst,
            botEdgeFirstx,
            ml,
            maxl - 1,
            depth + 1,
            2,
          )
        ) {
          return true;
        }
      }
      botEdgeFirstx = !botEdgeFirstx;
      if (botEdgeFirstx) {
        edgex = Square_BottomMove[edgex];
        prun1 = SquarePrun[(edgex << 1) | ml];
        m += 1;
      } else {
        cornerx = Square_BottomMove[cornerx];
        prun2 = SquarePrun[(cornerx << 1) | ml];
        m += 2;
      }
    }
  }
  return false;
}

function Search_solution(obj, c) {
  var shape;
  obj.Search_c = c;
  shape = FullCube_getShapeIdx(c);
  //console.log(shape);
  for (
    obj.Search_length1 = ShapePrun[shape];
    obj.Search_length1 < 100;
    ++obj.Search_length1
  ) {
    //console.log(obj.Search_length1);
    obj.Search_maxlen2 = Math.min(31 - obj.Search_length1, 17);
    if (
      Search_phase1(obj, shape, ShapePrun[shape], obj.Search_length1, 0, -1)
    ) {
      break;
    }
  }
  return obj.Search_sol_string;
}

function Search_Search() {
  this.Search_move = [];
  this.Search_d = new FullCube_FullCube__Ljava_lang_String_2V();
  this.Search_sq = new Square_Square();
}

function Search() {}

_ = Search_Search.prototype = Search.prototype;
_.Search_c = null;
_.Search_length1 = 0;
_.Search_maxlen2 = 0;
_.Search_sol_string = null;
let Shape_$clinit_ran = false;
function Shape_$clinit() {
  if (Shape_$clinit_ran) {
    return;
  }
  Shape_$clinit_ran = true;
  Shape_halflayer = [0, 3, 6, 12, 15, 24, 27, 30, 48, 51, 54, 60, 63];
  Shape_ShapeIdx = [];
  ShapePrun = [];
  Shape_TopMove = [];
  Shape_BottomMove = [];
  Shape_TwistMove = [];
  Shape_init();
}

function Shape_bottomMove(obj) {
  var move;
  var moveParity;
  move = 0;
  moveParity = 0;
  do {
    if ((obj.bottom & 2048) === 0) {
      move += 1;
      obj.bottom = obj.bottom << 1;
    } else {
      move += 2;
      obj.bottom = (obj.bottom << 2) ^ 12291;
    }
    moveParity = 1 - moveParity;
  } while ((bitCount(obj.bottom & 63) & 1) !== 0);
  (bitCount(obj.bottom) & 2) === 0 && (obj.Shape_parity ^= moveParity);
  return move;
}

function Shape_getIdx(obj) {
  var ret;
  ret =
    (binarySearch(Shape_ShapeIdx, (obj.top << 12) | obj.bottom) << 1) |
    obj.Shape_parity;
  return ret;
}

function Shape_setIdx(obj, idx) {
  obj.Shape_parity = idx & 1;
  obj.top = Shape_ShapeIdx[~~idx >> 1];
  obj.bottom = obj.top & 4095;
  obj.top >>= 12;
}

function Shape_topMove(obj) {
  var move;
  var moveParity;
  move = 0;
  moveParity = 0;
  do {
    if ((obj.top & 2048) === 0) {
      move += 1;
      obj.top = obj.top << 1;
    } else {
      move += 2;
      obj.top = (obj.top << 2) ^ 12291;
    }
    moveParity = 1 - moveParity;
  } while ((bitCount(obj.top & 63) & 1) !== 0);
  (bitCount(obj.top) & 2) === 0 && (obj.Shape_parity ^= moveParity);
  return move;
}

function Shape_Shape() {}

function Shape_getShape2Idx(shp) {
  var ret;
  ret = (binarySearch(Shape_ShapeIdx, shp & 16777215) << 1) | (~~shp >> 24);
  return ret;
}

function Shape_init() {
  var count;
  var depth;
  var dl;
  var done;
  var done0;
  var dr;
  var i;
  var idx;
  var m;
  var s;
  var ul;
  var ur;
  var value;
  var p1;
  var p3;
  var temp;
  count = 0;
  for (i = 0; i < 28561; ++i) {
    dr = Shape_halflayer[i % 13];
    dl = Shape_halflayer[~~(i / 13) % 13];
    ur = Shape_halflayer[~~(~~(i / 13) / 13) % 13];
    ul = Shape_halflayer[~~(~~(~~(i / 13) / 13) / 13)];
    value = (ul << 18) | (ur << 12) | (dl << 6) | dr;
    bitCount(value) === 16 && (Shape_ShapeIdx[count++] = value);
  }
  s = new Shape_Shape();
  for (i = 0; i < 7356; ++i) {
    Shape_setIdx(s, i);
    Shape_TopMove[i] = Shape_topMove(s);
    Shape_TopMove[i] |= Shape_getIdx(s) << 4;
    Shape_setIdx(s, i);
    Shape_BottomMove[i] = Shape_bottomMove(s);
    Shape_BottomMove[i] |= Shape_getIdx(s) << 4;
    Shape_setIdx(s, i);
    temp = s.top & 63;
    p1 = bitCount(temp);
    p3 = bitCount(s.bottom & 4032);
    s.Shape_parity ^= 1 & (~~(p1 & p3) >> 1);
    s.top = (s.top & 4032) | ((~~s.bottom >> 6) & 63);
    s.bottom = (s.bottom & 63) | (temp << 6);
    Shape_TwistMove[i] = Shape_getIdx(s);
  }
  for (i = 0; i < 7536; ++i) {
    ShapePrun[i] = -1;
  }
  ShapePrun[Shape_getShape2Idx(14378715)] = 0;
  ShapePrun[Shape_getShape2Idx(31157686)] = 0;
  ShapePrun[Shape_getShape2Idx(23967451)] = 0;
  ShapePrun[Shape_getShape2Idx(7191990)] = 0;
  done = 4;
  done0 = 0;
  depth = -1;
  while (done !== done0) {
    done0 = done;
    ++depth;
    for (i = 0; i < 7536; ++i) {
      if (ShapePrun[i] === depth) {
        m = 0;
        idx = i;
        do {
          idx = Shape_TopMove[idx];
          m += idx & 15;
          idx >>= 4;
          if (ShapePrun[idx] === -1) {
            ++done;
            ShapePrun[idx] = depth + 1;
          }
        } while (m !== 12);
        m = 0;
        idx = i;
        do {
          idx = Shape_BottomMove[idx];
          m += idx & 15;
          idx >>= 4;
          if (ShapePrun[idx] === -1) {
            ++done;
            ShapePrun[idx] = depth + 1;
          }
        } while (m !== 12);
        idx = Shape_TwistMove[i];
        if (ShapePrun[idx] === -1) {
          ++done;
          ShapePrun[idx] = depth + 1;
        }
      }
    }
  }
}

function Shape() {}

_ = Shape_Shape.prototype = Shape.prototype;
_.bottom = 0;
_.Shape_parity = 0;
_.top = 0;
var Shape_BottomMove;
var Shape_ShapeIdx;
var ShapePrun;
var Shape_TopMove;
var Shape_TwistMove;
var Shape_halflayer;
let Square_$clinit_ran = false;
function Square_$clinit() {
  if (Square_$clinit_ran) {
    return;
  }
  Square_$clinit_ran = true;
  SquarePrun = [];
  Square_TwistMove = [];
  Square_TopMove = [];
  Square_BottomMove = [];
  fact = [1, 1, 2, 6, 24, 120, 720, 5040];
  Cnk = [];
  for (var i = 0; i < 12; ++i) {
    Cnk[i] = [];
  }
  Square_init();
}

function Square_Square() {}

function get8Perm(arr) {
  var i;
  var idx;
  var v;
  var val;
  idx = 0;
  val = 1985229328;
  for (i = 0; i < 7; ++i) {
    v = arr[i] << 2;
    idx = (8 - i) * idx + ((~~val >> v) & 7);
    val -= 286331152 << v;
  }
  return idx & 65535;
}

function Square_init() {
  var check;
  var depth;
  var done;
  var find;
  var i;
  var idx;
  var idxx;
  var inv;
  var j;
  var m;
  var ml;
  var pos;
  var temp;
  for (i = 0; i < 12; ++i) {
    Cnk[i][0] = 1;
    Cnk[i][i] = 1;
    for (j = 1; j < i; ++j) {
      Cnk[i][j] = Cnk[i - 1][j - 1] + Cnk[i - 1][j];
    }
  }
  pos = [];
  for (i = 0; i < 40320; ++i) {
    set8Perm(pos, i);
    temp = pos[2];
    pos[2] = pos[4];
    pos[4] = temp;
    temp = pos[3];
    pos[3] = pos[5];
    pos[5] = temp;
    Square_TwistMove[i] = get8Perm(pos);
    set8Perm(pos, i);
    temp = pos[0];
    pos[0] = pos[1];
    pos[1] = pos[2];
    pos[2] = pos[3];
    pos[3] = temp;
    Square_TopMove[i] = get8Perm(pos);
    set8Perm(pos, i);
    temp = pos[4];
    pos[4] = pos[5];
    pos[5] = pos[6];
    pos[6] = pos[7];
    pos[7] = temp;
    Square_BottomMove[i] = get8Perm(pos);
  }
  for (i = 0; i < 80640; ++i) {
    SquarePrun[i] = -1;
  }
  SquarePrun[0] = 0;
  depth = 0;
  done = 1;
  while (done < 80640) {
    // console.log(done);
    inv = depth >= 11;
    find = inv ? -1 : depth;
    check = inv ? depth : -1;
    ++depth;
    OUT: for (i = 0; i < 80640; ++i) {
      if (SquarePrun[i] === find) {
        idx = ~~i >> 1;
        ml = i & 1;
        idxx = (Square_TwistMove[idx] << 1) | (1 - ml);
        if (SquarePrun[idxx] === check) {
          ++done;
          SquarePrun[inv ? i : idxx] = ~~(depth << 24) >> 24;
          if (inv) {
            continue OUT;
          }
        }
        idxx = idx;
        for (m = 0; m < 4; ++m) {
          idxx = Square_TopMove[idxx];
          if (SquarePrun[(idxx << 1) | ml] === check) {
            ++done;
            SquarePrun[inv ? i : (idxx << 1) | ml] = ~~(depth << 24) >> 24;
            if (inv) {
              continue OUT;
            }
          }
        }
        for (m = 0; m < 4; ++m) {
          idxx = Square_BottomMove[idxx];
          if (SquarePrun[(idxx << 1) | ml] === check) {
            ++done;
            SquarePrun[inv ? i : (idxx << 1) | ml] = ~~(depth << 24) >> 24;
            if (inv) {
              continue OUT;
            }
          }
        }
      }
    }
  }
}

function set8Perm(arr, idx) {
  var i;
  var m;
  var p;
  var v;
  var val;
  val = 1985229328;
  for (i = 0; i < 7; ++i) {
    p = fact[7 - i];
    v = ~~(idx / p);
    idx -= v * p;
    v <<= 2;
    arr[i] = ~~(((~~val >> v) & 7) << 24) >> 24;
    m = (1 << v) - 1;
    val = (val & m) + ((~~val >> 4) & ~m);
  }
  arr[7] = ~~(val << 24) >> 24;
}

function Square() {}

_ = Square_Square.prototype = Square.prototype;
_.botEdgeFirst = false;
_.cornperm = 0;
_.edgeperm = 0;
_.ml = 0;
_.topEdgeFirst = false;
var Square_BottomMove;
var Cnk;
var SquarePrun;
var Square_TopMove;
var Square_TwistMove;
var fact;

function bitCount(x) {
  x -= (~~x >> 1) & 1431655765;
  x = ((~~x >> 2) & 858993459) + (x & 858993459);
  x = ((~~x >> 4) + x) & 252645135;
  x += ~~x >> 8;
  x += ~~x >> 16;
  return x & 63;
}

function binarySearch(sortedArray, key) {
  var high;
  var low;
  var mid;
  var midVal;
  low = 0;
  high = sortedArray.length - 1;
  while (low <= high) {
    mid = low + (~~(high - low) >> 1);
    midVal = sortedArray[mid];
    if (midVal < key) {
      low = mid + 1;
    } else if (midVal > key) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  return -low - 1;
}

/*
 * Some helper functions.
 */

var square1Solver_initialized = false;

var square1SolverInitialize = function (doneCallback, _, statusCallback) {
  if (!square1Solver_initialized) {
    Shape_$clinit();
    Square_$clinit();
  }

  if (statusCallback) {
    statusCallback("Done initializing Square-1.");
  }

  square1Solver_initialized = true;
  if (doneCallback != null) {
    doneCallback();
  }
};

var square1SolverGetRandomPosition = function () {
  if (!square1Solver_initialized) {
    square1SolverInitialize();
  }
  return FullCube_randomCube();
};

var square1SolverGenerate = function (state) {
  var search_search = new Search_Search(); // Can this be factored out?
  return Search_solution(search_search, state);
};

var square1SolverGetRandomScramble = function () {
  var randomState = square1SolverGetRandomPosition();
  var scrambleString = square1SolverGenerate(randomState);

  return {
    state: randomState,
    scramble_string: scrambleString,
  };
};

export function getRandomSquare1ScrambleString() {
  return square1SolverGetRandomScramble().scramble_string;
}
