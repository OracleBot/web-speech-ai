'use strict';

require('dotenv').config()
// const APIAI_TOKEN = process.env.APIAI_TOKEN;
// const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID;

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

const projectId = 'payablesv2'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id';
var query = 'hello';
const languageCode = 'en-US';
var response_txt = '';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

// The text query request.
var request = {
  session: sessionPath,
  queryInput: {
    text: {
      text: query,
      languageCode: languageCode,
    },
  },
};

const server = app.listen(process.env.PORT || 8080, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
io.on('connection', function (socket) {
  console.log('a user connected');
});

// const apiai = require('apiai')(APIAI_TOKEN);

// Web UI
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

io.on('connection', function (socket) {
  socket.on('chat message', (text) => {
    console.log('Message: ' + text);

    // Get a reply from API.ai
    request.queryInput.text.text = text;
    // Send request and log result
    sessionClient
      .detectIntent(request)
      .then(responses => {
        console.log('Detected intent');
        const result = responses[0].queryResult;
        console.log(`  Query: ${result.queryText}`);
        console.log(`  Response: ${result.fulfillmentText}`);
        socket.emit('bot reply', result.fulfillmentText);
        console.log('done');
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

  socket.on('toServer', (text) => {
    console.log('Message: ' + text);

    // Get a reply from API.ai
    request.queryInput.text.text = text;
    // Send request and log result
    sessionClient
      .detectIntent(request)
      .then(responses => {
        console.log('Detected intent');
        const result = responses[0].queryResult;
        console.log(`  Query: ${result.queryText}`);
        console.log(`  Response: ${result.fulfillmentText}`);
        socket.emit('fromServer', result.fulfillmentText);
        console.log('done');
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

});