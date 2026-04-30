function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function initCarousel(container) {
  const carousel = container.querySelector('.reels-carousel');
  let slides = Array.from(carousel.querySelectorAll('.carousel-slide')).filter(s => s.style.display !== 'none');
  const dotsContainer = container.querySelector('.carousel-dots');
  const prevBtn = container.querySelector('.carousel-prev');
  const nextBtn = container.querySelector('.carousel-next');
  
  if (!slides.length) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (dotsContainer) dotsContainer.style.display = 'none';
    return;
  }

  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (dotsContainer) dotsContainer.style.display = 'none';
    const url = slides[0].getAttribute('onclick');
    slides[0].removeAttribute('onclick');
    slides[0].addEventListener('click', () => {
      window.open(url?.match(/'([^']+)'/)?.[1] || '#', '_blank');
    });
    return;
  }

  let currentIndex = 0;

  const urls = slides.map(s => {
    const onclick = s.getAttribute('onclick');
    s.removeAttribute('onclick');
    return onclick?.match(/'([^']+)'/)?.[1] || '#';
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
    if (slides[index]) {
      slides[index].classList.add('active');
      dots[index].classList.add('active');
    }
  }

  function goTo(index) {
    if (slides.length === 0) return;
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;
    updateActive(index);
    slides[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  if (prevBtn) {
    const newPrevBtn = prevBtn.cloneNode(true);
    prevBtn.replaceWith(newPrevBtn);
    newPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex - 1); });
  }
  if (nextBtn) {
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.replaceWith(newNextBtn);
    newNextBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex + 1); });
  }

  slides.forEach((s, i) => {
    const newSlide = s.cloneNode(true);
    s.replaceWith(newSlide);
    const finalSlide = carousel.querySelectorAll('.carousel-slide')[i];
    finalSlide.addEventListener('click', (e) => {
      if (!finalSlide.classList.contains('active')) {
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

function filterReels(type, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const carousel = document.querySelector('.reels-carousel');
  const slides = carousel.querySelectorAll('.carousel-slide');

  slides.forEach(slide => {
    const slideType = slide.dataset.type;
    slide.style.display = (type === 'all' || slideType === type) ? 'block' : 'none';
  });

  const carouselWrapper = document.querySelector('.carousel-wrapper');
  if (carouselWrapper) initCarousel(carouselWrapper);
}

document.addEventListener('DOMContentLoaded', () => {
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  if (carouselWrapper) initCarousel(carouselWrapper);

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
});
