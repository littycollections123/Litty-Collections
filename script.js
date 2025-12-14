// --- Theme toggle + persist ---
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('litty-theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? '' : 'dark';
  if (next) document.documentElement.setAttribute('data-theme', next);
  else document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('litty-theme', next);
});

// --- Year in footer ---
document.getElementById('year').textContent = new Date().getFullYear();

// --- Simple slider logic ---
const slides = Array.from(document.querySelectorAll('.slide'));
let slideIndex = 0;
const dotsContainer = document.getElementById('sliderDots');

function goToSlide(i){
  slides.forEach((s, idx)=> s.classList.toggle('active', idx === i));
  slideIndex = i;
  updateDots();
}
function nextSlide(){ goToSlide((slideIndex + 1) % slides.length); }
function prevSlide(){ goToSlide((slideIndex - 1 + slides.length) % slides.length); }

document.getElementById('nextSlide').addEventListener('click', nextSlide);
document.getElementById('prevSlide').addEventListener('click', prevSlide);

// auto-play
let autoplay = setInterval(nextSlide, 4500);
document.getElementById('slider').addEventListener('mouseover', ()=> clearInterval(autoplay));
document.getElementById('slider').addEventListener('mouseleave', ()=> autoplay = setInterval(nextSlide,4500));

// build dots
slides.forEach((_, idx)=>{
  const b = document.createElement('button');
  b.addEventListener('click', ()=> goToSlide(idx));
  dotsContainer.appendChild(b);
});
function updateDots(){
  Array.from(dotsContainer.children).forEach((d, i)=> d.style.opacity = i===slideIndex ? '1' : '0.35');
}
goToSlide(0);

// --- Products (example list) ---
const products = [
  { id:'p1', name:'Pure Silk Saree', price:4999, img:'https://via.placeholder.com/800x1000?text=Silk+Saree+1', desc:'Rich silk saree with delicate borders.' },
  { id:'p2', name:'Kanjivaram', price:12999, img:'https://via.placeholder.com/800x1000?text=Kanjivaram', desc:'Traditional Kanjivaram with zari motifs.' },
  { id:'p3', name:'Banarasi', price:7999, img:'https://via.placeholder.com/800x1000?text=Banarasi', desc:'Banarasi saree with handwoven patterns.' },
  { id:'p4', name:'Party Silk', price:5999, img:'https://via.placeholder.com/800x1000?text=Party+Silk', desc:'Glamorous party-ready saree.' }
];

const productList = document.getElementById('productList');
function renderProducts(){
  productList.innerHTML = '';
  products.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'product';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="product-body">
        <h3>${p.name}</h3>
        <div class="price">₹${p.price.toLocaleString()}</div>
        <p class="muted">${p.desc}</p>
        <div style="margin-top:auto;display:flex;gap:8px">
          <button class="btn add-to-cart" data-id="${p.id}">Add to cart</button>
          <button class="btn alt view" data-id="${p.id}">View</button>
        </div>
      </div>
    `;
    productList.appendChild(el);
  });
}
renderProducts();

// --- Cart (localStorage) ---
const CART_KEY = 'litty_cart_v1';
function loadCart(){ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); }

function addToCart(productId){
  const cart = loadCart();
  const found = cart.find(i=>i.id===productId);
  if(found) found.qty++;
  else {
    const p = products.find(x=>x.id===productId);
    cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
  }
  saveCart(cart);
  alert('Added to cart');
}

document.addEventListener('click', (e)=>{
  if(e.target.classList.contains('add-to-cart')){
    addToCart(e.target.dataset.id);
  } else if(e.target.classList.contains('view')){
    const id = e.target.dataset.id;
    const p = products.find(x=>x.id===id);
    alert(p.name + "\\n\\nPrice: ₹" + p.price.toLocaleString() + "\\n\\n" + p.desc);
  }
});

// Cart drawer UI
const cartDrawer = document.getElementById('cart');
const cartCount = document.getElementById('cartCount');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');

function updateCartUI(){
  const cart = loadCart();
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach(it=>{
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `<img src="${it.img}" alt=""><div style="flex:1"><strong>${it.name}</strong><div>₹${(it.price).toLocaleString()} × ${it.qty}</div></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button data-id="${it.id}" class="qty-plus">+</button>
        <button data-id="${it.id}" class="qty-minus">−</button>
      </div>`;
    cartItemsEl.appendChild(row);
    total += it.price * it.qty;
  });
  cartTotalEl.textContent = total.toLocaleString();
}

document.querySelector('.cart-btn').addEventListener('click', (e)=>{
  e.preventDefault();
  cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false');
  updateCartUI();
});
document.getElementById('closeCart').addEventListener('click', ()=>{
  cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true');
});
document.getElementById('cartItems').addEventListener('click', (e)=>{
  if(e.target.classList.contains('qty-plus') || e.target.classList.contains('qty-minus')){
    const id = e.target.dataset.id;
    const cart = loadCart();
    const item = cart.find(i=>i.id===id);
    if(!item) return;
    if(e.target.classList.contains('qty-plus')) item.qty++;
    else { item.qty--; if(item.qty<=0) {
      const idx = cart.findIndex(i=>i.id===id); cart.splice(idx,1);
    }}
    saveCart(cart);
  }
});
document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  const cart = loadCart();
  if(cart.length === 0){ alert('Cart is empty'); return; }
  // For demo: create a summary and open mailto (seller can replace with own checkout)
  const lines = cart.map(i=>${i.name} x${i.qty} — ₹${(i.price*i.qty).toLocaleString()});
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const body = encodeURIComponent('Order from Litty Collections:\\n\\n' + lines.join('\\n') + \\n\\nTotal: ₹${total.toLocaleString()} + '\\n\\nCustomer: (add name & phone)');
  window.location.href = mailto:your-email@example.com?subject=${encodeURIComponent('New Order — Litty Collections')}&body=${body};
});

// init cart UI count
updateCartUI();

// --- Contact form alternate: open a simple web form (Formspree instructions button) ---
document.getElementById('contactFormAlternate').addEventListener('click', ()=>{
  alert('For reliable form delivery set up Formspree: https://formspree.io/ — create a free form endpoint, then replace the form "action" attribute in the HTML with the provided endpoint URL.');
});

// --- Small niceties: keyboard support for slider ---
document.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowRight') nextSlide();
  else if(e.key === 'ArrowLeft') prevSlide();
});

// Accessibility: ensure slider auto-play stops if user prefers reduced motion
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  clearInterval(autoplay);
}