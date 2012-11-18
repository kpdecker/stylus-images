var lib = require('./lib'),
    stylus = require('stylus'),
    stylusImage = require('..');

function runTest(test, expected, options, done) {
  stylus(test)
    .use(stylusImage.plugin(options))
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

describe('resolution selector', function() {
  it('should inline non-updated urls', function(done) {
    runTest(
        '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  display inline-block\n',

        '.test {\n'
      + '  background-image: url("' + lib.LO_REZ_DATA + '");\n'
      + '  display: inline-block;\n'
      + '}\n',

      {res: 1.5},
      done);
  });
  it('should inline updated urls', function(done) {
    runTest(
        '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  display inline-block\n',

        '.test {\n'
      + '  background-image: url("' + lib.HI_REZ_DATA + '");\n'
      + '  display: inline-block;\n'
      + '}\n',

      {res: 2},
      done);
  });

  it('should update external urls', function(done) {
    runTest(
        '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  display inline-block\n',

        '.test {\n'
      + '  background-image: url("images/barrowLoRez@2x.png");\n'
      + '  display: inline-block;\n'
      + '}\n',

      {res: 2, limit: 100},
      done);
  });
});
