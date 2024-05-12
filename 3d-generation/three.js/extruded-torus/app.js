import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

document.addEventListener('keydown', (event) => {
    if (event.key === 'l') {
        console.log(`Camera Position: { x: ${camera.position.x}, y: ${camera.position.y}, z: ${camera.position.z} }`)
        console.log(`Camera Rotation: { x: ${camera.rotation.x}, y: ${camera.rotation.y}, z: ${camera.rotation.z} }`)
    }
})

const width = window.innerWidth*0.47
const height = window.innerHeight*0.47

const sourceContainer = document.getElementById("source-container")
const sourceCanvas = document.getElementById("src-canvas")

const scene = new THREE.Scene()

const nArcs = 5
const arcGapFraction = 0.2

let startTime = performance.now()
let meshes = [];


// Setup orthographic camera
const camera = new THREE.OrthographicCamera(
    width*1.1 / -100, width*1.1 / 100, height*1.1 / 100, height*1.1 / -100, 100, 1000
);
camera.position.set(-202, 143, -3 )
camera.rotation.set(-1.6, -1, -1.6 )
camera.lookAt(scene.position)

const renderer = new THREE.WebGLRenderer({ canvas: sourceCanvas })
renderer.setSize(width, height)
renderer.setClearColor(0xffffff)
sourceContainer.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.update()

// Lighting
// const ambientLight = new THREE.AmbientLight(0x555555)
// scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
directionalLight.position.set(-20, 20, 20)
scene.add(directionalLight)

// Axes Helper
//const axesHelper = new THREE.AxesHelper(10)
//scene.add(axesHelper);

// Custom curve class for the arc
class CustomSinCurve extends THREE.Curve {
    constructor(scale = 1) {
        super();
        this.scale = scale;
    }

    getPoint(t) {
        const angle = (360/nArcs)*(1-arcGapFraction) * Math.PI / 180 // Convert 60 degrees to radians
        const radius = 5
        const tx = radius * Math.cos(t * angle)
        const tz = radius * Math.sin(t * angle)
        return new THREE.Vector3(tx, 0, -tz).multiplyScalar(this.scale)
    }
}

const path = new CustomSinCurve()
const extrudeSettings = {
    steps: 80,
    //depth: 100,
    extrudePath: path,
    bevelEnabled: false
}

const material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, side: THREE.DoubleSide })

function createArcGeometry(degrees) {
    const angle = degrees * (0.5 * Math.PI / 180)
    const sideLength = 0.9
    const shape = new THREE.Shape()
    const corners = 9
    for (let i = 0; i < corners; i++) {
        const theta = angle + (Math.PI * 2 / corners * i)
        const x = Math.cos(theta) * sideLength
        const y = Math.sin(theta) * sideLength
        if (i === 0) {
            shape.moveTo(x, y)
        } else {
            shape.lineTo(x, y)
        }
    }
    shape.closePath()

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
}

function createRotatedArcMesh(n, nMax, elapsed) {
    const accel = acceleration(elapsed/1000.0, 1.5, 0.5)
    const geometry = createArcGeometry(elapsed/1000*25)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.y = (n+accel+0.7) * (360/nMax) * Math.PI / 180
    return mesh     
}

function addCylinderBetweenPoints(point1, point2, thickness, material, scene) {
    const direction = new THREE.Vector3().subVectors(point2, point1);
    const orientation = new THREE.Matrix4();
    orientation.lookAt(point1, point2, new THREE.Object3D().up);
    orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0,
                                                 0, 0, 1, 0,
                                                 0, -1, 0, 0,
                                                 0, 0, 0, 1));
    const edgeGeometry = new THREE.CylinderGeometry(thickness / 2, thickness / 2, direction.length(), 8, 1);
    const edge = new THREE.Mesh(edgeGeometry, material);
    edge.applyMatrix4(orientation);
    edge.position.x = (point2.x + point1.x) / 2;
    edge.position.y = (point2.y + point1.y) / 2;
    edge.position.z = (point2.z + point1.z) / 2;
    scene.add(edge);
}

function createRotatedArcLines2(n, nMax, elapsed) {
    const accel = acceleration(elapsed/1000.0, 1.5, 0.5)
    const geometry = createArcGeometry(elapsed/1000*25)
    const edges = new THREE.EdgesGeometry(geometry, 25);
    const vertices = edges.attributes.position.array;

    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const thickness = 0.1;  // Set the desired thickness of your lines

    for (let i = 0; i < vertices.length; i += 6) {
        const start = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
        const end = new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
        addCylinderBetweenPoints(start, end, thickness, lineMaterial, scene);
    }

    // Optionally set rotation on the entire group of cylinders if needed
    const linesGroup = new THREE.Group();
    scene.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material === lineMaterial) {
            linesGroup.add(child);
        }
    });
    linesGroup.rotation.y = (n + accel + 0.7) * (360 / nMax) * Math.PI / 180;
    return linesGroup
}

function createRotatedArcLines(n, nMax, elapsed) {
    const accel = acceleration(elapsed/1000.0, 1.5, 0.5)
    const geometry = createArcGeometry(elapsed/1000*25)
    const edges = new THREE.EdgesGeometry(geometry, 2)

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
    const lines = new THREE.LineSegments(edges, lineMaterial )
    lines.rotation.y = (n+accel+0.7) * (360/nMax) * Math.PI / 180
    return lines
}

function acceleration(t, tMove, tPause) {
    const modT = t % (tMove + tPause)
    if (modT > tMove) return 0
    return (-Math.cos(Math.PI * modT / tMove)+1)/2
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    const newMeshes = []
    for(let i=0;i<nArcs;i++) {
        const elapsed = performance.now()-startTime
        newMeshes.push(createRotatedArcMesh(i, nArcs, elapsed))
        if(settings.edgeLines)
            newMeshes.push(createRotatedArcLines(i, nArcs, elapsed))
    }

    meshes.forEach((mesh) => scene.remove(mesh))
    newMeshes.forEach((mesh) => scene.add(mesh))
    meshes = newMeshes
    
    renderer.render(scene, camera)
    copyTo2DCanvas()
}

animate()
