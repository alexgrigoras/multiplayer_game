var socket = io();
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
var x = canvas.width/2;
var y = canvas.height-30;
var dx = 2;
var dy = -2;
var rightPressed = false;
var leftPressed = false;
var brickRowCount = 6;
var brickColumnCount = 6;
var brickWidth = 55;
var brickHeight = 20;
var brickPadding = 70;
var brickOffsetTop = 70;
var brickOffsetLeft = 70;	  
var ballRadius = 10;
var r = 10;
var gameOverNotify = document.querySelector('.game-over-notify');
var interval;
var bricks = [];
var localMap;
var mapReceived = false;
var maxR = 0;
var maxPlayer = 0;

var movement = {
  up: false,
  down: false,
  left: false,
  right: false
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

socket.emit('new player');
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

// get map
socket.on('map', function(map) {
	mapReceived = true;
	localMap = map;
});

for(var c=0; c<brickColumnCount; c++) {
	bricks[c] = [];
	for(var r=0; r<brickRowCount; r++) {
		bricks[c][r] = { x: 0, y: 0, status: 1 };
	}
}

/////////////////////////////////////////////////////////////////////////////////

function collisionDetection(player) {
  for(var c=0; c<brickColumnCount; c++) {
    for(var r=0; r<brickRowCount; r++) {
      var b = bricks[c][r];
      if(b.status == 1) {
        if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
		  if(player.r > localMap.coordRadius[c][r]) {
			b.status = 0;
			return true;
		  }
        }
      }
    }
  }
  return false;
}

function drawBricks(maxPlayer) {
  var gameEnded = true;
  
  for(var c=0; c<brickColumnCount; c++) {
    for(var r=0; r<brickRowCount; r++) {
      if(bricks[c][r].status == 1) {
		gameEnded = false;
        bricks[c][r].x = localMap.coordX[c][r];
        bricks[c][r].y = localMap.coordY[c][r];
        context.beginPath();
		//context.strokeStyle = "blue";
		context.arc(bricks[c][r].x, bricks[c][r].y, localMap.coordRadius[c][r], 0, 2 * Math.PI);
        context.fillStyle = "rgba(" + localMap.coordR[c][r] + "," + localMap.coordG[c][r] + "," + localMap.coordR[c][r] + ",1)";
        context.fill();
		//context.stroke();
        context.closePath();
      }
    }
  }
  
  if(gameEnded == true)
  {	
	document.getElementById('youWon').innerHTML = "-> Player " + String(maxPlayer) + " won <-"; 
	gameOverNotify.style.display = 'flex';
	clearInterval(interval);
	return;
  }
}

function drawBalls(players) {
  context.fillStyle = 'green';
  for (var id in players) {
	var player = players[id];
	context.beginPath();
	context.fillStyle = "white";
	context.strokeStyle = "black";
	context.arc(player.x, player.y, player.r, 0, 2 * Math.PI);
	context.font = String(player.r) + "px Georgia";
	context.fill();
	context.stroke();
	context.beginPath();
	context.fillStyle = "red";
	context.fillText(String(player.id), player.x-player.r/3, player.y+player.r/3);
	context.fill();
  }
}

socket.on('state', function(players) {
  context.clearRect(0, 0, 800, 600);
  
  var score = "";
  for (var id in players) {
	var player = players[id];
	x = player.x;
	y = player.y;
	r = player.r;
	id = player.id;
	
	if(r > maxR){
		maxR = r;
		maxPlayer = id;
	}
	
	score += "Player " + String(id) + " -> score: " + String(r - 10) + "<br />";
	
	if(mapReceived) {
		drawBricks(maxPlayer);
	}
	
	if (collisionDetection(player)) {
		//console.log('collision on player: ' + id)
		socket.emit('radiusChange', id);
	}
  }
  
  document.getElementById('userNumber').innerHTML = score;
  
  drawBalls(players);

});
