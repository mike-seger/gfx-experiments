import * as THREE from 'three';

export class Cube {
    static createMesh(settings) {
        const width = THREE.MathUtils.randFloat(
            settings.cubeSize * settings.minDiameterPercent / 100.0,
            settings.cubeSize * settings.maxDiameterPercent / 100.0
        )
        const height = THREE.MathUtils.randFloat(
            settings.cubeSize * settings.minDiameterPercent / 100.0,
            settings.cubeSize * settings.maxDiameterPercent / 100.0
        )
        const cubeGeometry = new THREE.BoxGeometry(width, height, width)
        const lerpFactor = THREE.MathUtils.randFloat(0, 1)
        const cubeColor = new THREE.Color(settings.color1).clone().lerp(new THREE.Color(settings.color2), lerpFactor)
        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: cubeColor,
            transparent: true,
            opacity: 0
        })

        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(
            THREE.MathUtils.randFloatSpread(settings.cubeSize - width),
            -settings.cubeSize / 2 - height,
            THREE.MathUtils.randFloatSpread(settings.cubeSize - width)
        )

        cube.rotationAxis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        cube.rotationSpeed = 0.05 * Math.random();

        cube.effectiveRadius = Math.sqrt(width * width + height * height) / 2

        return cube
    }
}
