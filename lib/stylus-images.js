var Scanner = require('./url-scanner'),
    url = require('./url'),
    stylus = require('stylus'),
      nodes = stylus.nodes;

function mergeUrls() {
  new Scanner(this.root, this.imagesSeen).combine();
  return new nodes.Expression(false);
}

function plugin(options) {
  return function(stylus) {
    stylus.define('url', url(options));
    stylus.define('merge-urls', mergeUrls);
  };
}

function init(source, options) {
  var imageOptions = (options || {}).images || {};

  var self = stylus(source, options)
        .use(plugin(imageOptions));
  var _render = self.render;

  self.render = function(fn) {
    _render.call(this, function(err, data) {
      if (!err) {
        var ret = {},
            imagesSeen = self.evaluator.imagesSeen,
            imagesIncluded = [];
        (imageOptions.resolutions || [imageOptions.res || 1]).forEach(function(resolution) {
          ret[resolution] = data.replace(/url\("stylusImages:\/\/(\d+)"\)/g, function(value, id) {
            // Replace image content
            id = parseInt(id, 10);

            var image;
            for (var name in imagesSeen) {
              if (imagesSeen[name].id === id) {
                image = imagesSeen[name];
              }
            }
            if (!image) {
              return value;
            }

            image = url.selectResolution(resolution, image.resolutions);
            imagesIncluded.push(image);
            return url.output(image, '', imageOptions).val;
          });
        });
        data = ret;


        if (self.options.externals) {
          self.options.externals.push.apply(self.options.externals, imagesIncluded);
        }
      }
      fn(err, data);
    });
  };
  return self;
}

init.plugin = plugin;
init.stylus = stylus;

module.exports = exports = init;
