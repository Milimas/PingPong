import * as THREE from 'three'
import { LoadGLTFByPath } from './ModelHelper.js'

//Renderer does the job of rendering the graphics
let renderer = new THREE.WebGLRenderer({
  //Defines the canvas component in the DOM that will be used
	canvas: document.querySelector('#background'),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

//set up the renderer with the default settings for threejs.org/editor - revision r153
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0xffffff, 0);
//make sure three/build/three.module.js is over r152 or this feature is not available.
renderer.outputColorSpace = THREE.SRGBColorSpace 

const scene = new THREE.Scene();

let cameraList = [];

let camera;
let player;
let player2;
let ball ;

// Load the GLTF model
LoadGLTFByPath(scene)
  .then(() => {
    retrieveListOfCameras(scene);
  })
  .catch((error) => {
    console.error('Error loading JSON scene:', error);
  });

//retrieve list of all cameras
function retrieveListOfCameras(scene){
  // Get a list of all cameras in the scene
  scene.traverse(function (object) {
    if (object.isCamera) {
      cameraList.push(object);
    }
    if (object.name === "PaddlePlayer1")
      player = object ;
    if (object.name === "PaddlePlayer2")
      player2 = object ;
    if (object.name === "Cube")
      ball = object ;
  });

  //Set the camera to the first value in the list of cameras
  camera = cameraList[0];

  updateCameraAspect(camera);

  // Start the animation loop after the model and cameras are loaded
  animate();
}

// Set the camera aspect ratio to match the browser window dimensions
function updateCameraAspect(camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// on window resize
window.addEventListener('resize', () => {
  // update sizes
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

let ballMoveDirection = new THREE.Vector3(1, 0, 1);
let borderLimit = new THREE.Vector3(1.83, 0, 2.7);
let ballspeed = 0.04;

//A method to be run each time a frame is generated
function animate() {
  requestAnimationFrame(animate);

  ball.position.x = ball.position.x + ballMoveDirection.x * ballspeed;
  ball.position.z = ball.position.z + ballMoveDirection.z * ballspeed;

  if (ball.position.x > borderLimit.x || ball.position.x < borderLimit.x * -1) {
    ballMoveDirection.x = ballMoveDirection.x * -1
  }
  if (ball.position.z > borderLimit.z || ball.position.z < borderLimit.z * -1) {
    ballMoveDirection.z = ballMoveDirection.z * -1
  }

  renderer.render(scene, camera);
};

function onDocumentMouseMove(event)
{
  let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2);
  let raycaster = new THREE.Raycaster();
  let pointOfIntersection = new THREE.Vector3();
  const mouse = new THREE.Vector2() ;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(plane, pointOfIntersection);
  player.position.x = Math.min(Math.max(pointOfIntersection.x, -1.6), 1.6);
  console.log(player) ;
  socket.send(JSON.stringify({x: player.position.x, ball: ball.position}));
}

document.addEventListener('mousemove', onDocumentMouseMove, false);

let socket = new WebSocket('ws://localhost:8080');

socket.onmessage = (event) => {
let obj = JSON.parse(event.data);
player2.position.x = obj.x;
ball.position.x = obj.ball.x;
ball.position.y = obj.ball.y;
ball.position.z = obj.ball.z;
console.log(player2.position);

};

