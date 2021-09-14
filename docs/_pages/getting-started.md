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

## Show an alg (no custom JavaScript!)


Include this once on your page:
```html
<script src="https://cdn.cubing.net/esm/cubing/twisty" 
    type="module" defer></script>
```
Create any number of players, like this:
```html
<twisty-player alg="R U R' U R U2' R'"></twisty-player>
```

<twisty-player alg="R U R' U R U2' R'">
        </twisty-player>