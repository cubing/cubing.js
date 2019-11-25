import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import { Vector2, Raycaster } from "three" ;
import { getAlgURLParam, experimentalAppendBlockMove } from "../../alg"
import { Twisty, Twisty3D, experimentalShowJumpingFlash } from "../../twisty"
import { PuzzleGeometry, SchreierSims } from "../../puzzle-geometry"
import { BlockMove, Sequence, algToString, parse as algparse } from "../../alg"
import { KPuzzle, KPuzzleDefinition, parse } from "../../kpuzzle"
import {connect, MoveEvent, debugKeyboardConnect} from "../../bluetooth"

experimentalShowJumpingFlash(false);

var twisty: Twisty;
var puzzle: KPuzzleDefinition;
let puzzleSelected = false;
var lastPuzzleName = "";
var safeKsolve: string = "";
var movenames: Array<string>;
var grips: Array<any>;
var descinput: HTMLInputElement;
var algoinput: HTMLInputElement;
var actions: HTMLSelectElement;
var moveInput: HTMLSelectElement;
var lastval: string = "";
var lastalgo: string = "";
var scramble: number = 0;
var stickerDat: any ;
var renderOptions = ["threed", "centers", "edges", "corners",
   "centers", "edges", "corners", "blockmoves", "vertexmoves"];
var workOptions = ["centers", "edges", "corners", "optimize", "blockmoves",
   "allmoves", "vertexmoves", "killori"];
