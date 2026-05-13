function toggleMenu() {
  const nav = document.getElementById('navLinks');
  if (nav) nav.classList.toggle('open');
}

function initCarousel(container) {
  const carousel = container.querySelector('.reels-carousel');
  if (!carousel) return;

  carousel.querySelectorAll('.carousel-clone').forEach(c => c.remove());

  const slides = Array.from(carousel.querySelectorAll('.carousel-slide')).filter(s => s.style.display !== 'none');
  const dotsContainer = container.querySelector('.carousel-dots');
  const prevBtn = container.querySelector('.carousel-prev');
  const nextBtn = container.querySelector('.carousel-next');

  if (!slides.length) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (dotsContainer) dotsContainer.style.display = 'none';
    return;
  }

  if (slides.length <= 2) {
    initSimpleCarousel(container, slides, dotsContainer, prevBtn, nextBtn);
    return;
  }

  const isMobile = window.innerWidth <= 768;
  const realSlides = slides;
  const cloneCount = Math.min(3, slides.length);

  if (!isMobile) {
    for (let i = 0; i < cloneCount; i++) {
      const clone = realSlides[realSlides.length - 1 - i].cloneNode(true);
      clone.classList.add('carousel-clone');
      carousel.insertBefore(clone, carousel.firstChild);
    }
    for (let i = 0; i < cloneCount; i++) {
      const clone = realSlides[i].cloneNode(true);
      clone.classList.add('carousel-clone');
      carousel.appendChild(clone);
    }
  }
  carousel.querySelectorAll('.carousel-clone').forEach(c => {
    c.classList.remove('active');
    c.removeAttribute('onclick');
  });


  const allSlides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const realStartIdx = isMobile ? 0 : cloneCount;
  let currentIndex = 0;

  const urls = realSlides.map(s => {
    const onclick = s.getAttribute('onclick') || '';
    s.removeAttribute('onclick');
    const match = onclick.match(/'([^']+)'/);
    return match ? match[1] : '#';
  });

  let dots = [];
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    realSlides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
      dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(idx); });
      dotsContainer.appendChild(dot);
    });
    dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));
  }

  function updateActive(index) {
    realSlides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    carousel.querySelectorAll('.carousel-clone').forEach(c => c.classList.remove('active'));
    if (realSlides[index]) {
      realSlides[index].classList.add('active');
      dots[index].classList.add('active');
    }
  }

  function goTo(index) {
    if (realSlides.length === 0) return;
    if (index < 0) index = realSlides.length - 1;
    if (index >= realSlides.length) index = 0;
    currentIndex = index;
    updateActive(index);
    const target = isMobile ? realSlides[index] : allSlides[realStartIdx + index];
    if (target) {
      carousel._smoothScrolling = true;
      clearTimeout(carousel._scrollEndTimer);
      carousel._scrollEndTimer = setTimeout(() => { carousel._smoothScrolling = false; }, 500);
      target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  realSlides.forEach((slide, idx) => {
    slide.addEventListener('click', function(e) {
      if (!this.classList.contains('active')) {
        e.preventDefault();
        e.stopPropagation();
        goTo(idx);
      } else {
        window.open(urls[idx], '_blank');
      }
    });
  });

  if (prevBtn) {
    const np = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(np, prevBtn);
    np.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex - 1); });
  }
  if (nextBtn) {
    const nn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(nn, nextBtn);
    nn.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex + 1); });
  }

  let scrollRaf = null;
  if (carousel._scrollHandler) {
    carousel.removeEventListener('scroll', carousel._scrollHandler);
  }
  carousel._scrollHandler = () => {
    if (carousel._smoothScrolling) return;
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      const rect = carousel.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      let closest = 0, closestDist = Infinity;
      realSlides.forEach((slide, idx) => {
        const sRect = slide.getBoundingClientRect();
        const dist = Math.abs(sRect.left + sRect.width / 2 - center);
        if (dist < closestDist) { closestDist = dist; closest = idx; }
      });
      if (closest !== currentIndex) {
        currentIndex = closest;
        updateActive(currentIndex);
      }
    });
  };
  carousel.addEventListener('scroll', carousel._scrollHandler);



  updateActive(0);
  const firstTarget = isMobile ? realSlides[0] : allSlides[realStartIdx];
  if (firstTarget) {
    const cr = carousel.getBoundingClientRect();
    const sr = firstTarget.getBoundingClientRect();
    carousel.scrollLeft += sr.left - cr.left - (cr.width / 2 - sr.width / 2);
  }
}




function initSimpleCarousel(container, slides, dotsContainer, prevBtn, nextBtn) {
  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (dotsContainer) dotsContainer.style.display = 'none';
    return;
  }

  let currentIndex = 0;
  const urls = slides.map(s => {
    const onclick = s.getAttribute('onclick') || '';
    s.removeAttribute('onclick');
    const match = onclick.match(/'([^']+)'/);
    return match ? match[1] : '#';
  });

  let dots = [];
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
      dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(idx); });
      dotsContainer.appendChild(dot);
    });
    dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));
  }

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
    const target = slides[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  slides.forEach((slide, idx) => {
    slide.addEventListener('click', function(e) {
      if (!this.classList.contains('active')) {
        e.preventDefault(); e.stopPropagation(); goTo(idx);
      } else { window.open(urls[idx], '_blank'); }
    });
  });

  if (prevBtn) {
    const np = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(np, prevBtn);
    np.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex - 1); });
  }
  if (nextBtn) {
    const nn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(nn, nextBtn);
    nn.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex + 1); });
  }

  let scrollRaf = null;
  const carousel = container.querySelector('.reels-carousel');
  if (carousel._scrollHandler) {
    carousel.removeEventListener('scroll', carousel._scrollHandler);
  }
  carousel._scrollHandler = () => {
    if (carousel._smoothScrolling) return;
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      const rect = carousel.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      let closest = 0, closestDist = Infinity;
      slides.forEach((slide, idx) => {
        const sRect = slide.getBoundingClientRect();
        const dist = Math.abs(sRect.left + sRect.width / 2 - center);
        if (dist < closestDist) { closestDist = dist; closest = idx; }
      });
      if (closest !== currentIndex) {
        currentIndex = closest;
        updateActive(currentIndex);
      }
    });
  };
  carousel.addEventListener('scroll', carousel._scrollHandler);

  updateActive(0);
  const firstTarget = slides[0];
  if (firstTarget) {
    const cr = carousel.getBoundingClientRect();
    const sr = firstTarget.getBoundingClientRect();
    carousel.scrollLeft += sr.left - cr.left - (cr.width / 2 - sr.width / 2);
  }
}


function filterReels(type, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const carousel = document.querySelector('.reels-carousel');
  const slides = carousel.querySelectorAll('.carousel-slide');

  slides.forEach(slide => {
    const slideType = slide.dataset.type;
    slide.style.display = (type === 'all' || slideType === type) ? '' : 'none';
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
      const nav = document.getElementById('navLinks');
      if (nav) nav.classList.remove('open');
    });
  });

  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
  });

  document.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      if (url) window.open(url, '_blank');
    });
  });
});