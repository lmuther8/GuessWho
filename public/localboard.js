var port=9018;
const Url='http://jimskon.com:'+port;
var pickedChar = false;
var socket = io.connect('http://jimskon.com:'+port);

socket.emit('localplay');

socket.on('localWait', function(localWait) {
  if (localWait.numPlayers == 1) {
  }
  if (localWait.numPlayers == 2) {
    socket.emit('localStart', {query: buildIDList(20)});
  }
})
socket.on('localGameOn', function(localGameOn) {
  var idlist = localGameOn.query
  getBoard(idlist)
})

socket.on('disconnect',function(){
  console.log(socket.id);
  socket.emit('localLeave');
});


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
  var pick = '<h6 class="row purple purple-text">Select a character for your opponent to guess:</h6>';
  document.getElementById('pickChar').innerHTML=pick;

  var board = '<div class="row board">';
  console.log(list)
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
