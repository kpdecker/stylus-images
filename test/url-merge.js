var stylus = require('stylus'),
    stylusImage = require('..');

const LO_REZ_DATA = 'data:image/png;base64,'
      + 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAJAQMAAAA4g48'
      + 'qAAAABlBMVEUAAABsbGxp5oJTAAAAAXRSTlMAQObYZg'
      + 'AAACNJREFUCB1jUBBgKLBgqKhgqPnBYP+BQf4BA/8BB'
      + 'vYGBmYGAF9nBsTug883AAAAAElFTkSuQmCC';

function runTest(test, expected, name, assert) {
  stylus(test)
    .use(stylusImage())
    .include(process.cwd() + '/test')
    .render(function(err, css) {
      // Timeout to prevent multiple errors in response to catch resend
      setTimeout(function() {
        if (err) {
          throw err;
        }

        assert.equal(css, expected, name);
      }, 0);
    });
}

exports['simple-url'] = function(beforeExit, assert) {
  runTest(
      '.test\n'
    + '  background-image url("barrowLoRez.png")\n'
    + '  display inline-block\n'
    + '.test\n'
    + '  background-image url("barrowLoRez.png")\n',

      '.test {\n'
    + '  display: inline-block;\n'
    + '}\n'
    + '.test,\n'
    + '.test {\n'
    + '  background-image: url("' + LO_REZ_DATA + '");\n'
    + '}\n',

    "Simple URL Matches",
    assert);
};

exports['single-instance'] = function(beforeExit, assert) {
  runTest(
      '.test\n'
    + '  background-image url("barrowLoRez.png")\n'
    + '  display inline-block\n',

      '.test {\n'
    + '  background-image: url("' + LO_REZ_DATA + '");\n'
    + '  display: inline-block;\n'
    + '}\n',

    "Simple URL Matches",
    assert);
};

exports['different-properties'] = function(beforeExit, assert) {
  runTest(
      '.test\n'
    + '  background-image url("barrowLoRez.png")\n'
    + '.test\n'
    + '  background url("barrowLoRez.png")\n',

      '.test {\n'
    + '  background-image: url("' + LO_REZ_DATA + '");\n'
    + '}\n'
    + '.test {\n'
    + '  background: url("' + LO_REZ_DATA + '");\n'
    + '}\n',

    "Different Properties",
    assert);
};

exports['conditional-properties'] = function(beforeExit, assert) {
  runTest(
      '.test1\n'
    + '  if true\n'
    + '    background-image url("barrowLoRez.png")\n'
    + '.test2\n'
    + '  background-image url("barrowLoRez.png")\n',

      '.test1,\n'
    + '.test2 {\n'
    + '  background-image: url("' + LO_REZ_DATA + '");\n'
    + '}\n',

    "True Conditional",
    assert);
  runTest(
      '.test1\n'
    + '  if false\n'
    + '    background-image url("barrowLoRez.png")\n'
    + '.test2\n'
    + '  background-image url("barrowLoRez.png")\n',

      '.test2 {\n'
    + '  background-image: url("' + LO_REZ_DATA + '");\n'
    + '}\n',

    "False Conditional",
    assert);
};

exports['external-url'] = function(beforeExit, assert) {
  runTest(
      '.test1\n'
    + '  background-image url("foo.png")\n'
    + '.test2\n'
    + '  background-image url("foo.png")\n',

      '.test1 {\n'
    + '  background-image: url("foo.png");\n'
    + '}\n'
    + '.test2 {\n'
    + '  background-image: url("foo.png");\n'
    + '}\n',

    "True Conditional",
    assert);
  runTest(
      '.test1\n'
    + '  if false\n'
    + '    background-image url("barrowLoRez.png")\n'
    + '.test2\n'
    + '  background-image url("barrowLoRez.png")\n',

      '.test2 {\n'
    + '  background-image: url("' + LO_REZ_DATA + '");\n'
    + '}\n',

    "False Conditional",
    assert);
};
