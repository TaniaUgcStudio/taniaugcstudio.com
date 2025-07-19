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

//////////////////////////////////// Butterfly animation ////////////////////////////////////
/*const butterfly = document.querySelector('.butterfly');
const path = document.getElementById('plantPath');
const pathLength = path.getTotalLength();

function updateButterflyPosition() {
const scrollTop = window.scrollY;
const maxScroll = document.body.scrollHeight - window.innerHeight;
const scrollRatio = scrollTop / maxScroll / 2.9;
const pointAtLength = scrollRatio * pathLength;

const point = path.getPointAtLength(pointAtLength);
const pointNext = path.getPointAtLength(pointAtLength + 1);

butterfly.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px) rotate(0)`;
}

window.addEventListener('scroll', updateButterflyPosition);
window.addEventListener('load', updateButterflyPosition);*/

//////////////////////////////////// Profile Stars Animation ////////////////////////////////////
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

// Stop after 5 seconds
setTimeout(() => clearInterval(interval), 5000);

//////////////////////////////////// Profile Circles Animation ////////////////////////////////////
const circle = document.querySelector('.circle');
// Wait a few seconds, then switch to deceleration
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
}, 5000);

function animateStatsCounters() {
    const counters = document.querySelectorAll('.circle-count');
    
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const speed = 2;
        
        function updateCount() {
            const increment = Math.ceil(target / 80);
            count += increment;
            
            if (count < target) {
                counter.textContent = count;
                requestAnimationFrame(updateCount);
            } else {
                counter.textContent = target;
            }
        }
        
        updateCount();
    });
}

//////////////////////////////////// About Me Animation ////////////////////////////////////
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

//////////////////////////////////// Typewriter Animation Functions ////////////////////////////////////
function typeSentence(target, sentence, speed, callback) {
    let i = 0;
    target.textContent = ''; // Clean the text
    target.style.opacity = 1; // Ensure opacity is set during typing
    
    function type() {
        if (i < sentence.length) {
            target.textContent += sentence.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            target.classList.add('visible'); // Add visible class after typing
            if (callback) callback();
        }
    }
    
    target.style.minHeight = '1em';
    type();
}

function startIntroTypewriterEffect() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    const items = document.querySelectorAll('.teaser-list li span[data-text]');
    let index = 0;
    
    function typeNext() {
        if (index < items.length) {
            const text = items[index].getAttribute('data-text');
            typeSentence(items[index], text, 16, () => {
                index++;
                typeNext();
            });
        }
    }
    
    function triggerIntroSequence() {
        heroSection.classList.add('visible');
        
        // ✅ Start counter animation once
        animateStatsCounters();
        
        // ⏳ Then start typewriter effect after a short delay
        setTimeout(() => {
            typeNext();
        }, 1000); // You can adjust delay if needed
    }
    
    // Intersection Observer for scroll-triggered animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                triggerIntroSequence();
                observer.unobserve(heroSection);
            }
        });
    }, { threshold: 0.1 });
    
    // Initial check in case hero is already visible on load
    const rect = heroSection.getBoundingClientRect();
    const isVisible = (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
    
    if (isVisible) {
        triggerIntroSequence();
        observer.unobserve(heroSection);
    } else {
        observer.observe(heroSection);
    }
}

function startContentTypewriterEffect() {
    const contentSection = document.querySelector('.content-section');
    if (!contentSection) return; // Safeguard against null
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
                        const stamp = document.querySelector('.stamp');
                        if (stamp) stamp.classList.add('animate');
                    }
                }
                
                typeNext();
                observer.unobserve(contentSection);
            }
        });
    }, { threshold: 0.1 });
    observer.observe(contentSection);
}

//////////////////////////////////// Initialize Animations ////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.querySelector('.ugc-loader');
    const fill = document.querySelector('.ugc-fill');
    const percentText = document.querySelector('.ugc-percent');
    const body = document.body;
    
    const content = Array.from(body.children).filter(el => !el.classList.contains('ugc-loader'));
    content.forEach(el => el.style.display = 'none');
    
    let percent = 0;
    
    const interval = setInterval(() => {
        percent++;
        fill.style.height = `${percent}%`;
        percentText.textContent = `${percent}%`;
        
        if (percent >= 100) {
            clearInterval(interval);
            loader.style.opacity = 0;
            
            setTimeout(() => {
                loader.remove();                          // Remove loader
                content.forEach(el => el.style.display = ''); // Show all hidden content
                startIntroTypewriterEffect();             // Hero typewriter (immediate after loader)
            }, 800); // Allow fade out
        }
    }, 25); // 100 * 25ms = 2.5s
});

// ✅ Defer content-section typewriter setup until full page + assets are loaded
window.addEventListener('load', () => {
    startContentTypewriterEffect(); // Will wait for scroll intersection
});