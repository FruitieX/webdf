var init = function() {
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	scene = new THREE.Scene();
	setupRenderer();
	loadMap();
	pointerLockSetup();
}

var updateScore = function(cnt) {
	score += cnt;
	$("#score").html("Score: " + score);
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

var numFrames = 0;
var lastFpsTime = Date.now();
function draw_fps() {
	console.log('fps: ' + numFrames / lastFpsTime / 1000);
	numFrames = 0;
	lastFpsTime = Date.now();
}

var throttledDrawFps = _.throttle(draw_fps, 1000, {trailing: false});

// main game loop
function animate() {
	requestAnimationFrame( animate );

	if (mouseDown)
		shoot();

	doMove(Date.now() - time);
	numFrames++;
	throttledDrawFps();

	socket.emit("update", {
		'pos': yawObject.position,
		'rotY': yawObject.rotation._y
	});

	renderer.render( scene, camera );
	time = Date.now();

	// we're falling and fast... probably fell out of map!
	if(velocity.y < -10) {
		updateScore(-1);
		respawn("Fell out of map");
	}
}

init();
animate();
