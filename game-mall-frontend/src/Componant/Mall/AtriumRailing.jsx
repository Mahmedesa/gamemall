import * as THREE from "three";

function CurvedRailing({
    radiusX = 22,
    radiusZ = 16,
    y = 5.7,
}) {
    const segments = 64;
    const pieces = [];

    for (let i = 0; i < segments; i++) {

        const a1 =
            (i / segments) * Math.PI * 2;

        const a2 =
            ((i + 1) / segments) * Math.PI * 2;

        const x1 = radiusX * Math.cos(a1);
        const z1 = radiusZ * Math.sin(a1);

        const x2 = radiusX * Math.cos(a2);
        const z2 = radiusZ * Math.sin(a2);

        const x = (x1 + x2) / 2;
        const z = (z1 + z2) / 2;

        const dx = x2 - x1;
        const dz = z2 - z1;

        const length =
            Math.sqrt(dx * dx + dz * dz);

        const rotation =
            Math.atan2(-dz, dx);

        /*
         * Every 4 segments gets a vertical support
         */
        const showSupport = i % 4 === 0;

        pieces.push(
            <group
                key={i}
                position={[x, y, z]}
                rotation={[0, rotation, 0]}
            >

                {/* =================================================
                    METAL TOP RAIL
                ================================================= */}

                <mesh
                    position={[0, 1.05, 0]}
                >
                    <boxGeometry
                        args={[
                            length + 0.08,
                            0.12,
                            0.12,
                        ]}
                    />

                    <meshStandardMaterial
                        color="#7d8793"
                        metalness={0.85}
                        roughness={0.2}
                    />
                </mesh>


                {/* =================================================
                    TOP LED
                ================================================= */}

                <mesh
                    position={[
                        0,
                        1.14,
                        0.015,
                    ]}
                >
                    <boxGeometry
                        args={[
                            length,
                            0.045,
                            0.045,
                        ]}
                    />

                    <meshStandardMaterial
                        color="#a855f7"
                        emissive="#a855f7"
                        emissiveIntensity={2.5}
                    />
                </mesh>


                {/* =================================================
                    GLASS
                ================================================= */}

                <mesh
                    position={[0, 0.55, 0]}
                >
                    <boxGeometry
                        args={[
                            length,
                            1.0,
                            0.06,
                        ]}
                    />

                    <meshPhysicalMaterial
                        color="#b9e6ff"
                        transparent
                        opacity={0.28}
                        roughness={0.05}
                        metalness={0.15}
                        transmission={0.15}
                        side={THREE.DoubleSide}
                    />
                </mesh>


                {/* =================================================
                    BOTTOM METAL RAIL
                ================================================= */}

                <mesh
                    position={[0, 0.08, 0]}
                >
                    <boxGeometry
                        args={[
                            length + 0.08,
                            0.12,
                            0.12,
                        ]}
                    />

                    <meshStandardMaterial
                        color="#7d8793"
                        metalness={0.8}
                        roughness={0.25}
                    />
                </mesh>


                {/* =================================================
                    BOTTOM LED
                ================================================= */}

                <mesh
                    position={[
                        0,
                        0.16,
                        0.075,
                    ]}
                >
                    <boxGeometry
                        args={[
                            length,
                            0.055,
                            0.055,
                        ]}
                    />

                    <meshStandardMaterial
                        color="#38bdf8"
                        emissive="#38bdf8"
                        emissiveIntensity={3}
                    />
                </mesh>


                {/* =================================================
                    VERTICAL METAL SUPPORT
                ================================================= */}

                {showSupport && (
                    <mesh
                        position={[
                            0,
                            0.55,
                            0,
                        ]}
                    >
                        <boxGeometry
                            args={[
                                0.08,
                                1.95,
                                0.1,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#737d8a"
                            metalness={0.85}
                            roughness={0.22}
                        />
                    </mesh>
                )}

            </group>
        );
    }

    return <group>{pieces}</group>;
}


/* =====================================================
   ATRIUM RAILING
===================================================== */

export default function AtriumRailing() {

    return (
        <group>

            <CurvedRailing
                radiusX={22}
                radiusZ={16}
                y={5.7}
            />

        </group>
    );
}