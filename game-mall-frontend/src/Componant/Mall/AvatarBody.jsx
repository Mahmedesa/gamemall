import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export const SKIN_TONES = ["#ffe0bd", "#f5d0b0", "#e8b895", "#c68642", "#8d5524", "#4a2c17"];
export const HAIR_COLORS = ["#1c1c1c", "#2b1b12", "#4a2f1c", "#7a4a24", "#c9a227", "#8b0000", "#e5e5e5"];
export const EYE_COLORS = ["#3b2a1a", "#1e3a8a", "#166534", "#57534e", "#000000", "#7c2d12"];
export const LIP_COLORS = ["#b45309", "#be123c", "#9f1239", "#7c2d12", "#db2777"];
export const SHIRT_COLORS = ["#7c3cff", "#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#ffffff", "#111827"];
export const PANTS_COLORS = ["#252932", "#1e293b", "#374151", "#78350f", "#0f172a", "#4b5563"];

export const HAIR_STYLES = ["none", "short", "long"];
export const EYE_STYLES = ["round", "anime", "dots"];
export const NOSE_STYLES = ["button", "classic", "none"];
export const EAR_STYLES = ["round", "pointed", "small"];
export const LIP_STYLES = ["smile", "full", "flat"];
export const BODY_TYPES = ["male", "female"];

export const HEIGHT_RANGE = { min: 0.85, max: 1.15, step: 0.01 };
export const WEIGHT_RANGE = { min: 0.85, max: 1.25, step: 0.01 };

export const DEFAULT_CUSTOMIZATION = {
    bodyType: "male",
    skinColor: SKIN_TONES[2],
    hairStyle: "short",
    hairColor: HAIR_COLORS[1],
    eyeStyle: "round",
    eyeColor: EYE_COLORS[0],
    noseStyle: "button",
    earStyle: "round",
    lipStyle: "smile",
    lipColor: LIP_COLORS[0],
    shirtColor: SHIRT_COLORS[0],
    pantsColor: PANTS_COLORS[0],
    height: 1,
    weight: 1,
};

// 1. ملامح الوجه المطورة
function FaceFeatures({ headY, skinColor, eyeColor, lipColor, eyeStyle, noseStyle, lipStyle }) {
    return (
        <group position={[0, headY, 0]}>
            {/* العيون */}
            <group position={[0, 0.02, 0.16]}>
                {eyeStyle !== "dots" ? (
                    <>
                        <mesh position={[-0.065, 0, 0]} scale={[1, 0.9, 0.5]}>
                            <sphereGeometry args={[0.035, 32, 32]} />
                            <meshStandardMaterial color="#ffffff" roughness={0.2} />
                        </mesh>
                        <mesh position={[-0.065, 0, 0.015]} scale={[1, 0.9, 0.2]}>
                            <sphereGeometry args={[0.02, 32, 32]} />
                            <meshStandardMaterial color={eyeColor} roughness={0.1} />
                        </mesh>

                        <mesh position={[0.065, 0, 0]} scale={[1, 0.9, 0.5]}>
                            <sphereGeometry args={[0.035, 32, 32]} />
                            <meshStandardMaterial color="#ffffff" roughness={0.2} />
                        </mesh>
                        <mesh position={[0.065, 0, 0.015]} scale={[1, 0.9, 0.2]}>
                            <sphereGeometry args={[0.02, 32, 32]} />
                            <meshStandardMaterial color={eyeColor} roughness={0.1} />
                        </mesh>
                    </>
                ) : (
                    <>
                        <mesh position={[-0.065, 0, 0.01]}><sphereGeometry args={[0.02, 16, 16]} /><meshStandardMaterial color="#111" /></mesh>
                        <mesh position={[0.065, 0, 0.01]}><sphereGeometry args={[0.02, 16, 16]} /><meshStandardMaterial color="#111" /></mesh>
                    </>
                )}
            </group>

            {/* الأنف */}
            {noseStyle !== "none" && (
                <mesh position={[0, -0.02, 0.18]} rotation={[-0.1, 0, 0]}>
                    <coneGeometry args={[0.018, 0.05, 16]} />
                    <meshStandardMaterial color={skinColor} roughness={0.6} />
                </mesh>
            )}

            {/* الشفاه */}
            <mesh position={[0, -0.08, 0.165]} scale={[1.3, 0.5, 0.6]}>
                <sphereGeometry args={[0.022, 16, 16]} />
                <meshStandardMaterial color={lipColor} roughness={0.3} />
            </mesh>
        </group>
    );
}

