var loadMap = function() {
	// enable black fog
	scene.fog = new THREE.Fog( 0x000000, 0, 500 );

	// ambient light for really dark spots
	var light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );

	light = new THREE.PointLight( 0xb8e8f8, 0.5, 0 );
	light.position.set( 10000, 10000, 10000 );
	scene.add( light );
	light = new THREE.PointLight( 0xb8e8f8, 0.5, 0 );
	light.position.set( -10000, 10000, -10000 );
	scene.add( light );
	light = new THREE.PointLight( 0xb8e8f8, 0.5, 0 );
	light.position.set( 0, -10000, 0 );
	scene.add( light );

	var texture;
	var sky;
	// load map
	loader = new THREE.JSONLoader();
	loader.load( "res/uvtest.js", function(json_geometry, materials) {
		texture = THREE.ImageUtils.loadTexture('res/uv.png');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.x = 5;
		texture.repeat.y = 5;
		material = new THREE.MeshPhongMaterial({map: texture});
		//material.wireframe = true;

		console.log(json_geometry);
		map = new THREE.Mesh( json_geometry, materials );
		map.scale.set( map_scale, map_scale, map_scale );
		map.position.x = 0;
		map.position.y = 0;
		map.position.z = 0;
		map_uuid = map.uuid;

		scene.add(map);
	});
	loader.load( "res/skybox.js", function(json_geometry) {
		texture = THREE.ImageUtils.loadTexture('res/skybox.jpg');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		material = new THREE.MeshBasicMaterial({map: texture});
		material.fog = false;

		sky = new THREE.Mesh( json_geometry, material );
		var sky_scale = 5000;
		sky.scale.set( sky_scale, sky_scale, sky_scale );
		sky.position.x = 0;
		sky.position.y = 0;
		sky.position.z = 0;

		scene.add(sky);
	});
};
