var netInit = function() {
	socket = io.connect("http://localhost:8081");

	socket.on('update', function(data) {
		var player;
		if(data.uid in players) { // player seen before
			player = players[data.uid];
		} else { // player just joined, add as new player
			player = {};

			player.score = 0;
			player.name = data.name; // TODO: proper name

			console.log('new player connected with uid ' + data.uid);
			// insert new model
			loader.load( "res/player.js", function(json_geometry) {
				material = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('res/player.png') });
				player.model = new THREE.Mesh( json_geometry, material );
				player.model.scale.set( 3, 3, 3 );
				scene.add(player.model);
			});

			players[data.uid] = player;
			redrawScoreboard();
		}

		if(data.pos) { // position & rotation update
			// still loading model?
			if(player.model) {
				player.model.position.x = data.pos.x;
				player.model.position.y = data.pos.y - 7;
				player.model.position.z = data.pos.z;

				player.model.rotation = new THREE.Euler(0, data.rotY, 0, 'XYZ');
			}
		} else if (data.score) { // score update
			player.score = data.score;
			redrawScoreboard();
		}
	});

	socket.on('hit', function(data) {
		respawn("You got hit!");
		setCenterprint("You were fragged by " + data);
	});

	socket.on('p_disconnected', function(data) {
		console.log('player with uid ' + data + ' disconnected.');
		scene.remove(players[data].model);
		delete players[data];
		redrawScoreboard();
	});
};