// 2. الشعر
function Hair({ style, color, headY }) {
    if (style === "none") return null;
    return (
        <group position={[0, headY, 0]}>
            {style === "short" && (
                <mesh position={[0, 0.04, -0.01]} scale={[1.02, 0.95, 1.05]}>
                    <sphereGeometry args={[0.19, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                    <meshStandardMaterial color={color} roughness={0.8} />
                </mesh>
            )}
            {style === "long" && (
                <group>
                    <mesh position={[0, 0.04, -0.01]} scale={[1.03, 0.95, 1.05]}>
                        <sphereGeometry args={[0.19, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                        <meshStandardMaterial color={color} roughness={0.8} />
                    </mesh>
                    <mesh position={[0, -0.15, -0.08]} scale={[1, 1.5, 0.6]}>
                        <boxGeometry args={[0.38, 0.35, 0.2]} />
                        <meshStandardMaterial color={color} roughness={0.8} />
                    </mesh>
                </group>
            )}
        </group>
    );
}

// 3. الذراع المفصل (عضد + ساعد + كف)
function StylizedArm({ isLeft, scaleXZ, scaleY, shirtColor, skinColor }) {
    const side = isLeft ? -1 : 1;
    return (
        <group position={[side * (0.22 * scaleXZ), 1.25 * scaleY, 0]}>
            {/* الكتف */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.065 * scaleXZ, 16, 16]} />
                <meshStandardMaterial color={shirtColor} roughness={0.5} />
            </mesh>
            {/* العضد (Upper Arm) */}
            <mesh position={[side * 0.02, -0.14 * scaleY, 0]} rotation={[0, 0, side * -0.15]}>
                <cylinderGeometry args={[0.055 * scaleXZ, 0.045 * scaleXZ, 0.22 * scaleY, 16]} />
                <meshStandardMaterial color={shirtColor} roughness={0.5} />
            </mesh>
            {/* الساعد (Forearm) */}
            <mesh position={[side * 0.04, -0.32 * scaleY, 0.02]} rotation={[0.2, 0, side * -0.1]}>
                <cylinderGeometry args={[0.042 * scaleXZ, 0.035 * scaleXZ, 0.2 * scaleY, 16]} />
                <meshStandardMaterial color={skinColor} roughness={0.6} />
            </mesh>
            {/* كف اليد */}
            <mesh position={[side * 0.05, -0.44 * scaleY, 0.03]} scale={[0.8, 1, 0.4]}>
                <sphereGeometry args={[0.04 * scaleXZ, 16, 16]} />
                <meshStandardMaterial color={skinColor} roughness={0.6} />
            </mesh>
        </group>
    );
}

// 4. الرجل المفصلة (فخذ + ساق + حذاء)
function StylizedLeg({ isLeft, scaleXZ, scaleY, pantsColor }) {
    const side = isLeft ? -1 : 1;
    return (
        <group position={[side * (0.11 * scaleXZ), 0.72 * scaleY, 0]}>
            {/* الفخذ (Thigh) */}
            <mesh position={[0, -0.16 * scaleY, 0]}>
                <cylinderGeometry args={[0.075 * scaleXZ, 0.06 * scaleXZ, 0.3 * scaleY, 16]} />
                <meshStandardMaterial color={pantsColor} roughness={0.6} />
            </mesh>
            {/* الساق (Calf) */}
            <mesh position={[0, -0.42 * scaleY, 0]}>
                <cylinderGeometry args={[0.058 * scaleXZ, 0.048 * scaleXZ, 0.28 * scaleY, 16]} />
                <meshStandardMaterial color={pantsColor} roughness={0.6} />
            </mesh>
            {/* الحذاء (Shoe) */}
            <mesh position={[0, -0.58 * scaleY, 0.04]} scale={[0.9, 0.6, 1.4]}>
                <boxGeometry args={[0.09 * scaleXZ, 0.1 * scaleY, 0.12 * scaleXZ]} />
                <meshStandardMaterial color="#1e1e1e" roughness={0.3} />
            </mesh>
        </group>
    );
}

export default function AvatarBody({ customization, isMovingRef, autoRotate = false }) {
    const c = { ...DEFAULT_CUSTOMIZATION, ...customization };
    const isFemale = c.bodyType === "female";

    const scaleY = c.height ?? 1;
    const scaleXZ = (c.weight ?? 1) * (isFemale ? 0.9 : 1.05);

    const meshGroupRef = useRef();
    const leftArmRef = useRef();
    const rightArmRef = useRef();
    const leftLegRef = useRef();
    const rightLegRef = useRef();

    useFrame((state) => {
        if (!meshGroupRef.current) return;
        if (autoRotate) {
            meshGroupRef.current.rotation.y = state.clock.getElapsedTime() * 0.6;
        }
        const isMoving = isMovingRef?.current || false;
        if (isMoving) {
            const t = state.clock.getElapsedTime() * 10;
            const swing = Math.sin(t) * 0.5;
            if (leftArmRef.current) leftArmRef.current.rotation.x = swing;
            if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
            if (leftLegRef.current) leftLegRef.current.rotation.x = -swing;
            if (rightLegRef.current) rightLegRef.current.rotation.x = swing;
        } else {
            if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
            if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
            if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
            if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        }
    });

    const headY = 1.5 * scaleY;

    return (
        <group ref={meshGroupRef}>
            {/* الرأس (شكل بيضاوي متناسق) */}
            <mesh position={[0, headY, 0]} scale={[0.85 * scaleXZ, 0.98 * scaleY, 0.9 * scaleXZ]}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color={c.skinColor} roughness={0.5} />
            </mesh>

            {/* الرقبة */}
            <mesh position={[0, 1.32 * scaleY, 0]}>
                <cylinderGeometry args={[0.055 * scaleXZ, 0.065 * scaleXZ, 0.1 * scaleY, 16]} />
                <meshStandardMaterial color={c.skinColor} roughness={0.5} />
            </mesh>

            {/* الملامح والشعر */}
            <FaceFeatures headY={headY} skinColor={c.skinColor} eyeColor={c.eyeColor} lipColor={c.lipColor} eyeStyle={c.eyeStyle} noseStyle={c.noseStyle} lipStyle={c.lipStyle} />
            <Hair style={c.hairStyle} color={c.hairColor} headY={headY} />

            {/* الصدر والجذع العلوي */}
            <mesh position={[0, 1.12 * scaleY, 0]} scale={[scaleXZ, scaleY, scaleXZ]}>
                <cylinderGeometry args={[isFemale ? 0.18 : 0.23, 0.17, 0.3, 16]} />
                <meshStandardMaterial color={c.shirtColor} roughness={0.4} />
            </mesh>

            {/* الخصر والجذع السفلي */}
            <mesh position={[0, 0.88 * scaleY, 0]} scale={[scaleXZ, scaleY, scaleXZ]}>
                <cylinderGeometry args={[0.17, isFemale ? 0.19 : 0.17, 0.22, 16]} />
                <meshStandardMaterial color={c.shirtColor} roughness={0.4} />
            </mesh>

            {/* الذراعان */}
            <group ref={leftArmRef}>
                <StylizedArm isLeft={true} scaleXZ={scaleXZ} scaleY={scaleY} shirtColor={c.shirtColor} skinColor={c.skinColor} />
            </group>
            <group ref={rightArmRef}>
                <StylizedArm isLeft={false} scaleXZ={scaleXZ} scaleY={scaleY} shirtColor={c.shirtColor} skinColor={c.skinColor} />
            </group>

            {/* الأرجُل */}
            <group ref={leftLegRef}>
                <StylizedLeg isLeft={true} scaleXZ={scaleXZ} scaleY={scaleY} pantsColor={c.pantsColor} />
            </group>
            <group ref={rightLegRef}>
                <StylizedLeg isLeft={false} scaleXZ={scaleXZ} scaleY={scaleY} pantsColor={c.pantsColor} />
            </group>
        </group>
    );
}