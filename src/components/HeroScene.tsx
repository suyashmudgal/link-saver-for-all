import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Trail } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function NetworkNode({ position, color, size = 0.15 }: { position: [number, number, number]; color: string; size?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.3 + Math.random() * 0.5, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed + offset) * 0.3;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} metalness={0.8} />
    </mesh>
  );
}

function OrbitRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = Math.sin(t * 0.7) * 0.5;
  });

  return (
    <Trail width={0.8} length={8} color={color} attenuation={(w) => w * w}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
    </Trail>
  );
}

function CoreShape() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.elapsedTime * 0.15;
    ref.current.rotation.y = clock.elapsedTime * 0.2;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial color="#1e40af" emissive="#1e40af" emissiveIntensity={0.3} distort={0.25} speed={2} roughness={0.15} metalness={0.9} wireframe />
      </mesh>
    </Float>
  );
}

function Particles() {
  const count = 80;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.03} color="#60a5fa" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function CameraRig() {
  const { camera } = useThree();
  useFrame(({ pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.8, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.5, 0.03);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const HeroScene = () => (
  <div className="absolute inset-0 -z-10 opacity-70">
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
      <pointLight position={[-5, -3, 3]} intensity={0.6} color="#06b6d4" />

      <CoreShape />
      <OrbitRing radius={2} speed={0.5} color="#3b82f6" />
      <OrbitRing radius={2.5} speed={-0.35} color="#06b6d4" />
      <OrbitRing radius={1.8} speed={0.7} color="#818cf8" />

      <NetworkNode position={[-2.5, 1.5, -1]} color="#3b82f6" size={0.12} />
      <NetworkNode position={[2.8, -1, 0.5]} color="#06b6d4" size={0.1} />
      <NetworkNode position={[-1.5, -2, 1]} color="#818cf8" size={0.14} />
      <NetworkNode position={[1.5, 2.2, -0.5]} color="#60a5fa" size={0.11} />

      <Particles />
      <CameraRig />
    </Canvas>
  </div>
);

export default HeroScene;
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Trail } from "@react-three/drei";
import * as THREE from "three";

/* ── Torus Knot that spins and glows ── */
const GlowingKnot = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.15;
    ref.current.rotation.y = state.clock.elapsedTime * 0.25;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={ref} position={[0, 0, -2]}>
        <torusKnotGeometry args={[1.4, 0.35, 128, 32]} />
        <MeshDistortMaterial
          color="#7c3aed"
          roughness={0.1}
          metalness={0.95}
          distort={0.25}
          speed={2}
          transparent
          opacity={0.55}
        />
      </mesh>
    </Float>
  );
};

/* ── Orbiting sphere with trail ── */
const OrbitingSphere = ({ radius, speed, color, size, offset }: { radius: number; speed: number; color: string; size: number; offset: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t * 0.7) * (radius * 0.5);
    ref.current.position.z = Math.sin(t) * radius * 0.6 - 2;
  });
  return (
    <Trail width={0.3} length={6} color={color} attenuation={(w) => w * w}>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} metalness={0.8} />
      </mesh>
    </Trail>
  );
};

/* ── Floating gem / crystal ── */
const FloatingCrystal = ({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * speed;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.3;
  });
  return (
    <Float speed={speed * 0.8} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={ref} position={position}>
        <octahedronGeometry args={[0.5, 0]} />
        <MeshWobbleMaterial
          color={color}
          factor={0.3}
          speed={speed}
          roughness={0.05}
          metalness={1}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
};

/* ── Particle ring ── */
const ParticleRing = () => {
  const count = 200;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 3.5 + (Math.random() - 0.5) * 1.2;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      arr[i * 3 + 2] = Math.sin(angle) * r - 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#a78bfa" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
};

/* ── Scattered background particles ── */
const BackgroundParticles = () => {
  const count = 120;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#34d399" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
};

/* ── Mouse-reactive camera ── */
const CameraRig = () => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const mx = state.pointer.x * 0.3;
    const my = state.pointer.y * 0.2;
    mouse.current.x += (mx - mouse.current.x) * 0.05;
    mouse.current.y += (my - mouse.current.y) * 0.05;
    camera.position.x = mouse.current.x;
    camera.position.y = mouse.current.y + 0.3;
    camera.lookAt(0, 0, -2);
  });

  return null;
};

/* ── Main scene export ── */
const HeroScene = () => {
  return (
    <div className="absolute inset-0 -z-10" style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", pointerEvents: "auto" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#c084fc" />
        <pointLight position={[-5, 3, 2]} intensity={0.6} color="#34d399" />
        <pointLight position={[3, -3, 0]} intensity={0.4} color="#818cf8" />

        <GlowingKnot />
        <OrbitingSphere radius={2.8} speed={0.6} color="#34d399" size={0.18} offset={0} />
        <OrbitingSphere radius={2.2} speed={0.9} color="#c084fc" size={0.12} offset={Math.PI} />
        <OrbitingSphere radius={3.2} speed={0.4} color="#f472b6" size={0.15} offset={Math.PI / 2} />
        
        <FloatingCrystal position={[-3.5, 1.8, -3]} color="#6366f1" speed={1.5} />
        <FloatingCrystal position={[3.8, -1.2, -4]} color="#22d3ee" speed={1} />
        <FloatingCrystal position={[1, 3, -5]} color="#f97316" speed={0.8} />

        <ParticleRing />
        <BackgroundParticles />
        <CameraRig />
      </Canvas>
    </div>
  );
};

export default HeroScene;
