# Guía Completa: Tartarus Prime - Planeta Volcánico Interactivo

## Visión del Proyecto

**Tartarus Prime** es un planeta volcánico de vapor donde islas flotantes emergen de un núcleo de magma incandescente. El vapor forma la atmósfera donde criaturas ancestrales nadan entre las nubes tóxicas. Civilizaciones han construido ciudades en las islas volcánicas y entre las montañas de obsidiana.

Este documento guía la creación de una experiencia 3D interactiva con control gestual que permite explorar cada detalle de este mundo.

---

## Tabla de Contenidos

1. [Anatomía del Planeta](#1-anatomía-del-planeta)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Sistema de Capas del Planeta](#4-sistema-de-capas-del-planeta)
5. [Núcleo de Magma](#5-núcleo-de-magma)
6. [Islas Volcánicas Flotantes](#6-islas-volcánicas-flotantes)
7. [Sistema de Vapor y Atmósfera](#7-sistema-de-vapor-y-atmósfera)
8. [Criaturas del Vapor](#8-criaturas-del-vapor)
9. [Ciudades y Estructuras](#9-ciudades-y-estructuras)
10. [Sistema de Iluminación](#10-sistema-de-iluminación)
11. [Control Gestual y Navegación](#11-control-gestual-y-navegación)
12. [Niveles de Detalle (LOD)](#12-niveles-de-detalle-lod)
13. [Optimización y Rendimiento](#13-optimización-y-rendimiento)
14. [Assets y Recursos](#14-assets-y-recursos)

---

## 1. Anatomía del Planeta

### 1.1 Estructura por Capas (de dentro hacia fuera)

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA 5: ESPACIO EXTERIOR                  │
│                    (Estrellas, partículas)                   │
├─────────────────────────────────────────────────────────────┤
│                    CAPA 4: ATMÓSFERA SUPERIOR               │
│                    (Vapor denso, criaturas voladoras)        │
├─────────────────────────────────────────────────────────────┤
│                    CAPA 3: ZONA HABITABLE                   │
│                    (Islas, ciudades, estructuras)            │
├─────────────────────────────────────────────────────────────┤
│                    CAPA 2: ATMÓSFERA INFERIOR               │
│                    (Vapor tóxico, ceniza, criaturas)         │
├─────────────────────────────────────────────────────────────┤
│                    CAPA 1: NÚCLEO DE MAGMA                  │
│                    (Lava, erupciones, grietas)               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Elementos Principales

| Elemento | Descripción | Prioridad Visual |
|----------|-------------|------------------|
| Núcleo de Magma | Esfera central con lava animada y erupciones | Alta |
| Volcanes | Montañas que emergen del núcleo, expulsan lava | Alta |
| Islas Flotantes | Plataformas rocosas suspendidas en el vapor | Alta |
| Ciudades | Estructuras steampunk en islas y montañas | Media-Alta |
| Vapor/Nubes | Capas volumétricas de gas tóxico | Media |
| Gusanos de Vapor | Criaturas que nadan en la atmósfera | Media |
| Estructuras Industriales | Fábricas, tuberías, maquinaria | Media |
| Puentes | Conexiones entre islas | Media |
| Partículas | Ceniza, chispas, brasas flotantes | Baja |

### 1.3 Paleta de Colores

```typescript
const TARTARUS_PALETTE = {
  // Núcleo y Magma
  magmaCore: 0xff4400,        // Naranja brillante central
  magmaHot: 0xff6600,         // Naranja caliente
  magmaCool: 0xcc3300,        // Rojo oscuro enfriándose
  lavaGlow: 0xffaa00,         // Resplandor amarillo

  // Roca y Tierra
  obsidian: 0x1a1a2e,         // Negro azulado
  volcanicRock: 0x2d2d3a,     // Gris oscuro
  ite: 0x3d3d4a,        // Gris medio
ite: 0x4a3728,        // Marrón quemado

  // Vapor y Atmósfera
  steamLight: 0x8b7355,       // Vapor iluminado
  steamDark: 0x4a4a4a,        // Vapor en sombra
  toxicGas: 0x556b2f,         // Gas tóxico verdoso
  ashCloud: 0x696969,         // Ceniza

  // Ciudades y Metal
  copper: 0xb87333,           // Cobre oxidado
  brass: 0xcd9b1d,            // Latón
  iron: 0x434343,             // Hierro
  rust: 0x8b4513,             // Óxido

  // Iluminación
  fireLight: 0xff6633,        // Luz de fuego
  ambientWarm: 0x4a2c2a,      // Ambiente cálido
  windowGlow: 0xffcc66,       // Luz de ventanas
};
```

---

## 2. Stack Tecnológico

### 2.1 Dependencias Principales

```json
{
  "dependencies": {
    "@angular/core": "^18.0.0",
    "@mediapipe/tasks-vision": "^0.10.14",
    "three": "^0.170.0",
    "simplex-noise": "^4.0.1"
  },
  "devDependencies": {
    "@types/three": "^0.170.0"
  }
}
```

### 2.2 Módulos de Three.js Necesarios

```typescript
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SimplexNoise } from 'simplex-noise';
```

---

## 3. Estructura del Proyecto

```
tartarus-prime/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── mediapipe.service.ts
│   │   │   │   └── audio.service.ts
│   │   │   └── utils/
│   │   │       ├── noise.utils.ts
│   │   │       ├── shader.utils.ts
│   │   │       └── geometry.utils.ts
│   │   ├── features/
│   │   │   └── tartarus/
│   │   │       ├── tartarus.component.ts
│   │   │       ├── tartarus.component.html
│   │   │       ├── tartarus.component.css
│   │   │       ├── systems/
│   │   │       │   ├── magma-core.system.ts
│   │   │       │   ├── volcanic-islands.system.ts
│   │   │       │   ├── atmosphere.system.ts
│   │   │       │   ├── creatures.system.ts
│   │   │       │   ├── cities.system.ts
│   │   │       │   └── particles.system.ts
│   │   │       ├── shaders/
│   │   │       │   ├── magma.shader.ts
│   │   │       │   ├── atmosphere.shader.ts
│   │   │       │   ├── glow.shader.ts
│   │   │       │   └── heat-distortion.shader.ts
│   │   │       └── models/
│   │   │           ├── planet.model.ts
│   │   │           ├── island.model.ts
│   │   │           ├── building.model.ts
│   │   │           └── creature.model.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── models/
│   │   │   ├── buildings/
│   │   │   ├── creatures/
│   │   │   └── props/
│   │   ├── textures/
│   │   │   ├── magma/
│   │   │   ├── rock/
│   │   │   ├── metal/
│   │   │   └── effects/
│   │   └── audio/
│   │       ├── ambient/
│   │       └── effects/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 4. Sistema de Capas del Planeta

### 4.1 Clase Principal del Planeta

```typescript
// src/app/features/tartarus/tartarus.component.ts

interface PlanetLayer {
  name: string;
  mesh: THREE.Object3D;
  update: (time: number, delta: number) => void;
  dispose: () => void;
}

interface TartarusConfig {
  coreRadius: number;          // Radio del núcleo de magma
  atmosphereRadius: number;    // Radio de la atmósfera
  islandCount: number;         // Número de islas flotantes
  volcanoCount: number;        // Número de volcanes
  creatureCount: number;       // Número de criaturas
  cityDensity: number;         // Densidad de edificios (0-1)
}

const DEFAULT_CONFIG: TartarusConfig = {
  coreRadius: 10,
  atmosphereRadius: 25,
  islandCount: 12,
  volcanoCount: 8,
  creatureCount: 15,
  cityDensity: 0.6,
};

export class TartarusPlanet {
  private layers: Map<string, PlanetLayer> = new Map();
  private group: THREE.Group;
  private config: TartarusConfig;

  constructor(config: Partial<TartarusConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.group = new THREE.Group();
    this.initializeLayers();
  }

  private initializeLayers(): void {
    // Orden de renderizado importa (de dentro hacia fuera)
    this.addLayer('magmaCore', new MagmaCoreSystem(this.config));
    this.addLayer('volcanoes', new VolcanoSystem(this.config));
    this.addLayer('islands', new IslandSystem(this.config));
    this.addLayer('cities', new CitySystem(this.config));
    this.addLayer('lowerAtmosphere', new LowerAtmosphereSystem(this.config));
    this.addLayer('creatures', new CreatureSystem(this.config));
    this.addLayer('upperAtmosphere', new UpperAtmosphereSystem(this.config));
    this.addLayer('particles', new ParticleSystem(this.config));
  }

  private addLayer(name: string, system: PlanetLayer): void {
    this.layers.set(name, system);
    this.group.add(system.mesh);
  }

  update(time: number, delta: number): void {
    this.layers.forEach(layer => layer.update(time, delta));
  }

  getObject(): THREE.Group {
    return this.group;
  }

  dispose(): void {
    this.layers.forEach(layer => layer.dispose());
    this.layers.clear();
  }
}
```

---

## 5. Núcleo de Magma

### 5.1 Shader de Magma Animado

El núcleo debe verse como lava viva, con movimiento fluido y puntos calientes.

```typescript
// src/app/features/tartarus/shaders/magma.shader.ts

export const MagmaShader = {
  uniforms: {
    time: { value: 0 },
    baseColor: { value: new THREE.Color(0xff4400) },
    hotColor: { value: new THREE.Color(0xffff00) },
    coolColor: { value: new THREE.Color(0x330000) },
    noiseScale: { value: 3.0 },
    flowSpeed: { value: 0.5 },
    hotspotIntensity: { value: 1.5 },
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform float time;
    uniform float noiseScale;

    // Simplex noise functions aquí...

    void main() {
      vUv = uv;
      vNormal = normal;
      vPosition = position;

      // Deformar superficie para simular burbujas de lava
      vec3 pos = position;
      float noise = snoise(pos * noiseScale + time * 0.1);
      pos += normal * noise * 0.3;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec3 baseColor;
    uniform vec3 hotColor;
    uniform vec3 coolColor;
    uniform float flowSpeed;
    uniform float hotspotIntensity;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Funciones de ruido Simplex 3D
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      // Coordenadas 3D para el ruido
      vec3 noiseCoord = vPosition * 2.0 + vec3(0.0, 0.0, time * flowSpeed);

      // Múltiples capas de ruido para turbulencia
      float noise1 = snoise(noiseCoord) * 0.5 + 0.5;
      float noise2 = snoise(noiseCoord * 2.0) * 0.25 + 0.25;
      float noise3 = snoise(noiseCoord * 4.0) * 0.125 + 0.125;

      float combinedNoise = noise1 + noise2 + noise3;
      combinedNoise = clamp(combinedNoise, 0.0, 1.0);

      // Puntos calientes que se mueven
      float hotspot = snoise(vPosition * 1.5 + vec3(time * 0.2, 0.0, 0.0));
      hotspot = pow(max(hotspot, 0.0), 2.0) * hotspotIntensity;

      // Mezclar colores basado en "temperatura"
      vec3 color = mix(coolColor, baseColor, combinedNoise);
      color = mix(color, hotColor, hotspot);

      // Agregar brillo en áreas calientes
      float glow = hotspot * 0.5 + combinedNoise * 0.3;
      color += vec3(glow * 0.5, glow * 0.2, 0.0);

      // Fresnel para bordes brillantes
      float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);
      color += hotColor * fresnel * 0.3;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};
```

### 5.2 Sistema del Núcleo de Magma

```typescript
// src/app/features/tartarus/systems/magma-core.system.ts

export class MagmaCoreSystem implements PlanetLayer {
  name = 'magmaCore';
  mesh: THREE.Group;

  private coreMesh: THREE.Mesh;
  private glowMeshes: THREE.Mesh[] = [];
  private material: THREE.ShaderMaterial;
  private eruptionParticles: THREE.Points;

  constructor(private config: TartarusConfig) {
    this.mesh = new THREE.Group();
    this.createCore();
    this.createGlowLayers();
    this.createEruptionSystem();
  }

  private createCore(): void {
    const geometry = new THREE.IcosahedronGeometry(this.config.coreRadius, 64);

    this.material = new THREE.ShaderMaterial({
      uniforms: { ...MagmaShader.uniforms },
      vertexShader: MagmaShader.vertexShader,
      fragmentShader: MagmaShader.fragmentShader,
    });

    this.coreMesh = new THREE.Mesh(geometry, this.material);
    this.mesh.add(this.coreMesh);
  }

  private createGlowLayers(): void {
    // Múltiples capas de glow para efecto de calor
    const glowConfigs = [
      { radius: this.config.coreRadius * 1.05, color: 0xff6600, opacity: 0.4 },
      { radius: this.config.coreRadius * 1.15, color: 0xff4400, opacity: 0.2 },
      { radius: this.config.coreRadius * 1.3, color: 0xff2200, opacity: 0.1 },
      { radius: this.config.coreRadius * 1.5, color: 0x880000, opacity: 0.05 },
    ];

    glowConfigs.forEach(config => {
      const geometry = new THREE.SphereGeometry(config.radius, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: config.opacity,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const glowMesh = new THREE.Mesh(geometry, material);
      this.glowMeshes.push(glowMesh);
      this.mesh.add(glowMesh);
    });
  }

  private createEruptionSystem(): void {
    // Sistema de partículas para erupciones de lava
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      this.resetParticle(i, positions, velocities, lifetimes);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const material = new THREE.PointsMaterial({
      color: 0xff6600,
      size: 0.3,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.eruptionParticles = new THREE.Points(geometry, material);
    this.mesh.add(this.eruptionParticles);
  }

  private resetParticle(
    index: number,
    positions: Float32Array,
    velocities: Float32Array,
    lifetimes: Float32Array
  ): void {
    const i3 = index * 3;

    // Posición inicial en la superficie del núcleo
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = this.config.coreRadius;

    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    // Velocidad hacia afuera
    const speed = 0.5 + Math.random() * 1.5;
    velocities[i3] = positions[i3] / r * speed;
    velocities[i3 + 1] = positions[i3 + 1] / r * speed;
    velocities[i3 + 2] = positions[i3 + 2] / r * speed;

    lifetimes[index] = Math.random();
  }

  update(time: number, delta: number): void {
    // Actualizar shader del núcleo
    this.material.uniforms['time'].value = time;

    // Pulsar glow
    const pulse = 1 + Math.sin(time * 2) * 0.05;
    this.glowMeshes.forEach((glow, i) => {
      glow.scale.setScalar(pulse * (1 + i * 0.01));
    });

    // Actualizar partículas de erupción
    this.updateEruptionParticles(delta);
  }

  private updateEruptionParticles(delta: number): void {
    const positions = this.eruptionParticles.geometry.attributes['position'].array as Float32Array;
    const velocities = this.eruptionParticles.geometry.attributes['velocity'].array as Float32Array;
    const lifetimes = this.eruptionParticles.geometry.attributes['lifetime'].array as Float32Array;

    for (let i = 0; i < lifetimes.length; i++) {
      lifetimes[i] -= delta * 0.5;

      if (lifetimes[i] <= 0) {
        this.resetParticle(i, positions, velocities, lifetimes);
      } else {
        const i3 = i * 3;
        positions[i3] += velocities[i3] * delta;
        positions[i3 + 1] += velocities[i3 + 1] * delta;
        positions[i3 + 2] += velocities[i3 + 2] * delta;

        // Gravedad hacia el núcleo (leve)
        const dist = Math.sqrt(
          positions[i3] ** 2 +
          positions[i3 + 1] ** 2 +
          positions[i3 + 2] ** 2
        );
        const gravity = 0.1;
        velocities[i3] -= (positions[i3] / dist) * gravity * delta;
        velocities[i3 + 1] -= (positions[i3 + 1] / dist) * gravity * delta;
        velocities[i3 + 2] -= (positions[i3 + 2] / dist) * gravity * delta;
      }
    }

    this.eruptionParticles.geometry.attributes['position'].needsUpdate = true;
    this.eruptionParticles.geometry.attributes['lifetime'].needsUpdate = true;
  }

  dispose(): void {
    this.coreMesh.geometry.dispose();
    (this.coreMesh.material as THREE.Material).dispose();
    this.glowMeshes.forEach(m => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    this.eruptionParticles.geometry.dispose();
    (this.eruptionParticles.material as THREE.Material).dispose();
  }
}
```

---

## 6. Islas Volcánicas Flotantes

### 6.1 Generación Procedural de Islas

```typescript
// src/app/features/tartarus/systems/volcanic-islands.system.ts

interface IslandConfig {
  position: THREE.Vector3;
  radius: number;
  height: number;
  hasVolcano: boolean;
  hasCity: boolean;
  rotationSpeed: number;
}

export class IslandSystem implements PlanetLayer {
  name = 'islands';
  mesh: THREE.Group;

  private islands: Island[] = [];
  private noise: SimplexNoise;

  constructor(private config: TartarusConfig) {
    this.mesh = new THREE.Group();
    this.noise = new SimplexNoise();
    this.generateIslands();
  }

  private generateIslands(): void {
    const { islandCount, coreRadius, atmosphereRadius } = this.config;

    // Distribuir islas en órbitas alrededor del núcleo
    for (let i = 0; i < islandCount; i++) {
      const orbitRadius = coreRadius * 1.5 + Math.random() * (atmosphereRadius - coreRadius * 1.5) * 0.6;
      const angle = (i / islandCount) * Math.PI * 2 + Math.random() * 0.5;
      const verticalOffset = (Math.random() - 0.5) * 5;

      const islandConfig: IslandConfig = {
        position: new THREE.Vector3(
          Math.cos(angle) * orbitRadius,
          verticalOffset,
          Math.sin(angle) * orbitRadius
        ),
        radius: 1 + Math.random() * 3,
        height: 0.5 + Math.random() * 2,
        hasVolcano: Math.random() > 0.6,
        hasCity: Math.random() > 0.4,
        rotationSpeed: 0.0001 + Math.random() * 0.0003,
      };

      const island = new Island(islandConfig, this.noise);
      this.islands.push(island);
      this.mesh.add(island.getObject());
    }
  }

  update(time: number, delta: number): void {
    this.islands.forEach(island => island.update(time, delta));
  }

  dispose(): void {
    this.islands.forEach(island => island.dispose());
  }
}

class Island {
  private group: THREE.Group;
  private baseMesh: THREE.Mesh;
  private volcanoMesh?: THREE.Mesh;
  private lavaMaterial?: THREE.ShaderMaterial;
  private config: IslandConfig;

  constructor(config: IslandConfig, noise: SimplexNoise) {
    this.config = config;
    this.group = new THREE.Group();
    this.group.position.copy(config.position);

    this.createBase(noise);

    if (config.hasVolcano) {
      this.createVolcano();
    }
  }

  private createBase(noise: SimplexNoise): void {
    // Geometría personalizada para isla con forma irregular
    const segments = 32;
    const geometry = new THREE.CylinderGeometry(
      this.config.radius * 0.8,  // top
      this.config.radius * 1.2,  // bottom
      this.config.height,
      segments,
      8,
      false
    );

    // Deformar vértices para aspecto natural
    const positions = geometry.attributes['position'].array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Usar noise para deformación
      const noiseVal = noise.noise3D(x * 0.5, y * 0.5, z * 0.5);
      const deform = noiseVal * 0.3;

      positions[i] *= 1 + deform;
      positions[i + 2] *= 1 + deform;

      // Parte inferior más irregular (raíces de roca)
      if (y < 0) {
        const rootNoise = noise.noise3D(x, y * 2, z);
        positions[i + 1] += rootNoise * 0.5;
      }
    }

    geometry.computeVertexNormals();

    // Material de roca volcánica
    const material = new THREE.MeshStandardMaterial({
      color: 0x2d2d3a,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
      emissive: 0x1a0a00,
      emissiveIntensity: 0.1,
    });

    this.baseMesh = new THREE.Mesh(geometry, material);
    this.group.add(this.baseMesh);

    // Agregar grietas de lava en la base
    this.addLavaCracks();
  }

  private addLavaCracks(): void {
    // Líneas brillantes simulando lava en grietas
    const crackCount = 5 + Math.floor(Math.random() * 5);

    for (let i = 0; i < crackCount; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(
          (Math.random() - 0.5) * this.config.radius,
          -this.config.height * 0.3,
          (Math.random() - 0.5) * this.config.radius
        ),
        new THREE.Vector3(
          (Math.random() - 0.5) * this.config.radius * 0.5,
          -this.config.height * 0.1,
          (Math.random() - 0.5) * this.config.radius * 0.5
        ),
      ]);

      const tubeGeometry = new THREE.TubeGeometry(curve, 8, 0.05, 4, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.8,
      });

      const crack = new THREE.Mesh(tubeGeometry, tubeMaterial);
      this.group.add(crack);
    }
  }

  private createVolcano(): void {
    // Cono volcánico en la parte superior
    const volcanoGeometry = new THREE.ConeGeometry(
      this.config.radius * 0.6,
      this.config.height * 1.5,
      16,
      8,
      true
    );

    // Crear cráter abriendo la punta
    const positions = volcanoGeometry.attributes['position'].array;
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      if (y > this.config.height * 0.6) {
        // Abrir cráter
        const factor = 0.3 + (y / (this.config.height * 1.5)) * 0.5;
        positions[i] *= factor;
        positions[i + 2] *= factor;
      }
    }

    volcanoGeometry.computeVertexNormals();

    const volcanoMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.95,
      metalness: 0.05,
      emissive: 0x330000,
      emissiveIntensity: 0.2,
    });

    this.volcanoMesh = new THREE.Mesh(volcanoGeometry, volcanoMaterial);
    this.volcanoMesh.position.y = this.config.height * 0.5;
    this.group.add(this.volcanoMesh);

    // Lava en el cráter
    this.addCraterLava();
  }

  private addCraterLava(): void {
    const lavaGeometry = new THREE.CircleGeometry(this.config.radius * 0.2, 16);

    this.lavaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0xff4400) },
        color2: { value: new THREE.Color(0xffff00) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;

        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          float pulse = sin(time * 3.0 + dist * 10.0) * 0.5 + 0.5;
          vec3 color = mix(color1, color2, pulse);
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const lavaMesh = new THREE.Mesh(lavaGeometry, this.lavaMaterial);
    lavaMesh.rotation.x = -Math.PI / 2;
    lavaMesh.position.y = this.config.height * 1.1;
    this.group.add(lavaMesh);
  }

  update(time: number, delta: number): void {
    // Rotación lenta de la isla
    this.group.rotation.y += this.config.rotationSpeed;

    // Flotar suavemente
    this.group.position.y = this.config.position.y + Math.sin(time + this.config.position.x) * 0.1;

    // Actualizar lava del cráter
    if (this.lavaMaterial) {
      this.lavaMaterial.uniforms['time'].value = time;
    }
  }

  getObject(): THREE.Group {
    return this.group;
  }

  dispose(): void {
    this.baseMesh.geometry.dispose();
    (this.baseMesh.material as THREE.Material).dispose();
    if (this.volcanoMesh) {
      this.volcanoMesh.geometry.dispose();
      (this.volcanoMesh.material as THREE.Material).dispose();
    }
  }
}
```

---

## 7. Sistema de Vapor y Atmósfera

### 7.1 Shader de Nubes Volumétricas

```typescript
// src/app/features/tartarus/shaders/atmosphere.shader.ts

export const AtmosphereShader = {
  uniforms: {
    time: { value: 0 },
    density: { value: 0.5 },
    color: { value: new THREE.Color(0x8b7355) },
    colorToxic: { value: new THREE.Color(0x556b2f) },
    corePosition: { value: new THREE.Vector3(0, 0, 0) },
    coreRadius: { value: 10 },
  },

  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform float density;
    uniform vec3 color;
    uniform vec3 colorToxic;
    uniform vec3 corePosition;
    uniform float coreRadius;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    // Noise functions...

    void main() {
      // Distancia al núcleo
      float distToCore = length(vWorldPosition - corePosition);
      float normalizedDist = (distToCore - coreRadius) / (coreRadius * 1.5);

      // Generar patrón de nubes con noise
      vec3 noiseCoord = vWorldPosition * 0.1 + vec3(time * 0.02, 0.0, time * 0.01);
      float cloudNoise = fbm(noiseCoord);

      // Mezclar colores según altura y toxicidad
      float toxicMix = sin(vWorldPosition.y * 0.5 + time) * 0.5 + 0.5;
      vec3 finalColor = mix(color, colorToxic, toxicMix * 0.3);

      // Iluminación desde el núcleo
      float coreGlow = 1.0 / (1.0 + distToCore * 0.1);
      finalColor += vec3(1.0, 0.5, 0.2) * coreGlow * 0.3;

      // Opacidad basada en densidad y ruido
      float alpha = cloudNoise * density * (1.0 - normalizedDist * 0.5);
      alpha = clamp(alpha, 0.0, 0.6);

      // Fresnel para bordes
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      alpha *= 1.0 - fresnel * 0.5;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};
```

### 7.2 Sistema de Capas de Vapor

```typescript
// src/app/features/tartarus/systems/atmosphere.system.ts

export class LowerAtmosphereSystem implements PlanetLayer {
  name = 'lowerAtmosphere';
  mesh: THREE.Group;

  private steamLayers: THREE.Mesh[] = [];
  private ashParticles: THREE.Points;

  constructor(private config: TartarusConfig) {
    this.mesh = new THREE.Group();
    this.createSteamLayers();
    this.createAshParticles();
  }

  private createSteamLayers(): void {
    const { coreRadius } = this.config;

    // Múltiples capas de vapor a diferentes alturas
    const layerConfigs = [
      { radius: coreRadius * 1.3, opacity: 0.15, color: 0x8b7355, height: 0 },
      { radius: coreRadius * 1.5, opacity: 0.1, color: 0x6b5344, height: 2 },
      { radius: coreRadius * 1.7, opacity: 0.08, color: 0x556b2f, height: -2 },
    ];

    layerConfigs.forEach((layerConfig, index) => {
      // Crear textura de ruido procedural
      const texture = this.createNoiseTexture();

      const geometry = new THREE.SphereGeometry(layerConfig.radius, 64, 64);
      const material = new THREE.MeshBasicMaterial({
        color: layerConfig.color,
        transparent: true,
        opacity: layerConfig.opacity,
        map: texture,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });

      const steamMesh = new THREE.Mesh(geometry, material);
      steamMesh.position.y = layerConfig.height;

      // Rotaciones diferentes para cada capa
      steamMesh.userData = {
        rotationSpeed: 0.0001 * (index + 1) * (index % 2 ? 1 : -1),
        textureOffset: { x: 0, y: 0 },
      };

      this.steamLayers.push(steamMesh);
      this.mesh.add(steamMesh);
    });
  }

  private createNoiseTexture(): THREE.Texture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Generar patrón de nubes
    const imageData = ctx.createImageData(size, size);
    const noise = new SimplexNoise();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = x / size;
        const ny = y / size;

        let value = 0;
        value += noise.noise2D(nx * 4, ny * 4) * 0.5;
        value += noise.noise2D(nx * 8, ny * 8) * 0.25;
        value += noise.noise2D(nx * 16, ny * 16) * 0.125;

        value = (value + 1) / 2; // Normalizar a 0-1

        const i = (y * size + x) * 4;
        imageData.data[i] = 255;
        imageData.data[i + 1] = 255;
        imageData.data[i + 2] = 255;
        imageData.data[i + 3] = value * 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return texture;
  }

  private createAshParticles(): void {
    const particleCount = 3000;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = this.config.coreRadius * (1.2 + Math.random() * 0.8);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 0.05 + Math.random() * 0.15;
      opacities[i] = 0.3 + Math.random() * 0.7;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    // Shader para partículas de ceniza con tamaños variables
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x444444) },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        uniform float time;

        void main() {
          vOpacity = opacity;
          vec3 pos = position;

          // Movimiento de deriva
          pos.x += sin(time * 0.5 + position.y) * 0.1;
          pos.z += cos(time * 0.3 + position.x) * 0.1;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vOpacity;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float alpha = (1.0 - dist * 2.0) * vOpacity * 0.5;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.ashParticles = new THREE.Points(geometry, material);
    this.mesh.add(this.ashParticles);
  }

  update(time: number, delta: number): void {
    // Rotar capas de vapor
    this.steamLayers.forEach(layer => {
      layer.rotation.y += layer.userData.rotationSpeed;

      // Animar textura
      if (layer.material instanceof THREE.MeshBasicMaterial && layer.material.map) {
        layer.material.map.offset.x += 0.0001;
        layer.material.map.offset.y += 0.00005;
      }
    });

    // Actualizar partículas de ceniza
    const ashMaterial = this.ashParticles.material as THREE.ShaderMaterial;
    ashMaterial.uniforms['time'].value = time;
  }

  dispose(): void {
    this.steamLayers.forEach(layer => {
      layer.geometry.dispose();
      (layer.material as THREE.Material).dispose();
    });
    this.ashParticles.geometry.dispose();
    (this.ashParticles.material as THREE.Material).dispose();
  }
}
```

---

## 8. Criaturas del Vapor

### 8.1 Sistema de Gusanos de Vapor

```typescript
// src/app/features/tartarus/systems/creatures.system.ts

interface WormSegment {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
}

class SteamWorm {
  private segments: THREE.Mesh[] = [];
  private segmentData: WormSegment[] = [];
  private group: THREE.Group;
  private path: THREE.CatmullRomCurve3;
  private pathProgress: number = 0;
  private speed: number;
  private segmentCount: number = 20;

  constructor(
    private orbitRadius: number,
    private verticalRange: number
  ) {
    this.group = new THREE.Group();
    this.speed = 0.0002 + Math.random() * 0.0003;
    this.generatePath();
    this.createSegments();
  }

  private generatePath(): void {
    // Crear una ruta orgánica alrededor del planeta
    const points: THREE.Vector3[] = [];
    const segments = 20;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2;

      // Variación en la órbita
      const radiusVar = this.orbitRadius + Math.sin(angle * 3) * 2;
      const heightVar = Math.sin(angle * 2) * this.verticalRange;

      points.push(new THREE.Vector3(
        Math.cos(angle) * radiusVar,
        heightVar,
        Math.sin(angle) * radiusVar
      ));
    }

    this.path = new THREE.CatmullRomCurve3(points, true);
  }

  private createSegments(): void {
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const bodyGeometry = new THREE.SphereGeometry(0.35, 12, 12);
    const tailGeometry = new THREE.SphereGeometry(0.2, 8, 8);

    const material = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.7,
      metalness: 0.2,
      emissive: 0x332211,
      emissiveIntensity: 0.3,
    });

    // Cabeza con ojos
    const head = new THREE.Mesh(headGeometry, material);
    this.addEyes(head);
    this.segments.push(head);
    this.group.add(head);

    // Cuerpo
    for (let i = 1; i < this.segmentCount - 1; i++) {
      const scale = 1 - (i / this.segmentCount) * 0.5;
      const segment = new THREE.Mesh(bodyGeometry, material.clone());
      segment.scale.setScalar(scale);
      this.segments.push(segment);
      this.group.add(segment);
    }

    // Cola
    const tail = new THREE.Mesh(tailGeometry, material);
    tail.scale.setScalar(0.5);
    this.segments.push(tail);
    this.group.add(tail);

    // Inicializar datos de segmentos
    for (let i = 0; i < this.segmentCount; i++) {
      this.segmentData.push({
        position: new THREE.Vector3(),
        rotation: new THREE.Quaternion(),
      });
    }
  }

  private addEyes(head: THREE.Mesh): void {
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      emissive: 0xff4400,
    });
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    [-1, 1].forEach(side => {
      const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye.position.set(side * 0.2, 0.15, 0.3);
      head.add(eye);

      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 6, 6),
        pupilMaterial
      );
      pupil.position.z = 0.05;
      eye.add(pupil);
    });
  }

  update(time: number, delta: number): void {
    this.pathProgress += this.speed;
    if (this.pathProgress > 1) this.pathProgress -= 1;

    // Posicionar cada segmento a lo largo del path con delay
    for (let i = 0; i < this.segmentCount; i++) {
      const segmentProgress = (this.pathProgress - i * 0.02 + 1) % 1;
      const position = this.path.getPointAt(segmentProgress);
      const tangent = this.path.getTangentAt(segmentProgress);

      // Agregar ondulación
      const wave = Math.sin(time * 3 + i * 0.5) * 0.2;
      position.y += wave;

      this.segments[i].position.copy(position);
      this.segments[i].lookAt(position.clone().add(tangent));
    }
  }

  getObject(): THREE.Group {
    return this.group;
  }

  dispose(): void {
    this.segments.forEach(segment => {
      segment.geometry.dispose();
      (segment.material as THREE.Material).dispose();
    });
  }
}

