import * as THREE from 'three'
import { LoadGLTFByPath } from './ModelHelper.js'
import { generateUUID } from 'three/src/math/MathUtils.js';

let username = generateUUID() ;
let user = {
  'email': username + '@email.com',
  'password': '123456',
  'username': username,
}

fetch('http://localhost:8000/api/auth/me/',
  {
    credentials: "include",
  }).then(rep => rep.json())
  .then(data => {
    console.log(data)
    if (data.success)
    {
      return ;
    }
    else
    {
      const url = `http://localhost:8000/api/auth/login/`
      fetch(url, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify(user),
      }).then(rep => rep.json())
        .then(data => {
          console.log(data);
          if (data.success)
          {
            console.log(`loged in`);
          }
          else
          {
            fetch('http://localhost:8000/api/auth/register/', {
              method: "POST",
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              credentials: "include",
              body: JSON.stringify(user),
            }).then(rep => rep.json())
              .then(data => {
                console.log(data);
                if (data.success)
                {
                  console.log(`registered`);
                }
              })
              .catch(error => {
                console.log("error")
                
              });
          }
        })
        .catch(error => {
          console.log("error")
        });
    }
  }).catch(error => console.log(error));


//Renderer does the job of rendering the graphics
let renderer = new THREE.WebGLRenderer({
  //Defines the canvas component in the DOM that will be used
	canvas: document.querySelector('#background'),
  antialias: true,
  alpha: true
});
renderer.setClearColor( 0x000000, 0 );

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
let opposit_side_cam_pos ;
let score1Text = 0 ;
let score2Text = 0 ;
let player1Score ;
let player2Score ;

let newUpdate = true ;

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
    if (object.name === "score1")
      player1Score = object
    if (object.name === "score2")
      player2Score = object
    console.log(player1Score);
  });
  updateScore() 

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
  opposit_side_cam_pos = -camera.position.z ;

  camera.lookAt(0,0,0)
}

// on window resize
window.addEventListener('resize', () => {
  // update sizes
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
//A method to be run each time a frame is generated
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (!newUpdate)
    return ;
  newUpdate = false ;
  if (right == true)
    socket.send(JSON.stringify({"type": 'right'})) ;
  if (left == true)
    socket.send(JSON.stringify({"type": 'left'})) ;
};



let socket = new WebSocket('ws://localhost:8000/ws/game/');

socket.onmessage = (event) => {
  let obj = JSON.parse(event.data) ;
  ball.position.x = obj.ball_position[0] ;
  ball.position.z = obj.ball_position[1] ;
  player.position.x = obj.player1 ;
  player2.position.x = obj.player2 ;
  if (score1Text !== obj.score[0])
  {
    score1Text = obj.score[0] ;
    updateScore() ;
  }
  if (score2Text !== obj.score[1])
  {
    score2Text = obj.score[1] ;
    updateScore() ;
  }
  if (obj.side == 'player2')
    camera.position.z = opposit_side_cam_pos ;
  camera.lookAt(0,0,0) ;
  newUpdate = true ;
};

socket.onopen = (event) =>
{
  console.log("connected") ;
}

socket.onclose = (event) =>
{
  console.log("connection closed") ;
}

document.onkeydown = keyDown;
document.onkeyup = keyUp;

let left = false ;
let right = false ;

function keyDown(e) {
    e = e || window.event;

    if (e.keyCode == '37')      // right arrow
       right = true
    else if (e.keyCode == '39') // left arrow
       left = true
}

function keyUp(e) {
  e = e || window.event;

  if (e.keyCode == '37')      // right arrow
     right = false
  else if (e.keyCode == '39') // left arrow
     left = false
}


function createTextTexture(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 256;

  context.fillStyle = "rgba(0, 0, 0, 0.0)";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = 'Bold 256px Arial';
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return new THREE.CanvasTexture(canvas);
}

function updateScore() {
  player1Score.material.map = createTextTexture(`${score1Text}`) ;
  player2Score.material.map = createTextTexture(`${score2Text}`) ;
  player1Score.material.needsUpdate = true ;
  player2Score.material.needsUpdate = true ;
}