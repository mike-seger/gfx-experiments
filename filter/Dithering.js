function getMedianColor(frame) {
    const data = frame.data;
    const rValues = [];
    const gValues = [];
    const bValues = [];

    // Collect color components separately
    for (let i = 0; i < data.length; i += 4) {
        if(data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) continue
        rValues.push(data[i]);
        gValues.push(data[i + 1]);
        bValues.push(data[i + 2]);
    }

    // Function to find the median
    const median = (values) => {
        values.sort((a, b) => a - b);
        const mid = Math.floor(values.length / 2);
        return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
    };

    return {
        r: median(rValues),
        g: median(gValues),
        b: median(bValues)
    };
}

function getAverageColor(frame) {
    const data = frame.data;
    let r = 0, g = 0, b = 0;
    let total = 0;

    for (let i = 0; i < data.length; i += 4) {
        if(data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) continue
        total++;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }

    if(total==0) total = 1

    return {
        r: r / total,
        g: g / total,
        b: b / total
    };
}

function replaceColor(frame, rgb0, rgb1) {
    const data = frame.data;
    const width = frame.width;
    const height = frame.height;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            if(rgb0.r==data[i] && rgb0.g==data[i+1] && rgb0.b==data[i+2]) {
                data[i] = rgb1.r;
                data[i+1] = rgb1.g;
                data[i+2] = rgb1.b;
            }
        }
    }
}

function applyColorReduction(data, bitDepth) {
    const levels = (1 << bitDepth) - 1; 
    const shiftAmount = 8 - bitDepth; // 8 bits original minus desired bits
    for (let i = 0; i < data.length; i += 4) {
        data[i] = (((data[i] >> shiftAmount) & levels) << shiftAmount);     // Red
        data[i + 1] = (((data[i + 1] >> shiftAmount) & levels) << shiftAmount); // Green
        data[i + 2] = (((data[i + 2] >> shiftAmount) & levels) << shiftAmount); // Blue
    }
}

function applyOrderedDitherMatrix(frame, ditherMatrix, monoColor={r:0, g:0, b:0}, bgColor={r:255, g:255, b:255}) {
    const data = frame.data;
    const width = frame.width;
    const height = frame.height;
    const matrixDim = ditherMatrix.length;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (x + y * width) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const grayscale = 0.299 * r + 0.587 * g + 0.114 * b;
            const maxMatrixValue = ditherMatrix.reduce((max, row) => Math.max(max, ...row), 0);
            const ditherValue = (grayscale / 255) * (maxMatrixValue + 1);
            const matrixValue = ditherMatrix[y % matrixDim][x % matrixDim];
            const newColor = ditherValue > matrixValue ? 255 : 0;

            data[i] = newColor === 0 ? monoColor.r : bgColor.r;
            data[i + 1] = newColor === 0 ? monoColor.g : bgColor.g;
            data[i + 2] = newColor === 0 ? monoColor.b : bgColor.b;
        }
    }
}

function applyOrderedDither2x2(frame, monoColor={r:0,g:0,b:0}, bgColor={r:255,g:255,b:255}) {
    const bayer2x2 = [
        [1, 3],
        [4, 2]
    ]
    applyOrderedDitherMatrix(frame, bayer2x2, monoColor, bgColor)
}

function applyOrderedDither4x4(frame, monoColor={r:0,g:0,b:0}, bgColor={r:255,g:255,b:255}) {
    const bayerMatrix = [
        [ 1,  9,  3, 11],
        [13,  5, 15,  7],
        [ 4, 12,  2, 10],
        [16,  8, 14,  6]
    ]
    
    applyOrderedDitherMatrix(frame, bayerMatrix, monoColor, bgColor)
}

