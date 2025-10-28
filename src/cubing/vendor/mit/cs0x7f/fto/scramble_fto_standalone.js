// @ts-nocheck

// From https://gist.github.com/cs0x7f/1579492aa43c794d529057386c489702

"use strict";

import { randomUIntBelow } from "random-uint-below";
import { Alg } from "../../../../../cubing/alg";

/*
MIT Licence

Copyright (c) 2024 Chen Shuang

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*

*/
var DEBUG = false;

var mathlib = (function() {
	var fact = [1];
	for (var i = 0; i < 32; ++i) {
		fact[i + 1] = fact[i] * (i + 1);
	}

	function circle(arr) {
		var length = arguments.length - 1,
			temp = arr[arguments[length]];
		for (var i = length; i > 1; i--) {
			arr[arguments[i]] = arr[arguments[i - 1]];
		}
		arr[arguments[1]] = temp;
		return circle;
	}

	function getPruning(table, index) {
		return table[index >> 3] >> ((index & 7) << 2) & 15;
	}

	function setNPerm(arr, idx, n, even) {
		var prt = 0;
		if (even < 0) {
			idx <<= 1;
		}
		if (n >= 16) {
			arr[n - 1] = 0;
			for (var i = n - 2; i >= 0; i--) {
				arr[i] = idx % (n - i);
				prt ^= arr[i];
				idx = ~~(idx / (n - i));
				for (var j = i + 1; j < n; j--) {
					arr[j] >= arr[i] && arr[j]++;
				}
			}
			if (even < 0 && (prt & 1) != 0) {
				var tmp = arr[n - 1];
				arr[n - 1] = arr[n - 2];
				arr[n - 2] = tmp;
			}
			return arr;
		}
		var vall = 0x76543210;
		var valh = 0xfedcba98;
		for (var i = 0; i < n - 1; i++) {
			var p = fact[n - 1 - i];
			var v = idx / p;
			idx = idx % p;
			prt ^= v;
			v <<= 2;
			if (v >= 32) {
				v = v - 32;
				arr[i] = valh >> v & 0xf;
				var m = (1 << v) - 1;
				valh = (valh & m) + ((valh >> 4) & ~m);
			} else {
				arr[i] = vall >> v & 0xf;
				var m = (1 << v) - 1;
				vall = (vall & m) + ((vall >>> 4) & ~m) + (valh << 28);
				valh = valh >> 4;
			}
		}
		if (even < 0 && (prt & 1) != 0) {
			arr[n - 1] = arr[n - 2];
			arr[n - 2] = vall & 0xf;
		} else {
			arr[n - 1] = vall & 0xf;
		}
		return arr;
	}

	function getNPerm(arr, n, even) {
		n = n || arr.length;
		var idx = 0;
		if (n >= 16) {
			for (var i = 0; i < n - 1; i++) {
				idx *= n - i;
				for (var j = i + 1; j < n; j++) {
					arr[j] < arr[i] && idx++;
				}
			}
			return even < 0 ? (idx >> 1) : idx;
		}
		var vall = 0x76543210;
		var valh = 0xfedcba98;
		for (var i = 0; i < n - 1; i++) {
			var v = arr[i] << 2;
			idx *= n - i;
			if (v >= 32) {
				idx += (valh >> (v - 32)) & 0xf;
				valh -= 0x11111110 << (v - 32);
			} else {
				idx += (vall >> v) & 0xf;
				valh -= 0x11111111;
				vall -= 0x11111110 << v;
			}
		}
		return even < 0 ? (idx >> 1) : idx;
	}

	function getNParity(idx, n) {
		var i, p;
		p = 0;
		for (i = n - 2; i >= 0; --i) {
			p ^= idx % (n - i);
			idx = ~~(idx / (n - i));
		}
		return p & 1;
	}

	function getNOri(arr, n, evenbase) {
		var base = Math.abs(evenbase);
		var idx = evenbase < 0 ? 0 : arr[0] % base;
		for (var i = n - 1; i > 0; i--) {
			idx = idx * base + arr[i] % base;
		}
		return idx;
	}

	function setNOri(arr, idx, n, evenbase) {
		var base = Math.abs(evenbase);
		var parity = base * n;
		for (var i = 1; i < n; i++) {
			arr[i] = idx % base;
			parity -= arr[i];
			idx = ~~(idx / base);
		}
		arr[0] = (evenbase < 0 ? parity : idx) % base;
		return arr;
	}

	function bitCount(x) {
		x -= (x >> 1) & 0x55555555;
		x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
		return ((x + (x >> 4) & 0xf0f0f0f) * 0x1010101) >> 24;
	}

	function getMPerm(arr, n, cnts, cums) {
		var seen = ~0;
		var idx = 0;
		var x = 1;
		for (var i = 0; i < n; i++) {
			var pi = arr[i];
			idx = idx * (n - i) + bitCount(seen & ((1 << cums[pi]) - 1)) * x;
			x = x * cnts[pi]--;
			seen &= ~(1 << (cums[pi] + cnts[pi]));
		}
		return Math.round(idx / x);
	}

	function setMPerm(arr, idx, n, cnts, x) {
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < cnts.length; j++) {
				if (cnts[j] == 0) {
					continue;
				}
				var x2 = ~~(x * cnts[j] / (n - i));
				if (idx < x2) {
					cnts[j]--;
					arr[i] = j;
					x = x2;
					break;
				}
				idx -= x2;
			}
		}
		return arr;
	}

	// type: 'p' (permutation), 'o' (orientation), 'c' (combination)
	// evenbase: base for ori, sign for even parity, cnts for combination
	function Coord(type, length, evenbase) {
		this.length = length;
		this.evenbase = evenbase;
		if (type == 'p') {
			this.get = function(arr) {
				return getNPerm(arr, this.length, this.evenbase);
			};
			this.set = function(arr, idx) {
				return setNPerm(arr, idx, this.length, this.evenbase);
			};
		} else if (type == 'o') {
			this.get = function(arr) {
				return getNOri(arr, this.length, this.evenbase);
			};
			this.set = function(arr, idx) {
				return setNOri(arr, idx, this.length, this.evenbase);
			};
		} else if (type == 'c') {
			var cnts = evenbase;
			this.cnts = cnts.slice();
			this.cntn = this.cnts.length;
			this.cums = [0];
			for (var i = 1; i <= this.cntn; i++) {
				this.cums[i] = this.cums[i - 1] + cnts[i - 1];
			}
			this.n = this.cums[this.cntn];
			var n = this.n;
			var x = 1;
			for (var i = 0; i < this.cntn; i++) {
				for (var j = 1; j <= cnts[i]; j++, n--) {
					x *= n / j;
				}
			}
			this.x = Math.round(x);
			this.get = function(arr) {
				return getMPerm(arr, this.n, this.cnts.slice(), this.cums);
			};
			this.set = function(arr, idx) {
				return setMPerm(arr, idx, this.n, this.cnts.slice(), this.x);
			};
		} else { // invalid type
			debugger;
		}
	}

	function fillFacelet(facelets, f, perm, ori, divcol) {
		for (var i = 0; i < facelets.length; i++) {
			var cubie = facelets[i];
			var p = perm[i] === undefined ? i : perm[i];
			if (typeof(cubie) == 'number') {
				f[cubie] = ~~(facelets[p] / divcol);
				continue;
			}
			var o = ori[i] || 0;
			for (var j = 0; j < cubie.length; j++) {
				f[cubie[(j + o) % cubie.length]] = ~~(facelets[p][j] / divcol);
			}
		}
	}

	function detectFacelet(facelets, f, perm, ori, divcol) {
		for (var i = 0; i < facelets.length; i++) {
			var n_ori = facelets[i].length;
			outer_loop: for (var j = 0; j < facelets.length + 1; j++) {
				if (j == facelets.length) { // not matched
					return -1;
				} else if (facelets[j].length != n_ori) {
					continue;
				}
				for (var o = 0; o < n_ori; o++) {
					var isMatch = true;
					for (var t = 0; t < n_ori; t++) {
						if (~~(facelets[j][t] / divcol) != f[facelets[i][(t + o) % n_ori]]) {
							isMatch = false;
							break;
						}
					}
					if (isMatch) {
						perm[i] = j;
						ori[i] = o;
						break outer_loop;
					}
				}
			}
		}
		return 0;
	}

	function createMoveHash(initState, validMoves, hashFunc, moveFunc) {
		var states = [initState];
		var hash2idx = {};
		var depthEnds = [];
		hash2idx[hashFunc(initState)] = 0;
		depthEnds[0] = 1;
		var moveTable = [];
		for (var m = 0; m < validMoves.length; m++) {
			moveTable[m] = [];
		}
		var tt = +new Date;
		for (var i = 0; i < states.length; i++) {
			if (i == depthEnds[depthEnds.length - 1]) {
				depthEnds.push(states.length);
			}
			if (i % 10000 == 9999) {
				DEBUG && console.log(i, 'states scanned, tt=', +new Date - tt);
			}
			var curState = states[i];
			for (var m = 0; m < validMoves.length; m++) {
				var newState = moveFunc(curState, validMoves[m]);
				if (!newState) {
					moveTable[m][i] = -1;
					continue;
				}
				var newHash = hashFunc(newState);
				if (!(newHash in hash2idx)) {
					hash2idx[newHash] = states.length;
					states.push(newState);
				}
				moveTable[m][i] = hash2idx[newHash];
			}
		}
		DEBUG && console.log('[move hash] ' + states.length + ' states generated, tt=', +new Date - tt, JSON.stringify(depthEnds));
		return [moveTable, hash2idx];
	}

	function createPrun(prun, init, size, maxd, doMove, N_MOVES, N_POWER, N_INV) {
		var isMoveTable = Array.isArray(doMove);
		N_MOVES = N_MOVES || 6;
		N_POWER = N_POWER || 3;
		N_INV = N_INV || 256;
		maxd = maxd || 256;
		for (var i = 0, len = (size + 7) >>> 3; i < len; i++) {
			prun[i] = -1;
		}
		if (!Array.isArray(init)) {
			init = [init];
		}
		for (var i = 0; i < init.length; i++) {
			prun[init[i] >> 3] ^= 15 << ((init[i] & 7) << 2);
		}
		var val = 0;
		// var t = +new Date;
		for (var l = 0; l <= maxd; l++) {
			var done = 0;
			var inv = l >= N_INV;
			var fill = (l + 1) ^ 15;
			var find = inv ? 0xf : l;
			var check = inv ? l : 0xf;

			outer_loop: for (var p = 0; p < size; p++, val >>= 4) {
				if ((p & 7) == 0) {
					val = prun[p >> 3];
					if (!inv && val == -1) {
						p += 7;
						continue;
					}
				}
				if ((val & 0xf) != find) {
					continue;
				}
				for (var m = 0; m < N_MOVES; m++) {
					var q = p;
					for (var c = 0; c < N_POWER; c++) {
						q = isMoveTable ? doMove[m][q] : doMove(q, m);
						if (q < 0) {
							break;
						}
						if (getPruning(prun, q) != check) {
							continue;
						}
						++done;
						if (inv) {
							prun[p >> 3] ^= fill << ((p & 7) << 2);
							continue outer_loop;
						}
						prun[q >> 3] ^= fill << ((q & 7) << 2);
					}
				}
			}
			if (done == 0) {
				break;
			}
			DEBUG && console.log('[prun]', done);
		}
	}

	// ida search algorithm
	// isSolved(state) -> boolean, in case isSolved = null, getPrun(idx) == 0 is used
	// getPrun(state) -> int
	// doMove(state) -> newState
	// if ckmv[last_move] >> cur_move & 1, cur_move is skipped
	function Searcher(isSolved, getPrun, doMove, N_AXIS, N_POWER, ckmv) {
		this.isSolved = isSolved || function() { return true; };
		this.getPrun = getPrun;
		this.doMove = doMove;
		this.N_AXIS = N_AXIS;
		this.N_POWER = N_POWER;
		this.ckmv = ckmv || valuedArray(N_AXIS, function(i) { return 1 << i; } );
	}

	var _ = Searcher.prototype;

	_.solve = function(idx, minl, MAXL, callback) {
		var sols = this.solveMulti([idx], minl, MAXL, callback);
		return sols == null ? null : sols[0];
	};

	_.solveMulti = function(idxs, minl, MAXL, callback) {
		this.callback = callback || function() { return true; };
		var sol = [];
		outer_loop: for (var l = minl; l <= MAXL; l++) {
			for (var s = 0; s < idxs.length; s++) {
				this.sidx = s;
				if (this.idaSearch(idxs[s], l, -1, sol) == 0) {
					break outer_loop;
				}
			}
			this.sidx = -1;
		}
		return this.sidx == -1 ? null : [sol, this.sidx];
	};

	_.idaSearch = function(idx, maxl, lm, sol) {
		var prun = this.getPrun(idx);
		if (prun > maxl) {
			return prun > maxl + 1 ? 2 : 1;
		}
		if (maxl == 0) {
			return this.isSolved(idx) && this.callback(sol, this.sidx) ? 0 : 1;
		}
		if (prun == 0 && this.isSolved(idx) && maxl == 1) {
			return 1;
		}
		for (var axis = 0; axis < this.N_AXIS; axis++) {
			if (this.ckmv[lm] >> axis & 1) {
				continue;
			}
			var idx1 = Array.isArray(idx) ? idx.slice() : idx;
			for (var pow = 0; pow < this.N_POWER; pow++) {
				idx1 = this.doMove(idx1, axis);
				if (idx1 == null) {
					break;
				}
				sol.push([axis, pow]);
				var ret = this.idaSearch(idx1, maxl - 1, axis, sol);
				if (ret == 0) {
					return 0;
				}
				sol.pop();
				if (ret == 2) {
					break;
				}
			}
		}
		return 1;
	};

	function rn(n) {
		return randomUIntBelow(n)
	}

	function rndPerm(n, isEven) {
		var p = 0;
		var arr = [];
		for (var i = 0; i < n; i++) {
			arr[i] = i;
		}
		for (var i = 0; i < n - 1; i++) {
			var k = rn(n - i);
			circle(arr, i, i + k);
			p ^= k != 0;
		}
		if (isEven && p) {
			circle(arr, 0, 1);
		}
		return arr;
	}

	function valuedArray(len, val) {
		var ret = [];
		var isFun = typeof val == 'function';
		for (var i = 0; i < len; i++) {
			ret[i] = isFun ? val(i) : val;
		}
		return ret;
	}

	function permOriMult(p1, p2, prod, o1, o2, ori, oriMod) {
		for (var i = 0; i < p2.length; i++) {
			if (oriMod) {
				ori[i] = (o1[p2[i]] + o2[i]) % oriMod;
			}
			prod[i] = p1[p2[i]];
		}
	}

	return {
		bitCount: bitCount,
		getPruning: getPruning,
		setNOri: setNOri,
		getNOri: getNOri,
		getNPerm: getNPerm,
		getNParity: getNParity,
		Coord: Coord,
		createMoveHash: createMoveHash,
		createPrun: createPrun,
		fillFacelet: fillFacelet,
		detectFacelet: detectFacelet,
		rn: rn,
		valuedArray: valuedArray,
		Searcher: Searcher,
		rndPerm: rndPerm,
		permOriMult: permOriMult,
	};
})();

