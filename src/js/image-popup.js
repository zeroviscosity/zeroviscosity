(function(window, document, zv) {
    'use strict';

    var wrps = document.querySelectorAll('.image-wrapper'),
        loading = document.querySelector('#loading'),
        s3 = 'https://s3.amazonaws.com/zeroviscosity/';

    Array.prototype.forEach.call(wrps, function(wrp, i) {
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

        wrp.addEventListener('click', function(evt) {
            var buffer = 20, // Icon width
                w = width, 
                h = height,
                device = {
                    w: Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 2 * buffer,
                    h: Math.max(document.documentElement.clientHeight, window.innerHeight || 0 - 2 * buffer) 
                },
                ratio,
                left, 
                edge,
                img;
            
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
            
            if (evt.clientX < device.w / 2) {
                left = 0;
                edge = evt.clientX + w;
                if (edge > device.w) {
                    left -= edge - device.w - buffer;
                }
            } else {
                left = buffer - w;
                edge = evt.clientX + left;
                if (edge < buffer / 2) {
                    left += buffer - edge;
                }
            }
            
            if (zv.hasClass(wrp, 'image-unloaded')) {
                zv.removeClass(wrp, 'image-unloaded');
                zv.addClass(wrp, 'image-loading');
                img = new window.Image(width, height);
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

            popup.style.width = w + 'px';
            popup.style.height = h + 'px';
            popup.style.left = left + 'px'; 
            
            zv.toggleClass(wrp, 'active');
        });
    });
})(window, window.document, window.zv);
