var lib = require('./lib'),
    stylus = require('stylus'),
    stylusImage = require('..');

function runTest(test, expected, done) {
  stylus(test)
    .use(stylusImage.plugin({}))
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
      + '  background-image: url("' + lib.LO_REZ_DATA + '");\n'
      + '}\n',

      done);
  });

  exports['single-instance'] = function(done) {
    runTest(
        '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  display inline-block\n',

        '.test {\n'
      + '  background-image: url("' + lib.LO_REZ_DATA + '");\n'
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
      + '  background-image: url("' + lib.LO_REZ_DATA + '");\n'
      + '}\n'
      + '.test {\n'
      + '  background: url("' + lib.LO_REZ_DATA + '");\n'
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
      + '  background-image: url("' + lib.LO_REZ_DATA + '");\n'
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
      + '  background-image: url("' + lib.LO_REZ_DATA + '");\n'
      + '}\n',

      done);
  });

  it('should merge nested rules', function(done) {
    runTest(
        '.test1\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  .test2\n'
      + '    background-image url("images/barrowLoRez.png")\n',

        '.test1,\n'
      + '.test1 .test2 {\n'
      + '  background-image: url("' + lib.LO_REZ_DATA + '");\n'
      + '}\n',

      done);
  });
  it('should merge & rules', function(done) {
    runTest(
        '.test1\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  &.test2\n'
      + '    background-image url("images/barrowLoRez.png")\n',

        '.test1,\n'
      + '.test1.test2 {\n'
      + '  background-image: url("' + lib.LO_REZ_DATA + '");\n'
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
      + '  background-image: url("' + lib.LO_REZ_DATA + '");\n'
      + '}\n'
      + '.test2,\n'
      + '.test2 {\n'
      + '  background-image: url("' + lib.HI_REZ_DATA + '");\n'
      + '}\n',

      done);
  });
});
