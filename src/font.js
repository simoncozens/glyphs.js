import Promise from 'bluebird';
import Glyph from './glyph.js';

function Master(options, font) {
  Object.assign(this, options)
  this.font = font
  this.glyphs = {}
  this.unicodeTable = {}
}
Master.prototype.addGlyph = function(glyph, layer) {
  var g = new Glyph(layer, this, glyph.glyphname)
  g.leftKerningGroup = glyph.leftKerningGroup
  g.rightKerningGroup = glyph.rightKerningGroup
  if (glyph.unicode) {
    this.unicodeTable[String.fromCodePoint(glyph.unicode)] = g
  }
  this.glyphs[glyph.glyphname] = g
}

function Font(data) {
  this.fontVersion = data.versionMajor + "." + data.versionMinor
  this.userData = data.userData
  this.unitsPerEm = Number(data.unitsPerEm)
  // Set up masters
  this.masters = {}
  for (var m of data.fontMaster) {
    this.masters[m.id] = new Master(m, this)
    if (data.kerning[m.id]) {
      // console.log("Got kerning table")
      this.masters[m.id].kerning = data.kerning[m.id]
    }
  }

  for (var g of data.glyphs) {
    for (var l of g.layers) {
      var masterId = l.layerId
      if (this.masters[masterId]) {
        this.masters[masterId].addGlyph(g,l)
      }
    }
  }
}


Master.prototype.defaultRenderOptions = {
    kerning: true,
    // features: {
    //     liga: true,
    //     rlig: true
    // }
};


Master.prototype.stringToGlyphs = function(s, options) {
  options = options || this.defaultRenderOptions;
  var array = s.split(/\/([\w\.]+)\s?|/).filter(Boolean)
  if (options.features) { throw "Sorry, features not implemented yet" }
  // XXX This doesn't exactly do the right thing
  return array.map( (s) => this.unicodeTable[s] || this.glyphs[s] )
}

Font.prototype._findGroups = function (glyphname) {
  var groups = this.groups
  var found = []
  if (!groups) { return null }
  for (var group in groups) {
    var index = groups[group].indexOf(glyphname)
    if (index > -1) found.push(group)
  }
  return found
}

Master.prototype.getKerningValue = function(leftGlyph, rightGlyph) {
  if (leftGlyph.name) { leftGlyph = leftGlyph.name }
  if (rightGlyph.name) { rightGlyph = rightGlyph.name}
  if (!this.kerning) { return null }
  // First, check for the existence of a kern pair directly
  if (leftGlyph in this.kerning && rightGlyph in this.kerning[leftGlyph]) {
    return this.kerning[leftGlyph][rightGlyph]
  }

  var rightSideOfL = this.glyphs[leftGlyph].rightKerningGroup
  var leftSideOfR  = this.glyphs[rightGlyph].leftKerningGroup
  var lgroup = "@MMK_L_" + rightSideOfL
  var rgroup = "@MMK_R_" + leftSideOfR
  // console.log("Left is -> "+lgroup)
  // console.log("Right is -> "+rgroup)

  if (lgroup in this.kerning) {
    // console.log("Trying "+lgroup+"/"+rightGlyph)
    if (rightGlyph in this.kerning[lgroup]) { return this.kerning[lgroup][rightGlyph]}
    // console.log("Trying "+lgroup+"/"+rgroup)
    if (rgroup in this.kerning[lgroup]) { return this.kerning[lgroup][rgroup]}
  }
  // console.log("Trying "+leftGlyph+"/"+rgroup)
  if (leftGlyph in this.kerning && rgroup in this.kerning[leftGlyph]) {
    return this.kerning[leftGlyph][rgroup]
  }
  return null
}

Master.prototype.forEachGlyph = function(text, x, y, fontSize, options, callback) {
  x = x !== undefined ? x : 0;
  y = y !== undefined ? y : 0;
  fontSize = fontSize !== undefined ? fontSize : 72;
  options = options || this.defaultRenderOptions;
  const fontScale = 1 / this.font.unitsPerEm * fontSize;
  const glyphs = this.stringToGlyphs(text, options);
  let kerningLookups;
  for (let i = 0; i < glyphs.length; i += 1) {
    const glyph = glyphs[i];
    callback.call(this, glyph, x, y, fontSize, options);
    if (glyph.advanceWidth) {
      x += glyph.advanceWidth * fontScale;
    }

    if (options.kerning && i < glyphs.length - 1) {
      const kerningValue = this.getKerningValue(glyph, glyphs[i + 1])||0;
      // console.log("Kerning ", kerningValue)
      x += kerningValue * fontScale;
    }

    if (options.letterSpacing) {
      x += options.letterSpacing * fontSize;
    } else if (options.tracking) {
      x += (options.tracking / 1000) * fontSize;
    }
  }
  return x;
}

Master.prototype.draw = function(ctx, text, x, y, fontSize, options) {
  this.forEachGlyph(text, x, y, fontSize, options,
    function (glyph, gX, gY, gFontSize) {
      var p = glyph.getPath(gX,gY,gFontSize,options); p.draw(ctx)
    }
  )
};


Master.prototype.getAdvanceWidth = function(text, fontSize, options) {
    return this.forEachGlyph(text, 0, 0, fontSize, options, function() {});
};

export default Font;