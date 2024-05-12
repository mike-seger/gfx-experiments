const sourceCanvas = document.getElementById("src-canvas")
const destCanvas = document.getElementById("dest-canvas")

let destCtx = destCanvas.getContext('2d', { willReadFrequently: true })
const width = window.innerWidth*0.47
const height = window.innerHeight*0.47
destCanvas.width = width
destCanvas.height = height

const settings = { 
    filter: 'OrderedDither8x8', 
    edgeLines: true,
    scaling: '1 : 1',
    smoothPixels: true,
    // blur: 0,
    // grayscale: 0,
    // contrast: 100,
    // brightness: 100,
    // invert: 0,
    // saturation: 100,
    // sepia: 0,
    // hueRotate: 0,
    // bitDepth: 8,
    // monoColor: "#000000" 
}
window.settings = settings

const datConfig = { width : 300 }
function setupControls(settings) {
    dat.GUI.TEXT_OPEN = "Show filters"
    dat.GUI.TEXT_CLOSED = "Hide filters"
    const gui = new dat.GUI(datConfig)
    const filters = ['None']
    for (const [key, value] of Object.entries(window.Dithering)) {
        filters.push(key.replace('apply', ''));
      }

    const scalings = []
    for (let i = 0; i <= 3; i++) {
        const divisor = Math.pow(2, i)
        scalings.push(`1 : ${divisor}`)
    }
    gui.add(settings, 'filter', filters)
    gui.add(settings, 'edgeLines').name('edge lines')
    gui.add(settings, 'scaling', scalings ).onChange(() => { updateCanvasSize() })
    gui.add(settings, 'smoothPixels').name("smooth pixels").onChange(() => { updateCanvasStyle() })
    // gui.add(settings, 'grayscale', 0, 100).step(1).onChange(() => { updateCanvasStyle() })
    // gui.addColor(settings, "monoColor").name("mono color")
    // gui.add(settings, 'contrast', 0, 1000).step(1).onChange(() => { updateCanvasStyle() })
    // gui.add(settings, 'brightness', 0, 4000).step(1).onChange(() => { updateCanvasStyle() })
    // gui.add(settings, 'blur', 0, 32).step(1).onChange(() => { updateCanvasStyle() })
    // gui.add(settings, 'invert', 0, 100).step(1).onChange(() => { updateCanvasStyle() })
    // gui.add(settings, 'saturation', 0, 1000).step(1).onChange(() => { updateCanvasStyle() })
    // gui.add(settings, 'sepia', 0, 1000).step(1).onChange(() => { updateCanvasStyle() })
    // gui.add(settings, 'hueRotate', 0, 360).step(1).onChange(() => { updateCanvasStyle() })
    // gui.add(settings, 'bitDepth', 1, 8).step(1).onChange(() => { updateCanvasStyle() })
}
setupControls(window.settings)
window.addPrevNextToSelects()


function updateCanvasStyle() {
    destCanvas.style["image-rendering"] = settings.smoothPixels? 'auto':'pixelated'
    // const filter = `
    //     grayscale(${settings.grayscale}%) 
    //     contrast(${settings.contrast}%)
    //     brightness(${settings.brightness}%)
    //     saturate(${settings.saturation}%)
    //     sepia(${settings.sepia}%)
    //     hue-rotate(${settings.hueRotate}deg)
    //     invert(${settings.invert}%)
    //     blur(${settings.blur}px)
    //     `
    //     .replace("\n", " ").replace(/ [ ]*/g, " ")
    //     destCanvas.style["filter"] = filter
}

function updateCanvasSize() {
    const expression = settings.scaling.replace(/[ ]/g, '').replace(':', '/')
    const currentScale = eval(expression)

    destCanvas.width = Math.max(1, width * currentScale)
    destCanvas.height = Math.max(1, height * currentScale)
    
    destCtx.imageSmoothingEnabled = settings.smoothPixels
    destCtx.mozImageSmoothingEnabled = settings.smoothPixels
    destCtx.webkitImageSmoothingEnabled = settings.smoothPixels
    destCtx.msImageSmoothingEnabled = settings.smoothPixels
}

function copyTo2DCanvas() {
    if(!destCtx) return
    destCtx.drawImage(sourceCanvas, 0, 0, destCanvas.width, destCanvas.height)
    const imageData = destCtx.getImageData(0, 0, width, height)
    if(settings.filter !== 'None')
        window.Dithering['apply'+settings.filter](imageData)
    destCtx.putImageData(imageData, 0, 0)
}

updateCanvasSize()
updateCanvasStyle()