const express = require('express');
const goblet = require('./goblet');

const env = process.env.NODE_ENV || 'development';

const app = express();

if (env === 'development') {
  app.locals.pretty = true;
}

module.exports = (path) => {
  goblet.init(path, () => {
    goblet.pages((path, render) => {
      app.get(path, render);
    }, () => {
      app.get('/', goblet.index);

      app.get('/category/:slug', goblet.category);

      app.get('/:category/:slug', goblet.post);

      app.use((req, res, next) => {
        res.status(404);
        goblet.error(req, res, next);
      });

      app.use((err, req, res, next) => {
        res.status(err.status || 500);
        goblet.error(req, res, next);
      });
    });
  });

  return app;
};
