var express = require('express');
var app = express();

var Datastore = require('nedb'); // local database to store recording data
var recordingsdb = new Datastore({ filename: 'recordings.txt', autoload: true });

app.use(express.static('public'));

var http = require('http');

var httpServer = http.createServer(app);

httpServer.listen(8080, () => {
    console.log('server has started on port 8080')
})


/* array of objects storing users: {} */
let users = [];


var io = require('socket.io')(httpServer);

io.sockets.on('connection', 
	function (socket) {
		console.log("We have a new client: " + socket.id);

		// loads all existing users to new user
		for(let user of users) {
			socket.emit('new-user', {color: user.color, sid: user.sid});
		}
		
		// loads all recordings to new user in chronological order
		recordingsdb.find({}).sort({timeCreated: 1}).exec((err, recordings)=> {
			for(let recording of recordings) {
				socket.emit('new-recording', recording);
			}
		});

		/**
		 * Handle new user event, adds user to server storage and emits to other users
		 * 
		 * @param {string} data hsl string representing color of new user
		 */
		socket.on('new-user', (data) => {
			let newUser = {color: data, sid: socket.id}
			users.push(newUser);
			socket.broadcast.emit('new-user', newUser);
		});

		/**
		 * Handle bow event, broadcasts to other users
		 * 
		 * @param {number} data plane number to bow
		 */
		socket.on('bow', (data) => {
			socket.broadcast.emit('bow', {planeNum: data, sid: socket.id});
		});

		/**
		 * Handle unbow event, broadcasts to other users
		 * 
		 * @param {number} data plane number to unbow
		 */
		socket.on('unbow', (data) => {
			socket.broadcast.emit('unbow', {planeNum: data, sid: socket.id});
		});

		/**
		 * Handle new recording from user, assigns name and id to recording
		 * Updates recording database and relays to every user
		 * 
		 * @param {array} recording [0]: recording data array; [1]: recording users array
		 */
		socket.on('new-recording', (recording) => {

			// creates object representation with timeCreated (id) and name
			let recordingObj = {
				recording: recording[0],
				recordedUsers: recording[1],
				sid: socket.id,
				timeCreated: Date.now(),
				name: new Date().toISOString().replace(/[TZ]/g, ' ').slice(0, -5) // name is date in specific format
			}
			
			// insert into database
			recordingsdb.insert(recordingObj, (err, newRec) => {
				if(err) console.log(err);
				else console.log(`inserted ${JSON.stringify(newRec)}`);
			})

			let idToRemove;
			// count total number in database to see if removal is necessary
			recordingsdb.count({}, function (err, count) {
				if(err) console.log(err);

				if(count > 15) { // if count is >15, remove oldest
					
					recordingsdb.find({}).sort({timeCreated: 1}).limit(1).exec((err, recording)=> { // find all recordings, sort by creation date, get first
						idToRemove = recording[0]._id
						// removes oldest recording
						recordingsdb.remove({ _id: idToRemove }, {}, (err, numRemoved)=> {
							console.log('removed oldest recording');
						});
					})
				}
			});
			io.emit('new-recording', recordingObj);
		})

		/**
		 * Handles user disconnect event, removes from server user list and relays to other users
		 */
		socket.on('disconnect', () => {
			console.log("Client has disconnected " + socket.id);

			// removes from user list
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
