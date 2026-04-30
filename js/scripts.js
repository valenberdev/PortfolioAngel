<script>
(function() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dotsContainer = document.getElementById('carouselDots');
  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    slides.forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.carousel-dot').forEach(d => d.classList.remove('active'));
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    document.querySelectorAll('.carousel-dot')[current].classList.add('active');
    const offset = slides[current].offsetLeft - (document.querySelector('.reels-carousel').clientWidth / 2) + (slides[current].clientWidth / 2);
    document.querySelector('.reels-carousel').scrollLeft = offset;
  }

  document.querySelector('.carousel-prev').addEventListener('click', () => goTo(current - 1));
  document.querySelector('.carousel-next').addEventListener('click', () => goTo(current + 1));

  slides.forEach(s => {
    s.addEventListener('click', (e) => {
      if (!s.classList.contains('active')) {
        e.preventDefault();
        goTo(Array.from(slides).indexOf(s));
      }
    });
  });

  goTo(0);
})()