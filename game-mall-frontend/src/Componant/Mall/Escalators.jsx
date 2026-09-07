import { Text } from "@react-three/drei";

function Escalator({ position, rotation = 0, id }) {
    const width = 2.8;
    const length = 10;
    const height = 5.5;

    return (
        <group
            position={position}
            rotation={[0, rotation, 0]}
        >
            {/* Lower base */}
            <mesh position={[0, 0.15, 0]}>
                <boxGeometry
                    args={[width, 0.3, length]}
                />
                <meshStandardMaterial
                    color="#3b3f4a"
                    metalness={0.6}
                    roughness={0.3}
                />
            </mesh>

            {/* Escalator inclined body */}
            <mesh
                position={[
                    0,
                    height / 2,
                    0
                ]}
                rotation={[
                    -Math.atan(height / length),
                    0,
                    0
                ]}
            >
                <boxGeometry
                    args={[
                        width,
                        0.35,
                        Math.sqrt(
                            length * length +
                            height * height
                        )
                    ]}
                />

                <meshStandardMaterial
                    color="#555b68"
                    metalness={0.55}
                    roughness={0.35}
                />
            </mesh>

            {/* Left handrail */}
            <mesh
                position={[
                    -width / 2,
                    1.2,
                    0
                ]}
                rotation={[
                    -Math.atan(height / length),
                    0,
                    0
                ]}
            >
                <boxGeometry
                    args={[
                        0.12,
                        1.1,
                        length
                    ]}
                />

                <meshStandardMaterial
                    color="#20232b"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Right handrail */}
            <mesh
                position={[
                    width / 2,
                    1.2,
                    0
                ]}
                rotation={[
                    -Math.atan(height / length),
                    0,
                    0
                ]}
            >
                <boxGeometry
                    args={[
                        0.12,
                        1.1,
                        length
                    ]}
                />

                <meshStandardMaterial
                    color="#20232b"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Glass side panels */}
            <mesh
                position={[
                    -width / 2 + 0.08,
                    1.15,
                    0
                ]}
                rotation={[
                    -Math.atan(height / length),
                    0,
                    0
                ]}
            >
                <boxGeometry
                    args={[
                        0.06,
                        1.0,
                        length
                    ]}
                />

                <meshPhysicalMaterial
                    color="#b9e6ff"
                    transparent
                    opacity={0.25}
                    roughness={0.05}
                    transmission={0.2}
                />
            </mesh>

            <mesh
                position={[
                    width / 2 - 0.08,
                    1.15,
                    0
                ]}
                rotation={[
                    -Math.atan(height / length),
                    0,
                    0
                ]}
            >
                <boxGeometry
                    args={[
                        0.06,
                        1.0,
                        length
                    ]}
                />

                <meshPhysicalMaterial
                    color="#b9e6ff"
                    transparent
                    opacity={0.25}
                    roughness={0.05}
                    transmission={0.2}
                />
            </mesh>

            {/* Label */}
            <Text
                position={[0, 3, 0]}
                rotation={[0, 0, 0]}
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {id}
            </Text>
        </group>
    );
}

export default function Escalators() {
    return (
        <group>

            {/* Left escalator */}
            <Escalator
                id="ESC-L"
                position={[-27, 0, 0]}
                rotation={Math.PI / 2}
            />

            {/* Right escalator */}
            <Escalator
                id="ESC-R"
                position={[27, 0, 0]}
                rotation={-Math.PI / 2}
            />

        </group>
    );
}