import * as THREE from 'three';

// A dark event-horizon sphere ringed by a glowing accretion disk of particles.
// Bloom (added in Cosmos.js) makes the disk and photon ring glow.
export function createBlackHole({ count = 14000, inner = 1.5, outer = 4.6 } = {}) {
  const group = new THREE.Group();

  // Event horizon — a pure black sphere that occludes stars behind it.
  const horizon = new THREE.Mesh(
    new THREE.SphereGeometry(inner * 0.92, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  group.add(horizon);

  // Photon ring — a thin bright halo just outside the horizon.
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(inner * 0.96, inner * 1.12, 96),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('#9ff7d9'),
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  group.add(ring);

  // Accretion disk — swirling particles on a tilted plane.
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const angles = new Float32Array(count);
  const radii = new Float32Array(count);

  const hot = new THREE.Color('#ffffff');
  const mint = new THREE.Color('#6ff3c7');
  const blue = new THREE.Color('#5aa0ff');

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = inner + Math.pow(Math.random(), 0.6) * (outer - inner);
    const a = Math.random() * Math.PI * 2;
    const thickness = (Math.random() - 0.5) * 0.18 * (r / outer);

    radii[i] = r;
    angles[i] = a;
    positions[i3] = Math.cos(a) * r;
    positions[i3 + 1] = thickness;
    positions[i3 + 2] = Math.sin(a) * r;

    const tnorm = (r - inner) / (outer - inner);
    const c = hot.clone().lerp(mint, Math.min(1, tnorm * 1.6));
    if (tnorm > 0.55) c.lerp(blue, (tnorm - 0.55) / 0.45);
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;

    scales[i] = 0.5 + Math.random() * 1.4;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
  geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aScale;
      attribute float aAngle;
      attribute float aRadius;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uSize;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        // Keplerian-ish: inner particles orbit faster.
        float speed = 0.9 / pow(aRadius, 1.3);
        float a = aAngle + uTime * speed * 6.0;
        vec3 pos = position;
        pos.x = cos(a) * aRadius;
        pos.z = sin(a) * aRadius;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
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
        float strength = pow(smoothstep(0.5, 0.0, d), 1.5);
        gl_FragColor = vec4(vColor, strength * uOpacity);
      }
    `,
  });

  const disk = new THREE.Points(geometry, material);
  disk.frustumCulled = false;
  group.add(disk);

  // Tilt the whole system so the disk reads as an ellipse.
  group.rotation.x = -0.9;
  group.rotation.z = 0.15;

  return {
    object: group,
    update(t) {
      material.uniforms.uTime.value = t;
    },
    setOpacity(v) {
      material.uniforms.uOpacity.value = v;
      ring.material.opacity = 0.9 * v;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      horizon.geometry.dispose();
      horizon.material.dispose();
      ring.geometry.dispose();
      ring.material.dispose();
    },
  };
}
