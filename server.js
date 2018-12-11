// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);
var userId = 0;

var brickRowCount = 6;
var brickColumnCount = 6;

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

// Add the WebSocket handlers
io.on('connection', function(socket) {
});

function generateRandomNumber(min, max) 
{
    return Math.random() * (max-min) + min ;
}

var x = new Array(brickRowCount);
var y = new Array(brickRowCount);
var radius = new Array(brickRowCount);
var r = new Array(brickRowCount);
var g = new Array(brickRowCount);
var b = new Array(brickRowCount);
for(i=0; i<brickRowCount; i++) {
	x[i] = new Array(brickColumnCount);
	y[i] = new Array(brickColumnCount);
	radius[i] = new Array(brickColumnCount);
	r[i] = new Array(brickColumnCount);
	g[i] = new Array(brickColumnCount);
	b[i] = new Array(brickColumnCount);
	for(j=0; j<brickColumnCount; j++) {
		x[i][j] = generateRandomNumber(100, 700);
		y[i][j] = generateRandomNumber(100, 500);
		radius[i][j] = generateRandomNumber(2, 20);
		r[i][j] = Math.floor(Math.random()*255);
		g[i][j] = Math.floor(Math.random()*255);
		b[i][j] = Math.floor(Math.random()*255);
	}
}

var map = {
	coordX: x,
	coordY: y,
	coordRadius: radius,
	coordR: r,
	coordG: g,
	coordB: b
}

io.sockets.emit('map', map);

var players = {};
io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = {
      x: generateRandomNumber(100, 700),
      y: generateRandomNumber(100, 500),
	  r: 10,
	  id: userId, 
	  status: 1
    };
	io.sockets.emit('map', map);
	userId++;
  });
  
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= 3;
    }
    if (data.up) {
      player.y -= 3;
    }
    if (data.right) {
      player.x += 3;
    }
    if (data.down) {
      player.y += 3;
    }
  });
  
  socket.on('radiusChange', function(id) {
    var player = players[socket.id] || {};
	if(player.id == id)
	{
		player.r++;
	}
  });
 
});

setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);