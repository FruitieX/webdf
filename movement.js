// Ported from DarkPlaces source (see below multiline comment for more info)
var GeomLerp = function(a, lerp, b) {
	if(a == 0) {
		if(lerp < 1)
			return 0;
		else
			return b;
	}
	if(b == 0) {
		if(lerp > 0)
			return 0;
		else
			return a;
	}
	return a * Math.pow(Math.abs(b / a), lerp);
}

var bound = function(a, b, c) {
	return Math.max(a, Math.min(b, c));
}

// Ported from DarkPlaces source (see below multiline comment for more info)
var IsMoveInDir = function(fwd, side, angle) {
	if (!fwd && !side)
		return 0; // don't divide by zero
	angle -= Math.atan2(side, fwd) * (180/Math.PI);
	angle = (((angle + 180) % 360) - 180) / 45;
	if (angle > 1)
		return 0;
	if (angle < -1)
		return 0;
	return 1 - Math.abs(angle);
}

var doMove = function(delta) {
	delta /= 1000; // convert to seconds
	//delta = 1/60;
	delta = Math.min(0.1, delta); // keep it to sane values
	//console.log(delta);

	var wishDir = new THREE.Vector3();

	var dirVec = new THREE.Vector3();
	var dirEuler;
	var fly = false;
	if (fly)
		dirEuler = new THREE.Euler(pitchObject.rotation.x, yawObject.rotation.y, 0, "YXZ");
	else
		dirEuler = new THREE.Euler(0, yawObject.rotation.y, 0, "XYZ");
	dirVec = new THREE.Vector3(0, 0, -1).applyEuler(dirEuler).normalize();

	// 90 degree rotation
	var dirVec_rotated = new THREE.Vector3();
	var dirEuler_rotated = new THREE.Euler(0, yawObject.rotation.y + Math.PI/2, 0, "XYZ");
	dirVec_rotated = new THREE.Vector3(0, 0, -1).applyEuler(dirEuler_rotated).normalize();

	var movementKey = false;
	var fwdmove = 0;
	var sidemove = 0;
	if ( moveForward ) {
		wishDir.add(dirVec);
		movementKey = true;
		fwdmove = 1;
	}
	if ( moveBackward ) {
		wishDir.add(dirVec.multiplyScalar(-1));
		movementKey = true;
		fwdmove = -1;
	}

	if ( moveLeft ) {
		wishDir.add(dirVec_rotated);
		movementKey = true;
		sidemove = -1;
	}
	if ( moveRight ) {
		wishDir.add(dirVec_rotated.multiplyScalar(-1));
		movementKey = true;
		sidemove = 1;
	}

	wishDir.normalize();

	if(onGround && jump) {
		velocity.y += sv_jumpvelocity;
		onGround = false;
		createjs.Sound.play("jump");
		socket.emit("sound", {
			'sound': "jump",
			'origin': yawObject.position
		});
	} else if (onGround && movementKey) {
		throttledFootstep();
	}

	//var wishVel = new THREE.Vector3();
    var wishspeed = wishDir.length() * sv_maxspeed;

	if(fly) {
		// friction
		velocity.x += ( - velocity.x ) * 1 * delta;
		velocity.y += ( - velocity.y ) * 1 * delta;
		velocity.z += ( - velocity.z ) * 1 * delta;
		velocity.add(wishDir);
	} else if (onGround) {
		// clip y velocity so we don't fall through
		velocity.y = Math.max( 0, velocity.y );

		/* Player ground/air movement code ported over from the open source DarkPlaces
		 * engine, which is based on Quake. DarkPlaces is under the GPLv2
		 * license: http://icculus.org/twilight/darkplaces/
		 *
		 * I ported everything necessary for emulating CPMA physics as closely
		 * as possible.
		 */

		var accelspeed;

		var wishspeed = Math.min(wishspeed, sv_maxspeed);

		var f = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
		if (f > 0)
		{
			f = 1 - ((delta)) * sv_friction * ((f < sv_stopspeed) ? (sv_stopspeed / f) : 1);
			f = Math.max(f, 0);
			velocity.multiplyScalar(f);
		}
		var addspeed = wishspeed - velocity.dot(wishDir);
		if (addspeed > 0)
		{
			accelspeed = Math.min(sv_accelerate * delta * wishspeed, addspeed);
			velocity.x = velocity.x + accelspeed * wishDir.x;
			velocity.y = velocity.y + accelspeed * wishDir.y;
			velocity.z = velocity.z + accelspeed * wishDir.z;
		}

		//velocity.add(new THREE.Vector3().copy(wishDir).multiplyScalar(0.15));
	} else {
		var vel_y = velocity.y;
		velocity.y = 0;

		var speed = velocity.length();
		var wishspeed0 = wishspeed;
		wishspeed = Math.min(wishspeed, sv_maxairspeed);

		var accel = sv_airaccelerate;
		var curdir = new THREE.Vector3().copy(velocity);
		curdir.normalize();

		accel += (sv_airstopaccelerate - accel) * Math.max(0, -1 * curdir.dot(wishDir));

		var strafity = IsMoveInDir(fwdmove, sidemove, -90) + IsMoveInDir(fwdmove, sidemove, +90);
		wishspeed = Math.min(wishspeed, GeomLerp(sv_maxairspeed, strafity, sv_maxairstrafespeed));
		accel = GeomLerp(sv_airaccelerate, strafity, sv_airstrafeaccelerate);

		// CL_ClientMovement_Physics_PM_Accelerate
		var vel_straight = velocity.dot(wishDir);
		var vel_xy = new THREE.Vector3(velocity.x, 0, velocity.z);
		var vel_perpend = new THREE.Vector3();
		vel_perpend.x = vel_xy.x - vel_straight * wishDir.x;
		vel_perpend.y = vel_xy.y - vel_straight * wishDir.y;
		vel_perpend.z = vel_xy.z - vel_straight * wishDir.z;

		var step = accel * ((delta)) * wishspeed0;

		var vel_xy_current = vel_xy.length();

		vel_straight += bound(0, wishspeed - vel_straight, step);

		//vel_perpend.multiplyScalar(Math.max(0, 1 - ((delta)) * wishspeed * 
		velocity.x = vel_perpend.x + vel_straight * wishDir.x;
		velocity.y = vel_perpend.y + vel_straight * wishDir.y;
		velocity.z = vel_perpend.z + vel_straight * wishDir.z;

		// CPM aircontrol
		if(!fwdmove && sidemove) {
			var zspeed = velocity.y;
			velocity.y = 0;

			speed = velocity.length();
			wishspeed = speed;

			velocity.normalize();

			//var k = 32 * (2 * moveInDir(forward, side) - 1); // TODO!
			var k = 0.5; //32;
			k *= Math.min(1, Math.max(0, wishspeed / sv_maxairspeed));
			var dot = velocity.dot(wishDir);

			if(dot > 0) {
				k *= Math.pow(dot, sv_aircontrol_power) * ((delta));
				speed = Math.max(0, speed);
				k *= sv_aircontrol;
				velocity.x = speed * velocity.x + k * wishDir.x;
				velocity.y = speed * velocity.y + k * wishDir.y;
				velocity.z = speed * velocity.z + k * wishDir.z;

				velocity.normalize();
			}

			velocity.multiplyScalar(speed);
			velocity.y = zspeed;
		}
		velocity.y = vel_y;
		// gravity
		velocity.y -= sv_gravity * (delta);
	}

	$("#speed").text("Speed: " + new THREE.Vector3(velocity.x, 0, velocity.z).length());

	var onGround_old = onGround;
	onGround = false;

	ray = new THREE.Raycaster(yawObject.position, wishDir, 0, velocity.length());
    /*
	// get rid of extreme velocity clip bugs by tracing direction of wishDir
    var octreeResults = octree.search(ray.ray.origin, ray.ray.far, true, ray.ray.direction);
	var intersections = ray.intersectOctreeObjects( octreeResults );

	if( intersections.length > 0 ) {
		for(var j = 0; j < intersections.length; j++) {
			var distance = intersections[j].distance;
			var normal = intersections[j].face.normal;

			wishDir.projectOnPlane(normal);
		}
	}
    */

    // TODO: wat
	yawObject.position.add(new THREE.Vector3().copy(velocity).multiplyScalar(delta));

    //var octreeResults = octree.search(yawObject.position, 1);

	// now trace against corners of bbox
	for(var i = 0; i < bbox_dirs.length; i++) {
		dirVec = bbox_dirs[i];
		var tempVec = new THREE.Vector3().copy(dirVec);
		ray.set(yawObject.position, tempVec);
		ray.far = bbox_dists[i] + epsilon;

        var octreeResults = octree.search(ray.ray.origin, ray.ray.far, true, ray.ray.direction);

        //console.log(octreeResults[0]);
        var intersections = ray.intersectOctreeObjects( octreeResults );
        //console.log('intersections: ' + intersections.length);

		if ( intersections.length > 0 ) {
			// loop through every intersection
			for(var j = 0; j < intersections.length; j++) {
				var distance = intersections[j].distance;
				var normal = intersections[j].face.normal;

				// check how large the angle between intersected face normal
				// and a flat ground plane normal is, set onGround accordingly
				if(normal.dot(new THREE.Vector3(0, 1, 0)) > 0.7) {
					onGround = true;
					if(!onGround_old) {
						throttledFootstep();
					}
				}

				// push player back from face along its normal
				velocity.projectOnPlane(normal);
				yawObject.position.add(new THREE.Vector3().copy(normal).normalize().multiplyScalar(bbox_dists[i] - distance));
			}
		}
	}
};

var footstep = function() {
	var file = "footstep" + Math.floor(Math.random()*6 + 1).toString();
	createjs.Sound.play(file);

	socket.emit("sound", {
		'sound': file,
		'origin': yawObject.position
	});
};

var throttledFootstep = _.throttle(footstep, 400, {trailing: false});
