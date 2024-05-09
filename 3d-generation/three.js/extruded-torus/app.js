import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('keydown', (event) => {
    if (event.key === 'l') {
        console.log(`Camera Position: { x: ${camera.position.x}, y: ${camera.position.y}, z: ${camera.position.z} }`);
        console.log(`Camera Rotation: { x: ${camera.rotation.x}, y: ${camera.rotation.y}, z: ${camera.rotation.z} }`);
    }
});

const width = window.innerWidth;
const height = window.innerHeight;
const scene = new THREE.Scene();

const nArcs = 5
const arcGapFraction = 0.2

let startTime = performance.now()
let meshes = [];


// Setup orthographic camera
const camera = new THREE.OrthographicCamera(
    width / -100, width / 100, height / 100, height / -100, 100, 1000
);
camera.position.set(-202, 143, -3 )
camera.rotation.set(-1.6, -1, -1.6 )
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Lighting
// const ambientLight = new THREE.AmbientLight(0xffffff);
// scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 9);
directionalLight.position.set(-20, 20, 20);
scene.add(directionalLight);

// Axes Helper
const axesHelper = new THREE.AxesHelper(10); 
//scene.add(axesHelper);

// Custom curve class for the arc
class CustomSinCurve extends THREE.Curve {
    constructor(scale = 1) {
        super();
        this.scale = scale;
    }

    getPoint(t) {
        const angle = (360/nArcs)*(1-arcGapFraction) * Math.PI / 180; // Convert 60 degrees to radians
        const radius = 5;
        const tx = radius * Math.cos(t * angle);
        const tz = radius * Math.sin(t * angle);
        return new THREE.Vector3(tx, 0, -tz).multiplyScalar(this.scale);
    }
}

const path = new CustomSinCurve();
const extrudeSettings = {
    steps: 50,
    extrudePath: path,
    bevelEnabled: false
};

const material = new THREE.MeshPhongMaterial({ color: 0x999999, side: THREE.DoubleSide });

function createArcGeometry(degrees) {
    const angle = degrees * (0.5 * Math.PI / 180)
    const sideLength = 0.9;
    const shape = new THREE.Shape();
    const corners = 9
    for (let i = 0; i < corners; i++) {
        const theta = angle + (Math.PI * 2 / corners * i);
        const x = Math.cos(theta) * sideLength;
        const y = Math.sin(theta) * sideLength;
        if (i === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

function createRotatedArcMesh(n, nMax, elapsed) {
    const accel = acceleration(elapsed/1000.0, 1.5, 0.5)
    const geometry = createArcGeometry(elapsed/1000*40);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = (n+accel+0.7) * (360/nMax) * Math.PI / 180;
    return mesh     
}

function acceleration(t, tMove, tPause) {
    const modT = t % (tMove + tPause);
    if (modT > tMove) return 0
    return (-Math.cos(Math.PI * modT / tMove)+1)/2;
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    const newMeshes = []
    for(let i=0;i<nArcs;i++) {
        newMeshes.push(createRotatedArcMesh(i, nArcs, performance.now()-startTime))
    }

    meshes.forEach((mesh) => scene.remove(mesh))
    newMeshes.forEach((mesh) => scene.add(mesh))
    meshes = newMeshes
    
    renderer.render(scene, camera);
}

animate();
