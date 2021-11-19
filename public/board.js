
var port=9018;
const Url='http://jimskon.com:'+port;


document.getElementById('board').addEventListener("click", getBoard);

function getBoard() {
    console.log('getting board')
    fetch(Url+'/board', {
	method:'get'
    })
	.then (response => response.json() )
        .then (data => buildTable(data))
	.catch(error => {
	    {alert("Error: Something went wrong:"+error);}
	})
}

// Build output table from comma delimited list
function buildTable(list) {
  var table = '<table class="w3-table-all w3-hoverable" border="2"><tr><th></th><th>First Name</th><th>Last Name</th><th>URL</th>';

  for (var i = 0; i < list.length; i++) {
table += "<tr><td>"+list[i]["First"]+"</td><td>"+list[i]["Last"]+"</td><td>"+list[i]["URL"]+"</td>";
  }
  table += "</table>";
  document.getElementById('gameBoard').innerHTML=table
  return null;
}


  //   var a = list.split(",");
  //   if (a.length < 1) {
	// return "<h3>Internal Error</h3>";
  //   } else if (a.length == 1) {
	// return "<h3>Nothing Found</h3>";
  //   } else {
	// var aLen = a.length;
	// for (var i = 1; i < aLen; i+=5) {
	//     result += "<tr><td class='professor'>"+a[i]+"</td><td class='professor'>"+a[i+1]+"</td><td class='professor'>"+a[i+2]+"</td><td class='type'>"+a[i+3]+"</td>";	}
	// result += "</table>";
  //
	// return result;
  //   }
