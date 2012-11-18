var fs = require('fs'),
    stylus = require('stylus'),
    stylusImage = require('..');

function runTest(test, expected, imagePath, options, done) {
  stylus(test, options)
    .use(stylusImage(options))
    .include(process.cwd() + '/test')
    .render(function(err, css) {
      // Timeout to prevent multiple errors in response to catch resend
      setTimeout(function() {
        if (err) {
          throw err;
        }

        css.should.eql(expected);
        fs.statSync(imagePath).isFile().should.be.true;
        done();
      }, 0);
    });
}

describe('copy file', function() {
  fs.mkdir('/tmp/stylus-images', parseInt('0777', 8));

  it('copy large files', function(done) {
    runTest(
        '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  display inline-block\n',

        '.test {\n'
      + '  background-image: url("images/barrowLoRez@2x.png");\n'
      + '  display: inline-block;\n'
      + '}\n',
      '/tmp/stylus-images/images/barrowLoRez@2x.png',

      {res: 2, limit: 100, copyFiles: true, filename: '/tmp/stylus-images/test.css'},
      done);
  });
});
