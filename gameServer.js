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
const port=9018
const Url='http://jimskon.com:'+port

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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const databaseLength = 35;
function buildIDList(length){
  var idList=[];
  while (idList.length<20){
    var int = getRandomInt(1,databaseLength);
    if (!(idList.includes(int))){
      idList.push(int);
    }
  }
  idList="("+idList.join(",")+")"
  return idList;
}

var idList = buildIDList(databaseLength);
console.log(idList)

app.get('/board', function (req, res) {
    //get board pieces
    query = "SELECT * FROM Faculty";
    con.query(query, function(err,result,fields) {
	     if (err) throw err;
	     res.end( JSON.stringify(result));
    })
})

partners=[];

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
});

server.listen(port, () => {
  console.log(`Example app listening at http://jimskon:${port}`);
});