export class CreatureSystem implements PlanetLayer {
  name = 'creatures';
  mesh: THREE.Group;

  private worms: SteamWorm[] = [];

  constructor(private config: TartarusConfig) {
    this.mesh = new THREE.Group();
    this.createWorms();
  }

  private createWorms(): void {
    const { creatureCount, coreRadius, atmosphereRadius } = this.config;

    for (let i = 0; i < creatureCount; i++) {
      const orbitRadius = coreRadius * 1.4 + Math.random() * (atmosphereRadius - coreRadius * 1.4) * 0.5;
      const verticalRange = 2 + Math.random() * 4;

      const worm = new SteamWorm(orbitRadius, verticalRange);
      this.worms.push(worm);
      this.mesh.add(worm.getObject());
    }
  }

  update(time: number, delta: number): void {
    this.worms.forEach(worm => worm.update(time, delta));
  }

  dispose(): void {
    this.worms.forEach(worm => worm.dispose());
  }
}
```

---

## 9. Ciudades y Estructuras

### 9.1 Generador de Edificios Steampunk

```typescript
// src/app/features/tartarus/systems/cities.system.ts

interface BuildingConfig {
  type: 'tower' | 'factory' | 'dome' | 'bridge' | 'chimney';
  position: THREE.Vector3;
  scale: number;
  rotation: number;
}

