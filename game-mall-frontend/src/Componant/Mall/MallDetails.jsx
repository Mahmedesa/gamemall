import { Text } from "@react-three/drei";

function Column({ position, height = 5.5 }) {
    return (
        <group position={position}>
            <mesh position={[0, height / 2, 0]}>
                <cylinderGeometry args={[0.45, 0.55, height, 20]} />
                <meshStandardMaterial
                    color="#b8bcc4"
                    metalness={0.35}
                    roughness={0.35}
                />
            </mesh>

            <mesh position={[0, height + 0.15, 0]}>
                <cylinderGeometry args={[0.65, 0.65, 0.3, 20]} />
                <meshStandardMaterial
                    color="#d5d7dc"
                    metalness={0.4}
                    roughness={0.3}
                />
            </mesh>
        </group>
    );
}

function Plant({ position }) {
    return (
        <group position={position}>
            {/* Pot */}
            <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.8, 0.65, 0.9, 24]} />
                <meshStandardMaterial
                    color="#555b62"
                    roughness={0.7}
                />
            </mesh>

            {/* Stem */}
            <mesh position={[0, 1.8, 0]}>
                <cylinderGeometry args={[0.12, 0.16, 2.2, 12]} />
                <meshStandardMaterial
                    color="#5c4935"
                    roughness={0.8}
                />
            </mesh>

            {/* Leaves */}
            <mesh position={[0, 2.8, 0]}>
                <sphereGeometry args={[1.25, 16, 12]} />
                <meshStandardMaterial
                    color="#477052"
                    roughness={0.8}
                />
            </mesh>

            <mesh position={[0.8, 2.5, 0.2]}>
                <sphereGeometry args={[0.7, 14, 10]} />
                <meshStandardMaterial
                    color="#527d5b"
                    roughness={0.8}
                />
            </mesh>

            <mesh position={[-0.7, 2.5, -0.2]}>
                <sphereGeometry args={[0.7, 14, 10]} />
                <meshStandardMaterial
                    color="#527d5b"
                    roughness={0.8}
                />
            </mesh>
        </group>
    );
}

function Bench({ position, rotation = 0 }) {
    return (
        <group
            position={position}
            rotation={[0, rotation, 0]}
        >
            {/* Seat */}
            <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={[3.2, 0.25, 0.8]} />
                <meshStandardMaterial
                    color="#6c727a"
                    roughness={0.7}
                />
            </mesh>

            {/* Back */}
            <mesh position={[0, 1.2, 0.3]}>
                <boxGeometry args={[3.2, 0.8, 0.2]} />
                <meshStandardMaterial
                    color="#565c64"
                    roughness={0.7}
                />
            </mesh>

            {/* Legs */}
            <mesh position={[-1.1, 0.35, 0]}>
                <boxGeometry args={[0.18, 0.7, 0.18]} />
                <meshStandardMaterial
                    color="#343942"
                    metalness={0.6}
                    roughness={0.3}
                />
            </mesh>

            <mesh position={[1.1, 0.35, 0]}>
                <boxGeometry args={[0.18, 0.7, 0.18]} />
                <meshStandardMaterial
                    color="#343942"
                    metalness={0.6}
                    roughness={0.3}
                />
            </mesh>
        </group>
    );
}

function CeilingLight({ position }) {
    return (
        <group position={position}>
            <mesh>
                <cylinderGeometry args={[0.35, 0.35, 0.12, 24]} />
                <meshStandardMaterial
                    color="#f5f5f5"
                    emissive="#ffffff"
                    emissiveIntensity={1.5}
                />
            </mesh>

            <pointLight
                intensity={1.2}
                distance={12}
                position={[0, -0.2, 0]}
            />
        </group>
    );
}

export default function MallDetails() {
    return (
        <group>

            {/* =========================
                MAIN COLUMNS
            ========================= */}

            <Column position={[-20, 0, -38]} />
            <Column position={[20, 0, -38]} />

            <Column position={[-35, 0, -20]} />
            <Column position={[35, 0, -20]} />

            <Column position={[-35, 0, 18]} />
            <Column position={[35, 0, 18]} />

            <Column position={[-20, 0, 38]} />
            <Column position={[20, 0, 38]} />


            {/* =========================
                ATRIUM PLANTS
            ========================= */}

            <Plant position={[-18, 0, -18]} />
            <Plant position={[18, 0, -18]} />

            <Plant position={[-18, 0, 18]} />
            <Plant position={[18, 0, 18]} />


            {/* =========================
                SEATING
            ========================= */}

            <Bench
                position={[-12, 0, -18]}
                rotation={Math.PI / 2}
            />

            <Bench
                position={[12, 0, -18]}
                rotation={-Math.PI / 2}
            />

            <Bench
                position={[-12, 0, 18]}
                rotation={Math.PI / 2}
            />

            <Bench
                position={[12, 0, 18]}
                rotation={-Math.PI / 2}
            />


            {/* =========================
                LIGHTS
            ========================= */}

            <CeilingLight position={[-18, 5, -15]} />
            <CeilingLight position={[18, 5, -15]} />

            <CeilingLight position={[-18, 5, 15]} />
            <CeilingLight position={[18, 5, 15]} />

            <CeilingLight position={[0, 5, -25]} />
            <CeilingLight position={[0, 5, 25]} />


            {/* =========================
                ATRIUM SIGN
            ========================= */}

            <Text
                position={[0, 4.5, 0]}
                fontSize={0.8}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                GAMEMALL
            </Text>

        </group>
    );
}