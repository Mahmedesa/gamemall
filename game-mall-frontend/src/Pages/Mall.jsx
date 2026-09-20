import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState, useRef, useMemo } from "react";
import * as THREE from "three";

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

const ESCALATOR_LEFT_GROUND = [-33.5, 0, 0];
const ESCALATOR_LEFT_SECOND = [-20.5, 5.5, 0];

function mapApiStore(store) {
    const code = store.store_code || store.shop_name;

    return {
        id: code,

        position: [
            Number(store.position_x) || 0,
            Number(store.position_y) || 0,
            Number(store.position_z) || 0,
        ],

        rotation: Number(store.rotation) || 0,

        width: Number(store.width) || 6,
        depth: Number(store.depth) || 10,
        height: Number(store.height) || 5.5,

        storeId: store.store_id,
        storeCode: store.store_code,
        storeName: store.shop_name,
        storeStatus: store.store_status,
        vendorId: store.Vendors_com_id,
        shopLogo: store.shop_logo,
        shopSpecializes: store.shop_specializes,
    };
}

/* =========================================================
   CAMERA FOLLOWER
========================================================= */

function CameraFollower({ avatarMeshRef, controlsRef }) {
    const prevAvatarPos = useRef(null);
    const { scene, camera } = useThree();
    const raycaster = useMemo(() => new THREE.Raycaster(), []);

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

            const targetVec = controlsRef.current.target.clone();
            const camVec = camera.position.clone();

            const dir = camVec.clone().sub(targetVec).normalize();
            const maxDist = camVec.distanceTo(targetVec);

            raycaster.set(targetVec, dir);

            const intersects = raycaster.intersectObjects(
                scene.children,
                true
            );

            const validIntersects = intersects.filter(
                (hit) =>
                    hit.distance < maxDist &&
                    hit.object !== avatarMeshRef.current
            );

            if (validIntersects.length > 0) {
                const safeDist = Math.max(
                    validIntersects[0].distance - 0.5,
                    2.0
                );

                const newCamPos = targetVec
                    .clone()
                    .add(dir.multiplyScalar(safeDist));

                camera.position.lerp(newCamPos, 0.2);
            }

            controlsRef.current.update();
        } else {
            controlsRef.current.target.set(
                currentPos.x,
                currentPos.y + 1.2,
                currentPos.z
            );

            controlsRef.current.update();
        }

        prevAvatarPos.current = currentPos.clone();
    });

    return null;
}

/* =========================================================
   ESCALATOR CONTROLLER
========================================================= */

function EscalatorController({
    isTransitioning,
    targetPos,
    avatarMeshRef,
    onComplete,
}) {
    useFrame((_, delta) => {
        if (
            !isTransitioning ||
            !avatarMeshRef.current ||
            !targetPos
        ) {
            return;
        }

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
            currentPos.set(
                targetPos[0],
                targetPos[1],
                targetPos[2]
            );

            onComplete();
        }
    });

    return null;
}

/* =========================================================
   STORE COLLISION
========================================================= */

function worldToStoreLocal(point, store) {
    const dx = point[0] - store.position[0];
    const dz = point[2] - store.position[2];

    const cos = Math.cos(-store.rotation);
    const sin = Math.sin(-store.rotation);

    return {
        x: dx * cos - dz * sin,
        z: dx * sin + dz * cos,
    };
}

function isInsideStoreCollision(point, store) {
    const isAvatarOnGround = point[1] < 3.0;
    const isStoreOnGround = store.position[1] < 3.0;

    if (isAvatarOnGround !== isStoreOnGround) {
        return false;
    }

    const local = worldToStoreLocal(point, store);
    const avatarRadius = 0.65;

    const halfWidth = store.width / 2 + avatarRadius;
    const halfDepth = store.depth / 2 + avatarRadius;

    if (
        Math.abs(local.x) > halfWidth ||
        Math.abs(local.z) > halfDepth
    ) {
        return false;
    }

    const entranceWidth = Math.min(
        store.width * 0.32,
        2.4
    );

    const doorHalfWidth = entranceWidth / 2 + 0.45;
    const nearFront = local.z > store.depth / 2 - 1.1;
    const insideDoor = Math.abs(local.x) <= doorHalfWidth;

    if (nearFront && insideDoor) {
        return false;
    }

    return true;
}

