var loadMap = function() {
	// enable black fog
	scene.fog = new THREE.Fog( 0x000000, 0, 250 );

	// ambient light for really dark spots
	var light = new THREE.AmbientLight( 0x555555 );
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

	// load map
	loader = new THREE.JSONLoader();
	loader.load( "res/map1.js", function(json_geometry) {
		material = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('res/uv.png') });
		map = new THREE.Mesh( json_geometry, material );
		map.scale.set( map_scale, map_scale, map_scale );
		map.position.x = 0;
		map.position.y = 0;
		map.position.z = 0;
		map_uuid = map.uuid;

		scene.add(map);
	});
};
