function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    angleMode(DEGREES); // Set angle mode to degrees for easier calculation
}

function draw() {
    background(255);
    rotateX(60);
    rotateZ(frames * 0.5);

    const totalDegrees = 360;
    const arcDegrees = 60; // Degrees of each segment (360 / 5)
    const cutDegrees = 24; // Degrees to cut from each segment

    // Define the size of the torus
    const innerRadius = 250; // Previously 5, now 50 times larger
    const tubeRadius = 75;   // Previously 1.5, now 50 times larger

    for (let i = 0; i < totalDegrees; i += arcDegrees) {
        if (i % (arcDegrees * 6) === 0) { // Draw every other segment to simulate cuts
            for (let j = 0; j < arcDegrees - cutDegrees; j++) { // Draw each segment minus the cut
                push();
                rotateZ(i + j); // Rotate to the correct starting position
                torus(innerRadius, tubeRadius, 6, 10); // Adjust detailX and detailY for smoother torus
                pop();
            }
        }
    }
}
