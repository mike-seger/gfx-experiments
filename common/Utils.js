
function setpixelated(context){
    context['imageSmoothingEnabled'] = false
    context['mozImageSmoothingEnabled'] = false
    context['oImageSmoothingEnabled'] = false
    context['webkitImageSmoothingEnabled'] = false
    context['msImageSmoothingEnabled'] = false
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function setClass(element, set, theClass) {
    if(set) {
        if(!element.classList.contains(theClass))
            element.classList.add(theClass);
    } else element.classList.remove(theClass);
}

function getCssColor(element, property) {
    const rgbColor = window.getComputedStyle( element ,null).getPropertyValue(property)
    const rgb = rgbColor.replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');
    return {r: rgb[0], g: rgb[1], b: rgb[2]}
}

function triggerChangeEvent(selector) {
    const event = new Event('change', {
        bubbles: true, // Set bubbles to true for the event to bubble up through the DOM
        cancelable: true // Set cancelable to true if you want it to be cancellable
    });
    selector.dispatchEvent(event);
}

function addPrevNextToSelects() {
    function addKeyNavigation(selectElement) {
        selectElement.addEventListener('keydown', function(event) {
            const key = event.key;
            let shouldTriggerChange = false; 

            switch (key) {
                case 'ArrowLeft':
                    // Move to the previous option if it's not the first one
                    if (this.selectedIndex > 0) {
                        this.selectedIndex--;
                        shouldTriggerChange = true;
                    }
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                    // Move to the next option if it's not the last one
                    if (this.selectedIndex < this.options.length - 1) {
                        this.selectedIndex++;
                        shouldTriggerChange = true;
                    }
                    event.preventDefault();
                    break;
            }

            if (shouldTriggerChange) {
                const event = new Event('change', { 'bubbles': true });
                this.dispatchEvent(event);
            }
        });
    }

    const selectElements = document.querySelectorAll('select')
    selectElements.forEach(addKeyNavigation)
}

window.addPrevNextToSelects = addPrevNextToSelects