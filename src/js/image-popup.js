(function(window, document, zv) {
  'use strict';

  var wrps = document.querySelectorAll('.image-wrapper'),
    loading = document.querySelector('#loading'),
    s3 = 'https://s3.amazonaws.com/zeroviscosity/';

  function loadImage(wrp, popup, src, width, height) {
    var img = new window.Image(width, height);

    zv.removeClass(wrp, 'image-unloaded');
    zv.addClass(wrp, 'image-loading');

    img.style.opacity = 0;
    img.onload = function() {
      popup.innerHTML = '';
      popup.appendChild(img);
      img.style.opacity = 1;
      zv.removeClass(wrp, 'image-loading');
      zv.addClass(wrp, 'image-loaded');
    };
    img.src = src;
  }

  Array.prototype.forEach.call(wrps, function(wrp) {
    var width = parseInt(wrp.getAttribute('data-width'), 10),
      height = parseInt(wrp.getAttribute('data-height'), 10),
      src = wrp.getAttribute('data-s3-src'),
      ldg = loading.cloneNode(true),
      icon = document.createElement('span'),
      popup = document.createElement('span');

    src = (src) ? s3 + src : wrp.getAttribute('data-src');

    zv.addClass(wrp, 'image-unloaded');
    zv.addClass(ldg, 'loading-popup');
    zv.addClass(icon, 'image-icon');
    zv.addClass(popup, 'image-popup');

    popup.appendChild(ldg);
    wrp.appendChild(icon);
    wrp.appendChild(popup);

    // Preload images on wider screens
    if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) > 1024) {
      loadImage(wrp, popup, src, width, height);
    }

    wrp.addEventListener('click', function(evt) {
      var buffer = 20, // Icon width
        w = width,
        h = height,
        device = {
          w: Math.max(document.documentElement.clientWidth,
               window.innerWidth || 0),
          h: Math.max(document.documentElement.clientHeight,
            window.innerHeight || 0)
        },
        edge = buffer,
        ratio,
        half,
        left;

      if (device.w > 1024) edge = 240 + buffer;
      else if (device.w > 640) edge = 120 + buffer;

      device.w -= 2 * buffer;
      device.h -= 2 * buffer;

      if (w > device.w) {
        ratio = device.w / w;
        w = device.w;
        h *= ratio;
      }

      if (h > device.h) {
        ratio = device.h / h;
        h = device.h;
        w *= ratio;
      }

      half = (w - buffer) / 2;
      left = -half;

      if (evt.clientX - half < edge) {
        left += Math.abs(edge - evt.clientX + half);
      } else if (evt.clientX + half > device.w) {
        left -= evt.clientX + half - device.w;
      }

      if (zv.hasClass(wrp, 'image-unloaded')) {
        loadImage(wrp, popup, src, width, height);
      }

      popup.style.width = w + 'px';
      popup.style.height = h + 'px';
      popup.style.left = left + 'px';

      zv.toggleClass(wrp, 'active');
    });
  });
})(window, window.document, window.zv);
