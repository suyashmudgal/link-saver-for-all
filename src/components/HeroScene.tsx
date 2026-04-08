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
        <MeshDistortMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.3} distort={0.25} speed={2} roughness={0.15} metalness={0.9} wireframe />
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
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a78bfa" transparent opacity={0.6} sizeAttenuation />
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
      <pointLight position={[5, 5, 5]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-5, -3, 3]} intensity={0.6} color="#06b6d4" />
      <CoreShape />
      <OrbitRing radius={2} speed={0.5} color="#8b5cf6" />
      <OrbitRing radius={2.5} speed={-0.35} color="#06b6d4" />
      <OrbitRing radius={1.8} speed={0.7} color="#c084fc" />
      <NetworkNode position={[-2.5, 1.5, -1]} color="#8b5cf6" size={0.12} />
      <NetworkNode position={[2.8, -1, 0.5]} color="#06b6d4" size={0.1} />
      <NetworkNode position={[-1.5, -2, 1]} color="#c084fc" size={0.14} />
      <NetworkNode position={[1.5, 2.2, -0.5]} color="#a78bfa" size={0.11} />
      <Particles />
      <CameraRig />
    </Canvas>
  </div>
);

export default HeroScene;
