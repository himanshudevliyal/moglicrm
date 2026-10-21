/* Mogli — feature.js (feature pages). Nav, FAQ and reveals come from solutions.js; this only
   highlights the current step in the sticky "how it works" list. Works without it (plain anchors). */
(function () {
  'use strict';
  var links = Array.prototype.slice.call(document.querySelectorAll('.how__nav a'));
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  if (!links.length || !steps.length || !('IntersectionObserver' in window)) return;
  var set = function (id) {
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) set(e.target.id); });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  steps.forEach(function (s) { io.observe(s); });
  set(steps[0].id);
})();
