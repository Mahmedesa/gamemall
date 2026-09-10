import { Text } from "@react-three/drei";

function GlassWall({ position, size }) {
    return (
        <mesh position={position}>
            <boxGeometry args={size} />

            <meshPhysicalMaterial
                color="#9edfff"
                transparent
                opacity={0.28}
                roughness={0.08}
                metalness={0.45}
                transmission={0.2}
            />
        </mesh>
    );
}

function Frame({ position, size }) {
    return (
        <mesh position={position}>
            <boxGeometry args={size} />

            <meshStandardMaterial
                color="#4b5563"
                metalness={0.8}
                roughness={0.25}
            />
        </mesh>
    );
}

export default function MallFacade() {
    const width = 135;
    const depth = 120;

    const groundY = 2.75;
    const upperY = 8.0;

    return (
        <group>
            {/* =========================
                FRONT FACADE
            ========================= */}

            <GlassWall
                position={[0, groundY, -60]}
                size={[width, 5.5, 0.25]}
            />

            <GlassWall
                position={[0, upperY, -60]}
                size={[width, 4.8, 0.25]}
            />

            {/* =========================
                BACK FACADE
            ========================= */}

            <GlassWall
                position={[0, groundY, 60]}
                size={[width, 5.5, 0.25]}
            />

            <GlassWall
                position={[0, upperY, 60]}
                size={[width, 4.8, 0.25]}
            />

            {/* =========================
                LEFT FACADE
            ========================= */}

            <GlassWall
                position={[-67.5, groundY, 0]}
                size={[0.25, 5.5, depth]}
            />

            <GlassWall
                position={[-67.5, upperY, 0]}
                size={[0.25, 4.8, depth]}
            />

            {/* =========================
                RIGHT FACADE
            ========================= */}

            <GlassWall
                position={[67.5, groundY, 0]}
                size={[0.25, 5.5, depth]}
            />

            <GlassWall
                position={[67.5, upperY, 0]}
                size={[0.25, 4.8, depth]}
            />

            {/* =========================
                VERTICAL FRAMES
            ========================= */}

            {Array.from({ length: 14 }).map((_, i) => {
                const x = -63 + i * 9.7;

                return (
                    <Frame
                        key={`front-${i}`}
                        position={[x, 5.5, -60.15]}
                        size={[0.18, 11, 0.2]}
                    />
                );
            })}

            {/* =========================
                HORIZONTAL FRAMES
            ========================= */}

            <Frame
                position={[0, 5.5, -60.2]}
                size={[135, 0.18, 0.2]}
            />

            <Frame
                position={[0, 11.0, -60.2]}
                size={[135, 0.18, 0.2]}
            />

            {/* =========================
                MALL TOP
            ========================= */}

            <mesh position={[0, 10.7, 0]}>
                <boxGeometry args={[137, 0.5, 122]} />

                <meshStandardMaterial
                    color="#202633"
                    metalness={0.7}
                    roughness={0.3}
                />
            </mesh>

            {/* =========================
                MALL SIGN
            ========================= */}

            <mesh position={[0, 10.2, -60.5]}>
                <boxGeometry args={[28, 2.8, 0.35]} />

                <meshStandardMaterial
                    color="#171b25"
                    metalness={0.5}
                    roughness={0.35}
                />
            </mesh>

            <Text
                position={[0, 10.2, -60.75]}
                fontSize={1.25}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                GAMEMALL
            </Text>
        </group>
    );
}