import { Text } from "@react-three/drei";

export default function MainEntrance() {
    return (
        <group position={[0, 0, -58]}>

            {/* =========================
                Entrance Platform
            ========================= */}

            <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[18, 0.24, 7]} />

                <meshStandardMaterial
                    color="#555b68"
                    roughness={0.45}
                    metalness={0.2}
                />
            </mesh>


            {/* =========================
                Left Pillar
            ========================= */}

            <mesh position={[-7, 3.2, 0]}>
                <boxGeometry args={[1.2, 6.4, 1.2]} />

                <meshStandardMaterial
                    color="#202433"
                    metalness={0.55}
                    roughness={0.3}
                />
            </mesh>


            {/* =========================
                Right Pillar
            ========================= */}

            <mesh position={[7, 3.2, 0]}>
                <boxGeometry args={[1.2, 6.4, 1.2]} />

                <meshStandardMaterial
                    color="#202433"
                    metalness={0.55}
                    roughness={0.3}
                />
            </mesh>


            {/* =========================
                Glass Entrance
            ========================= */}

            <mesh position={[0, 3, 0]}>
                <boxGeometry args={[12.8, 5.8, 0.12]} />

                <meshPhysicalMaterial
                    color="#a9e3ff"
                    transparent
                    opacity={0.28}
                    roughness={0.05}
                    metalness={0.15}
                    transmission={0.2}
                />
            </mesh>


            {/* =========================
                Left Door
            ========================= */}

            <mesh position={[-1.65, 2.3, -0.12]}>
                <boxGeometry args={[3.1, 4.6, 0.1]} />

                <meshPhysicalMaterial
                    color="#bdeaff"
                    transparent
                    opacity={0.42}
                    roughness={0.05}
                    transmission={0.3}
                />
            </mesh>


            {/* =========================
                Right Door
            ========================= */}

            <mesh position={[1.65, 2.3, -0.12]}>
                <boxGeometry args={[3.1, 4.6, 0.1]} />

                <meshPhysicalMaterial
                    color="#bdeaff"
                    transparent
                    opacity={0.42}
                    roughness={0.05}
                    transmission={0.3}
                />
            </mesh>


            {/* =========================
                Entrance Header
            ========================= */}

            <mesh position={[0, 6.35, 0]}>
                <boxGeometry args={[15, 0.9, 1.2]} />

                <meshStandardMaterial
                    color="#171a28"
                    metalness={0.7}
                    roughness={0.2}
                />
            </mesh>


            {/* =========================
                Entrance Text
            ========================= */}

            <Text
                position={[0, 6.38, -0.65]}
                fontSize={0.65}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                MAIN ENTRANCE
            </Text>


            {/* =========================
                Entrance Canopy
            ========================= */}

            <mesh position={[0, 7, -2.2]}>
                <boxGeometry args={[17, 0.35, 5]} />

                <meshStandardMaterial
                    color="#292d3d"
                    metalness={0.55}
                    roughness={0.25}
                />
            </mesh>


            {/* =========================
                Canopy Supports
            ========================= */}

            <mesh position={[-6.5, 3.5, -2.2]}>
                <boxGeometry args={[0.3, 7, 0.3]} />

                <meshStandardMaterial
                    color="#8d96a5"
                    metalness={0.75}
                    roughness={0.2}
                />
            </mesh>

            <mesh position={[6.5, 3.5, -2.2]}>
                <boxGeometry args={[0.3, 7, 0.3]} />

                <meshStandardMaterial
                    color="#8d96a5"
                    metalness={0.75}
                    roughness={0.2}
                />
            </mesh>


            {/* =========================
                Entrance Lights
            ========================= */}

            <pointLight
                position={[-5, 5.5, -2]}
                intensity={1.5}
                distance={12}
            />

            <pointLight
                position={[5, 5.5, -2]}
                intensity={1.5}
                distance={12}
            />

        </group>
    );
}