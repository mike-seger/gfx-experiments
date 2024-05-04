import * as THREE from 'three';

export class Sphere {
    static createMesh(settings) {
        const diameter = THREE.MathUtils.randFloat(
            settings.cubeSize * settings.minDiameterPercent / 100,
            settings.cubeSize * settings.maxDiameterPercent / 100
        );

        const sphereGeometry = new THREE.SphereGeometry(diameter / 2, 32, 32)
        const lerpFactor = THREE.MathUtils.randFloat(0, 1)
        const sphereColor = new THREE.Color(settings.color1).clone().lerp(new THREE.Color(settings.color2), lerpFactor)
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: sphereColor,
            transparent: true,
            opacity: 1
        })

        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        sphere.position.set(
            THREE.MathUtils.randFloatSpread(settings.cubeSize - diameter),
            -settings.cubeSize / 2 - diameter, // Start below the cube
            THREE.MathUtils.randFloatSpread(settings.cubeSize - diameter)
        )

        sphere.effectiveRadius = diameter / 2;
        
        return sphere
    }
}
