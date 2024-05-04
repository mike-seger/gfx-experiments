function initSettingsDialog(settings) {
    const sceneContainer = document.getElementById('scene')
    const modal = document.getElementById('settingsModal')
    const settingsFrame = document.getElementById('settingsFrame')
    settingsFrame.src = 'settings.html'
    settingsFrame.onload = () => { 
        settingsFrame.contentWindow.postMessage(settings, '*') 
    }

    sceneContainer.addEventListener('click', function() {
        modal.style.display = "block"
    })

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none"
        }
    }
}
