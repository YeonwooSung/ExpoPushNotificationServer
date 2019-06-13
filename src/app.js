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

// module for push notification
let pushNotification = require('./pushNotification');
let utils = require('./utils');

const RESPONSE_MSG = 'ok';


/**
 * Process the POST '/token' request.
 */
app.post('/token', (req, res) => {
    let {data} = req.body;
    console.log(data);

    utils.appendToCSV(data);

    res.send(RESPONSE_MSG);
});

/**
 * Process the POST '/notification' request.
 */
app.post('/notification', (req, res) => {
    let data = req.body;

    let {id, message} = data;
    let {title, body} = message;

    let messages = [];
    let tokens = [];

    for (let i = 0; i < id.length; i++) {
        let returnedArr = utils.readCSV(id[i]); // get array of tokens from csv file
        tokens = tokens.concat(returnedArr); // concatenate arrays
    }
    console.log(tokens);

    // use for loop to iterate the list of tokens.
    for (let token of tokens) {
        console.log(token);
        let msg = pushNotification.generateMessage(token, title, body, message);
        messages.push(msg);
    }

    pushNotification.generatePushNotifications(messages);

    res.send(RESPONSE_MSG);
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

module.exports.app = app;