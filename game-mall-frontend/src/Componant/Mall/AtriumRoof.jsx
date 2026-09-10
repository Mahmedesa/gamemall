export default function AtriumRoof() {
    const width = 42;
    const depth = 30;

    const y = 11.2;

    return (
        <group position={[0, y, 0]}>
            {/* Main glass roof */}
            <mesh rotation={[0, 0, 0]}>
                <boxGeometry args={[width, 0.18, depth]} />

                <meshPhysicalMaterial
                    color="#bde9ff"
                    transparent
                    opacity={0.22}
                    roughness={0.08}
                    metalness={0.25}
                    transmission={0.35}
                    side={2}
                />
            </mesh>

            {/* Front frame */}
            <mesh position={[0, 0, -depth / 2]}>
                <boxGeometry args={[width, 0.25, 0.25]} />

                <meshStandardMaterial
                    color="#4b5563"
                    metalness={0.8}
                    roughness={0.25}
                />
            </mesh>

            {/* Back frame */}
            <mesh position={[0, 0, depth / 2]}>
                <boxGeometry args={[width, 0.25, 0.25]} />

                <meshStandardMaterial
                    color="#4b5563"
                    metalness={0.8}
                    roughness={0.25}
                />
            </mesh>

            {/* Left frame */}
            <mesh position={[-width / 2, 0, 0]}>
                <boxGeometry args={[0.25, 0.25, depth]} />

                <meshStandardMaterial
                    color="#4b5563"
                    metalness={0.8}
                    roughness={0.25}
                />
            </mesh>

            {/* Right frame */}
            <mesh position={[width / 2, 0, 0]}>
                <boxGeometry args={[0.25, 0.25, depth]} />

                <meshStandardMaterial
                    color="#4b5563"
                    metalness={0.8}
                    roughness={0.25}
                />
            </mesh>

            {/* Roof beams */}
            {[-14, -7, 0, 7, 14].map((x) => (
                <mesh key={x} position={[x, 0.03, 0]}>
                    <boxGeometry args={[0.12, 0.12, depth]} />

                    <meshStandardMaterial
                        color="#687280"
                        metalness={0.75}
                        roughness={0.3}
                    />
                </mesh>
            ))}

            {[-10, 0, 10].map((z) => (
                <mesh key={z} position={[0, 0.04, z]}>
                    <boxGeometry args={[width, 0.12, 0.12]} />

                    <meshStandardMaterial
                        color="#687280"
                        metalness={0.75}
                        roughness={0.3}
                    />
                </mesh>
            ))}
        </group>
    );
}