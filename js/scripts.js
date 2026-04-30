function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function initCarousel(container) {
  const carousel = container.querySelector('.reels-carousel');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const dotsContainer = container.querySelector('.carousel-dots');
  const prevBtn = container.querySelector('.carousel-prev');
  const nextBtn = container.querySelector('.carousel-next');
  if (!slides.length) return;

  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (dotsContainer) dotsContainer.style.display = 'none';
    return;
  }

  let currentIndex = 0;

  const urls = slides.map(s => {
    const url = s.getAttribute('onclick');
    s.removeAttribute('onclick');
    return url ? url.match(/'([^']+)'/)?.[1] : '#';
  });

  dotsContainer.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(i); });
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

  function updateActive(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
  }

  function goTo(index) {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;
    currentIndex = index;
    updateActive(index);
    slides[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex + 1); });

  slides.forEach((s, i) => {
    s.addEventListener('click', (e) => {
      if (!s.classList.contains('active')) {
        e.preventDefault();
        goTo(i);
      } else {
        window.open(urls[i], '_blank');
      }
    });
  });

  let scrollTimeout;
  carousel.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const carouselRect = carousel.getBoundingClientRect();
      const center = carouselRect.left + carouselRect.width / 2;
      let closestIndex = 0;
      let closestDist = Infinity;
      slides.forEach((slide, i) => {
        const rect = slide.getBoundingClientRect();
        const slideCenter = rect.left + rect.width / 2;
        const dist = Math.abs(slideCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });
      if (closestIndex !== currentIndex) {
        currentIndex = closestIndex;
        updateActive(currentIndex);
      }
    }, 100);
  });

  updateActive(0);
  setTimeout(() => goTo(0), 100);
}

function initReelTabs() {
  const tabContainer = document.querySelector('.tabs-container');
  if (!tabContainer) return;
  const tabBtns = tabContainer.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.reel-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;

      tabPanels.forEach(panel => {
        const isVisible = panel.id === target;
        panel.style.display = isVisible ? 'block' : 'none';
        if (isVisible) {
          const carousel = panel.querySelector('.carousel-wrapper');
          if (carousel) initCarousel(carousel);
        }
      });
    });
  });

  tabPanels.forEach(panel => {
    if (panel.style.display !== 'none') {
      const carousel = panel.querySelector('.carousel-wrapper');
      if (carousel) initCarousel(carousel);
    }
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 55);
  });
}, { threshold: 0.07 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('navLinks').classList.remove('open');
  });
});

window.addEventListener('scroll', () => {
  document.querySelector('header').classList.toggle('scrolled', window.scrollY > 50);
});

document.addEventListener('DOMContentLoaded', () => {
  initReelTabs();
});