var ftosolver = (function() {
	//face-turning octahedron cube w/o identical pieces
	function FtoCubie(cp, co, ep, uf, rl) {
		this.cp = (cp && cp.slice()) || [0, 1, 2, 3, 4, 5];
		this.co = (co && co.slice()) || [0, 0, 0, 0, 0, 0];
		this.ep = (ep && ep.slice()) || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
		this.uf = (uf && uf.slice()) || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
		this.rl = (rl && rl.slice()) || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	}

	var U = 0, F = 9, r = 18, l = 27, D = 36, B = 45, R = 54, L = 63;

	var cornFacelets = [
		[U + 0, R + 0, F + 0, L + 0],
		[U + 4, B + 8, r + 4, R + 8],
		[U + 8, L + 4, l + 8, B + 4],
		[l + 0, D + 0, r + 0, B + 0],
		[F + 4, D + 8, l + 4, L + 8],
		[r + 8, D + 4, F + 8, R + 4]
	];

	var edgeFacelets = [
		[U + 1, R + 3], [U + 3, L + 1], [U + 6, B + 6],
		[l + 1, D + 3], [r + 3, D + 1], [F + 6, D + 6],
		[F + 3, R + 1], [F + 1, L + 3], [l + 6, L + 6],
		[l + 3, B + 1], [r + 1, B + 3], [r + 6, R + 6]
	];

	var ctufFacelets = [
		U + 2, U + 5, U + 7,
		F + 2, F + 5, F + 7,
		r + 2, r + 5, r + 7,
		l + 2, l + 5, l + 7
	];

	var ctrlFacelets = [
		D + 2, D + 5, D + 7,
		B + 2, B + 5, B + 7,
		L + 2, L + 5, L + 7,
		R + 2, R + 5, R + 7
	];

	FtoCubie.prototype.isEqual = function(fc) {
		for (var i = 0; i < 12; i++) {
			if (this.ep[i] != fc.ep[i] || this.uf[i] != fc.uf[i] || this.rl[i] != fc.rl[i]
					|| i < 6 && (this.cp[i] != fc.cp[i] || this.co[i] != fc.co[i])) {
				return false;
			}
		}
		return true;
	}

	FtoCubie.prototype.toFaceCube = function(todiv) {
		var f = [];
		todiv = todiv || 9;
		var co = [];
		for (var i = 0; i < 6; i++) {
			co[i] = this.co[i] * 2;
		}
		mathlib.fillFacelet(cornFacelets, f, this.cp, co, todiv);
		mathlib.fillFacelet(edgeFacelets, f, this.ep, [], todiv);
		mathlib.fillFacelet(ctufFacelets, f, this.uf, null, todiv);
		mathlib.fillFacelet(ctrlFacelets, f, this.rl, null, todiv);
		return f;
	}

	FtoCubie.prototype.fromFacelet = function(facelet) {
		var count = 0;
		var f = [];
		for (var i = 0; i < 72; ++i) {
			f[i] = facelet[i];
			count += Math.pow(16, f[i]);
		}
		if (count != 0x99999999) {
			return -1;
		}
		var co = [];
		if (mathlib.detectFacelet(cornFacelets, f, this.cp, co, 9) == -1
				|| mathlib.detectFacelet(edgeFacelets, f, this.ep, [], 9) == -1) {
			return -1;
		}
		var parity = 0;
		for (var i = 0; i < 6; i++) {
			this.co[i] = co[i] >> 1;
			parity ^= this.co[i];
		}
		if (parity != 0
				|| mathlib.getNParity(mathlib.getNPerm(this.cp, 6), 6) != 0
				|| mathlib.getNParity(mathlib.getNPerm(this.ep, 12), 12) != 0) {
			return -1;
		}
		var remainCnts = [3, 3, 3, 3];
		for (var i = 0; i < 12; i++) {
			var col = f[ctufFacelets[i]];
			if (!(remainCnts[col] > 0)) {
				return -1;
			}
			this.uf[i] = col * 3 + 3 - remainCnts[col];
			remainCnts[col]--;
		}
		remainCnts = [3, 3, 3, 3];
		for (var i = 0; i < 12; i++) {
			var col = [0, 1, 3, 2][f[ctrlFacelets[i]] - 4];
			if (!(remainCnts[col] > 0)) {
				return -1;
			}
			this.rl[i] = col * 3 + 3 - remainCnts[col];
			remainCnts[col]--;
		}
		if (mathlib.getNParity(mathlib.getNPerm(this.uf, 12), 12) != 0) {
			for (var i = 0; i < 12; i++) { // swap 0 and 1 to fix parity
				this.uf[i] ^= this.uf[i] < 2 ? 1 : 0;
			}
		}
		if (mathlib.getNParity(mathlib.getNPerm(this.rl, 12), 12) != 0) {
			for (var i = 0; i < 12; i++) { // swap 0 and 1 to fix parity
				this.rl[i] ^= this.rl[i] < 2 ? 1 : 0;
			}
		}
		return this;
	}

	FtoCubie.prototype.toString = function(todiv) {
		var f = this.toFaceCube(todiv);
		var ret = '' +
			'  U8 U7 U6 U5 U4      B8 B7 B6 B5 B4\n' +
			'L4   U3 U2 U1   R8  r4   B3 B2 B1   l8\n' +
			'L5 L1   U0   R3 R7  r5 r1   B0   l3 l7\n' +
			'L6 L2 L0  R0 R2 R6  r6 r2 r0  l0 l2 l6\n' +
			'L7 L3   F0   R1 R5  r7 r3   D0   l1 l5\n' +
			'L8   F1 F2 F3   R4  r8   D1 D2 D3   l4\n' +
			'  F4 F5 F6 F7 F8      D4 D5 D6 D7 D8';
		ret = ret.replace(/([UFrlDBRL])([0-8])/g, function(m, p1, p2) {
			var i = 'UFrlDBRL'.indexOf(p1) * 9 + (~~p2);
			return 'UFrlDBRL' [~~(f[i] / 9)] + (f[i] % 9);
		});
		return ret;
	}

	FtoCubie.FtoMult = function() {
		var prod = arguments[arguments.length - 1] || new FtoCubie();
		for (var k = 0; k < arguments.length; k++) {
			var a = arguments[arguments.length - 1 - k];
			for (var i = 0; i < 6; i++) {
				prod.co[i] = k == 0 ? 0 : (a.co[prod.cp[i]] ^ prod.co[i]);
				prod.cp[i] = k == 0 ? i : a.cp[prod.cp[i]];
			}
			for (var i = 0; i < 12; i++) {
				prod.ep[i] = k == 0 ? i : a.ep[prod.ep[i]];
				prod.uf[i] = k == 0 ? i : a.uf[prod.uf[i]];
				prod.rl[i] = k == 0 ? i : a.rl[prod.rl[i]];
			}
		}
		return prod;
	}

	function initMoveCube() {
		var rotU = new FtoCubie( //move[U]
			[1, 2, 0, 4, 5, 3], [0, 0, 0, 0, 0, 0], [2, 0, 1, 5, 3, 4, 10, 11, 6, 7, 8, 9],
			[1, 2, 0, 7, 8, 6, 10, 11, 9, 4, 5, 3], [2, 0, 1, 8, 6, 7, 11, 9, 10, 5, 3, 4]);
		var rotR = new FtoCubie( //move[R]
			[5, 0, 4, 2, 3, 1], [1, 1, 0, 1, 1, 0], [6, 5, 7, 9, 2, 10, 11, 4, 3, 8, 1, 0],
			[5, 3, 4, 8, 6, 7, 2, 0, 1, 11, 9, 10], [4, 5, 3, 7, 8, 6, 1, 2, 0, 10, 11, 9]);

		var rotUi = FtoCubie.FtoMult(rotU, rotU, null);
		var rotRi = FtoCubie.FtoMult(rotR, rotR, null);
		var rotL = FtoCubie.FtoMult(rotUi, rotR, rotU, null);
		var rotF = FtoCubie.FtoMult(rotR, rotU, rotRi, null);

		var moveCube = [];
		moveCube[0] = new FtoCubie( //moveU
			[1, 2, 0, 3, 4, 5], [0, 0, 0, 0, 0, 0], [2, 0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11],
			[1, 2, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11], [0, 1, 2, 3, 6, 7, 11, 9, 8, 5, 10, 4]);
		moveCube[2] = new FtoCubie( //moveF
			[4, 1, 2, 3, 5, 0], [1, 0, 0, 0, 1, 0], [0, 1, 2, 3, 4, 6, 7, 5, 8, 9, 10, 11],
			[0, 1, 2, 4, 5, 3, 6, 7, 8, 9, 10, 11], [0, 9, 10, 3, 4, 5, 2, 7, 1, 8, 6, 11]);
		moveCube[4] = new FtoCubie( //mover
			[0, 5, 2, 1, 4, 3], [0, 1, 0, 0, 0, 1], [0, 1, 2, 3, 10, 5, 6, 7, 8, 9, 11, 4],
			[0, 1, 2, 3, 4, 5, 7, 8, 6, 9, 10, 11], [5, 3, 2, 11, 4, 10, 6, 7, 8, 9, 0, 1]);
		moveCube[6] = new FtoCubie( //movel
			[0, 1, 3, 4, 2, 5], [0, 0, 1, 1, 0, 0], [0, 1, 2, 8, 4, 5, 6, 7, 9, 3, 10, 11],
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 9], [8, 1, 7, 2, 0, 5, 6, 3, 4, 9, 10, 11]);
		moveCube[8] = new FtoCubie( //moveD
			[0, 1, 2, 5, 3, 4], [0, 0, 0, 0, 0, 0], [0, 1, 2, 4, 5, 3, 6, 7, 8, 9, 10, 11],
			[0, 1, 2, 3, 9, 10, 5, 7, 4, 8, 6, 11], [1, 2, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
		moveCube[10] = new FtoCubie( //moveB
			[0, 3, 1, 2, 4, 5], [0, 1, 1, 0, 0, 0], [0, 1, 10, 3, 4, 5, 6, 7, 8, 2, 9, 11],
			[0, 6, 7, 3, 4, 5, 11, 9, 8, 2, 10, 1], [0, 1, 2, 4, 5, 3, 6, 7, 8, 9, 10, 11]);
		moveCube[12] = new FtoCubie( //moveR
			[5, 0, 2, 3, 4, 1], [1, 1, 0, 0, 0, 0], [6, 1, 2, 3, 4, 5, 11, 7, 8, 9, 10, 0],
			[5, 3, 2, 8, 4, 7, 6, 0, 1, 9, 10, 11], [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 9]);
		moveCube[14] = new FtoCubie( //moveL
			[2, 1, 4, 3, 0, 5], [1, 0, 1, 0, 0, 0], [0, 8, 2, 3, 4, 5, 6, 1, 7, 9, 10, 11],
			[11, 1, 10, 2, 0, 5, 6, 7, 8, 9, 3, 4], [0, 1, 2, 3, 4, 5, 7, 8, 6, 9, 10, 11]);
		moveCube[16] = FtoCubie.FtoMult(rotU, moveCube[8], null); // moveUw = [U] * D
		moveCube[18] = FtoCubie.FtoMult(rotF, moveCube[10], null); // moveFw = [F] * B
		moveCube[20] = FtoCubie.FtoMult(rotR, moveCube[6], null); // moveRw = [R] * l
		moveCube[22] = FtoCubie.FtoMult(rotL, moveCube[4], null); // moveLw = [L] * r

		for (var i = 1; i < 24; i += 2) {
			moveCube[i] = new FtoCubie();
			FtoCubie.FtoMult(moveCube[i - 1], moveCube[i - 1], moveCube[i]);
		}

		var moveHash = [];
		for (var i = 0; i < 24; i ++) {
			moveHash[i] = moveCube[i].ep.join(',');
		}
		//init sym
		var symCube = [];
		var symMult = [];
		var symMulI = [];
		var symMulM = [];
		var symHash = [];
		var fc = new FtoCubie();
		var fc2 = new FtoCubie();
		var tmp;
		for (var s = 0; s < 12; s++) {
			symCube[s] = new FtoCubie(fc.cp, fc.co, fc.ep, fc.uf, fc.rl);
			symHash[s] = symCube[s].ep.join(',');
			symMult[s] = [];
			symMulI[s] = [];
			fc = FtoCubie.FtoMult(fc, rotU, null);
			if (s % 3 == 2) { // [F] or [R]
				fc = FtoCubie.FtoMult(fc, rotR, rotU, null);
			}
			if (s % 6 == 5) {
				fc = FtoCubie.FtoMult(fc, rotU, rotR, null);
			}
		}
		for (var i = 0; i < 12; i++) {
			for (var j = 0; j < 12; j++) {
				FtoCubie.FtoMult(symCube[i], symCube[j], fc);
				var k = symHash.indexOf(fc.ep.join(','));
				symMult[i][j] = k;
				symMulI[k][j] = i;
			}
		}
		for (var s = 0; s < 12; s++) {
			symMulM[s] = [];
			for (var j = 0; j < 8; j++) {
				FtoCubie.FtoMult(symCube[symMulI[0][s]], moveCube[j * 2], symCube[s], fc);
				var k = moveHash.indexOf(fc.ep.join(','));
				symMulM[s][j] = k >> 1;
			}
		}
		FtoCubie.moveCube = moveCube;
		FtoCubie.symCube = symCube;
		FtoCubie.symMult = symMult;
		FtoCubie.symMulI = symMulI;
		FtoCubie.symMulM = symMulM;
	};

	initMoveCube();

	function ftoPermMove(key, perm, move) {
		var ret = [];
		var movePerm = FtoCubie.moveCube[move][key];
		for (var i = 0; i < 12; i++) {
			ret[i] = perm[movePerm[i]];
		}
		return ret;
	}

	function ftoFullMove(fc, move) {
		return FtoCubie.FtoMult(fc, FtoCubie.moveCube[move], null);
	}

	function phase1EdgeHash(ep) {
		var ret = 0;
		var e3fst = -1;
		for (var i = 0; i < 12; i++) {
			if ((0x38 >> ep[i] & 1) == 0) {
				continue;
			}
			if (e3fst == -1) {
				e3fst = ep[i];
			}
			ret += ((ep[i] - e3fst + 3) % 3 + 1) << i * 2;
		}
		return ret;
	}

	function phase1CtrlHash(rl) {
		var ret = 0;
		for (var i = 0; i < 12; i++) {
			if (rl[i] < 3) {
				ret |= 1 << i;
			}
		}
		return ret;
	}

	function phase2EdgeHash(ep) {
		var edge2group = [0, 1, 2, 3, 3, 3, 0, 1, 1, 2, 2, 0];
		var groups = [[0, 6, 11], [1, 7, 8], [2, 9, 10], [3, 4, 5]];
		var ret = 0;
		var egoff = [-1, -1, -1, -1];
		for (var i = 0; i < 12; i++) {
			var g = edge2group[ep[i]];
			var gidx = groups[g].indexOf(ep[i]);
			if (egoff[g] == -1) {
				egoff[g] = gidx;
			}
			ret += (g * 4 + (gidx - egoff[g] + 3) % 3) * Math.pow(16, i);
		}
		return ret;
	}

	function phase2CtHash(ct) {
		var ret = 0;
		for (var i = 0; i < 12; i++) {
			ret |= ~~(ct[i] / 3) << (i * 2);
		}
		return ret;
	}

	function phase3EdgeHash(ep) {
		return String.fromCharCode.apply(null, ep);
	}

	function phase3CcufHash(fc) {
		return String.fromCharCode.apply(null, [].concat(fc.cp, fc.co));
	}

	function randomMoves(validMoves, len) {
		var scramble = [];
		for (var i = 0; i < len; i++) {
			scramble.push(validMoves[~~(Math.random() * validMoves.length)]);
		}
		var fc = new FtoCubie();
		for (var i = 0; i < scramble.length; i++) {
			fc = FtoCubie.FtoMult(fc, FtoCubie.moveCube[scramble[i]], null);
		}
		return [fc, scramble];
	}

	function genCkmv(moves) {
		var ckmv = [];
		var tmp1 = new FtoCubie();
		var tmp2 = new FtoCubie();
		for (var m1 = 0; m1 < moves.length; m1++) {
			ckmv[m1] = 1 << m1;
			for (var m2 = 0; m2 < m1; m2++) {
				FtoCubie.FtoMult(FtoCubie.moveCube[moves[m1]], FtoCubie.moveCube[moves[m2]], tmp1);
				FtoCubie.FtoMult(FtoCubie.moveCube[moves[m2]], FtoCubie.moveCube[moves[m1]], tmp2);
				if (tmp1.isEqual(tmp2)) {
					ckmv[m1] |= 1 << m2;
				}
			}
		}
		return ckmv;
	}

	var phase1Moves = [0, 2, 22, 6, 16, 10, 12, 14]; // keep the (D, DR) edge
	var p1epMoves = null;
	var p1rlMoves = null;
	var ckmv1 = null;
	var solv1 = null;

	var pyraSymCube = [];
	for (var i = 0; i < 12; i++) {
		pyraSymCube.push(new FtoCubie(
			FtoCubie.symCube[i].cp,
			FtoCubie.symCube[i].co,
			null,
			FtoCubie.symCube[i].uf,
			null
		));
	}

	function phase1Init() {
		var fc = new FtoCubie();
		p1epMoves = mathlib.createMoveHash(fc.ep.slice(), phase1Moves, phase1EdgeHash, ftoPermMove.bind(null, 'ep'));
		p1rlMoves = mathlib.createMoveHash(fc.rl.slice(), phase1Moves, phase1CtrlHash, ftoPermMove.bind(null, 'rl'));
		var N_P1EP = p1epMoves[0][0].length;
		var N_P1RL = p1rlMoves[0][0].length;
		DEBUG && console.log('p1ep len=' + N_P1EP + ' p1rl len=' + N_P1RL);

		ckmv1 = genCkmv(phase1Moves);
		var p1eprlPrun = [];
		mathlib.createPrun(p1eprlPrun, 0, N_P1EP * N_P1RL, 14, function(idx, move) {
			var rl = ~~(idx / N_P1EP);
			var ep = idx % N_P1EP;
			return p1rlMoves[0][move][rl] * N_P1EP + p1epMoves[0][move][ep];
		}, phase1Moves.length, 2);

		solv1 = new mathlib.Searcher(null, function(idx) {
			return mathlib.getPruning(p1eprlPrun, idx[1] * N_P1EP + idx[0]);
		}, function(idx, move) {
			return [
				p1epMoves[0][move][idx[0]],
				p1rlMoves[0][move][idx[1]]
			];
		}, 8, 2, ckmv1);
	}

	function phase1GenIdxs(fc) {
		var idxs = [];
		var syms = [];
		var fc2 = new FtoCubie();
		var fc3 = new FtoCubie();

		for (var sidx = 0; sidx < 12; sidx += 3) {
			FtoCubie.FtoMult(FtoCubie.symCube[sidx % 12], fc, fc2);
			var rot;
			for (rot = 0; rot < 12; rot++) {
				FtoCubie.FtoMult(fc2, FtoCubie.symCube[rot], fc3);
				if (fc3.ep[4] == 4) {
					break;
				}
			}
			var epidxs = [];
			var rlidxs = [];
			idxs.push([
				p1epMoves[1][phase1EdgeHash(fc3.ep)],
				p1rlMoves[1][phase1CtrlHash(fc3.rl)]
			]);
			syms.push([sidx, rot]);
		}
		return [idxs, syms];
	}

	function phase1ProcSol(sol, solsym, fc) {
		for (var i = 0; i < sol.length; i++) {
			sol[i] = phase1Moves[sol[i][0]] + sol[i][1];
		}
		var std = move2std(sol);
		for (var i = 0; i < std[0].length; i++) {
			var move = std[0][i];
			sol[i] = FtoCubie.symMulM[FtoCubie.symMulI[0][solsym[1]]][move >> 1] * 2 + (move & 1);
			fc = FtoCubie.FtoMult(fc, FtoCubie.moveCube[sol[i]], null);
		}
		solsym[1] = FtoCubie.symMulI[solsym[1]][std[1]];
		fc = FtoCubie.FtoMult(
			pyraSymCube[~~(solsym[0] / 12)], FtoCubie.symCube[solsym[0] % 12],
			fc, FtoCubie.symCube[solsym[1]], null
		);
		return [fc, sol, solsym[0], solsym[1]];
	}

	var N_PHASE1_SOLS = 1000;

	function solvePhase1(fc) {
		if (!solv1) {
			phase1Init();
		}

		var tt = performance.now();
		var idxs = phase1GenIdxs(fc);
		var syms = idxs[1];
		idxs = idxs[0];

		var p1sols = [];

		var sol1s = solv1.solveMulti(idxs, 0, 12, function(sol, sidx) {
			var param = phase1ProcSol(sol.slice(), syms[sidx].slice(), fc);
			p1sols.push(param);
			return p1sols.length >= N_PHASE1_SOLS;
		});

		tt = performance.now() - tt;
		for (var i = 0; i < p1sols.length; i++) {
			p1sols[i].push(tt);
		}
		return p1sols;
	}

	var phase2Moves = [0, 12, 14, 8, 10];
	var p2epMoves = null;
	var p2rlMoves = null;
	var p2ccMoves = null;
	var p2cc2ufBit = {};
	var ckmv2 = null;
	var solv2 = null;
	var P2EPRL_MAXL = 11;
	var p2symMap = [];
	var ufStd2Raw = [];
	var ufRaw2Std = [];
	var p2ufCoord = new mathlib.Coord('c', 12, [3, 3, 3, 3]);

	var cornExFacelets = [
		[U + 2, R + 2, F + 2, L + 2],
		[U + 5, B + 7, r + 5, R + 7],
		[U + 7, L + 5, l + 7, B + 5],
		[l + 2, D + 2, r + 2, B + 2],
		[F + 5, D + 7, l + 5, L + 7],
		[r + 7, D + 5, F + 7, R + 5]
	];

	function phase2CpcoHash(fc) {
		var ret = String.fromCharCode.apply(null, [].concat(fc.cp, fc.co));
		if (!(ret in p2cc2ufBit)) {
			var co = [];
			for (var i = 0; i < 6; i++) {
				co[i] = fc.co[i] * 2;
			}
			var facelet = fc.toFaceCube();
			mathlib.fillFacelet(cornExFacelets, facelet, fc.cp, co, 9);
			var fc2 = new FtoCubie().fromFacelet(facelet);
			p2cc2ufBit[ret] = phase2CtHash(fc2.uf);
		}
		return ret;
	}

	// re-color the cube s.t. uf is minimized in lexicographical order
	function phase2ufStd(uf, symMap) {
		var col1 = uf[0], col2 = -1;
		for (var i = 1; i < 12; i++) {
			if (uf[i] != col1) {
				col2 = uf[i];
				break;
			}
		}
		var sym = symMap[col1 * 4 + col2];
		for (var i = 0; i < 12; i++) {
			uf[i] = ~~(FtoCubie.symCube[sym].uf[uf[i] * 3] / 3);
		}
		return sym;
	}

	function getPhase2ufIdx(uf) {
		var ufstd = [];
		for (var i = 0; i < 12; i++) {
			ufstd[i] = ~~(uf[i] / 3);
		}
		var sym = phase2ufStd(ufstd, p2symMap);
		return ufRaw2Std[p2ufCoord.get(ufstd)] << 4 | sym;
	}

	function phase2Init() {
		var fc = new FtoCubie();
		p2epMoves = mathlib.createMoveHash(fc.ep.slice(), phase2Moves, phase2EdgeHash, ftoPermMove.bind(null, 'ep'));
		p2rlMoves = mathlib.createMoveHash(fc.rl.slice(), phase2Moves, phase2CtHash, ftoPermMove.bind(null, 'rl'));
		p2ccMoves = mathlib.createMoveHash(fc, phase2Moves, phase2CpcoHash, ftoFullMove);

		var arr = [];
		var arr2 = [];
		var p2ufMoveStd = [[], [], [], [], []];
		var ufStd2Bit = [];
		var p2ccRecol = [];
		for (var s = 0; s < 12; s++) {
			var uf = FtoCubie.symCube[s].uf;
			var col1 = ~~(uf.indexOf(0) / 3);
			var col2 = ~~(uf.indexOf(3) / 3);
			p2symMap[col1 * 4 + col2] = s;
			p2ccRecol[s] = [];
		}
		out: for (var i = 0; i < 42000; i++) {
			p2ufCoord.set(arr, i);
			for (var j = 1; j < 12; j++) {
				if (arr[j] > 1) {
					continue out;
				} else if (arr[j] == 1) {
					break;
				}
			}
			ufRaw2Std[i] = ufStd2Raw.length;
			ufStd2Raw.push(i);
		}
		for (var i = 0; i < ufStd2Raw.length; i++) {
			p2ufCoord.set(arr, ufStd2Raw[i]);
			var hash = 0;
			for (var j = 0; j < 12; j++) {
				hash |= arr[j] << (j * 2);
			}
			ufStd2Bit[i] = hash;
			for (var m = 0; m < phase2Moves.length; m++) {
				mathlib.permOriMult(arr, FtoCubie.moveCube[phase2Moves[m]].uf, arr2);
				var sym = phase2ufStd(arr2, p2symMap);
				p2ufMoveStd[m][i] = ufRaw2Std[p2ufCoord.get(arr2)] << 4 | sym;
			}
		}
		var cc2Bit = [];
		for (var key in p2ccMoves[1]) {
			var idx = p2ccMoves[1][key];
			cc2Bit[idx] = p2cc2ufBit[key];
			var cpco = [];
			for (var s = 0; s < 12; s++) {
				var sc = FtoCubie.symCube[s];
				for (var i = 0; i < 6; i++) {
					var scpi = key.charCodeAt(i);
					cpco[i] = sc.cp[scpi];
					cpco[i + 6] = sc.co[scpi] ^ key.charCodeAt(i + 6);
				}
				var hash = String.fromCharCode.apply(null, cpco);
				p2ccRecol[s][idx] = p2ccMoves[1][hash];
			}
		}
		var p2necPrun = [ // idx = a * 7 + b, a: #mismatch 3 U corners, b: other corners
			0, 0, 3, 4, 5, 6, 8,
			0, 2, 3, 4, 5, 6, 8,
			1, 2, 4, 4, 5, 6, 8,
			1, 3, 4, 5, 6, 7, 8,
			3, 3, 4, 5, 6, 7, 9,
			4, 4, 5, 6, 7, 8, 9,
			5, 5, 6, 7, 8, 9, 10
		];

		var N_P2EP = p2epMoves[0][0].length;
		var N_P2RL = p2rlMoves[0][0].length;
		var p2eprlPrun = [];
		mathlib.createPrun(p2eprlPrun, 0, N_P2EP * N_P2RL, P2EPRL_MAXL - 2, function(idx, move) {
			var rl = ~~(idx / N_P2EP);
			var ep = idx % N_P2EP;
			return p2rlMoves[0][move][rl] * N_P2EP + p2epMoves[0][move][ep];
		}, phase2Moves.length, 2);
		ckmv2 = genCkmv(phase2Moves);

		solv2 = new mathlib.Searcher(function(idx) {
			return ufStd2Bit[idx[3] >> 4] == cc2Bit[p2ccRecol[idx[3] & 0xf][idx[2]]];
		}, function(idx) {
			var xors = ufStd2Bit[idx[3] >> 4] ^ cc2Bit[p2ccRecol[idx[3] & 0xf][idx[2]]];
			xors = (xors | xors >> 1) & 0x555555;
			var necIdx = mathlib.bitCount(xors & 0xc0c0ff) * 7 + mathlib.bitCount(xors & 0x3f3f00);
			return Math.max(
				Math.min(P2EPRL_MAXL, mathlib.getPruning(p2eprlPrun, idx[1] * N_P2EP + idx[0])),
				p2necPrun[necIdx]
			);
		}, function(idx, move) {
			var ufidx1 = p2ufMoveStd[move][idx[3] >> 4];
			var ufcol = FtoCubie.symMult[ufidx1 & 0xf][idx[3] & 0xf];
			return [
				p2epMoves[0][move][idx[0]],
				p2rlMoves[0][move][idx[1]],
				p2ccMoves[0][move][idx[2]],
				ufidx1 & ~0xf | ufcol,
			];
		}, phase2Moves.length, 2, ckmv2);
	}

	function solvePhase2(solvInfos) {
		if (!solv2) {
			phase2Init();
		}
		var tt = performance.now();
		var idxs = [];
		for (var i = 0; i < solvInfos.length; i++) {
			idxs.push([
				p2epMoves[1][phase2EdgeHash(solvInfos[i][0].ep)],
				p2rlMoves[1][phase2CtHash(solvInfos[i][0].rl)],
				p2ccMoves[1][phase2CpcoHash(solvInfos[i][0])],
				getPhase2ufIdx(solvInfos[i][0].uf)
			]);
		}
		var sol2s = solv2.solveMulti(idxs, 0, 25);
		var sol = sol2s[0];
		var src = sol2s[1];
		var solvInfo = solvInfos[src];
		var fc = solvInfo[0];
		for (var i = 0; i < sol.length; i++) {
			var move = phase2Moves[sol[i][0]] + sol[i][1];
			sol[i] = FtoCubie.symMulM[FtoCubie.symMulI[0][solvInfo[3]]][move >> 1] * 2 + (move & 1);
			fc = FtoCubie.FtoMult(fc, FtoCubie.moveCube[move], null);
		}
		return [fc, sol, solvInfo[2], solvInfo[3], src, performance.now() - tt];
	}

	var phase3Moves = [8, 10, 12, 14];
	var p3epMoves = null;
	var p3ufMoves = null;
	var p3epPrun = null;
	var p3ufPrun = null;
	var ckmv3 = null;
	var solv3 = null;

	function phase3Init() {
		var fc = new FtoCubie();
		p3epMoves = mathlib.createMoveHash(fc.ep.slice(), phase3Moves, phase3EdgeHash, ftoPermMove.bind(null, 'ep'));
		p3ufMoves = mathlib.createMoveHash(new FtoCubie(), phase3Moves, phase3CcufHash, ftoFullMove);
		p3epPrun = [];
		p3ufPrun = [];
		mathlib.createPrun(p3epPrun, 0, 81, 14, p3epMoves[0], 4, 2);
		mathlib.createPrun(p3ufPrun, 0, 11520, 14, p3ufMoves[0], 4, 2);
		ckmv3 = genCkmv(phase3Moves);

		solv3 = new mathlib.Searcher(null, function(idx) {
			return Math.max(
				mathlib.getPruning(p3epPrun, idx[0]),
				mathlib.getPruning(p3ufPrun, idx[1])
			);
		}, function(idx, move) {
			return [p3epMoves[0][move][idx[0]], p3ufMoves[0][move][idx[1]]];
		}, 4, 2, ckmv3);
	}

	function solvePhase3(solvInfo) {
		var fc = solvInfo[0];
		if (!p3epPrun) {
			phase3Init();
		}

		var tt = performance.now();
		var p3epidx = p3epMoves[1][phase3EdgeHash(fc.ep)];
		var p3ufidx = p3ufMoves[1][phase3CcufHash(fc)];

		var sol = solv3.solve([p3epidx, p3ufidx], 0, 25);

		for (var i = 0; i < sol.length; i++) {
			var move = phase3Moves[sol[i][0]] + sol[i][1];
			sol[i] = FtoCubie.symMulM[FtoCubie.symMulI[0][solvInfo[3]]][move >> 1] * 2 + (move & 1);

			fc = FtoCubie.FtoMult(fc, FtoCubie.moveCube[move], null);
		}
		return [fc, sol, solvInfo[2], solvInfo[3], performance.now() - tt];
	}

	// convert wide moves to face moves
	function move2std(moves) {
		var sym = 0;
		var ret = [];
		// Uw = [U] * D, Fw = [F] * B, Rw = [R] * l, Lw = [L] * r
		var w2axis = [4, 5, 3, 2];
		var w2rot = [1, 10, 5, 11];
		for (var i = 0; i < moves.length; i++) {
			var rot = 0;
			var axis = moves[i] >> 1;
			var pow = moves[i] & 1;
			if (axis >= 8) {
				rot = w2rot[axis - 8];
				axis = w2axis[axis - 8];
			}
			if (!pow) {
				rot = FtoCubie.symMult[rot][rot];
			}
			ret.push(FtoCubie.symMulM[sym][axis] * 2 + pow);
			sym = FtoCubie.symMult[rot][sym];
		}
		return [ret, sym];
	}

	function applyMoves(fc, moves) {
		for (var i = 0; i < moves.length; i++) {
			fc = FtoCubie.FtoMult(fc, FtoCubie.moveCube[moves[i]], null);
		}
		return fc;
	}

	var move2str = ["U", "U'", "F", "F'", "r", "r'", "l", "l'", "D", "D'", "B", "B'", "R", "R'", "L", "L'"]

	function prettyMoves(moves) {
		var buf = [];
		for (var i = 0; i < moves.length; i++) {
			buf[i] = move2str[moves[i]];
		}
		return buf.join(' ').replace(/l/g, 'BL').replace(/r/g, 'BR');
	}

	function FtoSolver() {}

	FtoSolver.prototype.solveFto = function(fc, invSol) {
		if (!solv1) {
			var tt = performance.now();
			phase1Init();
			phase2Init();
			phase3Init();
			DEBUG && console.log('[ftosolver] init time:', performance.now() - tt);
		}
		var solvInfos = solvePhase1(fc);

		var solvInfo2 = solvePhase2(solvInfos);

		var solvInfo1 = solvInfos[solvInfo2[4]];
		this.sol1 = solvInfo1[1].slice();
		this.tt1 = solvInfo1[4];
		var sym1Idx = solvInfo1[2];

		this.sol2 = solvInfo2[1].slice();
		this.tt2 = solvInfo2[5];
		solvInfo2[0] = FtoCubie.FtoMult(pyraSymCube[FtoCubie.symMulI[0][~~(sym1Idx / 12)]], solvInfo2[0], null);

		var solvInfo3 = solvePhase3(solvInfo2);
		this.sol3 = solvInfo3[1].slice();
		this.tt3 = solvInfo3[4];

		var sol = [].concat(this.sol1, this.sol2, this.sol3);
		if (invSol) {
			for (var i = 0; i < sol.length; i++) {
				sol[i] ^= 1;
			}
			sol.reverse();
		}
		return prettyMoves(sol);
	}

	var solver = new FtoSolver();

	function solveTest(n_moves) {
		var solvInfo = randomMoves([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], n_moves);

		var scramble = prettyMoves(solvInfo[1].slice());
		var solution = solver.solveFto(solvInfo[0]);

		var fc = solvInfo[0];
		DEBUG && console.log('scrambled state\n', fc.toString(1));
		fc = applyMoves(fc, solver.sol1);
		DEBUG && console.log('after phase 1 (' + prettyMoves(solver.sol1) + '):\n', fc.toString(1));
		fc = applyMoves(fc, solver.sol2);
		DEBUG && console.log('after phase 2 (' + prettyMoves(solver.sol2) + '):\n', fc.toString(1));
		fc = applyMoves(fc, solver.sol3);
		DEBUG && console.log('after phase 3 (' + prettyMoves(solver.sol3) + '):\n', fc.toString(1));

		var facelets = fc.toFaceCube();
		var isSolved = true;
		outer_loop: for (var i = 0; i < 8; i++) {
			for (var j = 1; j < 9; j++) {
				if (facelets[i * 9 + j] != facelets[i * 9]) {
					isSolved = false;
					break outer_loop;
				}
			}
		}
		if (!isSolved) {
			console.log('error, FTO not solved!!!');
		}

		DEBUG && console.log(scramble, solution);
		return [
			solver.sol1.length + solver.sol2.length + solver.sol3.length,
			solver.sol1.length,
			solver.sol2.length,
			solver.sol3.length,
			solver.tt1,
			solver.tt2,
			solver.tt3
		];
	}

	function testbench(ntest) {
		ntest = ntest || 100;
		var cumlen = [];
		for (var nsolv = 0; nsolv < ntest; nsolv++) {
			var lengths = solveTest(200);
			for (var i = 0; i < lengths.length; i++) {
				cumlen[i] = (cumlen[i] || 0) + lengths[i];
			}
			console.log('AvgL: ', cumlen[0] / (nsolv + 1));
		}
		console.log('AvgL1:', cumlen[1] / ntest);
		console.log('AvgL2:', cumlen[2] / ntest);
		console.log('AvgL3:', cumlen[3] / ntest);
		console.log('AvgT1:', cumlen[4] / ntest);
		console.log('AvgT2:', cumlen[5] / ntest);
		console.log('AvgT3:', cumlen[6] / ntest);
	}

	function solveFacelet(facelet, invSol) {
		var fc = new FtoCubie();
		if (fc.fromFacelet(facelet) == -1) {
			return "FTO Solver ERROR!";
		}
		return solver.solveFto(fc, invSol);
	}

	return {
		solveFacelet: solveFacelet,
		FtoCubie: FtoCubie,
		testbench: testbench
	};
})();

var fto_scrambler = (function() {

	function getRandomScramble(solvedEdge, solvedCenter, solvedCorner) {
		var fc = new ftosolver.FtoCubie();
		if (!solvedEdge) {
			fc.ep = mathlib.rndPerm(12, true);
		}
		if (!solvedCenter) {
			fc.uf = mathlib.rndPerm(12, true);
			fc.rl = mathlib.rndPerm(12, true);
		}
		if (!solvedCorner) {
			fc.cp = mathlib.rndPerm(6, true);
			mathlib.setNOri(fc.co, mathlib.rn(32), 6, -2);
		}
		return new Alg(ftosolver.solveFacelet(fc.toFaceCube(), true));
	}

	function getLNTScramble(ufs) {
		var solved = false;
		var nCorn = ufs.length >> 1;
		var fc = new ftosolver.FtoCubie();
		var cp, co, uf;
		do {
			cp = mathlib.rndPerm(nCorn, true);
			co = mathlib.setNOri([], mathlib.rn(1 << nCorn >> 1), nCorn, -2);
			uf = mathlib.rndPerm(ufs.length, true);
			solved = true;
			for (var i = 0; i < ufs.length; i++) {
				solved = solved && (~~(ufs[uf[i]] / 3) == ~~(ufs[i] / 3));
			}
			for (var i = 0; i < nCorn; i++) {
				solved = solved && cp[i] == i && co[i] == 0;
			}
		} while (solved);
		for (var i = 0; i < nCorn; i++) {
			fc.cp[i] = cp[i];
			fc.co[i] = co[i];
		}
		for (var i = 0; i < ufs.length; i++) {
			fc.uf[ufs[i]] = ufs[uf[i]];
		}
		return ftosolver.solveFacelet(fc.toFaceCube(), true);
	}

	return {
		getRandomScramble: getRandomScramble.bind(null, false, false, false)
	};
})();

// TODO: solve an externally generated random state
export function getRandomFTOScramble() {
	return fto_scrambler.getRandomScramble();
};

// export function setRandomGen(gen) {
// 	mathlib.setRandomGen(gen);
// };

// export function fto_testbench() {
// 	ftosolver.testbench();
// };
