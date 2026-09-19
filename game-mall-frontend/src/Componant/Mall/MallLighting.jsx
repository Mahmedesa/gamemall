import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function MallLighting() {
    const { scene } = useThree();

    useEffect(() => {
        scene.background = new THREE.Color("#0b1020");

        scene.fog = new THREE.Fog(
            "#0b1020",
            100,
            190
        );

        return () => {
            scene.fog = null;
        };
    }, [scene]);

    return (
        <group>

            {/* =================================
                General Ambient & Sky Light (سلس للرندر)
            ================================= */}

            <ambientLight
                intensity={1.8}
                color="#c8d8ff"
            />

            <hemisphereLight
                skyColor="#8ddcff"
                groundColor="#201035"
                intensity={1.2}
            />

            {/* =================================
                Main Mall / Daylight
            ================================= */}

            <directionalLight
                position={[0, 35, 20]}
                intensity={2.0}
                color="#fff4df"
            />


            {/* =================================
                Optimized Key Point Lights (5 بدلاً من 18)
            ================================= */}

            {/* 1. Entrance Lighting */}
            <pointLight
                position={[0, 8, -45]}
                intensity={30}
                distance={80}
                decay={2}
                color="#8ddcff"
            />

            {/* 2. Central Atrium & Fountain Glow */}
            <pointLight
                position={[0, 6, 0]}
                intensity={25}
                distance={50}
                decay={2}
                color="#38bdf8"
            />

            {/* 3. Left Wing Light */}
            <pointLight
                position={[-30, 8, 0]}
                intensity={22}
                distance={60}
                decay={2}
                color="#8ddcff"
            />

            {/* 4. Right Wing Light */}
            <pointLight
                position={[30, 8, 0]}
                intensity={22}
                distance={60}
                decay={2}
                color="#8ddcff"
            />

            {/* 5. Back Mall Ambient Light */}
            <pointLight
                position={[0, 8, 40]}
                intensity={20}
                distance={60}
                decay={2}
                color="#a855f7"
            />

        </group>
    );
}