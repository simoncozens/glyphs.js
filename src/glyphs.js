
// import 'string.prototype.codepointat';
// import inflate from 'tiny-inflate';
import Promise from 'bluebird';
import Font from './font';
import Parser from './parser';
import { _readFiletoPromise, _XHRtoPromise, openGlyphs } from './loader'

function load(url, callback, options) {
  openGlyphs(url, options)
  .then( (parsedData) => callback(null, new Font(parsedData)) )
  .catch( (e) => callback(e, null) )
}

function loadSync(url) {
  var s = require("fs").readFileSync(url).toString()
  var parsedData = (new Parser(s)).parse()
  return new Font(parsedData)
}

export { load, loadSync }