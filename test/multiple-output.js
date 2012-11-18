var fs = require('fs'),
    lib = require('./lib'),
    stylusImages = require('../');

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
  fs.mkdir('/tmp/stylus-images', parseInt('0777', 8));

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

  it.skip('should copy files for each resolution', function(done) {
    // TODO : Setup a case where one resolution does not copy and the other does
  });
  it.skip('should merge files for each resolution', function(done) {
    // TODO : Setup a case where one resolution should merge the the other should not
  });
});
