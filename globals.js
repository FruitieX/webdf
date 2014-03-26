// rendering
var camera, scene, renderer;
var geometry, material, mesh;
var prevFrameTime;
var map_scale = 10;
var map;

// collision testing
var collision_distance = 8;
var epsilon = 0.1;
var ray, dirVec;

// player bounding box size
var bbox_mins = [-0.5, -2.0, -0.5];
var bbox_maxs = [0.5, 0.5, 0.5];
var cam_offset = 1;

// vectors pointing to all corners of bounding box from origin
var dirs;

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
var playername;

// game logic
var score = 0;
var RELOAD_TIME = 1000;
var lastShoot;
var numFrames = 0; // for fps counter
var lastFpsTime = Date.now();
var centerprintTimeout;

// misc constants
var PI_2 = Math.PI / 2;

// these depend on libraries imported in <head>, will be set when init() is ran
var globalsInit = function() {
	dirs = [
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
