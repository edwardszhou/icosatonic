var express = require('express');
var app = express();

var Datastore = require('nedb');
var recordingsdb = new Datastore({ filename: 'recordings.txt', autoload: true });

app.use(express.static('public'));

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
		
		recordingsdb.find({}).sort({timeCreated: 1}).exec((err, recordings)=> {
			for(let recording of recordings) {
				socket.emit('new-recording', recording);
			}
		});

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

		socket.on('new-recording', (recording) => {
			let recordingObj = {
				recording: recording,
				sid: socket.id,
				timeCreated: Date.now(),
				name: new Date().toISOString().replace(/[TZ]/g, ' ').slice(0, -5) // name is date in specific format
			}
			recordingsdb.insert(recordingObj, (err, newRec) => {
				if(err) console.log(err);
				else console.log(`inserted ${newRec}`);
			})

			let idToRemove;
			recordingsdb.count({}, function (err, count) {
				if(err) console.log(err);

				if(count > 15) { // if count is >15, remove oldest
					
					recordingsdb.find({}).sort({timeCreated: 1}).limit(1).exec((err, recording)=> { // find all recordings, sort by creation date, get first
						idToRemove = recording[0]._id
						recordingsdb.remove({ _id: idToRemove }, {}, (err, numRemoved)=> {
							console.log('removed oldest recording');
						});
					})
				}
			});
				

			io.emit('new-recording', recordingObj);
		})
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
