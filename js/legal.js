/* Mogli — legal.js (privacy-policy.html): scroll progress bar, mobile menu closing, placeholder links. */
(function () {
  'use strict';
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var collapseEl = qs('#mainNav');
  qsa('.nav-link:not(.dropdown-toggle), .dropdown-item, .nav-actions .btn', collapseEl).forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.bootstrap && collapseEl.classList.contains('show')) window.bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
    });
  });
  qsa('a[data-placeholder-link]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
  var nav = qs('#siteNav');
  if (nav) {
    var sync = function () { nav.classList.toggle('is-scrolled', window.scrollY > 12); };
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }
  var bar = qs('.scroll-progress');
  function tick() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
  }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
  tick();
})();

/* Local preview helper: opened straight from disk (file://), folder links such as solutions-for/dmcs/ would list a folder, so point them at index.html. On a web server nothing changes. */
(function () {
  if (location.protocol !== 'file:') return;
  Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (a) {
    var h = a.getAttribute('href');
    var m = h.match(/^([^#?]*\/)(#.*)?$/);
    if (m && !/^[a-z]+:/i.test(h)) a.setAttribute('href', m[1] + 'index.html' + (m[2] || ''));
  });
})();
