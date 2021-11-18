// Simple Web chat client
// Jim Skon 2021
// Kenyon College
// port must match  port of client and be >8000
var port=9001;
var socket = io.connect('http://jimskon.com:'+port);
var state="off";
var myname="";
// Watch for incoming messages from server (chatapp.js)
socket.on('message', function(message) {
    // A join message: {operation: 'join', name: clientname}
    if (message.operation == 'join') {
	if (state=="off") {
	    console.log("Not logged in!");
	    return;
	}
	var names=message.partners;
	console.log(names);
	var name=message.name;;
	document.getElementById('chatBox').innerHTML +=
	    "<font color='red'>User Joins: </font>" + name + "<br />";
	var groupList="";
	for (var n in names) {
	    groupList+=names[n]+", ";
	}
	groupList=groupList.slice(0,-2);
	document.getElementById('members').innerHTML =
	    "<b>Chat Group:</b> "+"<font color='blue'>"+groupList+"</font>"; 
    }
    if (message.operation == 'leave') {
	if (state=="off") {
	    return;
	}
	var name=message.name;
	document.getElementById('chatBox').innerHTML + name  + "<font color='red'>: has left the room.</font><br />";
	var groupList="";
	for (var n in message.partners) {
	    groupList+=message.partners[n]+", ";
	}
	groupList=groupList.slice(0,-2);
	document.getElementById('members').innerHTML = "<b>Chat Group:</b> "+"<font color='blue'>"+groupList+"</font>"; 
    }
    // A text message: {operation: 'mess', name: clientname, text: message}
    if (message.operation == 'mess') {
	if (state=="off") {
	    return;
	}
	document.getElementById('chatBox').innerHTML +=
	    "<font color='red'>" + message.name + ": </font>" + message.text + "<br />";
    }
})
document.getElementById('chatinput').style.display = 'none';
document.getElementById('status').style.display = 'none';
// Action if they push the join button
document.getElementById('name-btn').addEventListener("click", (e) => {
    myname = document.getElementById('yourname').value;
    state="on";
    document.getElementById('register').style.display = 'none';
    document.getElementById('status').style.display = 'block';
    document.getElementById('user').innerHTML =
	"<b>Name:</b> <font color='blue'>"+myname+"</font>";
    document.getElementById('chatinput').style.display = 'block';
    // Action if they push the send message button or enter
    socket.emit('message', {
	operation: "join",
	name: myname
    });
})
document.getElementById('leave').addEventListener("click", leaveSession);
document.getElementById('send-btn').addEventListener("click", sendText);

// Watch for enter on message box
document.getElementById('message').addEventListener("keydown", (e)=> {
    if (e.code == "Enter") {
	sendText();
    }   
});

// Call function on page exit
window.onbeforeunload = leaveSession;


//function called on submit or enter on text input
function sendText() {
    var message = document.getElementById('message').value;
    document.getElementById('message').value = "";
    
    socket.emit('message', {
	operation: "mess",
	name: myname,
	text: message
    });
}

function leaveSession(){
    state="off";
    socket.emit('message', {
	operation: "signout",
	name: myname,
    });
    document.getElementById('yourname').value = "";
    document.getElementById('register').style.display = 'block';
    document.getElementById('user').innerHTML = "";
    document.getElementById('chatinput').style.display = 'none';
    document.getElementById('status').style.display = 'none';

}


