function showPopup(videoUrl) {
    const popup = document.getElementById('videoPopup');
    const iframe = document.getElementById('popupVideo');
    iframe.src = videoUrl;
    popup.style.display = 'flex';
}

function closePopup() {
    const popup = document.getElementById('videoPopup');
    const iframe = document.getElementById('popupVideo');
    iframe.src = '';
    popup.style.display = 'none';
}

// Random flips for vidoe frames
document.addEventListener("DOMContentLoaded", () => {
    const frames = Array.from(document.querySelectorAll('.video-frame'));
    
    // Shuffle the array
    for (let i = frames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [frames[i], frames[j]] = [frames[j], frames[i]];
    }
    
    // Apply the flip to a random 30% of the shuffled list
    const flipCount = Math.floor(frames.length * 0.3);
    for (let i = 0; i < flipCount; i++) {
        const frame = frames[i];
        frame.classList.add('flip');
        
        // Add random animation delay and duration
        frame.style.setProperty('--delay', `${Math.random() * 2}s`);
        frame.style.setProperty('--duration', `${2 + Math.random() * 2}s`);
    }
});