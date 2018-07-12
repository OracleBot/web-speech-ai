var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');


var api = require('./api');

var conn = function () {
    server.listen(8080);

    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname + '/../views/index.html'));
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