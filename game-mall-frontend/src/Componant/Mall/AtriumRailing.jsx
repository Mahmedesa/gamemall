function Railing({ position, size }) {
    return (
        <group position={position}>
            {/* Handrail */}
            <mesh position={[0, 1.05, 0]}>
                <boxGeometry args={size} />
                <meshStandardMaterial
                    color="#b8c0ca"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Glass */}
            <mesh position={[0, 0.55, 0]}>
                <boxGeometry
                    args={[
                        size[0],
                        1.0,
                        size[2] === 0.12 ? 0.08 : 0.08,
                    ]}
                />
                <meshPhysicalMaterial
                    color="#b9e6ff"
                    transparent
                    opacity={0.28}
                    roughness={0.05}
                    metalness={0.15}
                    transmission={0.15}
                />
            </mesh>

            {/* Bottom rail */}
            <mesh position={[0, 0.08, 0]}>
                <boxGeometry
                    args={[
                        size[0],
                        0.12,
                        size[2] === 0.12 ? 0.12 : 0.12,
                    ]}
                />
                <meshStandardMaterial
                    color="#7d8793"
                    metalness={0.7}
                    roughness={0.25}
                />
            </mesh>
        </group>
    );
}

export default function AtriumRailing() {
    const width = 42;
    const depth = 30;

    const y = 5.7;

    return (
        <group>

            {/* Front */}
            <Railing
                position={[0, y, -depth / 2]}
                size={[width, 0.12, 0.12]}
            />

            {/* Back */}
            <Railing
                position={[0, y, depth / 2]}
                size={[width, 0.12, 0.12]}
            />

            {/* Left */}
            <Railing
                position={[-width / 2, y, 0]}
                size={[0.12, 0.12, depth]}
            />

            {/* Right */}
            <Railing
                position={[width / 2, y, 0]}
                size={[0.12, 0.12, depth]}
            />

        </group>
    );
}