// CCF SCU - Main Script

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => navLinks.classList.toggle('show'));
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('show'));
  });

  // Scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('section, .card, .stat-card, .honor-img-card, .gallery-item, .team-section, .join-card').forEach(el => {
    el.classList.add('fade-in-up');
    observer.observe(el);
  });
});

// Timeline toggle
function toggleOld(btn, id) {
  const target = document.getElementById(id);
  const isOpen = target.classList.contains('show');
  target.classList.toggle('show');
  btn.classList.toggle('open');
  btn.querySelector('.arrow').innerHTML = isOpen ? '&#9654;' : '&#9660;';
}
