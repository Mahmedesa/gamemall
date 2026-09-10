import { Text } from "@react-three/drei";

function Escalator({
    position,
    rotation = 0,
}) {
    const width = 2.8;
    const length = 10;
    const height = 5.5;

    const angle = Math.atan2(height, length);

    return (
        <group position={position} rotation={[0, rotation, 0]}>

            {/* =========================
                ESCALATOR BODY
            ========================= */}

            <mesh
                position={[0, height / 2, 0]}
                rotation={[angle, 0, 0]}
            >
                <boxGeometry
                    args={[width, 0.45, length]}
                />

                <meshStandardMaterial
                    color="#303642"
                    metalness={0.65}
                    roughness={0.3}
                />
            </mesh>

            {/* =========================
                STEPS
            ========================= */}

            {Array.from({ length: 18 }).map((_, i) => {
                const t = i / 17;

                const z = -length / 2 + t * length;
                const y = t * height;

                return (
                    <mesh
                        key={i}
                        position={[0, y + 0.3, z]}
                        rotation={[angle, 0, 0]}
                    >
                        <boxGeometry
                            args={[width * 0.82, 0.12, 0.38]}
                        />

                        <meshStandardMaterial
                            color="#777f8c"
                            metalness={0.8}
                            roughness={0.25}
                        />
                    </mesh>
                );
            })}

            {/* =========================
                LEFT GLASS
            ========================= */}

            <mesh
                position={[
                    -(width / 2) - 0.08,
                    height / 2 + 0.8,
                    0,
                ]}
                rotation={[angle, 0, 0]}
            >
                <boxGeometry
                    args={[0.08, 1.7, length]}
                />

                <meshPhysicalMaterial
                    color="#b9e6ff"
                    transparent
                    opacity={0.28}
                    roughness={0.05}
                    metalness={0.2}
                    transmission={0.15}
                />
            </mesh>

            {/* =========================
                RIGHT GLASS
            ========================= */}

            <mesh
                position={[
                    (width / 2) + 0.08,
                    height / 2 + 0.8,
                    0,
                ]}
                rotation={[angle, 0, 0]}
            >
                <boxGeometry
                    args={[0.08, 1.7, length]}
                />

                <meshPhysicalMaterial
                    color="#b9e6ff"
                    transparent
                    opacity={0.28}
                    roughness={0.05}
                    metalness={0.2}
                    transmission={0.15}
                />
            </mesh>

            {/* =========================
                HANDRAILS
            ========================= */}

            <mesh
                position={[
                    -(width / 2) - 0.12,
                    height / 2 + 1.7,
                    0,
                ]}
                rotation={[angle, 0, 0]}
            >
                <boxGeometry
                    args={[0.14, 0.14, length + 0.4]}
                />

                <meshStandardMaterial
                    color="#20252e"
                    metalness={0.85}
                    roughness={0.2}
                />
            </mesh>

            <mesh
                position={[
                    (width / 2) + 0.12,
                    height / 2 + 1.7,
                    0,
                ]}
                rotation={[angle, 0, 0]}
            >
                <boxGeometry
                    args={[0.14, 0.14, length + 0.4]}
                />

                <meshStandardMaterial
                    color="#20252e"
                    metalness={0.85}
                    roughness={0.2}
                />
            </mesh>

            {/* =========================
                LOWER LANDING
            ========================= */}

            <mesh
                position={[0, 0.08, -length / 2 - 1.4]}
            >
                <boxGeometry args={[width + 1.5, 0.16, 2.8]} />

                <meshStandardMaterial
                    color="#c7cbd1"
                    roughness={0.55}
                />
            </mesh>

            {/* =========================
                UPPER LANDING
            ========================= */}

            <mesh
                position={[0, height + 0.08, length / 2 + 1.4]}
            >
                <boxGeometry args={[width + 1.5, 0.16, 2.8]} />

                <meshStandardMaterial
                    color="#c7cbd1"
                    roughness={0.55}
                />
            </mesh>

            {/* =========================
                LABEL
            ========================= */}

            <Text
                position={[0, height + 1.1, length / 2 + 1.5]}
                rotation={[0, Math.PI, 0]}
                fontSize={0.42}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                ESCALATOR
            </Text>
        </group>
    );
}

export default function Escalators() {
    return (
        <group>

            {/* Left escalator */}
            <Escalator
                position={[-27, 0, 0]}
                rotation={Math.PI / 2}
            />

            {/* Right escalator */}
            <Escalator
                position={[27, 0, 0]}
                rotation={-Math.PI / 2}
            />

        </group>
    );
}