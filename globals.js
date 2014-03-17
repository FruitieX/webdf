// rendering
var camera, scene, renderer;
var geometry, material, mesh;
var time = Date.now();
var map_scale = 10;
var map;

// collision testing
var collision_distance = 8;
var epsilon = 0.1;
var ray, dirVec;

// player bounding box size
var bbox_mins = [-0.5, -2.0, -0.5];
var bbox_maxs = [0.5, 0.5, 0.5];

// movement & input
var pitchObject, yawObject;
var velocity = new THREE.Vector3();
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var mouseDown;

// networking
var socket;
var uid;
var map_uuid;
var players = {}

// game logic
var score = 0;
var RELOAD_TIME = 1000;
var lastShoot;

// misc constants
var PI_2 = Math.PI / 2;
