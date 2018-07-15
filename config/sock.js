var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
const express = require('express');
// const app = express();

app.set('view engine', 'ejs');

var api = require('./api');
app.use(express.static(__dirname + '/../views')); // html
app.use(express.static(__dirname + '/../public')); // js, css, images

var conn = function () {
    server.listen(8080);

    app.get('/', function (req, res) {
        console.log(__dirname)
        res.render('index', { title: 'The index page!' });
    });
};

var fromClient = function () {
    io.on('connection', function (socket) {
        socket.on('fromClient', function (data) {
            console.log(data.client);
            api.getRes(data.client).then(function (res) {
                console.log('response', res);
                socket.emit('fromServer', { server: res });
            });
        });
    });
}
module.exports = { conn, fromClient }