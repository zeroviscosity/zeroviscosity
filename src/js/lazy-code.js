(function(window, document, hljs) {
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
        
        ldg.classList.add('loading-code');

        btn.addEventListener('click', function(evt) {
            var request = new XMLHttpRequest();
            
            wrp.innerHTML = '';
            wrp.appendChild(ldg);

            request.open('GET', src, true);

            request.onload = function() {
                var pre, code;

                if (request.status >= 200 && request.status < 400){
                    pre = document.createElement('pre');
                    code = document.createElement('code');

                    code.classList.add(lang);
                    code.innerHTML = formatCode(request.responseText);
                    
                    pre.appendChild(code);
                    
                    wrp.innerHTML = '';
                    wrp.appendChild(pre);
                    
                    hljs.highlightBlock(code);
                } else {
                    wrp.innerHTML = 'An error occurred.';
                }
            };

            request.onerror = function() {
                wrp.innerHTML = 'An error occurred.';
            };

            request.send();
        });
    });
})(window, window.document, window.hljs);
