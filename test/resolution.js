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

function runTest(test, expected, options, done) {
  stylus(test)
    .use(stylusImage(options))
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
      + '  background-image: url("' + LO_REZ_DATA + '");\n'
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
      + '  background-image: url("' + HI_REZ_DATA + '");\n'
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
