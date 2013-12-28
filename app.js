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
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.locals.pretty = true;
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