class SteampunkBuilding {
  private group: THREE.Group;
  private lights: THREE.PointLight[] = [];
  private smokeSystems: THREE.Points[] = [];

  constructor(private config: BuildingConfig) {
    this.group = new THREE.Group();
    this.group.position.copy(config.position);
    this.group.rotation.y = config.rotation;
    this.group.scale.setScalar(config.scale);

    this.build();
  }

  private build(): void {
    switch (this.config.type) {
      case 'tower':
        this.buildTower();
        break;
      case 'factory':
        this.buildFactory();
        break;
      case 'dome':
        this.buildDome();
        break;
      case 'chimney':
        this.buildChimney();
        break;
    }
  }

  private buildTower(): void {
    // Base de la torre
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x434343,
      roughness: 0.8,
      metalness: 0.3,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.5;
    this.group.add(base);

    // Secciones de la torre
    for (let i = 0; i < 3; i++) {
      const sectionGeometry = new THREE.CylinderGeometry(
        0.25 - i * 0.05,
        0.3 - i * 0.05,
        0.6,
        8
      );
      const section = new THREE.Mesh(sectionGeometry, baseMaterial);
      section.position.y = 1.3 + i * 0.6;
      this.group.add(section);

      // Balcón/plataforma
      const platformGeometry = new THREE.CylinderGeometry(0.35 - i * 0.05, 0.35 - i * 0.05, 0.05, 8);
      const platform = new THREE.Mesh(platformGeometry, baseMaterial);
      platform.position.y = 1.0 + i * 0.6;
      this.group.add(platform);
    }

    // Cúpula en la cima
    const domeGeometry = new THREE.SphereGeometry(0.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      roughness: 0.4,
      metalness: 0.6,
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 3.1;
    this.group.add(dome);

    // Ventanas iluminadas
    this.addWindows(base, 4, 0.5);

    // Luz en la cima
    const light = new THREE.PointLight(0xffcc66, 0.5, 3);
    light.position.y = 3.2;
    this.group.add(light);
    this.lights.push(light);
  }

  private buildFactory(): void {
    // Edificio principal
    const mainGeometry = new THREE.BoxGeometry(1, 0.8, 0.6);
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d3d4a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const main = new THREE.Mesh(mainGeometry, mainMaterial);
    main.position.y = 0.4;
    this.group.add(main);

    // Techo a dos aguas
    const roofGeometry = new THREE.ConeGeometry(0.7, 0.4, 4);
    roofGeometry.rotateY(Math.PI / 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.0;
    roof.scale.set(1, 1, 0.5);
    this.group.add(roof);

    // Chimeneas
    for (let i = 0; i < 2; i++) {
      const chimney = this.createChimney();
      chimney.position.set((i - 0.5) * 0.4, 0.8, -0.2);
      chimney.scale.setScalar(0.5);
      this.group.add(chimney);
    }

    // Ventanas
    this.addWindows(main, 3, 0.4);

    // Engranajes decorativos
    this.addGears();
  }

  private buildDome(): void {
    // Base circular
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x434343,
      roughness: 0.7,
      metalness: 0.3,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.15;
    this.group.add(base);

    // Cúpula de vidrio
    const domeGeometry = new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.8,
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0.3;
    this.group.add(dome);

    // Marco de la cúpula
    const frameGeometry = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xcd9b1d,
      roughness: 0.4,
      metalness: 0.8,
    });

    for (let i = 0; i < 4; i++) {
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.rotation.x = Math.PI / 2;
      frame.rotation.z = (i / 4) * Math.PI;
      frame.position.y = 0.3;
      this.group.add(frame);
    }

    // Luz interior
    const light = new THREE.PointLight(0xffcc66, 0.8, 2);
    light.position.y = 0.5;
    this.group.add(light);
    this.lights.push(light);
  }

