import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Sphere } from './Sphere.js'
import { Cube } from './Cube.js'
import { PixelModelCreator } from './PixelModelCreator.js';  // Adjust path as necessary

export class ObjectManager {
    constructor(settings) {
        this.settings = settings
        this.scene = null
        this.objects = []
        this.scene = null
        this.composer = null
        this.pixelPass = null
        this.models = []
        this.modelMap = new Map()
        this.showAxis = false

        this.initializeScene()
        this.initializeObjects()
    }

    createMesh() {
        const settings = this.settings
        const mesh = this.modelMap.get(settings.objectType)

        if(mesh) return mesh

        switch(settings.objectType) {
            case 'Cube':
                return Cube.createMesh(settings)

            case 'Sphere':
            default:
                return Sphere.createMesh(settings)
        }
    }

    addObject() {
        const object = this.createMesh()
        const velocity = THREE.MathUtils.randFloat(this.settings.minVelocity, this.settings.maxVelocity)
        this.scene.add(object)
        this.objects.push({ mesh: object, velocity: velocity })
    }

    clearObjects() {
        this.objects.forEach(obj => { this.scene.remove(obj.mesh) })
        this.objects = []
    }

    updateSettings(newSettings, settings) {
        let changes = {
            diameter: 
                settings.minDiameterPercent != newSettings.minDiameterPercent ||
                settings.maxDiameterPercent != newSettings.maxDiameterPercent,
            velocity: 
                settings.minVelocity != newSettings.minVelocity ||
                settings.maxVelocity != newSettings.maxVelocity,
            objectCount: settings.objectCount != newSettings.objectCount,
            pixelSize: settings.pixelSize != newSettings.pixelSize,
            objectType: settings.objectType != newSettings.objectType,
            color1: settings.color1 != newSettings.color1,
            color2: settings.color2 != newSettings.color2
        }

        Object.assign(settings, newSettings)
        this.settings = settings

        let keepN = 0
        if(changes.diameter || changes.velocity 
            || changes.objectCount || changes.objectType
            || changes.color1 || changes.color2
        )
            this.clearObjects()
        else if(changes.pixelSize) {
            this.setPixelPass(this.composer, settings.pixelSize)
            keepN = this.scene.children.length
        }

        if(keepN < settings.objectCount) this.initializeObjects() 
    }

    async initModels(modelConfigs, callback = this.setLoadedModels.bind(this)) {
        const loadPromises = modelConfigs.map(config =>
            PixelModelCreator.createPixelModel(config.imageSrc, config.gapFactor, config.depthFactor, config.ignoreColor)
            .then(model => ({
                model: model,
                identifier: this.getIdentifierFromImageSrc(config.imageSrc)
            }))
        )

        const loadedModels = await Promise.all(loadPromises);
        this.models.push(...loadedModels)

        callback(loadedModels)
    }

    getIdentifierFromImageSrc(imageSrc) {
        return imageSrc.substring(imageSrc.lastIndexOf('/') + 1, imageSrc.lastIndexOf('.'))
    }

    setLoadedModels(loadedModels) {
        console.log('Models are loaded and processed:', loadedModels)
        loadedModels.forEach(({model, identifier}) => {
            this.modelMap.set(identifier, model)
            console.log(`Model loaded and processed for identifier ${identifier}:`, model)
        })
    }

    updateMesh(object) {
        object.mesh.position.y += object.velocity / 60
        if (object.mesh.position.y > this.settings.cubeSize / 2 + object.mesh.effectiveRadius) {
            object.mesh.position.y = -this.settings.cubeSize / 2 - object.mesh.effectiveRadius;
        }

        //console.log(object.mesh.position.y, object.mesh.effectiveRadius)

        const relativeY = object.mesh.position.y + this.settings.cubeSize / 2 + object.mesh.effectiveRadius
        const opacityPeak = this.settings.cubeSize * (this.settings.maxOpacityDuration / 100)
        const fadeInOutThreshold = (this.settings.cubeSize - opacityPeak) / 2

        if (relativeY < fadeInOutThreshold) {
            object.mesh.material.opacity = relativeY / fadeInOutThreshold
        } else if (relativeY > this.settings.cubeSize - fadeInOutThreshold) {
            object.mesh.material.opacity = (this.settings.cubeSize - relativeY) / fadeInOutThreshold
        } else {
            object.mesh.material.opacity = 1
        }

        if (object.mesh.rotationAxis && object.mesh.rotationSpeed) {
            object.mesh.rotateOnAxis(object.mesh.rotationAxis, object.mesh.rotationSpeed);
        }
    }

    moveObject(object) {
        // Check if the object has children, implying it's a group
        if (object.mesh.children && object.mesh.children.length > 0) {
            object.mesh.children.forEach(child => {
                this.updateMesh({ mesh: child, velocity: 60 });
            });
        } else {
            // It's likely a single mesh or similar single object
            this.updateMesh(object);
        }
    }

    moveObjects() {
        this.objects.forEach(object => { this.moveObject(object) })
        this.composer.render()
    }

    initializeObjects() {
        for (let i = 0; i < this.settings.objectCount; i++) this.addObject()
    }

    initializeScene() {
        this.scene = new THREE.Scene()
        if(this.showAxis) {
            this.scene.add(new THREE.AxesHelper(20))
        }
        const aspect = window.innerWidth / window.innerHeight
        const cubeSize = this.settings.cubeSize
        const camera = new THREE.OrthographicCamera(-cubeSize * aspect / 2, cubeSize * aspect / 2, cubeSize / 2, -cubeSize / 2, 1, 1000)
        camera.position.z = 40
        const renderer = new THREE.WebGLRenderer()
        renderer.setSize(window.innerWidth, window.innerHeight)
        let sceneDiv = document.getElementById('scene')

        sceneDiv.appendChild(renderer.domElement)

        this.composer = new EffectComposer(renderer)
        this.composer.addPass(new RenderPass(this.scene, camera))

        this.setPixelPass(this.composer, this.settings.pixelSize)
    }

    setPixelPass(composer, pixelSize) {
        if(this.pixelPass) composer.removePass(this.pixelPass)
        const pixelShader = {
            uniforms: {
                "tDiffuse": { value: null },
                "resolution": { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                "pixelSize": { value: pixelSize }
            },
            vertexShader: `
                varying highp vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform vec2 resolution;
                uniform float pixelSize;
                varying highp vec2 vUv;
                void main(){
                    vec2 dxy = pixelSize / resolution;
                    vec2 coord = dxy * floor(vUv / dxy);
                    gl_FragColor = texture2D(tDiffuse, coord);
                }
            `
        }

        this.pixelPass = new ShaderPass(pixelShader)
        this.pixelPass.renderToScreen = true
        this.composer.addPass(this.pixelPass)
    }
}
