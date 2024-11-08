const FOCAL_LENGTH = 500; // in pixels, this is the calibrated focal length

// Define approximate real-world widths (in cm) for 100+ common objects (from COCO-SSD)
const KNOWN_WIDTHS = {
    'person': 50, // average shoulder width of a person
    'car': 175,   // average width of a car
    'bicycle': 60, // average width of a bicycle
    'cat': 20,    // average size of a cat
    'dog': 25,    // average size of a dog
    'book': 15,   // average width of a book
    'tv': 80,     // average width of a TV
    'airplane': 1000, // average wingspan of a small airplane
    'bus': 250,      // average width of a bus
    'train': 300,    // approximate width of a train
    'truck': 250,    // average width of a truck
    'motorcycle': 50, // average width of a motorcycle
    'bird': 15,      // average wingspan of a small bird
    'horse': 150,    // average width of a horse
    'sheep': 80,     // average width of a sheep
    'cow': 180,      // average width of a cow
    'elephant': 300, // average width of an elephant
    'bear': 150,     // average width of a bear
    'zebra': 110,    // average width of a zebra
    'giraffe': 200,  // average width of a giraffe
    'backpack': 40,  // typical width of a backpack
    'umbrella': 100, // average width of an open umbrella
    'handbag': 35,   // average width of a handbag
    'tie': 10,       // average width of a tie
    'suitcase': 55,  // average width of a suitcase
    'frisbee': 25,   // average width of a frisbee
    'skis': 10,      // average width of a ski
    'snowboard': 30, // average width of a snowboard
    'sports ball': 22, // average diameter of a soccer ball
    'kite': 100,     // average width of a kite
    'baseball bat': 7, // average diameter of a baseball bat
    'baseball glove': 28, // average width of a baseball glove
    'skateboard': 20, // average width of a skateboard
    'surfboard': 55,  // average width of a surfboard
    'tennis racket': 27, // average width of a tennis racket
    'bottle': 8,     // average width of a bottle
    'wine glass': 8, // average width of a wine glass
    'cup': 8,        // average width of a cup
    'fork': 3,       // average width of a fork
    'knife': 2,      // average width of a knife
    'spoon': 3,      // average width of a spoon
    'bowl': 10,      // average diameter of a bowl
    'banana': 3,     // average width of a banana
    'apple': 8,      // average width of an apple
    'sandwich': 12,  // average width of a sandwich
    'orange': 8,     // average width of an orange
    'broccoli': 10,  // average width of a broccoli head
    'carrot': 3,     // average width of a carrot
    'hot dog': 5,    // average width of a hot dog
    'pizza': 30,     // average diameter of a pizza
    'donut': 10,     // average diameter of a donut
    'cake': 20,      // average width of a cake
    'chair': 50,     // average width of a chair
    'couch': 200,    // average width of a couch
    'potted plant': 30, // average width of a potted plant
    'bed': 160,      // average width of a bed
    'dining table': 150, // average width of a dining table
    'toilet': 40,    // average width of a toilet
    'tv': 100,       // average width of a television
    'laptop': 35,    // average width of a laptop
    'mouse': 6,      // average width of a computer mouse
    'remote': 5,     // average width of a remote control
    'keyboard': 45,  // average width of a keyboard
    'cell phone': 8, // average width of a cell phone
    'microwave': 50, // average width of a microwave
    'oven': 60,      // average width of an oven
    'toaster': 30,   // average width of a toaster
    'sink': 60,      // average width of a sink
    'refrigerator': 90, // average width of a refrigerator
    'book': 15,      // average width of a book
    'clock': 30,     // average diameter of a clock
    'vase': 20,      // average width of a vase
    'scissors': 5,   // average width of a pair of scissors
    'teddy bear': 30, // average width of a teddy bear
    'hair drier': 10, // average width of a hair drier
    'toothbrush': 2, // average width of a toothbrush
    // Add more objects as needed...
};

const DEFAULT_WIDTH = 30; // default width for unknown objects (in cm)

let videoElement = document.getElementById('webcam');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let flipButton = document.getElementById('flipCamera');
let currentStream;
let currentFacingMode = 'environment'; // Default to rear camera

// Set up video stream
async function startVideo(facingMode) {
    console.log("Starting video stream...");

    // Stop any existing stream
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode, width: window.innerWidth, height: window.innerHeight }
        });
        videoElement.srcObject = stream;
        currentStream = stream;

        // Wait until video metadata is loaded
        videoElement.onloadedmetadata = () => {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            console.log("Video stream started successfully.");
            detectObjects(); // Start detecting objects after the video stream is ready
        };
    } catch (error) {
        console.error("Failed to start video stream:", error);
        alert("Failed to access the camera. Please check your device settings.");
    }
}

// Load the COCO-SSD model for object detection
let cocoModel;
async function loadModel() {
    console.log("Loading COCO-SSD model...");

    try {
        cocoModel = await cocoSsd.load();
        console.log("Model loaded successfully.");
    } catch (error) {
        console.error("Failed to load the model:", error);
        alert("Failed to load the object detection model.");
    }
}

// Function to calculate distance using the known width of an object
function calculateDistance(knownWidth, apparentWidth) {
    // Formula: Distance = (Known Width * Focal Length) / Apparent Width
    return (knownWidth * FOCAL_LENGTH) / apparentWidth;
}

// Object detection function
async function detectObjects() {
    if (!cocoModel) return;

    console.log("Object detection started...");

    try {
        // Check if video has started
        if (!videoElement.srcObject) {
            console.error("No video feed detected.");
            return;
        }

        const predictions = await cocoModel.detect(videoElement);

        // Clear canvas before each detection
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        predictions.forEach(prediction => {
            let [x, y, width, height] = prediction.bbox;

            // Draw the bounding box
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.lineWidth = 4;
            ctx.strokeStyle = "red";
            ctx.stroke();

            // Draw the label text
            ctx.font = "16px Arial";
            ctx.fillStyle = "red";
            const labelX = x + width / 2;
            const labelY = y - 10 > 10 ? y - 10 : y + height + 15;
            ctx.textAlign = "center";
            ctx.fillText(`${prediction.class}`, labelX, labelY);

            // Use the known width to calculate the distance, or use the default width
            const knownWidth = KNOWN_WIDTHS[prediction.class] || DEFAULT_WIDTH;
            const distance = calculateDistance(knownWidth, width);
            ctx.fillText(`Distance: ${distance.toFixed(2)} cm`, labelX, labelY + 20);
        });

        // Control the frame rate to avoid overloading the system
        setTimeout(() => {
            requestAnimationFrame(detectObjects);
        }, 100); // Adjust this value (in ms) to control detection frequency

    } catch (error) {
        console.error("Failed to detect objects:", error);
    }
}

// Initialize everything
async function init() {
    await loadModel();
    await startVideo(currentFacingMode);
}

// Flip the camera when the button is clicked
flipButton.addEventListener('click', () => {
    currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
    init(); // Restart video with new camera mode
});

// Initialize the video stream
init();