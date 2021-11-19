


document.getElementById('board').addEventListener("click", getBoard);

function getBoard() {
    console.log('getting board')
    fetch(Url+'/board', {
	method: 'get'
    })
	.then (response => response.text() )
        .then (data => processResults(data))
	.catch(error => {
	    {alert("Error: Something went wrong:"+error);}
	})
}
