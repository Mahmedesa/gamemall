import * as THREE from "three";

/* =========================================================
   LAPTOP
========================================================= */

function Laptop3D() {
    return (
        <group>
            {/* Base */}
            <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[1.25, 0.12, 0.82]} />
                <meshStandardMaterial
                    color="#2b2f38"
                    metalness={0.8}
                    roughness={0.25}
                />
            </mesh>

            {/* Keyboard */}
            <mesh position={[0, 0.19, 0.05]}>
                <boxGeometry args={[1.05, 0.025, 0.52]} />
                <meshStandardMaterial
                    color="#15171d"
                    roughness={0.5}
                />
            </mesh>

            {/* Trackpad */}
            <mesh position={[0, 0.215, 0.27]}>
                <boxGeometry args={[0.28, 0.02, 0.18]} />
                <meshStandardMaterial
                    color="#626873"
                    roughness={0.3}
                />
            </mesh>

            {/* Screen frame */}
            <mesh
                position={[0, 0.72, -0.31]}
                rotation={[Math.PI * -0.08, 0, 0]}
            >
                <boxGeometry args={[1.18, 0.72, 0.07]} />
                <meshStandardMaterial
                    color="#181b22"
                    metalness={0.7}
                    roughness={0.25}
                />
            </mesh>

            {/* Screen */}
            <mesh
                position={[0, 0.72, -0.35]}
                rotation={[Math.PI * -0.08, 0, 0]}
            >
                <boxGeometry args={[1.02, 0.56, 0.015]} />
                <meshStandardMaterial
                    color="#172c45"
                    metalness={0.2}
                    roughness={0.15}
                    emissive="#12365c"
                    emissiveIntensity={0.35}
                />
            </mesh>

            {/* Hinge */}
            <mesh position={[0, 0.27, -0.31]}>
                <cylinderGeometry
                    args={[0.055, 0.055, 1.0, 16]}
                />
                <meshStandardMaterial
                    color="#4b515d"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>
        </group>
    );
}

/* =========================================================
   TV
========================================================= */

function TV3D() {
    return (
        <group>
            {/* Main TV body */}
            <mesh position={[0, 0.55, 0]}>
                <boxGeometry args={[1.55, 0.9, 0.08]} />
                <meshStandardMaterial
                    color="#101218"
                    metalness={0.7}
                    roughness={0.22}
                />
            </mesh>

            {/* Screen */}
            <mesh position={[0, 0.55, 0.052]}>
                <boxGeometry args={[1.38, 0.74, 0.015]} />
                <meshStandardMaterial
                    color="#081522"
                    metalness={0.25}
                    roughness={0.12}
                    emissive="#102d46"
                    emissiveIntensity={0.35}
                />
            </mesh>

            {/* Bottom bezel */}
            <mesh position={[0, 0.11, 0.055]}>
                <boxGeometry args={[1.4, 0.06, 0.02]} />
                <meshStandardMaterial color="#20242d" />
            </mesh>

            {/* Stand */}
            <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[0.12, 0.28, 0.12]} />
                <meshStandardMaterial
                    color="#222630"
                    metalness={0.7}
                    roughness={0.25}
                />
            </mesh>

            {/* Stand base */}
            <mesh position={[0, -0.18, 0]}>
                <boxGeometry args={[0.55, 0.06, 0.3]} />
                <meshStandardMaterial
                    color="#171a20"
                    metalness={0.6}
                    roughness={0.3}
                />
            </mesh>
        </group>
    );
}

/* =========================================================
   PRINTER
========================================================= */

function Printer3D() {
    return (
        <group>
            {/* Main body */}
            <mesh position={[0, 0.42, 0]}>
                <boxGeometry args={[1.05, 0.75, 0.8]} />
                <meshStandardMaterial
                    color="#d7d9dd"
                    metalness={0.15}
                    roughness={0.5}
                />
            </mesh>

            {/* Top scanner */}
            <mesh position={[0, 0.82, -0.02]}>
                <boxGeometry args={[0.9, 0.08, 0.65]} />
                <meshStandardMaterial
                    color="#242830"
                    metalness={0.35}
                    roughness={0.3}
                />
            </mesh>

            {/* Paper output opening */}
            <mesh position={[0, 0.32, 0.41]}>
                <boxGeometry args={[0.62, 0.16, 0.025]} />
                <meshStandardMaterial
                    color="#17191e"
                    roughness={0.6}
                />
            </mesh>

            {/* Paper */}
            <mesh position={[0, 0.20, 0.48]}>
                <boxGeometry args={[0.52, 0.28, 0.025]} />
                <meshStandardMaterial
                    color="#f4f4f4"
                    roughness={0.8}
                />
            </mesh>

            {/* Control panel */}
            <mesh position={[0.32, 0.65, 0.41]}>
                <boxGeometry args={[0.25, 0.13, 0.025]} />
                <meshStandardMaterial
                    color="#171a20"
                    roughness={0.4}
                />
            </mesh>

            {/* Power button */}
            <mesh position={[0.39, 0.67, 0.43]}>
                <cylinderGeometry
                    args={[0.035, 0.035, 0.025, 16]}
                />
                <meshStandardMaterial
                    color="#10b981"
                    emissive="#10b981"
                    emissiveIntensity={0.8}
                />
            </mesh>
        </group>
    );
}

/* =========================================================
   PRODUCT 3D
========================================================= */

export default function Product3D({
    type = "laptop",
    position = [0, 0, 0],
    scale = 1,
}) {
    return (
        <group position={position} scale={scale}>
            {type === "laptop" && <Laptop3D />}

            {type === "tv" && <TV3D />}

            {type === "printer" && <Printer3D />}
        </group>
    );
}