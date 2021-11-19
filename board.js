
var port=9018;
const Url='http://jimskon.com:'+port;


document.getElementById('board').addEventListener("click", getBoard);

function getBoard() {
    console.log('getting board')
    fetch(Url+'/board', {
	method: 'get'
    })
	.then (response => response.text() )
        .then (data => data)
	.catch(error => {
	    {alert("Error: Something went wrong:"+error);}
	})
}

function processResults(data){
  
}

// Build output table from comma delimited list
function buildTable(list) {
    var a = list.split(",");
    if (a.length < 1) {
	return "<h3>Internal Error</h3>";
    } else if (a.length == 1) {
	return "<h3>Nothing Found</h3>";
    } else {
	var aLen = a.length;
	for (var i = 1; i < aLen; i+=5) {
<<<<<<< Updated upstream
	    result += "<tr><td class='professor'>"+a[i]+"</td><td class='professor'>"+a[i+1]+"</td><td class='professor'>"+a[i+2]+"</td><td class='type'>"+a[i+3]+"</td>";
=======
	    result += "<tr><td class='first'>"+a[i]+"</td><td class='last'>"+a[i+1]+"</td><td class='phone'>"+a[i+2]+"</td><td class='type'>"+a[i+3]+"</td>";
>>>>>>> Stashed changes
	}
	result += "</table>";

	return result;
    }
=======
document.getElementById('board').addEventListener("click", getBoard);
