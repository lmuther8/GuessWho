
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

      //pick character at start of game
      if(!pickedChar){
        //get name of character picked
        //var hiddenChar= piece.innerHTML.substr(0, piece.innerHTML.indexOf(' '));
        //var hiddenChar = piece.innerHTML;
        //console.log(hiddenChar);
        //console.log(piece);
        console.log(piece.innerHTML);
        displayhiddenChar(piece.innerHTML);
        document.getElementById('pickChar').innerHTML='';
        pickedChar=true;
      }

      if (piece.classList.contains('gamepiece-grey')) {
        piece.classList.remove('gamepiece-grey');
      }
  		else {
        piece.classList.add('gamepiece-grey');
  	  }
    })
  })

  return null;
}

function displayhiddenChar(hiddenChar) {
  var hiddenChar = '<div class="gamepiece">'+hiddenChar+'</div>';
  document.getElementById('hiddenChar').innerHTML=hiddenChar;
}

function buildGuessMenu() {
  var guessData = '<div class="row">Guesses: </div>';
  document.getElementById('guesses').innerHTML=guessData;
}
