/* =========================================================
   1. ШАПКА: добавляем фон, когда страницу прокрутили
   ========================================================= */
const header = document.getElementById('header');

function handleHeaderScroll() {
  // Если прокрутили больше 20px, добавляем класс is-scrolled
  header.classList.toggle('is-scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll(); // проверяем сразу при загрузке

/* =========================================================
   2. МОБИЛЬНОЕ МЕНЮ (бургер)
   ========================================================= */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

function toggleMenu(forceOpen) {
  // Если передали true/false, используем его; иначе переключаем
  const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !nav.classList.contains('is-open');

  nav.classList.toggle('is-open', isOpen);
  burger.classList.toggle('is-active', isOpen);
  header.classList.toggle('menu-open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
  // Пока меню открыто, страница под ним не прокручивается
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

burger.addEventListener('click', () => toggleMenu());

// При клике на пункт меню закрываем его
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

/* =========================================================
   3. ПЛАВНОЕ ПОЯВЛЕНИЕ БЛОКОВ ПРИ ПРОКРУТКЕ
   ========================================================= */
const revealElements = document.querySelectorAll('.reveal');

// IntersectionObserver «следит», когда элемент появился на экране
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target); // анимация только один раз
    }
  });
}, { threshold: 0.15 }); // срабатывает, когда видно 15% элемента

revealElements.forEach(el => {
  // Небольшая задержка для соседних карточек: появляются «волной»
  const index = [...el.parentElement.children].indexOf(el);
  el.style.setProperty('--delay', `${(index % 3) * 0.12}s`);
  revealObserver.observe(el);
});

/* =========================================================
   4. СЧЁТЧИКИ ЦИФР (12 лет, 350+ объектов...)
   ========================================================= */
const counters = document.querySelectorAll('[data-count]');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const target = Number(el.dataset.count);   // до какого числа считаем
    const suffix = el.dataset.suffix || '';    // например «+»
    const duration = 1500;                     // длительность в миллисекундах
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // замедление к концу
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

/* =========================================================
   5. ФИЛЬТР ПОРТФОЛИО
   ========================================================= */
const filterButtons = document.querySelectorAll('.filter');
const works = document.querySelectorAll('.work');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Подсвечиваем нажатую кнопку
    filterButtons.forEach(btn => btn.classList.remove('is-active'));
    button.classList.add('is-active');

    const filter = button.dataset.filter; // all / bath / kitchen / floor

    // Показываем подходящие работы, остальные прячем
    works.forEach(work => {
      const show = filter === 'all' || work.dataset.category === filter;
      work.classList.toggle('is-hidden', !show);
    });
  });
});

/* =========================================================
   6. СЛАЙДЕР ОТЗЫВОВ
   ========================================================= */
const track = document.getElementById('sliderTrack');
const slides = track.querySelectorAll('.review');
const dotsWrap = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// На сколько пикселей сдвигать за один шаг: ширина карточки + отступ
function getStep() {
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  return slides[0].offsetWidth + gap;
}

// Создаём точки. Их столько, сколько возможно «позиций» прокрутки
function buildDots() {
  dotsWrap.innerHTML = '';
  const visible = Math.max(1, Math.round(track.clientWidth / getStep())); // сколько отзывов видно сразу
  const count = Math.max(1, slides.length - visible + 1);

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('button');
    dot.className = 'slider__dot';
    dot.setAttribute('aria-label', `Перейти к отзыву ${i + 1}`);
    dot.addEventListener('click', () => {
      track.scrollTo({ left: i * getStep(), behavior: 'smooth' });
    });
    dotsWrap.appendChild(dot);
  }
  updateDots();
}

// Подсвечиваем активную точку
function updateDots() {
  const dots = dotsWrap.querySelectorAll('.slider__dot');
  const index = Math.round(track.scrollLeft / getStep());
  dots.forEach((dot, i) => dot.classList.toggle('is-active', i === Math.min(index, dots.length - 1)));
}

// Стрелка «вперёд»: в конце возвращаемся к началу
nextBtn.addEventListener('click', () => {
  const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
  atEnd ? track.scrollTo({ left: 0, behavior: 'smooth' })
        : track.scrollBy({ left: getStep(), behavior: 'smooth' });
});

// Стрелка «назад»: в начале переходим в конец
prevBtn.addEventListener('click', () => {
  const atStart = track.scrollLeft <= 5;
  atStart ? track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' })
          : track.scrollBy({ left: -getStep(), behavior: 'smooth' });
});

track.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive: true });

// При изменении размера окна (поворот телефона) пересобираем точки
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildDots, 200);
});

buildDots();

/* =========================================================
   7. МАСКА ТЕЛЕФОНА: +7 (999) 123-45-67
   ========================================================= */
const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', () => {
  let digits = phoneInput.value.replace(/\D/g, ''); // оставляем только цифры

  if (digits === '') { phoneInput.value = ''; return; }
  if (digits[0] === '8') digits = '7' + digits.slice(1);  // 8 → 7
  if (digits[0] !== '7') digits = '7' + digits;          // начали с 9 → добавим 7
  digits = digits.slice(0, 11);                          // максимум 11 цифр

  // Собираем красивый формат
  let result = '+7';
  if (digits.length > 1) result += ' (' + digits.slice(1, 4);
  if (digits.length > 4) result += ') ' + digits.slice(4, 7);
  if (digits.length > 7) result += '-' + digits.slice(7, 9);
  if (digits.length > 9) result += '-' + digits.slice(9, 11);

  phoneInput.value = result;
});

/* =========================================================
   8. ФОРМА ЗАЯВКИ: проверка и «отправка»
   ========================================================= */
const form = document.getElementById('leadForm');
const nameInput = form.querySelector('[name="client_name"]');
const successMessage = document.getElementById('formSuccess');

// Показать или убрать ошибку у поля
function setError(input, hasError) {
  input.closest('.form__field').classList.toggle('is-error', hasError);
}

// Когда человек начинает исправлять поле, убираем ошибку
[nameInput, phoneInput].forEach(input => {
  input.addEventListener('input', () => setError(input, false));
});

form.addEventListener('submit', (event) => {
  event.preventDefault(); // не перезагружаем страницу

  const nameOk = nameInput.value.trim().length >= 2;
  const phoneOk = phoneInput.value.replace(/\D/g, '').length === 11;

  setError(nameInput, !nameOk);
  setError(phoneInput, !phoneOk);
  if (!nameOk || !phoneOk) return; // есть ошибки, дальше не идём

  // ДЕМО-РЕЖИМ: имитируем отправку.
  // Позже здесь будет реальная отправка (в Telegram или на почту).
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Отправляем...';

  setTimeout(() => {
    form.reset();
    button.disabled = false;
    button.textContent = 'Отправить заявку';
    successMessage.hidden = false;
    setTimeout(() => (successMessage.hidden = true), 6000); // через 6 секунд скрываем
  }, 900);
});

/* =========================================================
   9. ТЕКУЩИЙ ГОД В ПОДВАЛЕ (обновляется сам)
   ========================================================= */
document.getElementById('year').textContent = new Date().getFullYear();