'use strict';

// require('dotenv').config();
const bodyParser = require('body-parser');  
const url = require('url');  
const querystring = require('querystring');  
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const server = app.listen(process.env.PORT || 8080, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/', function(req, res) {
  var user_id = req.query.id;
  console.log('user_id'+user_id);
  res.sendFile(__dirname + '/views/base.html');
});

const projectId = 'payablesv2'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id';
var first_query = 'hello';
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
      text: first_query,
      languageCode: languageCode,
    },
  },
};

const io = require('socket.io')(server);

// io.on('connection', function (socket) {
//   console.log('a user connected');
// });

io.on('connection', function (socket) {
  console.log('a user connected');

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