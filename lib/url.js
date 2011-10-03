
/*!
 * Stylus - plugin - url
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var stylus = require('stylus')
  , Compiler = stylus.Compiler
  , nodes = stylus.nodes
  , parse = require('url').parse
  , extname = require('path').extname
  , utils = stylus.utils
  , fs = require('fs');

/**
 * Mime table.
 */

var mimes = {
    '.gif': 'image/gif'
  , '.png': 'image/png'
  , '.jpg': 'image/jpeg'
  , '.jpeg': 'image/jpeg'
  , '.svg': 'image/svg+xml'
};

/**
 * Return a url() function with the given `options`.
 *
 * Options:
 *
 *    - `limit` bytesize limit defaulting to 30Kb
 *    - `paths` image resolution path(s), merged with general lookup paths
 *
 * Examples:
 *
 *    stylus(str)
 *      .set('filename', __dirname + '/css/test.styl')
 *      .define('url', stylus.url({ paths: [__dirname + '/public'] }))
 *      .render(function(err, css){ ... })
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function(options) {
  options = options || {};

  var sizeLimit = options.limit || 30000
    , _paths = options.paths || [];

  function url(url){
    // Inject the merge filter. This executes after the AST as been finalized and will
    // merge any duplicate data URI instances.
    if (!this.imagesSeen) {
      this.imagesSeen = {};
      this.root.nodes.push(new nodes.Call('merge-urls', new nodes.Arguments()));
    }

    // Compile the url
    var compiler = new Compiler(url);
    compiler.isURL = true;
    var url = url.nodes.map(function(node){
      return compiler.visit(node);
    }).join('');

    this.imagesSeen[url.href] = (this.imagesSeen[url.href] || 0) + 1;

    // Parse literal 
    var url = parse(url)
      , ext = extname(url.pathname)
      , mime = mimes[ext]
      , literal = new nodes.Literal('url("' + url.href + '")')
      , paths = _paths.concat(this.paths)
      , founds
      , buf;

    // Not supported
    if (!mime) return literal;

    // Absolute
    if (url.protocol) return literal;

    // Lookup
    found = utils.lookup(url.pathname, paths);

    // Failed to lookup
    if (!found) return literal;

    // Read data
    buf = fs.readFileSync(found);

    // To large
    if (buf.length > sizeLimit) return literal;

    // Encode
    var ret = new nodes.Literal('url("data:' + mime + ';base64,' + buf.toString('base64') + '")');
    ret.url = url;
    ret.clone = function() {
      var ret = nodes.Literal.prototype.clone.call(this);
      ret.url = url;
      return ret;
    };
    return ret;
  };

  url.raw = true;
  return url;
};