function applyOrderedDither8x8(frame, monoColor={r:0,g:0,b:0}, bgColor={r:255,g:255,b:255}) {
    let ditherMatrix = [
        [1, 49, 13, 61, 4, 52, 16, 64],
        [33, 17, 45, 29, 36, 20, 48, 32],
        [9, 57, 5, 53, 12, 60, 8, 56],
        [41, 25, 37, 21, 44, 28, 40, 24],
        [3, 51, 15, 63, 2, 50, 14, 62],
        [35, 19, 47, 31, 34, 18, 46, 30],
        [11, 59, 7, 55, 10, 58, 6, 54],
        [43, 27, 39, 23, 42, 26, 38, 22]
    ]

    applyOrderedDitherMatrix(frame, ditherMatrix, monoColor, bgColor)
}  

function applyOrderedDither16x16(frame, monoColor={r:0,g:0,b:0}, bgColor={r:255,g:255,b:255}) {
    const bayerMatrix16x16 = [
        [ 0, 192,  48, 240,  12, 204,  60, 252,   3, 195,  51, 243,  15, 207,  63, 255],
        [128,  64, 176, 112, 140,  76, 188, 124, 131,  67, 179, 115, 143,  79, 191, 127],
        [ 32, 224,  16, 208,  44, 236,  28, 220,  35, 227,  19, 211,  47, 239,  31, 223],
        [160,  96, 144,  80, 172, 108, 156,  92, 163,  99, 147,  83, 175, 111, 159,  95],
        [ 8, 200,  56, 248,   4, 196,  52, 244,  11, 203,  59, 251,   7, 199,  55, 247],
        [136,  72, 184, 120, 132,  68, 180, 116, 139,  75, 187, 123, 135,  71, 183, 119],
        [ 40, 232,  24, 216,  36, 228,  20, 212,  43, 235,  27, 219,  39, 231,  23, 215],
        [168, 104, 152,  88, 164, 100, 148,  84, 171, 107, 155,  91, 167, 103, 151,  87],
        [ 2, 194,  50, 242,  14, 206,  62, 254,   1, 193,  49, 241,  13, 205,  61, 253],
        [130,  66, 178, 114, 142,  78, 190, 126, 129,  65, 177, 113, 141,  77, 189, 125],
        [ 34, 226,  18, 210,  46, 238,  30, 222,  33, 225,  17, 209,  45, 237,  29, 221],
        [162,  98, 146,  82, 174, 110, 158,  94, 161,  97, 145,  81, 173, 109, 157,  93],
        [ 10, 202,  58, 250,   6, 198,  54, 246,   9, 201,  57, 249,   5, 197,  53, 245],
        [138,  74, 186, 122, 134,  70, 182, 118, 137,  73, 185, 121, 133,  69, 181, 117],
        [ 42, 234,  26, 218,  38, 230,  22, 214,  41, 233,  25, 217,  37, 229,  21, 213],
        [170, 106, 154,  90, 166, 102, 150,  86, 169, 105, 153,  89, 165, 101, 149,  85]
    ];
    

    applyOrderedDitherMatrix(frame, bayerMatrix16x16, monoColor, bgColor)
}  



/*
function applyOrderedDither(frame, monoColor={r:0,g:0,b:0}, bgColor={r:255,g:255,b:255}) {
    const bayerMatrix = [
        [ 1,  9,  3, 11],
        [13,  5, 15,  7],
        [ 4, 12,  2, 10],
        [16,  8, 14,  6]
    ];
    const data = frame.data;
    for (let y = 0; y < frame.height; y++) {
        for (let x = 0; x < frame.width; x++) {
            const i = (y * frame.width + x) * 4;
            const gray = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
            const scale = gray + bayerMatrix[y % 4][x % 4] * 16 - 128; // Scale the grayscale value based on the matrix
            const newColor = scale > 128 ? 255 : 0;

            data[i] = newColor==0? monoColor.r : newColor
            data[i+1] = newColor==0? monoColor.g : newColor
            data[i+2] = newColor==0? monoColor.b : newColor
        }
    }
}   */

