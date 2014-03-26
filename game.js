var init = function() {
	playername = prompt("Enter nickname:", "RandomPlayer");

	netInit();
	globalsInit();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	scene = new THREE.Scene();
	setupRenderer();
	loadMap();
	pointerLockSetup();
	animate();
}

var redrawScoreboard = function() {
	$("#scoreboard").empty();

	var players_a = [{name: playername, score: score}];
	_.each(players, function(player) {
		players_a.push(player);
	});

	players_a.sort(function(a, b) {
		return b.score - a.score;
	});

	for(var i = 0; i < players_a.length; i++) {
		$("#scoreboard").append(players_a[i].name + ": " + players_a[i].score + "<br>");
	}
}

var updateScore = function(cnt) {
	score += cnt;
	$("#score").html("Score: " + score);
	redrawScoreboard();

	socket.emit("update", {
		'score': score,
		'name': playername
	});
}

var respawn = function(reason) {
	console.log(reason);

	// neat hardcoded spawnpoint for now :)
	yawObject.position.x = 0;
	yawObject.position.y = 10;
	yawObject.position.z = 0;
	velocity.x = 0;
	velocity.y = 0;
	velocity.z = 0;
}

var draw_fps = function() {
	$("#fps").html("FPS: " + Math.round(numFrames / (Date.now() - lastFpsTime) * 1000));
	numFrames = 0;
	lastFpsTime = Date.now();
}
var throttledDrawFps = _.throttle(draw_fps, 1000);

// main game loop
function animate() {
	requestAnimationFrame( animate );

	if (mouseDown)
		shoot();

	doMove(Date.now() - prevFrameTime);
	numFrames++;
	throttledDrawFps();
	crosshairReloadUpdate();

	socket.emit("update", {
		'pos': yawObject.position,
		'rotY': yawObject.rotation._y,
		'name': playername
	});

	renderer.render( scene, camera );
	prevFrameTime = Date.now();

	// we're falling and fast... probably fell out of map!
	if(velocity.y < -10) {
		updateScore(-1);
		respawn("Fell out of map");
	}
}

init();
