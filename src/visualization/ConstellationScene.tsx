import { OrthographicCamera } from '@react-three/drei';
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Points,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  TOUCH,
  Vector3,
  type OrthographicCamera as OrthographicCameraType,
} from 'three';
import { MapControls as MapControlsImpl } from 'three/addons/controls/MapControls.js';
import { TYPE_REGIONS } from '../assessment/oeps';
import { INSTINCT_REGIONS } from '../content/instincts';
import type { EnneagramType, Instinct, ResultProfile, VisualizationPoint } from '../types';
import { createGlyphTexture, createLabelTexture, createRegionGlowTexture, createStreakTexture } from './textures';

export interface ConstellationHandle {
  reset: () => void;
  focusType: (type: EnneagramType) => void;
  navigateType: (type: EnneagramType) => void;
}

interface SceneProps {
  profile: ResultProfile;
  reducedMotion: boolean;
  selectedRegion: EnneagramType | null;
  onRegionHover: (type: EnneagramType | null) => void;
  onRegionSelect: (type: EnneagramType) => void;
  onFocusedRegionChange: (type: EnneagramType | null) => void;
  onPointHover: (point: VisualizationPoint | null) => void;
  onPointSelect: (point: VisualizationPoint) => void;
  onPointClear: () => void;
  onZoomChange: (zoom: number) => void;
  onCameraTransitionChange: (moving: boolean) => void;
}

interface DustProps {
  count: number;
  seedOffset: number;
  depth: number;
  size: number;
  opacity: number;
  speed: number;
  parallax: number;
  reducedMotion: boolean;
}

function Dust({ count, seedOffset, depth, size, opacity, speed, parallax, reducedMotion }: DustProps) {
  const points = useRef<Points>(null);
  const { camera } = useThree();
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const keyedIndex = index + seedOffset;
      const seed = Math.sin(keyedIndex * 192.13) * 10000;
      const random = seed - Math.floor(seed);
      positions[index * 3] = (random - 0.5) * 142;
      positions[index * 3 + 1] = (((keyedIndex * 47) % 997) / 997 - 0.5) * 46;
      positions[index * 3 + 2] = depth - ((keyedIndex * 19) % 100) / 28;
      const tone = 0.31 + (keyedIndex % 9) / 58;
      colors[index * 3] = tone;
      colors[index * 3 + 1] = tone * 0.96;
      colors[index * 3 + 2] = tone * 0.84;
    }
    const result = new BufferGeometry();
    result.setAttribute('position', new BufferAttribute(positions, 3));
    result.setAttribute('color', new BufferAttribute(colors, 3));
    return result;
  }, [count, depth, seedOffset]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const driftX = reducedMotion ? 0 : Math.cos(clock.elapsedTime * speed * 0.58 + seedOffset) * 0.22;
    const driftY = reducedMotion ? 0 : Math.sin(clock.elapsedTime * speed + seedOffset) * 0.38;
    points.current.position.x = camera.position.x * parallax + driftX;
    points.current.position.y = camera.position.y * parallax + driftY;
  });
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={size} sizeAttenuation transparent opacity={opacity} vertexColors depthWrite={false} />
    </points>
  );
}

interface CometRuntime {
  active: boolean;
  startTime: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  peakOpacity: number;
  length: number;
}

