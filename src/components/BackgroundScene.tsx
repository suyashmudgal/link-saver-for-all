import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 60;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.04} color="#10b981" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function FloatingOrb({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed) * 0.6;
    ref.current.position.x = position[0] + Math.cos(clock.elapsedTime * speed * 0.7) * 0.3;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} />
    </mesh>
  );
}

const BackgroundScene = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none">
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ alpha: true, antialias: false, powerPreference: "low-power" }} dpr={[1, 1.5]}>
      <Particles />
      <FloatingOrb position={[-3, 2, -2]} color="#10b981" speed={0.5} />
      <FloatingOrb position={[4, -1, -3]} color="#14b8a6" speed={0.7} />
      <FloatingOrb position={[0, 3, -4]} color="#f59e0b" speed={0.4} />
    </Canvas>
  </div>
);

export default BackgroundScene;
