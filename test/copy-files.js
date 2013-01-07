/*jshint maxparams: 5*/
var fs = require('fs'),
    stylus = require('stylus'),
    stylusImage = require('..'),
    wrench = require('wrench');

function runTest(test, expected, imagePath, options, done) {
  stylus(test, options)
    .use(stylusImage.plugin(options))
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
  before(function() {
    fs.mkdir('/tmp/stylus-images', parseInt('0777', 8));
  });
  after(function() {
    wrench.rmdirSyncRecursive('/tmp/stylus-images');
  });

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
