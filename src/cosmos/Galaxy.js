import * as THREE from 'three';

// A log-spiral galaxy of particles, colored on a mint -> cyan -> blue ramp.
// The hero centerpiece. Rotates slowly and can be scaled/faded via update().
export function createGalaxy({
  count = 22000,
  branches = 3,
  radius = 9,
  spin = 1.1,
  randomness = 0.42,
  randomPower = 2.6,
} = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  const inside = new THREE.Color('#9ff7d9'); // mint core
  const mid = new THREE.Color('#5fe6d8'); // cyan
  const outside = new THREE.Color('#3f6bd8'); // deep blue rim

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
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
    // brighten the core
    const coreBoost = 1.0 + Math.max(0, 0.6 - r / radius) * 1.4;
    colors[i3] = Math.min(1, mixed.r * coreBoost);
    colors[i3 + 1] = Math.min(1, mixed.g * coreBoost);
    colors[i3 + 2] = Math.min(1, mixed.b * coreBoost);

    scales[i] = 0.5 + Math.random() * 1.3;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
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
    },
    vertexShader: /* glsl */ `
      attribute float aScale;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uSize;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z);
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
      points.rotation.y = t * 0.06;
    },
    setOpacity(v) {
      material.uniforms.uOpacity.value = v;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