/* =========================================================
   FOUNTAIN COLLISION (تغطية حوض النافورة بالكامل بالأرضي)
========================================================= */

function isInsideFountain(point) {
    const [x, y, z] = point;
    if (y < 3.0) {
        const distFromCenter = Math.hypot(x, z);
        if (distFromCenter < 10.5) {
            return true;
        }
    }
    return false;
}

/* =========================================================
   SECOND FLOOR GLASS / BOUNDARIES (منع التجاوز خارج الدور الثاني)
========================================================= */

function isOutsideSecondFloorBounds(point) {
    const [x, y, z] = point;

    if (y >= 3.0) {
        const avatarRadius = 0.8;

        const MIN_X = -55 + avatarRadius;
        const MAX_X = 55 - avatarRadius;
        const MIN_Z = -50 + avatarRadius;
        const MAX_Z = 50 - avatarRadius;

        if (x < MIN_X || x > MAX_X || z < MIN_Z || z > MAX_Z) {
            return true;
        }
    }
    return false;
}

/* =========================================================
   SECOND FLOOR ATRIUM RAILING (منع السقوط من فتحة المطل)
========================================================= */

function isInsideAtriumRailing(point) {
    const [x, y, z] = point;

    if (y >= 3.0) {
        const distance = Math.hypot(x, z);
        const ATRIUM_RAILING_RADIUS = 21.0;

        const nearEscalator = Math.hypot(
            x - ESCALATOR_LEFT_SECOND[0],
            z - ESCALATOR_LEFT_SECOND[2]
        ) < 4.0;

        if (nearEscalator) {
            return false;
        }

        if (distance < ATRIUM_RAILING_RADIUS) {
            return true;
        }
    }
    return false;
}

/* =========================================================
   MALL OUTSIDE BOUNDS
========================================================= */

function isOutsideMall(point) {
    const [x, , z] = point;
    return x < -58 || x > 58 || z < -53 || z > 53;
}

/* =========================================================
   MASTER COLLISION CHECKER
========================================================= */

function createCollisionChecker(stores) {
    return (nextPosition) => {
        if (isOutsideMall(nextPosition)) {
            return false;
        }

        if (isInsideFountain(nextPosition)) {
            return false;
        }

        if (isOutsideSecondFloorBounds(nextPosition)) {
            return false;
        }

        if (isInsideAtriumRailing(nextPosition)) {
            return false;
        }

        for (const store of stores) {
            if (isInsideStoreCollision(nextPosition, store)) {
                return false;
            }
        }

        return true;
    };
}

/* =========================================================
   MALL SCENE
========================================================= */

