var stylus = require('stylus'),
    Visitor = stylus.Visitor
    nodes = stylus.nodes;

var Scanner = module.exports = function Scanner(root, imagesSeen) {
  Visitor.call(this, root);
  this.imagesSeen = imagesSeen;
  this.tree = [];
};

Scanner.prototype.__proto__ = Visitor.prototype;

Scanner.prototype.combine = function() {
  this.visit(this.root);
};

Scanner.prototype.visitLiteral = function(lit) {
};

Scanner.prototype.visitProperty = function(prop) {
  this.visit(prop.expr);
};

Scanner.prototype.visitRoot =
Scanner.prototype.visitBlock = function(block) {
  var nodes = block.nodes;
  for (var i = 0; i < nodes.length; i++) {
    this.visit(nodes[i]);
  }
};
Scanner.prototype.visitArguments =
Scanner.prototype.visitExpression = function(expr) {
  expr.nodes.forEach(function(node) {
    this.visit(node);
  }, this);
};

Scanner.prototype.visitKeyframes = function(node) {
  node.frames.forEach(function(frame) {
    this.visit(frame.block);
  }, this);
};

Scanner.prototype.visitGroup = function(group) {
  this.tree.push(group);
  this.visit(group.block);
  this.tree.pop();
};

Scanner.prototype.visitFontFace =
Scanner.prototype.visitMedia =
Scanner.prototype.visitPage = function(page) {
  this.visit(page.block);
};

Scanner.prototype.visitCall = function(call) {
  call.args.nodes.forEach(function(arg) {
    this.visit(arg);
  }, this);
};

Scanner.prototype.visitImport =
Scanner.prototype.visitJSLiteral =
Scanner.prototype.visitComment =
Scanner.prototype.visitFunction =
Scanner.prototype.visitVariable =
Scanner.prototype.visitCharset =
Scanner.prototype.visitBoolean =
Scanner.prototype.visitRGBA =
Scanner.prototype.visitHSLA =
Scanner.prototype.visitUnit =
Scanner.prototype.visitIdent =
Scanner.prototype.visitString =
Scanner.prototype.visitNull = function() {};
