var babel = require('rollup-plugin-babel');
var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var license = require('rollup-plugin-license');
var builtins = require('rollup-plugin-node-builtins');
var globals = require('rollup-plugin-node-globals');

module.exports = {
    input: 'src/glyphs.js',
    output: {
        file: 'dist/glyphs.js',
        format: 'umd',
        name: 'glyphs',
        sourcemap: true
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs(),
        builtins(),
        globals(),
        babel({
          exclude: 'node_modules/**'
        }),
        license({
        })
    ],
    watch: {
        include: 'src/**'
    }
};
