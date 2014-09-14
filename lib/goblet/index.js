var express = require('express'),
    goblet = require('./goblet'),
    app = express(),
    env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    app.locals.pretty = true;
}

module.exports = function(path) {
    goblet.init(path, function() {
        goblet.pages(function(path, render) {
            app.get(path, render);
        }, function(pages) {
            app.get('/', goblet.index);

            app.get('/category/:slug', goblet.category);
            
            app.get('/:category/:slug', goblet.post);
            
            app.use(function(req, res, next) {
                res.status(404);
                goblet.error(req, res, next); 
            });

            app.use(function(err, req, res, next) {
                res.status(err.status || 500);
                goblet.error(req, res, next);
            });
        });
    });

    return app;
};
