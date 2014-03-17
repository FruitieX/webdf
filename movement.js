var onKeyDown = function ( event ) {
	switch ( event.keyCode ) {
		case 38: // up
		case 87: // w
		case 188: // dvorak , :)
			moveForward = true;
			break;

		case 37: // left
		case 65: // a
			moveLeft = true; break;

		case 40: // down
		case 83: // s
		case 79: // dvorak o
			moveBackward = true;
			break;

		case 39: // right
		case 68: // d
		case 69: // dvorak e
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
	mouseDown = true;
}
var onMouseUp = function ( event ) {
	mouseDown = false;
}

var onMouseMove = function ( event ) {
	var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

	yawObject.rotation.y -= movementX * 0.002;
	pitchObject.rotation.x -= movementY * 0.002;

	pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
};

document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );
document.addEventListener( 'mousedown', onMouseDown, false );
document.addEventListener( 'mouseup', onMouseUp, false );
document.addEventListener( 'mousemove', onMouseMove, false );

var getLookDirection = function(v) {
	// assumes the camera itself is not rotated
	var temp_direction = new THREE.Vector3( 0, 0, -1 );
	var temp_rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

	temp_rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );
	v.copy( temp_direction ).applyEuler( temp_rotation );
	return v;
};

var pointerLockSetup = function() {
	pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );

	scene.add( yawObject );

	// request pointer lock
	// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if ( havePointerLock ) {
		var element = document.body;

		element.addEventListener( 'click', function ( event ) {
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
		element.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}
};

var doMove = function(delta) {
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

	if ( canJump === true ) {

		velocity.y = Math.max( 0, velocity.y );

	}

	yawObject.translateX( velocity.x );
	yawObject.translateY( velocity.y );
	yawObject.translateZ( velocity.z );

	canJump = false;
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
					// and a flat ground plane normal is, set canJump accordingly
					//console.log(normal.dot(new THREE.Vector3(0, 1, 0)));
					if(normal.dot(new THREE.Vector3(0, 1, 0)) > 0.8) {
						canJump = true;
					}

					// push player back from face along its normal
					yawObject.position.add(new THREE.Vector3().copy(normal).multiplyScalar((collision_distance - distance)));
				}
			}
		}
	}
}
