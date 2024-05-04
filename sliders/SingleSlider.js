class SingleSlider {
    constructor(targetElement, label, width, minValue, maxValue, value0=maxValue) {
        const target = targetElement
        this.targetElement = (typeof targetElement === 'string') ? document.getElementById(targetElement) : targetElement
        if (!this.targetElement)
            throw new Error(`MinMaxSlider error: No valid element found for 'targetElement': ${target}`)

        this.width = width
        this.label = label
        this.minValue = minValue
        this.maxValue = maxValue
        this.singleSlider = null
        this.valueText = null
        this.value = value0

        this.init()
    }

    init() {
        this.targetElement.innerHTML = `
            <div class="slider-combo" style="width: ${this.width}px;">
                <div class="slider-label">${this.label}</div>
                <div>
                    <div class="value-display">
                        <div id="value"></div>
                    </div>
                    <div class="range-input">
                        <input id="singleSlider" type="range" class="single-slider" min="${this.minValue}" max="${this.maxValue}" style="width: ${this.width}px;" step="1">
                    </div>
                </div>
            </div>
        `

        this.singleSlider = this.targetElement.querySelector('#singleSlider')
        this.singleSlider.value = this.value
        this.valueText = this.targetElement.querySelector('#value')

        this.updateSliderDimensions()

        this.singleSlider.addEventListener("input", () => this.updateSliderDimensions());
    }

    updateSlider() {
        this.updateSliderDimensions();
    }

    updateSliderDimensions() {
        const leftPercent = (this.singleSlider.value / this.singleSlider.max) * 100
        this.valueText.innerText = this.singleSlider.value
        this.valueText.style.right = `${100 - leftPercent}%`
    }

    addListener(callback) {
        this.singleSlider.addEventListener("input", () => {
            this.value = this.singleSlider.value
            callback(this.singleSlider.value)
        })
    }
}

export default SingleSlider