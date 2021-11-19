var mysql = require('mysql');
var http = require('http');
var fs = require('fs');

var port = 9018;

var con = mysql.createConnection({
    host: "localhost",
    user: "cohen3",
    password: "S217164",
    database: "cohen3"
  });
con.connect(function(err) {
    if (err) throw err;
});

var server = http.createServer(function(req, res) {
  var url = req.url;
  // If no path, get the index.html
  if (url == "/") url = "/phoneApp.html";
  // get the file extension (needed for Content-Type)
  var ext = url.split('.').pop();
  console.log(url + "  :  " + ext);
  // convert file type to correct Content-Type
  var mimeType = 'text/html'; // default
  switch (ext) {
    case 'css':
      mimeType = 'text/css';
      break;
    case 'png':
      mimeType = 'text/png';
      break;
    case 'jpg':
      mimeType = 'text/jpeg';
      break;
    case 'js':
      mimeType = 'application/javascript';
      break;
    }
// Send the requested file
fs.readFile('.' + url, 'utf-8', function(error, content) {
res.setHeader("Content-Type", mimeType);
res.end(content);
  });
});

// Set up socket.io communication
var io = require('socket.io').listen(server);

// Perform search, send results to caller
function sendQueryResults(query,socket) {
	//console.log(query);
    con.query(query, function (err, result, fields) {
		if (err) throw err;
		var results = [];
		Object.keys(result).forEach(function(key) {
			var row = result[key];
			results.push(row);
			//console.log(row.First+" "+row.Last+", Phone:"+row.Phone+"  ["+row.Type+"]");
		});
		socket.emit('message', {
    		operation: 'rows',
    		rows: results
    	});
	});
}
