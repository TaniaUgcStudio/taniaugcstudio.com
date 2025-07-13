document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    const form = event.target;
    const name = document.getElementById('name').value;
    
    // Hide page elements
    document.getElementById('page-title').style.display = 'none';
    document.getElementById('page-description').style.display = 'none';
    document.getElementById('contact-form').style.display = 'none';
    
    // Show thank-you message
    document.getElementById('user-name').textContent = name;
    document.getElementById('thank-you-message').style.display = 'block';
    
    // Create floating birthday icons
    const iconsContainer = document.getElementById('birthday-icons');
    iconsContainer.style.display = 'block';
    const icons = ['🎈', '🎉', '🎈', '🎉', '🎈'];
    icons.forEach((icon, index) => {
        const iconElement = document.createElement('span');
        iconElement.className = 'birthday-icon';
        iconElement.textContent = icon;
        iconElement.style.left = `${Math.random() * 100}vw`;
        iconElement.style.animationDelay = `${index * 0.5}s`;
        iconElement.style.setProperty('--direction', Math.random() > 0.5 ? 1 : -1);
        iconsContainer.appendChild(iconElement);
        // Remove icon after animation
        setTimeout(() => iconElement.remove(), 5000);
    });
    
    // Submit form to Formspree in the background
    fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            form.reset(); // Clear form
        } else {
            alert('Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
        }
    }).catch(error => {
        alert('Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
    });
});