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