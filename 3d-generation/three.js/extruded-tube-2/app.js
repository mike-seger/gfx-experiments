document.addEventListener('DOMContentLoaded', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    
    // Setup orthographic camera
    const camera = new THREE.OrthographicCamera(
        width / -100,   // Left
        width / 100,    // Right
        height / 100,   // Top
        height / -100,  // Bottom
        100,            // Near
        1000            // Far
    );
    camera.position.set(-25, 200, -80);
    camera.lookAt(scene.position); // Ensure the camera looks at the scene

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);  // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-20, 20, -20);
    scene.add(directionalLight);

    // Axes Helper
    const axesHelper = new THREE.AxesHelper(10);  // The parameter is the size of the axes
    scene.add(axesHelper);

    // Custom curve class for the arc
    class CustomSinCurve extends THREE.Curve {
        constructor(scale = 1) {
            super();
            this.scale = scale;
        }

        getPoint(t) {
            const angle = 55 * Math.PI / 180; // Convert 60 degrees to radians
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

    const material = new THREE.MeshPhongMaterial({ color: 0x156289, side: THREE.DoubleSide });
    let meshes = [];
    let frameCount = 0;

    function createArcGeometry(degrees) {
        const angle = degrees * (0.5 * Math.PI / 180)
        const sideLength = 1.05;
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

    function createRotatedArcMesh(n) {
        const geometry = createArcGeometry(frameCount/2);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = (n * 72 + frameCount/2) * Math.PI / 180;
        return mesh     
    }

    function animate() {
        requestAnimationFrame(animate);
        meshes.forEach((mesh) => scene.remove(mesh))
        meshes = []
        for(let i=0;i<5;i++) {
            mesh = createRotatedArcMesh(i)
            meshes.push(mesh)
            scene.add(mesh);
        }

        renderer.render(scene, camera);
        frameCount++
    }

    animate();
});