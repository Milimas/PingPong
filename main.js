import * as THREE from 'three'
import { LoadGLTFByPath } from './ModelHelper.js'
import { generateUUID } from 'three/src/math/MathUtils.js';
import { flattenJSON } from 'three/src/animation/AnimationUtils.js';

let username = generateUUID() ;
let user = {
  // 'email': 'email@email.com',
  'email': username + '@email.com',
  'password': '123456',
  'username': username,
}

// fetch('http://10.14.1.8:8000/api/auth/me/',
//   {
//     credentials: "include",
//   }).then(rep => rep.json())
//   .then(data => {
//     console.log(data)
//     if (data.success)
//     {
//       return ;
//     }
//     else
//     {
//       const url = `http://10.14.1.8:8000/api/auth/login/`
//       fetch(url, {
//         method: "POST",
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         },
//         credentials: "include",
//         body: JSON.stringify(user),
//       }).then(rep => rep.json())
//         .then(data => {
//           console.log(data);
//           if (data.success)
//           {
//             console.log(`loged in`);
//           }
//           else
//           {
//             fetch('http://10.14.1.8:8000/api/auth/register/', {
//               method: "POST",
//               headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//               },
//               credentials: "include",
//               body: JSON.stringify(user),
//             }).then(rep => rep.json())
//               .then(data => {
//                 console.log(data);
//                 if (data.success)
//                 {
//                   console.log(`registered`);
//                 }
//               })
//               .catch(error => {
//                 console.log("error")
                
//               });
//           }
//         })
//         .catch(error => {
//           console.log("error")
//         });
//     }

//   }).catch(error => console.log(error));


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
let opposit_side_cam_pos ;

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
    {
      player2 = object ;
      let box = new THREE.Box3().setFromObject( player2 );
      let measure = new THREE.Vector3()
      let size = box.getSize(measure); 
      console.log("player2")
      console.log(measure)
      console.log(size)
    }
    if (object.name === "Cube")
    {
      ball = object ;
      var box = new THREE.Box3().setFromObject( ball );
      console.log("ball")
      console.log(box.max.x - box.min.x)
      console.log(box.max.y - box.min.y)
    }
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
  opposit_side_cam_pos = -camera.position.z ;
  // camera.position.z = opposit_side_cam_pos ;

  // camera.position.z = 0 ;
  // camera.position.y = 20 ;
  // camera.position.x = 0 ;
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
  // if (!newUpdate)
  //   return ;
  renderer.render(scene, camera);
  newUpdate = false ;
  if (right == true)
    socket.send(JSON.stringify({"type": 'right'})) ;
  if (left == true)
    socket.send(JSON.stringify({"type": 'left'})) ;
};



let socket = new WebSocket('ws://10.14.1.8:8000/ws/game/');

socket.onmessage = (event) => {
  let obj = JSON.parse(event.data) ;
  ball.position.x = obj.ball_position[0] ;
  ball.position.z = obj.ball_position[1] ;
  player.position.x = obj.player1 ;
  player2.position.x = obj.player2 ;
  if (obj.side == 'player2')
    camera.position.z = opposit_side_cam_pos ;
  camera.lookAt(0,0,0) ;
  newUpdate = true ;
  // console.log(obj) ;
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

    if (e.keyCode == '37')      // left arrow
       left = true
    else if (e.keyCode == '39') // right arrow
       right = true
}

function keyUp(e) {
  e = e || window.event;

  if (e.keyCode == '37')      // left arrow
     left = false
  else if (e.keyCode == '39') // right arrow
     right = false
}