  private buildChimney(): void {
    const chimney = this.createChimney();
    this.group.add(chimney);
  }

  private createChimney(): THREE.Group {
    const chimneyGroup = new THREE.Group();

    // Tubo principal
    const tubeGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x434343,
      roughness: 0.9,
      metalness: 0.2,
    });
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tube.position.y = 0.75;
    chimneyGroup.add(tube);

    // Anillos decorativos
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(0.18, 0.03, 8, 16);
      const ring = new THREE.Mesh(ringGeometry, tubeMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.3 + i * 0.5;
      chimneyGroup.add(ring);
    }

    // Corona en la cima
    const crownGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.1, 8);
    const crown = new THREE.Mesh(crownGeometry, tubeMaterial);
    crown.position.y = 1.55;
    chimneyGroup.add(crown);

    // Sistema de humo
    const smoke = this.createSmokeSystem();
    smoke.position.y = 1.6;
    chimneyGroup.add(smoke);
    this.smokeSystems.push(smoke);

    return chimneyGroup;
  }

  private createSmokeSystem(): THREE.Points {
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      lifetimes[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const material = new THREE.PointsMaterial({
      color: 0x666666,
      size: 0.15,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });

    return new THREE.Points(geometry, material);
  }

  private addWindows(building: THREE.Mesh, count: number, yPos: number): void {
    const windowGeometry = new THREE.PlaneGeometry(0.08, 0.12);
    const windowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc66,
      transparent: true,
      opacity: 0.9,
    });

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const window = new THREE.Mesh(windowGeometry, windowMaterial);

      window.position.set(
        Math.cos(angle) * 0.31,
        yPos,
        Math.sin(angle) * 0.31
      );
      window.lookAt(0, yPos, 0);
      window.rotateY(Math.PI);

      this.group.add(window);
    }
  }

  private addGears(): void {
    const gearGeometry = new THREE.TorusGeometry(0.15, 0.02, 8, 12);
    const gearMaterial = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      roughness: 0.5,
      metalness: 0.7,
    });

    const gear = new THREE.Mesh(gearGeometry, gearMaterial);
    gear.position.set(0.51, 0.3, 0);
    gear.rotation.y = Math.PI / 2;
    this.group.add(gear);

    // Almacenar referencia para animación
    this.group.userData.gears = [gear];
  }

  update(time: number, delta: number): void {
    // Parpadeo de luces
    this.lights.forEach((light, i) => {
      light.intensity = 0.5 + Math.sin(time * 2 + i) * 0.2;
    });

    // Animar humo
    this.smokeSystems.forEach(smoke => {
      const positions = smoke.geometry.attributes['position'].array as Float32Array;
      const lifetimes = smoke.geometry.attributes['lifetime'].array as Float32Array;

      for (let i = 0; i < lifetimes.length; i++) {
        lifetimes[i] -= delta * 0.3;

        if (lifetimes[i] <= 0) {
          // Reiniciar partícula
          positions[i * 3] = (Math.random() - 0.5) * 0.1;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
          lifetimes[i] = 1;
        } else {
          // Subir y expandir
          positions[i * 3 + 1] += delta * 0.5;
          positions[i * 3] += (Math.random() - 0.5) * delta * 0.1;
          positions[i * 3 + 2] += (Math.random() - 0.5) * delta * 0.1;
        }
      }

      smoke.geometry.attributes['position'].needsUpdate = true;
      smoke.geometry.attributes['lifetime'].needsUpdate = true;
    });

    // Rotar engranajes
    const gears = this.group.userData.gears as THREE.Mesh[] | undefined;
    if (gears) {
      gears.forEach(gear => {
        gear.rotation.z += delta * 0.5;
      });
    }
  }

  getObject(): THREE.Group {
    return this.group;
  }

  dispose(): void {
    this.group.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}

