require('newrelic');

const express = require('express');
const logger = require('morgan');

const goblet = require('./lib/goblet');

const app = express();

const port = process.env.NODE_PORT || 3000;
const env = process.env.NODE_ENV || 'development';

app.enable('verbose errors');

if (env === 'development') {
  app.use(logger('dev'));
} else if (env === 'production') {
  app.disable('verbose errors');
}

require('pug').filters.code = (block) => {
  return block
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/#/g, '&#35;');
};

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));
app.use(goblet(__dirname + '/goblet.json'));

app.listen(port, () => {
  console.log('Listening on port ' + port);
});

