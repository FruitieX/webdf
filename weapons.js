var projectilesThink = function() {
	for(var i = projectiles.length - 1; i >= 0; i--) {
		var projectile = projectiles[i];
		console.log(projectile);
		projectile.three_line.material.opacity = (fadeTime - (Date.now() - projectile.time)) / fadeTime;
		console.log(projectile.three_line.material.opacity);
		if(projectile.three_line.material.opacity <= 0) {
			scene.remove(projectile.three_line);
			projectiles.splice(i, 1);
		}
	}
};

var line_mat = new THREE.LineBasicMaterial({
	color: 0xff0000,
	linewidth: 3,
	transparent: true,
	opacity: 0.8
});

var addProjectile = function(origin, endpoint) {
	var line_geom = new THREE.Geometry();
	line_geom.vertices.push(origin);
	line_geom.vertices.push(endpoint);

	var three_line = new THREE.Line(line_geom, line_mat);
	var line = {
		'three_line': three_line,
		'time': Date.now()
	}

	projectiles.push(line);
	console.log(projectiles);
	scene.add(three_line);
};

var shoot = function (){
	// still reloading?
	if(Date.now() - lastShoot < RELOAD_TIME)
		return;

	lastShoot = Date.now();

	var dirVector = new THREE.Vector3(1,0,0);
	dirVector = getLookDirection(dirVector);
	var ray = new THREE.Raycaster();
	ray.set( yawObject.position, dirVector);

	var intersect_objs = [map];
	_.each(players, function(player) {
		intersect_objs.push(player.model);
	});

	var intersections = ray.intersectObjects(intersect_objs);
	if(intersections.length) {
		intersections.sort(function(a, b) {
			return a.distance - b.distance;
		});
		if(intersections[0].object.uuid !== map_uuid) {
			console.log('hit player, distance: ' + intersections[0].distance);
			_.each(players, function(player, uid) {
				// found the player that we hit
				if (player.model.uuid === intersections[0].object.uuid) {
					//console.log('hit player uid ' + uid);

					setCenterprint("You fragged " + player.name);

					socket.emit('hit', {
						'uid': uid,
						'name': playername
					});

					updateScore(1);
					return;
				}
			});
		}

		var origin = new THREE.Vector3().copy(yawObject.position);
		origin.y += projectile_y_offset;

		socket.emit('shoot', {
			'origin': origin,
			'endpoint': intersections[0].point
		});
		addProjectile(origin, intersections[0].point);
	}
};

var crosshairReloadUpdate = function() {
	$("#crosshair_reloading").css("opacity", (RELOAD_TIME - (Date.now() - lastShoot)) / RELOAD_TIME);
};
