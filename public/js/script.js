'use strict';

const socket = io();
var botui = new BotUI('api-bot');
// const outputYou = document.querySelector('.output-you');
// const outputBot = document.querySelector('.output-bot');
const textarea = document.querySelector('.message-to-send');


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

  botui.message.add({
    human: true,
    content: text,
    delay: 500,
  });

  // outputYou.textContent = text;
  console.log('Confidence: ' + e.results[0][0].confidence);

  socket.emit('chat message', text);
});

recognition.addEventListener('speechend', () => {
  recognition.stop();
});

recognition.addEventListener('error', (e) => {
  // outputBot.textContent = 'Error: ' + e.error;
  botui.message.add({
    content: 'Error: ' + e.error,
    delay: 500,
  });
});

function synthVoice(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = text;
  synth.speak(utterance);
}

socket.on('bot reply', function (replyText) {
  synthVoice(replyText);

  if (replyText == '') replyText = '(No answer...)';
  // outputBot.textContent = replyText;
  botui.message.add({
    content: replyText,
    delay: 500,
  });

});

socket.on('fromServer', function (data) {
  console.log(data);
  botui.message.add({
    content: data,
    delay: 500,
  });
});

botui.message.add({
  content: 'Hello...',
  delay: 500,
});

document.querySelector('.text-btn').addEventListener('click', () => {
  console.log(textarea.value);

  botui.message.add({
    human: true,
    content: textarea.value,
    delay: 500,
  });
  socket.emit('toServer', textarea.value);
  textarea.value = "";
});


// then(function(){
//   botui.action.text({
//     action: {
//       placeholder: 'Enter your text here'
//     }
//   })
// });