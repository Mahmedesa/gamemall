import * as THREE from "three";
import { useMemo } from "react";

export default function SecondFloorShell() {
    const outerRadiusX = 67.5;
    const outerRadiusZ = 60;

    const innerRadiusX = 21;
    const innerRadiusZ = 15;

    const floorY = 5.5;
    const thickness = 0.35;

    const shape = useMemo(() => {
        const outer = new THREE.Shape();

        outer.absellipse(
            0,
            0,
            outerRadiusX,
            outerRadiusZ,
            0,
            Math.PI * 2,
            false,
            0
        );

        const hole = new THREE.Path();

        hole.absellipse(
            0,
            0,
            innerRadiusX,
            innerRadiusZ,
            0,
            Math.PI * 2,
            true,
            0
        );

        outer.holes.push(hole);

        return outer;
    }, []);

    return (
        <group>

            {/* =====================================================
                SECOND FLOOR SHELL
            ===================================================== */}

            <mesh
                position={[0, floorY, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <extrudeGeometry
                    args={[
                        shape,
                        {
                            depth: thickness,
                            bevelEnabled: false,
                            curveSegments: 96,
                        },
                    ]}
                />

                <meshStandardMaterial
                    color="#d5d7dc"
                    roughness={0.65}
                    metalness={0.08}
                    side={THREE.DoubleSide}
                />
            </mesh>


            {/* =====================================================
                OUTER LOWER LED RING
            ===================================================== */}

            <mesh
                position={[0, floorY - 0.08, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <ringGeometry
                    args={[
                        59.5,
                        59.75,
                        128,
                    ]}
                />

                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#38bdf8"
                    emissiveIntensity={2.5}
                    transparent
                    opacity={0.85}
                />
            </mesh>


            {/* =====================================================
                INNER ATRIUM EDGE LIGHT
            ===================================================== */}

            <mesh
                position={[0, floorY - 0.02, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <ringGeometry
                    args={[
                        21.05,
                        21.18,
                        128,
                ]}
                />

                <meshStandardMaterial
                    color="#a855f7"
                    emissive="#a855f7"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.8}
                />
            </mesh>


            {/* =====================================================
                OUTER TOP ACCENT
            ===================================================== */}

            <mesh
                position={[0, floorY + thickness + 0.03, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <ringGeometry
                    args={[
                        66.7,
                        67.15,
                        128,
                    ]}
                />

                <meshStandardMaterial
                    color="#7c3cff"
                    emissive="#7c3cff"
                    emissiveIntensity={1.8}
                    transparent
                    opacity={0.7}
                />
            </mesh>


            {/* =====================================================
                OUTER AMBIENT LIGHT
            ===================================================== */}

            <pointLight
                position={[0, floorY - 0.2, 0]}
                color="#38bdf8"
                intensity={2}
                distance={18}
            />

        </group>
    );
}