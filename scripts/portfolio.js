// ------------------ CONFIG ------------------
const IMG_URL = "../images/meVectorized.png"; // triangles texture for first section
const ABOUT_IMG_URL = "../images/aboutmeVectorized.png"; // triangles texture for about section
const ROWS = 8, COLS = 8;

const INTRO_BLACK_MS  = 200;
const ASSEMBLE_DELAY  = 350;
const JOIN_STAGGER_MS = 10;
const SHOWCASE_PAUSE_MS = 1000;
const SWEEP_MS     = 2200;
const SWEEP_START_DEG = -10;

const NAME_STRING = "Tania López";
const ROLE_STRING = "Creadora UGC";

const hero   = document.getElementById('hero');
const titles  = document.getElementById('titles');
const nameText = document.getElementById('nameText');
const roleText = document.getElementById('roleText');
const stage  = document.getElementById('stage');
const tracedImg = document.getElementById('tracedImg');
const traceImg = document.getElementById('traceImg');
const finalImg = document.getElementById('finalImg');

const heroAbout   = document.getElementById('heroAbout');
// 🔑 FIX: Ensure these IDs match your HTML for the second stage
const stageAbout  = document.getElementById('stageAbout');
const tracedImgAbout = document.getElementById('tracedImgAbout'); 
const traceImgAbout = document.getElementById('traceImgAbout');
const finalImgAbout = document.getElementById('finalImgAbout');

const shards = [];
const aboutShards = [];

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

function startAboutTyping() {
  const title = "Sobre mí";
  const paragraph = `Soy Tania, creadora de contenido UGC con pasión por comunicar y conectar con las personas a través de vídeos reales y naturales.
 
Trabajo con marcas que buscan destacar en redes sociales, aumentar su visibilidad y generar ventas con contenido que marca la diferencia.
 
Me implico en cada proyecto desde el primer momento, cuidando los detalles y creando con intención: para emocionar, conectar y convertir.
 
Me encantará ayudarte a contar tu historia.
¡Acompáñame en esta aventura creativa!`;
 
  // swap styles for "about"
  titlesAbout.classList.add('about');
  heroAbout.classList.add('about-layout');
 
  // type the headline, then fade/slide the paragraph
  typeSentence(aboutName, title, 34, () => {
    aboutRole.textContent = paragraph;
    aboutRole.classList.add('visible');
  });
}

// ---------- Shards prep ----------
// ---------- Shards prep ----------
function buildShards(stageEl, shardsArr, imgUrl) {
    // 1. Clear previous DYNAMIC shards only
    // This is safe because the overlay images are *permanently* in the HTML now.
    // NOTE: This assumes you don't have other non-shard elements in stageEl besides the overlays.
    // A safer way is to clear only elements with the 'shard' class.
    shardsArr.forEach(shard => shard.remove());
    shardsArr.length = 0; // Clear the array reference too

  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const x1=c/COLS*100, x2=(c+1)/COLS*100;
      const y1=r/ROWS*100, y2=(r+1)/ROWS*100;
      const t1=[[x1,y1],[x2,y1],[x1,y2]];
      const t2=[[x2,y1],[x2,y2],[x1,y2]];
      [t1,t2].forEach(tri=>{
        const el=document.createElement('div');
        el.className='shard ' + (Math.random()<.5?'colorA':'colorB');
                if (imgUrl) { 
                    el.style.backgroundImage = `url("${imgUrl}")`;
                }
        el.style.clipPath=`polygon(${tri.map(p => `${p[0]}% ${p[1]}%`).join(",")})`;
        // store centroid (percent)
        el.dataset.cxP = (tri[0][0]+tri[1][0]+tri[2][0]) / 3;
        el.dataset.cyP = (tri[0][1]+tri[1][1]+tri[2][1]) / 3;
        stageEl.appendChild(el);
        shardsArr.push(el);
      });
    }
  }
}

