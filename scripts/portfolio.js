/* ------------------ CONFIG ------------------ */
const IMG_URL = "../images/meVectorized.png"; // triangles texture
const ROWS = 8, COLS = 8;

const INTRO_BLACK_MS    = 200;  // background hold
const ASSEMBLE_DELAY    = 350;  // wait before shards begin flying in (after intro)
const JOIN_STAGGER_MS   = 10;   // per shard stagger
const SHOWCASE_PAUSE_MS = 500;  // hold the completed mosaic before the sweep/reveal
const SWEEP_MS          = 2200; // gold sweep duration (also used for vertical reveal)
const SWEEP_START_DEG   = -10;  // starting angle for the sweep

const NAME_STRING = "Tania López";
const ROLE_STRING = "Creadora UGC";  // spelled per your request

const hero      = document.getElementById('hero');
const titles    = document.getElementById('titles');
const nameText  = document.getElementById('nameText');
const roleText  = document.getElementById('roleText');
const stage     = document.getElementById('stage');
const tracedImg = document.getElementById('tracedImg');
const traceImg  = document.getElementById('traceImg');
const finalImg  = document.getElementById('finalImg');

const shards = [];
function polyStr(pts){ return pts.map(p => `${p[0]}% ${p[1]}%`).join(","); }

// ---------- Typewriter helpers (your JS mode) ----------
function typeSentence(target, sentence, speed, callback) {
    let i = 0;
    target.textContent = '';
    target.style.opacity = 1;
    
    // caret ON only during typing
    target.classList.add('type-caret');
    
    function type() {
        if (i < sentence.length) {
            target.textContent += sentence.charAt(i++);
            setTimeout(type, speed);
        } else {
            // caret OFF when done
            target.classList.remove('type-caret');
            target.classList.add('visible');
            if (callback) callback();
        }
    }
    
    target.style.minHeight = '1em';
    type();
}

function startNameRoleTyping(){
    // Name first, then Role; when Role done, show the frame
    typeSentence(nameText, NAME_STRING, 38, () => {
        nameText.classList.remove('type-caret'); // if you re-add caret
        typeSentence(roleText, ROLE_STRING, 34, () => {
            // All typing done -> draw animated frame + show scroll gif
            showHeroFrame();
        });
    });
}

// ---------- Shards prep ----------
const img = new Image();
img.src = IMG_URL;
img.onload = () => init(img);
img.onerror = () => { console.warn("Shard image failed; using colored shards fallback."); init(null); };

function init(image){
    buildShards();
    if(!image){
        const style = document.createElement('style');
        style.textContent = `.shard{background-image:none;background:#c0244b}.shard:nth-child(odd){background:#ff0062}`;
        document.head.appendChild(style);
    }
    
    // Fit portrait to stage for perfect shard background alignment
    const rect = stage.getBoundingClientRect();
    if(image){
        const fit = computeImageFit(image, rect.width|0, rect.height|0);
        applyBackgroundTransform(fit);
    }
    
    // Sequence
    setTimeout(()=>{
        scatterShards();
        requestAnimationFrame(()=> setTimeout(joinShards, ASSEMBLE_DELAY));
        const joinTotal = ROWS*COLS*2 * JOIN_STAGGER_MS;
        setTimeout(startSweepAndReveal, ASSEMBLE_DELAY + joinTotal + SHOWCASE_PAUSE_MS);
    }, INTRO_BLACK_MS);
}

function buildShards(){
    for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
            const x1=c/COLS*100, x2=(c+1)/COLS*100;
            const y1=r/ROWS*100, y2=(r+1)/ROWS*100;
            const t1=[[x1,y1],[x2,y1],[x1,y2]];
            const t2=[[x2,y1],[x2,y2],[x1,y2]];
            [t1,t2].forEach(tri=>{
                const el=document.createElement('div');
                el.className='shard ' + (Math.random()<.5?'colorA':'colorB');
                el.style.clipPath=`polygon(${polyStr(tri)})`;
                stage.appendChild(el); shards.push(el);
            });
        }
    }
}

function scatterShards(){
    const rect = stage.getBoundingClientRect();
    shards.forEach(el=>{
        const sx = (Math.random()>.5?-1:1)*(rect.width*(.6+Math.random()*0.8));
        const sy = (Math.random()>.5?-1:1)*(rect.height*(.6+Math.random()*0.8));
        el.style.transform=`translate(${sx}px,${sy}px) rotate(${(Math.random()*60-30).toFixed(1)}deg)`;
        el.style.opacity='0';
    });
}

function joinShards(){
    shards.forEach((el,i)=> setTimeout(()=>{
        el.style.transform='translate(0,0) rotate(0deg)';
        el.style.opacity='1';
    }, i*JOIN_STAGGER_MS));
}

// contain-fit helper
function computeImageFit(image, W, H){
    const iw=image.naturalWidth, ih=image.naturalHeight;
    const r=Math.min(W/iw, H/ih); const dw=Math.round(iw*r), dh=Math.round(ih*r);
    const dx=Math.round((W-dw)/2), dy=Math.round((H-dh)/2);
    return {dx,dy,dw,dh};
}
function applyBackgroundTransform(fit){
    shards.forEach(el=>{
        el.style.backgroundSize = `${fit.dw}px ${fit.dh}px`;
        el.style.backgroundPosition = `${fit.dx}px ${fit.dy}px`;
    });
}

