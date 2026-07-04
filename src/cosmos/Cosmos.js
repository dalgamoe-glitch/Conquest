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
  blackHole.object.position.set(0, -0.2, 0);
  blackHole.object.scale.setScalar(0.4);
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
  let scroll = 0; // global page progress 0..1 (camera dolly)
  let scrollEased = 0;
  let morph = 0; // galaxy -> constellation (capabilities section)
  let morphEased = 0;
  let collapse = 0; // constellation -> core (CTA section)
  let collapseEased = 0;
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

  // Camera flies in over the full page — a bit more cinematic than before, but
  // still smooth and never disorienting.
  function applyCamera(p) {
    const e = smoothstep(0, 1, p);
    camera.position.z = lerp(15, 8.5, e);
    camera.position.y = lerp(1.4, 0.15, smoothstep(0.2, 1, p));
    rig.rotation.z = lerp(0, 0.14, smoothstep(0.25, 1, p)); // gentle roll
  }

  // Galaxy <-> constellation morph (driven by the capabilities section) and the
  // collapse-to-core finale (driven by the CTA section).
  function applyScene(m, c) {
    galaxy.setMorph(m);
    galaxy.setCollapse(c);
    galaxy.setOpacity(1);
    // Tilt the disk flat to face the camera as it becomes the constellation.
    galaxy.object.rotation.x = lerp(0.5, 0.0, m);
    galaxy.object.scale.setScalar(lerp(1.0, 1.28, m) * lerp(1.0, 0.82, c));

    // The black hole is the "singularity" that the particles collapse into.
    blackHole.object.visible = c > 0.001;
    blackHole.setOpacity(c);
    blackHole.object.scale.setScalar(lerp(0.4, 1.0, c));
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    // Ease scroll + morph + pointer for smoothness.
    scrollEased += (scroll - scrollEased) * 0.08;
    morphEased += (morph - morphEased) * 0.09;
    collapseEased += (collapse - collapseEased) * 0.09;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    applyCamera(scrollEased);
    applyScene(morphEased, collapseEased);

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
    setMorph(m) {
      morph = clamp(m, 0, 1);
    },
    setCollapse(c) {
      collapse = clamp(c, 0, 1);
    },
    // Render a single frame (used for reduced-motion static shot).
    renderStatic(p = 0.12) {
      scrollEased = p;
      morphEased = 0;
      collapseEased = 0;
      applyCamera(p);
      applyScene(0, 0);
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
