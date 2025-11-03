(function() {
  try {
    var needs = document.querySelector('[toast-list]') || document.querySelector('[data-choices]') || document.querySelector('[data-provider]');
    if (!needs) return;

    var urls = [
      'https://cdn.jsdelivr.net/npm/toastify-js',
      '/assets/libs/choices.js/public/assets/scripts/choices.min.js',
      'assets/libs/flatpickr/flatpickr.min.js'
    ];

    urls.forEach(function(src) {
      // Skip if already present
      var exists = Array.prototype.some.call(document.getElementsByTagName('script'), function(s){ return s.src && s.src.indexOf(src) !== -1; });
      if (exists) return;
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = src;
      s.async = true;
      (document.head || document.body || document.documentElement).appendChild(s);
    });
  } catch (e) {
    // no-op
  }
})();