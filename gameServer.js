 // Simple multi client chat
// Kenyon College
// Run: node chatApp.js
const express = require('express');
const app = express();
const http = require('http');
const mysql = require('mysql2');
const fs = require('fs');
const server = http.createServer(app);

//Everyone must use own port > 9000
const port=9018;
const Url='http://jimskon.com:'+port;
var id=0;

//var localPlayers = 0

function openSQL() {
    // Login to MySQL
    var con = mysql.createConnection({
      host: "localhost",
      user: "cohen3",
      password: "S217164",
      database: "cohen3"
        });
        con.connect(function(err) {
            if (err) throw err;
        });
        return con;
}

var con = openSQL();

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/" + "home.html");
})

app.get('/play', function (req, res) {
    res.sendFile(__dirname + "/public/" + "game.html");
})

app.get('/localplay', function (req, res) {
    res.sendFile(__dirname + "/public/" + "localGame.html");
})

// url/board?find=query
app.get('/board', function (req, res) {
    //get board pieces
    var idList = req.query.find;
    query = "SELECT * FROM Faculty WHERE ID in "+idList;
    console.log(query)
    con.query(query, function(err,result,fields) {
	     if (err) throw err;
	     res.end(JSON.stringify(result));
    })
})

partners=[];
localPartners=[];
var localPlayers=0;
var pickList=[];
var room=1;

console.log("Loaded index file");
// Loading socket.io
const { Server } = require("socket.io");
const io = new Server(server);
//var io = require('socket.io').listen(server);

// When a client connects, we note it in the console
io.sockets.on('connection', function(socket) {
    console.log('A client is connected!');

    socket.on('message', function(message) {
	// Join message {operation: 'join', name: clientname}
  	if (message.operation == 'join') {
        socket.join(String(room));
        console.log('Client: ' + message.name + " joins room: " + room);
        // Send join message to all other clients
  	    partners.push(message.name);
  	    io.sockets.to(String(room)).emit('message', {
  		      operation: 'join',
  		      name: message.name,
  		      partners: partners,
            room: String(room)
  	    });
        socket.emit('name', {name:message.name,room:String(room)})
        if (partners.length == 1) {
          socket.emit('playerJoin', {list:partners});
        }
        else { // makes a new room when third, fifth, etc. joins
          socket.broadcast.to(String(room)).emit('playerJoin', {list:partners});
          room++;
          partners=[]

        }
  	}
    if (message.operation == 'localJoin') {
        console.log("Client: joins");
        if(id%2==0){
          localPartners.push([id,id+1]);
        }

        localPlayers+=1;
        io.emit('message', {
            operation: 'localJoin',
            players: localPlayers,
        });
        if (localPlayers %2 !=0) {
          socket.emit('localJoin', {players: localPlayers, id: id});
        }
        else {
          socket.broadcast.emit('localJoin', {players: localPlayers, id: id});
        }

        id+=1;
    }
  	// Join message {operation: 'join', name: clientname}
  	if (message.operation == 'signout') {
  	    console.log('Client: ' + message.name + " leaves");
  	    // Send signout message to all other clients
  	    // Remove from partner list
  	    var index = partners.indexOf(message.name);
  	    if (index !== -1) partners.splice(index, 1);
  	    console.log("P:"+partners+":"+index);
  	    io.sockets.to(message.room).emit('message', {
  		      operation: 'leave',
  		        name: message.name,
  		          partners: partners
  	    });
        socket.broadcast.to(message.room).emit('disconnected', {
          idList: localPartners,
            nameList: partners
        });
  	}
  	// Message from client {operation: 'mess', name: clientname, test: message}
  	 if (message.operation == 'mess') {
  	    console.log('Message: ' + message.text);

        if(message.name=='win' || message.name=='lose' || message.name=='guess wrong'){
          console.log("win,lose,or guess wrong");
          io.sockets.to(message.room).emit('message', {
            operation: 'guessPrint',
            name: message.name,
            text: message.text
          });
        }
        else {
          io.sockets.to(message.room).emit('message', {
            operation: 'mess',
            name: message.name,
            text: message.text
          });
        }
  	   }
     });
    socket.on('gameStart', function(gameStart) {
      console.log('gameStart');
      pickList=[];
      console.log(typeof(gameStart.room));
      io.sockets.to(gameStart.room).emit('start', {query: gameStart.query});

    });
    socket.on('playerPicked', function(playerPicked) {
      console.log("playerpicked");
      pickList.push([playerPicked.name,playerPicked.pick]);
      console.table(pickList);
      io.sockets.to(playerPicked.room).emit('getPick', {name: playerPicked.name, pick: playerPicked.pick});
    });
    socket.on('switchTurn', function(switchTurn) {
      io.sockets.to(switchTurn.room).emit('switch');
    });
    // socket.on('guessWrong', function(guess) {
    //   socket.emit.to(guess.room).emit('guessMess', {name: guess.name});
    // });
    socket.on('lose', function(guess) {
      console.log('lose');
      io.sockets.to(guess.room).emit('losePrint', {winner: guess.winner});
    });
    socket.on('win', function(win) {
      console.log('win');
      io.sockets.to(win.room).emit('winPrint', {loser: win.loser});
    });
    socket.on('noMoves', function(noMoves) {
      io.sockets.to(noMoves.room).emit('movesEnd', {failer: noMoves.name});
    });
    socket.on('localStart', function(localStart) {
      console.log('localStart');
      io.sockets.to(localStart.room).emit('localStart', {query: localStart.query});
    });
});

server.listen(port, () => {
  console.log(`Example app listening at http://jimskon:${port}`);
});
