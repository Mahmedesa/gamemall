import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import GroundFloor from "../Componant/Mall/GroundFloor";
import SecondFloor from "../Componant/Mall/SecondFloor";
import Atrium from "../Componant/Mall/Atrium";
import AtriumRailing from "../Componant/Mall/AtriumRailing";
import Escalators from "../Componant/Mall/Escalators";
import VerticalCores from "../Componant/Mall/VerticalCores";
import MainEntrance from "../Componant/Mall/MainEntrance";
import MallFloor from "../Componant/Mall/MallFloor";
import MallDetails from "../Componant/Mall/MallDetails";
import SecondFloorShell from "../Componant/Mall/SecondFloorShell";
import MallFacade from "../Componant/Mall/MallFacade";
import AtriumRoof from "../Componant/Mall/AtriumRoof";
import MallLighting from "../Componant/Mall/MallLighting";


function MallScene() {
    return (
        <>
            {/* Background */}
            <color attach="background" args={["#111722"]} />

            {/* Lighting */}
            <MallLighting />

            {/* Mall floor */}
            <MallFloor />

            {/* Second floor architecture */}
            <SecondFloorShell />

            {/* Exterior facade */}
            <MallFacade />

            {/* Atrium roof */}
            <AtriumRoof />

            {/* Atrium */}
            <Atrium />

            {/* Atrium railing */}
            <AtriumRailing />

            {/* Ground floor stores */}
            <GroundFloor />

            {/* Second floor stores */}
            <SecondFloor />

            {/* Main entrance */}
            <MainEntrance />

            {/* Escalators */}
            <Escalators />

            {/* Elevators + stairs */}
            <VerticalCores />

            {/* Interior details */}
            <MallDetails />

            {/* Fountain */}
            <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[21, 21, 0.5, 64]} />
                <meshStandardMaterial color="#eeeeee" />
            </mesh>

            <mesh position={[0, 0.7, 0]}>
                <cylinderGeometry args={[5, 5, 0.8, 64]} />
                <meshStandardMaterial color="#bfc7d1" />
            </mesh>

            <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[3.5, 3.5, 0.5, 64]} />
                <meshStandardMaterial color="#8fd3ff" />
            </mesh>
        </>
    );
}


export default function Mall() {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "#111",
            }}
        >
            <Canvas
                camera={{
                    position: [0, 35, 55],
                    fov: 50,
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