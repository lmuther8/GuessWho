var port=9018;
const Url='http://jimskon.com:'+port;
var pickedChar = false;
var guesses = 3;
var socket = io.connect('http://jimskon.com:'+port);
var myname = '';
var mypick = '';

socket.on('playerJoin', function(playerJoin) {
  console.log("waiting player");
  if (playerJoin.list.length == 1) {
    console.log("waiting player");
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
  getBoard(idlist)
})

function waitingPLayer() {
  document.getElementById('gameBoard').innerHTML='<h2>Waiting For Another Player</h2>';
}

// function getGameLayout(idlist){
//   getBoard(idlist)
//   buildGuessMenu()
// }

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
        buildGuessMenu();
      }
    })
  })
  return null;
}

function displayhiddenChar(hiddenChar) {
  document.getElementById('hiddenChar').innerHTML='<div class="purple"><h5 class="center">Mystery Character</h5><div class="center" id="'+hiddenChar[0]+' '+hiddenChar[1]+'">'+hiddenChar[0]+' '+hiddenChar[1]+'<div><a><img src="'+hiddenChar[2]+'" style="width: 70%;"></a></div></div></div>';
}

// function buildGuessMenu() {
//   var guessData = '<div class="purple">';
//   guessData += '<h5 class="center">Remaining Guesses</h5>';
//   guessData += '<div id="guess" class="center">'+guesses+'</div>';
//   guessData += '<div class="row"><div class="col-sm-9"><input type="text" id="guess-input" class="form-control" placeholder="Guess"></div>';
//   guessData += '<div class="col-sm-3"><button type="button left" id="guess-btn" class="btn btn-warning btn-block right">Guess</button></div>';
//   guessData += '</div></div>';
//   document.getElementById('guesses').innerHTML=guessData;

  //document.getElementById('guess-btn').addEventListener("click", makeGuess());

  document.getElementById('guess-btn').addEventListener("click", (e)=> {
      // var guess = document.getElementById('guess-input').value;
      // console.log(guess);
      //
      // socket.emit('makeGuess', {guess: guess});

      var pieces = document.querySelectorAll(".gamepiece");
      var guessed=false;
      pieces.forEach(function(piece) {
      piece.addEventListener('click', function() {
      while(!guessed){
        console.log(piece.id);
        guessed=true;
      }
      })
      })

      socket.on('playerPicked', function(playerPicked) {
        myname = name.name;
        console.log(myname)
      })


      guesses--;
      document.getElementById('guess').innerHTML = guesses;
      if(guess<=0){
        //you lost
      }
  });
}

// function makeGuess(){
//   //var guess = document.getElementById('guess-input').value;
//   console.log("Guess:"+guess);
// }
