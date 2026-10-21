/* ==========================================================================
   Mogli landing — main.js
   Requires: GSAP 3 + ScrollTrigger (loaded from CDN in index.html), Bootstrap 5 bundle.

   Sections
     0. Config
     1. Helpers
     2. Image slots (dashboard + tab previews)
     3. Navigation
     4. Platform tabs
     5. Rotating statements
     5b. Orbit section (logo + revolving photos)
     5c. Sky stages (cloud panel, pill tabs, browser window)
     5d. Tools bento grid
     5e. Rail (scroll-driven expanding cards: #ops)
     5f. Hub (one software, many modules: #hub)
     6. Hero entrance timeline
     7. Scroll choreography (scene parallax, dashboard rise, reveals)
     8. Boot
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ----------------------------------------------------------------------
     0. CONFIG — tweak timings here
     ---------------------------------------------------------------------- */
  var CONFIG = {
    statementInterval: 3.4,     // seconds a phrase stays on screen
    scrub: 0.8                  // scroll smoothing for the dashboard rise; higher = more inertia
  };

  /* ----------------------------------------------------------------------
     1. HELPERS
     ---------------------------------------------------------------------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /**
   * A small, pausable loop: run step() (returns a GSAP timeline), wait `interval`, repeat.
   * Pausable so we can stop it when the hero is off-screen or the tab is hidden.
   */
  function createRotator(step, interval) {
    var current = null, paused = true, started = false;

    function schedule() {
      current = gsap.delayedCall(interval, run);
      if (paused) current.pause();
    }
    function run() {
      current = step();
      current.eventCallback('onComplete', schedule);
      if (paused) current.pause();
    }

    return {
      start: function () { if (started) return; started = true; paused = false; schedule(); },
      pause: function () { paused = true; if (current) current.pause(); },
      resume: function () { if (!started) return; paused = false; if (current) current.resume(); }
    };
  }

  /* ----------------------------------------------------------------------
     2. IMAGE SLOTS
     Each frame takes its image's own proportions, so any screenshot ratio works without cropping.
     If the hero dashboard file is missing, a dashed placeholder explains where to put it.
     ---------------------------------------------------------------------- */
  function bindImageRatio(img, cssVar, onMissing) {
    function onLoad() {
      if (!img.naturalWidth || !img.naturalHeight) { if (onMissing) onMissing(); return; }
      root.style.setProperty(cssVar, (img.naturalWidth / img.naturalHeight).toFixed(4));
      if (hasGsap) ScrollTrigger.refresh();        // frame height may have changed, so re-measure triggers
    }
    img.addEventListener('load', onLoad);
    if (onMissing) img.addEventListener('error', onMissing);
    if (img.complete) onLoad();
  }

  function initImageSlots() {
    var frame = qs('.dash-frame');
    var img = qs('.dash-frame__img');
    if (frame && img) {
      bindImageRatio(img, '--dash-ar', function () { frame.classList.add('is-missing'); });
      img.addEventListener('load', function () { if (img.naturalWidth) frame.classList.remove('is-missing'); });
    }
    // The tab previews share one frame, so the first screenshot decides its ratio.
    var firstShot = qs('.pshot');
    if (firstShot) bindImageRatio(firstShot, '--tab-ar');
  }

  /* ----------------------------------------------------------------------
     3. NAVIGATION
     ---------------------------------------------------------------------- */
  function initNav() {
    var nav = qs('#siteNav');
    var collapseEl = qs('#mainNav');

    // Transparent at the top, frosted white bar after a short scroll.
    if (hasGsap) {
      ScrollTrigger.create({
        start: 24, end: 1e7,                      // (not 'max': that would switch the bar off again at the very bottom)
        toggleClass: { targets: nav, className: 'is-scrolled' }
      });
    } else {
      var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 24); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // Close the mobile menu after choosing a link.
    qsa('.nav-link:not(.dropdown-toggle), .dropdown-item, .nav-actions .btn', collapseEl).forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.bootstrap && collapseEl.classList.contains('show')) {
          window.bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
        }
      });
    });

    // Placeholder links ("#") should not jump to the top of the page.
    qsa('a[data-placeholder-link]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); });
    });
  }

  /* ----------------------------------------------------------------------
     4. PLATFORM TABS
     Tabs, screenshots and feature sets are linked by the data-tab / data-shot / data-set keys.
     The cross-fade itself is pure CSS (see .pshot / .pfeature), so it works without GSAP too.
     ---------------------------------------------------------------------- */
  var platformRail = null, platformSelect = null;

  function initTabs() {
    var tabs = qsa('.ptab');
    if (!tabs.length) return;

    var panel = qs('#platformPanel');
    var strip = qs('.ptabs-scroll');
    var shots = qsa('.pshot');
    var sets = qsa('.pfeatures__set');

    function bringIntoView(tab) {
      // Only matters when the strip scrolls sideways (tablet / phone). Scrolls the strip, never the page.
      if (strip.scrollWidth <= strip.clientWidth + 1) return;
      var s = strip.getBoundingClientRect(), t = tab.getBoundingClientRect();
      var left = strip.scrollLeft + (t.left - s.left) - (strip.clientWidth - t.width) / 2;
      strip.scrollTo({ left: left, behavior: reduceMotionQuery.matches ? 'auto' : 'smooth' });
    }

    function select(tab, moveFocus, fromRail) {
      var key = tab.getAttribute('data-tab');

      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      shots.forEach(function (el) { el.classList.toggle('is-active', el.getAttribute('data-shot') === key); });
      sets.forEach(function (el) {
        var on = el.getAttribute('data-set') === key;
        el.classList.toggle('is-active', on);
        if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
      });

      panel.setAttribute('aria-labelledby', tab.id);
      if (moveFocus) tab.focus({ preventScroll: true });
      bringIntoView(tab);
      // A click / key press while the scroll runway is on also moves the page to that tab's slice.
      if (!fromRail && platformRail) platformRail.goTo(tabs.indexOf(tab));
    }

    platformSelect = function (i) { select(tabs[i], false, true); };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });

      // Arrow keys / Home / End move between tabs (WAI-ARIA tabs pattern)
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }

  /* ----------------------------------------------------------------------
     5. ROTATING STATEMENTS
     Six phrases share one grid cell (no layout shift). Each one fades and slides vertically.
     ---------------------------------------------------------------------- */
  var statementRotator = null;
  var statementItems = [];

  function initStatements() {
    statementItems = qsa('.statement');
    if (!statementItems.length) return;
    var items = statementItems;
    var index = 0;

    // The first phrase is revealed by the intro timeline; the others wait below.
    gsap.set(items, { autoAlpha: 0, y: 14 });

    if (reduceMotionQuery.matches) return;       // static: first phrase only (shown by playIntro)

    function step() {
      var current = items[index];
      var nextIndex = (index + 1) % items.length;
      var next = items[nextIndex];

      return gsap.timeline()
        .to(current, { autoAlpha: 0, y: -12, duration: 0.5, ease: 'power2.in' })
        .add(function () {
          current.classList.remove('is-active');
          current.setAttribute('aria-hidden', 'true');
          next.classList.add('is-active');
          next.removeAttribute('aria-hidden');
          gsap.set(next, { y: 14 });
          index = nextIndex;
        })
        .to(next, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out' });
    }

    statementRotator = createRotator(step, CONFIG.statementInterval);
  }

  /* Runs/pauses the loop based on: intro finished, hero on screen, tab visible. */
  var loopState = { introDone: false, heroVisible: true };
  function syncRotators() {
    var run = loopState.introDone && loopState.heroVisible && !document.hidden;
    if (statementRotator) statementRotator[run ? 'resume' : 'pause']();
  }

  /* ----------------------------------------------------------------------
     5b. ORBIT SECTION
     Two rings of photos revolve on ellipses behind the centre logo.
     - Positions are computed every frame (angle -> x/y on an ellipse), so the loop never jumps.
     - Depth: photos at the "front" of the ellipse are larger and clearer, those at the "back" smaller and softer.
     - Scrolling speeds the rotation up, hovering slows it, the pointer shifts each ring a little (parallax).
     - Pauses when off-screen. Reduced motion / no GSAP: a static, well-spaced arrangement.
     ---------------------------------------------------------------------- */
  var ORBIT = {
    desktop: { a: { rx: 0.335, ry: 0.30 }, b: { rx: 0.455, ry: 0.43 } },   // radii as a fraction of stage width / height
    mobile:  { a: { rx: 0.41,  ry: 0.30 }, b: { rx: 0.54,  ry: 0.43 } },
    depth:   { a: { smin: 0.8, smax: 1.12, omin: 0.78 }, b: { smin: 0.68, smax: 0.92, omin: 0.6 } }
  };

  function initOrbit(animate) {
    var section = qs('#orbit');
    if (!section) return;
    var stage = qs('.orbit__stage', section);
    var logo = qs('.orbit__logo', section);
    var TAU = Math.PI * 2;

    var rings = qsa('.orbit__ring', section).map(function (el) {
      var key = el.getAttribute('data-ring');
      var items = qsa('.orbit__item', el);
      var phase = parseFloat(el.getAttribute('data-phase')) || 0;
      return {
        el: el, key: key, items: items, p: 0, rx: 0, ry: 0,
        dir: parseFloat(el.getAttribute('data-dir')) || 1,
        loop: parseFloat(el.getAttribute('data-loop')) || 90,     // seconds per full revolution
        base: items.map(function (_, i) { return phase + (i / items.length) * TAU; }),
        d: ORBIT.depth[key]
      };
    });

    var W = 0, H = 0;
    var state = { spread: animate ? 0 : 1 };       // 0 = everything stacked in the centre, 1 = fully spread out

    function measure() {
      var r = stage.getBoundingClientRect();
      W = r.width; H = r.height;
      var cfg = W < 768 ? ORBIT.mobile : ORBIT.desktop;
      rings.forEach(function (ring) { ring.rx = cfg[ring.key].rx * W; ring.ry = cfg[ring.key].ry * H; });
    }

    function render() {
      var spread = state.spread;
      rings.forEach(function (ring) {
        ring.items.forEach(function (el, i) {
          var th = ring.base[i] + ring.dir * ring.p * TAU;
          var s = Math.sin(th), c = Math.cos(th);
          var depth = (s + 1) / 2;                                              // 0 = back (top), 1 = front (bottom)
          var scale = (ring.d.smin + (ring.d.smax - ring.d.smin) * depth) * (0.55 + 0.45 * spread);
          var opacity = (ring.d.omin + (1 - ring.d.omin) * depth) * spread;
          el.style.transform = 'translate(-50%,-50%) translate3d(' + (c * ring.rx * spread).toFixed(1) + 'px,' +
            (s * ring.ry * spread).toFixed(1) + 'px,0) rotate(' + (c * 3).toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';
          el.style.opacity = opacity.toFixed(3);
          el.style.zIndex = Math.round(depth * 100);
        });
      });
    }

    measure();
    render();
    if (window.ResizeObserver) {
      new ResizeObserver(function () { measure(); render(); }).observe(stage);
    } else {
      window.addEventListener('resize', function () { measure(); render(); });
    }

    if (!animate) { logo.style.opacity = 1; return; }

    /* ---------- Motion ---------- */
    var revealed = false, active = false;
    var speed = 1;                 // current rotation speed multiplier (eased)
    var boost = 1;                 // extra speed from scrolling; decays back to 1
    var hoverMul = 1;              // 0.35 while the pointer is over the stage

    gsap.ticker.add(function (time, deltaTime) {
      if (!revealed || !active) return;
      var dt = Math.min(deltaTime, 64) / 1000;
      speed += (boost * hoverMul - speed) * Math.min(1, dt * 4);
      boost += (1 - boost) * Math.min(1, dt * 1.4);
      rings.forEach(function (ring) { ring.p = (ring.p + (dt * speed) / ring.loop) % 1; });
      render();
    });

    ScrollTrigger.create({
      trigger: section, start: 'top bottom', end: 'bottom top',
      onToggle: function (self) { active = self.isActive; },
      onUpdate: function (self) {
        boost = Math.max(boost, 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5));
      }
    });

    // Entrance: photos fly out from behind the logo into their orbit, then the loop starts.
    ScrollTrigger.create({
      trigger: section, start: 'top 72%', once: true,
      onEnter: function () {
        revealed = true;
        gsap.to(logo, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' });
        gsap.to(state, { spread: 1, duration: 2.2, ease: 'power3.out', onUpdate: render });
      }
    });
    gsap.set(logo, { y: 22 });

    // Hover slows the orbit a little so a photo is easier to look at.
    stage.addEventListener('pointerenter', function () { hoverMul = 0.35; });
    stage.addEventListener('pointerleave', function () { hoverMul = 1; });

    // Pointer parallax: rings drift in opposite directions, the logo barely moves. Mouse / pen only.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var ringA = rings.filter(function (r) { return r.key === 'a'; })[0].el;
      var ringB = rings.filter(function (r) { return r.key === 'b'; })[0].el;
      var move = {
        a: [gsap.quickTo(ringA, 'x', { duration: 1.4, ease: 'power3' }), gsap.quickTo(ringA, 'y', { duration: 1.4, ease: 'power3' })],
        b: [gsap.quickTo(ringB, 'x', { duration: 1.8, ease: 'power3' }), gsap.quickTo(ringB, 'y', { duration: 1.8, ease: 'power3' })],
        logo: [gsap.quickTo(logo, 'x', { duration: 1.6, ease: 'power3' })]
      };
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        move.a[0](nx * -26); move.a[1](ny * -18);
        move.b[0](nx * 16);  move.b[1](ny * 10);
        move.logo[0](nx * 8);
      });
      stage.addEventListener('pointerleave', function () {
        move.a[0](0); move.a[1](0); move.b[0](0); move.b[1](0); move.logo[0](0);
      });
    }
  }

  /* ----------------------------------------------------------------------
     5c. SKY STAGES (pill tabs + window screenshots)
     Switching is pure CSS (stacked slides / screenshots), so it works without GSAP.
     `animate` adds: sliding thumb easing is CSS; here we add auto-rotate, parallax sky and entrance motion.
     ---------------------------------------------------------------------- */
  function initSky(animate) {
    var section = qs('#stages');
    if (!section) return;
    var segs = qsa('.seg', section);
    var slides = qsa('.sky__slide', section);
    var shots = qsa('.sshot', section);
    var thumb = qs('.segmented__thumb', section);
    var panel = qs('#stagePanel', section);
    var control = qs('.segmented', section);
    var index = 0, timer = null, userPicked = false, hovering = false, visible = false;
    var INTERVAL = 6500;

    function placeThumb() {
      var seg = segs[index];
      if (!seg || !thumb) return;
      thumb.style.width = seg.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + seg.offsetLeft + 'px)';
    }

    function select(i, moveFocus) {
      index = (i + segs.length) % segs.length;
      var key = segs[index].getAttribute('data-stage');
      segs.forEach(function (b, n) {
        var on = n === index;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      slides.forEach(function (el) {
        var on = el.getAttribute('data-slide') === key;
        el.classList.toggle('is-active', on);
        if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
      });
      shots.forEach(function (el) { el.classList.toggle('is-active', el.getAttribute('data-sshot') === key); });
      panel.setAttribute('aria-labelledby', segs[index].id);
      placeThumb();
      if (moveFocus) segs[index].focus({ preventScroll: true });
      if (control.scrollWidth > control.clientWidth + 1) {
        control.scrollTo({ left: segs[index].offsetLeft - (control.clientWidth - segs[index].offsetWidth) / 2, behavior: reduceMotionQuery.matches ? 'auto' : 'smooth' });
      }
    }

    function stopAuto() { if (timer) { clearTimeout(timer); timer = null; } }
    function queueAuto() {
      stopAuto();
      if (!animate || userPicked || hovering || !visible || document.hidden) return;
      timer = setTimeout(function () { select(index + 1, false); queueAuto(); }, INTERVAL);
    }

    segs.forEach(function (b, n) {
      b.addEventListener('click', function () { userPicked = true; stopAuto(); select(n, false); });
      b.addEventListener('keydown', function (e) {
        var to = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = index + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = index - 1;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = segs.length - 1;
        if (to !== null) { e.preventDefault(); userPicked = true; stopAuto(); select(to, true); }
      });
    });

    section.addEventListener('pointerenter', function () { hovering = true; stopAuto(); });
    section.addEventListener('pointerleave', function () { hovering = false; queueAuto(); });
    document.addEventListener('visibilitychange', queueAuto);
    window.addEventListener('resize', placeThumb);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeThumb);
    select(0, false);
    // The thumb should not glide in from the left on first paint.
    if (thumb) { thumb.style.transition = 'none'; placeThumb(); void thumb.offsetWidth; thumb.style.transition = ''; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting; queueAuto();
      }, { threshold: 0.35 }).observe(section);
    }

    if (!animate || !hasGsap) return;

    // Cloud photo drifts slower than the page; window rises into the panel; copy fades up once.
    gsap.fromTo('.sky__bg', { yPercent: -4 }, {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: '.sky__panel', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.from('.skywin', {
      y: 90, autoAlpha: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.sky__panel', start: 'top 55%', once: true }
    });
    gsap.from(['.segmented', '.sky__slide.is-active > *'], {
      y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.sky__panel', start: 'top 75%', once: true }
    });
  }

  /* ----------------------------------------------------------------------
     5d. TOOLS BENTO
     Role chips switch the stacked copy / steps variants (CSS cross-fade). Each card animates once when it enters.
     ---------------------------------------------------------------------- */
  function initTools(animate) {
    var section = qs('#tools');
    if (!section) return;
    var chips = qsa('.tchip', section);
    var variants = qsa('.tvariant', section);
    var hero = qs('#toolsHero', section);

    function select(chip, moveFocus) {
      var key = chip.getAttribute('data-variant');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-selected', on ? 'true' : 'false');
        c.tabIndex = on ? 0 : -1;
      });
      variants.forEach(function (el) {
        var on = el.getAttribute('data-variant') === key;
        el.classList.toggle('is-active', on);
        if (el.querySelector('.mock')) { el.setAttribute('aria-hidden', 'true'); }
        else if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
      });
      hero.setAttribute('aria-labelledby', chip.id);
      if (moveFocus) chip.focus({ preventScroll: true });
      if (animate && hasGsap) {
        var items = qsa('.tvariant.is-active .steps li', hero);
        gsap.fromTo(items, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity,visibility', overwrite: 'auto' });
      }
    }

    chips.forEach(function (chip, i) {
      chip.addEventListener('click', function () { select(chip, false); });
      chip.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = chips[(i + 1) % chips.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = chips[(i - 1 + chips.length) % chips.length];
        else if (e.key === 'Home') next = chips[0];
        else if (e.key === 'End') next = chips[chips.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });

    if (!animate || !hasGsap) return;

    function enter(trigger, build) {
      ScrollTrigger.create({ trigger: trigger, start: 'top 82%', once: true, onEnter: build });
    }
    var ease = 'power3.out';
    var CLEAR = 'transform,opacity,visibility';

    // Cards rise in; clearProps keeps the CSS hover lift working afterwards.
    qsa('.tcard', section).forEach(function (card) {
      gsap.from(card, {
        y: 40, autoAlpha: 0, duration: 0.9, ease: ease, clearProps: CLEAR,
        scrollTrigger: { trigger: card, start: 'top 90%', once: true }
      });
    });

    // Steps card: items appear one by one, ticks pop on the completed ones.
    enter('.tcard--hero', function () {
      var tl = gsap.timeline({ delay: 0.25 });
      tl.from('.tvariant.is-active .steps li', { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: ease, clearProps: CLEAR })
        .from('.tvariant.is-active .steps li.is-done .steps__dot', { scale: 0, duration: 0.4, stagger: 0.12, ease: 'back.out(2.2)', clearProps: 'transform' }, 0.35);
    });

    // Collaboration: bubbles slide in, name tags pop.
    enter('.tcard--thread', function () {
      var tl = gsap.timeline({ delay: 0.25 });
      tl.from('.tcard--thread .msg', { x: -22, autoAlpha: 0, duration: 0.65, stagger: 0.25, ease: ease, clearProps: CLEAR })
        .from('.tcard--thread .reply', { y: 10, autoAlpha: 0, duration: 0.5, ease: ease, clearProps: CLEAR }, '>-0.1')
        .from('.tcard--thread .ctag', { scale: 0.4, autoAlpha: 0, duration: 0.5, stagger: 0.2, ease: 'back.out(2)', clearProps: CLEAR }, 0.2);
    });

    // Workflows: nodes appear, connector lines draw.
    enter('.tcard--flow', function () {
      var tl = gsap.timeline({ delay: 0.25 });
      tl.from('.fnode', { scale: 0.85, autoAlpha: 0, duration: 0.55, stagger: 0.18, ease: 'back.out(1.6)', clearProps: CLEAR })
        .from('.fline--v', { scaleY: 0, duration: 0.6, stagger: 0.12, ease: 'power2.inOut' }, 0.35)
        .from('.fline--h', { scaleX: 0, duration: 0.6, stagger: 0.12, ease: 'power2.inOut' }, 0.45);
    });

    // Records: rows slide in, ticks pop.
    enter('.tcard--records', function () {
      var tl = gsap.timeline({ delay: 0.25 });
      tl.from('.tcard--records .trow', { y: 12, autoAlpha: 0, duration: 0.5, stagger: 0.09, ease: ease, clearProps: CLEAR })
        .from('.tcard--records .tick', { scale: 0, duration: 0.35, stagger: 0.09, ease: 'back.out(2.4)', clearProps: 'transform' }, 0.3);
    });

    // Suppliers: tiles pop in a wave, then the highlighted one pulses once.
    enter('.tcard--suppliers', function () {
      gsap.from('.ttile', { scale: 0.5, autoAlpha: 0, duration: 0.55, stagger: { each: 0.06, from: 'start' }, ease: 'back.out(1.8)', delay: 0.25, clearProps: CLEAR });
      gsap.fromTo('.ttile--hi', { scale: 1 }, { scale: 1.12, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut', delay: 1.2, clearProps: 'transform' });
    });

    // Reports: donut draws, number counts up.
    enter('.tcard--reports', function () {
      var arc = qs('.donut__arc'), num = qs('[data-count]');
      var target = parseFloat(num.getAttribute('data-count')) || 0;
      var full = 251.3, end = full * (1 - target / 100);
      var counter = { v: 0 };
      gsap.fromTo(arc, { strokeDashoffset: full }, { strokeDashoffset: end, duration: 1.4, ease: 'power3.out', delay: 0.3 });
      gsap.to(counter, { v: target, duration: 1.4, ease: 'power3.out', delay: 0.3, onUpdate: function () { num.textContent = Math.round(counter.v); }, onComplete: function () { num.textContent = target; } });
      gsap.from('.donut__legend li', { x: 14, autoAlpha: 0, duration: 0.5, stagger: 0.1, ease: ease, delay: 0.5, clearProps: CLEAR });
    });
  }

  /* ----------------------------------------------------------------------
     5e. RAIL: scroll-driven switching for the "built for" tabs and the ops accordion
     On desktop the section becomes a tall runway with a sticky stage (CSS: .rail.is-rail). ScrollTrigger only
     reads the progress through the runway and tells the section which item is active. No pin, no scroll hijacking.
     Elsewhere (phones, short screens, reduced motion, no GSAP) the controls simply work on click.
     ---------------------------------------------------------------------- */
  function createRail(section, count, onIndex, animate) {
    var mq = window.matchMedia('(min-width: 992px) and (min-height: 720px)');
    var st = null, locked = false, lockTimer = null, last = -1;

    function report(i) { if (i !== last) { last = i; onIndex(i); } }

    function setup() {
      if (st) { st.kill(); st = null; }
      var on = animate && hasGsap && mq.matches;
      section.classList.toggle('is-rail', on);
      if (!on) return;
      section.style.setProperty('--rail-n', count);
      st = ScrollTrigger.create({
        trigger: section, start: 'top top', end: 'bottom bottom',
        onUpdate: function (self) {
          if (locked) return;
          report(Math.min(count - 1, Math.floor(self.progress * count)));
        }
      });
      ScrollTrigger.refresh();
    }

    if (mq.addEventListener) mq.addEventListener('change', setup); else if (mq.addListener) mq.addListener(setup);
    setup();

    return {
      // Called by a click / key press: move the page to that item's slice of the runway and select it right away.
      goTo: function (i) {
        if (st) {
          locked = true; clearTimeout(lockTimer);
          var y = st.start + ((i + 0.5) / count) * (st.end - st.start);
          window.scrollTo({ top: y, behavior: reduceMotionQuery.matches ? 'auto' : 'smooth' });
          lockTimer = setTimeout(function () { locked = false; }, 1000);
        }
        report(i);
      },
      markSelected: function (i) { last = i; }
    };
  }

  function initOps(animate) {
    var section = qs('#ops');
    if (!section) return;
    var cards = qsa('.hcard', section);
    var tabs = qsa('.hcard__tab', section);
    var bodies = qsa('.hcard__body', section);
    var rail = null;

    function select(i) {
      cards.forEach(function (c, n) {
        var on = n === i;
        c.classList.toggle('is-open', on);
        tabs[n].setAttribute('aria-expanded', on ? 'true' : 'false');
        if (on) bodies[n].removeAttribute('aria-hidden'); else bodies[n].setAttribute('aria-hidden', 'true');
      });
      if (animate && hasGsap) {
        gsap.fromTo(qsa('.hcard.is-open .hcard__list li', section),
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07, delay: 0.2, ease: 'power3.out', clearProps: 'transform,opacity,visibility', overwrite: 'auto' });
      }
    }

    rail = createRail(section, cards.length, select, animate);
    rail.markSelected(0);

    // The whole collapsed card is the button, so clicking anywhere on it opens it.
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { rail.goTo(i); });
      t.addEventListener('keydown', function (e) {
        var to = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = Math.min(i + 1, tabs.length - 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = Math.max(i - 1, 0);
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = tabs.length - 1;
        if (to !== null && to !== i) { e.preventDefault(); rail.goTo(to); tabs[to].focus({ preventScroll: true }); }
      });
    });

    if (!animate || !hasGsap) return;
    // Cards slide in from the left, one after another.
    gsap.from('.hcard', {
      x: -60, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.hcards', start: 'top 92%', once: true }
    });
  }

  /* ----------------------------------------------------------------------
     5f. HUB (one software, many modules)
     Lines draw from the centre, nodes pop outward, dots travel along the lines while the section is on screen.
     ---------------------------------------------------------------------- */
  function initHub(animate) {
    var section = qs('#hub');
    if (!section || !animate || !hasGsap) return;
    var paths = qsa('.hub__paths path', section);
    var nodes = qsa('.hnode', section);
    var dots = qsa('.hline__dot', section);
    var core = qs('.hub__core', section);
    var desktop = window.matchMedia('(min-width: 768px)');

    // Static start state for the dots: sitting at the middle of each line.
    dots.forEach(function (d) {
      var x = +d.getAttribute('data-x'), y = +d.getAttribute('data-y');
      d.setAttribute('cx', 600 + (x - 600) * 0.5); d.setAttribute('cy', 280 + (y - 280) * 0.5);
    });

    var travel = [];
    function startDots() {
      if (!desktop.matches || travel.length) return;
      dots.forEach(function (d, i) {
        var x = +d.getAttribute('data-x'), y = +d.getAttribute('data-y');
        var o = { p: 0 };
        travel.push(gsap.to(o, {
          p: 1, duration: 2.6 + (i % 5) * 0.35, delay: (i % 7) * 0.4, repeat: -1, ease: 'sine.inOut',
          onUpdate: function () { d.setAttribute('cx', 600 + (x - 600) * o.p); d.setAttribute('cy', 280 + (y - 280) * o.p); }
        }));
      });
    }
    function setDots(on) { travel.forEach(function (t) { if (on) t.resume(); else t.pause(); }); }

    ScrollTrigger.create({
      trigger: '.hub__stage', start: 'top 80%', once: true,
      onEnter: function () {
        var tl = gsap.timeline();
        tl.from(core, { scale: 0.5, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.8)' })
          .fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: 0.05, ease: 'power2.out' }, 0.3)
          .from(nodes, { scale: 0.3, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'back.out(2)', clearProps: 'transform,opacity,visibility' }, 0.55)
          .add(startDots, 1.4);
      }
    });
    // Dots only travel while the stage is visible.
    ScrollTrigger.create({ trigger: '.hub__stage', start: 'top bottom', end: 'bottom top', onToggle: function (self) { setDots(self.isActive); } });
  }

  /* ----------------------------------------------------------------------
     5g. SCROLL EXTRAS
     Scroll progress bar, split-word headings, logo marquee, count-up numbers, testimonials and FAQ.
     ---------------------------------------------------------------------- */

  /* Headings that slide up word by word. Only text nodes are wrapped, so inline spans inside a heading survive. */
  var SPLIT_SELECTOR = '.platform__intro h2, .tools__head h2, .hub__head h2, .ops__title, .trust__head h2, .benefits__intro h2, .faq__head h2, .cta-band h3';

  function splitHeadings() {
    return qsa(SPLIT_SELECTOR).map(function (h) {
      if (h.dataset.split) return h;
      var label = h.textContent.replace(/\s+/g, ' ').trim();
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.nodeValue.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
              var i = document.createElement('span'); i.className = 'w__i'; i.textContent = part;
              w.appendChild(i); frag.appendChild(w);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n);
        });
      })(h);
      h.setAttribute('aria-label', label);
      h.dataset.split = '1';
      h.removeAttribute('data-reveal');           // the words themselves are the reveal
      return h;
    });
  }

  function initProgress() {
    var bar = qs('.scroll-progress');
    if (!bar || reduceMotionQuery.matches) return;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) { gsap.set(bar, { scaleX: self.progress }); }
    });
  }

  function initFaq() {
    var faq = qs('#faq');
    if (!faq) return;
    faq.classList.add('faq--ready');
    var items = qsa('.faq__item', faq);
    items.forEach(function (item) {
      var btn = qs('.faq__q', item);
      btn.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        items.forEach(function (o) {            // one answer open at a time
          var on = o === item && open;
          o.classList.toggle('is-open', on);
          qs('.faq__q', o).setAttribute('aria-expanded', on ? 'true' : 'false');
        });
      });
    });
    // First answer starts open so the section never looks empty.
    items[0].classList.add('is-open');
    qs('.faq__q', items[0]).setAttribute('aria-expanded', 'true');
  }

  function formatCount(v, dec, suffix) {
    var n = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
    return n + (suffix || '');
  }

  function initTrust(animate) {
    var section = qs('#trust');
    if (!section || !animate || !hasGsap) return;

    /* Marquee: GSAP drives the loop, and scrolling pushes it faster in the direction you scroll. */
    var marquee = qs('[data-marquee]', section);
    var track = qs('.marquee__track', section);
    if (marquee && track) {
      marquee.classList.add('is-gsap');
      var loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 55, repeat: -1 });
      var boost = gsap.quickTo(loop, 'timeScale', { duration: 0.6, ease: 'power3.out' });
      var settle = null;
      ScrollTrigger.create({
        trigger: marquee, start: 'top bottom', end: 'bottom top',
        onToggle: function (self) { if (self.isActive) loop.resume(); else loop.pause(); },
        onUpdate: function (self) {
          var v = gsap.utils.clamp(-3000, 3000, self.getVelocity());
          boost(1 + Math.abs(v) / 450);
          clearTimeout(settle);
          settle = setTimeout(function () { boost(1); }, 140);
        }
      });
      gsap.from(qsa('img', marquee), { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: marquee, start: 'top 92%', once: true } });
    }

    /* Numbers count up once, as they arrive. The final value is already in the markup (no-JS / reduced motion). */
    qsa('[data-count]', section).forEach(function (el) {
      var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10), suf = el.dataset.suffix || '';
      var o = { v: 0 };
      el.textContent = formatCount(0, dec, suf);
      gsap.to(o, {
        v: end, duration: 1.8, ease: 'power2.out',
        onUpdate: function () { el.textContent = formatCount(o.v, dec, suf); },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
    gsap.from(qsa('.stat', section), { autoAlpha: 0, y: 28, duration: 0.8, stagger: 0.1, ease: 'power3.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.stats', start: 'top 90%', once: true } });

    /* Testimonials rise one after another; on desktop the middle card then drifts a little against the others. */
    var quotes = qsa('.quote', section);
    gsap.from(quotes, { autoAlpha: 0, y: 56, duration: 1, stagger: 0.14, ease: 'power3.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.quotes', start: 'top 88%', once: true } });
    gsap.matchMedia().add('(min-width: 992px)', function () {
      gsap.fromTo(quotes[1], { y: 36 }, { y: -36, ease: 'none', scrollTrigger: { trigger: '.quotes', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    });
  }

  /* Platform tabs follow the scroll: the tab block becomes a sticky runway (same rail as #ops). */
  function initPlatformRail(animate) {
    var block = qs('#platformRail');
    if (!block || !platformSelect) return;
    var count = qsa('.ptab').length;
    platformRail = createRail(block, count, function (i) { platformSelect(i); }, animate);
    platformRail.markSelected(0);
  }

  /* MacBook scroll effect (hero showcase). A direct port of the Aceternity "MacBook Scroll" component:
     progress = how far the section has scrolled past the top of the viewport (0 to 1), and the screen's transform
     is written straight from it (no smoothing), using the same keyframes as the original framer-motion code. */
  function initMac(animate) {
    var sec = qs('#showcase');
    var screen = qs('.mac2__screen', sec || document);
    var intro = qs('.mac2__intro', sec || document);
    if (!sec || !screen || !animate || !hasGsap) return;

    function lerp(p, from, to, a, b) {                 // useTransform: linear between keyframes, clamped outside
      if (p <= from) return a;
      if (p >= to) return b;
      return a + (b - a) * ((p - from) / (to - from));
    }

    /* How far the screen slides down. It is sized so that, when the section's bottom reaches the bottom of the
       viewport (progress = 1), the whole enlarged screen sits fully visible and vertically centred under the nav. */
    /* Final size of the screen: as large as the viewport allows (up to 2.1x the lid), never below 1x */
    function endScale(mobile) {
      if (mobile) return 1;
      var byW = (window.innerWidth - 48) / screen.offsetWidth;
      var byH = (window.innerHeight - 64 - 32) / screen.offsetHeight;
      return Math.max(1, Math.min(2.1, byW, byH));
    }

    function travel(mobile) {
      var vh = window.innerHeight;
      var padTop = parseFloat(getComputedStyle(sec).paddingTop) || 0;
      var wrap = qs('.mac2__scale', sec);
      var sc = wrap.offsetWidth ? wrap.getBoundingClientRect().width / wrap.offsetWidth : 1;   // CSS scale of the whole laptop on small screens
      sc = sc > 0 ? Math.min(sc, 1) : 1;
      var fullH = screen.offsetHeight * endScale(mobile) * sc;           // final height of the screen on the page
      var navH = 64;
      var wantTop = Math.max(navH + 12, navH + (vh - navH - fullH) / 2);  // viewport y of the screen's top edge at the end
      return Math.max(0, (sec.offsetHeight - vh - padTop + wantTop) / sc);
    }

    function apply(p) {
      var mobile = window.innerWidth < 768;
      var end = endScale(mobile);
      var scaleX = lerp(p, 0, 0.3, 1.2, end);
      var scaleY = lerp(p, 0, 0.3, 0.6, end);
      var ty = lerp(p, 0, 1, 0, travel(mobile));
      var rot = p <= 0.12 ? -28 : lerp(p, 0.12, 0.3, -28, 0);      // keyframes [0.1, 0.12, 0.3] -> [-28, -28, 0]
      if (intro) {                                    // header text: slides down 100px and fades out over the first 20%
        intro.style.transform = 'translateY(' + lerp(p, 0, 0.3, 0, mobile ? 50 : 100) + 'px)';
        intro.style.opacity = lerp(p, 0, 0.2, 1, 0);
      }
      screen.style.transform = 'translateY(' + ty + 'px) scaleX(' + scaleX + ') scaleY(' + scaleY + ') rotateX(' + rot + 'deg)';
    }

    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
      sec.classList.add('is-live');
      var st = ScrollTrigger.create({
        trigger: sec, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
        onUpdate: function (self) { apply(self.progress); },
        onRefresh: function (self) { apply(self.progress); }
      });
      apply(st.progress);
      ScrollTrigger.refresh();
      return function () { sec.classList.remove('is-live'); screen.style.transform = ''; if (intro) { intro.style.transform = ''; intro.style.opacity = ''; } };
    });
  }

  function initBlog(animate) {
    if (!animate || !hasGsap) return;
    var grid = document.querySelector('.blog__grid');
    if (!grid) return;
  
    gsap.registerPlugin(ScrollTrigger);
  
    // Heading rises in
    gsap.from('.blog__head', { autoAlpha: 0, y: 30, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.blog__head', start: 'top 88%', once: true } });
  
    // List posts stagger in from the left
    gsap.from('.bpost--row', { autoAlpha: 0, x: -50, duration: 0.9, stagger: 0.14, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.blog__list', start: 'top 85%', once: true } });
  
    // Featured post rises and settles, its picture zooms out slightly
    var feature = document.querySelector('.bpost--feature');
    gsap.from(feature, { autoAlpha: 0, y: 60, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: feature, start: 'top 88%', once: true } });
    gsap.from('.bpost--feature .bpost__media img', { scale: 1.15, duration: 1.4, ease: 'power3.out', clearProps: 'transform',
      scrollTrigger: { trigger: feature, start: 'top 88%', once: true } });
  
    // The "#" placeholder links should not jump to the top of the page
    document.querySelectorAll('.blog a[data-placeholder-link]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); });
    });
  }
  

  function initFaqMotion(animate) {
    if (!animate || !hasGsap || !qs('#faq')) return;
    gsap.from(qsa('.faq__item'), { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.09, ease: 'power3.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.faq__list', start: 'top 88%', once: true } });
  }

  function initHeadingReveals(heads) {
    heads.forEach(function (h) {
      gsap.from(qsa('.w__i', h), {
        yPercent: 115, duration: 1, ease: 'power4.out', stagger: 0.05, clearProps: 'transform',
        scrollTrigger: { trigger: h, start: 'top 90%', once: true }
      });
    });
  }

  /* ----------------------------------------------------------------------
     6. HERO ENTRANCE
     ---------------------------------------------------------------------- */
  function playIntro() {
    var titleInner = qs('.hero__title .line__inner');

    // Reduced motion: show everything immediately, no choreography.
    if (reduceMotionQuery.matches) {
      gsap.set(['[data-intro]', titleInner], { autoAlpha: 1, y: 0, yPercent: 0 });
      gsap.set(statementItems.slice(0, 1), { autoAlpha: 1, y: 0 });
      return;
    }

    // The title sits inside an overflow:hidden mask, so it is invisible until it rises.
    gsap.set(titleInner, { yPercent: 115, autoAlpha: 1 });

    var tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: function () {
        loopState.introDone = true;
        if (statementRotator) statementRotator.start();
        syncRotators();
      }
    });

    tl
      // Background settles from a slight zoom (slow, one time only)
      .fromTo('.scene__intro', { scale: 1.06 }, { scale: 1, duration: 3, ease: 'power2.out' }, 0)
      // Navigation
      .fromTo('#siteNav', { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.1)
      // Eyebrow
      .fromTo('.hero__eyebrow', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.3)
      // Headline: smooth upward mask reveal
      .to(titleInner, { yPercent: 0, duration: 1.25, ease: 'power4.out' }, 0.45)
      // Slim pill fades up, then the first phrase slides in
      .fromTo('.hero__statement', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.9)
      .to(statementItems.slice(0, 1), { autoAlpha: 1, y: 0, duration: 0.8 }, 1.15)
      // Description + CTAs, staggered
      .fromTo(['.hero__desc', '.hero__cta'], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.14 }, 1.35);
  }

  /* ----------------------------------------------------------------------
     7. SCROLL CHOREOGRAPHY
     gsap.matchMedia() creates the right animations for the current screen and
     automatically reverts them when the media query changes.
     ---------------------------------------------------------------------- */
  function initScroll() {
    var mm = gsap.matchMedia();

    // matchMedia only runs this callback when at least one named condition matches, so both
    // motion preferences are listed explicitly (otherwise phones with motion on would match nothing).
    mm.add({
      reduce: '(prefers-reduced-motion: reduce)',
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 992px)'
    }, function (ctx) {
      var reduce = ctx.conditions.reduce;
      var desktop = ctx.conditions.desktop;

      /* ---------- Reduced motion: static layout, hills visible ---------- */
      if (reduce) {
        gsap.set('.scene__inner', { yPercent: -14 });
        coverSceneWhenPlatformArrives();
        return;
      }

      /* ---------- Scene parallax (all motion-enabled screens) ----------
         The fixed scene is taller than the screen. Scrolling slides it upward (revealing the hills
         behind the dashboard) and scales it gently. The contrast tint inside it slides away with the sky. */
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '#stage', start: 'top top',
          endTrigger: '#platform', end: 'top top',
          scrub: 1
        }
      })
        .fromTo('.scene__inner', { yPercent: 0, scale: 1 }, { yPercent: -26, scale: 1.05, transformOrigin: '50% 80%' }, 0)
        .fromTo('.layer--far', { yPercent: 0 }, { yPercent: 5 }, 0)
        .fromTo('.layer--mid', { yPercent: 0 }, { yPercent: 2.5 }, 0)
        .fromTo('.layer--near', { yPercent: 0 }, { yPercent: -3 }, 0);

      /* ---------- Hero content drifts up and softens as the hero leaves ---------- */
      gsap.to('.hero__inner', {
        y: -70, autoAlpha: 0.15, ease: 'none',
        scrollTrigger: { trigger: '.hero__inner', start: 'top top', end: 'bottom 12%', scrub: true }
      });

      /* ---------- Platform preview: the browser frame rises and settles as you scroll to it ---------- */
      gsap.fromTo('.platform .browser', { y: 64, scale: 0.94 }, {
        y: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.pstage', start: 'top 95%', end: 'top 40%', scrub: 0.8 }
      });

      /* ---------- Section reveals: restrained fade-up, once ---------- */
      qsa('[data-reveal]').forEach(function (el) {
        gsap.from(el, {
          autoAlpha: 0, y: 28, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });
      gsap.from(qsa('.benefits__intro > *'), {
        autoAlpha: 0, y: 32, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.benefits__intro', start: 'top 85%', once: true }
      });
      gsap.from(qsa('.benefit-card'), {
        autoAlpha: 0, y: 40, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.benefits__grid', start: 'top 90%', once: true }
      });
      gsap.fromTo('.cta-band', { autoAlpha: 0, y: 36, scale: 0.96 }, {
        autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: '.cta-band', start: 'top 94%', once: true }
      });

      coverSceneWhenPlatformArrives();
    });
  }

  /* Once the platform section fully covers the screen, stop painting the fixed scene (saves GPU work). */
  function coverSceneWhenPlatformArrives() {
    ScrollTrigger.create({
      trigger: '#platform', start: 'top top', end: 1e7,
      toggleClass: { targets: '.scene', className: 'is-covered' }
    });
  }

  /* Pause the rotating text when the hero is off-screen. */
  function watchHero() {
    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom top',
      onToggle: function (self) { loopState.heroVisible = self.isActive; syncRotators(); }
    });
    document.addEventListener('visibilitychange', syncRotators);
  }

  /* If assets/images/travel-hero.webp exists, switch from the SVG landscape to the photograph. */
  function detectPhoto() {
    var scene = qs('.scene');
    var img = new Image();
    img.onload = function () { scene.classList.add('has-photo'); };
    img.src = 'assets/images/travel-hero.webp';
  }

  /* ----------------------------------------------------------------------
     8. BOOT
     ---------------------------------------------------------------------- */
  function boot() {
    detectPhoto();
    initTabs();
    initImageSlots();

    if (!hasGsap) {
      // CDN blocked or offline: keep the page fully readable without animation.
      root.classList.remove('js');
      console.warn('[Mogli] GSAP or ScrollTrigger failed to load. Showing the static layout.');
      initNav();
      initSky(false);
      initTools(false);
      initOps(false);
      initHub(false);
      initOrbit(false);
      initFaq();
      initPlatformRail(false);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });   // stops mobile address-bar resizes from re-running triggers

    initNav();
    initStatements();
    playIntro();
    var animateAll = !reduceMotionQuery.matches;
    var heads = animateAll ? splitHeadings() : [];     // split before initScroll so [data-reveal] on headings is dropped
    initScroll();
    initHeadingReveals(heads);
    initProgress();
    initFaq();
    initTrust(animateAll);
    initFaqMotion(animateAll);
    initBlog(animateAll);
    initPlatformRail(!reduceMotionQuery.matches);
    initMac(!reduceMotionQuery.matches);
    initSky(!reduceMotionQuery.matches);
    initTools(!reduceMotionQuery.matches);
    initOps(!reduceMotionQuery.matches);
    initHub(!reduceMotionQuery.matches);
    initOrbit(!reduceMotionQuery.matches);
    watchHero();

    // Fonts and images shift layout slightly; re-measure once everything has loaded.
    var refresh = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
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
