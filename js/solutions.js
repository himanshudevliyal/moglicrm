/* ==========================================================================
   Mogli — solutions.js  (solutions-dmcs.html)
   Nav helpers, scroll progress, reveals, count-ups, zig-zag motion, sideways card row, FAQ.
   Everything is readable without GSAP: if it fails to load, the "js" class is removed again.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navigation: close the mobile menu after a choice, keep "#" placeholders from jumping ---------- */
  function initNav() {
    var collapseEl = qs('#mainNav');
    qsa('.nav-link:not(.dropdown-toggle), .dropdown-item, .nav-actions .btn', collapseEl).forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.bootstrap && collapseEl.classList.contains('show')) window.bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
      });
    });
    qsa('a[data-placeholder-link]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
    // Solid bar once the page has moved, so links never sit on top of scrolling content
    var nav = qs('#siteNav');
    if (nav) {
      var sync = function () { nav.classList.toggle('is-scrolled', window.scrollY > 12); };
      window.addEventListener('scroll', sync, { passive: true });
      sync();
    }
  }

  /* ---------- Sideways card row: arrow buttons move to the next card ---------- */
  function initPainRow() {
    var scroller = qs('#painScroller');
    if (!scroller) return;
    var cards = qsa('[data-pcard]', scroller);
    qsa('.pcard__go', scroller).forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        var next = cards[i + 1] || cards[0];
        scroller.scrollTo({ left: next.offsetLeft - cards[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- FAQ accordion (one open at a time); styles come from style.css ---------- */
  function initFaq() {
    var list = qs('.faq', qs('.sol-faq'));
    if (!list) return;
    list.classList.add('faq--ready');
    var items = qsa('.faq__item', list);
    items.forEach(function (item) {
      var btn = qs('.faq__q', item);
      btn.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        items.forEach(function (it) {
          var o = it === item && open;
          it.classList.toggle('is-open', o);
          qs('.faq__q', it).setAttribute('aria-expanded', o ? 'true' : 'false');
        });
      });
    });
  }

  /* ---------- Count-up for the figures ---------- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v) + suffix; } });
  }

  /* ---------- Motion ---------- */
  function initMotion() {
    gsap.registerPlugin(ScrollTrigger);

    // Scroll progress bar
    var bar = qs('.scroll-progress');
    if (bar) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

    // Hero: staggered rise-in
    gsap.fromTo(qsa('[data-hero]'), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.1, clearProps: 'transform' });

    // Generic block reveals
    qsa('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    // Cards in grids rise in one after another
    var seen = [];
    qsa('[data-reveal-card]').forEach(function (card) {
      var parent = card.parentNode;
      if (seen.indexOf(parent) !== -1) return;
      seen.push(parent);
      var group = qsa('[data-reveal-card]', parent);
      gsap.fromTo(group, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: parent, start: 'top 85%', once: true } });
    });

    // Pain-point cards slide in from the right, like a row being dealt
    var cards = qsa('[data-pcard]');
    if (cards.length) {
      gsap.from(cards, { autoAlpha: 0, x: 90, duration: 0.95, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.sol-pain__track', start: 'top 82%', once: true } });
    }

    // Zig-zag: text slides in from its own side and the picture rises and settles (the screenshot itself is never scaled or cropped)
    qsa('[data-zz]').forEach(function (item) {
      var flip = item.classList.contains('zz__item--flip');
      var text = qs('[data-zz-text]', item);
      var media = qs('[data-zz-media]', item);
      var tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 78%', once: true } });
      tl.from(text, { autoAlpha: 0, x: flip ? 60 : -60, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, 0)
        .from(media, { autoAlpha: 0, y: 70, scale: 0.94, duration: 1.05, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, 0.08);
    });

    // Count-ups
    qsa('[data-count]').forEach(function (el) {
      el.textContent = '0' + (el.getAttribute('data-suffix') || '');
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { countUp(el); } });
    });

    // Marquee: gentle speed-up with scroll velocity (CSS keyframes keep it running otherwise)
    var track = qs('.marquee__track');
    if (track && !reduce) {
      var mq = qs('.marquee');
      mq.classList.add('is-gsap');
      var loop = gsap.to(track, { xPercent: -50, duration: 55, ease: 'none', repeat: -1 });
      var setTS = gsap.quickTo(loop, 'timeScale', { duration: 0.6, ease: 'power3.out' });
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) { setTS(1 + Math.min(Math.abs(self.getVelocity()) / 400, 5)); } });
    }
  }

  function boot() {
    initNav();
    initPainRow();
    initFaq();
    if (!hasGsap) {
      root.classList.remove('js');
      console.warn('[Mogli] GSAP or ScrollTrigger failed to load. Showing the static layout.');
      return;
    }
    if (reduce) { root.classList.remove('js'); return; }
    initMotion();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
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
