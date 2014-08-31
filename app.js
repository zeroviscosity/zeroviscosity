var express = require('express'),
    logger = require('morgan'),
    goblet = require('./lib/goblet'),
    app = express(),
    port = process.env.NODE_PORT || 3000,
    env = process.env.NODE_ENV || 'development';

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));
app.use(goblet(__dirname + '/goblet.json'));

app.enable('verbose errors');

app.locals.pretty = true;

if (env === 'development') {
    app.use(logger('dev'));
} else if (env === 'production') {
    app.disable('verbose errors');
}

app.listen(port, function() {
    console.log('Listening on port ' + port);
});