function MallScene({
    groundStores,
    secondStores,
    onAvatarMove,
    isTransitioning,
    targetPos,
    avatarMeshRef,
    onEscalatorComplete,
    controlsRef,
    canMove,
    joystickInput,
}) {
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

            <Avatar
                position={[0, 0, 22]}
                isTransitioning={isTransitioning}
                onPositionUpdate={onAvatarMove}
                canMove={canMove}
                joystickInput={joystickInput}
            />

            <CameraFollower
                avatarMeshRef={avatarMeshRef}
                controlsRef={controlsRef}
            />

            <EscalatorController
                isTransitioning={isTransitioning}
                targetPos={targetPos}
                avatarMeshRef={avatarMeshRef}
                onComplete={onEscalatorComplete}
            />

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

/* =========================================================
   VIRTUAL JOYSTICK
========================================================= */

function VirtualJoystick({ onMove }) {
    const touchRef = useRef(null);
    const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
    const [active, setActive] = useState(false);

    const handleTouchStart = (e) => {
        setActive(true);
        updateJoystick(e.touches[0]);
    };

    const handleTouchMove = (e) => {
        if (!active) return;
        updateJoystick(e.touches[0]);
    };

    const handleTouchEnd = () => {
        setActive(false);
        setStickPos({ x: 0, y: 0 });
        onMove({ x: 0, z: 0 });
    };

    const updateJoystick = (touch) => {
        if (!touchRef.current) return;

        const rect = touchRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;

        const maxDist = 40;
        const dist = Math.hypot(dx, dy);

        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }

        setStickPos({ x: dx, y: dy });
        onMove({ x: dx / maxDist, z: dy / maxDist });
    };

    return (
        <div
            ref={touchRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                position: "absolute",
                bottom: "40px",
                left: "30px",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.3)",
                zIndex: 250,
                touchAction: "none",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: `calc(50% + ${stickPos.y}px - 20px)`,
                    left: `calc(50% + ${stickPos.x}px - 20px)`,
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#7c3cff",
                    boxShadow: "0 0 10px rgba(124,60,255,0.8)",
                }}
            />
        </div>
    );
}

/* =========================================================
   MAIN MALL
========================================================= */

