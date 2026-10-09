import { useMemo } from "react";
import * as THREE from "three";

export default function ProductDisplay({
    position = [0, 0, 0],
    scale = 1,
    color = "#7c3cff",
}) {
    const material = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color,
                metalness: 0.25,
                roughness: 0.4,
            }),
        [color]
    );

    return (
        <group position={position} scale={scale}>
            {/* جسم المنتج */}
            <mesh material={material}>
                <boxGeometry args={[0.55, 0.55, 0.35]} />
            </mesh>

            {/* الجزء العلوي */}
            <mesh
                position={[0, 0.34, 0]}
                material={material}
            >
                <boxGeometry args={[0.42, 0.12, 0.28]} />
            </mesh>
        </group>
    );
}