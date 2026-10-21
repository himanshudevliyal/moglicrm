/* ===== BLOG SECTION motion (GSAP + ScrollTrigger). Call initBlog() once after the page has loaded. =====
   The section is fully readable without this: nothing is hidden in CSS, gsap.from() only runs when GSAP is present. */
function initBlog() {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
