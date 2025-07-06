const mainToggle = document.querySelector('.menu-toggle');
const mainSidebar = document.querySelector('.sidebar');

// Toggle sidebar open/close
mainToggle.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent body click from firing
    mainSidebar.classList.toggle('active');
    mainToggle.classList.toggle('active');
});

// Click outside to close sidebar
document.addEventListener('click', (event) => {
    const isClickInsideSidebar = mainSidebar.contains(event.target);
    const isClickOnToggle = mainToggle.contains(event.target);
    
    if (!isClickInsideSidebar && !isClickOnToggle && mainSidebar.classList.contains('active')) {
        mainSidebar.classList.remove('active');
        mainToggle.classList.remove('active');
    }
});