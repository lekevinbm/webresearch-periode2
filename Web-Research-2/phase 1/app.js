//Express haalt files van de server
var express = require ('express');
var app = express();
//Een server wordt aangemaakt
var serv = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

//De server gaat hier luisteren naar poort 2000 
serv.listen(2000);
console.log("server started");


var boats = {};
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
        }

        var boatNumber = j+1;
        boats['boat'+boatNumber] = boat;

        //there has to be 2 boats with the size of 3
        if(boatLength == 3){
            amountOfBoatsWithSizeThree++;
        }
        if (amountOfBoatsWithSizeThree != 1){
            boatLength++;
        }
    }    
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    console.log(boats);
    console.log(allPieces);
    //socket gaan luisteren naar happ1
    socket.on('happ1',function(data){
        console.log('iets');
    })
});

