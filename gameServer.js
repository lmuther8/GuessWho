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

var localPlayers = 0

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
    // query = "SELECT * FROM Faculty WHERE ID in (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)";
    console.log(query)
    con.query(query, function(err,result,fields) {
	     if (err) throw err;
	     res.end( JSON.stringify(result));
    })
})

partners=[];
player1 = '';
player2 = '';
player1pick = '';
player2pick = '';

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
      });
    socket.on('gameStart', function(gameStart) {
      console.log('gameStart');
      socket.broadcast.emit('start', {query: gameStart.query});
      socket.emit('start', {query: gameStart.query});
    });
    socket.on('playerPicked', function(playerPicked) {
      if (player1pick.length == 0) {
        player1pick = playerPicked.pick;
        player1 = playerPicked.name;
        console.log(`player 2 picked: ${player1pick}`);
      }
      else {
        player2pick = playerPicked.pick;
        player2 = playerPicked.name;
        console.log(`player 2 picked: ${player2pick}`);
      }
    });
    socket.on('localplay', function(localplay) {
      console.log(localPlayers)
      localPlayers+=1;
      socket.broadcast.emit('localWait',{numPlayers:localPlayers});
      socket.emit('localWait',{numPlayers:localPlayers});
    });
    socket.on('localStart', function(localStart) {
      socket.broadcast.emit('localGameOn', {query: localStart.query});
      socket.emit('localGameOn', {query: localStart.query});
    });
    socket.on('localLeave',function(localLeave){
      localPlayers-=1;
    });
});

server.listen(port, () => {
  console.log(`Example app listening at http://jimskon:${port}`);
});
