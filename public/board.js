var port=9018;
const Url='http://jimskon.com:'+port;
var pickedChar = false;
var guesses = 3;
var socket = io.connect('http://jimskon.com:'+port);
var myname = '';
var mypick = '';

socket.on('playerJoin', function(playerJoin) {
  if (playerJoin.list.length == 1) {
    waitingPLayer();
  }
  if (playerJoin.list.length == 2) {
    socket.emit('gameStart', {query: buildIDList(20)});
  }
})

socket.on('name', function(name) {
  myname = name.name;
  console.log(myname)
})

socket.on('start', function(start) {
  var idlist = start.query
  getGameLayout(idlist)
})

socket.on('guess', function(guess) {

})

function waitingPLayer() {
  document.getElementById('gameBoard').innerHTML='<h2>Waiting For Another Player</h2>';
}

function getGameLayout(idlist){
  getBoard(idlist)
  buildGuessMenu()
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
  console.log(list, list.length)
  var pick = '<div class="row">Select a character for your opponent to guess:</div>';
  document.getElementById('pickChar').innerHTML=pick;

  var board = '<div class="row board">';

  for (var i = 0; i < list.length; i++) {
    board += '<div class="gamepiece col-sm-3" id="'+list[i]['First']+' '+list[i]['Last']+'">'+list[i]['First']+' '+list[i]['Last']+'<a><img src="'+list[i]['URL']+'"></a></div>';
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
        mypick = piece.id.trim();
        displayhiddenChar(piece.innerHTML);
        document.getElementById('pickChar').innerHTML='';
        piece.classList.remove('gamepiece-grey');
        pickedChar=true;
        socket.emit('playerPicked',{name:myname, pick:mypick});
      }
    })
  })
  return null;
}

function displayhiddenChar(hiddenChar) {
  document.getElementById('hiddenChar').innerHTML='<div class="purple"><div>Your Mystery Character:</div><div class="hiddenChar center">'+hiddenChar+'</div></div>';
}

function buildGuessMenu() {
  var guessData = '<div class="row guesses">';
  guessData += '<div class="col-sm-4">Guesses Left: '+guesses+'</div>';
  guessData += '<div class="col-sm-2"></div>';
  guessData += '<div class="col-sm-3"><input type="text" placeholder="Guess"></div>';
  guessData += '<div class="col-sm-1 left"><button type="button">Guess</button></div>';
  guessData += '</div>';
  document.getElementById('guesses').innerHTML=guessData;
}
