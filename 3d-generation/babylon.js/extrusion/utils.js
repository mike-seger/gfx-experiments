function showAxis(size, scene) {
    var makeTextPlane = function (text, color, size) {
       var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
       dynamicTexture.hasAlpha = true;
       dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
       var plane = BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
       plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
       plane.material.backFaceCulling = false;
       plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
       plane.material.diffuseTexture = dynamicTexture;
       return plane;
    };
    var axisX = BABYLON.Mesh.CreateLines("axisX", [
       BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
       new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = BABYLON.Mesh.CreateLines("axisY", [
       BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
       new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
       BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
       new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
 };

 function createRegularPolygon(sides, radius) {
    const points = [];
    const step = Math.PI * 2 / sides;  // The angle between the vertices

    for (let i = 0; i < sides; i++) {
        const x = radius * Math.cos(step * i);
        const y = radius * Math.sin(step * i);
        points.push(new BABYLON.Vector3(x, y, 0));  // Z is 0 as we're in the X-Y plane
    }
    points.push(points[0])

    return points;
}