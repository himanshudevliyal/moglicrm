/* Mogli classic: contact form. It prepares an email in the visitor's own mail app; nothing is sent from the page. */
(function () {
  'use strict';
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var form = qs('form[data-mailto]');
  if (!form) return;
  var q = new URLSearchParams(window.location.search);
  var topic = q.get('topic'), team = q.get('team');
  if (topic) qsa('#cf-topic option').forEach(function (o) { if (o.getAttribute('data-topic') === topic) o.selected = true; });
  if (team) qsa('#cf-team option').forEach(function (o) { if (o.getAttribute('data-team') === team) o.selected = true; });
  var status = qs('.cform__status', form);
  function clearErr(el) {
    el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby');
    var e = el.parentNode.querySelector('.cfield__err'); if (e) e.remove();
  }
  function setErr(el, msg) {
    clearErr(el);
    el.setAttribute('aria-invalid', 'true');
    var e = document.createElement('span'); e.className = 'cfield__err'; e.id = el.id + '-err'; e.textContent = msg;
    el.parentNode.appendChild(e); el.setAttribute('aria-describedby', e.id);
  }
  qsa('input, textarea', form).forEach(function (el) { el.addEventListener('input', function () { clearErr(el); }); });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = form.elements, bad = null;
    [['name', 'Please add your name.'], ['email', 'Please add your work email.'], ['message', 'Please write a short message.']].forEach(function (k) {
      var el = f[k[0]]; clearErr(el);
      var v = el.value.trim();
      if (!v || (k[0] === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) { setErr(el, k[0] === 'email' && v ? 'That email does not look right.' : k[1]); if (!bad) bad = el; }
    });
    if (bad) { bad.focus(); status.hidden = true; return; }
    var to = form.getAttribute('data-mailto');
    var subject = f.topic.value + (f.company.value.trim() ? ' - ' + f.company.value.trim() : '');
    var lines = ['Name: ' + f.name.value.trim(), 'Email: ' + f.email.value.trim()];
    if (f.company.value.trim()) lines.push('Company: ' + f.company.value.trim());
    if (f.team.value) lines.push('Type of company: ' + f.team.value);
    lines.push('Topic: ' + f.topic.value, '', f.message.value.trim());
    status.hidden = false;
    status.textContent = 'Your email app should open with the message ready to send. If nothing opens, write to ' + to + ' directly.';
    window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\r\n'));
  });
})();
