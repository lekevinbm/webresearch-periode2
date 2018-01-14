//Express haalt files van de server
var express = require ('express');
var app = express();
//A server is made
var serv = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

//De server server is going to listen to port 2000 
serv.listen(2000);
console.log("server started");

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Player = function(id){    
    var self = {
        name:'',
        boats:{},
        emptySquaresHit:[],
        id:id,
        status:'start',
        myTurn:false,
    }

    self.generateBoats = function(){        
        self.boats['allPieces'] = [];
        self.boats['amountOfBoats'] = 5;
        var boat = [];
        var allPieces = [];
        var amountOfBoats = 5;
        var boatLength = 2;
        var amountOfBoatsWithSizeThree = 0;
    
        for (j=0; j<amountOfBoats; j++){
            var coordinateAlreadyTaken = false;
            var boat = [];
            goesDown = Math.floor(Math.random()*2); //Chooses if the boats go vertically or horizontaly   
            boat.push([ Math.floor(Math.random()*(10-boatLength))+ 3, Math.floor(Math.random()*(10-boatLength)) + 4]); //Chooses random coordinates for the first piece of the boat
            
            //adds Pieces horizontally or vertically to the previous pieces
            for(i=1; i<boatLength; i++){
                if (goesDown){
                    boat.push( [boat[i-1][0], boat[i-1][1] + 1] );
                } else{
                    boat.push( [boat[i-1][0] + 1, boat[i-1][1]] );
                }
            }
    
            //checks if there is already a piece for that coordinate
            for(i=0; i < allPieces.length;i++){
                for(k=0;k < boat.length; k++){
                    if( allPieces[i][0] == boat[k][0] && allPieces[i][1] == boat[k][1]){
                        coordinateAlreadyTaken = true;
                        break;                
                    }
                }
            }
    
            //If there is already a piece for the coordinate, we reduct j so that the loop wil go on, and we can make another boat
            if (coordinateAlreadyTaken){
                j--;        
            }else{
                for(k=0;k < boat.length; k++){
                    allPieces.push(boat[k]);
                    self.boats.allPieces.push(boat[k]);
                }
    
                var boatNumber = j+1;
                self.boats['boat'+boatNumber] = {
                    pieces: boat,
                    hasSunk: false,
                    size: boat.length,      
                };        
    
                //there has to be 2 boats with the size of 3
                if(boatLength == 3){
                    amountOfBoatsWithSizeThree++;
                }
                if (amountOfBoatsWithSizeThree != 1){
                    boatLength++;
                }
            }    
        }    
        return self.boats;
    }
    return self;
}



var idCounter = 1; 
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){

    socket.id = idCounter;
    idCounter++;
    SOCKET_LIST[socket.id] = socket;
 
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;

    /*socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });*/

    //socket listens to generateBoat
    socket.on('nameSaid',function(data){
        player.name = data.name;
    })

    //socket listens to generateBoat
    socket.on('generateBoat',function(){
        var boats = player.generateBoats();
        socket.emit('boats',boats);
    });

    socket.on('readyToShoot',function(){
        player.status = 'readyToShoot';        
        console.log(PLAYER_LIST);
    });

    if(player.id == 1){
        SOCKET_LIST[2].on('readyToShoot',function(){
            console.log('zijn klaar om te spelen');
        });
    }else if(player.id == 2){
        SOCKET_LIST[1].on('readyToShoot',function(){
            console.log('zijn klaar om te spelen');
        });
    }
});


