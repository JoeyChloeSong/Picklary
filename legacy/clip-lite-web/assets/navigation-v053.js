document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-site-master-toggle]');
  var nav = document.querySelector('[data-site-master-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }
  var language = document.querySelector('[data-site-master-language]');
  if (language) language.addEventListener('change', function () { window.location.href = language.value; });
});