function AmbientComets({ reducedMotion }: { reducedMotion: boolean }) {
  const comets = useRef<Mesh[]>([]);
  const states = useRef<CometRuntime[]>(Array.from({ length: 4 }, () => ({
    active: false,
    startTime: 0,
    duration: 0,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    peakOpacity: 0,
    length: 0,
  })));
  const nextEvent = useRef<number | null>(null);
  const nextSlot = useRef(0);
  const texture = useMemo(() => createStreakTexture(), []);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    if (reducedMotion) {
      comets.current.forEach((comet) => { comet.visible = false; });
      return;
    }
    if (nextEvent.current === null) nextEvent.current = elapsed + 4 + Math.random() * 6;
    if (elapsed >= nextEvent.current) {
      const slot = nextSlot.current;
      const comet = comets.current[slot];
      const state = states.current[slot];
      const directions = [0, Math.PI, Math.PI / 2, -Math.PI / 2, Math.PI / 4, -Math.PI / 4, Math.PI * 0.72, -Math.PI * 0.72, Math.PI * 0.12, -Math.PI * 0.12];
      const angle = directions[Math.floor(Math.random() * directions.length)] + (Math.random() - 0.5) * 0.16;
      const distance = 32 + Math.random() * 116;
      const centerX = -38 + Math.random() * 76;
      const centerY = -17 + Math.random() * 34;
      const travelX = Math.cos(angle) * distance;
      const travelY = Math.sin(angle) * distance;
      state.active = true;
      state.startTime = elapsed;
      state.duration = 1.25 + distance / 72 + Math.random() * 1.1;
      state.startX = centerX - travelX / 2;
      state.endX = centerX + travelX / 2;
      state.startY = centerY - travelY / 2;
      state.endY = centerY + travelY / 2;
      state.peakOpacity = 0.22 + Math.random() * 0.34;
      state.length = 7 + Math.random() * 16;
      if (comet) {
        const depth = Math.random();
        comet.position.z = -1.5 - depth * 3.5;
        comet.rotation.z = angle;
        comet.scale.set(state.length, 0.25 + (1 - depth) * 0.34, 1);
      }
      nextSlot.current = (slot + 1) % states.current.length;
      nextEvent.current = elapsed + 17 + Math.random() * 24;
    }

    states.current.forEach((state, index) => {
      const comet = comets.current[index];
      if (!comet || !state.active) {
        if (comet) comet.visible = false;
        return;
      }
      const progress = (elapsed - state.startTime) / state.duration;
      if (progress >= 1) {
        state.active = false;
        comet.visible = false;
        return;
      }
      comet.visible = true;
      comet.position.x = MathUtils.lerp(state.startX, state.endX, progress);
      comet.position.y = MathUtils.lerp(state.startY, state.endY, progress);
      const fadeIn = MathUtils.smoothstep(progress, 0, 0.12);
      const fadeOut = 1 - MathUtils.smoothstep(progress, 0.68, 1);
      (comet.material as MeshBasicMaterial).opacity = state.peakOpacity * fadeIn * fadeOut;
    });
  });
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <>
      {states.current.map((_, index) => (
        <mesh
          key={index}
          ref={(mesh) => { if (mesh) comets.current[index] = mesh; }}
          visible={false}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texture} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} fog={false} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function Region({
  type,
  hovered,
  selected,
  focused,
  interactive,
  strength,
  strongest,
  nearTop,
  reducedMotion,
  onHover,
  onSelect,
}: {
  type: EnneagramType;
  hovered: boolean;
  selected: boolean;
  focused: boolean;
  interactive: boolean;
  strength: number;
  strongest: boolean;
  nearTop: boolean;
  reducedMotion: boolean;
  onHover: (type: EnneagramType | null) => void;
  onSelect: (type: EnneagramType) => void;
}) {
  const region = TYPE_REGIONS[type - 1];
  const glyph = useMemo(() => createGlyphTexture(String(type), region.hue), [region.hue, type]);
  const glow = useMemo(() => createRegionGlowTexture(region.hue), [region.hue]);
  const sprite = useRef<Sprite>(null);
  const glowSprite = useRef<Sprite>(null);
  const { camera, gl } = useThree();

  useFrame(({ clock }) => {
    if (!sprite.current || !glowSprite.current) return;
    const zoom = (camera as OrthographicCameraType).zoom;
    const deepFocus = focused ? MathUtils.smoothstep(zoom, 22, 44) : 0;
    const effectiveHover = interactive && hovered;
    const targetOpacity = effectiveHover
      ? 0.25
      : selected && deepFocus < 0.2
        ? 0.19
        : MathUtils.lerp(selected ? 0.13 : 0.085, 0.024, deepFocus);
    const targetScale = interactive && (hovered || selected) ? 1.045 : 1;
    sprite.current.material.opacity = MathUtils.lerp(sprite.current.material.opacity, targetOpacity, 0.1);
    sprite.current.scale.x = MathUtils.lerp(sprite.current.scale.x, 8.8 * targetScale, 0.09);
    sprite.current.scale.y = MathUtils.lerp(sprite.current.scale.y, 13.2 * targetScale, 0.09);
    const strongestAccent = strongest ? 0.095 + (reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.48) * 0.018) : nearTop ? 0.035 : 0;
    const glowTarget = effectiveHover
      ? 0.76
      : MathUtils.lerp(0.18 + strength * 0.56 + strongestAccent, 0.12 + strength * 0.2 + strongestAccent * 0.4, deepFocus);
    glowSprite.current.material.opacity = MathUtils.lerp(glowSprite.current.material.opacity, glowTarget, 0.08);
  });

  useEffect(() => () => { glyph.dispose(); glow.dispose(); }, [glyph, glow]);
  return (
    <group position={region.position}>
      <sprite ref={glowSprite} scale={[18, 18, 1]} position={[0, 0, -1.8]}>
        <spriteMaterial map={glow} transparent opacity={0.18 + strength * 0.56} blending={AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite ref={sprite} scale={[8.8, 13.2, 1]} position={[0, 0.15, -0.6]} raycast={() => null}>
        <spriteMaterial map={glyph} transparent opacity={0.085} depthWrite={false} />
      </sprite>
      {interactive && (
        <mesh
          position={[0, 0.15, -1.35]}
          scale={[10.4, 13.8, 1]}
          onPointerOver={() => {
            gl.domElement.style.cursor = 'pointer';
            onHover(type);
          }}
          onPointerOut={() => {
            gl.domElement.style.cursor = '';
            onHover(null);
          }}
          onClick={(event) => {
            if (event.delta <= 4) onSelect(type);
          }}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color={region.hue} transparent opacity={0.001} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function InstinctFields({ profile, focusedRegion }: { profile: ResultProfile; focusedRegion: EnneagramType | null }) {
  const { camera } = useThree();
  const zoneMaterials = useRef<Array<{ type: EnneagramType; instinct: Instinct; material: SpriteMaterial }>>([]);
  const ringMaterials = useRef<Array<{ type: EnneagramType; instinct: Instinct; material: MeshBasicMaterial }>>([]);
  const labelMaterials = useRef<Array<{ type: EnneagramType; instinct: Instinct; material: SpriteMaterial }>>([]);
  const instinctScore = (instinct: Instinct) => profile.instinctProfile?.scores.find((score) => score.instinct === instinct)?.normalized ?? 0;
  const strongestType = profile.dominantTypes[0];
  const dominantInstinct = profile.instinctProfile?.dominantInstincts[0];
  const labels = useMemo(
    () => Object.fromEntries(INSTINCT_REGIONS.map((instinct) => {
      const score = profile.instinctProfile?.scores.find((item) => item.instinct === instinct.id);
      return [instinct.id, createLabelTexture(instinct.shortLabel, score ? `${Math.round(score.normalized * 100)}% signal` : 'Not assessed')];
    })),
    [profile.instinctProfile],
  );
  const zoneGlows = useMemo(
    () => Object.fromEntries(TYPE_REGIONS.map((region) => [region.type, createRegionGlowTexture(region.hue)])),
    [],
  );

  useFrame(() => {
    const zoom = (camera as OrthographicCameraType).zoom;
    const visibility = MathUtils.smoothstep(zoom, 16, 29);
    zoneMaterials.current.forEach(({ type, instinct, material }) => {
      const score = instinctScore(instinct);
      const subtypeAccent = type === strongestType && instinct === dominantInstinct ? 1.32 : 1;
      const target = visibility * (focusedRegion === type ? 0.07 + score * 0.14 : 0.025 + score * 0.045) * subtypeAccent;
      material.opacity = MathUtils.lerp(material.opacity, target, 0.1);
    });
    ringMaterials.current.forEach(({ type, instinct, material }) => {
      const score = instinctScore(instinct);
      const target = visibility * (focusedRegion === type ? 0.026 + score * 0.055 : 0.012 + score * 0.018);
      material.opacity = MathUtils.lerp(material.opacity, target, 0.1);
    });
    labelMaterials.current.forEach(({ type, instinct, material }) => {
      const score = instinctScore(instinct);
      const subtypeAccent = type === strongestType && instinct === dominantInstinct ? 0.14 : 0;
      const target = visibility * (focusedRegion === type ? 0.38 + score * 0.38 + subtypeAccent : 0.1 + score * 0.14);
      material.opacity = MathUtils.lerp(material.opacity, target, 0.1);
    });
  });

  useEffect(() => () => {
    Object.values(labels).forEach((texture) => texture.dispose());
    Object.values(zoneGlows).forEach((texture) => texture.dispose());
  }, [labels, zoneGlows]);
  let zoneIndex = 0;
  let ringIndex = 0;
  let labelIndex = 0;
  return (
    <>
      {TYPE_REGIONS.map((region) => (
        <group key={region.type} position={region.position}>
          {INSTINCT_REGIONS.map((instinct) => {
            const currentZoneIndex = zoneIndex++;
            const currentRingIndex = ringIndex++;
            const currentLabelIndex = labelIndex++;
            return (
              <group key={instinct.id} position={instinct.offset}>
                <sprite scale={[5.1, 3.2, 1]} position={[0, 0, -0.28]}>
                  <spriteMaterial
                    ref={(material) => {
                      if (material) zoneMaterials.current[currentZoneIndex] = { type: region.type, instinct: instinct.id, material };
                    }}
                    map={zoneGlows[region.type]}
                    transparent
                    opacity={0}
                    blending={AdditiveBlending}
                    depthWrite={false}
                  />
                </sprite>
                <mesh scale={[1.42, 0.86, 1]} position={[0, 0, -0.2]}>
                  <ringGeometry args={[1.7, 1.73, 64]} />
                  <meshBasicMaterial
                    ref={(material) => {
                      if (material) ringMaterials.current[currentRingIndex] = { type: region.type, instinct: instinct.id, material };
                    }}
                    color={region.hue}
                    transparent
                    opacity={0}
                    depthWrite={false}
                  />
                </mesh>
                <sprite scale={[4.2, 1.05, 1]} position={[0, 1.85, 0.15]}>
                  <spriteMaterial
                    ref={(material) => {
                      if (material) labelMaterials.current[currentLabelIndex] = { type: region.type, instinct: instinct.id, material };
                    }}
                    map={labels[instinct.id]}
                    transparent
                    opacity={0}
                    depthWrite={false}
                  />
                </sprite>
              </group>
            );
          })}
        </group>
      ))}
    </>
  );
}

function DataLights({
  points: dataPoints,
  strongestTypes,
  reducedMotion,
  onPointHover,
  onPointSelect,
}: {
  points: VisualizationPoint[];
  strongestTypes: EnneagramType[];
  reducedMotion: boolean;
  onPointHover: (point: VisualizationPoint | null) => void;
  onPointSelect: (point: VisualizationPoint) => void;
}) {
  const pointsRef = useRef<Points>(null);
  const { camera, gl, raycaster } = useThree();
  const geometry = useMemo(() => {
    const positions = new Float32Array(dataPoints.length * 3);
    const colors = new Float32Array(dataPoints.length * 3);
    const sizes = new Float32Array(dataPoints.length);
    const alphas = new Float32Array(dataPoints.length);
    dataPoints.forEach((point, index) => {
      positions.set(point.home, index * 3);
      const base = new Color(TYPE_REGIONS[point.type - 1].hue);
      const lift = 0.76 + point.normalized * 0.32;
      colors[index * 3] = Math.min(1, base.r * lift);
      colors[index * 3 + 1] = Math.min(1, base.g * lift);
      colors[index * 3 + 2] = Math.min(1, base.b * lift);
      const strongestAccent = strongestTypes.includes(point.type) ? 1.08 : 1;
      sizes[index] = (3.2 + point.normalized * 6.2) * strongestAccent;
      alphas[index] = Math.min(1, (0.36 + point.normalized * 0.64) * strongestAccent);
    });
    const result = new BufferGeometry();
    result.setAttribute('position', new BufferAttribute(positions, 3));
    result.setAttribute('color', new BufferAttribute(colors, 3));
    result.setAttribute('aSize', new BufferAttribute(sizes, 1));
    result.setAttribute('aAlpha', new BufferAttribute(alphas, 1));
    return result;
  }, [dataPoints, strongestTypes]);
  const material = useMemo(() => new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uPixelRatio: { value: Math.min(devicePixelRatio, 1.75) },
      uZoom: { value: 10 },
    },
    vertexShader: `
      attribute float aSize;
      attribute float aAlpha;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uPixelRatio;
      uniform float uZoom;
      void main() {
        vColor = color;
        vAlpha = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        float focusScale = mix(1.0, 2.25, smoothstep(13.0, 46.0, uZoom));
        gl_PointSize = aSize * focusScale * uPixelRatio;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float core = 1.0 - smoothstep(0.0, 0.14, d);
        float glow = 1.0 - smoothstep(0.04, 0.5, d);
        float alpha = (core + glow * 0.62) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  }), []);

  useFrame(({ clock }) => {
    const zoom = (camera as OrthographicCameraType).zoom;
    material.uniforms.uZoom.value = zoom;
    raycaster.params.Points = { threshold: MathUtils.clamp(15 / zoom, 0.24, 0.72) };
    if (reducedMotion) return;
    const positions = geometry.getAttribute('position') as BufferAttribute;
    dataPoints.forEach((point, index) => {
      const time = clock.elapsedTime * 0.18 + point.driftPhase;
      positions.setXYZ(
        index,
        point.home[0] + Math.sin(time * 0.83) * 0.13,
        point.home[1] + Math.cos(time * 0.67) * 0.1,
        point.home[2] + Math.sin(time * 0.41) * 0.08,
      );
    });
    positions.needsUpdate = true;
  });

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  const inspect = (event: ThreeEvent<PointerEvent>) => {
    if ((camera as OrthographicCameraType).zoom < 20 || event.index === undefined) return;
    gl.domElement.style.cursor = 'crosshair';
    onPointHover(dataPoints[event.index] ?? null);
  };
  const select = (event: ThreeEvent<MouseEvent>) => {
    if ((camera as OrthographicCameraType).zoom < 20 || event.index === undefined || event.delta > 4) return;
    onPointSelect(dataPoints[event.index]);
  };
  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      onPointerMove={inspect}
      onClick={select}
      onPointerOut={() => { gl.domElement.style.cursor = ''; onPointHover(null); }}
    >
      <primitive object={material} attach="material" />
    </points>
  );
}

interface StableNavigationProps {
  reducedMotion: boolean;
  onStart: () => void;
  onRecover: () => void;
}

const StableNavigation = forwardRef<MapControlsImpl, StableNavigationProps>(function StableNavigation(
  { reducedMotion, onStart, onRecover },
  ref,
) {
  const { camera, gl } = useThree();
  const controls = useMemo(() => new MapControlsImpl(camera), [camera]);
  const onStartRef = useRef(onStart);
  const onRecoverRef = useRef(onRecover);
  onStartRef.current = onStart;
  onRecoverRef.current = onRecover;
  useImperativeHandle(ref, () => controls, [controls]);

  useEffect(() => {
    const canvas = gl.domElement;
    const activePointers = new Set<number>();
    let recoveryQueued = false;
    let controlActive = false;

    controls.enableRotate = false;
    controls.screenSpacePanning = true;
    controls.enableDamping = !reducedMotion;
    controls.dampingFactor = 0.075;
    controls.minZoom = 8;
    controls.maxZoom = 58;
    controls.touches.ONE = TOUCH.PAN;
    controls.touches.TWO = TOUCH.DOLLY_PAN;
    controls.connect(canvas);

    const recover = () => {
      activePointers.forEach((pointerId) => {
        if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
      });
      activePointers.clear();
      controlActive = false;
      controls.disconnect();
      controls.connect(canvas);
      controls.enabled = true;
      controls.update();
      canvas.style.cursor = '';
      onRecoverRef.current();
    };
    const queueRecovery = () => {
      if (recoveryQueued) return;
      recoveryQueued = true;
      queueMicrotask(() => {
        recoveryQueued = false;
        recover();
      });
    };
    const handleStart = () => {
      controlActive = true;
      onStartRef.current();
    };
    const handleEnd = () => { controlActive = false; };
    const handlePointerDown = (event: PointerEvent) => activePointers.add(event.pointerId);
    const handlePointerEnd = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      queueMicrotask(() => {
        if (controlActive) queueRecovery();
      });
    };
    const handleLostCapture = (event: PointerEvent) => {
      if (activePointers.has(event.pointerId)) queueRecovery();
    };
    const handleBlur = () => {
      if (activePointers.size > 0 || controlActive) queueRecovery();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') handleBlur();
    };

    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);
    canvas.addEventListener('pointerdown', handlePointerDown, { capture: true });
    canvas.addEventListener('pointerup', handlePointerEnd, { capture: true });
    canvas.addEventListener('pointercancel', handlePointerEnd, { capture: true });
    canvas.addEventListener('lostpointercapture', handleLostCapture);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
      canvas.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      canvas.removeEventListener('pointerup', handlePointerEnd, { capture: true });
      canvas.removeEventListener('pointercancel', handlePointerEnd, { capture: true });
      canvas.removeEventListener('lostpointercapture', handleLostCapture);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      controls.dispose();
    };
  }, [controls, gl, reducedMotion]);

  useFrame(() => controls.update(), -1);
  return null;
});

const CameraRig = forwardRef<ConstellationHandle, SceneProps>(function CameraRig(
  {
    profile,
    reducedMotion,
    selectedRegion,
    onRegionHover,
    onRegionSelect,
    onFocusedRegionChange,
    onPointHover,
    onPointSelect,
    onCameraTransitionChange,
    onZoomChange,
  },
  ref,
) {
  const controls = useRef<MapControlsImpl>(null);
  const camera = useRef<OrthographicCameraType>(null);
  const [hoveredRegion, setHoveredRegion] = useState<EnneagramType | null>(null);
  const [focusedRegion, setFocusedRegion] = useState<EnneagramType | null>(null);
  const [regionInteractionEnabled, setRegionInteractionEnabled] = useState(true);
  const regionInteractionEnabledRef = useRef(true);
  const lastFocusedRegion = useRef<EnneagramType | null>(null);
  const lastZoom = useRef(0);
  const target = useRef<{ position: Vector3; zoom: number; factor: number } | null>(null);
  const { gl } = useThree();

  useImperativeHandle(ref, () => ({
    reset: () => {
      target.current = { position: new Vector3(0, 0, 50), zoom: 10, factor: 0.085 };
      onCameraTransitionChange(true);
      controls.current?.target.set(0, 0, 0);
    },
    focusType: (type) => {
      const region = TYPE_REGIONS[type - 1];
      target.current = { position: new Vector3(region.position[0], region.position[1], 50), zoom: 46, factor: 0.1 };
      onCameraTransitionChange(true);
      controls.current?.target.set(region.position[0], region.position[1], 0);
    },
    navigateType: (type) => {
      const region = TYPE_REGIONS[type - 1];
      target.current = { position: new Vector3(region.position[0], region.position[1], 50), zoom: camera.current?.zoom ?? 46, factor: 0.145 };
      onCameraTransitionChange(true);
      controls.current?.target.set(region.position[0], region.position[1], 0);
    },
  }));

  useFrame(() => {
    if (!camera.current || !controls.current) return;
    const currentCamera = camera.current;
    controls.current.target.x = MathUtils.clamp(controls.current.target.x, -54, 54);
    controls.current.target.y = MathUtils.clamp(controls.current.target.y, -12, 12);
    if (target.current) {
      const factor = reducedMotion ? 1 : target.current.factor;
      currentCamera.position.lerp(target.current.position, factor);
      currentCamera.zoom = MathUtils.lerp(currentCamera.zoom, target.current.zoom, factor);
      currentCamera.updateProjectionMatrix();
      if (currentCamera.position.distanceTo(target.current.position) < 0.03 && Math.abs(currentCamera.zoom - target.current.zoom) < 0.03) {
        target.current = null;
        onCameraTransitionChange(false);
      }
    }

    let nextFocusedRegion: EnneagramType | null = null;
    if (currentCamera.zoom >= 22) {
      let closestDistance = Number.POSITIVE_INFINITY;
      TYPE_REGIONS.forEach((region) => {
        const distance = Math.hypot(
          controls.current!.target.x - region.position[0],
          (controls.current!.target.y - region.position[1]) * 0.75,
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          nextFocusedRegion = region.type;
        }
      });
      if (closestDistance > 7.2) nextFocusedRegion = null;
    }
    if (nextFocusedRegion !== lastFocusedRegion.current) {
      lastFocusedRegion.current = nextFocusedRegion;
      setFocusedRegion(nextFocusedRegion);
      onFocusedRegionChange(nextFocusedRegion);
    }
    if (Math.abs(lastZoom.current - currentCamera.zoom) > 0.08) {
      lastZoom.current = currentCamera.zoom;
      onZoomChange(currentCamera.zoom);
    }
    const nextRegionInteraction = regionInteractionEnabledRef.current
      ? currentCamera.zoom < 28
      : currentCamera.zoom <= 23.5;
    if (nextRegionInteraction !== regionInteractionEnabledRef.current) {
      regionInteractionEnabledRef.current = nextRegionInteraction;
      setRegionInteractionEnabled(nextRegionInteraction);
      if (!nextRegionInteraction) {
        setHoveredRegion(null);
        onRegionHover(null);
        gl.domElement.style.cursor = '';
      }
    }
  });

  useEffect(() => {
    const canvas = gl.domElement;
    const preventPageZoom = (event: WheelEvent) => event.preventDefault();
    canvas.addEventListener('wheel', preventPageZoom, { passive: false });
    return () => canvas.removeEventListener('wheel', preventPageZoom);
  }, [gl]);

  const setHover = (type: EnneagramType | null) => {
    setHoveredRegion(type);
    onRegionHover(type);
  };

  return (
    <>
      <OrthographicCamera ref={camera} makeDefault position={[0, 0, 50]} zoom={10} near={0.1} far={100} />
      <StableNavigation
        ref={controls}
        reducedMotion={reducedMotion}
        onStart={() => { target.current = null; onCameraTransitionChange(false); }}
        onRecover={() => {
          setHover(null);
          onPointHover(null);
        }}
      />
      <color attach="background" args={['#060705']} />
      <fog attach="fog" args={['#060705', 35, 76]} />
      <Dust count={420} seedOffset={0} depth={-3.5} size={0.058} opacity={0.45} speed={0.034} parallax={0.08} reducedMotion={reducedMotion} />
      <Dust count={280} seedOffset={677} depth={-7.5} size={0.034} opacity={0.34} speed={0.021} parallax={0.18} reducedMotion={reducedMotion} />
      <Dust count={140} seedOffset={1291} depth={-1.8} size={0.08} opacity={0.24} speed={0.048} parallax={-0.035} reducedMotion={reducedMotion} />
      <AmbientComets reducedMotion={reducedMotion} />
      {TYPE_REGIONS.slice(0, -1).map((region) => (
        <mesh key={`divider-${region.type}`} position={[region.position[0] + 6, 0, -2.4]}>
          <planeGeometry args={[0.025, 34]} />
          <meshBasicMaterial color="#d8cbaa" transparent opacity={0.055} depthWrite={false} />
        </mesh>
      ))}
      <InstinctFields profile={profile} focusedRegion={focusedRegion} />
      {TYPE_REGIONS.map((region) => (
        <Region
          key={region.type}
          type={region.type}
          hovered={hoveredRegion === region.type}
          selected={selectedRegion === region.type}
          focused={focusedRegion === region.type}
          interactive={regionInteractionEnabled}
          strength={profile.scores.find((score) => score.type === region.type)?.normalized ?? 0}
          strongest={profile.dominantTypes.includes(region.type)}
          nearTop={(profile.scores.find((score) => score.type === profile.dominantTypes[0])?.normalized ?? 0) - (profile.scores.find((score) => score.type === region.type)?.normalized ?? 0) <= 0.035}
          reducedMotion={reducedMotion}
          onHover={setHover}
          onSelect={onRegionSelect}
        />
      ))}
      <DataLights
        points={profile.points}
        strongestTypes={profile.dominantTypes}
        reducedMotion={reducedMotion}
        onPointHover={onPointHover}
        onPointSelect={onPointSelect}
      />
    </>
  );
});

export const ConstellationScene = forwardRef<ConstellationHandle, SceneProps>(function ConstellationScene(props, ref) {
  return (
    <Canvas
      className="constellation-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onPointerMissed={() => {
        props.onRegionHover(null);
        props.onPointHover(null);
        props.onPointClear();
      }}
    >
      <CameraRig {...props} ref={ref} />
    </Canvas>
  );
});
