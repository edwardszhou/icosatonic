var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
//   res.send('Hello World!')
});

var http = require('http');

var httpServer = http.createServer(app);

httpServer.listen(8000, () => {
    console.log('server has started on port 8000')
})

var io = require('socket.io')(httpServer);

io.sockets.on('connection', 
	function (socket) {
		console.log("We have a new client: " + socket.id);

		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);
