class Selector {
    constructor(targetElement, label, options) {
        const target = targetElement
        this.targetElement = (typeof targetElement === 'string') ? document.getElementById(targetElement) : targetElement
        if (!this.targetElement)
            throw new Error(`Selector error: No valid element found for 'targetElement': ${target}`)
        this.label = label
        this.options = options
        this.value = options[0]
        this.init()
    }

    init() {
        this.targetElement.innerHTML = `
            <div class="selector-box">
                <div class="selector-label">${this.label}</div>
                <select id="selector"></select>
            </div>
        `

        this.selector = this.targetElement.querySelector('#selector')
        const selector = this.selector
        this.options.forEach(opt => {
            var option = document.createElement("option");
            option.text = opt;
            selector.add(option) 
        })
    }

    addListener(callback) {
        this.selector.addEventListener("input", () => {
            this.value = this.selector.value
            callback(this.selector.value)
        })
    }
}

export default Selector