export class CitySystem implements PlanetLayer {
  name = 'cities';
  mesh: THREE.Group;

  private buildings: SteampunkBuilding[] = [];

  constructor(private config: TartarusConfig) {
    this.mesh = new THREE.Group();
    // Las ciudades se agregan a las islas, no directamente aquí
    // Este sistema coordina y actualiza todos los edificios
  }

  addBuildingToIsland(
    islandPosition: THREE.Vector3,
    islandRadius: number,
    surfaceNormal: THREE.Vector3
  ): void {
    const buildingTypes: BuildingConfig['type'][] = ['tower', 'factory', 'dome', 'chimney'];
    const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];

    // Posición en la superficie de la isla
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * islandRadius * 0.8,
      0,
      (Math.random() - 0.5) * islandRadius * 0.8
    );

    const config: BuildingConfig = {
      type,
      position: islandPosition.clone().add(offset),
      scale: 0.3 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI * 2,
    };

    const building = new SteampunkBuilding(config);
    this.buildings.push(building);
    this.mesh.add(building.getObject());
  }

  update(time: number, delta: number): void {
    this.buildings.forEach(building => building.update(time, delta));
  }

  dispose(): void {
    this.buildings.forEach(building => building.dispose());
  }
}
```

---

## 10. Sistema de Iluminación

### 10.1 Configuración de Luces Principal

```typescript
// src/app/features/tartarus/systems/lighting.system.ts

