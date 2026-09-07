import { useMemo } from "react";

export default function Atrium() {
    const outerWidth = 135;
    const outerDepth = 120;

    // فتحة الـ Atrium حسب المخطط
    const atriumWidth = 42;
    const atriumDepth = 30;

    // ارتفاع الدور الثاني
    const floorY = 5.5;

    const frontBackDepth =
        (outerDepth - atriumDepth) / 2;

    const leftRightWidth =
        (outerWidth - atriumWidth) / 2;

    const pieces = useMemo(
        () => [
            // =========================
            // BACK FLOOR
            // =========================
            {
                position: [
                    0,
                    floorY,
                    atriumDepth / 2 + frontBackDepth / 2,
                ],
                size: [
                    outerWidth,
                    0.35,
                    frontBackDepth,
                ],
            },

            // =========================
            // FRONT FLOOR
            // =========================
            {
                position: [
                    0,
                    floorY,
                    -(atriumDepth / 2 + frontBackDepth / 2),
                ],
                size: [
                    outerWidth,
                    0.35,
                    frontBackDepth,
                ],
            },

            // =========================
            // LEFT FLOOR
            // =========================
            {
                position: [
                    -(atriumWidth / 2 + leftRightWidth / 2),
                    floorY,
                    0,
                ],
                size: [
                    leftRightWidth,
                    0.35,
                    atriumDepth,
                ],
            },

            // =========================
            // RIGHT FLOOR
            // =========================
            {
                position: [
                    atriumWidth / 2 + leftRightWidth / 2,
                    floorY,
                    0,
                ],
                size: [
                    leftRightWidth,
                    0.35,
                    atriumDepth,
                ],
            },
        ],
        []
    );

    return (
        <group>

            {/* =================================
                SECOND FLOOR SLAB
            ================================= */}

            {pieces.map((piece, index) => (
                <mesh
                    key={index}
                    position={piece.position}
                >
                    <boxGeometry args={piece.size} />

                    <meshStandardMaterial
                        color="#d8d8dc"
                        roughness={0.65}
                        metalness={0.08}
                    />
                </mesh>
            ))}


            {/* =================================
                ATRIUM BORDER
            ================================= */}

            {/* Back border */}
            <mesh
                position={[
                    0,
                    floorY + 0.2,
                    atriumDepth / 2,
                ]}
            >
                <boxGeometry
                    args={[
                        atriumWidth,
                        0.4,
                        0.35,
                    ]}
                />

                <meshStandardMaterial
                    color="#9da3ad"
                    roughness={0.4}
                />
            </mesh>


            {/* Front border */}
            <mesh
                position={[
                    0,
                    floorY + 0.2,
                    -atriumDepth / 2,
                ]}
            >
                <boxGeometry
                    args={[
                        atriumWidth,
                        0.4,
                        0.35,
                    ]}
                />

                <meshStandardMaterial
                    color="#9da3ad"
                    roughness={0.4}
                />
            </mesh>


            {/* Left border */}
            <mesh
                position={[
                    -atriumWidth / 2,
                    floorY + 0.2,
                    0,
                ]}
            >
                <boxGeometry
                    args={[
                        0.35,
                        0.4,
                        atriumDepth,
                    ]}
                />

                <meshStandardMaterial
                    color="#9da3ad"
                    roughness={0.4}
                />
            </mesh>


            {/* Right border */}
            <mesh
                position={[
                    atriumWidth / 2,
                    floorY + 0.2,
                    0,
                ]}
            >
                <boxGeometry
                    args={[
                        0.35,
                        0.4,
                        atriumDepth,
                    ]}
                />

                <meshStandardMaterial
                    color="#9da3ad"
                    roughness={0.4}
                />
            </mesh>


            {/* =================================
                ATRIUM INNER FLOOR
                - مجرد مرجع بصري للفتحة
                - الأرضي يفضل ظاهر من خلالها
            ================================= */}

            <mesh
                position={[
                    0,
                    0.03,
                    0,
                ]}
                rotation={[
                    -Math.PI / 2,
                    0,
                    0,
                ]}
            >
                <planeGeometry
                    args={[
                        atriumWidth,
                        atriumDepth,
                    ]}
                />

                <meshStandardMaterial
                    color="#eeeeee"
                    roughness={0.7}
                />
            </mesh>

        </group>
    );
}