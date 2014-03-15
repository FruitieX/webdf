var camera, scene, renderer;
var geometry, material, mesh;
var controls,time = Date.now();
var map_scale = 10;

var collision_distance = 8;
var epsilon = 0.1;
var bbox_mins = [-0.5, -2.0, -0.5];
var bbox_maxs = [0.5, 0.5, 0.5];


// TODO: put these in a function
var velocity = new THREE.Vector3();
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

var isOnObject = false;
var canJump = false;

var socket;
var uid;
var map_uuid;

var map = [];
var players = {}

var ray, dirVec;

var score = 0;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {
	var element = document.body;
	var pointerlockchange = function ( event ) {

		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			controls.enabled = true;
			blocker.style.display = 'none';
		} else {
			controls.enabled = false;

			blocker.style.display = '-webkit-box';init
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';

			instructions.style.display = '';
		}
	};

	var pointerlockerror = function ( event ) {
		instructions.style.display = '';
	};

	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

	instructions.addEventListener( 'click', function ( event ) {
		instructions.style.display = 'none';

		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		if ( /Firefox/i.test( navigator.userAgent ) ) {
			var fullscreenchange = function ( event ) {
				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
					document.removeEventListener( 'fullscreenchange', fullscreenchange );
					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

					element.requestPointerLock();
				}
			};
			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
			element.requestFullscreen();
		} else {
			element.requestPointerLock();
		}
	}, false );
} else {
	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

var onKeyDown = function ( event ) {

	//console.log(" " + event.keyCode + " ");
	switch ( event.keyCode ) {

		case 38: // up
		case 87: // w
		case 188:
			moveForward = true;
			break;

		case 37: // left
		case 65: // a
			moveLeft = true; break;

		case 40: // down
		case 83: // s
		case 79:
			moveBackward = true;
			break;

		case 39: // right
		case 68: // d
		case 69:
			moveRight = true;
			break;

		case 32: // space
			if ( canJump === true ) velocity.y += 1;
			canJump = false;
			break;

	}

};

var onKeyUp = function ( event ) {

	switch( event.keyCode ) {

		case 38: // up
		case 87: // w
		case 188:
			moveForward = false;
			break;

		case 37: // left
		case 65: // a
			moveLeft = false;
			break;

		case 40: // down
		case 83: // s
		case 79:
			moveBackward = false;
			break;

		case 39: // right
		case 68: // d
			case 69:
			moveRight = false;
			break;

	}

};

var onMouseDown = function ( event ) {
	throttledShoot();
}


document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );
document.addEventListener( 'mousedown', onMouseDown, false );
//document.addEventListener( 'mouseup', onKeyUp, false );


init();
animate();

var shoot = function (){
	var dirVector = new THREE.Vector3(1,0,0);
	controls.getDirection(dirVector);
	var ray = new THREE.Raycaster();
	var yawObject = controls.getObject();
	ray.set( yawObject.position, dirVector);

	var intersect_objs = [map];
	_.each(players, function(player) {
		intersect_objs.push(player.model);
	});

	var intersections = ray.intersectObjects(intersect_objs);
	if(intersections.length) {
		intersections.sort(function(a, b) {
			if(a.distance <= b.distance)
				return -1;
			return 1;
		});
		if(intersections[0].object.uuid === map_uuid) {
			console.log('hit map: ' + intersections[0].distance);
		} else {
			console.log('hit player: ' + intersections[0].distance);
			console.log('model uuid: ' + intersections[0].object.uuid);
			_.each(players, function(player, uid) {
				// found the player that we hit
				if (player.model.uuid === intersections[0].object.uuid) {
					console.log('hit player uid ' + uid);
					socket.emit('hit', {
						'uid': uid
					});

					updateScore(1);
					return;
				}
			});
		}
	}
}

var RELOAD_TIME = 1000;
var throttledShoot = _.throttle(shoot, RELOAD_TIME, {trailing: false}); // refire time >:-(

