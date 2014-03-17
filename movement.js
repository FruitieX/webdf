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
