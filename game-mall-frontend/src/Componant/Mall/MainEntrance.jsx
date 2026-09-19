import { Text } from "@react-three/drei";

/*
|--------------------------------------------------------------------------
| تحسين الأداء:
|--------------------------------------------------------------------------
| المكون ده بيظهر مرة واحدة بس في المشهد (مش متكرر)، فعدد الـ
| meshes مش بيمثل مشكلة كبيرة لوحده. اللي اتعدل هنا هو تقليل
| الـ pointLight من 4 لـ 2 (كل ضوء زيادة بيتحسب على مستوى
| المشهد كله، فتقليله بيفرق حتى لو مكانه واحد بس).
| - دمجنا ضوئي الجانبين (يمين ويسار) في ضوء مركزي واحد بمدى أوسع
| - سيبنا ضوء الـ Canopy لأنه بيضيء منطقة مختلفة فعليًا
| - شلنا الضوء الداخلي الرابع لأن أبواب الدخول أصلاً مضيئة
|   بمواد emissive وميحتاجوش ضوء حقيقي إضافي
|--------------------------------------------------------------------------
*/

export default function MainEntrance() {
    return (
        <group position={[0, 0, -58]}>

            {/* Entrance Platform */}
            <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[18, 0.24, 7]} />
                <meshStandardMaterial
                    color="#555b68"
                    roughness={0.45}
                    metalness={0.2}
                />
            </mesh>

            <mesh position={[0, 0.275, -2.65]}>
                <boxGeometry args={[13.5, 0.035, 0.045]} />
                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#38bdf8"
                    emissiveIntensity={3}
                />
            </mesh>

            <mesh position={[0, 0.27, -3.15]}>
                <boxGeometry args={[16, 0.08, 0.12]} />
                <meshStandardMaterial
                    color="#7c3cff"
                    emissive="#7c3cff"
                    emissiveIntensity={3}
                />
            </mesh>

            <mesh position={[-8, 0.27, 0]}>
                <boxGeometry args={[0.12, 0.08, 5.8]} />
                <meshStandardMaterial
                    color="#7c3cff"
                    emissive="#7c3cff"
                    emissiveIntensity={3}
                />
            </mesh>

            <mesh position={[8, 0.27, 0]}>
                <boxGeometry args={[0.12, 0.08, 5.8]} />
                <meshStandardMaterial
                    color="#7c3cff"
                    emissive="#7c3cff"
                    emissiveIntensity={3}
                />
            </mesh>

            {/* Left Pillar */}
            <mesh position={[-7, 3.2, 0]}>
                <boxGeometry args={[1.2, 6.4, 1.2]} />
                <meshStandardMaterial
                    color="#202433"
                    metalness={0.55}
                    roughness={0.3}
                />
            </mesh>

            <mesh position={[-6.38, 3.2, 0.63]}>
                <boxGeometry args={[0.08, 5.7, 0.08]} />
                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#38bdf8"
                    emissiveIntensity={3}
                />
            </mesh>

            {/* Right Pillar */}
            <mesh position={[7, 3.2, 0]}>
                <boxGeometry args={[1.2, 6.4, 1.2]} />
                <meshStandardMaterial
                    color="#202433"
                    metalness={0.55}
                    roughness={0.3}
                />
            </mesh>

            <mesh position={[6.38, 3.2, 0.63]}>
                <boxGeometry args={[0.08, 5.7, 0.08]} />
                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#38bdf8"
                    emissiveIntensity={3}
                />
            </mesh>

            {/* Glass Entrance */}
            <mesh position={[0, 3, 0]}>
                <boxGeometry args={[12.8, 5.8, 0.12]} />
                <meshPhysicalMaterial
                    color="#a9e3ff"
                    transparent
                    opacity={0.28}
                    roughness={0.05}
                    metalness={0.15}
                    transmission={0.2}
                />
            </mesh>

            <mesh position={[0, 3.1, 0.08]}>
                <boxGeometry args={[11.8, 5.1, 0.04]} />
                <meshStandardMaterial
                    color="#8ddcff"
                    emissive="#38bdf8"
                    emissiveIntensity={0.35}
                    transparent
                    opacity={0.08}
                />
            </mesh>

            {/* Left Door */}
            <mesh position={[-1.65, 2.3, -0.12]}>
                <boxGeometry args={[3.1, 4.6, 0.1]} />
                <meshPhysicalMaterial
                    color="#bdeaff"
                    transparent
                    opacity={0.42}
                    roughness={0.05}
                    transmission={0.3}
                />
            </mesh>

            {/* Right Door */}
            <mesh position={[1.65, 2.3, -0.12]}>
                <boxGeometry args={[3.1, 4.6, 0.1]} />
                <meshPhysicalMaterial
                    color="#bdeaff"
                    transparent
                    opacity={0.42}
                    roughness={0.05}
                    transmission={0.3}
                />
            </mesh>

            {/* Door Frame LEDs */}
            <mesh position={[-3.2, 2.3, -0.2]}>
                <boxGeometry args={[0.06, 4.5, 0.06]} />
                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#38bdf8"
                    emissiveIntensity={3}
                />
            </mesh>

            <mesh position={[3.2, 2.3, -0.2]}>
                <boxGeometry args={[0.06, 4.5, 0.06]} />
                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#38bdf8"
                    emissiveIntensity={3}
                />
            </mesh>

            <mesh position={[0, 2.3, -0.2]}>
                <boxGeometry args={[0.07, 4.5, 0.08]} />
                <meshStandardMaterial
                    color="#8ddcff"
                    emissive="#8ddcff"
                    emissiveIntensity={3}
                />
            </mesh>

            {/* Entrance Header */}
            <mesh position={[0, 6.35, 0]}>
                <boxGeometry args={[15, 0.9, 1.2]} />
                <meshStandardMaterial
                    color="#171a28"
                    metalness={0.7}
                    roughness={0.2}
                />
            </mesh>

            <mesh position={[0, 6.05, -0.64]}>
                <boxGeometry args={[14.2, 0.06, 0.07]} />
                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#38bdf8"
                    emissiveIntensity={3}
                />
            </mesh>

            <mesh position={[0, 6.82, -0.64]}>
                <boxGeometry args={[14.5, 0.08, 0.08]} />
                <meshStandardMaterial
                    color="#7c3cff"
                    emissive="#7c3cff"
                    emissiveIntensity={4}
                />
            </mesh>

            <Text
                position={[0, 6.38, -0.65]}
                fontSize={0.65}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.025}
                outlineColor="#7c3cff"
            >
                MAIN ENTRANCE
            </Text>

            {/* Entrance Canopy */}
            <mesh position={[0, 7, -2.2]}>
                <boxGeometry args={[17, 0.35, 5]} />
                <meshStandardMaterial
                    color="#292d3d"
                    metalness={0.55}
                    roughness={0.25}
                />
            </mesh>

            <mesh position={[0, 7.2, -2.2]}>
                <boxGeometry args={[15.8, 0.05, 4.4]} />
                <meshStandardMaterial
                    color="#202633"
                    emissive="#7c3cff"
                    emissiveIntensity={0.35}
                />
            </mesh>

            <mesh position={[0, 7.2, -4.68]}>
                <boxGeometry args={[16.5, 0.08, 0.08]} />
                <meshStandardMaterial
                    color="#7c3cff"
                    emissive="#7c3cff"
                    emissiveIntensity={4}
                />
            </mesh>

            <mesh position={[0, 7.18, -4.48]}>
                <boxGeometry args={[14.5, 0.045, 0.045]} />
                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#38bdf8"
                    emissiveIntensity={3}
                />
            </mesh>

            <mesh position={[-8.25, 7.2, -2.2]}>
                <boxGeometry args={[0.08, 0.08, 4.8]} />
                <meshStandardMaterial
                    color="#a855f7"
                    emissive="#a855f7"
                    emissiveIntensity={3}
                />
            </mesh>

            <mesh position={[8.25, 7.2, -2.2]}>
                <boxGeometry args={[0.08, 0.08, 4.8]} />
                <meshStandardMaterial
                    color="#a855f7"
                    emissive="#a855f7"
                    emissiveIntensity={3}
                />
            </mesh>

            {/* Canopy Supports */}
            <mesh position={[-6.5, 3.5, -2.2]}>
                <boxGeometry args={[0.3, 7, 0.3]} />
                <meshStandardMaterial
                    color="#8d96a5"
                    metalness={0.75}
                    roughness={0.2}
                />
            </mesh>

            <mesh position={[6.5, 3.5, -2.2]}>
                <boxGeometry args={[0.3, 7, 0.3]} />
                <meshStandardMaterial
                    color="#8d96a5"
                    metalness={0.75}
                    roughness={0.2}
                />
            </mesh>

            <mesh position={[-6.34, 3.5, -2.36]}>
                <boxGeometry args={[0.07, 6.5, 0.07]} />
                <meshStandardMaterial
                    color="#8ddcff"
                    emissive="#8ddcff"
                    emissiveIntensity={3}
                />
            </mesh>

            <mesh position={[6.34, 3.5, -2.36]}>
                <boxGeometry args={[0.07, 6.5, 0.07]} />
                <meshStandardMaterial
                    color="#8ddcff"
                    emissive="#8ddcff"
                    emissiveIntensity={3}
                />
            </mesh>

            {/* Entrance Lighting - قللناها من 4 لـ 2 */}
            <pointLight
                position={[0, 5.5, -2]}
                color="#8ddcff"
                intensity={5}
                distance={18}
            />

            <pointLight
                position={[0, 7, -4]}
                color="#a855f7"
                intensity={4}
                distance={12}
            />

        </group>
    );
}