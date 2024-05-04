class ColorSelector {
    constructor(targetElement, label, color) {
        const target = targetElement
        this.targetElement = (typeof targetElement === 'string') ? document.getElementById(targetElement) : targetElement
        if (!this.targetElement)
            throw new Error(`ColorSelector error: No valid element found for 'targetElement': ${target}`)
        this.label = label
        this.value = color
        this.init()
    }

    init() {
        this.targetElement.innerHTML = `
            <div class="selector-box">
                <div class="selector-label">${this.label}</div>
                <input type="color" value="${this.value}" id="color-selector">
            </div>
        `
    }

    addListener(callback) {
        const selector = this.targetElement.querySelector('#color-selector')
        selector.addEventListener("input", () => {
            this.value = selector.value
            callback(this.value)
        })
    }
}

export default ColorSelector