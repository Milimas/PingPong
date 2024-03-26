import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x404040, 1 );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();
let paddle1 = new THREE.Object3D();

loader.load( './public/pingpong_paddle.glb', function ( gltf ) {

    gltf.scene.position.set(0, 0, 0);
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    gltf.scene.rotation.set(0, 0, 0);
    
    paddle1.add(gltf.scene);
}, undefined, function (error) {

    console.error(error);

});

scene.add(paddle1);

var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2);
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var pointOfIntersection = new THREE.Vector3();

function onDocumentMouseMove (event) {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, pointOfIntersection);
    paddle1.position.copy(pointOfIntersection);

}

document.addEventListener('mousemove', onDocumentMouseMove) ;



// add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
// make is strong
ambientLight.intensity = 6;
scene.add(ambientLight);

// add a directional light
const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.setScalar(10);
scene.add(light);

camera.position.z = 10;

// on window resize
window.addEventListener('resize', () => {
    // update sizes
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

function animate() {
	requestAnimationFrame( animate );
    
	renderer.render( scene, camera );
}
animate();

