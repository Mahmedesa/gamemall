import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";


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
import MallLighting from "../Componant/Mall/MallLighting";
import Avatar from "../Componant/Mall/Avatar";

const API_BASE_URL = "http://localhost/gmaemalling/server/public";

// 🛗 إحداثيات السلم الأيسر الحقيقية المطابقة لمكون Escalators.jsx
// السلم عند x = -27 وممتد بطول 13 وحدة ومستند بارتفاع 5.5 وحدة
const ESCALATOR_LEFT_GROUND = [-33.5, 0, 0];  // بداية السلم بالدور الأرضي
const ESCALATOR_LEFT_SECOND = [-20.5, 5.5, 0]; // نهاية السلم بالدور الثاني

const STORE_DIMENSIONS = {
    "U-01": { width: 6, depth: 10, height: 5.5 },
    "U-02": { width: 6, depth: 10, height: 5.5 },
    "U-03": { width: 6, depth: 10, height: 5.5 },
    "U-04": { width: 6, depth: 10, height: 5.5 },
    "U-05": { width: 6, depth: 10, height: 5.5 },
    "U-06": { width: 6, depth: 10, height: 5.5 },
    "U-07": { width: 6, depth: 10, height: 5.5 },
    "U-08": { width: 6, depth: 10, height: 5.5 },
    "U-09": { width: 8, depth: 12, height: 5.5 },
    "U-10": { width: 10, depth: 14, height: 5.5 },
    "U-11": { width: 12, depth: 16, height: 5.5 },
    "U-12": { width: 10, depth: 14, height: 5.5 },
    "U-13": { width: 8, depth: 12, height: 5.5 },
    "U-14": { width: 6, depth: 10, height: 5.5 },
    "U-15": { width: 6, depth: 10, height: 5.5 },
    "U-16": { width: 6, depth: 10, height: 5.5 },
    "U-17": { width: 6, depth: 10, height: 5.5 },
    "U-18": { width: 6, depth: 10, height: 5.5 },
    "U-19": { width: 6, depth: 10, height: 5.5 },
    "U-20": { width: 6, depth: 10, height: 5.5 },
    "U-21": { width: 6, depth: 10, height: 5.5 },
    "UF-01": { width: 7, depth: 10, height: 4.8 },
    "UF-02": { width: 8, depth: 12, height: 4.8 },
    "UF-03": { width: 7, depth: 10, height: 4.8 },
    "UF-04": { width: 8, depth: 12, height: 4.8 },
    "UF-05": { width: 7, depth: 10, height: 4.8 },
    "UF-06": { width: 7, depth: 10, height: 4.8 },
    "UF-07": { width: 8, depth: 12, height: 4.8 },
    "UF-08": { width: 7, depth: 10, height: 4.8 },
    "UF-09": { width: 8, depth: 12, height: 4.8 },
    "UF-10": { width: 7, depth: 10, height: 4.8 },
    "PF-01": { width: 12, depth: 16, height: 4.8 },
    "PF-02": { width: 14, depth: 16, height: 4.8 },
    "PF-03": { width: 12, depth: 16, height: 4.8 },
};

function mapApiStore(store) {
    const code = store.store_code || store.shop_name;
    const dimensions = STORE_DIMENSIONS[code] || { width: 6, depth: 10, height: 5.5 };

    return {
        id: code,
        position: [
            Number(store.position_x) || 0,
            Number(store.position_y) || 0,
            Number(store.position_z) || 0,
        ],
        rotation: Number(store.rotation) || 0,
        width: dimensions.width,
        depth: dimensions.depth,
        height: dimensions.height,
        storeId: store.store_id,
        storeCode: store.store_code,
        storeName: store.shop_name,
        storeStatus: store.store_status,
        vendorId: store.Vendors_com_id,
        shopLogo: store.shop_logo,
        shopSpecializes: store.shop_specializes,
    };
}

// 🎥 تتبع الأفاتار والتحكم بالماوس
function CameraFollower({ avatarMeshRef, controlsRef }) {
    const prevAvatarPos = useRef(null);

    useFrame(() => {
        if (!avatarMeshRef.current || !controlsRef.current) return;

        const currentPos = avatarMeshRef.current.position;

        if (prevAvatarPos.current) {
            const deltaX = currentPos.x - prevAvatarPos.current.x;
            const deltaY = currentPos.y - prevAvatarPos.current.y;
            const deltaZ = currentPos.z - prevAvatarPos.current.z;

            controlsRef.current.target.x += deltaX;
            controlsRef.current.target.y += deltaY;
            controlsRef.current.target.z += deltaZ;

            controlsRef.current.object.position.x += deltaX;
            controlsRef.current.object.position.y += deltaY;
            controlsRef.current.object.position.z += deltaZ;

            controlsRef.current.update();
        } else {
            controlsRef.current.target.set(currentPos.x, currentPos.y + 1.2, currentPos.z);
            controlsRef.current.update();
        }

        prevAvatarPos.current = currentPos.clone();
    });

    return null;
}

