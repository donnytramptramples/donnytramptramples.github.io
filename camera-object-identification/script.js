const FOCAL_LENGTH = 500; // pixels
const DEFAULT_WIDTH = 30; // cm
const KNOWN_WIDTHS = { /* same as before */ };

let videoElement = document.getElementById('webcam');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let flipButton = document.getElementById('flipCamera');
let toggleDistanceButton = document.getElementById('toggleDistance');
let progressBar = document.getElementById('progress');
let loadingContainer = document.getElementById('loadingContainer');
let fpsDisplay = document.getElementById('fps');

let currentStream;
let currentFacingMode = 'environment';
let cocoModel;
let showDistance = true;
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

// Show loading progress
function updateProgress(percent) {
    progressBar.style.width = percent + '%';
}

// Load COCO-SSD model
async function loadModel() {
    loadingContainer.style.display = 'block';
    updateProgress(10);

    try {
        cocoModel = await cocoSsd.load();
        updateProgress(100);
        setTimeout(() => loadingContainer.style.display = 'none', 500);
        console.log("Model loaded successfully.");
    } catch (error) {
        console.error("Failed to load the model:", error);
        alert("Failed to load the object detection model.");
    }
}

// Start video stream
async function startVideo(facingMode) {
    if (currentStream) currentStream.getTracks().forEach(track => track.stop());

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode, width: window.innerWidth, height: window.innerHeight }
        });
        videoElement.srcObject = stream;
        currentStream = stream;

        videoElement.onloadedmetadata = () => {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            detectObjects();
        };
    } catch (error) {
        console.error("Failed to start video stream:", error);
        alert("Failed to access the camera.");
    }
}

// Calculate distance using diagonal size for better accuracy
function calculateDistance(knownWidth, bboxWidth, bboxHeight) {
    const apparentSize = Math.sqrt(bboxWidth ** 2 + bboxHeight ** 2);
    return (knownWidth * FOCAL_LENGTH) / apparentSize;
}

// Detect objects
async function detectObjects() {
    if (!cocoModel) return;

    const predictions = await cocoModel.detect(videoElement);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction => {
        let [x, y, width, height] = prediction.bbox;

        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "red";
        ctx.stroke();

        ctx.font = "16px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        const labelX = x + width / 2;
        const labelY = y - 10 > 10 ? y - 10 : y + height + 15;

        ctx.fillText(`${prediction.class}`, labelX, labelY);

        if (showDistance) {
            const knownWidth = KNOWN_WIDTHS[prediction.class] || DEFAULT_WIDTH;
            const distance = calculateDistance(knownWidth, width, height);
            ctx.fillText(`Distance: ${distance.toFixed(2)} cm`, labelX, labelY + 20);
        }
    });

    // FPS calculation
    frameCount++;
    const now = performance.now();
    if (now - lastFrameTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFrameTime = now;
        fpsDisplay.textContent = `FPS: ${fps}`;
    }

    requestAnimationFrame(detectObjects);
}

// Initialize
async function init() {
    await loadModel();
    await startVideo(currentFacingMode);
}

// Event listeners
flipButton.addEventListener('click', () => {
    currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
    init();
});

toggleDistanceButton.addEventListener('click', () => {
    showDistance = !showDistance;
    toggleDistanceButton.textContent = showDistance ? "Hide Distance" : "Show Distance";
});

init();
