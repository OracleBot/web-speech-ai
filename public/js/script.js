'use strict';

const socket = io();
var botui = new BotUI('api-bot');
const textarea = document.querySelector('.message-to-send');
/*
//Speech recognition and pronounciation
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

document.querySelector('.speech').addEventListener('click', () => {
  recognition.start();
});

recognition.addEventListener('speechstart', () => {
  console.log('Speech has been detected.');
});

recognition.addEventListener('result', (e) => {
  console.log('Result has been detected.');
  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;

  //Sending recognised text to UI
  botui.message.add({
    human: true,
    content: text
  });

  //Send the recognised text to Socket.io
  socket.emit('h_voice', text);

  //Confidence of recognition
  console.log('Confidence: ' + e.results[0][0].confidence);
});

recognition.addEventListener('speechend', () => {
  recognition.stop();
});

recognition.addEventListener('error', (e) => {
  botui.message.add({
    content: 'Error: ' + e.error
  });
});

function synthVoice(text) {
  console.log('speak begins');
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = text;
  synth.speak(utterance);
}

socket.on('b_voicereply', function (replyText) {
  synthVoice(replyText);
  if (replyText == '') replyText = '(No answer...)';
  botui.message.add({
    content: replyText
  });
});
*/
//Sending human request to Socket.io server on click of send button
document.querySelector('.text-btn').addEventListener('click', () => {
  console.log(textarea.value);

  botui.message.add({
    human: true,
    content: textarea.value
  });
  socket.emit('fromClient', textarea.value);
  textarea.value = "";
});

//Sending human request to Socket.io server on pressing return in text area
document.querySelector('.message-to-send').addEventListener('keyup', function (e) {
  if (e.keyCode === 13) {
    console.log(textarea.value);

    botui.message.add({
      human: true,
      content: textarea.value
    });

    socket.emit('fromClient', textarea.value);
    textarea.value = "";
  }
});

socket.on('b_txtreply', function (data) {
  botui.message.add({
    content: data
  });
});

botui.message.add({
  content: 'Lets Start Talking...',
  delay: 1500,
}).then(function () {
  botui.action.text({
    action: {
      placeholder: 'Say Hello',
    }
  }
  ).then(function (res) {
    socket.emit('fromClient', { client: res.value }); // sends the message typed to server
    console.log(res.value); // will print whatever was typed in the field.
  }).then(function () {
    socket.on('fromServer', function (data) { // recieveing a reply from server.
      console.log(data.server);
      newMessage(data.server);
      addAction();
    })
  });
})

function newMessage(response) {
  botui.message.add({
    content: response,
    delay: 0,
  });
}

function addAction() {
  botui.action.text({
    action: {
      placeholder: 'enter response...',
    }
  }).then(function (res) {
    socket.emit('fromClient', { client: res.value });
    console.log('client response: ', res.value);
  })
}