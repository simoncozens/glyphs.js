import Path from './path'

function Glyph(options, master,name) {
  Object.assign(this, options)
  this.name = name
  this.advanceWidth = this.width
  this.master = master
}

var _matrix_to_array = function (s) {
  return s.match(/([-\d\.]+)[,|\}]/g).map( (x) => parseFloat(x,10))
}

Glyph.prototype.getPath = function (x, y, fontSize, options) {
  var path = new Path()
  x = x !== undefined ? x : 0;
  y = y !== undefined ? y : 0;
  fontSize = fontSize !== undefined ? fontSize : 72;
  if (!options) options = { };
  var scale = 1 / this.master.font.unitsPerEm * fontSize;

  for (var c of (this.components||[])) {
    var matrix1 = _matrix_to_array(c.transform || '{1, 0, 0, 1, 0, 0}')
    matrix1[5] = -matrix1[5]
    var otherGlyph = this.master.glyphs[c.name]
    var otherPath = otherGlyph.getPath(0,0,this.master.font.unitsPerEm)
    let matrix2 = [ scale, 0, 0, scale, x, y]
    path.extend(otherPath.transform(matrix1).transform(matrix2))
  }
  for (var c of this.paths||[]) {
    c = c.nodes.map( (n) => { var [x,y,type] = n.split(/\s+/); return { x,y,type} })
    var firstOncurve = c.findIndex( (n) => n.type != "OFFCURVE" )
    path.moveTo(x + c[firstOncurve].x * scale, y - c[firstOncurve].y * scale)
    let prev = function(i) {
      if (i-1 < 0) { i += c.length }
      return c[i-1]
    }
    let prevPrev = function(i) {
      if (i-2 < 0) { i += c.length }
      return c[i-2]
    }

    let handleNode = function (i) {
      var node = c[i]
      if (!node) { return }
      if (node.type == "LINE") {
        path.lineTo(x + node.x * scale, y - node.y * scale)
      } else if (node.type == "CURVE") {
        path.curveTo(
          x + prevPrev(i).x * scale, y - prevPrev(i).y * scale,
          x + prev(i).x * scale, y - prev(i).y * scale,
          x + node.x * scale, y - node.y * scale
        )
      }
    }
    for (var i = firstOncurve+1; i < c.length; i++) {
      handleNode(i)
    }
    for (var i = 0; i <= firstOncurve; i++) {
      handleNode(i)
    }
  }
  path.close()
  return path
}

Glyph.prototype.draw = function(ctx, x, y, fontSize, options) {
    this.getPath(x, y, fontSize, options).draw(ctx);
};

export default Glyph