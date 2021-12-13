var port=9018;
const Url='http://jimskon.com:'+port;
var pickedChar = false;
var guesses = 3;
var socket = io.connect('http://jimskon.com:'+port);
var myname = '';
var mypick = '';
var pickList = [];
var guess='';

socket.on('playerJoin', function(playerJoin) {
  if (playerJoin.list.length %2 != 0) {
    console.log("waiting player");
    waitingPLayer();
  } else {
    socket.emit('gameStart', {query: buildIDList(20)});
  }
})

socket.on('name', function(name) {
  myname = name.name;
  console.log(myname)
})

socket.on('start', function(start) {
  var idlist = start.query
  getBoard(idlist)
})

socket.on('getPick', function(picks) {
  console.log("getPick");
  pickList = picks.picks;
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
        socket.emit('playerPicked',{name:myname, pick:piece.id});
      }
    })
  })
  return null;
}

function displayhiddenChar(hiddenChar) {
  document.getElementById('hiddenChar').innerHTML='<div class="purple"><h5 class="center">Mystery Character</h5><div class="center" >'+hiddenChar[0]+' '+hiddenChar[1]+'<div><a><img src="'+hiddenChar[2]+'" style="width: 70%;border-radius: 1rem;"></a></div></div></div>';
}

function guessResult(){
  console.log("MyName:"+myname);
  socket.emit('guessWrong', {name: myname});
}

function gameOver() {
  console.log('game over');
  document.getElementById('main').innerHTML = '<div style="margin-left: auto;margin-right: auto;"><h1>!!! YOU WIN !!!</h1><a class="btn btn-warning btn-block" href="/">Main menu</a></div>';
  //display to loser:
  socket.emit('lose', {winner: myname});
}

function guessNum() {
  console.log('guessed');
  guesses--;
  document.getElementById('guess').innerHTML = guesses;
  if(guesses==0){
    document.getElementById('main').innerHTML = '<div style="margin-left: auto;margin-right: auto;"><h3 color="white">You used up all guesses.</h3><h1>YOU LOSE</h1><a class="btn btn-warning btn-block" href="/">Main menu</a></div>';
    socket.emit('win', {loser: myname});
  }
}

document.getElementById('guess-btn').addEventListener("click", (e)=> {
  var pieces = document.querySelectorAll(".gamepiece");
  var guessed=false;
  pieces.forEach(function(piece) {
    piece.addEventListener('click', function() {
      console.log("clicked");

      while(!guessed){
        console.log(piece.id);
        guessed=true;
        guess=piece.id;
      }

      for (let i = 0; i < pickList.length; i++) {
        if(!(pickList[i][0]==myname)){
          if(guess==pickList[i][1]){
            gameOver();
          } else {
            guessResult();
            guessNum();
          }
        }
      }
    })
  })
});
