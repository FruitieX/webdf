var onKeyDown = function ( event ) {
	switch ( event.keyCode ) {
		case 38: // up
		case 87: // w
		case 188: // dvorak , :)
			moveForward = true;
			break;

		case 37: // left
		case 65: // a
			moveLeft = true;
			break;

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
			jump = true;
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

		case 32: // space
			jump = false;
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
			element.requestPointerLock();
		}, false );
	} else {
		element.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}
};

