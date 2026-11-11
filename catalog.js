// Tune Street — catalog filter, cart & photo-based virtual garage
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rupiah = (n) => 'Rp' + n.toLocaleString('id-ID');
  const toastEl = $('.toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };

  // ---------- Cart ----------
  let cart = []; // {id, name, detail, price}
  let uid = 0;
  const cartItems = $('#cart-items'), cartTotal = $('#cart-total');
  function renderCart() {
    if (!cart.length) {
      cartItems.innerHTML = '<p class="cart-empty">Your cart is waiting for your first build.</p>';
    } else {
      cartItems.innerHTML = cart.map((i) => `
        <div class="cart-item"><div><span>${i.name}</span><small>${i.detail || ''}</small></div>
        <div style="display:flex;gap:10px;align-items:flex-start"><strong>${rupiah(i.price)}</strong>
        <button data-remove="${i.id}" aria-label="Hapus ${i.name}" style="cursor:pointer;background:none;border:0;font-size:14px;line-height:1">×</button></div></div>`).join('');
    }
    cartTotal.textContent = rupiah(cart.reduce((s, i) => s + i.price, 0));
  }
  const addToCart = (item) => { cart.push({ id: ++uid, ...item }); renderCart(); toast('Ditambahkan ke keranjang'); };
  cartItems.addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]'); if (!b) return;
    cart = cart.filter((i) => i.id !== +b.dataset.remove); renderCart();
  });
  $('.btn-dark.full-btn').addEventListener('click', () => { cart = []; renderCart(); });

  // ---------- Catalog ----------
  const cats = ['all', 'wheels', 'aero', 'performance', 'interior'];
  const filterBtns = $$('.filter-btn'), cards = $$('.product-card'), count = $('#product-count');
  filterBtns.forEach((btn, i) => btn.addEventListener('click', () => {
    filterBtns.forEach((b) => { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', b === btn); });
    let n = 0;
    cards.forEach((c) => { const show = cats[i] === 'all' || c.dataset.category === cats[i]; c.style.display = show ? '' : 'none'; if (show) n++; });
    count.textContent = n;
  }));
  const parsePrice = (t) => parseInt(t.replace(/\D/g, ''), 10);
  cards.forEach((card) => $('.quick-add', card).addEventListener('click', () => {
    addToCart({
      name: `${$('.product-brand', card).textContent} ${$('h3', card).textContent}`,
      detail: $('.product-info p', card).textContent,
      price: parsePrice($('.product-info > strong', card).textContent),
    });
  }));

  // ---------- Virtual garage (photo mode) ----------
  const WHEELS = {
    stock: { name: 'Stock wheels', price: 0 },
    te37: { name: 'Rays TE37 Saga', price: 52000000, img: 'assets/wheel-te37-rim.png' },
    'bbs-lm': { name: 'BBS LM', price: 85000000, img: 'assets/wheel-bbs-lm.png' },
    rpf1: { name: 'Enkei RPF1', price: 21000000, img: 'assets/wheel-rpf1.png' },
  };
  const CALIPERS = { stock: ['Stock brakes', 0], red: ['Brembo Red', 68000000], gold: ['Brembo Gold', 68000000], lime: ['Brembo Lime', 68000000] };
  const TINTS = { clear: 'Clear factory', smoke: '40% Smoke', dark: '80% Privacy' };
  const PART_PRICE = { bodykit: 38000000, spoiler: 32000000, hood: 18500000, coilover: 16000000, exhaust: 19500000 };
  const PART_LABEL = { bodykit: 'Nismo Aero Kit', spoiler: 'Voltex Type 7 GT Wing', hood: 'Seibon Carbon Hood', coilover: 'Tein Flex Z', exhaust: 'HKS Hi-Power Exhaust' };
  // Variant photo -> {base, mask, wheel positions (left%/top%/width%)}
  const VARIANTS = {
    stock: { base: 'r34-base', pos: [[15.9069, 54.2226], [71.9069, 54.2226]], w: 10.6862 },
    bodykit: { base: 'r34-bodykit', pos: [[15.8425, 53.6711], [71.9069, 53.784]], w: 10.815 },
    wing: { base: 'r34-wing', pos: [[15.8425, 53.6711], [71.9069, 53.784]], w: 10.815 },
    'bodykit-wing': { base: 'r34-bodykit-wing', pos: [[15.9069, 53.3454], [71.9069, 53.3454]], w: 10.6862 },
  };
  const CAR = { name: 'Skyline R34', code: 'BNR34 / 1999–2002' };

  const stage = $('#car-photo');
  const layers = {};
  Object.entries(VARIANTS).forEach(([key, v]) => {
    const el = document.createElement('div');
    el.className = 'car-layer'; el.dataset.variant = key;
    el.innerHTML = `<img class="car-base" alt="" width="1600" height="912" src="assets/${v.base}.jpg">
      <div class="car-paint" style="mask-image:url('assets/${v.base}-mask.png');-webkit-mask-image:url('assets/${v.base}-mask.png')"></div>
      <img class="car-wheel" alt="" hidden style="left:${v.pos[0][0]}%;top:${v.pos[0][1]}%;width:${v.w}%">
      <img class="car-wheel" alt="" hidden style="left:${v.pos[1][0]}%;top:${v.pos[1][1]}%;width:${v.w}%">`;
    stage.appendChild(el); layers[key] = el;
  });
  stage.classList.add('is-photo');

  const colorBtns = $$('.color-swatch'), wheelSel = $('#wheel-style'), caliperSel = $('#caliper-style'), tintSel = $('#tint-style');
  const toggles = Object.fromEntries(['bodykit', 'spoiler', 'hood', 'coilover', 'exhaust'].map((k) => [k, $(`#${k}-toggle`)]));
  const state = () => ({
    color: colorBtns.find((b) => b.classList.contains('selected')),
    wheel: wheelSel.value, caliper: caliperSel.value, tint: tintSel.value,
    on: Object.fromEntries(Object.entries(toggles).map(([k, el]) => [k, el.checked])),
  });

  function calc() {
    const s = state();
    return WHEELS[s.wheel].price + CALIPERS[s.caliper][1] +
      Object.entries(s.on).reduce((sum, [k, v]) => sum + (v ? PART_PRICE[k] : 0), 0);
  }
  function summary() {
    const s = state();
    const parts = [CAR.name, s.color.getAttribute('aria-label'), WHEELS[s.wheel].name];
    Object.entries(s.on).forEach(([k, v]) => v && parts.push(PART_LABEL[k]));
    if (s.caliper !== 'stock') parts.push(CALIPERS[s.caliper][0]);
    if (s.tint !== 'clear') parts.push('Tint ' + TINTS[s.tint]);
    return parts.join(' / ');
  }
  function render() {
    const s = state();
    const variant = s.on.bodykit && s.on.spoiler ? 'bodykit-wing' : s.on.bodykit ? 'bodykit' : s.on.spoiler ? 'wing' : 'stock';
    const w = WHEELS[s.wheel], hex = getComputedStyle(s.color).getPropertyValue('--swatch').trim();
    Object.entries(layers).forEach(([k, el]) => {
      el.classList.toggle('is-active', k === variant);
      $('.car-paint', el).style.backgroundColor = hex;
      $$('.car-wheel', el).forEach((img) => { if (w.img) { img.src = w.img; img.hidden = false; } else img.hidden = true; });
    });
    // visual-only extras (photo mode): lowered stance + tint/hood hint via CSS filters on the stage
    stage.style.transform = s.on.coilover ? 'translateY(0)' : '';
    stage.dataset.tint = s.tint;
    $('.control-value', colorBtns[0].closest('.control-group')).textContent = s.color.getAttribute('aria-label');
    $('#config-status').textContent = [s.color.getAttribute('aria-label'), s.on.bodykit ? 'AERO KIT' : '', s.on.spoiler ? 'GT WING' : ''].filter(Boolean).join(' / ').toUpperCase();
    $('#build-summary').textContent = summary();
    $('#build-price').textContent = rupiah(calc());
  }
  colorBtns.forEach((b) => b.addEventListener('click', () => {
    colorBtns.forEach((x) => { x.classList.toggle('selected', x === b); x.setAttribute('aria-pressed', x === b); }); render();
  }));
  [wheelSel, caliperSel, tintSel, ...Object.values(toggles)].forEach((el) => el.addEventListener('change', render));
  $('.reset-btn').addEventListener('click', () => {
    colorBtns.forEach((x, i) => { x.classList.toggle('selected', i === 0); x.setAttribute('aria-pressed', i === 0); });
    wheelSel.value = 'stock'; caliperSel.value = 'stock'; tintSel.value = 'clear';
    Object.values(toggles).forEach((t) => (t.checked = false)); render();
  });
  // car picker: only the R34 has photos in this build
  const carBtns = $$('.car-option');
  carBtns.forEach((b, i) => b.addEventListener('click', () => {
    carBtns.forEach((x) => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
    if (i !== 0) toast('Foto Supra MK4 / RX-7 FD belum ada — menampilkan R34');
  }));
  $('.btn-lime.full-btn').addEventListener('click', () => {
    addToCart({ name: 'Custom Build — ' + CAR.name, detail: summary(), price: calc() });
  });
  // "Build your ride" buttons jump to garage
  $$('a[href$="#garage"]').forEach((a) => a.addEventListener('click', () => $('#garage').scrollIntoView({ behavior: 'smooth' })));

  render(); renderCart();
})();
