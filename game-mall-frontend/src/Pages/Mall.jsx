import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GroundFloor from "../Componant/Mall/GroundFloor";
import SecondFloor from "../Componant/Mall/SecondFloor";

function MallScene() {
    return (
        <>
            <ambientLight intensity={1.5} />

            <directionalLight
                position={[10, 20, 10]}
                intensity={2}
            />

            {/* Ground */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.1, 0]}
            >
                <planeGeometry args={[140, 140]} />
                <meshStandardMaterial color="#d8d8d8" />
            </mesh>

            {/* Center */}
            <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[21, 21, 0.5, 64]} />
                <meshStandardMaterial color="#eeeeee" />
            </mesh>

            {/* Fountain */}
            <mesh position={[0, 0.7, 0]}>
                <cylinderGeometry args={[5, 5, 0.8, 64]} />
                <meshStandardMaterial color="#bfc7d1" />
            </mesh>

            <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[3.5, 3.5, 0.5, 64]} />
                <meshStandardMaterial color="#8fd3ff" />
            </mesh>
            {/* Ground Floor Stores */}
            <GroundFloor />
            <SecondFloor />
        </>
    );
}

export default function Mall() {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "#111"
            }}
        >
            <Canvas
                camera={{
                    position: [0, 35, 55],
                    fov: 50
                }}
            >
                <MallScene />

                <OrbitControls
                    target={[0, 0, 0]}
                    enableDamping
                />
            </Canvas>
        </div>
    );
}