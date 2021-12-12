// Simple multi client chat
// Jim Skon, 2021
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
const Url='http://jimskon.com:'+port

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
	     res.end( JSON.stringify(result));
    })
})

partners=[];
var localPlayers=0;
var pickList=[];

console.log("Loaded index file");
// Loading socket.io
const { Server } = require("socket.io");
const io = new Server(server);
//var io = require('socket.io').listen(server);

// When a client connects, we note it in the console
io.sockets.on('connection', function(socket) {
    console.log('A client is connected!');
    // watch for message from client (JSON)
    socket.on('message', function(message) {
	// Join message {operation: 'join', name: clientname}
  	if (message.operation == 'join') {
  	    console.log('Client: ' + message.name + " joins");
  	    // Send join message to all other clients
  	    partners.push(message.name);
  	    io.emit('message', {
  		      operation: 'join',
  		      name: message.name,
  		      partners: partners
  	    });
        socket.emit('name', {name:message.name})
        if (partners.length == 1) {
          socket.emit('playerJoin', {list:partners});
        }
        else {
          socket.broadcast.emit('playerJoin', {list:partners});
        }
  	}
    if (message.operation == 'localJoin') {
        console.log("Client: joins");

        localPlayers+=1;
        io.emit('message', {
            operation: 'localJoin',
            players: localPlayers
        });
        if (localPlayers %2 !=0) {
          socket.emit('localJoin', {players: localPlayers});
        }
        else {
          socket.broadcast.emit('localJoin', {players: localPlayers});
        }
    }
  	// Join message {operation: 'join', name: clientname}
  	if (message.operation == 'signout') {
  	    console.log('Client: ' + message.name + " leaves");
  	    // Send signout message to all other clients
  	    // Remove from partner list
  	    var index = partners.indexOf(message.name);
  	    if (index !== -1) partners.splice(index, 1);
  	    console.log("P:"+partners+":"+index);
  	    io.emit('message', {
  		operation: 'leave',
  		name: message.name,
  		partners: partners
  	    });
  	}
  	// Message from client {operation: 'mess', name: clientname, test: message}
  	if (message.operation == 'mess') {
  	    console.log('Message: ' + message.text);

        if(message.name=='win' || message.name=='lose' || message.name=='guess wrong'){
          console.log("win,lose,or guess wrong");
          // socket.broadcast.emit('message', {
          // operation: 'guessPrint',
          // result: message.result,
          // text: message.text
          //   });
            // sent back out to everyone
          socket.broadcast.emit('message', {
          operation: 'guessPrint',
          name: message.name,
          text: message.text
            });
            // send back to sender
          socket.emit('message', {
          operation: 'guessPrint',
          name: message.name,
          text: message.text
            });
        } else {
          // sent back out to everyone
          socket.broadcast.emit('message', {
        operation: 'mess',
        name: message.name,
        text: message.text
          });
          // send back to sender
          socket.emit('message', {
        operation: 'mess',
        name: message.name,
        text: message.text
          });
        }

  	}

    // if (message.operation == 'guessMessage') {
    //   console.log("guessMessage gamerserver");
    //   socket.broadcast.emit('message', {
    // operation: 'guessPrint',
    // result: message.result,
    // text: message.text
    //   });
    // }
      });
    socket.on('gameStart', function(gameStart) {
      console.log('gameStart');
      pickList=[];
      socket.broadcast.emit('start', {query: gameStart.query});
      socket.emit('start', {query: gameStart.query});
    });
    socket.on('playerPicked', function(playerPicked) {
      console.log("playerpicked");
      pickList.push([playerPicked.name,playerPicked.pick]);
      console.table(pickList);
      socket.broadcast.emit('getPick', {picks: pickList});
      socket.emit('getPick', {picks: pickList});

    });
    socket.on('localStart', function(localStart) {
      console.log('localStart');
      socket.broadcast.emit('localStart', {query: localStart.query});
      socket.emit('localStart', {query: localStart.query});
    });
    socket.on('switchTurn', function(switchTurn) {
      socket.broadcast.emit('switch');
      socket.emit('switch');
    });
    socket.on('guess', function(guess) {
      console.log('guess gameServer.js');
      console.log("result:"+guess.result);
      socket.broadcast.emit('guessMess', {name: guess.name, result: guess.result});
      socket.emit('guessMess', {name: guess.name, result: guess.result});
    });
});

server.listen(port, () => {
  console.log(`Example app listening at http://jimskon:${port}`);
});
