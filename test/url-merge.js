var stylus = require('stylus'),
    stylusImage = require('..');

const LO_REZ_DATA = 'data:image/png;base64,'
      + 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAJAQMAAAA4g48'
      + 'qAAAABlBMVEUAAABsbGxp5oJTAAAAAXRSTlMAQObYZg'
      + 'AAACNJREFUCB1jUBBgKLBgqKhgqPnBYP+BQf4BA/8BB'
      + 'vYGBmYGAF9nBsTug883AAAAAElFTkSuQmCC';
const HI_REZ_DATA = 'data:image/png;base64,'
      + 'iVBORw0KGgoAAAANSUhEUgAAACcAAAAwAgMAAADvHou'
      + 'FAAAADFBMVEUAAADu7u7l5uWztLMXvUdxAAAAAXRSTl'
      + 'MAQObYZgAAABRJREFUKFNjuMAAB6NMDOaDkcYEAJiHK'
      + 'GF+9t31AAAAAElFTkSuQmCC';

function runTest(test, expected, done) {
  stylus(test)
    .use(stylusImage({}))
    .include(process.cwd() + '/test')
    .render(function(err, css) {
      // Timeout to prevent multiple errors in response to catch resend
      setTimeout(function() {
        if (err) {
          throw err;
        }

        css.should.eql(expected);
        done();
      }, 0);
    });
}

describe('url-merge', function() {
  it('should merge two inlined images', function(done) {
    runTest(
        '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  display inline-block\n'
      + '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n',

        '.test {\n'
      + '  display: inline-block;\n'
      + '}\n'
      + '.test,\n'
      + '.test {\n'
      + '  background-image: url("' + LO_REZ_DATA + '");\n'
      + '}\n',

      done);
  });

  exports['single-instance'] = function(done) {
    runTest(
        '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  display inline-block\n',

        '.test {\n'
      + '  background-image: url("' + LO_REZ_DATA + '");\n'
      + '  display: inline-block;\n'
      + '}\n',

      done);
  };

  it('should not merge different property references', function(done) {
    runTest(
        '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '.test\n'
      + '  background url("images/barrowLoRez.png")\n',

        '.test {\n'
      + '  background-image: url("' + LO_REZ_DATA + '");\n'
      + '}\n'
      + '.test {\n'
      + '  background: url("' + LO_REZ_DATA + '");\n'
      + '}\n',

      done);
  });

  it('should should merge true contional properties', function(done) {
    runTest(
        '.test1\n'
      + '  if true\n'
      + '    background-image url("images/barrowLoRez.png")\n'
      + '.test2\n'
      + '  background-image url("images/barrowLoRez.png")\n',

        '.test1,\n'
      + '.test2 {\n'
      + '  background-image: url("' + LO_REZ_DATA + '");\n'
      + '}\n',

      done);
  });
  it('should not merge false conditional properties', function(done) {
    runTest(
        '.test1\n'
      + '  if false\n'
      + '    background-image url("images/barrowLoRez.png")\n'
      + '.test2\n'
      + '  background-image url("images/barrowLoRez.png")\n',

        '.test2 {\n'
      + '  background-image: url("' + LO_REZ_DATA + '");\n'
      + '}\n',

      done);
  });

  it('should not merge external urls', function(done) {
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

      done);
  });

  it('should handle mutliple merges in the same file', function(done) {
    runTest(
        '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  display inline-block\n'
      + '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '.test2\n'
      + '  background-image url("images/barrowLoRez@2x.png")\n'
      + '  display inline-block\n'
      + '.test2\n'
      + '  background-image url("images/barrowLoRez@2x.png")\n',

        '.test {\n'
      + '  display: inline-block;\n'
      + '}\n'
      + '.test2 {\n'
      + '  display: inline-block;\n'
      + '}\n'
      + '.test,\n'
      + '.test {\n'
      + '  background-image: url("' + LO_REZ_DATA + '");\n'
      + '}\n'
      + '.test2,\n'
      + '.test2 {\n'
      + '  background-image: url("' + HI_REZ_DATA + '");\n'
      + '}\n',

      done);
  });
});
