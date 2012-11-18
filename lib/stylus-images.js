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
  return self;
}

init.plugin = plugin;

module.exports = exports = init;
