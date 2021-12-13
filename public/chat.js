var port=9018;
var socket = io.connect('http://jimskon.com:'+port);
var state="off";
var myname="";
var turn = false;
var room = ""
var opponentPick=""

document.getElementById('answer').style.display = 'none';
document.getElementById('waiting').style.display = 'none';

// Watch for incoming messages from server (chatapp.js)
socket.on('message', function(message) {
    // A join message: {operation: 'join', name: clientname}
  if (message.operation == 'join') {
  	if (state=="off") {
  	    console.log("Not logged in!");
  	    return;
  	}
    room=str(message.room)
    if (message.partners.length == 1) {
      console.log("turn true");
      turn = true;
    }
    if (turn) {
      document.getElementById('chatinput').style.display = 'block';
      document.getElementById('guessArea').style.display = 'block';
    }
    else {
      document.getElementById('waiting').style.display = 'block';
    }

  	var names=message.partners;
  	console.log(names);
  	var name=message.name;;
    if(message.name==myname){
      document.getElementById('chatBox').innerHTML +=
    	    "<font style='color:#524a72;'>User Joins: </font>" + name + "<br />";
    } else {
      document.getElementById('chatBox').innerHTML +=
    	    "<font style='color:#fdf993;'>User Joins: </font>" + name + "<br />";
    }
  	var groupList="";
  	for (var n in names) {
  	    groupList+=names[n]+", ";
  	}
  	groupList=groupList.slice(0,-2);
  	document.getElementById('members').innerHTML =
  	    "<b>Chat Group:</b> "+"<font color='#ffffff94'>"+groupList+"</font>";
  }
  if (message.operation == 'leave') {
  	if (state=="off") {
  	    return;
  	}
  	var name=message.name;
  	document.getElementById('chatBox').innerHTML = ''+name+"<font color='red'>: has left the room.</font><br />";
  	var groupList="";
  	for (var n in message.partners) {
  	    groupList+=message.partners[n]+", ";
  	}
  	groupList=groupList.slice(0,-2);
  	document.getElementById('members').innerHTML = "<b>Chat Group:</b> "+"<font color='blue'>"+groupList+"</font>";
  }
      // A text message: {operation: 'mess', name: clientname, text: message}
  if (message.operation == 'mess') {
    console.log("in mess");
  	if (state=="off") {
  	    return;
  	}
    if(message.name=='wrong guess') {
      console.log("in guessPrint2");
      document.getElementById('chatBox').innerHTML +=
             "<h5 class='center' style='color:#524a72;'>" + message.text + "</h5><br />";
    } else if(message.name==myname){
      document.getElementById('chatBox').innerHTML +=
    	    "<font style='color:#524a72;'>" + message.name + ": </font>" + message.text + "<br />";
    } else {
      document.getElementById('chatBox').innerHTML +=
    	    "<font style='color:#fdf993;'>" + message.name + ": </font>" + message.text + "<br />";
    }
  }
})

document.getElementById('chatinput').style.display = 'none';
document.getElementById('guessArea').style.display = 'none';
document.getElementById('status').style.display = 'none';
// Action if they push the join button
document.getElementById('name-btn').addEventListener("click", (e) => {
    myname = document.getElementById('yourname').value;
    state="on";
    document.getElementById('register').style.display = 'none';
    document.getElementById('status').style.display = 'block';
    document.getElementById('user').innerHTML = "<b>Name:</b> <font color='#ffffff94'>"+myname+"</font>";
    socket.emit('message', {operation: "join",name: myname, room:room});
})
document.getElementById('leave').addEventListener("click", leaveSession);
document.getElementById('send-btn').addEventListener("click", () => {
  sendText();
  document.getElementById('waiting').style.display = 'block';
  document.getElementById('answer').style.display = 'none';
  socket.to(room).emit('switchTurn',{room:room});
});

// Watch for enter on message box
document.getElementById('message').addEventListener("keydown", (e)=> {
  if (e.code == "Enter") {
	   sendText();
     document.getElementById('waiting').style.display = 'block';
     document.getElementById('answer').style.display = 'none';
     socket.to(room).emit('switchTurn', {room:room});
  }
});

document.getElementById('yes').addEventListener("click", yesText);
document.getElementById('no').addEventListener("click", noText);


socket.on('guessMess', function(guess) {
  var message = " "+guess.name+" guessed wrong.";

  console.log("abt to emit");
  console.log(message);

  socket.to(room).emit('message', {
    operation: "mess",
    name: 'wrong guess',
    text: message,
    room:room
  });
});

socket.on('switch', function() {
  if (turn) {
    turn = false;
  }
  else {
    turn = true;
    document.getElementById('waiting').style.display = 'none';
    document.getElementById('answer').style.display = 'block';
  }
});

// Call function on page exit
window.onbeforeunload = leaveSession;


//function called on submit or enter on text input
function sendText() {
    var message = document.getElementById('message').value;
    document.getElementById('message').value = "";

    socket.to(room).emit('message', {
	     operation: "mess",
	      name: myname,
	       text: message,
         room:room
    });
    document.getElementById('chatinput').style.display = 'none';
    document.getElementById('guessArea').style.display = 'none';

}

function yesText() {
  socket.to(room).emit('message', {
     operation: "mess",
      name: myname,
       text: "Yes!",
       room:room
  });
  document.getElementById('answer').style.display = 'none';
  document.getElementById('chatinput').style.display = 'block';
  document.getElementById('guessArea').style.display = 'block';
}

function noText() {
  socket.to(room).emit('message', {
     operation: "mess",
      name: myname,
       text: "NO!",
       room:room
  });
  document.getElementById('answer').style.display = 'none';
  document.getElementById('chatinput').style.display = 'block';
  document.getElementById('guessArea').style.display = 'block';
}

function leaveSession(){
    state="off";
    socket.to(room).emit('message', {
	     operation: "signout",
	       name: myname,
         room:room
    });
    document.getElementById('yourname').value = "";
    document.getElementById('register').style.display = 'block';
    document.getElementById('user').innerHTML = "";
    document.getElementById('chatinput').style.display = 'none';
    document.getElementById('status').style.display = 'none';

}