// 🛗 متحكم حركة السلم الكهربائي المصلح للأبعاد الجديدة
function EscalatorController({ isTransitioning, targetPos, avatarMeshRef, onComplete }) {
    useFrame((_, delta) => {
        if (!isTransitioning || !avatarMeshRef.current || !targetPos) return;

        const currentPos = avatarMeshRef.current.position;
        const speed = 5 * delta;

        currentPos.x += (targetPos[0] - currentPos.x) * speed;
        currentPos.y += (targetPos[1] - currentPos.y) * speed;
        currentPos.z += (targetPos[2] - currentPos.z) * speed;

        const dist = Math.hypot(
            targetPos[0] - currentPos.x,
            targetPos[1] - currentPos.y,
            targetPos[2] - currentPos.z
        );

        if (dist < 0.3) {
            currentPos.set(targetPos[0], targetPos[1], targetPos[2]);
            onComplete();
        }
    });

    return null;
}

function MallScene({ groundStores, secondStores, onAvatarMove, isTransitioning, targetPos, avatarMeshRef, onEscalatorComplete, controlsRef }) {
    return (
        <>
            <color attach="background" args={["#111722"]} />
            <MallLighting />
            <MallFloor />
            <SecondFloorShell />
            <MallFacade />
            <Atrium />
            <AtriumRailing />

            <GroundFloor stores={groundStores} />
            <SecondFloor stores={secondStores} />

            <MainEntrance />
            <Escalators />
            <VerticalCores />
            <MallDetails />

            <Avatar position={[0, 0, 22]} isTransitioning={isTransitioning} onPositionUpdate={onAvatarMove} />

            <CameraFollower avatarMeshRef={avatarMeshRef} controlsRef={controlsRef} />

            <EscalatorController
                isTransitioning={isTransitioning}
                targetPos={targetPos}
                avatarMeshRef={avatarMeshRef}
                onComplete={onEscalatorComplete}
            />

            {/* النافورة */}
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
    const [groundStores, setGroundStores] = useState([]);
    const [secondStores, setSecondStores] = useState([]);
    const [nearbyStore, setNearbyStore] = useState(null);
    const [nearEscalator, setNearEscalator] = useState(null);
    const [activeStoreModal, setActiveStoreModal] = useState(null);

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [targetPos, setTargetPos] = useState(null);
    const avatarMeshRef = useRef(null);
    const controlsRef = useRef(null);

    const storesRef = useRef([]);
    storesRef.current = [...groundStores, ...secondStores];

    useEffect(() => {
        const fetchAllStores = async () => {
            try {
                const [res1, res2] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/mall/floor?floor_id=1`),
                    fetch(`${API_BASE_URL}/api/mall/floor?floor_id=2`),
                ]);
                const result1 = await res1.json();
                const result2 = await res2.json();

                if (result1.success && result2.success) {
                    setGroundStores((result1.data?.stores || []).map(mapApiStore));
                    setSecondStores((result2.data?.stores || []).map(mapApiStore));
                }
            } catch (err) {
                console.error("API Error:", err);
            }
        };

        fetchAllStores();
    }, []);

    const handleAvatarMove = (avatarPos, meshRef) => {
        avatarMeshRef.current = meshRef;
        if (isTransitioning) return;

        const [ax, ay, az] = avatarPos;

        // حساب المسافة الدقيقة بين الأفاتار ومداخل السلم الأيسر
        const distGroundEsc = Math.hypot(
            ESCALATOR_LEFT_GROUND[0] - ax,
            ESCALATOR_LEFT_GROUND[1] - ay,
            ESCALATOR_LEFT_GROUND[2] - az
        );

        const distSecondEsc = Math.hypot(
            ESCALATOR_LEFT_SECOND[0] - ax,
            ESCALATOR_LEFT_SECOND[1] - ay,
            ESCALATOR_LEFT_SECOND[2] - az
        );

        // نطاق حساس ودقيق فقط عند بداية مدخل السلم بالدور الأرضي أو الثاني
        const PROXIMITY_THRESHOLD = 2.5;

        if (distGroundEsc <= PROXIMITY_THRESHOLD && ay < 2.0) {
            setNearEscalator("UP");
            setNearbyStore(null);
            return;
        } else if (distSecondEsc <= PROXIMITY_THRESHOLD && ay >= 4.0) {
            setNearEscalator("DOWN");
            setNearbyStore(null);
            return;
        } else {
            setNearEscalator(null);
        }

        // فحص القرب من المحلات
        const CLOSE_LIMIT = 4;
        const found = storesRef.current.find((store) => {
            const [sx, sy, sz] = store.position;
            const dist = Math.sqrt(
                Math.pow(sx - ax, 2) + Math.pow(sy - ay, 2) + Math.pow(sz - az, 2)
            );
            return dist <= CLOSE_LIMIT;
        });

        setNearbyStore(found || null);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() !== "e" || isTransitioning) return;

            if (nearEscalator === "UP") {
                setIsTransitioning(true);
                setTargetPos(ESCALATOR_LEFT_SECOND);
            } else if (nearEscalator === "DOWN") {
                setIsTransitioning(true);
                setTargetPos(ESCALATOR_LEFT_GROUND);
            } else if (nearbyStore) {
                setActiveStoreModal(nearbyStore);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nearEscalator, nearbyStore, isTransitioning]);

    return (
        <div style={{ width: "100vw", height: "100vh", background: "#111", position: "relative" }}>

            {nearEscalator && !isTransitioning && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 200,
                        background: "rgba(15, 23, 42, 0.9)",
                        color: "#fff",
                        padding: "14px 28px",
                        borderRadius: "12px",
                        border: "2px solid #10b981",
                        boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)",
                        fontSize: "18px",
                        fontWeight: "bold",
                    }}
                >
                    اضغط <span style={{ color: "#10b981", fontSize: "22px" }}>[ E ]</span> {nearEscalator === "UP" ? "للصعود للدور الثاني ⬆️" : "للنزول للدور الأرضي ⬇️"}
                </div>
            )}

            {nearbyStore && !nearEscalator && !activeStoreModal && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 200,
                        background: "rgba(15, 23, 42, 0.9)",
                        color: "#fff",
                        padding: "14px 28px",
                        borderRadius: "12px",
                        border: "2px solid #7c3cff",
                        boxShadow: "0 0 20px rgba(124, 60, 255, 0.6)",
                        fontSize: "18px",
                        fontWeight: "bold",
                    }}
                >
                    اضغط <span style={{ color: "#7c3cff", fontSize: "22px" }}>[ E ]</span> للدخول إلى {nearbyStore.storeName || nearbyStore.id}
                </div>
            )}

            {activeStoreModal && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 300,
                        background: "rgba(0,0,0,0.8)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            background: "#1a1d24",
                            color: "#fff",
                            padding: "30px",
                            borderRadius: "16px",
                            border: "1px solid #333",
                            maxWidth: "400px",
                            width: "90%",
                            textAlign: "center",
                        }}
                    >
                        <h2>{activeStoreModal.storeName || activeStoreModal.id}</h2>
                        <p style={{ color: "#aaa" }}>رمز المحل: {activeStoreModal.storeCode}</p>
                        <p>الحالة: <b style={{ color: activeStoreModal.storeStatus === "AVAILABLE" ? "#10b981" : "#3b82f6" }}>{activeStoreModal.storeStatus}</b></p>
                        <button
                            onClick={() => setActiveStoreModal(null)}
                            style={{
                                marginTop: "20px",
                                padding: "10px 20px",
                                background: "#7c3cff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold",
                            }}
                        >
                            إغلاق / الخروج
                        </button>
                    </div>
                </div>
            )}

            <Canvas camera={{ position: [0, 6, 14], fov: 65 }} dpr={[1, 1.5]}>
                <MallScene
                    groundStores={groundStores}
                    secondStores={secondStores}
                    onAvatarMove={handleAvatarMove}
                    isTransitioning={isTransitioning}
                    targetPos={targetPos}
                    avatarMeshRef={avatarMeshRef}
                    onEscalatorComplete={() => {
                        setIsTransitioning(false);
                        setNearEscalator(null);
                    }}
                    controlsRef={controlsRef}
                />
                <OrbitControls
                    ref={controlsRef}
                    enableDamping={true}
                    dampingFactor={0.08}
                    rotateSpeed={0.7}
                    zoomSpeed={1.0}
                    minPolarAngle={0.1}
                    maxPolarAngle={Math.PI / 2.05}
                    minDistance={2}
                    maxDistance={40}
                />
            </Canvas>
        </div>
    );
}