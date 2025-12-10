import { Injectable, signal, NgZone, OnDestroy } from '@angular/core';
import {
  FilesetResolver,
  HandLandmarker,
  HandLandmarkerResult,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';

export interface HandPosition {
  x: number;
  y: number;
}

export type GestureType = 'none' | 'point' | 'pinch';

@Injectable({ providedIn: 'root' })
export class MediaPipeService implements OnDestroy {
  private handLandmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private lastVideoTime = -1;
  private animationFrameId: number | null = null;
  private stream: MediaStream | null = null;

  // Signals para estado reactivo
  readonly isLoading = signal(false);
  readonly isReady = signal(false);
  readonly error = signal<string | null>(null);
  readonly handPosition = signal<HandPosition | null>(null);
  readonly gesture = signal<GestureType>('none');
  readonly handDetected = signal(false);

  // Para calcular delta de movimiento
  private previousPosition: HandPosition = { x: 0.5, y: 0.5 };

  constructor(private ngZone: NgZone) {}

  /**
   * Inicializa MediaPipe Hand Landmarker
   * Carga el modelo desde CDN de Google
   */
  async initialize(): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Cargar WASM runtime de MediaPipe
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );

      // Crear Hand Landmarker con configuración optimizada
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU', // Usar GPU para mejor rendimiento
        },
        runningMode: 'VIDEO',
        numHands: 1, // Solo una mano para simplicidad
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isReady.set(true);
      this.isLoading.set(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      this.error.set(`Error inicializando MediaPipe: ${errorMessage}`);
      this.isLoading.set(false);
      return false;
    }
  }

  /**
   * Inicia la captura de webcam y el loop de detección
   */
  async startTracking(videoElement: HTMLVideoElement): Promise<boolean> {
    if (!this.handLandmarker) {
      this.error.set('MediaPipe no inicializado. Llama initialize() primero.');
      return false;
    }

    this.video = videoElement;

    try {
      // Solicitar acceso a webcam
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user', // Cámara frontal
        },
      });

      this.video.srcObject = this.stream;
      await this.video.play();

      // Iniciar loop de detección FUERA de Angular zone
      // Esto es crítico para no disparar change detection en cada frame
      this.ngZone.runOutsideAngular(() => {
        this.detectLoop();
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      this.error.set(`Error accediendo a cámara: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Loop de detección ejecutado a ~30-60 FPS
   * Corre fuera de Angular zone para evitar change detection excesivo
   */
  private detectLoop = (): void => {
    if (!this.video || !this.handLandmarker) return;

    // Solo procesar si hay un nuevo frame de video
    if (
      this.video.currentTime !== this.lastVideoTime &&
      this.video.readyState >= 2
    ) {
      const result = this.handLandmarker.detectForVideo(
        this.video,
        performance.now()
      );
      this.processResult(result);
      this.lastVideoTime = this.video.currentTime;
    }

    this.animationFrameId = requestAnimationFrame(this.detectLoop);
  };

  /**
   * Procesa los resultados de detección y actualiza signals
   */
  private processResult(result: HandLandmarkerResult): void {
    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];

      // Landmark 8 = punta del dedo índice
      const indexTip = landmarks[8];

      // Mirror en X para que el movimiento sea natural (como espejo)
      const x = 1 - indexTip.x;
      const y = indexTip.y;

      // Detectar gesto de pinch
      const isPinching = this.detectPinch(landmarks);

      // Actualizar signals dentro de Angular zone
      this.ngZone.run(() => {
        this.previousPosition = this.handPosition() || { x: 0.5, y: 0.5 };
        this.handPosition.set({ x, y });
        this.gesture.set(isPinching ? 'pinch' : 'point');
        this.handDetected.set(true);
      });
    } else {
      this.ngZone.run(() => {
        this.handDetected.set(false);
        this.gesture.set('none');
      });
    }
  }

  /**
   * Detecta gesto de pinch (pulgar + índice cerca)
   * Retorna true si la distancia entre pulgar e índice es menor a umbral
   */
  private detectPinch(landmarks: NormalizedLandmark[]): boolean {
    // Landmark 4 = punta del pulgar
    // Landmark 8 = punta del índice
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const distance = Math.hypot(
      thumbTip.x - indexTip.x,
      thumbTip.y - indexTip.y
    );

    // Umbral de 0.06 funciona bien para la mayoría de casos
    return distance < 0.06;
  }

  /**
   * Calcula el delta de movimiento desde la última posición
   * Útil para aplicar rotación/zoom proporcional al movimiento
   */
  getDelta(): { deltaX: number; deltaY: number } {
    const current = this.handPosition();
    if (!current) return { deltaX: 0, deltaY: 0 };

    return {
      deltaX: current.x - this.previousPosition.x,
      deltaY: current.y - this.previousPosition.y,
    };
  }

  /**
   * Detiene el tracking y libera recursos
   */
  stopTracking(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }
  }

  /**
   * Limpieza completa del servicio
   */
  async dispose(): Promise<void> {
    this.stopTracking();

    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }

    this.isReady.set(false);
  }

  ngOnDestroy(): void {
    this.dispose();
  }
}
