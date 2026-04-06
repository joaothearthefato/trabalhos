/* ============================================================
   TNT GYM — script.js
   ============================================================ */

'use strict';

/* ========== LOADER ========== */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('loaded');
  }, 1500);
});

/* ========== NAVBAR ========== */
const navbar  = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// Scroll effect
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  toggleBackTop();
  updateActiveNav();
}, { passive: true });

// Hamburger toggle
hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close mobile menu on link click
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

// Active nav link on scroll
function updateActiveNav() {
  const sections = document.querySelectorAll('main section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navMenu.querySelectorAll('a[href^="#"]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

/* ========== SMOOTH SCROLL ========== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ========== BACK TO TOP ========== */
const backTop = document.getElementById('backTop');
function toggleBackTop() {
  backTop.classList.toggle('visible', window.scrollY > 500);
  backTop.hidden = false;
}
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ========== SCROLL REVEAL ========== */
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ========== ANIMATED COUNTERS ========== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString('pt-BR');
    if (current >= target) clearInterval(timer);
  }, 16);
}

const statNums = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(n => counterObserver.observe(n));

/* ========== CAROUSEL ========== */
const track  = document.getElementById('carousel-track');
const slides = track ? track.querySelectorAll('.carousel-slide') : [];
const dotsWrap = document.getElementById('carousel-dots');
let currentSlide = 0;
let carouselTimer;

if (slides.length) {
  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Foto ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    currentSlide = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
      d.setAttribute('aria-selected', i === currentSlide);
    });
    resetTimer();
  }

  function resetTimer() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => goTo(currentSlide + 1), 4500);
  }

  document.getElementById('carousel-prev').addEventListener('click', () => goTo(currentSlide - 1));
  document.getElementById('carousel-next').addEventListener('click', () => goTo(currentSlide + 1));

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(currentSlide + (diff > 0 ? 1 : -1));
  });

  resetTimer();
}

/* ========== FORM VALIDATION ========== */
const form = document.getElementById('contactForm');

if (form) {
  const rules = {
    nome:      { required: true, minLen: 3, msg: 'Por favor, insira seu nome completo (mín. 3 caracteres).' },
    email:     { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Insira um e-mail válido.' },
    interesse: { required: true, msg: 'Selecione seu interesse.' },
    mensagem:  { required: true, minLen: 10, msg: 'Escreva uma mensagem (mín. 10 caracteres).' },
  };

  function validateField(id) {
    const el    = document.getElementById(id);
    const errEl = document.getElementById(`${id}-error`);
    const rule  = rules[id];
    if (!rule || !errEl) return true;

    const val = el.value.trim();
    let error = '';

    if (rule.required && !val) {
      error = rule.msg;
    } else if (rule.minLen && val.length < rule.minLen) {
      error = rule.msg;
    } else if (rule.pattern && !rule.pattern.test(val)) {
      error = rule.msg;
    }

    errEl.textContent = error;
    el.classList.toggle('error', !!error);
    return !error;
  }

  // Live validation
  Object.keys(rules).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(id));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const valid = Object.keys(rules).map(id => validateField(id)).every(Boolean);
    if (!valid) return;

    const btnText    = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');
    const submitBtn  = document.getElementById('submitBtn');
    const successEl  = document.getElementById('form-success');

    btnText.hidden    = true;
    btnLoading.hidden = false;
    submitBtn.disabled = true;

    // Simulate sending (replace with real endpoint)
    await new Promise(r => setTimeout(r, 1800));

    btnText.hidden    = false;
    btnLoading.hidden = true;
    submitBtn.disabled = false;
    successEl.hidden   = false;
    form.reset();

    setTimeout(() => { successEl.hidden = true; }, 6000);

    // Build WhatsApp message from form
    const nome      = document.getElementById('nome').value;
    const email_val = document.getElementById('email').value;
    const tel       = document.getElementById('telefone').value;
    const interesse = document.getElementById('interesse').value;
    const msg       = document.getElementById('mensagem').value;
    const wppMsg = encodeURIComponent(
      `Olá, TNT GYM! 👋\nNome: ${nome}\nE-mail: ${email_val}\nTelefone: ${tel || 'não informado'}\nInteresse: ${interesse}\nMensagem: ${msg}`
    );
    window.open(`https://wa.me/5512981646239?text=${wppMsg}`, '_blank', 'noopener');
  });
}

/* ========== PHONE MASK ========== */
const telInput = document.getElementById('telefone');
if (telInput) {
  telInput.addEventListener('input', () => {
    let v = telInput.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length) v = `(${v}`;
    telInput.value = v;
  });
}

/* ========== NAV: trigger scrolled on init ========== */
if (window.scrollY > 40) navbar.classList.add('scrolled');
