(function(window, document, hljs, zv) {
    'use strict';

    var wrps = document.querySelectorAll('.lazy-code'),
        loading = document.querySelector('#loading'),
        s3 = 'https://s3.amazonaws.com/zeroviscosity/';

    function formatCode(code) {
        return code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/#/g, '&#35;');
    }

    Array.prototype.forEach.call(wrps, function(wrp, i) {
        var btn = wrp.querySelector('button'),
            src = wrp.getAttribute('data-s3-src'),
            lang = wrp.getAttribute('data-language'),
            ldg = loading.cloneNode(true);

        src = (src) ? s3 + src : wrp.getAttribute('data-src');
        
        zv.addClass(ldg, 'loading-code');

        btn.addEventListener('click', function(evt) {
            var request = new XMLHttpRequest(),
                pre = document.createElement('pre'),
                code = document.createElement('code'),
                errorHandler = function() {
                    code.innerHTML = 'An error occurred.';
                    wrp.innerHTML = '';
                    wrp.appendChild(pre);
                    hljs.highlightBlock(code);
                };
            
            pre.appendChild(code);
            
            wrp.innerHTML = '';
            wrp.appendChild(ldg);

            try {
                request.open('GET', src, true);

                request.onload = function() {
                    if (request.status >= 200 && request.status < 400){
                        zv.addClass(code, lang);
                        code.innerHTML = formatCode(request.responseText);    
                    } else {
                        code.innerHTML = 'An error occurred.';
                    }
                    wrp.innerHTML = '';
                    wrp.appendChild(pre);
                    hljs.highlightBlock(code);
                };

                request.onerror = errorHandler; 

                request.send();
            } catch(e) {
                errorHandler();
            }
        });
    });
})(window, window.document, window.hljs, window.zv);