var lastRender: any;
var gripdepth: any;
function getCheckbox(a: string): boolean {
   return (<HTMLInputElement>document.getElementById(a)).checked;
}
function getCheckboxes(a: Array<string>): any {
   var r: any = {};
   for (var i = 0; i < a.length; i++)
      r[a[i]] = getCheckbox(a[i]);
   return r;
}
function equalCheckboxes(a: Array<string>, b: any, c: any): boolean {
   for (var i = 0; i < a.length; i++)
      if (b[a[i]] != c[a[i]])
         return false;
   return true;
}
function focusRight() {
   return;
   algoinput.scrollLeft = algoinput.scrollWidth;
   algoinput.focus();
   algoinput.selectionStart = algoinput.selectionEnd = 100000000;
}
function domove(mv: string, mod: number) {
   try { // try to merge this move
      var oldalg = algparse((algoinput.value));
      var newmv = algparse((mv));
      if (oldalg instanceof Sequence && newmv instanceof Sequence &&
         newmv.nestedUnits.length == 1 && oldalg.nestedUnits.length > 0) {
         var lastmv = oldalg.nestedUnits[oldalg.nestedUnits.length - 1];
         var thismv = newmv.nestedUnits[0];
         if (lastmv instanceof BlockMove && thismv instanceof BlockMove &&
            lastmv.family == thismv.family &&
            lastmv.outerLayer == thismv.outerLayer &&
            lastmv.innerLayer == thismv.innerLayer) {
            var newAmount = thismv.amount + lastmv.amount;
            var newArr = oldalg.nestedUnits.slice();
            if (newAmount == 0 || (mod > 0 && newAmount % mod == 0)) {
               newArr.length -= 1;
            } else {
               // canonicalize the representation
               while (newAmount + newAmount > mod)
                  newAmount -= mod;
               while (newAmount + newAmount <= -mod)
                  newAmount += mod;
               newArr[oldalg.nestedUnits.length - 1] =
                  new BlockMove(lastmv.outerLayer, lastmv.innerLayer,
                     lastmv.family, newAmount);
            }
            algoinput.value = (algToString(new Sequence(newArr)));
            focusRight();
            checkchange();
            return;
         }
      }
   } catch (e) { }
   algoinput.value += ' ' + (mv);
   focusRight();
   checkchange();
}
function noticeClick(e: any) {
   var svg: any = document.getElementById("svg");
   if (!svg || !e)
      return false;
   e.stopPropagation();
   e.preventDefault();
   var pt = svg.createSVGPoint();
   pt.x = e.clientX;
   pt.y = e.clientY;
   pt = pt.matrixTransform(svg.getScreenCTM().inverse());
   var dist = 1000000;
   var gripind = undefined;
   for (var i = 0; i < grips.length; i++) {
      var d = Math.hypot(grips[i][0] - pt.x, grips[i][1] - pt.y);
      if (d < dist) {
         dist = d;
         gripind = i;
      }
   }
   if (gripind != undefined) {
      var gripname = grips[gripind][2];
      if (e.shiftKey) {
         if (getCheckbox("blockmoves"))
            gripname = gripname.toLowerCase();
         else
            gripname = "2" + gripname;
      } else if ((e.ctrlKey || e.metaKey) && gripdepth[gripname])
         gripname = "" + gripdepth[gripname] + gripname.toLowerCase();
      domove(gripname + (e.which == 3 ? "" : "'"), grips[gripind][3]);
   }
   return false;
}
function addClickMoves() {
   var svg = document.getElementById("svg");
   if (svg && !svg.onclick)
      svg.onclick = function (e) { return noticeClick(e) }
   if (svg && !svg.oncontextmenu)
      svg.oncontextmenu = function (e) { return noticeClick(e) }
}
function LucasSetup(pg:PuzzleGeometry, ksolve:string, stickerDat_:any,
                    savealgo:boolean) {
   safeKsolve = ksolve ; // this holds the scrambled position
   puzzle = parse(ksolve) ;
   var mps = pg.movesetgeos ;
   var worker = new KPuzzle(puzzle) ;
   worker.setFaceNames(pg.facenames.map((_:any)=>_[1])) ;
   gripdepth = {} ;
   for (var i=0; i<mps.length; i++) {
      var grip1 = mps[i][0] as string ;
      var grip2 = mps[i][2] as string ;
      // angle compatibility hack
      worker.addGrip(grip1, grip2, mps[i][4] as number);
      gripdepth[grip1] = mps[i][4];
      gripdepth[grip2] = mps[i][4];
   }
   algoinput.style.backgroundColor = '' ;
   stickerDat = stickerDat_ ;
   if (savealgo && !trimEq(lastalgo, "")) {
      setAlgo(lastalgo, true);
   } else
      setAlgo("", true);
   addClickMoves();
}
function trimEq(a: string, b: string) {
   return a.trim() == b.trim();
}
function setAlgo(str: string, writeback: boolean) {
   var seq: Sequence = algparse('') ;
   var elem = document.querySelector("#custom-example");
   if (elem) {
      // this part should never throw, and we should not need to do
      // it again.  But for now we always do.
      if (!twisty || puzzleSelected) {
         elem.textContent = "";
         twisty = new Twisty(elem, {
         puzzle: puzzle,
         alg: new Sequence([]),
         playerConfig: {
            visualizationFormat: "PG3D",
            experimentalPG3DStickerDat: stickerDat,
         },
         });
         puzzleSelected = false;
      }
      str = str.trim() ;
      algoinput.style.backgroundColor = '';
      // without the true, type U then erase it, the cube won't
      // go back to solved, so without the setAlg() the state isn't
      // consistently being updated.  TOFIX
      if (true || str.length != 0) {
         try {
            seq = algparse(str);
            str = algToString(seq);
            twisty.experimentalSetAlg(seq) ;
         } catch (e) {
            algoinput.style.backgroundColor = '#ff8080';
            console.log("Could not parse " + str) ;
         }
      }
      if (writeback) {
         algoinput.value = (str);
         lastalgo = str;
      }
   }
}
// this is so horrible.  there has to be a better way.
function showtext(s: string) {
   var wnd = window.open("", "_blank");
   if (wnd) {
      wnd.document.open("text/plain", "replace");
      wnd.document.write("<pre>");
      s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      wnd.document.write(s);
      wnd.document.write("</pre>");
      wnd.document.close();
   }
}
function gettextwriter(): (s: string) => void {
   var wnd = window.open("", "_blank");
   if (wnd) {
      wnd.document.open("text/plain", "replace");
      wnd.document.write("<pre>");
      return function (s: string): void {
         s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
         if (wnd && wnd.document)
            wnd.document.write(s + "\n");
      }
   }
   throw "Could not open window";
}
function dowork(cmd: string) {
   if (cmd == "scramble") {
      scramble = 1;
      checkchange();
      return;
   }
   if (cmd == "reset") {
      scramble = -1;
      checkchange();
      return;
   }
   if (cmd == "bluetooth" || cmd == "keyboard") {
      (async() => {
         const puzzle = await (cmd === "bluetooth" ? connect : debugKeyboardConnect)();
         puzzle.addMoveListener((e: MoveEvent) => {
            const currentAlg = algparse(algoinput.value);
            const newAlg = experimentalAppendBlockMove(currentAlg, e.latestMove, true);
            // TODO: Avoid round-trip through string?
            setAlgo(algToString(newAlg), true);
         })
      })();
      return;
   }
   if (cmd == "help") {
      window.open("Help.html", "Twizzle Help");
      return;
   }
   if (cmd == "options") {
      var el = document.getElementById('optionsspan');
      var el2 = document.getElementById('data');
      if (el && el2) {
         if (el.style.display != 'none') {
            el.style.display = 'none';
            el2.style.display = 'none';
         } else {
            el.style.display = 'inline';
            el2.style.display = 'inline';
         }
      }
      return;
   }
   var options: Array<number | string | boolean> = [];
   var checkboxes = getCheckboxes(workOptions);
   if (checkboxes.allmoves)
      options.push("allmoves", true);
   if (checkboxes.vertexmoves)
      options.push("vertexmoves", true);
   if (!checkboxes.corners)
      options.push("cornersets", false);
   if (!checkboxes.edges)
      options.push("edgesets", false);
   if (!checkboxes.centers)
      options.push("centersets", false);
   if (checkboxes.optimize)
      options.push("optimize", true);
   if (checkboxes.blockmoves)
      options.push("outerblockmoves", true);
   if (checkboxes.killori)
      options.push("killorientation", true);
   var p = PuzzleGeometry.parsedesc(descinput.value);
   var pg = new PuzzleGeometry(p[0], p[1], options);
   pg.allstickers();
   pg.genperms();
   if (cmd == "gap") {
      showtext(pg.writegap());
   } else if (cmd == "ss") {
      var gtw = gettextwriter();
      var os = pg.getOrbitsDef(false);
      var as = os.reassemblySize();
      gtw("Reassembly size is " + as);
      var ss = SchreierSims.schreiersims(pg.getMovesAsPerms(), gtw);
      var r = as / ss;
      gtw("Ratio is " + r);
   } else if (cmd == "canon") {
      pg.showcanon(gettextwriter());
   } else if (cmd == "ksolve") {
      showtext(pg.writeksolve("TwizzlePuzzle", false));
   } else if (cmd == "svgcmd") {
      showtext(pg.generatesvg(800, 500, 10, getCheckbox("threed")));
   } else {
      alert("Command " + cmd + " not handled yet.");
   }
}
function checkchange() {
   // for some reason we need to do this repeatedly
   addClickMoves();
   var descarg = descinput.value;
   if (descarg == null)
      return;
   var algo = (algoinput.value);
   if (algo == null)
      return;
   var newRender = getCheckboxes(renderOptions);
   var renderSame = trimEq(descarg, lastval) &&
      equalCheckboxes(renderOptions, lastRender, newRender);
   if (scramble == 0 && trimEq(algo, lastalgo) && renderSame)
      return;
   if (scramble != 0 || lastval != descarg || !renderSame) {
      puzzleSelected = true ;
      var savealg = true;
      lastval = descarg;
      lastRender = newRender;
      var p = PuzzleGeometry.parsedesc(descarg);
      if (p) {
         var options: Array<string | number | boolean> =
                              ["allmoves", true, "orientcenters", true] ;
         if (!lastRender.corners)
            options.push("cornersets", false);
         if (!lastRender.edges)
            options.push("edgesets", false);
         if (!lastRender.centers)
            options.push("centersets", false);
         if (scramble != 0) {
            if (scramble > 0)
               options.push("scramble", 1);
            scramble = 0;
            algo = "";
            safeKsolve = "";
            savealg = false;
         }
         var pg = new PuzzleGeometry(p[0], p[1], options);
         pg.allstickers();
         pg.genperms();
         var sep = "\n";
         var text =
            "Faces " + pg.baseplanerot.length + sep +
            "Stickers per face " + pg.stickersperface + sep +
            "Cubies " + pg.cubies.length + sep +
            "Short edge " + pg.shortedge + sep +
            "Edge distance " + pg.edgedistance + sep +
            "Vertex distance " + pg.vertexdistance;
         var el = document.getElementById('data');
         if (el)
            el.title = text;
         var ksolvetext: string;
         if (renderSame && safeKsolve != "") {
            ksolvetext = safeKsolve;
         } else {
            ksolvetext = pg.writeksolve("TwizzlePuzzle", true);
            movenames = pg.ksolvemovenames;
         }
         var stickerDat = pg.get3d(0.0131) ;
         grips = pg.svggrips ;
         LucasSetup(pg, ksolvetext, stickerDat, savealg) ;
      }
      if (!savealg) {
         lastalgo = "";
         algo = (algoinput.value);
      }
   }
   if (!trimEq(lastalgo, algo)) {
      lastalgo = algo;
      var toparse = "";
      if (algo.trim().length > 0) {
         toparse = algo;
      } else {
         toparse = "";
      }
      if (puzzle) {
         setAlgo(toparse, false);
      }
   }
}
function doaction(el: any) {
   var s = el.target.value;
   if (s != "") {
      actions.selectedIndex = 0;
      dowork(s);
   }
}
function doMoveInputSelection(el: any) {
   var s = el.target.value;
   if (s != "") {
      actions.selectedIndex = 0;
      dowork(s);
   }
}
function doselection(el: any) {
   if (el.target.value != '') {
      puzzleSelected = true;
      descinput.value = el.target.value;
      checkchange();
   }
}
function getQueryParam(name: string): string {
   return new URLSearchParams(window.location.search).get(name) || "";
}
// encode ' as -, and ' ' as _, in algorithms
/* not used yet
function encodealg(s:string) {
   return s.replace(/ /g, "_").replace(/'/g, "-") ;
}
 */
