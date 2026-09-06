import { Text } from "@react-three/drei";

export default function Store3D({
    id,
    position = [0, 0, 0],
    rotation = 0,
    width = 6,
    depth = 10,
    height = 5.5,
}) {
    return (
        <group
            position={position}
            rotation={[0, rotation, 0]}
        >
            {/* Store body */}
            <mesh position={[0, height / 2, 0]}>
                <boxGeometry args={[width, height, depth]} />

                <meshStandardMaterial
                    color="#24243a"
                    roughness={0.65}
                    metalness={0.15}
                />
            </mesh>

            {/* Glass front */}
            <mesh
                position={[
                    0,
                    height / 2,
                    depth / 2 + 0.03
                ]}
            >
                <boxGeometry
                    args={[
                        width * 0.82,
                        height * 0.78,
                        0.08
                    ]}
                />

                <meshStandardMaterial
                    color="#8ddcff"
                    transparent
                    opacity={0.35}
                    roughness={0.15}
                    metalness={0.5}
                />
            </mesh>

            {/* Entrance */}
            <mesh
                position={[
                    0,
                    height * 0.39,
                    depth / 2 + 0.09
                ]}
            >
                <boxGeometry
                    args={[
                        Math.min(width * 0.32, 2.4),
                        height * 0.78,
                        0.1
                    ]}
                />

                <meshStandardMaterial
                    color="#11111d"
                    transparent
                    opacity={0.7}
                    metalness={0.8}
                    roughness={0.15}
                />
            </mesh>

            {/* Store sign */}
            <mesh
                position={[
                    0,
                    height * 0.9,
                    depth / 2 + 0.12
                ]}
            >
                <boxGeometry
                    args={[
                        Math.min(width * 0.8, 7),
                        0.65,
                        0.15
                    ]}
                />

                <meshStandardMaterial
                    color="#17172a"
                    emissive="#17172a"
                />
            </mesh>

            {/* Store name */}
            <Text
                position={[
                    0,
                    height * 0.9,
                    depth / 2 + 0.22
                ]}
                fontSize={0.42}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {id}
            </Text>

            {/* Floor */}
            <mesh
                position={[
                    0,
                    0.05,
                    0
                ]}
            >
                <boxGeometry
                    args={[
                        width + 0.15,
                        0.1,
                        depth + 0.15
                    ]}
                />

                <meshStandardMaterial
                    color="#303047"
                />
            </mesh>
        </group>
    );
}