export class LightingSystem {
  private lights: THREE.Light[] = [];
  private coreLight: THREE.PointLight;
  private fillLights: THREE.PointLight[] = [];
  private ambientLight: THREE.AmbientLight;
  private hemiLight: THREE.HemisphereLight;

  constructor(private scene: THREE.Scene, coreRadius: number) {
    this.setupCoreLighting(coreRadius);
    this.setupAmbientLighting();
    this.setupFillLights(coreRadius);
  }

  private setupCoreLighting(coreRadius: number): void {
    // Luz principal del núcleo de magma
    this.coreLight = new THREE.PointLight(0xff4400, 3, coreRadius * 5);
    this.coreLight.position.set(0, 0, 0);
    this.coreLight.castShadow = false; // Sombras opcionales para rendimiento
    this.scene.add(this.coreLight);
    this.lights.push(this.coreLight);

    // Luz secundaria más cálida
    const warmLight = new THREE.PointLight(0xffaa00, 1.5, coreRadius * 4);
    warmLight.position.set(0, 2, 0);
    this.scene.add(warmLight);
    this.lights.push(warmLight);
  }

  private setupAmbientLighting(): void {
    // Luz ambiental con tono cálido del ambiente volcánico
    this.ambientLight = new THREE.AmbientLight(0x4a2c2a, 0.6);
    this.scene.add(this.ambientLight);

    // Luz hemisférica para dar profundidad
    this.hemiLight = new THREE.HemisphereLight(
      0x8b4513, // Cielo (vapor caliente)
      0x1a0a00, // Suelo (oscuro)
      0.4
    );
    this.scene.add(this.hemiLight);
  }

  private setupFillLights(coreRadius: number): void {
    // Luces de relleno en diferentes posiciones
    const fillPositions = [
      new THREE.Vector3(coreRadius * 2, 5, 0),
      new THREE.Vector3(-coreRadius * 2, -3, coreRadius),
      new THREE.Vector3(0, -5, -coreRadius * 2),
    ];

    fillPositions.forEach((pos, i) => {
      const light = new THREE.PointLight(
        i === 0 ? 0xff6633 : 0x664422,
        0.5,
        coreRadius * 3
      );
      light.position.copy(pos);
      this.scene.add(light);
      this.fillLights.push(light);
    });
  }

  update(time: number): void {
    // Pulsar luz del núcleo
    const pulse = 1 + Math.sin(time * 1.5) * 0.2;
    this.coreLight.intensity = 3 * pulse;

    // Variación sutil en luces de relleno
    this.fillLights.forEach((light, i) => {
      light.intensity = 0.5 + Math.sin(time + i * 2) * 0.1;
    });
  }

  dispose(): void {
    this.lights.forEach(light => {
      this.scene.remove(light);
      light.dispose();
    });
  }
}
```

### 10.2 Post-procesamiento con Bloom

```typescript
// src/app/features/tartarus/systems/postprocessing.system.ts

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

