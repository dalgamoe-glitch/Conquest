import { gsap, ScrollTrigger } from '../cosmos/scroll.js';

// Split a heading into per-character spans for a staggered reveal.
export function splitChars(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const frag = document.createDocumentFragment();
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'char';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = ch === ' ' ? ' ' : ch;
    frag.appendChild(span);
  }
  el.appendChild(frag);
  return el.querySelectorAll('.char');
}

// Reveal-on-scroll for any element with .reveal, plus the hero char animation.
export function initReveals({ reducedMotion } = {}) {
  if (reducedMotion) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
    document.querySelectorAll('[data-stagger-item]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Hero wordmark: char stagger up.
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const chars = splitChars(heroTitle);
    gsap.from(chars, {
      yPercent: 120,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
      stagger: 0.05,
      delay: 0.15,
    });
  }

  // Generic reveals.
  gsap.utils.toArray('.reveal').forEach((el) => {
    const delay = parseFloat(el.dataset.delay || '0');
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Staggered groups (e.g. package cards, steps, nodes).
  gsap.utils.toArray('[data-stagger]').forEach((group) => {
    const items = group.querySelectorAll('[data-stagger-item]');
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.09,
      scrollTrigger: {
        trigger: group,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  });

  ScrollTrigger.refresh();
}
