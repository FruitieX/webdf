var doMove = function(delta) {
	delta *= 0.05;

	var modifier = 0.10;
	// limit acceleration a bit at higher speeds
	if(Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z) > 1) {
		modifier = 0.005;
	}

	if ( moveForward ) velocity.z -= modifier * delta;
	if ( moveBackward ) velocity.z += modifier * delta;

	if ( moveLeft ) velocity.x -= modifier * delta;
	if ( moveRight ) velocity.x += modifier * delta;

	if (onGround === true) {
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
		velocity.y -= 0.075 * delta;
	}

	if (onGround === true && jump) {
	}

	yawObject.translateX( velocity.x );
	yawObject.translateY( velocity.y );
	yawObject.translateZ( velocity.z );

	onGround = false;

	// check direction of velocity vector (+ epsilon)
	var oldPos = new THREE.Vector3().copy(yawObject.position);
	ray = new THREE.Raycaster(yawObject.position, velocity, 0, velocity + new THREE.Vector3().copy(velocity).normalize() * epsilon);
	var intersections = ray.intersectObjects( [map] );
	if( intersections.length > 0 ) {
		//console.log('intersection');
		for(var j = 0; j < intersections.length; j++) {
			//console.log(intersections);
			var distance = intersections[j].distance;
			var normal = intersections[j].face.normal;
			//console.log(distance);
			if ( distance > 0 && distance <= collision_distance) {
				//console.log('intersection: ' + intersections[0].distance);

				// check how large the angle between intersected face normal
				// and a flat ground plane normal is, set isOnObject accordingly
				//console.log(normal.dot(new THREE.Vector3(0, 1, 0)));
				if(normal.dot(new THREE.Vector3(0, 1, 0)) > 0.8) {
					onGround = true;
				}

				//velocity;
				// push player back from face along its normal
				velocity.projectOnPlane(normal);
				//yawObject.position.add(new THREE.Vector3().copy(normal).multiplyScalar((collision_distance - distance)));
			}
		}
	}

	for(var i = 0; i < dirs.length; i++) {
		ray = new THREE.Raycaster();
		dirVec = dirs[i];
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
					// and a flat ground plane normal is, set onGround accordingly
					//console.log(normal.dot(new THREE.Vector3(0, 1, 0)));
					if(normal.dot(new THREE.Vector3(0, 1, 0)) > 0.8) {
						onGround = true;
					}

					// push player back from face along its normal
					//yawObject.position.add(new THREE.Vector3().copy(normal).multiplyScalar((collision_distance - distance)));
				}
			}
		}
	}
}
