class MinMaxSlider {
    constructor(targetElement, label, width, minValue, maxValue, minValue0=minValue, maxValue0=maxValue) {
        const target = targetElement
        this.targetElement = (typeof targetElement === 'string') ? document.getElementById(targetElement) : targetElement
        if (!this.targetElement) {
            throw new Error(`MinMaxSlider error: No valid element found for 'targetElement': ${target}`)
        }

        this.width = width
        this.label = label
        this.minValue = minValue
        this.maxValue = maxValue
        this.curMinValue = minValue0
        this.curMaxValue = maxValue0
        this.minSlider = null
        this.maxSlider = null
        this.valueSlider = null
        this.minValueText = null
        this.maxValueText = null

        this.init()
    }

    init() {
        this.targetElement.innerHTML = `
            <div class="slider-combo" style="width: ${this.width}px;">
                <div class="slider-label">${this.label}</div>
                <div>
                    <div class="value-display min-max">
                        <div id="minValue"></div>
                        <div id="maxValue"></div>
                    </div>
                    <div class="slider-container">
                        <div id="valueSlider" class="slider"></div>
                    </div>
                    <div class="range-input min-max">
                        <input id="minSlider" type="range" class="min-range" min="0" max="${this.maxValue - this.minValue}" step="1">
                        <input id="maxSlider" type="range" class="max-range" min="0" max="${this.maxValue - this.minValue}" step="1">
                    </div>
                </div>
            </div>
        `

        this.minSlider = this.targetElement.querySelector('#minSlider')
        this.maxSlider = this.targetElement.querySelector('#maxSlider')
        this.valueSlider = this.targetElement.querySelector('#valueSlider')
        this.minValueText = this.targetElement.querySelector('#minValue')
        this.maxValueText = this.targetElement.querySelector('#maxValue')

        this.minSlider.value = this.curMinValue - this.minValue
        this.maxSlider.value = this.curMaxValue - this.minValue

        this.updateSliderDimensions()

        this.minSlider.addEventListener("input", () => this.updateSlider())
        this.maxSlider.addEventListener("input", () => this.updateSlider())
    }

    updateSlider() {
        const mm = this.minMax()
        if (mm.min >= mm.max) this.minSlider.value = mm.max - 1
        if (mm.max <= mm.min) this.maxSlider.value = mm.min + 1
        this.updateSliderDimensions()
    }

    updateSliderDimensions() {
        const mm = this.minMax()
        const leftPercent = (mm.min / this.minSlider.max) * 100
        const rightPercent = 100 - (mm.max / this.maxSlider.max) * 100
        this.valueSlider.style.left = `${leftPercent}%`
        this.valueSlider.style.right = `${rightPercent}%`
        this.curMinValue = mm.min + this.minValue
        this.curMaxValue = mm.max + this.minValue
        this.minValueText.innerText = this.curMinValue
        this.maxValueText.innerText = this.curMaxValue
        this.minValueText.style.right = `${100 - leftPercent}%`
        this.maxValueText.style.left = `${100 - rightPercent}%`
    }

    minMax() {
        return { min: parseInt(this.minSlider.value), max: parseInt(this.maxSlider.value) }
    }

    addListener(callback) {
        this.minSlider.addEventListener("input", () => callback(this.minSlider.value + this.minValue, this.maxSlider.value + this.minValue))
        this.maxSlider.addEventListener("input", () => callback(this.minSlider.value + this.minValue, this.maxSlider.value + this.minValue))
    }
}

export default MinMaxSlider