// ---------- Sweep + Vertical reveal, then finalize layout + type ----------
function startSweepAndReveal(){
    // fade shards away
    shards.forEach(el=> el.style.opacity='0');
    setTimeout(()=> shards.forEach(el=> el.style.display='none'), 320);
    
    // show outline and sweep
    tracedImg.style.opacity = '1';
    traceImg.style.opacity  = '1';
    
    const duration = SWEEP_MS;
    let startTime = null;
    
    function frame(t){
        if(!startTime) startTime = t;
        const elapsed = t - startTime;
        const p = Math.min(elapsed / duration, 1);
        
        // gold sweep progress
        const angle = p * 360;
        const mask = `conic-gradient(from ${SWEEP_START_DEG}deg at 50% 50%, black 0deg ${angle}deg, transparent ${angle}deg 360deg)`;
        traceImg.style.maskImage = mask;
        traceImg.style.webkitMaskImage = mask;
        
        // final portrait vertical reveal (bottom -> top)
        const revealPct = (p*100).toFixed(2) + '%';
        finalImg.style.setProperty('--reveal', revealPct);
        
        if(p < 1){
            requestAnimationFrame(frame);
        }else{
            tracedImg.style.opacity = '0';
            traceImg.style.opacity  = '0';
            
            // Move to final layout (text + image)
            hero.classList.add('final-layout');
            
            // Start the typewriter (name first, then role)
            startNameRoleTyping();
        }
    }
    requestAnimationFrame(frame);
}

/* ======== FRAME: draw/animate rounded rectangle around .hero (with insets) ======== */
let frameLayer;  // absolute wrapper
let frameSvg, frameRect, frameBottom;

function createOrUpdateFrame() {
    const hero = document.getElementById('hero');
    const stage = document.getElementById('stage');
    const rect = hero.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    
    // --- responsive per-side padding (inside the hero) ---
    const isMobile = window.matchMedia('(max-width:710px)').matches;
    const padSides = isMobile ? 10 : 0;     // small side gap
    const padTop   = isMobile ? 0 : 0;      // space above the title
    const padBot   = isMobile ? 5 : 10;     // a bit larger at bottom
    
    // rounded corner radius
    const r = Math.max(12, Math.min(24, Math.floor(Math.min(w,h)*0.03)));
    
    if (!frameLayer) {
        frameLayer = document.createElement('div');
        frameLayer.className = 'frame-layer';
        document.body.appendChild(frameLayer);
        
        frameSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        frameSvg.classList.add('frame-svg');
        frameLayer.appendChild(frameSvg);
        
        frameRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
        frameRect.classList.add('frame-rect','frame-rect-glow');
        frameSvg.appendChild(frameRect);
        
        // optional: thicker bottom segment to visually fill the small free gap
        frameBottom = document.createElementNS('http://www.w3.org/2000/svg','path');
        frameBottom.classList.add('frame-bottom');
        frameSvg.appendChild(frameBottom);
        
        // scroll gif
        const scrollImg = document.createElement('img');
        scrollImg.className = 'scroll-indicator';
        scrollImg.id = 'scrollGif';
        scrollImg.alt = 'Scroll down';
        scrollImg.src = '../icons/scrollDown.gif';   // <-- put your gif here
        frameLayer.appendChild(scrollImg);
    }
    
    // position the layer over hero (no outside margin)
    frameLayer.style.top  = `${Math.round(rect.top  + window.scrollY)}px`;
    frameLayer.style.left = `${Math.round(rect.left + window.scrollX)}px`;
    frameLayer.style.width  = `${w}px`;
    frameLayer.style.height = `${h}px`;
    
    // set SVG size
    frameSvg.setAttribute('width',  w);
    frameSvg.setAttribute('height', h);
    
    // main rounded rectangle inset
    const x = padSides + 1.5;
    const y = padTop   + 1.5;
    const iw = Math.max(0, w - (padSides*2) - 3);
    const ih = Math.max(0, h - (padTop + padBot) - 3);
    frameRect.setAttribute('x', x);
    frameRect.setAttribute('y', y);
    frameRect.setAttribute('width',  iw);
    frameRect.setAttribute('height', ih);
    frameRect.setAttribute('rx', r);
    frameRect.setAttribute('ry', r);
    
    // thicker bottom stroke segment (draw just the bottom edge)
    const bx1 = x + r;
    const bx2 = x + iw - r;
    const by  = y + ih; // baseline of the rect
    // straight bottom line with rounded caps; slight inward offset so it sits inside the thin stroke
    frameBottom.setAttribute('d', `M ${bx1} ${by} L ${bx2} ${by}`);
    
    // keep the stage corners matching the frame for clean masking of the photo edges
    stage.style.setProperty('--stage-radius', `${r}px`);
    
    // place scroll gif just outside the inner rect, centered
    const scroll = document.getElementById('scrollGif');
    if (scroll) {
        // bring the gif just below the inner rect; half overlaps bottom padding visually
        scroll.style.bottom = `${padBot - 6}px`;
    }
}

function animateFrameStroke() {
    if (!frameRect) return;
    const length = frameRect.getTotalLength();
    frameRect.style.strokeDasharray  = `${length}`;
    frameRect.style.strokeDashoffset = `${length}`;
    frameRect.getBoundingClientRect(); // reflow
    frameRect.style.transition = 'stroke-dashoffset 1100ms ease-out';
    frameRect.style.strokeDashoffset = '0';
}

function showHeroFrame() {
    createOrUpdateFrame();
    animateFrameStroke();
}

/* keep frame aligned on resize/rotate (debounced) */
let frameResizeTimer;
window.addEventListener('resize', () => {
    if (!frameLayer) return;
    clearTimeout(frameResizeTimer);
    frameResizeTimer = setTimeout(() => {
        createOrUpdateFrame();
    }, 120);
});

/* block page */
function blockPage() {
    var pass = prompt("Introduce la contraseña:");
    if (pass !== "585858") {
        alert("Contraseña incorrecta. Acceso denegado.");
        window.location.href = "about:blank"; // kicks them out
    }
}