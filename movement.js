var doMove = function(delta) {
	delta *= 0.05;

	var modifier;
	if (fly)
		modifier = 1;
	else {
		modifier = 0.10;
		// limit acceleration a bit at higher speeds
		if(Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z) > 1) {
			modifier = 0.005;
		}
	}

	var wishDir = new THREE.Vector3();

	var dirVec = new THREE.Vector3();
	var dirEuler;
	var fly = false;
	if (fly)
		dirEuler = new THREE.Euler(pitchObject.rotation.x, yawObject.rotation.y, 0, "YXZ");
	else
		dirEuler = new THREE.Euler(0, yawObject.rotation.y, 0, "XYZ");
	dirVec = new THREE.Vector3(0, 0, -1).applyEuler(dirEuler);

	// 90 degree rotation
	var dirVec_rotated = new THREE.Vector3();
	var dirEuler_rotated = new THREE.Euler(0, yawObject.rotation.y + Math.PI/2, 0, "XYZ");
	dirVec_rotated = new THREE.Vector3(0, 0, -1).applyEuler(dirEuler_rotated);

	if ( moveForward ) wishDir.add(dirVec.multiplyScalar(modifier * delta));
	if ( moveBackward ) wishDir.add(dirVec.multiplyScalar(-modifier * delta));

	if ( moveLeft ) wishDir.add(dirVec_rotated.multiplyScalar(modifier * delta));
	if ( moveRight ) wishDir.add(dirVec_rotated.multiplyScalar(-modifier * delta));

	if(fly) {
		// friction
		velocity.x += ( - velocity.x ) * 0.10 * delta;
		velocity.y += ( - velocity.y ) * 0.10 * delta;
		velocity.z += ( - velocity.z ) * 0.10 * delta;
	} else if (onGround) {
		// clip y velocity so we don't fall through
		velocity.y = Math.max( 0, velocity.y );

		if (jump) {
			velocity.y += 1;
			onGround = false;
		} else {
			// friction
			velocity.x += ( - velocity.x ) * 0.10 * delta;
			velocity.z += ( - velocity.z ) * 0.10 * delta;
		}
	} else {
		// gravity
		velocity.y -= 0.06 * delta;
	}

	// check direction of wishDir vector (+ epsilon)
	//var wishDir_collision_distance = (bbox_mins[0] / bbox_mins[1]) * collision_distance;

	//ray = new THREE.Raycaster(yawObject.position, wishDir, 0, new THREE.Vector3().copy(wishDir).normalize().multiplyScalar(wishDir_collision_distance + epsilon).length());
	//var intersections = ray.intersectObjects( [map] );

	/*
	if( intersections.length > 0 ) {
		for(var j = 0; j < intersections.length; j++) {
			var distance = intersections[j].distance;
			var normal = intersections[j].face.normal;

			//if ( distance > 0 && distance <= wishDir_collision_distance + epsilon) {
				console.log('wishDir project');
				wishDir.projectOnPlane(normal);
			//}
		}
	}
	*/

	onGround = false;

	velocity.add(wishDir);
	yawObject.position.add(velocity);

	for(var i = 0; i < dirs.length; i++) {
		dirVec = dirs[i];
		var tempVec = new THREE.Vector3().copy(dirVec).multiplyScalar(collision_distance + epsilon);
		ray = new THREE.Raycaster(yawObject.position, tempVec, 0, tempVec.length());

		var intersections = ray.intersectObjects( [map] );

		if ( intersections.length > 0 ) {
			// loop through every intersection
			for(var j = 0; j < intersections.length; j++) {
				var distance = intersections[j].distance;
				var normal = intersections[j].face.normal;

				// check how large the angle between intersected face normal
				// and a flat ground plane normal is, set onGround accordingly
				if(normal.dot(new THREE.Vector3(0, 1, 0)) > 0.8) {
					onGround = true;
				} else {
					console.log('collision against non-ground');
				}

				// push player back from face along its normal
				velocity.projectOnPlane(normal);
				yawObject.position.add(new THREE.Vector3().copy(normal).normalize().multiplyScalar((collision_distance - distance)));
			}
		}
	}
}
