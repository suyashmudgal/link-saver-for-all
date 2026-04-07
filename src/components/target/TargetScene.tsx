import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Trail } from "@react-three/drei";
import * as THREE from "three";

const RotatingRing = ({ radius, speed, color }: { radius: number; speed: number; color: string }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * speed * 0.5;
    ref.current.rotation.y += delta * speed;
  });
  return (
    <Trail width={1.5} length={6} color={color} attenuation={(w) => w * w}>
      <mesh ref={ref} position={[radius, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </Trail>
  );
};

const CoreShape = () => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.4;
    ref.current.rotation.z += delta * 0.2;
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial
          color="hsl(243, 75%, 59%)"
          emissive="hsl(243, 75%, 59%)"
          emissiveIntensity={0.4}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
};

const Particles = () => {
  const count = 40;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="hsl(190, 95%, 60%)" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const TargetScene = () => (
  <div className="w-full h-32 md:h-40 rounded-2xl overflow-hidden">
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 3], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={1} color="hsl(243, 75%, 70%)" />
      <pointLight position={[-3, -2, 2]} intensity={0.5} color="hsl(190, 95%, 60%)" />
      <CoreShape />
      <RotatingRing radius={1.2} speed={1.2} color="hsl(190, 95%, 60%)" />
      <RotatingRing radius={1.5} speed={-0.8} color="hsl(340, 82%, 60%)" />
      <Particles />
    </Canvas>
  </div>
);

export default TargetScene;
