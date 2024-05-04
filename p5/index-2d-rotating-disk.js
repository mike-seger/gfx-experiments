const WIDTH = 380
const HEIGHT = 380
const TARGET_WIDTH = 56
const TARGET_HEIGHT = 56
const FPS = 25
const PAUSED_FRAME = FPS
const PAUSE_MILLIS = 500
const COLOR_1 = '#649de3'
const COLOR_2 = '#0077dd'

document.addEventListener("DOMContentLoaded", function() {
    // Create the source canvas element
    const canvases = document.getElementById("canvases")
    const srcCanvas = document.createElement('canvas')
    let currentScale = 1/8
    srcCanvas.width = WIDTH;
    srcCanvas.height = HEIGHT;
    canvases.appendChild(srcCanvas);

    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = WIDTH*currentScale;
    targetCanvas.height = HEIGHT*currentScale;
    canvases.appendChild(targetCanvas)

    const monoColor = document.getElementById('mono-color');
    monoColor.addEventListener('change', () => {
        currentMonoColor = hexToRgb(monoColor.value)
    })
    let currentMonoColor = hexToRgb(monoColor.value)
    const canvasBgColor = getCssColor(targetCanvas, 'background-color')

    const scaleSelector = document.getElementById('scaleSelector');
    scaleSelector.addEventListener('change', () => {
        if(!targetCanvas.width) return
        currentScale = eval(scaleSelector.value)
        targetCanvas.width = srcCanvas.width * currentScale
        targetCanvas.height = srcCanvas.height * currentScale
    })

    function populateScaleSelect() {
        const select = document.getElementById("scaleSelector");
        for (let i = 0; i <= 8; i++) {
            const option = document.createElement('option');
            const divisor = Math.pow(2, i)
            option.value = `1 / ${divisor}`
            option.text = `1 : ${divisor}`
            if(i==3) option.setAttribute('selected', 'selected')
            select.appendChild(option)
        }
    }
    populateScaleSelect();

    const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })
    const targetCtx = targetCanvas.getContext('2d', { willReadFrequently: true })
    setpixelated(targetCtx)

    let frameCounter = 0;
    let paused = false;

    let prevFrameCounter=0
    function showFPS(){
        //console.log(`FPS: ${frameCounter-prevFrameCounter}`)
        prevFrameCounter=frameCounter
        setTimeout(showFPS, 1000);
    }
    showFPS();

    let prevTick = 0;

    function nextFrame() {
        requestAnimationFrame(draw)
        let now = Math.round(FPS * Date.now() / 1000)
        if (now == prevTick) return false
        prevTick = now
        return true
    }

    function draw() {
        if(!nextFrame()) return

        srcCtx.clearRect(0, 0, srcCanvas.width, srcCanvas.height);
      
        let colors = [COLOR_1, COLOR_2]
        if(Math.round((frameCounter/FPS+0.5))%2==0) colors = colors.reverse()
        
        drawEllipse(colors[0], (frameCounter%FPS)/(FPS-1)/2, 1/2*(frameCounter%FPS)/(FPS-1))
        drawEllipse(colors[1], 1-(FPS-1-frameCounter%FPS)/(FPS-1)/2, 1/2*((FPS-1-frameCounter%FPS))/(FPS-1))

        targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        targetCtx.drawImage(srcCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
        applyDither(targetCtx, targetCanvas.width, targetCanvas.height);

        if(!paused) {
            if(frameCounter>0 && frameCounter%PAUSED_FRAME == PAUSED_FRAME-1) {
                paused=true;
                setTimeout(() => {
                    paused=false;
                    frameCounter++;
                }, PAUSE_MILLIS);            
            } else frameCounter++;
        }
    }

    function drawEllipse(fillStyle, xFactor, wFactor) {
        const randomSubpixelOffset = 8*Math.random()/3.2;
        srcCtx.save();
        srcCtx.translate(srcCanvas.width*xFactor+randomSubpixelOffset, srcCanvas.height / 2);
        srcCtx.fillStyle = fillStyle
        srcCtx.beginPath();
        srcCtx.ellipse(0, 0, srcCanvas.width*wFactor, srcCanvas.height/2, 0, 0, 2 * Math.PI);
        srcCtx.fill();
        srcCtx.restore();
    }

    function applyDither(targetCtx, tw, th) {
        const imageData = targetCtx.getImageData(0, 0, tw, th)
        applySierraDither(imageData, currentMonoColor, canvasBgColor)
        targetCtx.putImageData(imageData, 0, 0);
    }

    draw();
});