export class PostProcessingSystem {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private scene: THREE.Scene,
    private camera: THREE.Camera
  ) {
    this.setupComposer();
  }

  private setupComposer(): void {
    const width = this.renderer.domElement.width;
    const height = this.renderer.domElement.height;

    this.composer = new EffectComposer(this.renderer);

    // Render pass principal
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom para el brillo del magma
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.5,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    this.composer.addPass(this.bloomPass);

    // Shader de distorsión por calor (opcional)
    const heatDistortionShader = {
      uniforms: {
        tDiffuse: { value: null },
        time: { value: 0 },
        distortionAmount: { value: 0.002 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float distortionAmount;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;

          // Distorsión ondulante
          float distortion = sin(uv.y * 50.0 + time * 2.0) * distortionAmount;
          distortion += sin(uv.x * 30.0 + time * 1.5) * distortionAmount * 0.5;

          uv.x += distortion;

          gl_FragColor = texture2D(tDiffuse, uv);
        }
      `,
    };

    const heatPass = new ShaderPass(heatDistortionShader);
    this.composer.addPass(heatPass);

    // Almacenar referencia para actualizar
    this.composer.passes[2] = heatPass;
  }

  render(): void {
    this.composer.render();
  }

  update(time: number): void {
    // Actualizar tiempo en shader de distorsión
    const heatPass = this.composer.passes[2] as ShaderPass;
    if (heatPass && heatPass.uniforms) {
      heatPass.uniforms['time'].value = time;
    }
  }

  resize(width: number, height: number): void {
    this.composer.setSize(width, height);
    this.bloomPass.resolution.set(width, height);
  }

  dispose(): void {
    this.composer.dispose();
  }
}
```

---

## 11. Control Gestual y Navegación

### 11.1 Modos de Navegación

```typescript
// src/app/features/tartarus/systems/navigation.system.ts

type NavigationMode = 'orbit' | 'explore' | 'focus';

interface NavigationState {
  mode: NavigationMode;
  target: THREE.Vector3;
  distance: number;
  rotation: { theta: number; phi: number };
  focusedObject: THREE.Object3D | null;
}

export class NavigationSystem {
  private state: NavigationState = {
    mode: 'orbit',
    target: new THREE.Vector3(0, 0, 0),
    distance: 50,
    rotation: { theta: 0, phi: Math.PI / 4 },
    focusedObject: null,
  };

  private smoothState = { ...this.state };
  private camera: THREE.PerspectiveCamera;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  /**
   * Control con mano abierta - Rotar alrededor del planeta
   */
  handleOpenHand(deltaX: number, deltaY: number): void {
    if (this.state.mode !== 'orbit') return;

    this.state.rotation.theta += deltaX * 3;
    this.state.rotation.phi += deltaY * 2;

    // Limitar phi para evitar gimbal lock
    this.state.rotation.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.state.rotation.phi));
  }

  /**
   * Control con pinch - Zoom
   */
  handlePinch(deltaY: number): void {
    this.state.distance = Math.max(
      15, // Mínimo - cerca del núcleo
      Math.min(150, this.state.distance + deltaY * 100) // Máximo - vista lejana
    );
  }

  /**
   * Gesto de puño cerrado - Cambiar modo o seleccionar
   */
  handleFist(position: THREE.Vector2): void {
    // Raycast para detectar objetos
    // Si se detecta una isla o ciudad, enfocar en ella
  }

  /**
   * Doble tap/gesto - Enfocar en punto de interés
   */
  focusOn(object: THREE.Object3D): void {
    this.state.mode = 'focus';
    this.state.focusedObject = object;
    this.state.target.copy(object.position);
    this.state.distance = 10; // Acercarse al objeto
  }

  /**
   * Volver a vista orbital
   */
  resetToOrbit(): void {
    this.state.mode = 'orbit';
    this.state.target.set(0, 0, 0);
    this.state.distance = 50;
    this.state.focusedObject = null;
  }

  update(delta: number): void {
    // Interpolación suave
    const smoothing = 0.08;

    this.smoothState.rotation.theta += (this.state.rotation.theta - this.smoothState.rotation.theta) * smoothing;
    this.smoothState.rotation.phi += (this.state.rotation.phi - this.smoothState.rotation.phi) * smoothing;
    this.smoothState.distance += (this.state.distance - this.smoothState.distance) * smoothing;
    this.smoothState.target.lerp(this.state.target, smoothing);

    // Calcular posición de cámara en coordenadas esféricas
    const x = this.smoothState.distance * Math.sin(this.smoothState.rotation.phi) * Math.cos(this.smoothState.rotation.theta);
    const y = this.smoothState.distance * Math.cos(this.smoothState.rotation.phi);
    const z = this.smoothState.distance * Math.sin(this.smoothState.rotation.phi) * Math.sin(this.smoothState.rotation.theta);

    this.camera.position.set(
      this.smoothState.target.x + x,
      this.smoothState.target.y + y,
      this.smoothState.target.z + z
    );

    this.camera.lookAt(this.smoothState.target);
  }

  getState(): NavigationState {
    return { ...this.state };
  }
}
```

### 11.2 Integración con MediaPipe

```typescript
// Ejemplo de uso en el componente principal

constructor() {
  effect(() => {
    const position = this.mediaPipe.handPosition();
    const gesture = this.mediaPipe.gesture();

    if (!position) return;

    const delta = this.mediaPipe.getDelta();

    switch (gesture) {
      case 'point':
        // Mano abierta - rotar
        this.navigation.handleOpenHand(delta.deltaX, delta.deltaY);
        break;

      case 'pinch':
        // Pinch - zoom
        this.navigation.handlePinch(delta.deltaY);
        break;

      case 'fist':
        // Puño - seleccionar/enfocar
        this.navigation.handleFist(new THREE.Vector2(position.x, position.y));
        break;
    }
  });
}
```

---

## 12. Niveles de Detalle (LOD)

### 12.1 Sistema LOD para Optimización

```typescript
// src/app/features/tartarus/systems/lod.system.ts

interface LODLevel {
  distance: number;
  detail: 'high' | 'medium' | 'low';
}

export class LODManager {
  private lodObjects: Map<THREE.Object3D, THREE.LOD> = new Map();
  private camera: THREE.Camera;

  private readonly LOD_LEVELS: LODLevel[] = [
    { distance: 0, detail: 'high' },
    { distance: 30, detail: 'medium' },
    { distance: 60, detail: 'low' },
  ];

  constructor(camera: THREE.Camera) {
    this.camera = camera;
  }

  /**
   * Crear objeto con LOD
   */
  createLODObject(
    highDetail: THREE.Object3D,
    mediumDetail: THREE.Object3D,
    lowDetail: THREE.Object3D
  ): THREE.LOD {
    const lod = new THREE.LOD();

    lod.addLevel(highDetail, this.LOD_LEVELS[0].distance);
    lod.addLevel(mediumDetail, this.LOD_LEVELS[1].distance);
    lod.addLevel(lowDetail, this.LOD_LEVELS[2].distance);

    this.lodObjects.set(highDetail, lod);

    return lod;
  }

  /**
   * Ejemplo: Crear isla con diferentes niveles de detalle
   */
  createIslandLOD(config: IslandConfig): THREE.LOD {
    // Alta calidad - todos los detalles
    const high = this.createHighDetailIsland(config);

    // Media calidad - menos segmentos, sin partículas
    const medium = this.createMediumDetailIsland(config);

    // Baja calidad - geometría simplificada
    const low = this.createLowDetailIsland(config);

    return this.createLODObject(high, medium, low);
  }

  private createHighDetailIsland(config: IslandConfig): THREE.Group {
    // Geometría completa con 32 segmentos
    // Todos los edificios
    // Partículas de humo
    // Grietas de lava detalladas
    const group = new THREE.Group();
    // ... implementación
    return group;
  }

  private createMediumDetailIsland(config: IslandConfig): THREE.Group {
    // Geometría con 16 segmentos
    // Solo edificios principales
    // Sin partículas
    const group = new THREE.Group();
    // ... implementación
    return group;
  }

  private createLowDetailIsland(config: IslandConfig): THREE.Group {
    // Geometría con 8 segmentos
    // Textura simple en lugar de edificios
    // Billboard sprite
    const group = new THREE.Group();
    // ... implementación
    return group;
  }

  update(): void {
    this.lodObjects.forEach(lod => {
      lod.update(this.camera);
    });
  }
}
```

---

## 13. Optimización y Rendimiento

### 13.1 Técnicas de Optimización

```typescript
// src/app/core/utils/optimization.utils.ts

/**
 * Pool de objetos para reutilizar geometrías y materiales
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

/**
 * Instanced Mesh para objetos repetidos (asteroides, edificios similares)
 */
export function createInstancedMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  count: number,
  positions: THREE.Vector3[],
  scales: number[],
  rotations: THREE.Euler[]
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();

  for (let i = 0; i < count; i++) {
    quaternion.setFromEuler(rotations[i]);
    matrix.compose(positions[i], quaternion, new THREE.Vector3(scales[i], scales[i], scales[i]));
    mesh.setMatrixAt(i, matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

/**
 * Frustum culling manual para objetos complejos
 */
export class FrustumCuller {
  private frustum = new THREE.Frustum();
  private projScreenMatrix = new THREE.Matrix4();

  update(camera: THREE.Camera): void {
    this.projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }

  isVisible(object: THREE.Object3D): boolean {
    if (!object.geometry) return true;

    const boundingSphere = object.geometry.boundingSphere;
    if (!boundingSphere) {
      object.geometry.computeBoundingSphere();
    }

    const sphere = boundingSphere!.clone();
    sphere.applyMatrix4(object.matrixWorld);

    return this.frustum.intersectsSphere(sphere);
  }
}
```

### 13.2 Configuración de Calidad

```typescript
// src/app/features/tartarus/config/quality.config.ts

export interface QualitySettings {
  particleCount: number;
  geometrySegments: number;
  shadowMapSize: number;
  bloomEnabled: boolean;
  heatDistortion: boolean;
  creatureCount: number;
  buildingDetail: 'high' | 'medium' | 'low';
}

export const QUALITY_PRESETS: Record<string, QualitySettings> = {
  ultra: {
    particleCount: 5000,
    geometrySegments: 64,
    shadowMapSize: 2048,
    bloomEnabled: true,
    heatDistortion: true,
    creatureCount: 20,
    buildingDetail: 'high',
  },
  high: {
    particleCount: 3000,
    geometrySegments: 32,
    shadowMapSize: 1024,
    bloomEnabled: true,
    heatDistortion: true,
    creatureCount: 15,
    buildingDetail: 'high',
  },
  medium: {
    particleCount: 1500,
    geometrySegments: 16,
    shadowMapSize: 512,
    bloomEnabled: true,
    heatDistortion: false,
    creatureCount: 10,
    buildingDetail: 'medium',
  },
  low: {
    particleCount: 500,
    geometrySegments: 8,
    shadowMapSize: 256,
    bloomEnabled: false,
    heatDistortion: false,
    creatureCount: 5,
    buildingDetail: 'low',
  },
};

/**
 * Auto-detectar calidad basado en rendimiento
 */
export function detectOptimalQuality(): string {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) return 'low';

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    // Detectar GPUs conocidas
    if (renderer.includes('RTX') || renderer.includes('RX 6') || renderer.includes('RX 7')) {
      return 'ultra';
    }
    if (renderer.includes('GTX') || renderer.includes('RX 5')) {
      return 'high';
    }
    if (renderer.includes('Intel')) {
      return 'low';
    }
  }

  return 'medium';
}
```

---

## 14. Assets y Recursos

### 14.1 Texturas Necesarias

```
assets/textures/
├── magma/
│   ├── magma_diffuse.jpg      # Textura base de lava
│   ├── magma_normal.jpg       # Normal map para relieve
│   ├── magma_emission.jpg     # Mapa de emisión (partes brillantes)
│   └── magma_noise.jpg        # Ruido para animación
├── rock/
│   ├── volcanic_diffuse.jpg   # Roca volcánica
│   ├── volcanic_normal.jpg    # Normal map
│   ├── obsidian_diffuse.jpg   # Obsidiana
│   └── basalt_diffuse.jpg     # Basalto
├── metal/
│   ├── copper_diffuse.jpg     # Cobre
│   ├── copper_normal.jpg      # Normal de cobre
│   ├── brass_diffuse.jpg      # Latón
│   ├── rust_diffuse.jpg       # Óxido
│   └── iron_diffuse.jpg       # Hierro
└── effects/
    ├── smoke_sprite.png       # Sprite de humo
    ├── spark_sprite.png       # Sprite de chispa
    ├── glow_gradient.png      # Gradiente para glow
    └── noise_seamless.jpg     # Ruido tileable
```

### 14.2 Modelos 3D Opcionales

```
assets/models/
├── buildings/
│   ├── tower_detailed.glb
│   ├── factory_detailed.glb
│   ├── dome_detailed.glb
│   └── bridge.glb
├── creatures/
│   ├── steam_worm.glb
│   └── ash_bird.glb
└── props/
    ├── pipe_segment.glb
    ├── gear.glb
    ├── lamp_post.glb
    └── crane.glb
```

### 14.3 Generación Procedural de Texturas

```typescript
// src/app/core/utils/texture-generator.ts

export function generateMagmaTexture(size = 512): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Crear gradiente base
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, '#ffff00');
  gradient.addColorStop(0.3, '#ff6600');
  gradient.addColorStop(0.6, '#cc3300');
  gradient.addColorStop(1, '#330000');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Agregar ruido
  const imageData = ctx.getImageData(0, 0, size, size);
  const noise = new SimplexNoise();

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = noise.noise2D(x / 50, y / 50) * 0.5 + 0.5;

      imageData.data[i] = Math.min(255, imageData.data[i] * (0.8 + n * 0.4));
      imageData.data[i + 1] = Math.min(255, imageData.data[i + 1] * (0.8 + n * 0.4));
      imageData.data[i + 2] = Math.min(255, imageData.data[i + 2] * (0.8 + n * 0.4));
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

export function generateRockTexture(size = 512): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base gris oscuro
  ctx.fillStyle = '#2d2d3a';
  ctx.fillRect(0, 0, size, size);

  // Agregar variación
  const imageData = ctx.getImageData(0, 0, size, size);
  const noise = new SimplexNoise();

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // Múltiples frecuencias de ruido
      let n = noise.noise2D(x / 100, y / 100) * 0.5;
      n += noise.noise2D(x / 50, y / 50) * 0.25;
      n += noise.noise2D(x / 25, y / 25) * 0.125;
      n = (n + 1) / 2;

      const variation = n * 40 - 20;

      imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + variation));
      imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + variation));
      imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + variation));
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}
```

---

## Conclusión

Este documento proporciona una guía completa para crear **Tartarus Prime**, un planeta volcánico interactivo con:

1. **Núcleo de magma animado** con shaders personalizados
2. **Islas volcánicas flotantes** con generación procedural
3. **Atmósfera de vapor** en múltiples capas
4. **Criaturas vivientes** (gusanos de vapor)
5. **Ciudades steampunk** con edificios detallados
6. **Iluminación dramática** con post-procesamiento
7. **Control gestual** mediante MediaPipe
8. **Optimización** con LOD y pooling de objetos

### Próximos Pasos Recomendados

1. Comenzar con el núcleo de magma y su shader
2. Agregar las islas flotantes básicas
3. Implementar la navegación con gestos
4. Agregar las ciudades y edificios
5. Implementar las criaturas
6. Pulir con efectos de post-procesamiento
7. Optimizar según sea necesario

### Estimación de Complejidad

| Componente | Complejidad | Tiempo Estimado |
|------------|-------------|-----------------|
| Núcleo de magma | Alta | - |
| Islas flotantes | Media-Alta | - |
| Ciudades | Alta | - |
| Criaturas | Media | - |
| Atmósfera | Media | - |
| Navegación | Baja | - |
| Optimización | Media | - |

---

*Documento creado para el proyecto Tartarus Prime*
*Versión 1.0*
