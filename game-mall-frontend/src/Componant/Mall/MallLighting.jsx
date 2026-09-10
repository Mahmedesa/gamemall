import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function MallLighting() {
    const { scene } = useThree();

    useEffect(() => {
        scene.background = new THREE.Color("#111722");

        scene.fog = new THREE.Fog(
            "#111722",
            90,
            180
        );

        return () => {
            scene.fog = null;
        };
    }, [scene]);

    return (
        <group>
            {/* General mall light */}
            <ambientLight intensity={1.4} />

            {/* Main daylight */}
            <directionalLight
                position={[0, 35, 20]}
                intensity={2.2}
                castShadow
            />

            {/* Front light */}
            <pointLight
                position={[0, 8, -35]}
                intensity={35}
                distance={70}
                decay={2}
            />

            {/* Atrium lights */}
            <pointLight
                position={[-18, 8, -12]}
                intensity={25}
                distance={45}
                decay={2}
            />

            <pointLight
                position={[18, 8, -12]}
                intensity={25}
                distance={45}
                decay={2}
            />

            <pointLight
                position={[-18, 8, 12]}
                intensity={25}
                distance={45}
                decay={2}
            />

            <pointLight
                position={[18, 8, 12]}
                intensity={25}
                distance={45}
                decay={2}
            />

            {/* Fountain light */}
            <pointLight
                position={[0, 4, 0]}
                intensity={18}
                distance={25}
                decay={2}
            />

            {/* Back mall lights */}
            <pointLight
                position={[-35, 7, 35]}
                intensity={18}
                distance={45}
                decay={2}
            />

            <pointLight
                position={[35, 7, 35]}
                intensity={18}
                distance={45}
                decay={2}
            />
        </group>
    );
}