function init() {
	// create random UID for player
	uid = Math.random().toString().substr(2);
	socket = io.connect("http://localhost:8081");

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	scene = new THREE.Scene();
	console.log(scene);
	scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

	var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light.position.set( 1, 1, 1 );
	scene.add( light );

	light = new THREE.DirectionalLight( 0xffffff, 0.75 );
	light.position.set( -1, - 0.5, -1 );
	scene.add( light );

	controls = new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );

	// load map
	loader = new THREE.JSONLoader();
	loader.load( "res/map.js", function(json_geometry) {
		map = new THREE.Mesh( json_geometry, new THREE.MeshNormalMaterial() );
		map.scale.set( map_scale, map_scale, map_scale );
		map.position.x = 0;
		map.position.y = 0;
		map.position.z = 0;
		map_uuid = map.uuid;

		scene.add(map);
	});

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xffffff );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function doMove(delta) {
	var dirs = [
		[ bbox_mins[0], bbox_mins[1], bbox_mins[2] ],
		[ bbox_mins[0], bbox_mins[1], bbox_maxs[2] ],
		[ bbox_mins[0], bbox_maxs[1], bbox_mins[2] ],
		[ bbox_mins[0], bbox_maxs[1], bbox_maxs[2] ],
		[ bbox_maxs[0], bbox_mins[1], bbox_mins[2] ],
		[ bbox_maxs[0], bbox_mins[1], bbox_maxs[2] ],
		[ bbox_maxs[0], bbox_maxs[1], bbox_mins[2] ],
		[ bbox_maxs[0], bbox_maxs[1], bbox_maxs[2] ],
	];

	delta *= 0.05;

	velocity.x += ( - velocity.x ) * 0.10 * delta;
	velocity.z += ( - velocity.z ) * 0.10 * delta;

	velocity.y -= 0.075 * delta;

	if ( moveForward ) velocity.z -= 0.10 * delta;
	if ( moveBackward ) velocity.z += 0.10 * delta;

	if ( moveLeft ) velocity.x -= 0.10 * delta;
	if ( moveRight ) velocity.x += 0.10 * delta;

	if ( isOnObject === true ) {

		velocity.y = Math.max( 0, velocity.y );

	}

	var yawObject = controls.getObject();

	yawObject.translateX( velocity.x );
	yawObject.translateY( velocity.y );
	yawObject.translateZ( velocity.z );

	controls.isOnObject( false );
	for(var i = 0; i < dirs.length; i++) {
		ray = new THREE.Raycaster();
		dirVec = new THREE.Vector3(dirs[i][0], dirs[i][1], dirs[i][2]).normalize();
		//ray.ray.direction.set(dirs[i][0], dirs[i][1], dirs[i][2]);

		//ray.ray.origin.copy( controls.getObject().position );
		//shoot();
		//}
		ray.set(yawObject.position, new THREE.Vector3().copy(dirVec).multiplyScalar(collision_distance + epsilon));

		var intersections = ray.intersectObjects( [map] );

		if ( intersections.length > 0 ) {
			// loop through every intersection
			for(var j = 0; j < intersections.length; j++) {
				//console.log(intersections);
				var distance = intersections[j].distance;
				var normal = intersections[j].face.normal;
				if ( distance > 0 && distance <= collision_distance + epsilon) {
					//console.log('intersection: ' + intersections[0].distance);

					// check how large the angle between intersected face normal
					// and a flat ground plane normal is, set isOnObject accordingly
					//console.log(normal.dot(new THREE.Vector3(0, 1, 0)));
					if(normal.dot(new THREE.Vector3(0, 1, 0)) > 0.8) {
						controls.isOnObject( true );
					}

					// push player back from face along its normal
					controls.getObject().position.add(new THREE.Vector3().copy(normal).multiplyScalar((collision_distance - distance)));
				}
			}
		}
	}
}

var updateScore = function(cnt) {
	score += cnt;
	$("#score").html("Score: " + score);
}

var respawn = function(reason) {
	console.log(reason);
	var yawObject = controls.getObject();
	// neat hardcoded spawnpoint for now :)
	yawObject.position.x = 0;
	yawObject.position.y = 10;
	yawObject.position.z = 0;
	velocity.x = 0;
	velocity.y = 0;
	velocity.z = 0;
}

function animate() {

	requestAnimationFrame( animate );

	controls.update( Date.now() - time );
	doMove(Date.now() - time);

	//'uid': uid,
	socket.emit("update", {
		'pos': controls.getObject().position
	});

	renderer.render( scene, camera );
	time = Date.now();

	// we're falling and fast... probably fell out of map!
	if(velocity.y < -10) {
		updateScore(-1);
		respawn("Fell out of map");
	}
}

socket.on('update', function(data) {
	//console.log('Update: ');
	//console.log(data);

	if(data.uid in players) {
		var player = players[data.uid];

		// still loading model?
		if(player.model) {
			player.model.position.x = data.pos.x;
			player.model.position.y = data.pos.y - 7;
			player.model.position.z = data.pos.z;
		}
	} else {
		var player = {};

		console.log('new player connected with uid ' + data.uid);
		// insert new model
		loader.load( "res/player.js", function(json_geometry) {
			player.model = new THREE.Mesh( json_geometry, new THREE.MeshBasicMaterial() );
			player.model.scale.set( 2, 2, 2 );
			scene.add(player.model);

			player.model.position.x = data.pos.x;
			player.model.position.y = data.pos.y - 7;
			player.model.position.z = data.pos.z;
		});

		players[data.uid] = player;
	}
});

socket.on('hit', function(data) {
	respawn("You got hit!");
});

socket.on('p_disconnected', function(data) {
	console.log('player with uid ' + data + ' disconnected.');
	scene.remove(players[data].model);
	delete players[data];
});

