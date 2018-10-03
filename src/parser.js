var startDict_re = /^\s*{/
var endDict_re = /^\s*}/
var dictDelim_re = /^\s*;/
var startList_re = /^\s*\(/
var endList_re = /^\s*\)/
var listDelim_re = /^\s*,/
var attr_re = /^\s*("(?:[^"\\]|\\[\s\S])*"|[-_./$A-Za-z0-9]+)\s*=/
var value_re = /^\s*("(?:[^"\\]|\\[\s\S])*"|[-_./$A-Za-z0-9]+)/
var hex_re = /^\s*<([A-Fa-f0-9]+)>/
var bytes_re = /^\s*<([A-Za-z0-9+\/=]+)>/
var _unescape_re = /\\(?:(0[0-7]{2})|(?:U([0-9a-fA-F]{4})))/

function Parser(text) {
  this.text = text;
  this.currentType = Object
}

Parser.prototype.parse = function () {
  var result
  var r = this._parse(this.text)
  result = r[0]
  this.text = r[1]
  if (this.text.match(/\S/)) { throw "Unexpected trailing content" }
  return result
}

Parser.prototype._parse = function (text) {
  // console.log("Trying |"+text+"|")
  if (text.match(startDict_re)) {
    return this._parseDict(text.replace(startDict_re, ""))
  }
  if (text.match(startList_re)) {
    return this._parseList(text.replace(startList_re, ""))
  }
  var m = text.match(value_re)
  // console.log("Match against value:", m)
  if (m) {
    var value = this._parseWithCurrentType(m[1])
    // console.log("Got "+value)
    return [value, text.replace(value_re, "")]
  }
  var m = text.match(hex_re)
  // console.log("Match against hex:", m)
  if (m) {
    var decoded = this.decodeHex(m[1])
    return [decoded, text.replace(hex_re, "")]
  }
  throw "Unexpected content parsing Glyphs file"
}

Parser.prototype._parseDict = function (text) {
  var oldCurrentType = this.currentType
  var newType = this.currentType
  if (!newType) { newType = Object }
  else if (Array.isArray(newType)) { newType = newType[0] }
  // console.log(newType)
  var res = {} // Whoa.
  text = this._parseDictIntoObject(res, text)
  this.currentType = oldCurrentType
  return [res, text]
}

Parser.prototype._parseDictIntoObject = function (res, text) {
  // console.log("Parsing into ", res)
  while (text.length > 0 && ! text.match(endDict_re)) {
    var oldCurrentType = this.currentType
    var m = text.match(attr_re)
    if (!m) { throw "Unexpected dictionary content" }
    var name = this._trimValue(m[1])
    text = text.replace(attr_re, "")
    // console.log("Name was "+name+" Now parsing: "+text)
    var result = this._parse(text)
    // console.log("Res is ", res)
    // console.log(result)
    res[name] = result[0]
    text = result[1]
    // console.log("Result was "+result+" Now parsing: "+text)
    if (!text.match(endDict_re)) {
      var m = text.match(dictDelim_re)
      if (!m) { throw "Missing dictionary delimiter" }
      text = text.replace(dictDelim_re, "")
      this.currentType = oldCurrentType
    }
  }
  if (!text.match(endDict_re)) { throw "Missing end of dictionary" }
  text = text.replace(endDict_re, "")
  return text
}

Parser.prototype._parseList = function (text) {
  var oldCurrentType = this.currentType
  var res = []
  var result
  while (text.length > 0) {
    [result, text] = this._parse(text)
    res.push(result)
    if (text.match(endList_re)) { this.currentType = oldCurrentType; break }

    var m = text.match(listDelim_re)
    if (!m) { throw "Missing list delimiter" }
    text = text.replace(listDelim_re, "")
  }
  if (!text.match(endList_re)) { throw "Missing end of list" }
  text = text.replace(endList_re, "")
  return [res, text]
}

Parser.prototype._trimValue = function (value) {
  var replacer = function (match, p1, p2, offset, string) {
    if (p1) { return parseInt(p1,8) }
    return parseInt(p2, 16)
  }
  if (value[0] == '"') {
    value = value.substr(1,value.length-2).replace('\\"', '"').replace("\\\\", "\\")
    return value.replace(_unescape_re, replacer)
  }
  return value
}

Parser.prototype._parseWithCurrentType = function (value) {
  // For now
  if (value[0] != '"') {
    if (value.match(/^([0-9a-fA-F]{4})$/)) { return parseInt(value, 16)}
    if (value.match(/^(0[0-7]{2})$/)) { return parseInt(value, 8)}
    if (isNaN(Number(value))) { return value }
    return Number(value)
  }
  return this._trimValue(value)
}

export default Parser;