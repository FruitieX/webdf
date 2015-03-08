var init = function() {
	if($.cookie("playername"))
		playername = $.cookie('playername');

	playername = prompt("Enter nickname:", playername);
	$.cookie("playername", playername);

	netInit();
	globalsInit();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 100000 );
	scene = new THREE.Scene();
	setupRenderer();
	loadMap();

	createjs.Sound.initializeDefaultPlugins();
	createjs.Sound.registerSound("res/shoot.ogg", "shoot");
	createjs.Sound.registerSound("res/hit.ogg", "hit");
	createjs.Sound.registerSound("res/hitsound.wav", "hitsound");
	createjs.Sound.registerSound("res/death1.ogg", "death1");
	createjs.Sound.registerSound("res/death2.ogg", "death2");
	createjs.Sound.registerSound("res/death3.ogg", "death3");

	createjs.Sound.registerSound("res/footstep01.wav", "footstep1");
	createjs.Sound.registerSound("res/footstep02.wav", "footstep2");
	createjs.Sound.registerSound("res/footstep03.wav", "footstep3");
	createjs.Sound.registerSound("res/footstep04.wav", "footstep4");
	createjs.Sound.registerSound("res/footstep05.wav", "footstep5");
	createjs.Sound.registerSound("res/footstep06.wav", "footstep6");

	createjs.Sound.registerSound("res/jump.ogg", "jump");

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
		var color = modifyColor(colorFromName(players_a[i].name), 0.5);
		$("#scoreboard").append("<span style=\"color:#" + color + "\">" + players_a[i].name + ": " + players_a[i].score + "</span><br>");
	}
}

var updateScore = function(cnt) {
	score += cnt;
	$("#score").html("Score: " + score);
	redrawScoreboard();

	socket.emit("score", {
		'score': score,
		'name': playername
	});
}

var spawnPoints = [
	[195, 600, 830],
];
var respawn = function(reason) {
	console.log(reason);
	var file = "death" + Math.floor(Math.random()*3 + 1).toString();
	createjs.Sound.play(file);

	socket.emit("sound", {
		'sound': file,
		'origin': yawObject.position
	});

	// neat hardcoded spawnpoint for now :)
	var spawnPoint = Math.floor(Math.random() * spawnPoints.length);
	yawObject.position.x = spawnPoints[spawnPoint][0];
	yawObject.position.y = spawnPoints[spawnPoint][1];
	yawObject.position.z = spawnPoints[spawnPoint][2];
	yawObject.rotation.x = 0;
	yawObject.rotation.y = 0;
	yawObject.rotation.z = 0;
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

	if(!prevFrameTime)
		prevFrameTime = Date.now();

    playerBBox.position = yawObject.position;

	doMove(Date.now() - prevFrameTime);
	prevFrameTime = Date.now();
	numFrames++;
	throttledDrawFps();
	crosshairReloadUpdate();
	projectilesThink();

	socket.emit("update", {
		'pos': yawObject.position,
		'rotY': yawObject.rotation._y,
		'name': playername
	});

	if(gunmodel) {
		gunmodel.position.copy(yawObject.position);

		// offset gun model to the side
		var dirVec_rotated = new THREE.Vector3();
		var dirEuler_rotated = new THREE.Euler(0, yawObject.rotation.y + Math.PI/2, 0, "XYZ");
		dirVec_rotated = new THREE.Vector3(0, 0, -1).applyEuler(dirEuler_rotated).normalize();
		gunmodel.position.add(dirVec_rotated.multiplyScalar(projectile_x_offset));

		var temp_rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		temp_rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

		gunmodel.rotation = temp_rotation;
	}

	renderer.render( scene, camera );

	// we're falling and fast... probably fell out of map!
    /*
	if(velocity.y < -10) {
		updateScore(-1);
		respawn("Fell out of map");
	}
    */
}

init();
