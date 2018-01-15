//Express haalt files van de server
var express = require ('express');
var app = express();
//A server is made
var serv = require('http').Server(app);

//words to number
var WtoN = require('words-to-num');

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
        boatPiecesHit:[],
        emptySquaresHitOfEnemy:[],
        boatPiecesHitOfEnemy:[],
        id:id,
        status:'start',
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

var idOfPlayer = 1;
var globalSocket;
var globalPlayer; 

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    globalSocket = socket;   
    socket.id = idOfPlayer;
    idOfPlayer++;
    SOCKET_LIST[socket.id] = socket;
 
    var player = Player(socket.id);
    globalPlayer = player;
    socket.emit('playerId',{'playerId':player.id});
    PLAYER_LIST[socket.id] = player;

    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });

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
    });

    socket.on('checkSpeech',function(data){
        var targetLetter = '';
        var targetNumber;
        
        switch(data.target[0]) {
            default: 
                targetLetter = data.target[0].toLowerCase();
                break;
            case 'be':
                targetLetter = 'b'
                break;
            case 'age':
                targetLetter = 'h'
                break;
        }

        switch(data.target[1]) {
            default: 
                targetNumber = data.target[1];                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                break;
            case 'for':
                targetNumber = '4'
                break;
        }
        targetNumber = WtoN.convert(targetNumber);
        socket.emit('convertedTarget',{'targetLetter':targetLetter,'targetNumber':targetNumber});
    });

    socket.on('target',function(data){
        targetLetter = data.target[0];
        targetNumber = data.target[1];
        var idOfTarget;
        playerId = data.playerId;
        if(data.playerId == 1){
            idOfTarget = 2;
            idOfPlayerToPlay = 2
        }else{
            idOfTarget = 1;
            idOfPlayerToPlay = 1;
        }
        
        var pieceOfEnemyHit = false;
        for(i=0;i < PLAYER_LIST[idOfTarget].boats.allPieces.length; i++){
            if(PLAYER_LIST[idOfTarget].boats.allPieces[i][0] == targetLetter.charCodeAt(0)-94 && PLAYER_LIST[idOfTarget].boats.allPieces[i][1] == targetNumber+3){
                PLAYER_LIST[playerId].boatPiecesHitOfEnemy.push( [targetLetter.charCodeAt(0)-94, targetNumber+3] );
                PLAYER_LIST[idOfTarget].boatPiecesHit.push( [targetLetter.charCodeAt(0)-94, targetNumber+3] );
                pieceOfEnemyHit = true;
                idOfPlayerToPlay = playerId;
            }
            
        
        }

        if(!pieceOfEnemyHit){
            PLAYER_LIST[playerId].emptySquaresHitOfEnemy.push( [targetLetter.charCodeAt(0)-94, targetNumber+3] );
            PLAYER_LIST[idOfTarget].emptySquaresHit.push( [targetLetter.charCodeAt(0)-94, targetNumber+3] );
        }
        socket.emit('shootingFinished',{'player':player});
        if( PLAYER_LIST[playerId].boatPiecesHitOfEnemy.length == PLAYER_LIST[idOfTarget].boats.allPieces.length){
            io.emit('gameover',{'winnerId':playerId});
        } else{
            askToPlay = true;
            player['status'] = 'readyToShoot';
        }
        

    });

    
});

var askToPlay = true;
var idOfPlayerToPlay = 1; 
setInterval(function(){
    var numberOfPlayersReady = 0;    
    for(var i in PLAYER_LIST){
        if (PLAYER_LIST[i].status == 'readyToShoot'){
            numberOfPlayersReady++;
        }
    }

    if(askToPlay && numberOfPlayersReady == 2){
        askToPlay = false
        PLAYER_LIST[idOfPlayerToPlay].status = 'shooting';
        io.emit('gameStarted',{'players':PLAYER_LIST,'idOfPlayerToPlay':idOfPlayerToPlay});
    } 
       
},1000/25);


