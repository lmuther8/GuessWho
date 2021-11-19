


document.getElementById('board').addEventListener("click", getBoard);

function getBoard(results) {
    // Look up the record and display it
    document.getElementsByClassName('editdata')[0].style.display = 'none';

    fetch(Url+'/board', {
	method: 'get'
    })
	.then (response => response.text() )
        .then (data => processResults(data))
	.catch(error => {
	    {alert("Error: Something went wrong:"+error);}
	})
}
