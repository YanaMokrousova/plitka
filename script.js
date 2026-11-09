/* 1. ШАПКА: фон при прокрутке */
const header = document.getElementById('header');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* 2. МОБИЛЬНОЕ МЕНЮ (бургер) */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
if (burger && nav) {
  function toggleMenu(forceOpen) {
    const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', isOpen);
    burger.classList.toggle('is-active', isOpen);
    if (header) header.classList.toggle('menu-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  burger.addEventListener('click', () => toggleMenu());
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
}

/* 3. ПЛАВНОЕ ПОЯВЛЕНИЕ БЛОКОВ */
const revealElements = document.querySelectorAll('.reveal');
if (revealElements.length) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => {
    const index = [...el.parentElement.children].indexOf(el);
    el.style.setProperty('--delay', `${(index % 3) * 0.12}s`);
    revealObserver.observe(el);
  });
}

/* 4. СЧЁТЧИКИ ЦИФР */
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / 1500, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));
}

/* 5. ФИЛЬТР ПОРТФОЛИО */
const filterButtons = document.querySelectorAll('.filter');
const works = document.querySelectorAll('.work');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('is-active'));
    button.classList.add('is-active');
    const filter = button.dataset.filter;
    works.forEach(work => {
      const show = filter === 'all' || work.dataset.category === filter;
      work.classList.toggle('is-hidden', !show);
    });
  });
});

/* 6. СЛАЙДЕР ОТЗЫВОВ */
const track = document.getElementById('sliderTrack');
const dotsWrap = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slides = track ? track.querySelectorAll('.review') : [];

if (track && slides.length) {
  const getStep = () => slides[0].offsetWidth + (parseFloat(getComputedStyle(track).gap) || 0);

  function updateDots() {
    if (!dotsWrap) return;
    const dots = dotsWrap.querySelectorAll('.slider__dot');
    const index = Math.round(track.scrollLeft / getStep());
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === Math.min(index, dots.length - 1)));
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const visible = Math.max(1, Math.round(track.clientWidth / getStep()));
    const count = Math.max(1, slides.length - visible + 1);
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', `Перейти к отзыву ${i + 1}`);
      dot.addEventListener('click', () => track.scrollTo({ left: i * getStep(), behavior: 'smooth' }));
      dotsWrap.appendChild(dot);
    }
    updateDots();
  }

  if (nextBtn) nextBtn.addEventListener('click', () => {
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
    atEnd ? track.scrollTo({ left: 0, behavior: 'smooth' })
          : track.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  if (prevBtn) prevBtn.addEventListener('click', () => {
    track.scrollLeft <= 5 ? track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' })
                          : track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildDots, 200);
  });

  buildDots();
}

/* 7. МАСКА ТЕЛЕФОНА */
const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', () => {
    let digits = phoneInput.value.replace(/\D/g, '');
    if (digits === '') { phoneInput.value = ''; return; }
    if (digits[0] === '8') digits = '7' + digits.slice(1);
    if (digits[0] !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);

    let result = '+7';
    if (digits.length > 1) result += ' (' + digits.slice(1, 4);
    if (digits.length > 4) result += ') ' + digits.slice(4, 7);
    if (digits.length > 7) result += '-' + digits.slice(7, 9);
    if (digits.length > 9) result += '-' + digits.slice(9, 11);
    phoneInput.value = result;
  });
}

/* 8. ФОРМА ЗАЯВКИ */
const form = document.getElementById('leadForm');
if (form) {
  const nameInput = form.querySelector('[name="client_name"]');
  const successMessage = document.getElementById('formSuccess');

  const setError = (input, hasError) => {
    const field = input && input.closest('.form__field');
    if (field) field.classList.toggle('is-error', hasError);
  };

  [nameInput, phoneInput].forEach(input => {
    if (input) input.addEventListener('input', () => setError(input, false));
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const nameOk = !nameInput || nameInput.value.trim().length >= 2;
    const phoneOk = !phoneInput || phoneInput.value.replace(/\D/g, '').length === 11;
    setError(nameInput, !nameOk);
    setError(phoneInput, !phoneOk);
    if (!nameOk || !phoneOk) return;

    // ДЕМО-РЕЖИМ: имитация отправки
    const button = form.querySelector('button[type="submit"]');
    const buttonText = button ? button.textContent : '';
    if (button) { button.disabled = true; button.textContent = 'Отправляем...'; }

    setTimeout(() => {
      form.reset();
      if (button) { button.disabled = false; button.textContent = buttonText; }
      if (successMessage) {
        successMessage.hidden = false;
        setTimeout(() => (successMessage.hidden = true), 6000);
      }
    }, 900);
  });
}

/* 9. ТЕКУЩИЙ ГОД В ПОДВАЛЕ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
