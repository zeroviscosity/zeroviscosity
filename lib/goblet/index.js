var express = require('express'),
    goblet = require('./goblet'),
    app = express();

module.exports = function(path) {
    goblet.init(path, function() {
        goblet.pages(function(path, render) {
            app.get(path, render);
        }, function(pages) {
            app.get('/', goblet.main);

            app.get('/post/:slug', goblet.post);
            
            app.use(function(req, res, next) {
                res.render('errors/404', { 
                    pages: pages,
                    url: req.url 
                });
            });

            app.use(function(err, req, res, next) {
                console.error(err);
                res.status(err.status || 500);
                res.render('errors/500', { 
                    error: err,
                    pages: pages
                });
            });
        });
    });

    return app;
};
