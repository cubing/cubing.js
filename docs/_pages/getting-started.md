---
permalink: "/getting-started/"
toc: true
breadcrumbs: false
---

  <script src="https://cdn.cubing.net/esm/cubing/twisty" type="module" defer></script>
  <script type="module" defer>
    import { experimentalSetShareAllNewRenderers } from "https://cdn.cubing.net/esm/cubing/twisty";
    experimentalSetShareAllNewRenderers(true);
  </script>

`cubing.js` is a library for showing and playing with twisty puzzles. 
<br><br>
You may use it for free in any website or app, for any personal use or if you publicly share any code that uses it.
{: .notice} 


## HTML Cube Player 
### Example - show an alg 

Include this once on your page:
```html
<script src="https://cdn.cubing.net/esm/cubing/twisty" 
    type="module" defer></script>
```
Create any number of players, like this:
```html
<twisty-player alg="R U R' U R U2' R'"></twisty-player>
```

<twisty-player alg="R U R' U R U2' R'"></twisty-player>

[Try it yourself.](https://codepen.io/cubing/pen/gOLMYqK)
{: .notice} 

### Parameters

The example above uses only the alg parameter; there are many more. Here is a player that uses a variety of parameters:

```html
<twisty-player
  puzzle="4x4x4"
  alg="r U2 x r U2 r U2 r' U2 l U2 r' U2 r U2 r' U2 r'"
  hint-facelets="none"
  back-view="top-right"
  background="none"
></twisty-player> 
```

<twisty-player
  puzzle="4x4x4"
  alg="r U2 x r U2 r U2 r' U2 l U2 r' U2 r U2 r' U2 r'"
  hint-facelets="none"
  back-view="top-right"
  background="none"
  style="margin: auto;"
></twisty-player> 

[Try it yourself.](https://codepen.io/cubing/pen/MWbegxW)
{: .notice} 

You can view and try out more options [here](https://experiments.cubing.net/cubing.js/twisty/twisty-player.html). Note that some combinations are not supported yet (for example, most puzzles do not work with visualization="2D" yet). 

### Size, background, and other styles

Use CSS to set the style of a twisty-player:

```html
<twisty-player
  style="width: 256px;
         height: 192px;
         margin: auto;
         background: #0088ff22;
         border: 4px double #00000044;"
  puzzle="fto"
  alg="[bl: [R, B'] [L', B]]"
  hint-facelets="none"
  back-view="side-by-side"
  background="none"
></twisty-player> 
```

<twisty-player
  style="width: 80%;
         margin: auto;
         background: #0088ff22;
         border: 4px double #00000044;
         display: inline-grid; 
         vertical-align: middle;"
  puzzle="fto"
  alg="[bl: [R, B'] [L', B]]"
  hint-facelets="none"
  back-view="side-by-side"
  background="none"
></twisty-player> 

[Try it yourself.](https://codepen.io/cubing/pen/xxROKBR)
*(Tip: you should set background="none" on the twisty-player to remove the default background if you want a different one.)*
{: .notice}  

## Experimental Parameters

Parameters (or parameter values) that start with experimental may not be reliable in all situations. All experimental features will eventually be removed (either replaced with a non-experimental version of the feature, or removed completely), but you may find it convenient to try them out. Please send us [feedback](https://js.cubing.net/cubing/#contribute) about your experience with experimental features.

### Use a setup alg or scramble

This example also demonstrates multi-line algs:
```html
<twisty-player
  experimental-setup-alg="F U2 L2 B2 F' U L2 U R2 D2 L' B L2 B' R2 U2"
  alg="y x' // inspection
       U R2 U' F' L F' U' L' // XX-Cross + EO
       U' R U R' // 3rd slot
       R' U R U2' R' U R // 4th slot
       U R' U' R U' R' U2 R // OLL / ZBLL
       U // AUF"
></twisty-player> 
```

<twisty-player
  experimental-setup-alg="F U2 L2 B2 F' U L2 U R2 D2 L' B L2 B' R2 U2"
  alg="y x' // inspection
       U R2 U' F' L F' U' L' // XX-Cross + EO
       U' R U R' // 3rd slot
       R' U R U2' R' U R // 4th slot
       U R' U' R U' R' U2 R // OLL / ZBLL
       U // AUF"
></twisty-player> 

### End solved / end with the setup state

`experimental-setup-anchor="end"` will make the alg end with the solved state, rather than starting with the solved state.

If you also use `experimental-setup-alg` at the same time, the setup state (the result of applying the setup alg to the solved state) will be used instead of the solved stated. 

```html
<twisty-player
  experimental-setup-anchor="end"
  alg="U M' U' R' U' R U M2' U' R' U r"
></twisty-player> 
```

<twisty-player
  experimental-setup-anchor="end"
  alg="U M' U' R' U' R U M2' U' R' U r"
></twisty-player> 

### 2D visualization

2D visualization is technically not experimental, but it's only supported for a few puzzles so far.

```html
<twisty-player
  alg="M2 E2 S2"
  visualization="2D"
></twisty-player> 
```

<twisty-player
  alg="M2 E2 S2"
  visualization="2D"
></twisty-player> 

### 2D LL visualization

```html
<twisty-player
  alg="R U R' (U' D) R2 U' R U' R' U R' U R2 (D' U)"
  experimental-setup-anchor="end"
  visualization="experimental-2D-LL"
  background="none"
  control-panel="none"
></twisty-player> 
```

<twisty-player
  alg="R U R' (U' D) R2 U' R U' R' U R' U R2 (D' U)"
  experimental-setup-anchor="end"
  visualization="experimental-2D-LL"
  background="none"
  control-panel="none"
></twisty-player> 

### Stickering

This is very useful for showing algs that correspond to a particular step in a speedsolving method.

```html
<twisty-player
  alg="r U R' U R U2 r'"
  experimental-setup-anchor="end"
  experimental-stickering="OLL"
></twisty-player> 
```

<twisty-player
  alg="r U R' U R U2 r'"
  experimental-setup-anchor="end"
  experimental-stickering="OLL"
></twisty-player> 

Cross is currently only supported on the default D face (yellow):

```html
<twisty-player
  alg="y' R' D2 R' y' R' U L2'"
  experimental-setup-alg="D U2 B D2 U2 L2 B D2 R2 F R2 B U2 D B2 F U B" R" B2 D"
  experimental-stickering="Cross"
></twisty-player> 
```

<twisty-player
  alg="y' R' D2 R' y' R' U L2'"
  experimental-setup-alg="D U2 B D2 U2 L2 B D2 R2 F R2 B U2 D B2 F U B" R" B2 D"
  experimental-stickering="Cross"
></twisty-player> 

## JavaScript features

If you have a more advanced use case, you can create a twisty-player using JavaScript: 

```html
<script type="module">
  import { parseAlg } from "https://cdn.cubing.net/esm/cubing/alg";
  import { TwistyPlayer } from "https://cdn.cubing.net/esm/cubing/twisty";

  const player = new TwistyPlayer({
    puzzle: "4x4x4",
    alg: parseAlg("R U R'"),
    hintFacelets: "none",
    backView: "top-right",
    background: "none"
  });
  document.body.appendChild(player);

  // You can also change parameters after you've constructed the player:
  player.backView = "side-by-side";
</script> 
```




```html
```
```html
```
```html
```
```html
```
