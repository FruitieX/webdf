var init = function() {
	if($.cookie("playername"))
		playername = $.cookie('playername');

	playername = prompt("Enter nickname:", playername);
	$.cookie("playername", playername);

	netInit();
	globalsInit();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100000 );
	scene = new THREE.Scene();
	setupRenderer();

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

	loadMap(function() {
        octree = new THREE.Octree({});
        octree.add(map, { useFaces: true } );
        octree.update();

        pointerLockSetup();
        animate();
    });

    $("#chatform").submit(function(event) {
        event.preventDefault();
        var text = $("#chattextfield").val();
        if(text.length) {
            socket.emit("chat", {
                text: text,
                playername: playername
            });
        }
        $("#chattextfield").css("visibility", "hidden");
        chatInputActive = false;
    });
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
	[-8180, -2200, -16210],
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
	yawObject.rotation.y = 90;
	yawObject.rotation.z = 0;
	velocity.x = 0;
	velocity.y = 0;
	velocity.z = 0;
}

var refreshChat = function() {
    $('#chat').empty();
    if(chatMsgs.length) {
        $('#chat').css("visibility", "visible");

        var s = "";
        for(var i = 0; i < chatMsgs.length; i++) {
            $('#chat').append($('<li>').text(chatMsgs[i].playername + ': ' + chatMsgs[i].text));
        }
    } else {
        $('#chat').css("visibility", "hidden");
    }
};

var chatMsgs = [];
var appendChat = function(message) {
    message.timestamp = new Date().getTime();
    message.timeout = setTimeout(function() {
        chatMsgs.shift();
        refreshChat();
    }, chatmsg_lifetime * 1000);

    chatMsgs.push(message);
    if(chatMsgs.length > 5) {
        var oldMsg = chatMsgs.shift();
        clearTimeout(oldMsg.timeout);
    }
    refreshChat();
}
var chat = function(text) {
    socket.emit('chat', {
        playername: playername,
        text: text
    });
};

var chatInputActive = false;
var chatInput = function() {
    //$("#chatInput
    chatInputActive = true;
    $("#chattextfield").val("");
    $("#chattextfield").css("visibility", "visible");
    setTimeout(function() {
        $("#chattextfield").focus();
    }, 0);
};

var draw_fps = function() {
	$("#fps").html("FPS: " + Math.round(numFrames / (Date.now() - lastFpsTime) * 1000));
	numFrames = 0;
	lastFpsTime = Date.now();
}
var throttledDrawFps = _.throttle(draw_fps, 1000);

var oldTimestamp = null;
// main game loop
function animate(timestamp) {
	if (mouseDown)
		shoot();

    if(!timestamp) timestamp = 0;
    if(!oldTimestamp) oldTimestamp = timestamp;
    /*
	if(!prevFrameTime)
		prevFrameTime = Date.now();
        */

    //playerBBox.position = yawObject.position;

	doMove((timestamp - oldTimestamp) / 1000, timestamp);//timestamp - start);
    //console.log(timestamp - oldTimestamp);
    oldTimestamp = timestamp;
	//prevFrameTime = Date.now();
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
	window.requestAnimationFrame( animate );

	// we're falling and fast... probably fell out of map!
    /*
	if(velocity.y < -10) {
		updateScore(-1);
		respawn("Fell out of map");
	}
    */
}

$(document).ready(function() {
    init();
});
