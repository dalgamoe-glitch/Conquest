import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { createStarfield } from './Starfield.js';
import { createGalaxy } from './Galaxy.js';
import { createBlackHole } from './BlackHole.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export function createCosmos(canvas) {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.6 : 2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x04070a, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04070a, 0.012);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 1.2, 14);

  // Parallax rig: pointer tilts this group.
  const rig = new THREE.Group();
  scene.add(rig);

  const starfield = createStarfield({ count: isMobile ? 2000 : 4200 });
  scene.add(starfield.object);

  const galaxy = createGalaxy({ count: isMobile ? 9000 : 22000 });
  galaxy.object.position.set(0, 0, 0);
  galaxy.object.rotation.x = 0.5;
  rig.add(galaxy.object);

  const blackHole = createBlackHole({ count: isMobile ? 6000 : 14000 });
  blackHole.object.position.set(0, -0.5, 0);
  blackHole.object.scale.setScalar(0.9);
  blackHole.object.visible = false;
  rig.add(blackHole.object);

  // Bloom for the glow.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    isMobile ? 0.9 : 1.15, // strength
    0.7, // radius
    0.02 // threshold
  );
  composer.addPass(bloom);
  composer.setPixelRatio(dpr);
  composer.setSize(window.innerWidth, window.innerHeight);

  // State
  const clock = new THREE.Clock();
  let running = false;
  let rafId = 0;
  let scroll = 0; // target scroll progress 0..1
  let scrollEased = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  function onPointerMove(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.tx = nx;
    pointer.ty = ny;
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloom.setSize(w, h);
  }

  function applyScroll(p) {
    // Hero (0) -> content mid (0.5) -> black hole finale (1).
    const galaxyFade = 1 - smoothstep(0.34, 0.62, p) * 0.86;
    galaxy.setOpacity(galaxyFade);
    galaxy.object.scale.setScalar(lerp(1, 1.5, smoothstep(0, 0.6, p)));
    // Keep the bright core below the hero copy at the top of the page.
    galaxy.object.position.y = lerp(-1.4, 1.8, smoothstep(0, 0.6, p));
    galaxy.object.rotation.x = 0.5 + smoothstep(0, 1, p) * 0.5;

    const bhReveal = smoothstep(0.5, 0.78, p);
    blackHole.object.visible = bhReveal > 0.001;
    blackHole.setOpacity(bhReveal);
    blackHole.object.scale.setScalar(lerp(0.55, 1.05, bhReveal));
    blackHole.object.position.y = lerp(-3.2, -0.4, bhReveal);

    // Gentle camera dolly — subtle, never disorienting.
    camera.position.z = lerp(14, 10.5, smoothstep(0, 1, p));
    camera.position.y = lerp(1.2, 0.2, smoothstep(0.4, 1, p));
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    // Ease scroll + pointer for smoothness.
    scrollEased += (scroll - scrollEased) * 0.08;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    applyScroll(scrollEased);

    rig.rotation.y = pointer.x * 0.18;
    rig.rotation.x = pointer.y * 0.1;

    starfield.update(t);
    galaxy.update(t);
    blackHole.update(t);

    camera.lookAt(0, camera.position.y - 0.4, 0);
    composer.render();
  }

  return {
    start() {
      if (running) return;
      running = true;
      clock.start();
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('resize', onResize);
      tick();
    },
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
    },
    setScroll(p) {
      scroll = clamp(p, 0, 1);
    },
    // Render a single frame (used for reduced-motion static shot).
    renderStatic(p = 0.12) {
      scrollEased = p;
      applyScroll(p);
      starfield.update(2.0);
      galaxy.update(2.0);
      blackHole.update(2.0);
      camera.lookAt(0, camera.position.y - 0.4, 0);
      composer.render();
    },
    dispose() {
      this.stop();
      starfield.dispose();
      galaxy.dispose();
      blackHole.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
