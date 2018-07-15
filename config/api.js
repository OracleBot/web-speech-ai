//DialogFlow defaults
const projectId = 'ardysdev1'; //https://dialogflow.com/docs/agents#settings
let sessionId = '1234';
let first_query = null;
const languageCode = 'en-US';
let response_txt = null;

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

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

// Function which returns speech from api.ai
var getRes = function (query) {
    console.log('Query # ' + query);
    // Get a reply from API.ai
    request.queryInput.text.text = query;

    let bot_reply = 'No';

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

            socket.emit('fromServer', bot_reply);

            if (result.intent) {
                console.log(`  Intent: ${result.intent.displayName}`);
            } else {
                console.log(`  No intent matched.`);
            }
            return bot_reply;
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
};

module.exports = { getRes }