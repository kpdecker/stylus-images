var fs = require('fs'),
    lib = require('./lib'),
    stylusImages = require('../'),
    wrench = require('wrench');

function runTest(test, options, done) {
  stylusImages(test, options)
    .include(process.cwd() + '/test')
    .render(function(err, css) {
      // Timeout to prevent multiple errors in response to catch resend
      setTimeout(function() {
        if (err) {
          throw err;
        }

        done(css);
      }, 0);
    });
}

describe('multiple ouput', function() {
  before(function() {
    fs.mkdir('/tmp/stylus-images', parseInt('0777', 8));
  });
  after(function() {
    wrench.rmdirSyncRecursive('/tmp/stylus-images');
  });

  it('should output a file for each resolution', function(done) {
    runTest(
      '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n',

      {images: {resolutions: [0.5, 1, 2, 3]}},

      function(data) {
        function expected(density) {
          return '.test {\n'
              + '  background-image: url("' + (density >= 2 ? lib.HI_REZ_DATA : lib.LO_REZ_DATA) + '");\n'
              + '}\n';
        }
        data.should.eql({
          '0.5': expected(0.5),
          '1': expected(1),
          '2': expected(2),
          '3': expected(3)
        });

        done();
      });
  });

  it('should copy files for each resolution', function(done) {
    runTest(
      '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n',

      {images: {resolutions: [0.5, 1, 2, 3], limit: 115, copyFiles: true, outdir: '/tmp/stylus-images'}},

      function(data) {
        function expected(density) {
          return '.test {\n'
              + '  background-image: url("' + (density >= 2 ? lib.HI_REZ_DATA : 'images/barrowLoRez.png') + '");\n'
              + '}\n';
        }
        data.should.eql({
          '0.5': expected(0.5),
          '1': expected(1),
          '2': expected(2),
          '3': expected(3)
        });

        fs.statSync('/tmp/stylus-images/images/barrowLoRez.png').isFile().should.be.true;

        done();
      });
  });
  it('should merge files for each resolution', function(done) {
    runTest(
        '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n'
      + '  display inline-block\n'
      + '.test\n'
      + '  background-image url("images/barrowLoRez.png")\n',

      {images: {resolutions: [0.5, 1, 2, 3]}},

      function(data) {
        function expected(density) {
          return '.test {\n'
              + '  display: inline-block;\n'
              + '}\n'
              + '.test,\n'
              + '.test {\n'
              + '  background-image: url("' + (density >= 2 ? lib.HI_REZ_DATA : lib.LO_REZ_DATA) + '");\n'
              + '}\n';
        }
        data.should.eql({
          '0.5': expected(0.5),
          '1': expected(1),
          '2': expected(2),
          '3': expected(3)
        });

        done();
      });
  });
});
