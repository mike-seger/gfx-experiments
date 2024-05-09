document.addEventListener('DOMContentLoaded', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 5, 30);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 20, 20);
    scene.add(light);

    // Create an octagon shape
    const points = [];
    const sides = 8; // Octagon
    const radius = 10;
    for (let i = 0; i < sides; i++) {
        const angle = Math.PI * 2 / sides * i;
        points.push(new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius));
    }
    const shape = new THREE.Shape(points);

    // Extrude settings
    const extrudeSettings = {
        steps: 2,
        depth: 5,
        bevelEnabled: false
    };

    // Total degrees available for arcs (360 - 5*12 for gaps)
    const totalArcDegrees = 360 - 5 * 12;
    const segmentDegrees = totalArcDegrees / 5;

    const materials = [
        new THREE.MeshLambertMaterial({ color: 0x156289, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
    ];

    for (let i = 0; i < 5; i++) {
        const startAngle = (segmentDegrees + 12) * i;
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Rotate and position each segment
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.rotation.z = THREE.MathUtils.degToRad(startAngle);
        scene.add(mesh);
    }

    function animate() {
        requestAnimationFrame(animate);
        scene.rotation.y += 0.005; // Rotate the scene for better visualization
        renderer.render(scene, camera);
    }

    animate();
});
