import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FloatingParticles = () => {
  const count = 60;
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.02;
    ref.current.rotation.x += delta * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="hsl(243, 75%, 65%)" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
};

const DriftingRing = ({ position, speed, color }: { position: [number, number, number]; speed: number; color: string }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * speed * 0.3;
    ref.current.rotation.y += delta * speed * 0.5;
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.6, 0.02, 16, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.15} />
    </mesh>
  );
};

const BackgroundScene = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none">
    <Canvas dpr={[1, 1.2]} camera={{ position: [0, 0, 5], fov: 60 }} gl={{ alpha: true, antialias: false }}>
      <FloatingParticles />
      <DriftingRing position={[-2, 1.5, -1]} speed={0.4} color="hsl(243, 75%, 60%)" />
      <DriftingRing position={[2.5, -1, -2]} speed={-0.3} color="hsl(190, 95%, 55%)" />
      <DriftingRing position={[0, -2, -1.5]} speed={0.25} color="hsl(340, 80%, 55%)" />
    </Canvas>
  </div>
);

export default BackgroundScene;
