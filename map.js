var loadMap = function() {
	// enable black fog
	scene.fog = new THREE.Fog( 0x000000, 0, 500 );

	// ambient light for really dark spots
	var light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );

	light = new THREE.PointLight( 0xd18518, 0.5, 0 );
	light.position.set( 10000, 10000, 10000 );
	scene.add( light );
	light = new THREE.PointLight( 0xd18518, 0.5, 0 );
	light.position.set( -10000, 10000, -10000 );
	scene.add( light );
	light = new THREE.PointLight( 0xd18518, 0.5, 0 );
	light.position.set( 0, -10000, 0 );
	scene.add( light );

	var texture;
	var sky;
	// load map
	loader = new THREE.JSONLoader();
	loader.load( "res/map1.js", function(json_geometry) {
		texture = THREE.ImageUtils.loadTexture('res/rock.png');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.x = 5;
		texture.repeat.y = 5;
		material = new THREE.MeshPhongMaterial({map: texture});
		//material.wireframe = true;

		map = new THREE.Mesh( json_geometry, material );
		map.scale.set( map_scale, map_scale, map_scale );
		map.position.x = 0;
		map.position.y = 0;
		map.position.z = 0;
		map_uuid = map.uuid;

		scene.add(map);
	});

	var r = "res/skybox/";
	var urls = [ r + "distant_sunset_ft.jpg", r + "distant_sunset_bk.jpg",
				r + "distant_sunset_up.jpg", r + "distant_sunset_dn.jpg",
				r + "distant_sunset_rt.jpg", r + "distant_sunset_lf.jpg"];

	textureCube = THREE.ImageUtils.loadTextureCube( urls );
	//textureCube.format = THREE.RGBFormat;

	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube;

	material = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide,
		fog: false
	} );

	var mesh = new THREE.Mesh( new THREE.BoxGeometry( 10000, 10000, 10000 ), material );
	scene.add( mesh );

	loader.load( "res/gun.js", function(json_geometry) {
		material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('res/player.png'), envMap: textureCube, color: parseInt(colorFromName(playername), 16), ambient: parseInt(colorFromName(playername), 16), combine: THREE.MixOperation, reflectivity: 0.1 } ),

		gunmodel = new THREE.Mesh( json_geometry, material );
		gunmodel.scale.set( 4, 4, 4 );

		scene.add(gunmodel);
	});

	spotLight = new THREE.SpotLight( 0xaaaaaa );
	spotLight.position.set( 1000, 500, 1000 );
	scene.add( spotLight );
};
