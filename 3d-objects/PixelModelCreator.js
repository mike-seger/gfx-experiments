import * as THREE from 'three';

export class PixelModelCreator {

    static async createPixelModel(imageSrc, gapFactor, depthFactor, ignoreColor = null, gapColor = 0x000000) {
        const loader = new THREE.TextureLoader()
        const texture = await loader.loadAsync(imageSrc)
        const image = texture.image
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        const width = image.width
        const height = image.height

        canvas.width = width
        canvas.height = height
        context.drawImage(image, 0, 0, width, height)
        const imageData = context.getImageData(0, 0, width, height)
        const pixels = imageData.data

        const cubeSize = 1 / (Math.max(width, height) + (Math.max(width, height) - 1) * gapFactor)
        const cubes = new THREE.Group()

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i]
            const g = pixels[i + 1]
            const b = pixels[i + 2]
            const alpha = pixels[i + 3]

            if ((ignoreColor && r === ignoreColor[0] && g === ignoreColor[1] && b === ignoreColor[2]) || alpha === 0) {
                continue
            }

            const color = new THREE.Color(r / 255, g / 255, b / 255)
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: alpha / 255
            });

            const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize * depthFactor);
            const cube = new THREE.Mesh(geometry, material);
            const x = (i / 4 % width) * (cubeSize + gapFactor * cubeSize) - (width * cubeSize / 2)
            const y = -(Math.floor(i / 4 / width) * (cubeSize + gapFactor * cubeSize) - (height * cubeSize / 2))
            const z = 0

            cube.position.set(x, y, z - cubeSize * depthFactor / 2)
            cubes.add(cube)

            if (gapFactor > 0) {
                const gapMaterial = new THREE.MeshBasicMaterial({ color: gapColor })
                const xGapGeometry = new THREE.BoxGeometry(cubeSize+gapFactor * cubeSize, gapFactor * cubeSize, cubeSize * depthFactor)
                const yGapGeometry = new THREE.BoxGeometry(gapFactor * cubeSize, cubeSize+gapFactor * cubeSize, cubeSize * depthFactor)

                const signs = [1, -1]
                const factors = [0, 1]
                signs.forEach((sign) => {
                    factors.forEach((factor) => {
                        const gap = new THREE.Mesh(factor==0?xGapGeometry:yGapGeometry, gapMaterial)
                        gap.position.set(
                            x + factor*sign*cubeSize*(1+gapFactor)/2, 
                            y + (1-factor)*sign*cubeSize*(1+gapFactor)/2, 
                            -cubeSize/2)
                        cubes.add(gap)
                    })
                })
            }
        }

        // Normalize the group size to fit into a 1x1x1 cube
        const size = new THREE.Vector3()
        new THREE.Box3().setFromObject(cubes).getSize(size)
        const maxDimension = Math.max(size.x, size.y, size.z)
        cubes.scale.multiplyScalar(1 / maxDimension)

        return cubes;
    }
}
