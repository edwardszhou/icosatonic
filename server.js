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

let users = [];


var io = require('socket.io')(httpServer);

io.sockets.on('connection', 
	function (socket) {
		console.log("We have a new client: " + socket.id);
		for(let user of users) {
			socket.emit('new-user', {color: user.color, sid: user.sid});
		}
		console.log(users);

		socket.on('new-user', (data) => {
			let newUser = {color: data, sid: socket.id}
			users.push(newUser);
			socket.broadcast.emit('new-user', newUser);
		});

		socket.on('bow', (data) => {
			socket.broadcast.emit('bow', {planeNum: data, sid: socket.id});
		});

		socket.on('unbow', (data) => {
			socket.broadcast.emit('unbow', {planeNum: data, sid: socket.id});
		});

		socket.on('disconnect', () => {
			console.log("Client has disconnected " + socket.id);

			for(let i = 0; i < users.length; i++) {
				if(users[i].sid == socket.id) {
					users.splice(i, 1);
					break;
				}
			}

			socket.broadcast.emit('user-disconnect', socket.id);
		});
	}
);
