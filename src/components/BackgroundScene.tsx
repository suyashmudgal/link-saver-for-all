import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FloatingParticles = () => {
  const count = 80;
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.025;
    ref.current.rotation.x += delta * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="hsl(243, 75%, 65%)" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
};

const GlowSphere = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null!);
  const initialY = position[1];
  useFrame(({ clock }) => {
    ref.current.position.y = initialY + Math.sin(clock.elapsedTime * 0.5) * 0.3;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
  );
};

const DriftingRing = ({ position, speed, color, radius = 0.6 }: { position: [number, number, number]; speed: number; color: string; radius?: number }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * speed * 0.3;
    ref.current.rotation.y += delta * speed * 0.5;
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[radius, 0.015, 16, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.18} />
    </mesh>
  );
};

const BackgroundScene = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
    <Canvas dpr={[1, 1.2]} camera={{ position: [0, 0, 6], fov: 55 }} gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}>
      <FloatingParticles />
      <DriftingRing position={[-3, 2, -2]} speed={0.35} color="hsl(243, 75%, 60%)" radius={0.8} />
      <DriftingRing position={[3, -1.5, -3]} speed={-0.25} color="hsl(190, 95%, 55%)" radius={0.7} />
      <DriftingRing position={[0, -2.5, -1.5]} speed={0.2} color="hsl(340, 80%, 55%)" radius={0.5} />
      <DriftingRing position={[-1.5, -0.5, -4]} speed={0.15} color="hsl(160, 70%, 50%)" radius={0.9} />
      <GlowSphere position={[-4, 3, -3]} color="hsl(243, 75%, 60%)" scale={2} />
      <GlowSphere position={[4, -2, -4]} color="hsl(190, 95%, 55%)" scale={1.8} />
      <GlowSphere position={[1, 3, -5]} color="hsl(340, 80%, 55%)" scale={1.5} />
    </Canvas>
  </div>
);

export default BackgroundScene;
