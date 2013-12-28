var express = require('express'),
    app = express(),
    check = require('validator').check,
    mail = require('nodemailer').mail,
    port = process.env.APP_PORT || 3000;

/*
 * App set up
 */
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.locals.pretty = true;

});

/*
 * Error Handling
 */
app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.render('500', { error: err });
});

/*
 * Route set up
 */
app.get('/', function(req, res) {
    res.render('index');
});
app.post('/contact-me', function(req, res) {
    try {
        check(req.body.name, 'Please provide your name.').notEmpty();
        check(req.body.email, 'Please provide your email.').len(6,64).isEmail();
        check(req.body.message, 'Please enter a message.').notEmpty();
        check(req.body.comment, 'You entered something in a box that needed to be left empty. Perhaps you are a spam bot? No offense intended if you are in fact human.').is(/^$/);

        mail({
            from: 'Zero Viscosity Info <info@zeroviscosity.com>',
            to: 'kent.english@gmail.com',
            subject: 'Website Contact Form: ' + req.body.name,
            text: req.body.name + ' (' + req.body.email + '):\n\n' + req.body.message
        });

        res.json({
            result: 'ok'
        });
    } catch(e) {
        res.json({
            result: e.message
        });
    }
});

/*
 * Start it up
 */
app.listen(port);
console.log('Listening on port ' + port);
