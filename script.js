const toggleButton = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const yearElements = document.querySelectorAll('#year');
const slides = Array.from(document.querySelectorAll('.slide'));
const body = document.body;

if (toggleButton && nav) {
  toggleButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggleButton.setAttribute('aria-expanded', String(isOpen));
  });
}

yearElements.forEach((el) => {
  el.textContent = new Date().getFullYear();
});

if (slides.length) {
  let activeIndex = 0;
  setInterval(() => {
    slides[activeIndex].classList.remove('active');
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add('active');
  }, 4000);
}

if (!document.querySelector('.promo-banner')) {
  const promo = document.createElement('div');
  promo.className = 'promo-banner';
  promo.innerHTML = '<span class="promo-pill">🔥 Limited Offer</span><span>Get <strong>20% OFF</strong> on memberships this month.</span>';
  body.insertBefore(promo, body.firstChild);
}

