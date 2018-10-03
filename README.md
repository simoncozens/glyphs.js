glyphs.js
======
glyphs.js is a JavaScript parser (and eventually writer) for fonts in Glyphs format. It is patterned on [opentype.js](https://www.github.com/nodebox/opentype.js).

It gives you access to the <strong>letterforms</strong> of text from the browser or node.js.

It is still under development and most parts don't work yet.

Here's an example. We load a font, then display it on a canvas with id "canvas":

    var ctx = document.getElementById("canvas").getContext("2d")
    glyphs.load("./fonts/Coolangatta.glyphs", function (err, font) {
      if (err) { throw err}
      font.masters["188E1E92-7CC0-44C3-9AA1-EAAC85F11CBE"].draw(
        ctx, "t/eacute e/lmiddletilde bpdq", 300, 100, 300
      )
    })

API
===
### Loading a font
Use `ufo.load(url, callback)` to load a font from a URL. Since this method goes out the network, it is asynchronous.
The callback gets `(err, font)` where `font` is a `Font` object. Check if the `err` is null before using the font.

    glyphs.load('fonts/Roboto-Black.glyphs', function(err, font) {
        if (err) {
            alert('Could not load font: ' + err);
        } else {
            // Use your font here.
        }
    });

### The Font object

A Font represents a loaded UFO font file. It contains metadata, and a set of masters

* `masters` : A dictionary of masters available in this font
* `unitsPerEm` : Units per em
* `fontVersion` : The font's version number

Within the `masters` dictionary, you will find `Master` objects.

### The Master object

#### `Master.stringToGlyphs(string)`
Convert the string to a list of glyph objects.

The string should be in "Glyphs format": portions of the string starting with a forward slash up to the next space or forward slash are considered a glyph name, but any other character stands for itself.

For instance, `A/zero /five/b b` represents the four characters A, 0, 5, b and b.

#### `Master.getKerningValue(leftGlyph, rightGlyph)`
Retrieve the value of the [kerning pair](https://en.wikipedia.org/wiki/Kerning) between the left glyph (or its index) and the right glyph (or its index). If no kerning pair is found, returns `null`. (*Note change from opentype.js*) The kerning value gets added to the advance width when calculating the spacing between glyphs.

#### `Master.getAdvanceWidth(text, fontSize, options)`
Returns the advance width of a text.

This is something different than Path.getBoundingBox() as for example a
suffixed whitespace increases the advancewidth but not the bounding box
or an overhanging letter like a calligraphic 'f' might have a quite larger
bounding box than its advance width.

This corresponds to canvas2dContext.measureText(text).width
* `fontSize`: Size of the text in pixels (default: 72).
* `options`: See Font.getPath

#### The Glyph object
A Glyph is an individual mark that often corresponds to a character. Some glyphs, such as ligatures, are a combination of many characters. Glyphs are the basic building blocks of a font.

* `master`: A reference to the `Master` object.
* `name`: The glyph name (e.g. "Aring", "five")
* `advanceWidth`: The width to advance the pen when drawing this glyph.
* `unicode`: The unicode value for this glyph.

##### `Glyph.getPath(x, y, fontSize)`
Get *a promise to* a scaled glyph Path object we can draw on a drawing context.
* `x`: Horizontal position of the glyph. (default: 0)
* `y`: Vertical position of the *baseline* of the glyph. (default: 0)
* `fontSize`: Font size in pixels (default: 72).

##### `Glyph.draw(ctx, x, y, fontSize)`
Draw the glyph *asynchronously* on the given context.
* `ctx`: The drawing context.
* `x`: Horizontal position of the glyph. (default: 0)
* `y`: Vertical position of the *baseline* of the glyph. (default: 0)
* `fontSize`: Font size, in pixels (default: 72).


### The Path object
Once you have a path through `Font.getPath` or `Glyph.getPath`, you can use it.

* `commands`: The path commands. Each command is a dictionary containing a type and coordinates. See below for examples.
* `fill`: The fill color of the `Path`. Color is a string representing a [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value). (default: 'black')
* `stroke`: The stroke color of the `Path`. Color is a string representing a [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value). (default: `null`: the path will not be stroked)
* `strokeWidth`: The line thickness of the `Path`. (default: 1, but since the `stroke` is null no stroke will be drawn)

##### `Path.draw(ctx)`
Draw the path on the given 2D context. This uses the `fill`, `stroke` and `strokeWidth` properties of the `Path` object.
* `ctx`: The drawing context.

##### `Path.getBoundingBox()`
Calculate the minimum bounding box for the given path. Returns an `opentype.BoundingBox` object that contains x1/y1/x2/y2.
If the path is empty (e.g. a space character), all coordinates will be zero.

##### `Path.toPathData(decimalPlaces)`
Convert the Path to a string of path data instructions.
See http://www.w3.org/TR/SVG/paths.html#PathData
* `decimalPlaces`: The amount of decimal places for floating-point values. (default: 2)

##### `Path.toSVG(decimalPlaces)`
Convert the path to a SVG &lt;path&gt; element, as a string.
* `decimalPlaces`: The amount of decimal places for floating-point values. (default: 2)

#### Path commands
* **Move To**: Move to a new position. This creates a new contour. Example: `{type: 'M', x: 100, y: 200}`
* **Line To**: Draw a line from the previous position to the given coordinate. Example: `{type: 'L', x: 100, y: 200}`
* **Curve To**: Draw a bézier curve from the current position to the given coordinate. Example: `{type: 'C', x1: 0, y1: 50, x2: 100, y2: 200, x: 100, y: 200}`
* **Quad To**: Draw a quadratic bézier curve from the current position to the given coordinate. Example: `{type: 'Q', x1: 0, y1: 50, x: 100, y: 200}`
* **Close**: Close the path. If stroked, this will draw a line from the first to the last point of the contour. Example: `{type: 'Z'}`