// ⚠️ MODIFIED: Merged init logic into a general function for reuse
function initSequence(stageEl, shardsArr, imgUrl, finalImgEl, tracedImgEl, traceImgEl, onCompleteCallback) {
  const img = new Image();
  img.src = imgUrl;
  img.onload = () => {
    buildShards(stageEl, shardsArr, imgUrl); // Pass imgUrl to buildShards
    const rect = stageEl.getBoundingClientRect();
    const fit = computeImageFit(img, rect.width|0, rect.height|0);
    applyBackgroundTransform(fit, shardsArr);
    scatterShards(shardsArr, stageEl);
    
    const joinTotal = ROWS * COLS * 2 * JOIN_STAGGER_MS;

    setTimeout(()=>{
      joinShards(shardsArr);
      
      // Start sweep AFTER the join animation has finished (joinTotal) PLUS the pause
      setTimeout(() => startSweepAndReveal(shardsArr, finalImgEl, tracedImgEl, traceImgEl, onCompleteCallback), joinTotal + SHOWCASE_PAUSE_MS);
    }, ASSEMBLE_DELAY);
  };
  img.onerror = () => { console.warn("Shard image failed; using colored shards fallback."); buildShards(stageEl, shardsArr); };
}


function scatterShards(shardsArr, stageEl){
  const rect = stageEl.getBoundingClientRect();
  shardsArr.forEach(el=>{
    const sx = (Math.random()>.5?-1:1)*(rect.width*(.6+Math.random()*0.8));
    const sy = (Math.random()>.5?-1:1)*(rect.height*(.6+Math.random()*0.8));
    el.style.transform=`translate(${sx}px,${sy}px) rotate(${(Math.random()*60-30).toFixed(1)}deg)`;
    el.style.opacity='0';
  });
}

function joinShards(shardsArr){
  shardsArr.forEach((el,i)=> setTimeout(()=>{
    el.style.transform='translate(0,0) rotate(0deg)';
    el.style.opacity='1';
  }, i*JOIN_STAGGER_MS));
}

function gatherShardsFromTop(shardsArr, stageEl, duration=900, stagger=8){
  const rect = stageEl.getBoundingClientRect();
  shardsArr.forEach((el,i)=>{
    const cx = parseFloat(el.dataset.cxP);
    const startX = (Math.random()*2-1) * rect.width * 0.25;
    const startY = - (rect.height + 220);
    // start off-screen above
    el.style.transition = 'none';
    el.style.transform = `translate(${startX}px, ${startY}px) rotate(${(Math.random()*40-20).toFixed(1)}deg)`;
    el.style.opacity  = '0';
    // then fly in to position
    setTimeout(()=>{
      el.style.transition = `transform ${duration}ms cubic-bezier(.2,.8,.2,1), opacity ${duration}ms ease`;
      el.style.transform = 'translate(0,0) rotate(0deg)';
      el.style.opacity  = '1';
    }, i*stagger);
  });
  return new Promise(res => setTimeout(res, duration + shardsArr.length*stagger + 60));
}

// contain-fit helper
function computeImageFit(image, W, H){
  const iw=image.naturalWidth, ih=image.naturalHeight;
  const r=Math.min(W/iw, H/ih); const dw=Math.round(iw*r), dh=Math.round(ih*r);
  const dx=Math.round((W-dw)/2), dy=Math.round((H-dh)/2);
  return {dx,dy,dw,dh};
}
function applyBackgroundTransform(fit, shardsArr){
  shardsArr.forEach(el=>{
    el.style.backgroundSize = `${fit.dw}px ${fit.dh}px`;
    el.style.backgroundPosition = `${fit.dx}px ${fit.dy}px`;
  });
}

// ---------- Sweep + Vertical reveal, then finalize layout + type (Generalized) ----------
function startSweepAndReveal(shardsArr, finalImgEl, tracedImgEl, traceImgEl, onCompleteCallback){
  // fade shards away
  shardsArr.forEach(el=> el.style.opacity='0');
  setTimeout(()=> shardsArr.forEach(el=> el.style.display='none'), 320);
 
  // show outline and sweep
  tracedImgEl.style.opacity = '1';
  traceImgEl.style.opacity = '1';
 
  const duration = SWEEP_MS;
  let startTime = null;
 
  function frame(t){
    if(!startTime) startTime = t;
    const elapsed = t - startTime;
    const p = Math.min(elapsed / duration, 1);
   
    // gold sweep progress
    const angle = p * 360;
    const mask = `conic-gradient(from ${SWEEP_START_DEG}deg at 50% 50%, black 0deg ${angle}deg, transparent ${angle}deg 360deg)`;
    traceImgEl.style.maskImage = mask;
    traceImgEl.style.webkitMaskImage = mask;
   
    // final portrait vertical reveal (bottom -> top)
    const revealPct = (p*100).toFixed(2) + '%';
    finalImgEl.style.setProperty('--reveal', revealPct);
   
    if(p < 1){
      requestAnimationFrame(frame);
    }else{
      tracedImgEl.style.opacity = '0';
      traceImgEl.style.opacity = '0';
     
      // Execute callback after animation completes
                if (onCompleteCallback) onCompleteCallback();
    }
  }
  requestAnimationFrame(frame);
}

