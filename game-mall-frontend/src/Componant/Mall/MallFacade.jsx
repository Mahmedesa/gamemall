import  { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

/* =========================================================================
   CURVED GLASS PANEL (Instanced optimization or combined logic)
========================================================================= */
function CurvedFacade({
    radiusX,
    radiusZ,
    y,
    height,
    segments = 48,
    openingWidth = 0,
}) {
    // تجميع الحسابات لتقليل إعادة الإنشاء
    const panelsData = useMemo(() => {
        const items = [];
        for (let i = 0; i < segments; i++) {
            const a1 = (i / segments) * Math.PI * 2;
            const a2 = ((i + 1) / segments) * Math.PI * 2;

            const x1 = radiusX * Math.cos(a1);
            const z1 = radiusZ * Math.sin(a1);
            const x2 = radiusX * Math.cos(a2);
            const z2 = radiusZ * Math.sin(a2);

            const x = (x1 + x2) / 2;
            const z = (z1 + z2) / 2;

            const dx = x2 - x1;
            const dz = z2 - z1;
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(-dz, dx);

            const isEntranceArea = z < -radiusZ + 10 && Math.abs(x) < openingWidth / 2;
            if (!isEntranceArea) {
                items.push({ x, z, length: length + 0.15, angle });
            }
        }
        return items;
    }, [radiusX, radiusZ, segments, openingWidth]);

    return (
        <group y={y}>
            {panelsData.map((panel, i) => (
                <group key={i} position={[panel.x, y, panel.z]} rotation={[0, panel.angle, 0]}>
                    {/* Glass */}
                    <mesh position={[0, height / 2, 0]}>
                        <boxGeometry args={[panel.length, height, 0.22]} />
                        <meshPhysicalMaterial
                            color="#9edfff"
                            transparent
                            opacity={0.24}
                            roughness={0.08}
                            metalness={0.45}
                            transmission={0.25}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Interior glow */}
                    <mesh position={[0, height * 0.48, -0.13]}>
                        <boxGeometry args={[panel.length * 0.78, height * 0.72, 0.04]} />
                        <meshStandardMaterial
                            color="#8ddcff"
                            emissive="#38bdf8"
                            emissiveIntensity={0.35}
                            transparent
                            opacity={0.08}
                        />
                    </mesh>

                    {/* Bottom metal frame */}
                    <mesh position={[0, 0.12, 0]}>
                        <boxGeometry args={[panel.length, 0.22, 0.32]} />
                        <meshStandardMaterial color="#4b5563" metalness={0.85} roughness={0.25} />
                    </mesh>

                    {/* Top metal frame */}
                    <mesh position={[0, height - 0.12, 0]}>
                        <boxGeometry args={[panel.length, 0.22, 0.32]} />
                        <meshStandardMaterial color="#4b5563" metalness={0.85} roughness={0.25} />
                    </mesh>

                    {/* Vertical center frame */}
                    <mesh position={[0, height / 2, 0.14]}>
                        <boxGeometry args={[0.14, height, 0.14]} />
                        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/* =========================================================================
   CURVED CONTINUOUS TUBE / RING (استبدال 96/64 mesh بـ mesh واحد فقط)
========================================================================= */
function CurvedTubeRing({ radiusX, radiusZ, y, radius = 0.1, color = "#38bdf8", emissive = false }) {
    const geometry = useMemo(() => {
        const curve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            radiusX, radiusZ, // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,           // aClockwise
            0                // aRotation
        );
        const points = curve.getPoints(64).map(p => new THREE.Vector3(p.x, 0, p.y));
        const path = new THREE.CatmullRomCurve3(points, true);
        return new THREE.TubeGeometry(path, 64, radius, 8, true);
    }, [radiusX, radiusZ, radius]);

    return (
        <mesh geometry={geometry} position={[0, y, 0]}>
            {emissive ? (
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
            ) : (
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
            )}
        </mesh>
    );
}

/* =========================================================================
   VERTICAL EXTERIOR COLUMNS
========================================================================= */
function CurvedColumns({ radiusX, radiusZ, y, height, segments = 24 }) {
    const columns = useMemo(() => {
        const items = [];
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = radiusX * Math.cos(angle);
            const z = radiusZ * Math.sin(angle);
            items.push({ x, z });
        }
        return items;
    }, [radiusX, radiusZ, segments]);

    return (
        <group>
            {columns.map((col, i) => (
                <group key={i} position={[col.x, y + height / 2, col.z]}>
                    <mesh>
                        <boxGeometry args={[0.32, height, 0.32]} />
                        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 0, 0.18]}>
                        <boxGeometry args={[0.055, height * 0.82, 0.055]} />
                        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/* =========================================================================
   ENTRANCE CIRCULAR CANOPY
========================================================================= */
function EntranceCanopy() {
    const y = 10.7;

    return (
        <group position={[0, y, -50]}>
            <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[7.5, 14.5, 48]} />
                <meshStandardMaterial color="#c7cbd1" metalness={0.35} roughness={0.35} />
            </mesh>

            <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[14.2, 14.55, 48]} />
                <meshBasicMaterial color="#a855f7" transparent opacity={0.9} />
            </mesh>

            <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[13.7, 13.9, 48]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
            </mesh>

            <Text
                position={[0, -0.15, 14.75]}
                rotation={[0, Math.PI, 0]}
                fontSize={1.15}
                color="#8ddcff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.045}
                outlineColor="#7c3cff"
            >
                GAMEMALL
            </Text>

            {/* Support columns */}
            <mesh position={[-11, -4.6, 0]}>
                <cylinderGeometry args={[0.55, 0.7, 9.2, 16]} />
                <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[11, -4.6, 0]}>
                <cylinderGeometry args={[0.55, 0.7, 9.2, 16]} />
                <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>

            <mesh position={[-11.45, -4.6, 0]}>
                <boxGeometry args={[0.07, 8.2, 0.07]} />
                <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} />
            </mesh>
            <mesh position={[11.45, -4.6, 0]}>
                <boxGeometry args={[0.07, 8.2, 0.07]} />
                <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} />
            </mesh>
        </group>
    );
}

/* =========================================================================
   GAMEMALL EXTERIOR
========================================================================= */
export default function MallFacade() {
    const outerRadiusX = 67;
    const outerRadiusZ = 58;
    const groundHeight = 5.5;
    const secondHeight = 4.8;

    return (
        <group>
            {/* GROUND FLOOR */}
            <CurvedFacade
                radiusX={outerRadiusX}
                radiusZ={outerRadiusZ}
                y={0}
                height={groundHeight}
                segments={48}
                openingWidth={28}
            />

            {/* SECOND FLOOR */}
            <CurvedFacade
                radiusX={outerRadiusX - 1.5}
                radiusZ={outerRadiusZ - 1.5}
                y={5.7}
                height={secondHeight}
                segments={48}
                openingWidth={32}
            />

            {/* FLOOR SEPARATION & LED (Tube Ring optimization) */}
            <CurvedTubeRing
                radiusX={outerRadiusX + 0.5}
                radiusZ={outerRadiusZ + 0.5}
                y={5.55}
                radius={0.2}
                color="#202633"
            />
            <CurvedTubeRing
                radiusX={outerRadiusX + 0.6}
                radiusZ={outerRadiusZ + 0.6}
                y={5.8}
                radius={0.05}
                color="#38bdf8"
                emissive
            />

            {/* TOP EDGE & LED */}
            <CurvedTubeRing
                radiusX={outerRadiusX}
                radiusZ={outerRadiusZ}
                y={10.55}
                radius={0.2}
                color="#202633"
            />
            <CurvedTubeRing
                radiusX={outerRadiusX}
                radiusZ={outerRadiusZ}
                y={10.78}
                radius={0.05}
                color="#a855f7"
                emissive
            />

            {/* EXTERIOR VERTICAL COLUMNS */}
            <CurvedColumns
                radiusX={outerRadiusX - 1}
                radiusZ={outerRadiusZ - 1}
                y={0}
                height={10.5}
                segments={24}
            />

            {/* ENTRANCE CANOPY */}
            <EntranceCanopy />

            {/* ENTRANCE SIDE PILLARS */}
            <mesh position={[-15, 5.0, -57]}>
                <boxGeometry args={[0.45, 10, 0.45]} />
                <meshStandardMaterial color="#4b5563" metalness={0.85} roughness={0.2} />
            </mesh>
            <mesh position={[15, 5.0, -57]}>
                <boxGeometry args={[0.45, 10, 0.45]} />
                <meshStandardMaterial color="#4b5563" metalness={0.85} roughness={0.2} />
            </mesh>

            <mesh position={[-14.72, 5.0, -57]}>
                <boxGeometry args={[0.06, 9.2, 0.06]} />
                <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} />
            </mesh>
            <mesh position={[14.72, 5.0, -57]}>
                <boxGeometry args={[0.06, 9.2, 0.06]} />
                <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} />
            </mesh>

            {/* ENTRANCE TOP BEAM */}
            <mesh position={[0, 9.7, -57]}>
                <boxGeometry args={[30, 0.45, 0.55]} />
                <meshStandardMaterial color="#202633" metalness={0.8} roughness={0.25} />
            </mesh>

            <mesh position={[0, 9.42, -57.32]}>
                <boxGeometry args={[28, 0.08, 0.08]} />
                <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={3} />
            </mesh>

            {/* ENTRANCE LIGHT */}
            <pointLight position={[0, 7, -55]} color="#8ddcff" intensity={3} distance={15} />
        </group>
    );
}