export default function Mall() {
    const [groundStores, setGroundStores] = useState([]);
    const [secondStores, setSecondStores] = useState([]);
    const [nearbyStore, setNearbyStore] = useState(null);
    const [nearEscalator, setNearEscalator] = useState(null);
    const [activeStoreModal, setActiveStoreModal] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [targetPos, setTargetPos] = useState(null);
    const [joystickInput, setJoystickInput] = useState({ x: 0, z: 0 });

    const avatarMeshRef = useRef(null);
    const controlsRef = useRef(null);
    const storesRef = useRef([]);

    storesRef.current = [...groundStores, ...secondStores];

    const canMove = useMemo(() => {
        return createCollisionChecker(storesRef.current);
    }, [groundStores, secondStores]);

    /* Fetch Stores */
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

    /* Avatar Movement & Interaction */
    const handleAvatarMove = (avatarPos, meshRef) => {
        avatarMeshRef.current = meshRef;

        if (isTransitioning) return;

        const [ax, ay, az] = avatarPos;

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

        const PROXIMITY_THRESHOLD = 2.5;

        if (distGroundEsc <= PROXIMITY_THRESHOLD && ay < 2.0) {
            setNearEscalator("UP");
            setNearbyStore(null);
            return;
        }

        if (distSecondEsc <= PROXIMITY_THRESHOLD && ay >= 4.0) {
            setNearEscalator("DOWN");
            setNearbyStore(null);
            return;
        }

        setNearEscalator(null);

        let closestStore = null;
        let closestDistance = Infinity;
        const isAvatarOnGround = ay < 3.0;
        const DETECTION_RANGE = 7.5;

        for (const store of storesRef.current) {
            const [sx, sy, sz] = store.position;
            const isStoreOnGround = sy < 3.0;

            if (isAvatarOnGround !== isStoreOnGround) {
                continue;
            }

            const distXZ = Math.hypot(sx - ax, sz - az);

            if (distXZ <= DETECTION_RANGE && distXZ < closestDistance) {
                closestStore = store;
                closestDistance = distXZ;
            }
        }

        setNearbyStore(closestStore);
    };

    const triggerAction = () => {
        if (isTransitioning) return;

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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === "e") {
                triggerAction();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nearEscalator, nearbyStore, isTransitioning]);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "#111",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <VirtualJoystick onMove={setJoystickInput} />

            {(nearEscalator || nearbyStore) && !isTransitioning && (
                <button
                    onClick={triggerAction}
                    style={{
                        position: "absolute",
                        bottom: "40px",
                        right: "30px",
                        zIndex: 250,
                        background: nearEscalator ? "#10b981" : "#7c3cff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "65px",
                        height: "65px",
                        fontSize: "22px",
                        fontWeight: "bold",
                        boxShadow: "0 0 15px rgba(0,0,0,0.5)",
                        cursor: "pointer",
                    }}
                >
                    E
                </button>
            )}

            {nearEscalator && !isTransitioning && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 200,
                        background: "rgba(15,23,42,0.9)",
                        color: "#fff",
                        padding: "14px 28px",
                        borderRadius: "12px",
                        border: "2px solid #10b981",
                        boxShadow: "0 0 20px rgba(16,185,129,0.6)",
                        fontSize: "18px",
                        fontWeight: "bold",
                    }}
                >
                    اضغط{" "}
                    <span style={{ color: "#10b981", fontSize: "22px" }}>
                        [ E ]
                    </span>{" "}
                    {nearEscalator === "UP"
                        ? "للصعود للدور الثاني ⬆️"
                        : "للنزول للدور الأرضي ⬇️"}
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
                        background: "rgba(15,23,42,0.9)",
                        color: "#fff",
                        padding: "14px 28px",
                        borderRadius: "12px",
                        border: "2px solid #7c3cff",
                        boxShadow: "0 0 20px rgba(124,60,255,0.6)",
                        fontSize: "18px",
                        fontWeight: "bold",
                    }}
                >
                    اضغط{" "}
                    <span style={{ color: "#7c3cff", fontSize: "22px" }}>
                        [ E ]
                    </span>{" "}
                    للدخول إلى {nearbyStore.storeName || nearbyStore.id}
                </div>
            )}

            {activeStoreModal && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 300,
                        background: "rgba(0,0,0,0.85)",
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
                            borderRadius: "20px",
                            border: "1px solid #333",
                            maxWidth: "420px",
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                        }}
                    >
                        {activeStoreModal.shopLogo && (
                            <img
                                src={`${API_BASE_URL}/uploads/${activeStoreModal.shopLogo}`}
                                alt="Store Logo"
                                style={{
                                    width: "90px",
                                    height: "90px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    marginBottom: "15px",
                                }}
                            />
                        )}

                        <h2 style={{ margin: "5px 0", fontSize: "24px" }}>
                            {activeStoreModal.storeName || activeStoreModal.id}
                        </h2>

                        <p style={{ color: "#7c3cff", fontWeight: "bold" }}>
                            {activeStoreModal.shopSpecializes ||
                                "متجر متعدّد الأغراض"}
                        </p>

                        <div
                            style={{
                                background: "#252932",
                                padding: "12px",
                                borderRadius: "10px",
                                margin: "15px 0",
                                textAlign: "right",
                            }}
                        >
                            <p style={{ margin: "4px 0", color: "#ccc" }}>
                                رمز المحل: <b>{activeStoreModal.storeCode}</b>
                            </p>

                            <p style={{ margin: "4px 0", color: "#ccc" }}>
                                الحالة:{" "}
                                <b
                                    style={{
                                        color:
                                            activeStoreModal.storeStatus ===
                                            "AVAILABLE"
                                                ? "#10b981"
                                                : "#ef4444",
                                    }}
                                >
                                    {activeStoreModal.storeStatus ===
                                    "AVAILABLE"
                                        ? "متاح للحجز"
                                        : "محجوز"}
                                </b>
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "center",
                                marginTop: "20px",
                            }}
                        >
                            {activeStoreModal.storeStatus ===
                                "AVAILABLE" && (
                                <button
                                    onClick={() =>
                                        alert(
                                            `جاري الانتقال لحجز المحل: ${activeStoreModal.storeCode}`
                                        )
                                    }
                                    style={{
                                        padding: "10px 20px",
                                        background: "#10b981",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    طلب حجز المحل
                                </button>
                            )}

                            <button
                                onClick={() => setActiveStoreModal(null)}
                                style={{
                                    padding: "10px 20px",
                                    background: "#374151",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Canvas
                camera={{
                    position: [0, 6, 14],
                    fov: 65,
                }}
                dpr={[1, 1.5]}
            >
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
                    canMove={canMove}
                    joystickInput={joystickInput}
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