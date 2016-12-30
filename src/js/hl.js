(function(document, hljs) {
  var els = document.querySelectorAll('pre code');
  Array.prototype.forEach.call(els, function(el) {
    hljs.highlightBlock(el);
  });
})(window.document, window.hljs);
