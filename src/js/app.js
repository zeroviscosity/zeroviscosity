(function(window, document) {
    'use strict';

    var wrps = document.querySelectorAll('.image-wrapper'),
        loading = document.querySelector('#loading');

    Array.prototype.forEach.call(wrps, function(wrp, i) {
        var width = parseInt(wrp.getAttribute('data-width'), 10),
            height = parseInt(wrp.getAttribute('data-height'), 10),
            src = wrp.getAttribute('data-src'),
            icon = document.createElement('span'),
            popup = document.createElement('span');
        
        wrp.classList.add('image-unloaded');
        icon.classList.add('image-icon');
        popup.classList.add('image-popup');

        popup.appendChild(loading.cloneNode(true));
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
            
            if (wrp.classList.contains('image-unloaded')) {
                wrp.classList.remove('image-unloaded');
                wrp.classList.add('image-loading');
                img = new window.Image(width, height);
                img.style.opacity = 0;
                img.onload = function() {
                    popup.innerHTML = '';
                    popup.appendChild(img);
                    img.style.opacity = 1;
                    wrp.classList.remove('image-loading');
                    wrp.classList.add('image-loaded');
                };
                img.src = src;
            }

            popup.style.width = w + 'px';
            popup.style.height = h + 'px';
            popup.style.left = left + 'px'; 
            
            wrp.classList.toggle('active');
        });
    });
})(window, window.document);
