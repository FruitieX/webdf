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
		if(intersections[0].object.uuid === map_uuid) {
			console.log('hit map, distance: ' + intersections[0].distance);
		} else {
			console.log('hit player, distance: ' + intersections[0].distance);
			//console.log('model uuid: ' + intersections[0].object.uuid);
			_.each(players, function(player, uid) {
				// found the player that we hit
				if (player.model.uuid === intersections[0].object.uuid) {
					console.log('hit player uid ' + uid);

					setCenterprint("You fragged " + uid);

					socket.emit('hit', {
						'uid': uid
					});

					updateScore(1);
					return;
				}
			});
		}
	}
};

var crosshairReloadUpdate = function() {
	$("#crosshair_reloading").css("opacity", (RELOAD_TIME - (Date.now() - lastShoot)) / RELOAD_TIME);
};
