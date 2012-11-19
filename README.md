# stylus-images

[![Build Status](https://secure.travis-ci.org/kpdecker/stylus-images.png?branch=master)](http://travis-ci.org/kpdecker/stylus-images)

Image linking utilities for Stylus.

 * Merges duplicated data URIs
 * Loads resolution dependent images when available
 * Moves non-inlined relative url's into the output directory


## Release Notes

### Version 1.0

- Rework the API to support multiple file output from a single stylus execution.

Old stylus plugin-based implementation is still an option using `require('stylus-images').plugins`

New implementations should use the stylus-image object in place of direct stylus calls:

```javascript
  var stylusImages = require('stylus-images');

  var compiler = stylusImages('some stylus', {
    images: {
      limit: 123,
      resolutions: [1, 2]
    }
  });
  compiler.set('compress', true);
  compiler.render(function(err, data) {
    writeFile('css.css', data['1']);
    writeFile('css@1.5.css', data['1.5']);
    writeFile('css@2x.css', data['2']);
  });
```
