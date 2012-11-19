/*jshint laxcomma: true */

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
  , path = require('path')
  , basename = path.basename
  , dirname = path.dirname
  , extname = path.extname
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

  var _paths = options.paths || [],
      imageCount = 0;

  function url(url) {
    // Inject the merge filter. This executes after the AST as been finalized and will
    // merge any duplicate data URI instances.
    if (!this.imagesSeen) {
      this.imagesSeen = {};
      this.root.nodes.push(new nodes.Call('merge-urls', new nodes.Arguments()));
    }

    // Compile the url
    var compiler = new Compiler(url);
    compiler.isURL = true;
    var url = url.nodes.map(function(node) {
      return compiler.visit(node);
    }).join('');

    // Parse literal
    var url = parse(url)
      , mime = mimes[extname(url.pathname)];

    // Not supported MIME or absolute URL
    if (!mime || url.protocol) {
      return literalNode(url.href);
    }

    // Allow third parties to override our naming conventions. This is useful if the 3rd party
    // knows of a situation where includes at one level may mask includes at another level.
    var name = url.href;
    if (options.nameResolver) {
      name = options.nameResolver.call(this, url);
    }

    var imageInfo = this.imagesSeen[name] = (this.imagesSeen[name] || {count: 0, id: imageCount++});
    imageInfo.count++;
    if (imageInfo.literal) {
      return imageInfo.literal.clone();
    }

    // Lookup
    var lookup = imageInfo.resolutions = lookupPath(url, _paths.concat(this.paths), options);

    if (!lookup.length) {
      // No resolutions defined
      return imageInfo.literal = literalNode(lookup.href);
    } else if (lookup.length === 1) {
      // Only one output
      return imageInfo.literal = outputPath.call(this, lookup[0], name, options);
    } else {
      // Multiple outputs here, add a placeholder that we can replace on output
      return imageInfo.literal = literalNode('stylusImages://' + imageInfo.id, name);
    }
  }

  url.raw = true;
  return url;
};

function literalNode(href, id) {
  var ret = new nodes.Literal('url("' + href + '")');
  if (id !== undefined) {
    ret.url = id;
    ret.clone = function() {
      var ret = nodes.Literal.prototype.clone.call(this);
      ret.url = this.url;
      return ret;
    };
  }
  return ret;
}

function lookupPath(url, paths, options) {
  var resolutions = options.resolutions || [0],
      original = url.href,
      dir = dirname(url.pathname),
      ext = extname(url.pathname),
      base = basename(url.pathname, ext);

  if (options.res) {
    resolutions = [options.res];
  }

  // Zero is a special case for the base file and 1x
  if (resolutions.indexOf(0) === -1) {
    resolutions = resolutions.slice();
    resolutions.unshift(0);
  }

  resolutions = resolutions.map(function(resolution) {
    var href = url.href,
        highResFileName = base + (resolution ? '@' + resolution + 'x' : '') + ext,
        highResPath = dir + '/' + highResFileName,

        found = utils.lookup(highResPath, paths);

    if (found) {
      // Reset our literal path for the file too large case
      var urlDir = dirname(href) + '/';
      if (urlDir === './') {
        urlDir = '';
      }

      href = urlDir + highResFileName;
    }

    // Remap relative paths
    var filePath = href;
    if (options.externalPrefix && !/^\//.test(href)) {
      href = options.externalPrefix + href;
    }

    return {
      resolution: parseFloat(resolution),
      found: found,
      original: original,
      filePath: filePath,
      href: href
    };
  });

  // Sort so we always have the lowest value providing the default
  resolutions = resolutions.sort(function(a, b) {
    return a.resolution - b.resolution;
  });

  // If an explicit resolution was requested return only that
  if (options.res) {
    resolutions = [selectResolution(options.res, resolutions)];
  }

  return resolutions;
}

function selectResolution(resolution, lookup) {
  return lookup.reduceRight(function(prev, current) {
    if ((Math.abs(prev.resolution - resolution) > Math.abs(current.resolution - resolution))
        || !prev.found) {
      return current;
    } else {
      return prev;
    }
  });
}

function outputPath(resolution, id, options) {
  if (!resolution.found) {
    return literalNode(resolution.href);
  }

  var buf = fs.readFileSync(resolution.found),
      sizeLimit = options.limit || 30000;

  // To large
  if (buf.length > sizeLimit) {

    // If copy files flag is true and not an absolute url
    if (options.copyFiles && !/^\//.test(resolution.filePath)) {
      var relativeDir = dirname(resolution.filePath),
          outputDir = options.outdir || dirname(this.filename),
          components = relativeDir.split('/');

      for (var i = 0; i < components.length; i++) {
        try {
          outputDir += '/' + components[i];
          fs.mkdirSync(outputDir, parseInt('0777', 8));
        } catch (err) {
          if (err.code !== 'EEXIST') {
            throw err;
          }
        }
      }
      fs.writeFileSync(outputDir + '/' + basename(resolution.filePath), buf);
    }
    return literalNode(resolution.href);
  }

  // Encode
  return literalNode('data:' + mimes[extname(resolution.href)] + ';base64,' + buf.toString('base64'), id);
}

module.exports.lookup = lookupPath;
module.exports.selectResolution = selectResolution;
module.exports.output = outputPath;
