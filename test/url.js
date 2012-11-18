var stylus = require('stylus'),
    stylusImage = require('..');

function runTest(test, expected, done, options) {
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

describe('url', function() {
  it('should insert externalPrefix value on relative paths', function(done) {
    runTest(
        '.test1\n'
      + '  background-image url("foo.png")\n'
      + '.test2\n'
      + '  background-image url("/foo.png")\n'
      + '.test3\n'
      + '  background-image url("//test/foo.png")\n'
      + '.test4\n'
      + '  background-image url("http://test/foo.png")\n',

        '.test1 {\n'
      + '  background-image: url("/prefix/foo.png");\n'
      + '}\n'
      + '.test2 {\n'
      + '  background-image: url("/foo.png");\n'
      + '}\n'
      + '.test3 {\n'
      + '  background-image: url("//test/foo.png");\n'
      + '}\n'
      + '.test4 {\n'
      + '  background-image: url("http://test/foo.png");\n'
      + '}\n',

      done, {
        externalPrefix: '/prefix/'
      });
  });
});