function applyOrderedDitherColor(frame) {
    const data = frame.data;
    const width = frame.width;
    const height = frame.height;

    // 4x4 dithering matrix
    const matrix = [
        [ 1,  9,  3, 11],
        [13,  5, 15,  7],
        [ 4, 12,  2, 10],
        [16,  8, 14,  6]
    ];
    const matrixSize = 4;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const mapX = x % matrixSize;
            const mapY = y % matrixSize;

            // Apply the matrix for each color channel
            for (let i = 0; i < 3; i++) { // Loop over R, G, B channels
                const oldPixel = data[index + i];
                const newPixel = ((oldPixel / 255 * 16) + matrix[mapY][mapX] - 7.5) * 16;
                data[index + i] = Math.max(0, Math.min(255, newPixel));
            }
        }
    }
}

function applyInverColorFilter(frame) {
    const data = frame.data
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]
        data[i + 1] = 255 - data[i + 1]
        data[i + 2] = 255 - data[i + 2]
    }
}

function applySierraDither(frame, monoColor={r:0,g:0,b:0}, bgColor={r:255,g:255,b:255}) {
    const data = frame.data;
    const width = frame.width;
    const height = frame.height;

    function distributeErrorSierra(data, x, y, width, height, error) {
        const errorDistribution = [
            { x: 1, y: 0, weight: 5 / 32 },
            { x: 2, y: 0, weight: 3 / 32 },
            { x: -2, y: 1, weight: 2 / 32 },
            { x: -1, y: 1, weight: 4 / 32 },
            { x: 0, y: 1, weight: 5 / 32 },
            { x: 1, y: 1, weight: 4 / 32 },
            { x: 2, y: 1, weight: 2 / 32 },
            { x: -1, y: 2, weight: 2 / 32 },
            { x: 0, y: 2, weight: 3 / 32 },
            { x: 1, y: 2, weight: 2 / 32 }
        ];

        for (let {x: dx, y: dy, weight} of errorDistribution) {
            if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height) {
                const i = ((y + dy) * width + (x + dx)) * 4;
                let r = data[i], g = data[i + 1], b = data[i + 2];
                let newError = error * weight;
                data[i] = Math.max(0, Math.min(255, r + newError));
                data[i + 1] = Math.max(0, Math.min(255, g + newError));
                data[i + 2] = Math.max(0, Math.min(255, b + newError));
            }
        }
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const oldPixel = {
                r: data[i],
                g: data[i+1],
                b: data[i+2]
            };
            const average = Math.round(0.299 * oldPixel.r + 0.587 * oldPixel.g + 0.114 * oldPixel.b);
            const newColor = average > 127 ? 255 : 0;
            const err = average - newColor;

            // data[i] = data[i+1] = data[i+2] = newColor
            data[i] = newColor==0? monoColor.r : bgColor.r
            data[i+1] = newColor==0? monoColor.g : bgColor.g
            data[i+2] = newColor==0? monoColor.b : bgColor.b

            // Spread the error to surrounding pixels
            distributeErrorSierra(data, x, y, width, height, err);
        }
    }

    // for (let y = 0; y < height; y++) {
    //     for (let x = 0; x < width; x++) {
    //         const i = (y * width + x) * 4;
    //         const oldPixel = {
    //             r: data[i],
    //             g: data[i+1],
    //             b: data[i+2]
    //         };
    //         const average = Math.round(0.299 * oldPixel.r + 0.587 * oldPixel.g + 0.114 * oldPixel.b);
    //         const newColor = average > 127 ? 255 : 0;
    //         data[i] = data[i]==0? monoColor.r : newColor
    //         data[i+1] = data[i+1]==0? monoColor.g : newColor
    //         data[i+2] = data[i+2]==0? monoColor.b : newColor
    //     }
    // }
}

