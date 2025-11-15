/**
 * A robust and performant JavaScript FPS counter implementation as a standalone module.
 * It samples frames over a 1-second interval to provide a stable average FPS.
 */

function setupFPSCounter() {
    // Get the HTML element where the FPS will be displayed
    const fpsDisplay = document.getElementById('fpsDisplay');

    if (!fpsDisplay) {
        console.error('FPS display element not found!');
        return;
    }

    let frameCount = 0;
    let lastTime = performance.now();

    function updateDisplay() {
        const currentTime = performance.now();
        const timeElapsed = currentTime - lastTime;

        // Update the FPS display every 1000 milliseconds (1 second)
        if (timeElapsed >= 1000) {
            // Calculate FPS: frames counted / time elapsed in seconds
            const fps = Math.round((frameCount * 1000) / timeElapsed);
            fpsDisplay.textContent = `FPS: ${fps}`;

            // Reset the counter for the next interval
            frameCount = 0;
            lastTime = currentTime;
        }
    }

    // The independent loop for the FPS counter.
    function fpsLoop() {
        frameCount++; // Increment the frame count for the current frame
        updateDisplay(); // Check if it's time to update the DOM
        requestAnimationFrame(fpsLoop); // Request the next frame for the FPS counter
    }

    // Start the FPS counter loop
    requestAnimationFrame(fpsLoop);
}

// Ensure the DOM is fully loaded before trying to access the elements
document.addEventListener('DOMContentLoaded', (event) => {
    setupFPSCounter();
});
