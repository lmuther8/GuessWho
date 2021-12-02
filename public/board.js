
var port=9018;
const Url='http://jimskon.com:'+port;
var pickedChar = false;

document.getElementById('board').addEventListener("click", getGameLayout);


function getGameLayout(){
  getBoard()
  buildGuessMenu()
}

function getBoard() {
    console.log('getting board')
    fetch(Url+'/board', {
	method:'get'
    })
	.then (response => response.json() )
        .then (data => buildBoard(data))
	.catch(error => {
	    {alert("Error: Something went wrong:"+error);}
	})
}

function buildBoard(list) {
  var pick = '<div class="row">Select a character for your opponent to guess:</div>';
  document.getElementById('pickChar').innerHTML=pick;

  var board = '<div class="row">';

  for (var i = 0; i < list.length; i++) {
    board += '<div class="gamepiece col-sm-3">'+list[i]['First']+' '+list[i]['Last']+'<a><img src="'+list[i]['URL']+'"></a></div>';
  }
  board += "</div>";
  document.getElementById('gameBoard').innerHTML=board

  var pieces = document.querySelectorAll(".gamepiece");
  //var hiddenChar;
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
        //get name of character picked
        console.log(piece.innerHTML);
        displayhiddenChar(piece.innerHTML);
        document.getElementById('pickChar').innerHTML='';
        piece.classList.remove('gamepiece-grey');
        pickedChar=true;
      }

    })
  })

  return null;
}

function displayhiddenChar(hiddenChar) {
  //remove hover ability??
  document.getElementById('hiddenChar').innerHTML='<div class="center">Opponent`s hidden character:</div><div class="gamepiece center">'+hiddenChar+'</div>';
}

function buildGuessMenu() {
  var guessData = '<div class="guesses">Guesses Left: </div>';
  document.getElementById('guesses').innerHTML=guessData;
}
