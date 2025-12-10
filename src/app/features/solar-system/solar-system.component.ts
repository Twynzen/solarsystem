import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { MediaPipeService } from '../../core/services/mediapipe.service';

// Interfaz para datos de planetas
interface PlanetData {
  name: string;
  radius: number;
  distance: number;
  color: number;
  speed: number;
  tilt: number;
  hasRing?: boolean;
  hasMoon?: boolean;
}

// Interfaz para meshes de planetas en escena
interface PlanetMesh {
  group: THREE.Group;
  speed: number;
  mesh: THREE.Mesh;
  data: PlanetData;
}

@Component({
  selector: 'app-solar-system',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solar-system.component.html',
  styleUrl: './solar-system.component.css',
})
export class SolarSystemComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('video', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('preview', { static: true }) previewRef!: ElementRef<HTMLVideoElement>;

  // Inyección de dependencias
  private ngZone = inject(NgZone);
  mediaPipe = inject(MediaPipeService);

  // Estado del componente
  readonly isLoading = signal(true);
  readonly loadingStatus = signal('Inicializando...');
  readonly useMouseFallback = signal(false);

  // Three.js objects
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private solarSystem!: THREE.Group;
  private planetMeshes: PlanetMesh[] = [];
  private stars!: THREE.Points;
  private sunGlows: THREE.Mesh[] = [];
  private asteroidBelt!: THREE.Group;

  // Control de cámara con interpolación suave
  private control = {
    rotationX: 0.3,
    rotationY: 0,
    zoom: 50,
    targetRotationX: 0.3,
    targetRotationY: 0,
    targetZoom: 50,
  };

  // Control de mouse como fallback
  private mouse = {
    isDown: false,
    lastX: 0,
    lastY: 0,
  };

  // Animation frame ID para cleanup
  private animationFrameId: number | null = null;

  // Datos de los planetas del sistema solar
  private readonly PLANETS: PlanetData[] = [
    { name: 'Mercurio', radius: 0.4, distance: 8, color: 0x9a9a9a, speed: 4.15, tilt: 0.03 },
    { name: 'Venus', radius: 0.95, distance: 11, color: 0xe8cda0, speed: 1.62, tilt: 2.64 },
    { name: 'Tierra', radius: 1, distance: 15, color: 0x6b93d6, speed: 1, tilt: 0.41, hasMoon: true },
    { name: 'Marte', radius: 0.53, distance: 19, color: 0xc1440e, speed: 0.53, tilt: 0.44 },
    { name: 'Júpiter', radius: 2.8, distance: 28, color: 0xd4a574, speed: 0.084, tilt: 0.05 },
    { name: 'Saturno', radius: 2.3, distance: 38, color: 0xead6b8, speed: 0.034, tilt: 0.47, hasRing: true },
    { name: 'Urano', radius: 1.6, distance: 48, color: 0xc9e8e8, speed: 0.012, tilt: 1.71 },
    { name: 'Neptuno', radius: 1.5, distance: 56, color: 0x5b5ddf, speed: 0.006, tilt: 0.49 },
  ];

  constructor() {
    // Effect para reaccionar a cambios en el hand tracking
    effect(() => {
      const position = this.mediaPipe.handPosition();
      const gesture = this.mediaPipe.gesture();

      if (!position || this.useMouseFallback()) return;

      const delta = this.mediaPipe.getDelta();

      if (gesture === 'pinch') {
        // Pinch = zoom
        this.control.targetZoom = Math.max(
          15,
          Math.min(120, this.control.targetZoom + delta.deltaY * 150)
        );
      } else if (gesture === 'point') {
        // Mano abierta = rotar
        this.control.targetRotationY += delta.deltaX * 4;
        this.control.targetRotationX += delta.deltaY * 2.5;
        this.control.targetRotationX = Math.max(-1.2, Math.min(1.2, this.control.targetRotationX));
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // 1. Crear escena 3D
    this.loadingStatus.set('Creando sistema solar...');
    this.createScene();

    // 2. Inicializar MediaPipe
    this.loadingStatus.set('Cargando MediaPipe...');
    const mpReady = await this.mediaPipe.initialize();

    if (mpReady) {
      // 3. Iniciar webcam y tracking
      this.loadingStatus.set('Iniciando cámara...');
      const camReady = await this.mediaPipe.startTracking(this.videoRef.nativeElement);

      if (camReady) {
        // Conectar preview de video
        this.previewRef.nativeElement.srcObject = this.videoRef.nativeElement.srcObject;
        this.previewRef.nativeElement.play();
      } else {
        this.useMouseFallback.set(true);
        this.setupMouseControls();
      }
    } else {
      this.useMouseFallback.set(true);
      this.setupMouseControls();
    }

    // 4. Iniciar loop de animación
    this.loadingStatus.set('¡Listo!');
    setTimeout(() => {
      this.isLoading.set(false);
      this.startAnimation();
    }, 500);
  }

  /**
   * Crea toda la escena 3D: sol, planetas, estrellas, asteroides
   */
  private createScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    // Renderer con antialiasing
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Escena
    this.scene = new THREE.Scene();

    // Cámara perspectiva
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    this.camera.position.z = 50;

    // Crear componentes de la escena
    this.createStars();
    this.createNebula();
    this.createSolarSystem();
    this.createAsteroidBelt();

    // Luces
    const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
    this.scene.add(ambientLight);

    // Handle resize
    window.addEventListener('resize', this.onResize);
  }

  /**
   * Crea el campo de estrellas de fondo
   */
  private createStars(): void {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < 6000; i++) {
      // Distribuir en esfera
      const radius = 500 + Math.random() * 1500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      // Colores variados
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        colors.push(1, 1, 1); // Blanco
      } else if (colorChoice < 0.75) {
        colors.push(1, 0.95, 0.8); // Cálido
      } else if (colorChoice < 0.9) {
        colors.push(0.8, 0.85, 1); // Azul frío
      } else {
        colors.push(1, 0.7, 0.5); // Naranja
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  /**
   * Crea efecto de nebulosa de fondo
   */
  private createNebula(): void {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < 200; i++) {
      positions.push(
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 400,
        -300 - Math.random() * 500
      );

      // Colores púrpura/azul
      colors.push(
        0.3 + Math.random() * 0.3,
        0.1 + Math.random() * 0.2,
        0.5 + Math.random() * 0.4
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 50,
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true,
    });

    const nebula = new THREE.Points(geometry, material);
    this.scene.add(nebula);
  }

  /**
   * Crea el sistema solar: sol y planetas
   */
  private createSolarSystem(): void {
    this.solarSystem = new THREE.Group();
    this.scene.add(this.solarSystem);

    // === SOL ===
    const sunGroup = new THREE.Group();

    // Núcleo del sol
    const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffee00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sunGroup.add(sun);

    // Capas de glow
    const glowConfigs = [
      { radius: 5.5, color: 0xffaa00, opacity: 0.4 },
      { radius: 6.5, color: 0xff6600, opacity: 0.2 },
      { radius: 8, color: 0xff4400, opacity: 0.08 },
    ];

    glowConfigs.forEach((config) => {
      const glowGeom = new THREE.SphereGeometry(config.radius, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: config.opacity,
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      sunGroup.add(glow);
      this.sunGlows.push(glow);
    });

    // Luz del sol
    const sunLight = new THREE.PointLight(0xffffee, 2, 200);
    sunGroup.add(sunLight);

    this.solarSystem.add(sunGroup);

    // === PLANETAS ===
    this.PLANETS.forEach((planet) => {
      const planetGroup = new THREE.Group();

      // Mesh del planeta
      const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: planet.color,
        roughness: 0.7,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = planet.distance;
      mesh.rotation.z = planet.tilt;
      planetGroup.add(mesh);

      // Luna de la Tierra
      if (planet.hasMoon) {
        const moonGeom = new THREE.SphereGeometry(0.27, 16, 16);
        const moonMat = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.9,
        });
        const moon = new THREE.Mesh(moonGeom, moonMat);
        moon.position.x = planet.distance + 2;
        planetGroup.add(moon);
        (planetGroup as any).moon = moon;
        (planetGroup as any).moonDistance = 2;
      }

      // Anillos de Saturno
      if (planet.hasRing) {
        const ringGeom = new THREE.RingGeometry(
          planet.radius * 1.4,
          planet.radius * 2.4,
          64
        );
        // Rotar vértices para que el anillo quede horizontal
        const pos = ringGeom.attributes['position'];
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          pos.setXYZ(i, x, 0, y);
        }
        ringGeom.computeVertexNormals();

        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xc9b896,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.x = planet.distance;
        ring.rotation.x = Math.PI / 6;
        planetGroup.add(ring);
      }

      // Línea de órbita
      const orbitGeom = new THREE.BufferGeometry();
      const orbitPoints: number[] = [];
      for (let i = 0; i <= 128; i++) {
        const angle = (i / 128) * Math.PI * 2;
        orbitPoints.push(
          Math.cos(angle) * planet.distance,
          0,
          Math.sin(angle) * planet.distance
        );
      }
      orbitGeom.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x4444aa,
        transparent: true,
        opacity: 0.25,
      });
      const orbit = new THREE.Line(orbitGeom, orbitMat);
      this.solarSystem.add(orbit);

      // Posición inicial aleatoria en órbita
      planetGroup.rotation.y = Math.random() * Math.PI * 2;

      this.solarSystem.add(planetGroup);
      this.planetMeshes.push({
        group: planetGroup,
        speed: planet.speed,
        mesh,
        data: planet,
      });
    });
  }

  /**
   * Crea el cinturón de asteroides entre Marte y Júpiter
   */
  private createAsteroidBelt(): void {
    this.asteroidBelt = new THREE.Group();

    for (let i = 0; i < 800; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 22 + Math.random() * 4;
      const size = 0.03 + Math.random() * 0.1;

      const geometry = new THREE.IcosahedronGeometry(size, 0);
      const material = new THREE.MeshStandardMaterial({
        color: 0x666666 + Math.random() * 0x333333,
        roughness: 1,
        flatShading: true,
      });
      const asteroid = new THREE.Mesh(geometry, material);

      asteroid.position.set(
        Math.cos(angle) * distance,
        (Math.random() - 0.5) * 1.5,
        Math.sin(angle) * distance
      );
      asteroid.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      this.asteroidBelt.add(asteroid);
    }

    this.solarSystem.add(this.asteroidBelt);
  }

  /**
   * Configura controles de mouse como fallback
   */
  private setupMouseControls(): void {
    const canvas = this.canvasRef.nativeElement;

    canvas.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      this.mouse.lastX = e.clientX;
      this.mouse.lastY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!this.mouse.isDown) return;

      const deltaX = e.clientX - this.mouse.lastX;
      const deltaY = e.clientY - this.mouse.lastY;

      this.control.targetRotationY += deltaX * 0.005;
      this.control.targetRotationX += deltaY * 0.005;
      this.control.targetRotationX = Math.max(-1.2, Math.min(1.2, this.control.targetRotationX));

      this.mouse.lastX = e.clientX;
      this.mouse.lastY = e.clientY;
    });

    canvas.addEventListener('mouseup', () => (this.mouse.isDown = false));
    canvas.addEventListener('mouseleave', () => (this.mouse.isDown = false));

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.control.targetZoom += e.deltaY * 0.05;
      this.control.targetZoom = Math.max(15, Math.min(120, this.control.targetZoom));
    }, { passive: false });

    // Touch events para móviles
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.mouse.isDown = true;
        this.mouse.lastX = e.touches[0].clientX;
        this.mouse.lastY = e.touches[0].clientY;
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.mouse.isDown) {
        const deltaX = e.touches[0].clientX - this.mouse.lastX;
        const deltaY = e.touches[0].clientY - this.mouse.lastY;

        this.control.targetRotationY += deltaX * 0.005;
        this.control.targetRotationX += deltaY * 0.005;
        this.control.targetRotationX = Math.max(-1.2, Math.min(1.2, this.control.targetRotationX));

        this.mouse.lastX = e.touches[0].clientX;
        this.mouse.lastY = e.touches[0].clientY;
      }
    });

    canvas.addEventListener('touchend', () => (this.mouse.isDown = false));
  }

  /**
   * Inicia el loop de animación
   */
  private startAnimation(): void {
    this.ngZone.runOutsideAngular(() => {
      this.animate(0);
    });
  }

  /**
   * Loop de animación principal
   */
  private animate = (time: number): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Interpolación suave de controles
    this.control.rotationX += (this.control.targetRotationX - this.control.rotationX) * 0.08;
    this.control.rotationY += (this.control.targetRotationY - this.control.rotationY) * 0.08;
    this.control.zoom += (this.control.targetZoom - this.control.zoom) * 0.08;

    // Aplicar rotación al sistema solar
    this.solarSystem.rotation.x = this.control.rotationX;
    this.solarSystem.rotation.y = this.control.rotationY;

    // Actualizar zoom de cámara
    this.camera.position.z = this.control.zoom;

    // Animar planetas
    this.planetMeshes.forEach(({ group, speed, data }) => {
      group.rotation.y += speed * 0.003;

      // Animar luna si existe
      const moon = (group as any).moon;
      if (moon) {
        const moonAngle = time * 0.002;
        const d = (group as any).moonDistance;
        moon.position.x = data.distance + Math.cos(moonAngle) * d;
        moon.position.z = Math.sin(moonAngle) * d;
      }
    });

    // Animar glow del sol
    const pulse = 1 + Math.sin(time * 0.002) * 0.05;
    this.sunGlows.forEach((glow, i) => {
      glow.scale.setScalar(pulse * (1 + i * 0.02));
    });

    // Rotar estrellas lentamente
    this.stars.rotation.y = time * 0.00001;
    this.stars.rotation.x = time * 0.000005;

    // Rotar cinturón de asteroides
    this.asteroidBelt.rotation.y += 0.0003;

    // Renderizar
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Maneja redimensionamiento de ventana
   */
  private onResize = (): void => {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  ngOnDestroy(): void {
    // Cleanup
    window.removeEventListener('resize', this.onResize);

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.mediaPipe.dispose();
    this.renderer.dispose();
  }
}
