'use strict';
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const express = require('express');
const app = express();

var index = require('./routes/index');
var socket = require('./config/sock');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log('Server Started at Port 3000');
app.use('/', index);
socket.conn();
socket.fromClient();

// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

// //Get Session Id from URL
// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/views/index.html');
//   // sessionId = req.query.id;
//   // if (typeof sessionId !== 'undefined' && sessionId) {
//   //   console.log(`  SessionId: ${sessionId}`);
//   //   res.sendFile(__dirname + '/views/index.html');
//   // }
//   // else {
//   //   console.log('Session Invalid or Null');
//   //   res.sendFile(__dirname + '/views/no-session.html');
//   // }
// });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;

// app.use(bodyParser.json()); // support json encoded bodies
// app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/*
//Start listening
const server = app.listen(process.env.PORT || 8080, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

//Socket.io
const io = require('socket.io')(server);

//DialogFlow defaults
const projectId = 'ardysdev1'; //https://dialogflow.com/docs/agents#settings
let sessionId = null;
let first_query = null;
const languageCode = 'en-US';
let response_txt = null;

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

//Get Session Id from URL
app.get('/', function (req, res) {
  sessionId = req.query.id;
  if (typeof sessionId !== 'undefined' && sessionId) {
    console.log(`  SessionId: ${sessionId}`);
    res.sendFile(__dirname + '/views/base.html');
  }
  else {
    console.log('Session Invalid or Null');
    res.sendFile(__dirname + '/views/no-session.html');
  }
});

io.on('connection', function (socket) {
  console.log('a user connected');
  if (typeof sessionId !== 'undefined' && sessionId) {
    // Define session path
    let sessionPath = sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    let request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: first_query,
          languageCode: languageCode,
        },
      },
    };

    socket.on('h_voice', (text) => {
      console.log('Voice Msg: ' + text);

      // Get a reply from Dialogflow
      request.queryInput.text.text = text;
      let bot_reply = null;
      // Send request and log result
      sessionClient
        .detectIntent(request)
        .then(responses => {
          console.log(responses)
          const result = responses[0].queryResult;
          const webhook = responses[0].webhookStatus;

          if (webhook != null) {
            if (webhook.code == 4) {
              bot_reply = webhook.message;
              console.log(`  Webhook: ${webhook.message}`);
            }
            else {
              console.log(`  Query: ${result.queryText}`);
              bot_reply = result.fulfillmentText;
              console.log(`  Response: ${bot_reply}`);
            }
          } else {
            console.log(`  Query: ${result.queryText}`);
            bot_reply = result.fulfillmentText;
            console.log(`  Response: ${bot_reply}`);
          }

          //Sending reply back to Socket.io client
          socket.emit('b_voicereply', bot_reply);

          //Print intent details
          if (result.intent) {
            console.log(`  Intent: ${result.intent.displayName}`);
          } else {
            console.log(`  No intent matched.`);
          }
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    });

    socket.on('h_txt', (text) => {
      console.log('Txt: ' + text);

      // Get a reply from API.ai
      request.queryInput.text.text = text;
      let bot_reply = null;
      // Send request and log result
      sessionClient
        .detectIntent(request)
        .then(responses => {
          console.log(responses)
          const result = responses[0].queryResult;
          const webhook = responses[0].webhookStatus;

          if (webhook != null) {
            if (webhook.code == 4) {
              bot_reply = webhook.message;
              console.log(`  Webhook: ${webhook.message}`);
            }
            else {
              console.log(`  Query: ${result.queryText}`);
              bot_reply = result.fulfillmentText;
              console.log(`  Response: ${bot_reply}`);
            }
          } else {
            console.log(`  Query: ${result.queryText}`);
            bot_reply = result.fulfillmentText;
            console.log(`  Response: ${bot_reply}`);
          }

          //Sending reply back to Socket.io client
          socket.emit('b_txtreply', bot_reply);

          if (result.intent) {
            console.log(`  Intent: ${result.intent.displayName}`);
          } else {
            console.log(`  No intent matched.`);
          }
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    });
  } else {
    console.log('Session Invalid or Null');
  }
});
*/