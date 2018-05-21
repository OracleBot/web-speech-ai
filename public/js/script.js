'use strict';

const socket = io();
var botui = new BotUI('api-bot');
const textarea = document.querySelector('.message-to-send');

//Speech recognition and pronounciation
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

document.querySelector('.speech').addEventListener('click', () => {
  recognition.start();
});

// botui.message.add({
//   content: 'Hello...',
//   delay: 500,
// });

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

//Sending human request to Socket.io server on click of send button
document.querySelector('.text-btn').addEventListener('click', () => {
  console.log(textarea.value);
  
  botui.message.add({
    human: true,
    content: textarea.value
  });
  socket.emit('h_text', textarea.value);
  textarea.value = "";
});

//Sending human request to Socket.io server on pressing return in text area
document.querySelector('.message-to-send').addEventListener('keyup', function(e) {
  if(e.keyCode === 13) {
    console.log(textarea.value);
  
    botui.message.add({
      human: true,
      content: textarea.value
    });
    
    socket.emit('h_txt', textarea.value);
    textarea.value = "";
  }
});

socket.on('b_txtreply', function (data) {
  botui.message.add({
    content: data
  });
});