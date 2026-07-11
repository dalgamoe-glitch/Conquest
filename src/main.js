// Fonts (bundled, no runtime CDN)
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

// Styles
import './styles/tokens.css';
import './styles/global.css';
import './styles/sections.css';

import { renderApp } from './ui/dom.js';
import { initNav } from './ui/nav.js';
import { initReveals } from './ui/reveal.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

async function boot() {
  const root = document.getElementById('app');
  renderApp(root);
  initNav();

  const canvas = document.getElementById('cosmos');
  const webgl = hasWebGL();

  if (!webgl) {
    document.body.classList.add('no-webgl');
  }

  // Content reveals (skipped/instant under reduced motion inside initReveals).
  if (reducedMotion) {
    initReveals({ reducedMotion: true });
    // Draw a single static cosmos frame if WebGL is available.
    if (webgl) {
      try {
        const { createCosmos } = await import('./cosmos/Cosmos.js');
        const cosmos = createCosmos(canvas);
        cosmos.renderStatic(0.12);
      } catch (err) {
        console.warn('Cosmos static render failed, using CSS fallback.', err);
        document.body.classList.add('no-webgl');
      }
    }
    return;
  }

  // Full motion experience.
  let cosmos = null;
  if (webgl) {
    try {
      const { createCosmos } = await import('./cosmos/Cosmos.js');
      cosmos = createCosmos(canvas);
      cosmos.start();
    } catch (err) {
      console.warn('Cosmos init failed, using CSS fallback.', err);
      document.body.classList.add('no-webgl');
      cosmos = null;
    }
  }

  const { initSmoothScroll, initSceneTriggers, initLogoScroll, initCtaScroll } = await import('./cosmos/scroll.js');
  const lenis = initSmoothScroll((p) => cosmos?.setScroll(p));
  initSceneTriggers(cosmos);
  initLogoScroll(lenis);
  initCtaScroll(lenis);

  initReveals({ reducedMotion: false });

  // Pause rendering when tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (!cosmos) return;
    if (document.hidden) cosmos.stop();
    else cosmos.start();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
