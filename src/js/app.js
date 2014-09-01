(function(window, document) {
    'use strict';

    var wrps = document.querySelectorAll('.image-wrapper');

    Array.prototype.forEach.call(wrps, function(wrp, i) {
        var width = parseInt(wrp.getAttribute('data-width'), 10),
            height = parseInt(wrp.getAttribute('data-height'), 10),
            src = wrp.getAttribute('data-src'),
            icon = document.createElement('span'),
            popup = document.createElement('span'),
            img = new window.Image(width, height);

        icon.className = 'image-icon';
        popup.className = 'image-popup';

        img.src = src;
        
        popup.appendChild(img);
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
                edge;
            
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

            popup.style.width = w + 'px';
            popup.style.height = h + 'px';
            popup.style.left = left + 'px'; 
            
            wrp.classList.toggle('active');
        });
    });
})(window, window.document);
