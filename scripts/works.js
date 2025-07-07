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

// Function to apply random flips to video frames
function applyRandomFlips() {
    const videoFrames = document.querySelectorAll('.video-frame');
    videoFrames.forEach(frame => {
        // Remove existing flip classes and reset animation
        frame.classList.remove('flip-horizontal', 'flip-vertical');
        frame.style.animationDuration = ''; // Reset animation duration

        // 30% chance to flip, as in your previous code
        if (Math.random() < 0.3) {
            // Randomly choose horizontal or vertical flip
            const isHorizontal = Math.random() > 0.5;
            frame.classList.add(isHorizontal ? 'flip-horizontal' : 'flip-vertical');
            // Set random animation duration between 3s and 5s for a slower, pronounced effect
            frame.style.animationDuration = `${Math.random() * 2 + 3}s`;
        }
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', applyRandomFlips);

// Reapply flips every 5 seconds to keep the effect dynamic
setInterval(applyRandomFlips, 100);