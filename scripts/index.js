//////////////////////////////////// Global HEIGHT 100% ////////////////////////////////////
function updateVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
updateVH();
window.addEventListener('resize', updateVH);

//////////////////////////////////// UGC Loader ////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.querySelector('.ugc-loader');
    const fill = document.querySelector('.ugc-fill');
    const percentText = document.querySelector('.ugc-percent');
    const body = document.querySelector('body');
    
    // Oculta el resto de la página mientras carga
    const content = Array.from(body.children).filter(el => !el.classList.contains('ugc-loader'));
    content.forEach(el => el.style.display = 'none');
    
    let percent = 0;
    
    const interval = setInterval(() => {
        percent++;
        fill.style.height = percent + '%';
        percentText.textContent = percent + '%';
        
        if (percent >= 100) {
            clearInterval(interval);
            loader.style.opacity = 0;
            
            setTimeout(() => {
                loader.remove(); // ✅ esto quita el div del DOM
                content.forEach(el => el.style.display = ''); // muestra el resto
            }, 800);
            
        }
    }, 25); // 100 * 25ms = 2.5s total
});

//////////////////////////////////// Stars Animation ////////////////////////////////////
function createStar() {
    const circleImg = document.querySelector('.circle-img');
    const rect = circleImg.getBoundingClientRect();

    const star = document.createElement('div');
    star.classList.add('star');
    
    // Calculate center of the image
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    star.style.left = `${centerX}px`;
    star.style.top = `${centerY}px`;
    
    // Random direction
    const angle = Math.random() * 2 * Math.PI;
    const distance = 150 + Math.random() * 100;
    const x = Math.cos(angle) * distance + 'px';
    const y = Math.sin(angle) * distance + 'px';
    
    star.style.setProperty('--x', x);
    star.style.setProperty('--y', y);
    star.style.zIndex = '98';
    
    document.body.appendChild(star);
    
    // Cleanup
    setTimeout(() => {
        star.remove();
    }, 2000);
}

// Emit a star every 150ms
const interval = setInterval(createStar, 150);

// Stop after 10 seconds
setTimeout(() => clearInterval(interval), 10000);

//////////////////////////////////// Circle Animation ////////////////////////////////////
const circle = document.querySelector('.circle');
// Wait 10 seconds, then switch to deceleration
setTimeout(() => {
    // Freeze current angle
    const computedStyle = window.getComputedStyle(circle);
    const matrix = new DOMMatrixReadOnly(computedStyle.transform);
    const currentAngle = Math.round(Math.atan2(matrix.b, matrix.a) * (180 / Math.PI));
    
    // Remove fast spin
    circle.style.animation = 'none';
    circle.style.transform = `rotate(${currentAngle}deg)`; // Keep current angle
    
    // Trigger decelerating spin
    requestAnimationFrame(() => {
        circle.classList.add('decelerate');
    });
}, 10000);

//////////////////////////////////// Butterfly animation ////////////////////////////////////
const butterfly = document.querySelector('.butterfly');
const path = document.getElementById('plantPath');
const pathLength = path.getTotalLength();

function updateButterflyPosition() {
    const scrollTop = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollRatio = scrollTop / maxScroll / 3;
    const pointAtLength = scrollRatio * pathLength;
    
    const point = path.getPointAtLength(pointAtLength);
    const pointNext = path.getPointAtLength(pointAtLength + 1);
    
    butterfly.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px) rotate(0)`;
}

window.addEventListener('scroll', updateButterflyPosition);
window.addEventListener('load', updateButterflyPosition);

//////////////////////////////////// About me animation ////////////////////////////////////
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animate-visible');
        } else {
            entry.target.classList.remove('scroll-animate-visible');
        }
    });
}, {
    threshold: 0.3
});

document.querySelectorAll('.scroll-animate-up, .scroll-animate-right').forEach(el => {
    observer.observe(el);
});

//////////////////////////////////// TYpe writer animation ////////////////////////////////////
function typeSentence(target, sentence, speed, callback) {
    let i = 0;
    target.textContent = ''; // Limpia el texto
    target.style.opacity = 1;
    
    function type() {
        if (i < sentence.length) {
            target.textContent += sentence.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    
    // Asegura altura desde el principio
    target.style.minHeight = '1em';
    type();
}

// Initialize typewriter effect for content items
function startTypewriterEffect() {
    const contentSection = document.querySelector('.content-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                contentSection.classList.add('visible');
                const items = document.querySelectorAll('.content-item ul li span');
                let index = 0;
                
                function typeNext() {
                    if (index < items.length) {
                        const text = items[index].textContent;
                        typeSentence(items[index], text, 16, () => {
                            index++;
                            typeNext();
                        });
                    } else {
                        // Activate the stamp animation
                        const stamp = document.querySelector('.stamp');
                        stamp.classList.add('animate');
                    }
                }
                
                typeNext();
                observer.unobserve(contentSection);
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(contentSection);
}

// Start the animation when the DOM reaches here
document.addEventListener("DOMContentLoaded", () => {
    const contentSection = document.querySelector('.content-section');
    
    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startTypewriterEffect();
                observerInstance.unobserve(contentSection); // Solo se ejecuta una vez
            }
        });
    }, {
        threshold: 0.2
    });
    
    observer.observe(contentSection);
});