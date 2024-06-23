// Functie om de pagina fullscreen te zetten
function toggleFullscreen() {
    if (!document.fullscreenElement &&    // W3C
        !document.webkitFullscreenElement && // Chrome, Safari and Opera
        !document.msFullscreenElement) {  // IE11
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Event listener voor de fullscreen knop
const fullscreenButton = document.getElementById('fullscreen-button');

fullscreenButton.addEventListener('click', () => {
    toggleFullscreen();
});