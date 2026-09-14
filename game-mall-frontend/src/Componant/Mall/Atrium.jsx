export default function Atrium() {
    const radiusX = 21;
    const radiusZ = 15;

    const floorY = 0.05;

    return (
        <group>

            {/* =====================================================
                Circular / Oval Atrium Floor
            ===================================================== */}

            <mesh
                position={[0, floorY, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[radiusX, radiusZ, 1]}
            >
                <circleGeometry
                    args={[1, 96]}
                />

                <meshStandardMaterial
                    color="#eeeeee"
                    roughness={0.65}
                    metalness={0.08}
                />
            </mesh>


            {/* =====================================================
                Outer Atrium Border
            ===================================================== */}

            <mesh
                position={[0, 0.08, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[radiusX, radiusZ, 1]}
            >
                <ringGeometry
                    args={[
                        0.94,
                        1,
                        96
                    ]}
                />

                <meshStandardMaterial
                    color="#9da3ad"
                    metalness={0.35}
                    roughness={0.4}
                />
            </mesh>


            {/* =====================================================
                Inner Decorative Ring
            ===================================================== */}

            <mesh
                position={[0, 0.12, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[radiusX, radiusZ, 1]}
            >
                <ringGeometry
                    args={[
                        0.72,
                        0.76,
                        96
                    ]}
                />

                <meshStandardMaterial
                    color="#c7cbd1"
                    metalness={0.45}
                    roughness={0.35}
                />
            </mesh>


            {/* =====================================================
                Fountain
            ===================================================== */}

            <mesh
                position={[0, 0.35, 0]}
            >
                <cylinderGeometry
                    args={[5, 5, 0.35, 96]}
                />

                <meshStandardMaterial
                    color="#bfc7d1"
                    metalness={0.35}
                    roughness={0.3}
                />
            </mesh>


            {/* Water */}
            <mesh
                position={[0, 0.55, 0]}
            >
                <cylinderGeometry
                    args={[3.8, 3.8, 0.08, 96]}
                />

                <meshPhysicalMaterial
                    color="#8fd3ff"
                    transparent
                    opacity={0.75}
                    roughness={0.08}
                    metalness={0.2}
                    transmission={0.25}
                />
            </mesh>


            {/* Fountain center */}
            <mesh
                position={[0, 0.9, 0]}
            >
                <cylinderGeometry
                    args={[0.5, 0.5, 0.7, 32]}
                />

                <meshStandardMaterial
                    color="#d8dce2"
                    metalness={0.5}
                    roughness={0.25}
                />
            </mesh>


            {/* Fountain light */}
            <pointLight
                position={[0, 3, 0]}
                intensity={25}
                distance={18}
            />

        </group>
    );
}