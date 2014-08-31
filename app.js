var express = require('express'),
    goblet = require('./lib/goblet'),
    app = express(),
    port = process.env.NODE_PORT || 3000;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));
app.use(goblet(__dirname + '/goblet.json'));

app.listen(port, function() {
    console.log('Listening on port ' + port);
});