var raycaster = new Raycaster();
var mouse = new Vector2();
function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        render() ;
}

/*
 *   Need camera, scene, renderer
 */
function render() {

	// update the picking ray with the camera and mouse position
        if (!twisty)
           return ;
        var vantage = (twisty.player.pg3DView.pg3D).vantages[0] ;
        var scene = (twisty.player.pg3DView.pg3D).scene ;
        var camera = vantage.camera ;
        var renderer = vantage.renderer ;
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	for ( const grp of scene.children ) {
         
		var intersects = raycaster.intersectObjects( grp.children );
		for ( var i = 0; i < intersects.length; i++ ) {

			intersects[ i ].object.material.color.set( 0xff0000 );

		}
	}

	renderer.render( scene, camera );

}
export function setup() {
   var select = <HTMLSelectElement>document.getElementById('puzzleoptions');
   descinput = <HTMLInputElement>document.getElementById('desc');
   algoinput = <HTMLInputElement>document.getElementById('algorithm');
   var puzzledesc = PuzzleGeometry.getpuzzles();
   lastRender = getCheckboxes(renderOptions);
   var puz = getQueryParam('puzzle');
   var puzdesc = getQueryParam('puzzlegeometry');
   var found = false;
   for (var i = 0; i < puzzledesc.length; i += 2) {
      var opt = <HTMLOptionElement>document.createElement("option");
      opt.value = puzzledesc[i];
      opt.innerHTML = puzzledesc[i + 1];
      if (puzdesc == '' && puz == puzzledesc[i + 1]) {
         opt.selected = true;
         descinput.value = puzzledesc[i];
         found = true;
      }
      select.add(opt);
   }
   if (puzdesc != '') {
      select.selectedIndex = 0;
      descinput.value = puzdesc;
   } else if (!found) {
      for (var i = 0; i < puzzledesc.length; i += 2) {
         if (puzzledesc[i + 1] == '3x3x3') {
            select.selectedIndex = 1 + i / 2;
            descinput.value = puzzledesc[i];
         }
      }
   }
   select.onchange = doselection;
   actions = <HTMLSelectElement>document.getElementById('action');
   actions.onchange = doaction;
   moveInput = <HTMLSelectElement>document.getElementById('move-input');
   moveInput.onchange = doMoveInputSelection;
   var commands = ["scramble", "help", "reset", "options"];
   for (var i = 0; i < commands.length; i++)
      (<HTMLInputElement>document.getElementById(commands[i])).onclick =
         function (cmd) { return function () { dowork(cmd) } }(commands[i]);
   const qalg = algToString(getAlgURLParam("alg"));
   if (qalg != '') {
      algoinput.value = qalg;
      lastalgo = qalg;
   }
   checkchange();
   setInterval(checkchange, 0.5);

   window.addEventListener( 'mousemove', onMouseMove, false );
}
