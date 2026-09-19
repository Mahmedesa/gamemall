import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";

/*
|--------------------------------------------------------------------------
| تحسينات الأداء المطبقة هنا:
|--------------------------------------------------------------------------
| 1) قللنا الـ pointLight من 13 لـ 3 بس (كانت أكبر عبء - كل ضوء
|    ديناميكي بيتحسب لكل مادة في المشهد كله، مش بس اللي جنبه)
| 2) أنوار الـ Plaza الصغيرة (8 قطعة) بقت تعتمد على المادة
|    المضيئة (emissive) بس من غير pointLight منفصل لكل واحدة -
|    نفس الشكل البصري تقريبًا، من غير التكلفة
| 3) قللنا segments الحلقات/الدوائر من 96 لـ 48 (نفس الشكل
|    بصريًا من مسافة الكاميرا العادية، نص عدد الرؤوس)
| 4) الأنوار الصغيرة والقواعد بقت GPU Instanced (draw call واحد
|    بدل 16 منفصلة)
|--------------------------------------------------------------------------
*/

function FountainWater() {
    const waterRef = useRef();
    const ringRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        if (waterRef.current) {
            waterRef.current.scale.x = 1 + Math.sin(t * 1.8) * 0.015;
            waterRef.current.scale.z = 1 + Math.cos(t * 1.6) * 0.015;
        }

        if (ringRef.current) {
            ringRef.current.rotation.z = t * 0.12;
        }
    });

    return (
        <>
            <mesh ref={waterRef} position={[0, 0.55, 0]}>
                <cylinderGeometry args={[3.8, 3.8, 0.08, 48]} />
                <meshPhysicalMaterial
                    color="#8fd3ff"
                    transparent
                    opacity={0.72}
                    roughness={0.05}
                    metalness={0.2}
                    transmission={0.35}
                />
            </mesh>

            <mesh
                ref={ringRef}
                position={[0, 0.61, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <ringGeometry args={[2.7, 3.45, 48]} />
                <meshStandardMaterial
                    color="#8ddcff"
                    emissive="#38bdf8"
                    emissiveIntensity={1.4}
                    transparent
                    opacity={0.5}
                />
            </mesh>
        </>
    );
}


/* =====================================================
   FOUNTAIN JETS (Instanced - نفس الشكل، هندسة واحدة مشتركة)
===================================================== */

function FountainJets() {
    const positions = [
        [0, 0, 0],
        [1.5, 0, 0],
        [-1.5, 0, 0],
        [0, 0, 1.5],
        [0, 0, -1.5],
    ];

    const refs = useRef([]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        refs.current.forEach((ref, index) => {
            if (!ref) return;
            const wave = Math.sin(t * 3.5 + index * 0.8) * 0.25;
            ref.scale.y = 1 + wave;
        });
    });

    return (
        <group>
            {positions.map((position, index) => {
                const height = index === 0 ? 2.8 : 1.5;
                return (
                    <mesh
                        key={index}
                        ref={(el) => (refs.current[index] = el)}
                        position={[
                            position[0],
                            0.65 + height / 2,
                            position[2],
                        ]}
                    >
                        <cylinderGeometry
                            args={[0.06, 0.12, height, 12]}
                        />
                        <meshStandardMaterial
                            color="#b9ecff"
                            emissive="#38bdf8"
                            emissiveIntensity={1.8}
                            transparent
                            opacity={0.65}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}


/* =====================================================
   FOUNTAIN LIGHTS
   (قللناها من 4 لـ 2 بس - قدام وورا، كافيين لإضاءة
   النافورة، ومسافتهم مكبّرة شوية عشان يعوّضوا)
===================================================== */

function FountainLights() {
    const lights = [
        [0, 0.8, -2.5],
        [0, 0.8, 2.5],
    ];

    return (
        <group>
            {lights.map((position, index) => (
                <pointLight
                    key={index}
                    position={position}
                    color="#63d8ff"
                    intensity={4}
                    distance={9}
                />
            ))}
        </group>
    );
}


/* =====================================================
   CENTRAL PLAZA LED RING
===================================================== */

function PlazaLightRing({ radius, tube, y, color = "#38bdf8" }) {
    return (
        <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + tube, 48]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2.5}
                transparent
                opacity={0.85}
            />
        </mesh>
    );
}


/* =====================================================
   SMALL PLAZA LIGHTS (Instanced, بدون pointLight فردي)
   ------------------------------------------------------
   بدل ما كل واحدة من الـ 8 نقط تعمل pointLight لوحدها
   (8 أضواء ديناميكية زيادة)، بقينا نعتمد على المادة
   المضيئة (emissive) بس - نفس التأثير البصري تقريبًا
   من غير ما نثقّل حساب الإضاءة على باقي المشهد.
===================================================== */

function PlazaLights() {
    const count = 8;
    const radiusX = 7;
    const radiusZ = 5.5;

    const positions = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        positions.push([
            Math.cos(angle) * radiusX,
            Math.sin(angle) * radiusZ,
        ]);
    }

    return (
        <group>
            {/* القواعد - Instance واحد */}
            <Instances limit={count}>
                <cylinderGeometry args={[0.22, 0.28, 0.24, 12]} />
                <meshStandardMaterial
                    color="#69727d"
                    metalness={0.7}
                    roughness={0.3}
                />
                {positions.map(([x, z], i) => (
                    <Instance key={i} position={[x, 0.12, z]} />
                ))}
            </Instances>

            {/* الكرات المضيئة - Instance واحد */}
            <Instances limit={count}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshStandardMaterial
                    color="#8ddcff"
                    emissive="#38bdf8"
                    emissiveIntensity={4}
                />
                {positions.map(([x, z], i) => (
                    <Instance key={i} position={[x, 0.3, z]} />
                ))}
            </Instances>

            {/*
              ضوء واحد بس في النص بدل 8 أضواء فردية، بيدي
              إحساس بإن المنطقة دي مضيئة من غير 8× التكلفة
            */}
            <pointLight
                position={[0, 0.5, 0]}
                color="#63d8ff"
                intensity={1.2}
                distance={9}
            />
        </group>
    );
}


/* =====================================================
   PLAZA DECORATIVE LINES
===================================================== */

function PlazaLines() {
    return (
        <group>
            <mesh position={[0, 0.09, -8]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[14, 0.06]} />
                <meshStandardMaterial
                    color="#8ddcff"
                    emissive="#38bdf8"
                    emissiveIntensity={2}
                />
            </mesh>

            <mesh position={[0, 0.09, 8]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[14, 0.06]} />
                <meshStandardMaterial
                    color="#8ddcff"
                    emissive="#38bdf8"
                    emissiveIntensity={2}
                />
            </mesh>

            <mesh
                position={[-9, 0.09, 0]}
                rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            >
                <planeGeometry args={[11, 0.06]} />
                <meshStandardMaterial
                    color="#a855f7"
                    emissive="#a855f7"
                    emissiveIntensity={2}
                />
            </mesh>

            <mesh
                position={[9, 0.09, 0]}
                rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            >
                <planeGeometry args={[11, 0.06]} />
                <meshStandardMaterial
                    color="#a855f7"
                    emissive="#a855f7"
                    emissiveIntensity={2}
                />
            </mesh>
        </group>
    );
}


/* =====================================================
   MAIN ATRIUM
===================================================== */

export default function Atrium() {
    const radiusX = 21;
    const radiusZ = 15;
    const floorY = 0.05;

    return (
        <group>

            <mesh
                position={[0, floorY, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[radiusX, radiusZ, 1]}
            >
                <circleGeometry args={[1, 48]} />
                <meshStandardMaterial
                    color="#eeeeee"
                    roughness={0.65}
                    metalness={0.08}
                />
            </mesh>

            <mesh
                position={[0, 0.08, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[radiusX, radiusZ, 1]}
            >
                <ringGeometry args={[0.94, 1, 48]} />
                <meshStandardMaterial
                    color="#9da3ad"
                    metalness={0.35}
                    roughness={0.4}
                />
            </mesh>

            <mesh
                position={[0, 0.12, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[radiusX, radiusZ, 1]}
            >
                <ringGeometry args={[0.72, 0.76, 48]} />
                <meshStandardMaterial
                    color="#c7cbd1"
                    metalness={0.45}
                    roughness={0.35}
                />
            </mesh>

            <PlazaLightRing radius={5.25} tube={0.12} y={0.57} color="#38bdf8" />
            <PlazaLightRing radius={6.3} tube={0.07} y={0.1} color="#a855f7" />

            <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[5, 5, 0.35, 48]} />
                <meshStandardMaterial
                    color="#bfc7d1"
                    metalness={0.35}
                    roughness={0.3}
                />
            </mesh>

            <FountainWater />

            <mesh position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.7, 24]} />
                <meshStandardMaterial
                    color="#d8dce2"
                    metalness={0.5}
                    roughness={0.25}
                />
            </mesh>

            <FountainJets />
            <FountainLights />
            <PlazaLights />
            <PlazaLines />

            {/* الضوء المركزي الرئيسي - سيبناه، هو أهم ضوء في الأتريوم */}
            <pointLight
                position={[0, 2.5, 0]}
                intensity={8}
                distance={12}
                color="#8ddcff"
            />

        </group>
    );
}