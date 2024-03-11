const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById('audioSource');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const volumeSlider = document.getElementById('volumeSlider');
const progressBarFill = document.getElementById('progressBarFill');
const timeDisplay = document.getElementById('time');

let isPlaying = false;
let isDragging = false;

function playSong(songUrl) {
  audioSource.src = songUrl;
  audioPlayer.load();
  audioPlayer.play();
  isPlaying = true;
  playButton.style.display = 'none';
  pauseButton.style.display = 'inline-block';
}

function togglePlayPause() {
  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
    playButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
  } else {
    audioPlayer.play();
    isPlaying = true;
    playButton.style.display = 'none';
    pauseButton.style.display = 'inline-block';
  }
}

function changeVolume(volume) {
  audioPlayer.volume = volume;
}

audioPlayer.addEventListener('timeupdate', updateProgressBar);
progressBarFill.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', handleDrag);
window.addEventListener('mouseup', endDrag);

function updateProgressBar() {
  const currentTime = audioPlayer.currentTime;
  const duration = audioPlayer.duration;
  const progress = (currentTime / duration) * 100;
  progressBarFill.style.width = `${progress}%`;
  timeDisplay.textContent = formatTime(currentTime) + ' / ' + formatTime(duration);
}

function startDrag(e) {
  isDragging = true;
  handleDrag(e);
}

function handleDrag(e) {
  if (!isDragging) return;
  const progressBarWidth = progressBarFill.offsetWidth;
  const newProgress = (e.clientX - progressBarFill.offsetLeft) / progressBarWidth;
  const duration = audioPlayer.duration;
  audioPlayer.currentTime = duration * newProgress;
}

function endDrag() {
  isDragging = false;
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${padTime(minutes)}:${padTime(seconds)}`;
}

function padTime(time) {
  return time.toString().padStart(2, '0');
}