function applyRandomDither(frame, monoColor={r:0,g:0,b:0}, bgColor={r:255,g:255,b:255}) {
    const data = frame.data;

    for (let i = 0; i < data.length; i += 4) {
        const randThreshold = Math.random() * 255;
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        //data[i] = data[i + 1] = data[i + 2] = (gray < randThreshold) ? 0 : 255;
        const newColor = (gray < randThreshold) ? 0 : 255;
        data[i] = newColor==0? monoColor.r : bgColor.r
        data[i+1] = newColor==0? monoColor.g : bgColor.g
        data[i+2] = newColor==0? monoColor.b : bgColor.b
    }
}

function applyBlueNoiseDither(frame, monoColor={r:0,g:0,b:0}, bgColor={r:255,g:255,b:255}, noiseLevel = 30) {
    const width = frame.width;
    const data = frame.data;

    for (let i = 0; i < data.length; i += 4) {
        let noise = (Math.random() * 2 - 1) * noiseLevel
        let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2] + noise
        const newColor = (gray < 128) ? 0 : 255;
        data[i] = newColor==0? monoColor.r : bgColor.r
        data[i+1] = newColor==0? monoColor.g : bgColor.g
        data[i+2] = newColor==0? monoColor.b : bgColor.b
    }
}

function applyFloydSteinbergFilter(frame) {
    const data = frame.data;
    const width = frame.width;

    function distributeError(data, index, width, errR, errG, errB) {
        // Right pixel
        if ((index / 4 + 1) % width !== 0) {
            addError(data, index + 4, 7 / 16, errR, errG, errB);
        }
        // Bottom pixel
        if (index / 4 + width < data.length / 4) {
            addError(data, index + 4 * width, 5 / 16, errR, errG, errB);
        }
        // Bottom left pixel
        if ((index / 4 % width !== 0) && (index / 4 + width < data.length / 4)) {
            addError(data, index + 4 * width - 4, 3 / 16, errR, errG, errB);
        }
        // Bottom right pixel
        if ((index / 4 + width < data.length / 4) && ((index / 4 + 1) % width !== 0)) {
            addError(data, index + 4 * width + 4, 1 / 16, errR, errG, errB);
        }
    }

    function addError(data, index, factor, errR, errG, errB) {
        data[index] += errR * factor;
        data[index + 1] += errG * factor;
        data[index + 2] += errB * factor;
    }

    for (let y = 0; y < frame.height; y++) {
        for (let x = 0; x < width; x++) {
            let i = (y * width + x) * 4;
            let oldR = data[i];
            let oldG = data[i + 1];
            let oldB = data[i + 2];
            let newR = (oldR < 128) ? 0 : 255;
            let newG = (oldG < 128) ? 0 : 255;
            let newB = (oldB < 128) ? 0 : 255;
            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;

            let errR = oldR - newR;
            let errG = oldG - newG;
            let errB = oldB - newB;

            distributeError(data, i, width, errR, errG, errB);
        }
    }
}

function applyStuckiDither(frame) {
    const data = frame.data;
    const width = frame.width;

    for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) { // Repeat for R, G, B channels
            const oldPixel = data[i + c];
            const newPixel = oldPixel < 128 ? 0 : 255;
            const quantError = oldPixel - newPixel;
            data[i + c] = newPixel;

            if (i + 4 < data.length) data[i + 4 + c] += quantError * 7 / 42;
            if (i + 8 < data.length) data[i + 8 + c] += quantError * 5 / 42;

            // Pixel right below
            if (i + 4 * width - 4 < data.length) data[i + 4 * width - 4 + c] += quantError * 3 / 42;
            if (i + 4 * width < data.length) data[i + 4 * width + c] += quantError * 5 / 42;
            if (i + 4 * width + 4 < data.length) data[i + 4 * width + 4 + c] += quantError * 7 / 42;
            if (i + 4 * width + 8 < data.length) data[i + 4 * width + 8 + c] += quantError * 5 / 42;

            // Two rows below
            if (i + 8 * width - 8 < data.length) data[i + 8 * width - 8 + c] += quantError * 1 / 42;
            if (i + 8 * width - 4 < data.length) data[i + 8 * width - 4 + c] += quantError * 3 / 42;
            if (i + 8 * width < data.length) data[i + 8 * width + c] += quantError * 5 / 42;
            if (i + 8 * width + 4 < data.length) data[i + 8 * width + 4 + c] += quantError * 3 / 42;
            if (i + 8 * width + 8 < data.length) data[i + 8 * width + 8 + c] += quantError * 1 / 42;
        }
    }
}

