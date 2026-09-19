import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

function EscalatorSteps({ stepsCount, width, height, length, angle }) {
    const meshRef = useRef();

    // إعداد الماتريكس لكل درجة باستخدام Instancing
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
        if (!meshRef.current) return;

        for (let i = 0; i < stepsCount; i++) {
            const t = i / (stepsCount - 1);
            const z = -length / 2 + t * length;
            const y = t * height;

            dummy.position.set(0, y + 0.35, z);
            dummy.rotation.set(angle, 0, 0);
            dummy.updateMatrix();

            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [stepsCount, length, height, angle, dummy]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[null, null, stepsCount]}
        >
            <boxGeometry args={[width * 0.78, 0.14, 0.45]} />
            <meshStandardMaterial
                color="#8d96a3"
                metalness={0.85}
                roughness={0.22}
            />
        </instancedMesh>
    );
}

function Escalator({ position, rotation = 0 }) {
    const width = 3.2;
    const length = 13;
    const height = 5.5;
    const stepsCount = 24;

    const angle = -Math.atan2(height, length);

    return (
        <group position={position} rotation={[0, rotation, 0]}>

            {/* ================= BODY ================= */}
            <mesh position={[0, height / 2, 0]} rotation={[angle, 0, 0]}>
                <boxGeometry args={[width, 0.55, length]} />
                <meshStandardMaterial color="#252b36" metalness={0.75} roughness={0.28} />
            </mesh>

            {/* ================= STEPS (INSTANCED) ================= */}
            <EscalatorSteps
                stepsCount={stepsCount}
                width={width}
                height={height}
                length={length}
                angle={angle}
            />

            {/* ================= LEFT & RIGHT GLASS ================= */}
            <mesh position={[-(width / 2) - 0.08, height / 2 + 0.85, 0]} rotation={[angle, 0, 0]}>
                <boxGeometry args={[0.08, 1.8, length]} />
                <meshPhysicalMaterial
                    color="#9edfff"
                    transparent
                    opacity={0.22}
                    roughness={0.05}
                    metalness={0.3}
                    transmission={0.2}
                />
            </mesh>

            <mesh position={[width / 2 + 0.08, height / 2 + 0.85, 0]} rotation={[angle, 0, 0]}>
                <boxGeometry args={[0.08, 1.8, length]} />
                <meshPhysicalMaterial
                    color="#9edfff"
                    transparent
                    opacity={0.22}
                    roughness={0.05}
                    metalness={0.3}
                    transmission={0.2}
                />
            </mesh>

            {/* ================= HANDRAILS ================= */}
            <mesh position={[-(width / 2) - 0.12, height / 2 + 1.75, 0]} rotation={[angle, 0, 0]}>
                <boxGeometry args={[0.16, 0.16, length + 0.5]} />
                <meshStandardMaterial color="#171b25" metalness={0.9} roughness={0.18} />
            </mesh>

            <mesh position={[width / 2 + 0.12, height / 2 + 1.75, 0]} rotation={[angle, 0, 0]}>
                <boxGeometry args={[0.16, 0.16, length + 0.5]} />
                <meshStandardMaterial color="#171b25" metalness={0.9} roughness={0.18} />
            </mesh>

            {/* ================= LED STRIPS ================= */}
            <mesh position={[-(width / 2) - 0.16, height / 2 + 0.25, 0]} rotation={[angle, 0, 0]}>
                <boxGeometry args={[0.08, 0.08, length]} />
                <meshStandardMaterial color="#7c3cff" emissive="#7c3cff" emissiveIntensity={2} />
            </mesh>

            <mesh position={[width / 2 + 0.16, height / 2 + 0.25, 0]} rotation={[angle, 0, 0]}>
                <boxGeometry args={[0.08, 0.08, length]} />
                <meshStandardMaterial color="#7c3cff" emissive="#7c3cff" emissiveIntensity={2} />
            </mesh>

            {/* ================= LOWER & UPPER LANDINGS ================= */}
            <mesh position={[0, 0.08, -length / 2 - 1.4]}>
                <boxGeometry args={[width + 1.6, 0.16, 2.8]} />
                <meshStandardMaterial color="#c7cbd1" roughness={0.5} />
            </mesh>

            <mesh position={[0, height + 0.08, length / 2 + 1.4]}>
                <boxGeometry args={[width + 1.6, 0.16, 2.8]} />
                <meshStandardMaterial color="#c7cbd1" roughness={0.5} />
            </mesh>

        </group>
    );
}

export default function Escalators() {
    return (
        <group>
            {/* LEFT ESCALATOR */}
            <Escalator position={[-27, 0, 0]} rotation={Math.PI / 2} />

            {/* RIGHT ESCALATOR */}
            <Escalator position={[27, 0, 0]} rotation={-Math.PI / 2} />
        </group>
    );
}