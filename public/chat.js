var port=9018;
var socket = io.connect('http://jimskon.com:'+port);
var state="off";
var myname="";
var turn = false;
var room = ""
var opponentPick=""
var guesses=[]


//from board
const Url='http://jimskon.com:'+port;
var pickedChar = false;
var guesses = 3;
var mypick = '';
var guess='';


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
    room=String(message.room)
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
  	    "<b>Players:</b> "+"<font color='#ffffff94'>"+groupList+"</font>";
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
  	document.getElementById('members').innerHTML = "<b>Players:</b> "+"<font color='blue'>"+groupList+"</font>";
  }
      // A text message: {operation: 'mess', name: clientname, text: message}
  if (message.operation == 'mess') {
    console.log("in mess");
  	if (state=="off") {
  	    return;
  	}
    if(message.name=='wrong guess') && (!(message.text in guessMessages) {
      guessMessages.push(message.text);
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
  socket.emit('switchTurn',{room:room});
});

// Watch for enter on message box
document.getElementById('message').addEventListener("keydown", (e)=> {
  if (e.code == "Enter") {
	   sendText();
     document.getElementById('waiting').style.display = 'block';
     document.getElementById('answer').style.display = 'none';
     socket.emit('switchTurn', {room:room});
  }
});

document.getElementById('yes').addEventListener("click", yesText);
document.getElementById('no').addEventListener("click", noText);


socket.on('guessMess', function(guess) {
  var message = ""+guess.name+" guessed wrong.";
  console.log("abt to emit");
  console.log(message);

  socket.emit('message', {
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


var leave = function() {
    state="off";
    socket.emit('message', { operation: "signout", name: myname, room:room });
}
// Call function on page exit
window.onbeforeunload = leave;

//function called on submit or enter on text input
function sendText() {
    var message = document.getElementById('message').value;
    document.getElementById('message').value = "";

    socket.emit('message', {
	     operation: "mess",
	      name: myname,
	       text: message,
         room:room
    });
    document.getElementById('chatinput').style.display = 'none';
    document.getElementById('guessArea').style.display = 'none';

}

function yesText() {
  socket.emit('message', {
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
  socket.emit('message', {
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
    socket.emit('message', {
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

socket.on('playerJoin', function(playerJoin) {
  if (playerJoin.list.length % 2 != 0) {
    console.log("waiting player");
    waitingPLayer();
  } else {
    socket.emit('gameStart', {query: buildIDList(20), room: room});
  }
})

socket.on('name', function(name) {
  myname = name.name;
  room=name.room;
  console.log(myname)
})

socket.on('start', function(start) {
  console.log("here")
  var idlist = start.query
  getBoard(idlist)
})

socket.on('getPick', function(picks) {
  console.log("getPick");
  if (picks.name!=myname) {
    opponentPick = picks.pick
  }
})

socket.on('losePrint', function(losePrint) {
  if(myname!=losePrint.winner){
    document.getElementById('main').innerHTML = '<div style="margin-left: auto;margin-right: auto;"><h3 color="white">'+losePrint.winner+' guessed correctly.</h3><h1 style="text-align: center;">YOU LOSE</h1><a class="btn btn-warning btn-block" href="/">Main menu</a></div>';
  }
})

socket.on('winPrint', function(winPrint) {
  if(myname!=winPrint.loser){
    document.getElementById('main').innerHTML = '<div style="margin-left: auto;margin-right: auto;"><h3 color="white">'+winPrint.loser+' used up all guesses.</h3><h1 style="text-align: center;">!!! YOU WIN !!!</h1><a class="btn btn-warning btn-block" href="/">Main menu</a></div>';
  }
})

socket.on('disconnected', function(disconnected) {
  document.getElementById('main').innerHTML = '<div style="margin-left: auto;margin-right: auto;"><h3 color="white">Your opponent left the game.</h3><a class="btn btn-warning btn-block" href="/">Main menu</a></div>';
})

function waitingPLayer() {
  document.getElementById('gameBoard').innerHTML='<h2>Waiting For Another Player</h2>';
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
const DATABASELENGTH = 34;
function buildIDList(length){
  var idList=[];
  while (idList.length<length){
    var int = getRandomInt(1,DATABASELENGTH);
    if (!(idList.includes(int))){
      idList.push(int);
    }
  }
  idList="("+idList.join(",")+")"
  return idList;
}

function getBoard(idlist) {
  console.log('getting board')
  fetch(Url+'/board/?find='+idlist, {
	   method:'get'
  })
	.then (response => response.json())
  .then (data => buildBoard(data))
	.catch(error => {
	    {alert("Error: Something went wrong:"+error);}
	})
}

function buildBoard(list) {
  //console.log(list, list.length)
  var pick = '<h6 class="row purple purple-text">Select a character for your opponent to guess:</h6>';
  document.getElementById('pickChar').innerHTML=pick;

  var board = '<div class="row board">';

  for (var i = 0; i < list.length; i++) {
    board += '<div class="gamepiece col-sm-3" style="margin-bottom: 0.8rem;text-align:center;" id="'+list[i]['First']+' '+list[i]['Last']+'">'+list[i]['First']+' '+list[i]['Last']+'<a><img src="'+list[i]['URL']+'"></a></div>';
  }
  board += "</div>";
  document.getElementById('gameBoard').innerHTML=board

  var pieces = document.querySelectorAll(".gamepiece");
  console.log(pieces)
  pieces.forEach(function(piece) {
  	piece.addEventListener('click', function() {
      if (piece.classList.contains('gamepiece-grey')) {
        piece.classList.remove('gamepiece-grey');
      }
  		else {
        piece.classList.add('gamepiece-grey');
  	  }
      //pick character at start of game
      if(!pickedChar){
        //get info about character picked
        var mypick=[];
        for (var i = 0; i < list.length; i++) {
          if(list[i]['First']+' '+list[i]['Last']==piece.id){
            mypick[0]=list[i]['First'];
            mypick[1]=list[i]['Last']
            mypick[2]=list[i]['URL'];
          }
        }

        displayhiddenChar(mypick);
        document.getElementById('pickChar').innerHTML='';
        piece.classList.remove('gamepiece-grey');
        pickedChar=true;
        socket.emit('playerPicked',{name:myname, pick:piece.id, room:room});
      }
    })
  })
  return null;
}

function displayhiddenChar(hiddenChar) {
  document.getElementById('hiddenChar').innerHTML='<div class="purple"><h5 class="center">Mystery Character</h5><div class="center" >'+hiddenChar[0]+' '+hiddenChar[1]+'<div><a><img src="'+hiddenChar[2]+'" style="width: 70%;border-radius: 1rem;"></a></div></div></div>';
}

function guessWrong(guess){
  console.log("Wrong Guess");
  socket.emit('guessWrong', {name: myname,room:room, guess:guess});
}

function gameOver() {
  console.log('game over');
  document.getElementById('main').innerHTML = '<div style="margin-left: auto;margin-right: auto;"><h1>!!! YOU WIN !!!</h1><a class="btn btn-warning btn-block" href="/">Main menu</a></div>';
  //display to loser:
  socket.emit('lose', {winner: myname,room:room});
}

function guessNum() {
  console.log('guessed');
  guesses--;
  document.getElementById('guess').innerHTML = guesses;
  if(guesses==0){
    document.getElementById('main').innerHTML = '<div style="margin-left: auto;margin-right: auto;"><h3 color="white">You used up all guesses.</h3><h1>YOU LOSE</h1><a class="btn btn-warning btn-block" href="/">Main menu</a></div>';
    socket.emit('win', {loser: myname, room:room});
  }
}

function stopPulse() {
  var pieces = document.querySelectorAll(".gamepiece");
  pieces.forEach( function(piece) {
    piece.classList.remove('guessing');
  });
}

document.getElementById('guess-btn').addEventListener("click", (e)=> {
  var pieces = document.querySelectorAll(".gamepiece");
  var guessed=false;
  pieces.forEach(function(piece) {
    piece.classList.add('guessing');
    piece.addEventListener('click', function() {
      console.log("clicked");
      while(!guessed){
        guessed=true;
        guess=piece.id;
        stopPulse();
        console.log("Guess: "+guess+" Opponent Pick: "+opponentPick);
      }

      if (guess==opponentPick) {
        gameOver();
      }
      else {
        guessWrong(guess);
        guessNum();
      }

      // for (let i = 0; i < pickList.length; i++) {
      //   if(!(pickList[i][0]==myname)){
      //     if(guess==pickList[i][1]){
      //       gameOver();
      //     } else {
      //       guessResult();
      //       guessNum();
      //     }
      //   }
      // }
    })
  })
});
