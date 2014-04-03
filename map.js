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
	loader.load( "res/map1.js", function(json_geometry) {
		texture = THREE.ImageUtils.loadTexture('res/uv.png');
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
/*
var shader = THREE.ShaderLib[ "cube" ];
		shader.uniforms[ "tCube" ].value = textureCube;

		var material = new THREE.ShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide

		} ),

		mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
		sceneCube.add( mesh );

		var r = "textures/cube/Bridge2/";
		var urls = [ r + "posx.jpg", r + "negx.jpg",
					 r + "posy.jpg", r + "negy.jpg",
					 r + "posz.jpg", r + "negz.jpg" ];

		var textureCube = THREE.ImageUtils.loadTextureCube( urls );
		textureCube.format = THREE.RGBFormat;
*/
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
	loader.load( "res/gun.js", function(json_geometry) {
		material = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('res/player.png') });
//		material = new THREE.MeshLambertMaterial( { color: 0xff6600, ambient: 0xff2200, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.3 } ),
		material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('res/player.png'), color: colorFromName(playername), ambient: colorFromName(playername), combine: THREE.MixOperation, reflectivity: 0.3 } ),

		gunmodel = new THREE.Mesh( json_geometry, material );
		gunmodel.scale.set( 4, 4, 4 );

		scene.add(gunmodel);
		console.log(gunmodel);
	});
};
