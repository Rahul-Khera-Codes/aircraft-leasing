"use client";

import * as THREE from "three";
import React, { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float } from "@react-three/drei";

type PartStatus = "green" | "amber" | "red";

const STATUS_COLOR: Record<PartStatus, string> = {
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
};

interface HelicopterModelProps {
  status: {
    undercarriage: PartStatus;
    wings: PartStatus;
    engines: PartStatus;
  };
  onPartClick: (part: string) => void;
  activePart: string | null;
}

function makeMat(
  color: string,
  activePart: string | null,
  part: string,
  emissiveIntensity = 0.35
): THREE.MeshStandardMaterial {
  const faded = activePart !== null && activePart !== part;
  return new THREE.MeshStandardMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: faded ? 0.07 : 0.65,
    emissive: color,
    emissiveIntensity: activePart === part ? 1.0 : emissiveIntensity,
  });
}

function HelicopterMesh({ status, onPartClick, activePart }: HelicopterModelProps) {
  const mainRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (mainRotorRef.current) mainRotorRef.current.rotation.y += dt * 3.0;
    if (tailRotorRef.current) tailRotorRef.current.rotation.z += dt * 8.0;
  });

  const matBody = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#94a3b8",
        wireframe: true,
        transparent: true,
        opacity: activePart !== null && activePart !== "fuselage" ? 0.07 : 0.6,
      }),
    [activePart]
  );

  const matGlass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#93c5fd",
        wireframe: true,
        transparent: true,
        opacity: activePart !== null && activePart !== "fuselage" ? 0.05 : 0.45,
      }),
    [activePart]
  );

  const matRotor = useMemo(
    () => makeMat(STATUS_COLOR[status.wings], activePart, "wings"),
    [status.wings, activePart]
  );

  const matEngine = useMemo(
    () => makeMat(STATUS_COLOR[status.engines], activePart, "engines"),
    [status.engines, activePart]
  );

  const matSkids = useMemo(
    () => makeMat(STATUS_COLOR[status.undercarriage], activePart, "undercarriage", 0.55),
    [status.undercarriage, activePart]
  );

  const click = (part: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onPartClick(part);
  };

  return (
    // Slight rotation so we see the helicopter at an angle (not directly side-on)
    <group rotation={[0, Math.PI * 0.15, 0]}>

      {/* ── FUSELAGE BODY ── */}
      <group onClick={click("fuselage")}>
        {/* Main fuselage — horizontal cylinder along X */}
        <mesh material={matBody} position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.78, 0.72, 3.0, 16, 1]} />
        </mesh>
        {/* Forward fuselage cap (nose transition) */}
        <mesh material={matBody} position={[1.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <sphereGeometry args={[0.78, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
        {/* Aft fuselage cap */}
        <mesh material={matBody} position={[-1.8, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <sphereGeometry args={[0.72, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        </mesh>
        {/* Cockpit bubble (glazing) */}
        <mesh material={matGlass} position={[1.45, -0.08, 0]}>
          <sphereGeometry args={[0.72, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
        </mesh>
        {/* Upper cockpit frame */}
        <mesh material={matBody} position={[1.3, 0.15, 0]}>
          <sphereGeometry args={[0.55, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        </mesh>
      </group>

      {/* ── ENGINE FAIRING (on top of fuselage) ── */}
      <group onClick={click("engines")}>
        <mesh material={matEngine} position={[-0.15, 0.93, 0]}>
          <boxGeometry args={[1.95, 0.52, 1.1]} />
        </mesh>
        {/* Left intake */}
        <mesh material={matEngine} position={[0.45, 0.9, -0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.16, 0.42, 10]} />
        </mesh>
        {/* Right intake */}
        <mesh material={matEngine} position={[0.45, 0.9, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.16, 0.42, 10]} />
        </mesh>
        {/* Left exhaust */}
        <mesh material={matEngine} position={[-0.75, 0.98, -0.45]} rotation={[0, 0.25, -0.15]}>
          <cylinderGeometry args={[0.08, 0.065, 0.38, 8]} />
        </mesh>
        {/* Right exhaust */}
        <mesh material={matEngine} position={[-0.75, 0.98, 0.45]} rotation={[0, -0.25, -0.15]}>
          <cylinderGeometry args={[0.08, 0.065, 0.38, 8]} />
        </mesh>
        {/* Rotor mast */}
        <mesh material={matEngine} position={[-0.15, 1.28, 0]}>
          <cylinderGeometry args={[0.11, 0.13, 0.5, 10]} />
        </mesh>
      </group>

      {/* ── TAIL BOOM ── */}
      <group onClick={click("fuselage")}>
        {/* Tapered tail boom cylinder */}
        <mesh material={matBody} position={[-3.1, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.42, 3.2, 10, 1]} />
        </mesh>
        {/* Vertical stabilizer fin */}
        <mesh material={matBody} position={[-4.55, 0.82, 0]}>
          <boxGeometry args={[0.55, 1.45, 0.065]} />
        </mesh>
        {/* Port horizontal stabilizer */}
        <mesh material={matBody} position={[-4.35, 0.1, -1.0]}>
          <boxGeometry args={[0.48, 0.065, 1.7]} />
        </mesh>
        {/* Starboard horizontal stabilizer */}
        <mesh material={matBody} position={[-4.35, 0.1, 1.0]}>
          <boxGeometry args={[0.48, 0.065, 1.7]} />
        </mesh>
      </group>

      {/* ── MAIN ROTOR (spinning, 4 blades) ── */}
      <group
        ref={mainRotorRef}
        position={[-0.15, 1.58, 0]}
        onClick={click("wings")}
      >
        {/* Hub disk */}
        <mesh material={matRotor}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 12]} />
        </mesh>
        {/* 4 blades at 90° intervals */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh material={matRotor} position={[2.55, 0.02, 0]} rotation={[0, 0, 0.035]}>
              <boxGeometry args={[4.6, 0.065, 0.36]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── TAIL ROTOR (spinning, 4 blades) ── */}
      <group
        ref={tailRotorRef}
        position={[-4.68, 0.88, 0.22]}
        onClick={click("wings")}
      >
        <mesh material={matRotor} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.12, 8]} />
        </mesh>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <group key={i} rotation={[angle, 0, 0]}>
            <mesh material={matRotor} position={[0, 0.58, 0]}>
              <boxGeometry args={[0.04, 0.95, 0.15]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── SKIDS / UNDERCARRIAGE ── */}
      <group onClick={click("undercarriage")}>
        {/* Port skid — fore-aft bar */}
        <mesh material={matSkids} position={[0.2, -1.02, -0.82]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.042, 0.042, 3.1, 8]} />
        </mesh>
        {/* Starboard skid */}
        <mesh material={matSkids} position={[0.2, -1.02, 0.82]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.042, 0.042, 3.1, 8]} />
        </mesh>
        {/* Forward cross tube */}
        <mesh material={matSkids} position={[0.85, -1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 1.64, 8]} />
        </mesh>
        {/* Aft cross tube */}
        <mesh material={matSkids} position={[-0.45, -1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 1.64, 8]} />
        </mesh>
        {/* Forward port strut */}
        <mesh material={matSkids} position={[0.85, -0.58, -0.82]} rotation={[0, 0, 0.28]}>
          <cylinderGeometry args={[0.028, 0.028, 0.55, 8]} />
        </mesh>
        {/* Forward starboard strut */}
        <mesh material={matSkids} position={[0.85, -0.58, 0.82]} rotation={[0, 0, 0.28]}>
          <cylinderGeometry args={[0.028, 0.028, 0.55, 8]} />
        </mesh>
        {/* Aft port strut */}
        <mesh material={matSkids} position={[-0.45, -0.58, -0.82]} rotation={[0, 0, -0.22]}>
          <cylinderGeometry args={[0.028, 0.028, 0.55, 8]} />
        </mesh>
        {/* Aft starboard strut */}
        <mesh material={matSkids} position={[-0.45, -0.58, 0.82]} rotation={[0, 0, -0.22]}>
          <cylinderGeometry args={[0.028, 0.028, 0.55, 8]} />
        </mesh>
      </group>
    </group>
  );
}

const Helicopter = (props: HelicopterModelProps) => (
  <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.45} floatingRange={[-0.08, 0.08]}>
    <HelicopterMesh {...props} />
  </Float>
);

export default function HelicopterCanvas({ status, onPartClick, activePart }: HelicopterModelProps) {
  const cameraSettings = React.useMemo(
    () => ({ position: [14, 7, 14] as [number, number, number], fov: 48 }),
    []
  );

  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      <Canvas camera={cameraSettings} shadows>
        <color attach="background" args={["#ffffff"]} />

        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, 5, -10]} intensity={1.0} color="#ffffff" />
        <pointLight position={[0, -5, 5]} intensity={0.5} color="#ffffff" />
        <spotLight
          position={[12, 18, 6]}
          angle={0.3}
          penumbra={1}
          intensity={3}
          castShadow
          color="#ffffff"
        />

        <Suspense fallback={null}>
          <Environment preset="night" />
          <Helicopter status={status} onPartClick={onPartClick} activePart={activePart} />
          <ContactShadows
            position={[0, -4, 0]}
            opacity={0.35}
            scale={30}
            blur={2}
            far={10}
            color="#000000"
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableRotate
          enableZoom
          minDistance={8}
          maxDistance={30}
          enableDamping
          dampingFactor={0.05}
          target={[0, 0, 0]}
          makeDefault
        />
      </Canvas>

      {!activePart && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md text-[10px] font-mono text-slate-400/80 uppercase tracking-widest pointer-events-none z-10">
          Drag to rotate · Scroll to zoom
        </div>
      )}
    </div>
  );
}
