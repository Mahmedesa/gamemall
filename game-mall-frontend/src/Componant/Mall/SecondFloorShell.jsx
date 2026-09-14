import * as THREE from "three";
import { useMemo } from "react";

export default function SecondFloorShell() {
    const outerRadiusX = 67.5;
    const outerRadiusZ = 60;

    // فتحة الـ Atrium حول النافورة
    const innerRadiusX = 21;
    const innerRadiusZ = 15;

    const floorY = 5.5;
    const thickness = 0.35;

    const shape = useMemo(() => {
        const outer = new THREE.Shape();

        // الشكل الخارجي البيضاوي
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

        // الفتحة الداخلية البيضاوية
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
        </group>
    );
}