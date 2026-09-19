import { Text } from "@react-three/drei";
import { mallMaterials } from "./MallMaterials";

/*
|--------------------------------------------------------------------------
| تحسين الأداء والديناميكية:
|--------------------------------------------------------------------------
| تم إضافة دعم storeStatus و storeName لتغيير ألوان إضاءة الـ LED
| والنصوص ديناميكيًا حسب حالة المحل (متاح / محجوز / غير نشط).
|--------------------------------------------------------------------------
*/

// دالة لتحديد الألوان والإضاءة بناءً على حالة المحل
const getStatusTheme = (status) => {
    switch (status) {
        case "AVAILABLE":
            return {
                statusColor: "#10b981", // أخضر للمتاح
                signLed: "#10b981",
                doorLed: "#34d399",
                opacity: 0.15,
            };
        case "OCCUPIED":
            return {
                statusColor: "#3b82f6", // أزرق للمشغول / المحجوز
                signLed: "#7c3cff",
                doorLed: "#8ddcff",
                opacity: 0.25,
            };
        case "INACTIVE":
        default:
            return {
                statusColor: "#6b7280", // رمادي لغير النشط
                signLed: "#4b5563",
                doorLed: "#6b7280",
                opacity: 0.05,
            };
    }
};

export default function Store3D({
    id,
    storeName,
    storeStatus = "AVAILABLE",
    position = [0, 0, 0],
    rotation = 0,
    width = 6,
    depth = 10,
    height = 5.5,
}) {
    const theme = getStatusTheme(storeStatus);
    const displayName = storeName || id; // استخدام اسم المحل إن وجد، وإلا رمز المحل
    const signWidth = Math.min(width * 0.8, 7);
    const entranceWidth = Math.min(width * 0.32, 2.4);

    return (
        <group position={position} rotation={[0, rotation, 0]}>

            {/* STORE BODY */}
            <mesh position={[0, height / 2, 0]} material={mallMaterials.storeBody}>
                <boxGeometry args={[width, height, depth]} />
            </mesh>

            {/* GLASS FRONT */}
            <mesh position={[0, height / 2, depth / 2 + 0.03]} material={mallMaterials.storeGlass}>
                <boxGeometry args={[width * 0.82, height * 0.78, 0.08]} />
            </mesh>

            {/* Interior light panel */}
            <mesh position={[0, height * 0.58, depth / 2 - 0.08]}>
                <boxGeometry args={[width * 0.68, height * 0.55, 0.05]} />
                <meshStandardMaterial
                    color={theme.doorLed}
                    emissive={theme.doorLed}
                    emissiveIntensity={0.8}
                    transparent
                    opacity={theme.opacity}
                />
            </mesh>

            {/* ENTRANCE */}
            <mesh position={[0, height * 0.39, depth / 2 + 0.09]} material={mallMaterials.darkMetal}>
                <boxGeometry args={[entranceWidth, height * 0.78, 0.1]} />
            </mesh>

            {/* DOOR LED */}
            <mesh position={[-entranceWidth / 2 - 0.05, height * 0.39, depth / 2 + 0.16]}>
                <boxGeometry args={[0.06, height * 0.72, 0.06]} />
                <meshStandardMaterial color={theme.doorLed} emissive={theme.doorLed} emissiveIntensity={2.5} />
            </mesh>

            <mesh position={[entranceWidth / 2 + 0.05, height * 0.39, depth / 2 + 0.16]}>
                <boxGeometry args={[0.06, height * 0.72, 0.06]} />
                <meshStandardMaterial color={theme.doorLed} emissive={theme.doorLed} emissiveIntensity={2.5} />
            </mesh>

            {/* STORE SIGN BODY */}
            <mesh position={[0, height * 0.9, depth / 2 + 0.12]} material={mallMaterials.storeFrame}>
                <boxGeometry args={[signWidth, 0.65, 0.15]} />
            </mesh>

            {/* TOP LED */}
            <mesh position={[0, height * 0.9 + 0.36, depth / 2 + 0.2]}>
                <boxGeometry args={[signWidth + 0.08, 0.08, 0.08]} />
                <meshStandardMaterial color={theme.signLed} emissive={theme.signLed} emissiveIntensity={4} />
            </mesh>

            {/* STORE NAME / NEON */}
            <Text
                position={[0, height * 0.9, depth / 2 + 0.22]}
                fontSize={0.38}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor={theme.statusColor}
            >
                {displayName}
            </Text>

            {/* BOTTOM LED */}
            <mesh position={[0, 0.18, depth / 2 + 0.17]}>
                <boxGeometry args={[width * 0.76, 0.08, 0.08]} />
                <meshStandardMaterial color={theme.doorLed} emissive={theme.doorLed} emissiveIntensity={3} />
            </mesh>

            {/* SIDE LED ACCENTS */}
            <mesh position={[-(width * 0.41), height * 0.5, depth / 2 + 0.15]}>
                <boxGeometry args={[0.06, height * 0.68, 0.06]} />
                <meshStandardMaterial color={theme.signLed} emissive={theme.signLed} emissiveIntensity={2} />
            </mesh>

            <mesh position={[width * 0.41, height * 0.5, depth / 2 + 0.15]}>
                <boxGeometry args={[0.06, height * 0.68, 0.06]} />
                <meshStandardMaterial color={theme.signLed} emissive={theme.signLed} emissiveIntensity={2} />
            </mesh>

            {/* STORE FLOOR */}
            <mesh position={[0, 0.05, 0]} material={mallMaterials.storeBase}>
                <boxGeometry args={[width + 0.15, 0.1, depth + 0.15]} />
            </mesh>

        </group>
    );
}