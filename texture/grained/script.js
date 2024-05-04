// $(document).ready(function () {
   
//     demos();

// });

document.addEventListener('DOMContentLoaded', () => { demos()  })

function demos() {

    var options = {
        "animate": true,
        "patternWidth": 100,
        "patternHeight": 100,
        "grainOpacity": 0.61,
        "grainDensity": 1.99,
        "grainWidth": 2.39,
        "grainHeight": 2.49
    };
    grained("#tv", options);

    options = {
        "animate": true,
        "patternWidth": 100,
        "patternHeight": 100,
        "grainOpacity": 0.12,
        "grainDensity": 1.99,
        "grainWidth": 1.79,
        "grainHeight": 3.28
    };
    grained("#grass", options);
    options = {
        "animate": true,
        "patternWidth": 100,
        "patternHeight": 100,
        "grainOpacity": 0.18,
        "grainDensity": 2.49,
        "grainWidth": 2.69,
        "grainHeight": 2.19
    };
    grained("#wood", options);
    options = {
        "animate": true,
        "patternWidth": 100,
        "patternHeight": 100,
        "grainOpacity": 0.03,
        "grainDensity": 2.09,
        "grainWidth": 7.85,
        "grainHeight": 5.07
    };
    grained("#filim", options);

    options = {
        "animate": true,
        "patternWidth": 100,
        "patternHeight": 100,
        "grainOpacity": 0.34,
        "grainDensity": 6.95,
        "grainWidth": 2.69,
        "grainHeight": 6.36
    }
    grained("#rain", options);
    options = {
        "animate": true,
        "patternWidth": 100,
        "patternHeight": 100,
        "grainOpacity": 0.08,
        "grainDensity": 1.3,
        "grainWidth": 1.4,
        "grainHeight": 1.2
    }
    grained("#sky", options);
}
