import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function XObject() {
  const g = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!g.current) return;
    const { x, y } = state.pointer;
    const scroll = typeof window !== "undefined" ? window.scrollY / window.innerHeight : 0;
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, x * 0.6 + state.clock.elapsedTime * 0.15 + scroll * 1.5, 3, dt);
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, -y * 0.4 + scroll * 0.4, 3, dt);
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, scroll * 1.2, 4, dt);
  });
  const mat = (
    <meshPhysicalMaterial color="#d9dcd6" metalness={1} roughness={0.12} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={1.4} />
  );
  return (
    <group ref={g} rotation={[0, 0, 0]}>
      <RoundedBox args={[0.7, 4.2, 0.7]} radius={0.3} smoothness={6} rotation={[0, 0, Math.PI / 4]}>{mat}</RoundedBox>
      <RoundedBox args={[0.7, 4.2, 0.7]} radius={0.3} smoothness={6} rotation={[0, 0, -Math.PI / 4]}>{mat}</RoundedBox>
    </group>
  );
}

export default function HeroX() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 7], fov: 40 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.2} />
      <XObject />
      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 5, -2]} scale={[10, 2, 1]} />
        <Lightformer intensity={2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[10, 1, 1]} />
        <Lightformer intensity={4} color="#c8ff4d" position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[6, 0.4, 1]} />
        <Lightformer intensity={1} position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>
    </Canvas>
  );
}
