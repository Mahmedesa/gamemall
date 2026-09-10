export default function SecondFloorShell() {
    const outerWidth = 135;
    const outerDepth = 120;

    const atriumWidth = 42;
    const atriumDepth = 30;

    const floorY = 5.5;
    const thickness = 0.35;

    const frontBackDepth = (outerDepth - atriumDepth) / 2;
    const leftRightWidth = (outerWidth - atriumWidth) / 2;

    return (
        <group>
            {/* Front section */}
            <mesh
                position={[
                    0,
                    floorY,
                    -(atriumDepth / 2 + frontBackDepth / 2),
                ]}
            >
                <boxGeometry
                    args={[
                        outerWidth,
                        thickness,
                        frontBackDepth,
                    ]}
                />

                <meshStandardMaterial
                    color="#d5d7dc"
                    roughness={0.65}
                />
            </mesh>

            {/* Back section */}
            <mesh
                position={[
                    0,
                    floorY,
                    atriumDepth / 2 + frontBackDepth / 2,
                ]}
            >
                <boxGeometry
                    args={[
                        outerWidth,
                        thickness,
                        frontBackDepth,
                    ]}
                />

                <meshStandardMaterial
                    color="#d5d7dc"
                    roughness={0.65}
                />
            </mesh>

            {/* Left wing */}
            <mesh
                position={[
                    -(atriumWidth / 2 + leftRightWidth / 2),
                    floorY,
                    0,
                ]}
            >
                <boxGeometry
                    args={[
                        leftRightWidth,
                        thickness,
                        atriumDepth,
                    ]}
                />

                <meshStandardMaterial
                    color="#d5d7dc"
                    roughness={0.65}
                />
            </mesh>

            {/* Right wing */}
            <mesh
                position={[
                    atriumWidth / 2 + leftRightWidth / 2,
                    floorY,
                    0,
                ]}
            >
                <boxGeometry
                    args={[
                        leftRightWidth,
                        thickness,
                        atriumDepth,
                    ]}
                />

                <meshStandardMaterial
                    color="#d5d7dc"
                    roughness={0.65}
                />
            </mesh>
        </group>
    );
}