import { Text } from "@react-three/drei";
import { Instances, Instance } from "@react-three/drei";

/*
|--------------------------------------------------------------------------
| تحسين الأداء:
|--------------------------------------------------------------------------
| 1) Column (×8) / Plant (×4) / Bench (×4) بقوا GPU Instanced -
|    بدل 58 mesh منفصل بقوا حوالي 10 draw calls بس (Instance
|    واحد لكل جزء متكرر: جسم العمود، تاجه، الأصيص، الجذع،
|    الورق الكبير، الورق الجانبي، مقعد البنش، ظهره، أرجله)
| 2) CeilingLight: الـ mesh المضيء لسه ظاهر في كل الـ 6 أماكن
|    (Instanced برضو)، لكن قللنا عدد pointLight الحقيقي من 6
|    لـ 3 بس (موزعين كويس، بيدوا إحساس بإضاءة كافية للأتريوم
|    من غير ما نثقّل حساب الإضاءة على المشهد كله)
|--------------------------------------------------------------------------
*/

const columnPositions = [
    [-20, 0, -38], [20, 0, -38],
    [-35, 0, -20], [35, 0, -20],
    [-35, 0, 18], [35, 0, 18],
    [-20, 0, 38], [20, 0, 38],
];

const plantPositions = [
    [-18, 0, -18], [18, 0, -18],
    [-18, 0, 18], [18, 0, 18],
];

const benches = [
    { position: [-12, 0, -18], rotation: Math.PI / 2 },
    { position: [12, 0, -18], rotation: -Math.PI / 2 },
    { position: [-12, 0, 18], rotation: Math.PI / 2 },
    { position: [12, 0, 18], rotation: -Math.PI / 2 },
];

const ceilingLightPositions = [
    [-18, 5, -15], [18, 5, -15],
    [-18, 5, 15], [18, 5, 15],
    [0, 5, -25], [0, 5, 25],
];

const activeLightPositions = [
    [-18, 5, -15],
    [18, 5, 15],
    [0, 5, -25],
];

const COLUMN_HEIGHT = 5.5;

export default function MallDetails() {
    return (
        <group>

            <Instances limit={columnPositions.length}>
                <cylinderGeometry args={[0.45, 0.55, COLUMN_HEIGHT, 20]} />
                <meshStandardMaterial
                    color="#b8bcc4"
                    metalness={0.35}
                    roughness={0.35}
                />
                {columnPositions.map((pos, i) => (
                    <Instance
                        key={i}
                        position={[pos[0], pos[1] + COLUMN_HEIGHT / 2, pos[2]]}
                    />
                ))}
            </Instances>

            <Instances limit={columnPositions.length}>
                <cylinderGeometry args={[0.65, 0.65, 0.3, 20]} />
                <meshStandardMaterial
                    color="#d5d7dc"
                    metalness={0.4}
                    roughness={0.3}
                />
                {columnPositions.map((pos, i) => (
                    <Instance
                        key={i}
                        position={[pos[0], pos[1] + COLUMN_HEIGHT + 0.15, pos[2]]}
                    />
                ))}
            </Instances>

            <Instances limit={plantPositions.length}>
                <cylinderGeometry args={[0.8, 0.65, 0.9, 24]} />
                <meshStandardMaterial color="#555b62" roughness={0.7} />
                {plantPositions.map((pos, i) => (
                    <Instance key={i} position={[pos[0], 0.45, pos[2]]} />
                ))}
            </Instances>

            <Instances limit={plantPositions.length}>
                <cylinderGeometry args={[0.12, 0.16, 2.2, 12]} />
                <meshStandardMaterial color="#5c4935" roughness={0.8} />
                {plantPositions.map((pos, i) => (
                    <Instance key={i} position={[pos[0], 1.8, pos[2]]} />
                ))}
            </Instances>

            <Instances limit={plantPositions.length}>
                <sphereGeometry args={[1.25, 16, 12]} />
                <meshStandardMaterial color="#477052" roughness={0.8} />
                {plantPositions.map((pos, i) => (
                    <Instance key={i} position={[pos[0], 2.8, pos[2]]} />
                ))}
            </Instances>

            <Instances limit={plantPositions.length * 2}>
                <sphereGeometry args={[0.7, 14, 10]} />
                <meshStandardMaterial color="#527d5b" roughness={0.8} />
                {plantPositions.map((pos, i) => (
                    <group key={i}>
                        <Instance
                            position={[pos[0] + 0.8, 2.5, pos[2] + 0.2]}
                        />
                        <Instance
                            position={[pos[0] - 0.7, 2.5, pos[2] - 0.2]}
                        />
                    </group>
                ))}
            </Instances>

            <Instances limit={benches.length}>
                <boxGeometry args={[3.2, 0.25, 0.8]} />
                <meshStandardMaterial color="#6c727a" roughness={0.7} />
                {benches.map((b, i) => (
                    <Instance
                        key={i}
                        position={[b.position[0], 0.7, b.position[2]]}
                        rotation={[0, b.rotation, 0]}
                    />
                ))}
            </Instances>

            <Instances limit={benches.length}>
                <boxGeometry args={[3.2, 0.8, 0.2]} />
                <meshStandardMaterial color="#565c64" roughness={0.7} />
                {benches.map((b, i) => {
                    const c = Math.cos(b.rotation);
                    const s = Math.sin(b.rotation);
                    const ox = 0.3 * s;
                    const oz = 0.3 * c;
                    return (
                        <Instance
                            key={i}
                            position={[
                                b.position[0] + ox,
                                1.2,
                                b.position[2] + oz,
                            ]}
                            rotation={[0, b.rotation, 0]}
                        />
                    );
                })}
            </Instances>

            <Instances limit={benches.length * 2}>
                <boxGeometry args={[0.18, 0.7, 0.18]} />
                <meshStandardMaterial
                    color="#343942"
                    metalness={0.6}
                    roughness={0.3}
                />
                {benches.map((b, i) => {
                    const c = Math.cos(b.rotation);
                    const s = Math.sin(b.rotation);
                    return (
                        <group key={i}>
                            <Instance
                                position={[
                                    b.position[0] - 1.1 * c,
                                    0.35,
                                    b.position[2] + 1.1 * s,
                                ]}
                                rotation={[0, b.rotation, 0]}
                            />
                            <Instance
                                position={[
                                    b.position[0] + 1.1 * c,
                                    0.35,
                                    b.position[2] - 1.1 * s,
                                ]}
                                rotation={[0, b.rotation, 0]}
                            />
                        </group>
                    );
                })}
            </Instances>

            <Instances limit={ceilingLightPositions.length}>
                <cylinderGeometry args={[0.35, 0.35, 0.12, 24]} />
                <meshStandardMaterial
                    color="#f5f5f5"
                    emissive="#ffffff"
                    emissiveIntensity={1.5}
                />
                {ceilingLightPositions.map((pos, i) => (
                    <Instance key={i} position={pos} />
                ))}
            </Instances>

            {activeLightPositions.map((pos, i) => (
                <pointLight
                    key={i}
                    position={[pos[0], pos[1] - 0.2, pos[2]]}
                    intensity={2.2}
                    distance={18}
                />
            ))}

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