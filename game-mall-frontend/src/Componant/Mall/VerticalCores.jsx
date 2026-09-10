import { Text } from "@react-three/drei";

function Elevator({ position }) {
    return (
        <group position={position}>
            {/* Elevator shaft */}
            <mesh position={[0, 2.7, 0]}>
                <boxGeometry args={[2.2, 5.4, 2.2]} />

                <meshStandardMaterial
                    color="#202632"
                    metalness={0.7}
                    roughness={0.3}
                />
            </mesh>

            {/* Glass door */}
            <mesh position={[0, 1.45, -1.13]}>
                <boxGeometry args={[1.4, 2.3, 0.08]} />

                <meshPhysicalMaterial
                    color="#9edfff"
                    transparent
                    opacity={0.35}
                    metalness={0.5}
                    roughness={0.1}
                    transmission={0.2}
                />
            </mesh>

            {/* Door frame */}
            <mesh position={[-0.75, 1.45, -1.18]}>
                <boxGeometry args={[0.08, 2.4, 0.12]} />

                <meshStandardMaterial
                    color="#737d8a"
                    metalness={0.8}
                    roughness={0.25}
                />
            </mesh>

            <mesh position={[0.75, 1.45, -1.18]}>
                <boxGeometry args={[0.08, 2.4, 0.12]} />

                <meshStandardMaterial
                    color="#737d8a"
                    metalness={0.8}
                    roughness={0.25}
                />
            </mesh>
        </group>
    );
}

function Stairs({ position }) {
    const steps = [];

    const stepCount = 10;
    const stepWidth = 3;
    const stepDepth = 0.65;
    const stepHeight = 0.28;

    for (let i = 0; i < stepCount; i++) {
        steps.push(
            <mesh
                key={i}
                position={[
                    0,
                    i * stepHeight + stepHeight / 2,
                    i * stepDepth,
                ]}
            >
                <boxGeometry
                    args={[
                        stepWidth,
                        stepHeight,
                        stepDepth,
                    ]}
                />

                <meshStandardMaterial
                    color="#8d949e"
                    roughness={0.55}
                />
            </mesh>
        );
    }

    return (
        <group position={position}>
            {steps}
        </group>
    );
}

function Core({ position, id }) {
    return (
        <group position={position}>

            {/* Core body */}
            <mesh position={[0, 2.7, 0]}>
                <boxGeometry args={[6, 5.4, 6]} />

                <meshStandardMaterial
                    color="#252b36"
                    roughness={0.5}
                    metalness={0.35}
                />
            </mesh>

            {/* Glass facade */}
            <mesh position={[0, 2.7, -3.05]}>
                <boxGeometry args={[5.2, 4.8, 0.12]} />

                <meshPhysicalMaterial
                    color="#b9e6ff"
                    transparent
                    opacity={0.22}
                    roughness={0.08}
                    metalness={0.35}
                    transmission={0.2}
                />
            </mesh>

            {/* Elevator */}
            <Elevator position={[0, 0, -0.9]} />

            {/* Stairs */}
            <Stairs position={[-1.3, 0.05, 1.0]} />

            {/* Core label */}
            <Text
                position={[0, 5.8, 0]}
                fontSize={0.48}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {id}
            </Text>
        </group>
    );
}

export default function VerticalCores() {
    return (
        <group>

            {/* Ground floor */}
            <Core
                id="CORE-L"
                position={[-32, 0, 43]}
            />

            <Core
                id="CORE-R"
                position={[32, 0, 43]}
            />

            {/* Second floor */}
            <Core
                id="CORE-L"
                position={[-32, 5.5, 43]}
            />

            <Core
                id="CORE-R"
                position={[32, 5.5, 43]}
            />

        </group>
    );
}