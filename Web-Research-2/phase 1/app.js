//Express haalt files van de server
var express = require ('express');
var app = express();
//Een server wordt aangemaakt
var serv = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

//De server gaat hier luisteren naar ppor 
serv.listen(2000);
console.log("server started");

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    console.log('socket connection');
    //socket gaan luisteren naar happy
    socket.on('happy',function(data){
        console.log('iets');
    })
});

