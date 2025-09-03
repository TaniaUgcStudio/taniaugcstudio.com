// ------- TYPEWRITER --------
function typeSentence(target, sentence, speed, cb){
  let i = 0;
  target.textContent = '';
  target.style.opacity = 1;
  (function type(){
    if(i < sentence.length){
      target.textContent += sentence.charAt(i++);
      setTimeout(type, speed);
    }else{
      target.classList.add('visible');
      if(cb) cb();
    }
  })();
}

function startTypewriterIn(container){
  const items = container.querySelectorAll('.type-target[data-text]');
  let idx = 0;
  function next(){
    if(idx < items.length){
      const el = items[idx];
      typeSentence(el, el.getAttribute('data-text'), 14, () => { idx++; next(); });
    }
  }
  next();
}

// IntersectionObserver: anima párrafos al entrar en viewport
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      startTypewriterIn(e.target);
      io.unobserve(e.target);
    }
  });
},{threshold:0.15});

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.hero-inner, .book, .benefits, .testimonials').forEach(el=>io.observe(el));
  initBook();
  initReviews();
  // [OPCIONAL] Personalización simple por IP (requiere endpoint propio):
  // fetch('/api/geo').then(r=>r.json()).then(({country, city})=>{
  //   if(city) document.querySelector('.hero-badges').insertAdjacentHTML('beforeend', `<span>Hola ${city}</span>`);
  // }).catch(()=>{});
});

// ------- BOOK FLIP --------
function initBook(){
  const book = document.querySelector('.book');
  if(!book) return;
  const pages = Array.from(book.querySelectorAll('.page'));
  const prev = book.querySelector('.nav.prev');
  const next = book.querySelector('.nav.next');
  let index = 0;

  function render(){
    pages.forEach((p,i)=>{
      p.style.zIndex = (pages.length - i).toString();
      p.classList.remove('prev','current','next');
    });
    const curr = pages[index];
    const nxt = pages[index+1];
    const prv = pages[index-1];
    if(curr) curr.classList.add('current');
    if(nxt)  nxt.classList.add('next');
    if(prv)  prv.classList.add('prev');
  }

  function flipNext(){
    if(index < pages.length - 1){
      const curr = pages[index];
      curr.style.transform = 'rotateY(-180deg)';
      index++;
      setTimeout(()=>{ render(); }, 400);
    }
  }
  function flipPrev(){
    if(index > 0){
      const prevPage = pages[index-1];
      prevPage.style.transform = 'rotateY(0deg)';
      index--;
      setTimeout(()=>{ render(); }, 200);
    }
  }

  next.addEventListener('click', flipNext);
  prev.addEventListener('click', flipPrev);
  render();
}

// ------- REVIEWS (append a la grilla) --------
function initReviews(){
  const form = document.getElementById('reviewForm');
  const grid = document.getElementById('testiGrid');
  if(!form || !grid) return;

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value.trim() || 'Usuario';
    const rating = document.getElementById('rating').value || '★★★★★';
    const message = document.getElementById('message').value.trim();
    const avatar = document.getElementById('avatar').value.trim() || 'images/avatars/default.jpg';
    if(!message) return;

    const card = document.createElement('figure');
    card.className = 'card';
    card.innerHTML = `
      <img src="${avatar}" alt="Perfil de ${name}" />
      <figcaption>
        <div class="stars" aria-label="${rating.length} de 5">${rating}</div>
        <p>${message}</p>
        <span>— ${name}</span>
      </figcaption>
    `;
    grid.prepend(card);
    form.reset();
  });
}