function applyAtkinsonDither(frame) {
    const data = frame.data;
    const width = frame.width;
    const height = frame.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let index = (y * width + x) * 4;

            for (let c = 0; c < 3; c++) {  // Repeat for R, G, B channels
                let oldPixel = data[index + c];
                let newPixel = oldPixel < 128 ? 0 : 255;
                data[index + c] = newPixel;

                let quantError = (oldPixel - newPixel) * 1/8;

                // Right Pixel
                if (x + 1 < width) data[index + 4 + c] += quantError;

                // Bottom Pixels
                if (y + 1 < height) {
                    if (x - 1 >= 0) data[index + (width - 1) * 4 + c] += quantError;  // Bottom-left
                    data[index + width * 4 + c] += quantError;  // Bottom
                    if (x + 1 < width) data[index + (width + 1) * 4 + c] += quantError;  // Bottom-right
                }

                // Two pixels to the right
                if (x + 2 < width) data[index + 8 + c] += quantError;

                // Two rows below
                if (y + 2 < height) data[index + 2 * width * 4 + c] += quantError;
            }
        }
    }
}

function applyEdgeDetectioen(frame) {
    applyConvolution(frame, 
        // [
        //     [-1, -1, -1],
        //     [-1, 8, -1],
        //     [-1, -1, -1]
        // ]

        [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0]
        ]
    )
}

function applyConvolution(frame, kernel) {
    const src = [...frame.data];
    const dst = frame.data;
    
    const srcWidth = frame.width;
    const srcHeight = frame.height;
    
    const side = Math.round(Math.sqrt(kernel.length));
    const halfSide = Math.floor(side / 2);
    
    // padding the output by the convolution kernel
    const w = srcWidth;
    const h = srcHeight;
    
    // iterating through the output image pixels
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0,
          g = 0,
          b = 0,
          a = 0;
          
        // calculating the weighed sum of the source image pixels that
        // fall under the convolution kernel
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - halfSide;
            const scx = x + cx - halfSide;
            
            if (scy >= 0 && scy < srcHeight && scx >= 0 && scx < srcWidth) {
              let srcOffset = (scy * srcWidth + scx) * 4;
              let wt = kernel[cy * side + cx];
              r += src[srcOffset] * wt;
              g += src[srcOffset + 1] * wt;
              b += src[srcOffset + 2] * wt;
              a += src[srcOffset + 3] * wt;
            }
          }
        }
        
        const dstOffset = (y * w + x) * 4;
        dst[dstOffset] = r;
        dst[dstOffset + 1] = g;
        dst[dstOffset + 2] = b;
        dst[dstOffset + 3] = a;
      }
    }
  }

const Dithering = {}
Dithering.applyAtkinsonDither = applyAtkinsonDither
Dithering.applyBlueNoiseDither = applyBlueNoiseDither
Dithering.applyFloydSteinbergFilter = applyFloydSteinbergFilter
Dithering.applyOrderedDither2x2 = applyOrderedDither2x2
Dithering.applyOrderedDither4x4 = applyOrderedDither4x4
Dithering.applyOrderedDither8x8 = applyOrderedDither8x8
Dithering.applyOrderedDither16x16 = applyOrderedDither16x16
Dithering.applyOrderedDitherColor = applyOrderedDitherColor
Dithering.applyRandomDither = applyRandomDither
Dithering.applySierraDither = applySierraDither
Dithering.applyStuckiDither = applyStuckiDither

window.Dithering = Dithering