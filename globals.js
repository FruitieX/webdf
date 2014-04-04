// rendering
var camera, scene, renderer;
var geometry, material, mesh;
var prevFrameTime;
var map_scale = 15;
var map;
var gunmodel;
var textureCube;

// collision testing
var epsilon = 0.1;
var ray, dirVec;

// player bounding box size
var bbox_mins = [-2, -10, -2];
var bbox_maxs = [2, 2, 2];

// vectors pointing to all corners of bounding box from origin
var bbox_dirs;
var bbox_dists = [
	Math.sqrt(Math.pow(Math.sqrt(Math.pow(bbox_mins[0], 2) + Math.pow(bbox_mins[1], 2)), 2) + Math.pow(bbox_mins[2], 2)),
	Math.sqrt(Math.pow(Math.sqrt(Math.pow(bbox_mins[0], 2) + Math.pow(bbox_mins[1], 2)), 2) + Math.pow(bbox_maxs[2], 2)),
	Math.sqrt(Math.pow(Math.sqrt(Math.pow(bbox_mins[0], 2) + Math.pow(bbox_maxs[1], 2)), 2) + Math.pow(bbox_mins[2], 2)),
	Math.sqrt(Math.pow(Math.sqrt(Math.pow(bbox_mins[0], 2) + Math.pow(bbox_maxs[1], 2)), 2) + Math.pow(bbox_maxs[2], 2)),
	Math.sqrt(Math.pow(Math.sqrt(Math.pow(bbox_maxs[0], 2) + Math.pow(bbox_mins[1], 2)), 2) + Math.pow(bbox_mins[2], 2)),
	Math.sqrt(Math.pow(Math.sqrt(Math.pow(bbox_maxs[0], 2) + Math.pow(bbox_mins[1], 2)), 2) + Math.pow(bbox_maxs[2], 2)),
	Math.sqrt(Math.pow(Math.sqrt(Math.pow(bbox_maxs[0], 2) + Math.pow(bbox_maxs[1], 2)), 2) + Math.pow(bbox_mins[2], 2)),
	Math.sqrt(Math.pow(Math.sqrt(Math.pow(bbox_maxs[0], 2) + Math.pow(bbox_maxs[1], 2)), 2) + Math.pow(bbox_maxs[2], 2))
];

// movement & input
var pitchObject, yawObject;
var velocity = new THREE.Vector3();
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var onGround = false;
var jump = false;
var mouseDown = false;

// networking
var socket;
var uid;
var map_uuid;
var players = {}
var playername = "Player" + Math.random().toString().substring(2, 4);

// game logic
var score = 0;
var numFrames = 0; // for fps counter
var lastFpsTime = Date.now();
var centerprintTimeout;

// weapon
var RELOAD_TIME = 1000;
var lastShoot;
var projectiles = [];
var fadeTime = 1000;
var projectile_y_offset = -2;
var projectile_x_offset = -2;
var projectile_z_offset = 8;
var INFINITY = 99999999;
var projectileOpacity = 0.75;
var SOUND_ATTENUATION_DIST = 300;

// misc constants
var PI_2 = Math.PI / 2;

// these depend on libraries imported in <head>, will be set when init() is ran
var globalsInit = function() {
	bbox_dirs = [
		new THREE.Vector3(bbox_mins[0], bbox_mins[1], bbox_mins[2]).normalize(),
		new THREE.Vector3(bbox_mins[0], bbox_mins[1], bbox_maxs[2]).normalize(),
		new THREE.Vector3(bbox_mins[0], bbox_maxs[1], bbox_mins[2]).normalize(),
		new THREE.Vector3(bbox_mins[0], bbox_maxs[1], bbox_maxs[2]).normalize(),
		new THREE.Vector3(bbox_maxs[0], bbox_mins[1], bbox_mins[2]).normalize(),
		new THREE.Vector3(bbox_maxs[0], bbox_mins[1], bbox_maxs[2]).normalize(),
		new THREE.Vector3(bbox_maxs[0], bbox_maxs[1], bbox_mins[2]).normalize(),
		new THREE.Vector3(bbox_maxs[0], bbox_maxs[1], bbox_maxs[2]).normalize(),
	]
};
