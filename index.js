'use strict';

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

//Start listening
const server = app.listen(process.env.PORT || 8080, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

//Socket.io
const io = require('socket.io')(server);

//DialogFlow defaults
const projectId = 'payablesv2'; //https://dialogflow.com/docs/agents#settings
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

      // Send request and log result
      sessionClient
        .detectIntent(request)
        .then(responses => {
          const result = responses[0].queryResult;
          console.log(`  Query: ${result.queryText}`);

          var bot_reply = result.fulfillmentText;
          console.log(`  Response: ${bot_reply}`);

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

      // Send request and log result
      sessionClient
        .detectIntent(request)
        .then(responses => {
          const result = responses[0].queryResult;
          console.log(`  Query: ${result.queryText}`);

          var bot_reply = result.fulfillmentText;
          console.log(`  Response: ${bot_reply}`);

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