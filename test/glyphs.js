import assert  from 'assert';
import * as glyphs from '../src/glyphs.js';

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Font reading', function() {
  it('can read a font from fs', function() {
    glyphs.load("./fonts/Coolangatta.glyphs", function (err, font) {
      if (err) { throw err }
      expect(font).to.have.property("unitsPerEm", 1000)
    })
  })

  it('can read a font synchronously', function() {
    var font = glyphs.loadSync("./fonts/Coolangatta.glyphs")
    expect(font).to.have.property("unitsPerEm", 1000)
  })
})
