document.addEventListener('DOMContentLoaded', (event) => {
    // Select existing elements
    const videoInput = document.getElementById('imageInput');
    const processButton = document.getElementById('processButton');
    const processedCanvas = document.getElementById('processedCanvas');
    const downloadLink = document.getElementById('downloadLink');
    const outputWidthInput = document.getElementById('outputWidth');
    const outputHeightInput = document.getElementById('outputHeight');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const consoleOutput = document.getElementById('consoleOutput');

    // Select new player control elements
    const playPauseButton = document.getElementById('playPauseButton');
    const backButton = document.getElementById('backButton');
    const forwardButton = document.getElementById('forwardButton');
    const seekSlider = document.getElementById('seekSlider');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const fullScreenButton = document.getElementById('fullScreenButton');
    const muteButton = document.getElementById('muteButton'); 

    const processedCtx = processedCanvas.getContext('2d'); 

    let originalVideo = null; 
    let originalFileName = '';
    let originalAspectRatio = 1;
    let destWidth, sourceVirtualHeight, physicalCanvasWidth, physicalCanvasHeight;
    let mediaRecorder;
    let recordedChunks = [];
    let videoDuration = 0;
    let audioContext, audioSource, audioDestination;
    let isRecording = false; 
    let animationFrameId; 

    const R_Factor = 1.35; 
    const G_Factor = 0.85; 
    const B_Factor = 1.35; 

    function logToConsole(message) {
        const p = document.createElement('p');
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        consoleOutput.appendChild(p);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    videoInput.addEventListener('change', function(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        // *** THE FIX IS HERE ***
        // Access the first file in the list using index 0
        const file = event.target.files[0]; 

        if (!file || !file.name) {
             logToConsole("Error: Could not access file details.");
             return;
        }

        const fullFileName = file.name;
        const lastDotIndex = fullFileName.lastIndexOf('.');
        originalFileName = (lastDotIndex !== -1) ? fullFileName.substring(0, lastDotIndex) : fullFileName;
        logToConsole(`File selected: ${fullFileName}`);

        const videoURL = URL.createObjectURL(file);
        originalVideo = document.createElement('video'); 
        originalVideo.src = videoURL;
        originalVideo.muted = true; 
        originalVideo.crossOrigin = "anonymous"; 
        originalVideo.loop = true; 

        originalVideo.addEventListener('loadedmetadata', function() {
            originalAspectRatio = originalVideo.videoWidth / originalVideo.videoHeight;
            videoDuration = originalVideo.duration;
            logToConsole(`Video dimensions: ${originalVideo.videoWidth}x${originalVideo.videoHeight} (Duration: ${formatTime(videoDuration)})`);

            outputWidthInput.disabled = false;
            processButton.disabled = false;
            downloadLink.style.display = 'none';

            playPauseButton.disabled = false;
            backButton.disabled = false;
            forwardButton.disabled = false;
            seekSlider.disabled = false;
            fullScreenButton.disabled = false;
            muteButton.disabled = false;

            if (outputWidthInput.value === '' || outputWidthInput.value === '0') {
                outputWidthInput.value = 200; 
            }
            calculateHeight();
            seekSlider.max = videoDuration;
            currentTimeDisplay.textContent = formatTime(0) + ' / ' + formatTime(videoDuration);
            
            // Initialize Audio Context only once after metadata loads
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioSource = audioContext.createMediaElementSource(originalVideo);
                audioDestination = audioContext.createMediaStreamDestination();
                audioSource.connect(audioDestination);
                audioSource.connect(audioContext.destination); // Connect to speakers
            }

            originalVideo.play();
            if (animationFrameId) cancelAnimationFrame(animationFrameId); 
            animationFrameId = requestAnimationFrame(updateCanvasLivePlaybackWithFilter);
        });

        originalVideo.addEventListener('timeupdate', () => {
            if (!isRecording) { 
                seekSlider.value = originalVideo.currentTime;
                currentTimeDisplay.textContent = formatTime(originalVideo.currentTime) + ' / ' + formatTime(videoDuration);
            }
        });
        
        originalVideo.addEventListener('ended', () => {
            playPauseButton.textContent = '▶ Play';
        });
    });

    // --- Custom Player Controls Handlers (interact with UI buttons/slider) ---

    playPauseButton.addEventListener('click', () => {
        if (!originalVideo) return;
        if (originalVideo.paused || originalVideo.ended) {
            if (!isRecording && originalVideo.loop === false) { 
                originalVideo.currentTime = 0;
                originalVideo.loop = true;
            }
            originalVideo.play();
            playPauseButton.textContent = '⏸ Pause';
        } else {
            originalVideo.pause();
            playPauseButton.textContent = '▶ Play';
        }
    });

    backButton.addEventListener('click', () => {
        if (originalVideo) originalVideo.currentTime = Math.max(0, originalVideo.currentTime - 5);
    });

    forwardButton.addEventListener('click', () => {
        if (originalVideo) originalVideo.currentTime = Math.min(videoDuration, originalVideo.currentTime + 5);
    });

    seekSlider.addEventListener('input', () => {
        if (originalVideo) originalVideo.currentTime = seekSlider.value;
    });
    
    muteButton.addEventListener('click', () => {
        if (!originalVideo) return;
        if (originalVideo.muted) {
            originalVideo.muted = false;
            muteButton.textContent = '🔇 Mute';
        } else {
            originalVideo.muted = true;
            muteButton.textContent = '🔊 Unmute';
        }
    });

    fullScreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            if (processedCanvas.requestFullscreen) {
                processedCanvas.requestFullscreen();
            } else if (processedCanvas.webkitRequestFullscreen) {
                processedCanvas.webkitRequestFullscreen();
            } else if (processedCanvas.msRequestFullscreen) {
                processedCanvas.msRequestFullscreen();
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
    });

    outputWidthInput.addEventListener('input', calculateHeight);

    function calculateHeight() {
        if (!originalVideo) return;
        const desiredWidth = parseInt(outputWidthInput.value, 10);
        if (!isNaN(desiredWidth) && desiredWidth > 0 && originalVideo) {
            const calculatedHeight = Math.floor(desiredWidth / originalAspectRatio);
            outputHeightInput.value = calculatedHeight;
        } else {
            outputHeightInput.value = 0;
        }
    }

    processButton.addEventListener('click', startRecording);

    async function startRecording() {
        if (!originalVideo || isRecording) return;
        
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        originalVideo.pause(); 
        playPauseButton.textContent = '▶ Play';

        destWidth = parseInt(outputWidthInput.value, 10);
        sourceVirtualHeight = parseInt(outputHeightInput.value, 10); 

        if (isNaN(destWidth) || isNaN(sourceVirtualHeight) || destWidth <= 0 || sourceVirtualHeight <= 0) {
            alert("Please enter valid dimensions.");
            return;
        }
        
        physicalCanvasWidth = destWidth * 2; 
        physicalCanvasHeight = sourceVirtualHeight * 2; 
        processedCanvas.width = physicalCanvasWidth;
        processedCanvas.height = physicalCanvasHeight;
        processedCanvas.style.width = `${physicalCanvasWidth / 2}px`; 
        processedCanvas.style.height = `${physicalCanvasHeight / 2}px`;
        
        logToConsole(`Starting video recording...`);
        processButton.disabled = true;
        downloadLink.style.display = 'none';
        progressBar.style.width = '0%';
        progressText.textContent = '0% Starting...';
        recordedChunks = [];
        isRecording = true;

        try {
            await setupMediaRecorder();
        } catch (error) {
            logToConsole(`Error setting up media streams: ${error.message}`);
            processButton.disabled = false;
            isRecording = false;
            originalVideo.muted = true;
            originalVideo.play();
            animationFrameId = requestAnimationFrame(updateCanvasLivePlaybackWithFilter);
            return;
        }

        originalVideo.currentTime = 0;
        originalVideo.muted = true; 
        originalVideo.loop = false; 
        originalVideo.play().then(() => {
            animationFrameId = requestAnimationFrame(drawFrameForRecording); 
        });
    }

    async function setupMediaRecorder() {
        const canvasStream = processedCanvas.captureStream();
        const videoTrack = canvasStream.getVideoTracks();
        
        const audioTrack = audioDestination.stream.getAudioTracks();

        const mixedStream = new MediaStream([videoTrack, audioTrack]);

        const videoBitrate = 50 * 1024 * 1024; 
        let options = { 
            mimeType: 'video/webm; codecs=vp9,opus', 
            videoBitsPerSecond: videoBitrate,
            audioBitsPerSecond: 192000
        };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) options.mimeType = 'video/webm; codecs=vp8,opus'; 
        
        mediaRecorder = new MediaRecorder(mixedStream, options);

        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = function() {
            logToConsole("MediaRecorder stopped. Finalizing video file...");
            isRecording = false;
            const blob = new Blob(recordedChunks, { type: options.mimeType });
            const url = URL.createObjectURL(blob);
            
            downloadLink.href = url;
            downloadLink.download = `${originalFileName}_processed.webm`;
            downloadLink.style.display = 'block';
            downloadLink.textContent = `Download Processed Video (${(blob.size / (1024*1024)).toFixed(2)} MB)`;
            processButton.disabled = false;
            progressBar.style.width = '100%';
            progressText.textContent = '100% Completed!';
            
            originalVideo.muted = true; 
            muteButton.textContent = '🔇 Mute';
            originalVideo.loop = true;
            originalVideo.currentTime = 0;
            originalVideo.play();
            animationFrameId = requestAnimationFrame(updateCanvasLivePlaybackWithFilter);
        };
        
        mediaRecorder.start();
    }

    function drawFrameForRecording() {
        if (originalVideo.paused || originalVideo.ended) {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
            return; 
        }
        processCurrentFramePixels();
        const progress = (originalVideo.currentTime / videoDuration) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress.toFixed(1)}% Processing frames...`;

        if (isRecording) animationFrameId = requestAnimationFrame(drawFrameForRecording);
    }

    function updateCanvasLivePlaybackWithFilter() {
        if (isRecording || !originalVideo) return;
        if (physicalCanvasWidth && physicalCanvasHeight) processCurrentFramePixels();
        animationFrameId = requestAnimationFrame(updateCanvasLivePlaybackWithFilter);
    }

    function processCurrentFramePixels() {
        processedCtx.drawImage(originalVideo, 0, 0, destWidth, sourceVirtualHeight);
        const sourceImageData = processedCtx.getImageData(0, 0, destWidth, sourceVirtualHeight);
        const sourcePixels = sourceImageData.data;
        const destImageData = processedCtx.createImageData(physicalCanvasWidth, physicalCanvasHeight);
        const destPixels = destImageData.data;
        const sourceStride = destWidth * 4;
        const destStride = physicalCanvasWidth * 4;

        for (let y = 0; y < sourceVirtualHeight; y++) {
            const sourceRowBase = y * sourceStride;
            const destRowBaseA = (y * 2) * destStride; 
            const destRowBaseC = destRowBaseA + destStride; 
            if (y % 2 === 0) {
                for (let x = 0; x < destWidth; x++) {
                    const sourceIndex = sourceRowBase + x * 4;
                    const r = (Math.min(255, sourcePixels[sourceIndex] * R_Factor)) | 0;
                    const g = (Math.min(255, sourcePixels[sourceIndex + 1] * G_Factor)) | 0;
                    const a = sourcePixels[sourceIndex + 3];
                    const destXBase = x * 8; 
                    destPixels[destRowBaseA + destXBase]     = r; destPixels[destRowBaseA + destXBase + 3] = a;
                    destPixels[destRowBaseA + destXBase + 5] = g; destPixels[destRowBaseA + destXBase + 7] = a;
                    destPixels[destRowBaseC + destXBase]     = r; destPixels[destRowBaseC + destXBase + 3] = a; 
                    destPixels[destRowBaseC + destXBase + 5] = g; destPixels[destRowBaseC + destXBase + 7] = a;
                }
            } else { 
                for (let x = 0; x < destWidth; x++) {
                    const sourceIndex = sourceRowBase + x * 4;
                    const g = (Math.min(255, sourcePixels[sourceIndex + 1] * G_Factor)) | 0;
                    const b = (Math.min(255, sourcePixels[sourceIndex + 2] * B_Factor)) | 0;
                    const a = sourcePixels[sourceIndex + 3];
                    const destXBase = x * 8;
                    destPixels[destRowBaseA + destXBase + 1] = g; destPixels[destRowBaseA + destXBase + 3] = a;
                    destPixels[destRowBaseA + destXBase + 6] = b; destPixels[destRowBaseA + destXBase + 7] = a;
                    destPixels[destRowBaseC + destXBase + 1] = g; destPixels[destRowBaseC + destXBase + 3] = a;
                    destPixels[destRowBaseC + destXBase + 6] = b; destPixels[destRowBaseC + destXBase + 7] = a;
    
	}
            }
        }
        processedCtx.putImageData(destImageData, 0, 0);
    }
});