/* ======== FRAME: draw/animate rounded rectangle around .hero (with insets) ======== */
let frameLayer; // absolute wrapper
let frameSvg, frameRect, frameBottom;

function createOrUpdateFrame() {
  const hero = document.getElementById('hero');
  const stage = document.getElementById('stage');
  const rect = hero.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
 
  // --- responsive per-side padding (inside the hero) ---
  const isMobile = window.matchMedia('(max-width:710px)').matches;
  const padSides = isMobile ? 15 : 15;   // small side gap
  const padTop = isMobile ? 80 : 100;    // space above the title
  const padBot = isMobile ? 140 : 105;   // a bit larger at bottom
 
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
    scrollImg.src = '../icons/scrollDown.gif'; // <-- your gif
    frameLayer.appendChild(scrollImg);
   
    // when clicked, trigger transition
    scrollImg.addEventListener('click', async () => {
      scrollImg.disabled = true;
      document.body.classList.remove('no-scroll');
      await explodeShardsToSky(shards, stage, 700);
      frameLayer.style.display = 'none';
      
            // ⚠️ MODIFIED: Initialize and start the ABOUT section animation sequence here
      document.getElementById('heroAbout').scrollIntoView({ behavior: 'smooth' });
      
            // Delay to match smooth scroll duration; adjust as needed (600ms is common for a short scroll)
      setTimeout(async () => {
                await gatherShardsFromTop(aboutShards, stageAbout, 900, 8); // Shards fly in from top
                
                // Then start the full animation sequence, followed by typing
                initSequence(
                    stageAbout, 
                    aboutShards, 
                    ABOUT_IMG_URL, 
                    finalImgAbout, 
                    tracedImgAbout, 
                    traceImgAbout,
                    () => {
                        heroAbout.classList.add('about-layout'); // Apply final layout after sweep
                        startAboutTyping();
                    }
                );
      }, 600);
    });
  }
 
  // position the layer over hero (no outside margin)
  frameLayer.style.top = `${Math.round(rect.top + window.scrollY)}px`;
  frameLayer.style.left = `${Math.round(rect.left + window.scrollX)}px`;
  frameLayer.style.width = `${w}px`;
  frameLayer.style.height = `${h}px`;
 
  // set SVG size
  frameSvg.setAttribute('width', w);
  frameSvg.setAttribute('height', h);
 
  // main rounded rectangle inset
  const x = padSides + 1.5;
  const y = padTop + 1.5;
  const iw = Math.max(0, w - (padSides*2) - 3);
  const ih = Math.max(0, h - (padTop + padBot) - 3);
  frameRect.setAttribute('x', x);
  frameRect.setAttribute('y', y);
  frameRect.setAttribute('width', iw);
  frameRect.setAttribute('height', ih);
  frameRect.setAttribute('rx', r);
  frameRect.setAttribute('ry', r);
 
  // thicker bottom stroke segment (draw just the bottom edge)
  const bx1 = x + r;
  const bx2 = x + iw - r;
  const by = y + ih; // baseline of the rect
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
  frameRect.style.strokeDasharray = `${length}`;
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

/* ===== ABOUT ME TRANSITION ===== */
/* 1) explode current shards upwards to the sky */
function explodeShardsToSky(shardsArr, stageEl, duration=700){
  const rect = stageEl.getBoundingClientRect();
  shardsArr.forEach(el=>{
    const dx = (Math.random()*2-1) * rect.width * 0.25;
    const dy = - (rect.height + 220); // fly up
    el.style.transition = `transform ${duration}ms cubic-bezier(.2,.8,.2,1), opacity ${duration}ms ease`;
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${(Math.random()*40-20).toFixed(1)}deg)`;
    el.style.opacity  = '0';
  });
  return new Promise(res => setTimeout(res, duration+40));
}

function initAbout() {
    // The required setup for about section shards is now primarily handled 
    // when the scroll down button is clicked. 
}

// Start the first section sequence
setTimeout(() => {
    // Fix: Always reset scroll to the top of the page on initial load
    window.scrollTo(0, 0); 

    // Initial sequence for the first hero section
    initSequence(
        stage, 
        shards, 
        IMG_URL, 
        finalImg, 
        tracedImg, 
        traceImg,
        () => {
            // Callback when first animation is complete
            hero.classList.add('final-layout');
            startNameRoleTyping();
        }
    );
}, 50);