import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

import avatarModelPath from "../../assets/Avatar.glb?url";

/*
|--------------------------------------------------------------------------
| Avatar Customizer (Shape Keys)
|--------------------------------------------------------------------------
| 4 سلايدرز بتتحكم في 4 Shape Keys جوه موديل Blender الحقيقي.
| الأسامي الأصلية غير مفهومة (macros من MakeHuman)، فبنعرضها "الشكل 1-4"
| واليوزر بيكتشف تأثير كل واحد من المعاينة الحية.
|--------------------------------------------------------------------------
*/

const DEFAULT_VALUES = [0.5, 0.5, 0, 0];

const STORAGE_KEY = "mall_avatar_shape_keys";

function PreviewModel({ values }) {
    const group = useRef();
    const morphMeshRef = useRef(null);
    const { scene } = useGLTF(avatarModelPath);

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh && child.morphTargetInfluences) {
                morphMeshRef.current = child;
            }
        });
    }, [scene]);

    useEffect(() => {
        const mesh = morphMeshRef.current;
        if (!mesh || !mesh.morphTargetInfluences) return;

        values.forEach((value, i) => {
            if (mesh.morphTargetInfluences[i] !== undefined) {
                mesh.morphTargetInfluences[i] = value;
            }
        });
    }, [values]);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = state.clock.getElapsedTime() * 0.5;
        }
    });

    return (
        <group ref={group}>
            <primitive object={scene} position={[0, 0.2, 0]} />
        </group>
    );
}

export default function AvatarCustomizer({ onConfirm, onCancel }) {
    const [values, setValues] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch {
            // تجاهل أي خطأ قراءة
        }
        return [...DEFAULT_VALUES];
    });

    const updateValue = (index, newValue) => {
        setValues((prev) => {
            const next = [...prev];
            next[index] = newValue;
            return next;
        });
    };

    const handleConfirm = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
        } catch {
            // تجاهل أي خطأ حفظ
        }
        onConfirm(values);
    };

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 500,
                background: "rgba(10,12,18,0.97)",
                display: "flex",
                flexDirection: "column",
                color: "#fff",
            }}
        >
            <div style={{ textAlign: "center", padding: "16px 10px 6px" }}>
                <h2 style={{ margin: 0, fontSize: "22px" }}>
                    اختاري شكل شخصيتك
                </h2>
                <p
                    style={{
                        margin: "4px 0 0",
                        color: "#9ca3af",
                        fontSize: "13px",
                    }}
                >
                    حرّكي السلايدرز وشوفي الفرق في المعاينة
                </p>
            </div>

            <div style={{ height: "320px", flexShrink: 0 }}>
                <Canvas camera={{ position: [0, 1.2, 2.8], fov: 35 }}>
                    <ambientLight intensity={0.9} />
                    <directionalLight position={[3, 5, 3]} intensity={1.2} />
                    <directionalLight position={[-3, 2, -2]} intensity={0.4} />

                    <PreviewModel values={values} />

                    <OrbitControls
                        enablePan={false}
                        minDistance={1}
                        maxDistance={5}
                        target={[0, 1, 0]}
                    />
                </Canvas>
            </div>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                {values.map((value, i) => (
                    <div key={i}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "6px",
                                fontSize: "14px",
                                fontWeight: "bold",
                                color: "#e5e7eb",
                            }}
                        >
                            <span>الشكل {i + 1}</span>
                            <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                                {value.toFixed(2)}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={value}
                            onChange={(e) =>
                                updateValue(i, Number(e.target.value))
                            }
                            style={{ width: "100%", accentColor: "#7c3cff" }}
                        />
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    padding: "16px 20px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
            >
                {onCancel && (
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: "14px",
                            borderRadius: "10px",
                            border: "1px solid rgba(255,255,255,0.25)",
                            background: "transparent",
                            color: "#fff",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        إلغاء
                    </button>
                )}

                <button
                    onClick={handleConfirm}
                    style={{
                        flex: 2,
                        padding: "14px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#7c3cff",
                        color: "#fff",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 0 15px rgba(124,60,255,0.5)",
                    }}
                >
                    تأكيد ودخول المول
                </button>
            </div>
        </div>
    );
}