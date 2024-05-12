let canvas = document.getElementById("src-canvas");
let engine = new BABYLON.Engine(canvas, true);
function createScene() {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.White();

    var camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI/2, 1.2, 54, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);


    // var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    // light.intensity = 0.7;

    light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(10, 10, 0), scene);
                light.specular = new BABYLON.Color3.Black() 

    if(!window.nosky) {
        // Skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 200.0, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
    }

    const pbr = new BABYLON.PBRMaterial("pbr", scene);
    pbr.metallic = 0.0;
    pbr.roughness = 1.5;    
    pbr.sheen.isEnabled = true;
    function fixMesh(mesh) {
        mesh.enableEdgesRendering(0.93);
        mesh.material = new BABYLON.StandardMaterial('mat', scene);
        //mesh.material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        mesh.edgesWidth = 10;
        mesh.edgesColor = new BABYLON.Color4(0, 0, 0, 1);	
        mesh.position.y = 1.2;
        mesh.receiveShadow = false
        mesh.castShadow = true
        mesh.receiveShadows = false
        mesh.castShadows = true
        mesh.disableLighting = true
        mesh.convertToFlatShadedMesh()
        mesh.material = pbr;    
    }

    const torus = BABYLON.MeshBuilder.CreateTorusKnot("torus", {
        radius: 12,
        radialSegments: 360,
        tubularSegments: 12,
        tube: 3,
        p: 2,
        q: 2,
    }, scene);
    fixMesh(torus)
    torus.position.x = -7;
    torus.position.y = 6;

    var shape = BABYLON.Mesh.CreateCylinder("cone", 0.001, 0.001, 0, 6, 1, scene, false);
    shape.material = new BABYLON.StandardMaterial("conemat", scene);
    shape.material.diffuseColor = new BABYLON.Color3(.3, .3, 1);
    shape.position = new BABYLON.Vector3(0, 1, -10);

    camera.parent = shape;
    const fps = 30
    const speed = 0.5

    var posAnim = new BABYLON.Animation("pa", "position", fps,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    var rotAnim = new BABYLON.Animation("ra", "rotation", fps,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // Animation keys
    posKeys = [];
    posKeys.push({ frame: 0, value: shape.position });
    posKeys.push({ frame: 3*fps/speed, value: new BABYLON.Vector3(-10, 1, 10) });
    posKeys.push({ frame: 5*fps/speed, value: new BABYLON.Vector3(10, 1, 10) });
    posKeys.push({ frame: 8*fps/speed, value: new BABYLON.Vector3(0, 1, -10) });
    posAnim.setKeys(posKeys);

    rotKeys = [];
    rotKeys.push({ frame: 0, value: shape.rotation });
    rotKeys.push({ frame: 3*fps/speed, value: new BABYLON.Vector3(0, -Math.PI*2, 0) });
    rotKeys.push({ frame: 5*fps/speed, value: new BABYLON.Vector3(0, Math.PI*2, 0) });
    rotKeys.push({ frame: 8*fps/speed, value: new BABYLON.Vector3(0, 0, 0) });
    rotAnim.setKeys(rotKeys);

    // vars for all the available easing trajectories
    var amplitude = 1;

    var bounces = 3;
    var bounciness = .1;

    var oscillations = 1;
    var springiness = 1;

    var exponent = 5;
    var power = 5;

    // pre-make all available easings... for fun

    var ef1 = new BABYLON.CircleEase();
    var ef2 = new BABYLON.BackEase(amplitude);
    var ef3 = new BABYLON.BounceEase(bounces, bounciness);
    var ef4 = new BABYLON.CubicEase();
    var ef5 = new BABYLON.ElasticEase(oscillations, springiness);
    var ef6 = new BABYLON.ExponentialEase(exponent);
    var ef7 = new BABYLON.PowerEase(power);
    var ef8 = new BABYLON.QuadraticEase();
    var ef9 = new BABYLON.QuarticEase();
    var ef10 = new BABYLON.QuinticEase();
    var ef11 = new BABYLON.SineEase();


    // remind me of the three easingModes on an animation...
    // BABYLON.EasingFunction.EASINGMODE_EASEIN - Interpolation follows the mathematical formula associated with the easing function.
    // BABYLON.EasingFunction.EASINGMODE_EASEOUT - Interpolation follows 100% interpolation minus the output of the formula associated with the easing function.
    // BABYLON.EasingFunction.EASINGMODE_EASEINOUT - Interpolation uses EaseIn for the first half of the animation and EaseOut for the second half. 


    // set some work variables... and easy place to change/test different easings
    var posEase = ef4;
    var rotEase = ef11;

    // For each easing function, you can choose between EASEIN (default), EASEOUT, or EASEINOUT
    posEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    rotEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    // Adding the easing functions to the animations
    posAnim.setEasingFunction(posEase);
    rotAnim.setEasingFunction(rotEase);

    // Adding the animations to my shape animations collection
    shape.animations.push(posAnim);
    shape.animations.push(rotAnim);

    //Finally, start all animations on shape7, from key 0 to key 120 with loop true
    scene.beginAnimation(shape, 0, 8*fps/speed, true);

    return scene;
};

let scene = createScene();
engine.runRenderLoop(function() { 
    scene.render(); 
});
