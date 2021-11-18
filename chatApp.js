// Simple multi client chat
// Jim Skon, 2018
// Kenyon College
// Run: node chatApp.js
const express = require('express');
const app = express();
const http = require('http');
//const server = http.createServer(app)

var fs = require('fs');

//Everyone must use own port > 9000
port=9001

partners=[];
// Loading the index file . html displayed to the client
var server = http.createServer(function(req, res) {
  var url = req.url;
  // If no path, get the index.html
  if (url == "/") url = "/index.html";
  // get the file extension (needed for Content-Type)
  var ext = url.split('.').pop();
  console.log(url + "  :  " + ext);
  // convert file type to correct Content-Type
  var mimeType = 'html'; // default
  switch (ext) {
    case 'css':
      mimeType = 'css';
      break;
    case 'png':
      mimeType = 'png';
      break;
    case 'jpg':
      mimeType = 'jpeg';
      break;
  }
  // Send the requested file
  fs.readFile('.' + url, 'utf-8', function(error, content) {
    res.writeHead(200, {
      "Content-Type": "text/" + mimeType
    });
    res.end(content);
  });
});

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

server.listen(port);
console.log("Listening on port: "+port);
