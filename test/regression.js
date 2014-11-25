var stylus = require('stylus'),
    stylusImage = require('..');

describe('regressions', function() {  
  it('GH-3: should not throw if file has keyframes', function(done) {
    runTest(
        '@keyframes progress-bar-stripes\n'
      + '  from\n'
      + '    background-position 40px 0\n'
      + '\n'
      + '.test2\n'
      + '  background-image url("/foo.png")\n',

      '.test2 {\n'
      + '  background-image: url(\"/foo.png\");\n'
      + '}\n'
      + '@-moz-keyframes progress-bar-stripes {\n'
      + '  from {\n'
      + '    background-position: 40px 0;\n'
      + '  }\n'
      + '}\n'
      + '@-webkit-keyframes progress-bar-stripes {\n'
      + '  from {\n'
      + '    background-position: 40px 0;\n'
      + '  }\n'
      + '}\n'
      + '@-o-keyframes progress-bar-stripes {\n'
      + '  from {\n'
      + '    background-position: 40px 0;\n'
      + '  }\n'
      + '}\n'
      + '@keyframes progress-bar-stripes {\n'
      + '  from {\n'
      + '    background-position: 40px 0;\n'
      + '  }\n'
      + '}\n'
      + '',

      done);
  });
});

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
