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

	var movementKey = false;
	if ( moveForward ) {
		wishDir.add(dirVec.multiplyScalar(modifier * delta));
		movementKey = true;
	}
	if ( moveBackward ) {
		wishDir.add(dirVec.multiplyScalar(-modifier * delta));
		movementKey = true;
	}

	if ( moveLeft ) {
		wishDir.add(dirVec_rotated.multiplyScalar(modifier * delta));
		movementKey = true;
	}
	if ( moveRight ) {
		wishDir.add(dirVec_rotated.multiplyScalar(-modifier * delta));
		movementKey = true;
	}

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
		} else if (!movementKey) {
			// friction
			velocity.x *= (1 - 0.1);
			velocity.z *= (1 - 0.1);
		} else {
			// air friction
			velocity.x += ( - velocity.x ) * 0.10 * delta;
			velocity.z += ( - velocity.z ) * 0.10 * delta;
		}
	} else {
		// gravity
		velocity.y -= 0.075 * delta;
	}


	onGround = false;

	// get rid of extreme velocity clip bugs by tracing direction of wishDir
	ray = new THREE.Raycaster(yawObject.position, wishDir, 0, velocity.length());
	var intersections = ray.intersectObjects( [map] );

	if( intersections.length > 0 ) {
		for(var j = 0; j < intersections.length; j++) {
			var distance = intersections[j].distance;
			var normal = intersections[j].face.normal;

			console.log("wishdir project");
			wishDir.projectOnPlane(normal);
		}
	}

	velocity.add(wishDir);
	yawObject.position.add(velocity);

	// now trace against corners of bbox
	for(var i = 0; i < bbox_dirs.length; i++) {
		dirVec = bbox_dirs[i];
		var tempVec = new THREE.Vector3().copy(dirVec);
		ray.set(yawObject.position, tempVec);
		ray.far = bbox_dists[i] + epsilon;

		var intersections = ray.intersectObjects( [map] );

		if ( intersections.length > 0 ) {
			// loop through every intersection
			for(var j = 0; j < intersections.length; j++) {
				var distance = intersections[j].distance;
				var normal = intersections[j].face.normal;

				// check how large the angle between intersected face normal
				// and a flat ground plane normal is, set onGround accordingly
				if(normal.dot(new THREE.Vector3(0, 1, 0)) > 0.7) {
					onGround = true;
				}

				// push player back from face along its normal
				velocity.projectOnPlane(normal);
				yawObject.position.add(new THREE.Vector3().copy(normal).normalize().multiplyScalar((bbox_dists[i] - distance)));
			}
		}
	}
}
