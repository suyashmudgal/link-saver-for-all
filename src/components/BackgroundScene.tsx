import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function FloatingParticles() {
  const count = 60;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.008;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.01) * 0.05;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#8b5cf6" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function GlowSphere({ position, color, size = 0.08 }: { position: [number, number, number]; color: string; size?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.2 + Math.random() * 0.3, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed + offset) * 0.4;
    ref.current.position.x = position[0] + Math.cos(clock.elapsedTime * speed * 0.7 + offset) * 0.2;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} metalness={0.8} transparent opacity={0.6} />
    </mesh>
  );
}

function DriftingRing({ position, color, size = 1.2 }: { position: [number, number, number]; color: string; size?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.1 + Math.random() * 0.15, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.elapsedTime * speed;
    ref.current.rotation.z = clock.elapsedTime * speed * 0.5;
  });
  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={ref} position={position}>
        <torusGeometry args={[size, 0.015, 16, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.25} />
      </mesh>
    </Float>
  );
}

const BackgroundScene = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none">
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}>
      <ambientLight intensity={0.15} />
      <pointLight position={[8, 6, 5]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[-6, -4, 3]} intensity={0.3} color="#06b6d4" />
      <FloatingParticles />
      <GlowSphere position={[-4, 2, -2]} color="#8b5cf6" size={0.1} />
      <GlowSphere position={[5, -2, -1]} color="#06b6d4" size={0.08} />
      <GlowSphere position={[-2, -3, 0]} color="#c084fc" size={0.07} />
      <GlowSphere position={[3, 3, -3]} color="#22d3ee" size={0.09} />
      <DriftingRing position={[-3, 1, -2]} color="#8b5cf6" size={1.5} />
      <DriftingRing position={[4, -1, -3]} color="#06b6d4" size={1} />
      <DriftingRing position={[0, 2, -4]} color="#c084fc" size={2} />
    </Canvas>
  </div>
);

export default BackgroundScene;
