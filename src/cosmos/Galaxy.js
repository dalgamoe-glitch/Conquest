import * as THREE from 'three';

// A log-spiral galaxy of particles (mint -> cyan -> blue) that can morph, via a
// scroll-driven `uMorph` uniform, into a radial "constellation" formation — the
// same particles reassembling into node clusters + filaments (echoing the DOM
// capability nodes), like the HELIOS reference. A second `uCollapse` uniform
// pulls everything into a white-hot core for the finale.
export function createGalaxy({
  count = 22000,
  branches = 3,
  radius = 9,
  spin = 1.1,
  randomness = 0.42,
  randomPower = 2.6,
  nodeCount = 7,
} = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3); // constellation formation
  const targetColors = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  const inside = new THREE.Color('#9ff7d9'); // mint core
  const mid = new THREE.Color('#5fe6d8'); // cyan
  const outside = new THREE.Color('#3f6bd8'); // deep blue rim

  // Constellation node ring (matches the capability node layout: same count,
  // starting at the top, alternating mint / blue like the DOM `.node--blue`).
  const nodeMint = new THREE.Color('#8ff8d6');
  const nodeBlue = new THREE.Color('#8fd0ff');
  const filamentC = new THREE.Color('#3fb9c9');
  const ringR = radius * 0.7;
  const nodeCenters = [];
  const nodeColors = [];
  for (let k = 0; k < nodeCount; k++) {
    const a = (k / nodeCount) * Math.PI * 2 - Math.PI / 2;
    nodeCenters.push([Math.cos(a) * ringR, Math.sin(a) * ringR]);
    nodeColors.push(k % 2 === 1 ? nodeBlue : nodeMint);
  }
  const gauss = () =>
    (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; // ~gaussian

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // --- Galaxy (state A) ---
    const r = Math.pow(Math.random(), 1.5) * radius;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;
    const spinAngle = r * spin;

    const rand = () =>
      Math.pow(Math.random(), randomPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

    const rx = rand();
    const ry = rand() * 0.42; // flatten vertically -> disk
    const rz = rand();

    positions[i3] = Math.cos(branchAngle + spinAngle) * r + rx;
    positions[i3 + 1] = ry;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;

    const mixed = inside.clone();
    if (r / radius < 0.5) {
      mixed.lerp(mid, (r / radius) / 0.5);
    } else {
      mixed.copy(mid).lerp(outside, (r / radius - 0.5) / 0.5);
    }
    const coreBoost = 1.0 + Math.max(0, 0.6 - r / radius) * 1.4;
    colors[i3] = Math.min(1, mixed.r * coreBoost);
    colors[i3 + 1] = Math.min(1, mixed.g * coreBoost);
    colors[i3 + 2] = Math.min(1, mixed.b * coreBoost);

    scales[i] = 0.5 + Math.random() * 1.3;

    // --- Constellation (state B) ---
    const roll = Math.random();
    const k = i % nodeCount;
    let tx;
    let ty;
    let tz;
    let tc;
    if (roll < 0.55) {
      // Node cluster: gaussian blob at the node center.
      const c = nodeCenters[k];
      tx = c[0] + gauss() * 0.85;
      ty = c[1] + gauss() * 0.85;
      tz = gauss() * 0.5;
      tc = nodeColors[k];
    } else if (roll < 0.86) {
      // Filament: a strand from the core out to a node.
      const c = nodeCenters[k];
      const t = Math.pow(Math.random(), 0.8);
      tx = c[0] * t + (Math.random() - 0.5) * 0.28;
      ty = c[1] * t + (Math.random() - 0.5) * 0.28;
      tz = (Math.random() - 0.5) * 0.3;
      tc = filamentC;
    } else {
      // Faint outer ring holding the whole shape together.
      const a = Math.random() * Math.PI * 2;
      const rr = ringR * 1.08 + (Math.random() - 0.5) * 0.4;
      tx = Math.cos(a) * rr;
      ty = Math.sin(a) * rr;
      tz = (Math.random() - 0.5) * 0.3;
      tc = filamentC;
    }
    targets[i3] = tx;
    targets[i3 + 1] = ty;
    targets[i3 + 2] = tz;
    targetColors[i3] = tc.r;
    targetColors[i3 + 1] = tc.g;
    targetColors[i3 + 2] = tc.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3));
  geometry.setAttribute('aTargetColor', new THREE.BufferAttribute(targetColors, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 22 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uOpacity: { value: 1 },
      uMorph: { value: 0 }, // 0 = galaxy, 1 = constellation
      uCollapse: { value: 0 }, // 0 = formed, 1 = gathered into the core
    },
    vertexShader: /* glsl */ `
      attribute float aScale;
      attribute vec3 aTarget;
      attribute vec3 aTargetColor;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uSize;
      uniform float uPixelRatio;
      uniform float uMorph;
      uniform float uCollapse;

      void main() {
        float m = smoothstep(0.0, 1.0, uMorph);
        vec3 p = mix(position, aTarget, m);

        // Arc + swirl mid-morph so particles travel rather than sliding.
        float arc = sin(m * 3.14159265);
        p.z += arc * 2.2 * (0.4 + aScale * 0.3);
        float ang = arc * 0.6;
        float cs = cos(ang);
        float sn = sin(ang);
        p.xy = mat2(cs, -sn, sn, cs) * p.xy;

        // Collapse toward a bright core for the finale.
        float col = uCollapse;
        p = mix(p, vec3(0.0), col * 0.9);

        vColor = mix(color, aTargetColor, m);
        vColor = mix(vColor, vec3(1.0), col * 0.7);

        float sizeBoost = 1.0 + col * 2.6;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * aScale * uPixelRatio * sizeBoost * (1.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      uniform float uOpacity;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float strength = pow(smoothstep(0.5, 0.0, d), 1.6);
        gl_FragColor = vec4(vColor, strength * uOpacity);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    object: points,
    material,
    update(t) {
      material.uniforms.uTime.value = t;
      // Slow the spin as the constellation forms so it stays readable.
      const morph = material.uniforms.uMorph.value;
      points.rotation.y = t * 0.06 * (1 - 0.85 * morph);
    },
    setOpacity(v) {
      material.uniforms.uOpacity.value = v;
    },
    setMorph(v) {
      material.uniforms.uMorph.value = Math.min(1, Math.max(0, v));
    },
    setCollapse(v) {
      material.uniforms.uCollapse.value = Math.min(1, Math.max(0, v));
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
