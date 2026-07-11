import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Wire Lenis smooth scroll into GSAP ScrollTrigger, and report page scroll
// progress (0..1) to the cosmos each frame.
export function initSmoothScroll(onProgress) {
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    onProgress?.(p);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// Slow-in, slow-out curve for the logo's "return to orbit" scroll — weightier
// than the default wheel easing, so it reads as a deliberate cinematic beat.
function cinematicEase(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Clicking the wordmark (nav or footer) smooth-scrolls to the hero instead of
// snapping instantly.
export function initLogoScroll(lenis) {
  if (!lenis) return;
  document.querySelectorAll('a.brand[href="#top"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo(0, { duration: 2.1, easing: cinematicEase });
    });
  });
}

// Section-scoped triggers that drive the WebGL scene beats. Kept separate from
// global page progress so the morph stays aligned with the capabilities section
// even if surrounding copy changes.
export function initSceneTriggers(cosmos) {
  if (!cosmos) return;

  // Beat 1: the galaxy morphs into the radial constellation while the
  // capabilities section scrolls into view.
  ScrollTrigger.create({
    trigger: '#capabilities',
    start: 'top bottom',
    end: 'bottom center',
    scrub: true,
    onUpdate: (self) => cosmos.setMorph(self.progress),
  });

  // Beat 2: the constellation collapses into the "singularity" core as the CTA
  // section arrives.
  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top bottom',
    end: 'center center',
    scrub: true,
    onUpdate: (self) => cosmos.setCollapse(self.progress),
  });
}

export { gsap, ScrollTrigger };
