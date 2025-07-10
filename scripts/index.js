// Global JS
function updateVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
updateVH();
window.addEventListener('resize', updateVH);

// UGC Loader
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

// Butterfly animation
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

// About me animation
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

// TYpe writer animation
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