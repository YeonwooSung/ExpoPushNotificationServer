//import required libraries
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let app = express();

const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);


//basic set ups
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// module for push notification
let pushNotification = require('./pushNotification');

// lists to store data
let messages = [];
let tokens = [];


/**
 * Process the POST '/notification' request.
 */
app.post('/notification', (req, res) => {
    let data = req.body;
    console.log(data);

    /*
     * You could store the sent expo token by using database, etc.
     * In this code, I simply store the received JSON object into the list.
     * Also, it would be nice to write some codes to check if there is duplicating token.
     */

    tokens.push(data);
});

/**
 * Process the GET '/notification' request.
 */
app.get('/notification', (req, res) => {
    messages = [];

    for (let token of tokens) {
        // Get message and data to send for push notification
        // In this code, I hardcoded the message and data to send.
        let notificationMsg = 'Notification message!';
        let data = {'id': token['user']}

        let msg = pushNotification.generateMessage(token['token'], notificationMsg, data);
        messages.push(msg);
    }

    pushNotification.generatePushNotifications(messages);

    res.send('ok');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;