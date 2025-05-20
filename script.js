let isMusicPlaying = false;
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');

function toggleMusic() {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        bgMusic.play();
        musicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    isMusicPlaying = !isMusicPlaying;
}