import * as THREE from 'three';

// A deep, drifting starfield with a mint/blue/white color mix.
export function createStarfield({ count = 4200, radius = 60 } = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const palette = [
    new THREE.Color('#eaf6f1'),
    new THREE.Color('#9ff7d9'),
    new THREE.Color('#7cc7ff'),
    new THREE.Color('#6ff3c7'),
  ];

  for (let i = 0; i < count; i++) {
    // Distribute in a spherical shell so the camera is inside the field.
    const r = radius * (0.35 + Math.random() * 0.65);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = palette[(Math.random() * palette.length) | 0];
    const twinkle = 0.55 + Math.random() * 0.45;
    colors[i * 3] = c.r * twinkle;
    colors[i * 3 + 1] = c.g * twinkle;
    colors[i * 3 + 2] = c.b * twinkle;

    sizes[i] = Math.random() < 0.08 ? 2.4 : 0.6 + Math.random() * 1.1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: /* glsl */ `
      attribute float size;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float tw = 0.7 + 0.3 * sin(uTime * 1.5 + position.x * 3.0 + position.y);
        gl_PointSize = size * uPixelRatio * (140.0 / -mv.z) * tw;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, a);
      }
    `,
  });
  material.vertexColors = true;

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    object: points,
    update(t) {
      material.uniforms.uTime.value = t;
      points.rotation.y = t * 0.008;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
