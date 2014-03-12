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

var map = [];

var ray, dirVec;

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

document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

init();
animate();

function init() {
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	socket = io.connect("http://localhost:8081");
	scene = new THREE.Scene();
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

	velocity.x += ( - velocity.x ) * 0.08 * delta;
	velocity.z += ( - velocity.z ) * 0.08 * delta;

	velocity.y -= 0.05 * delta;

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

function animate() {

	requestAnimationFrame( animate );

	controls.update( Date.now() - time );
	doMove(Date.now() - time);

	socket.emit("update", controls.getObject().position);

	renderer.render( scene, camera );
	time = Date.now();
}

socket.on('update', function(data) {
	console.log('Update: ');
//console.log(data);
});
