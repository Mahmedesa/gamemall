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
import StoreInterior from "../Componant/Mall/StoreInterior";
import AvatarCustomizer from "../Componant/Mall/AvatarCustomizer";
import { DEFAULT_CUSTOMIZATION } from "../Componant/Mall/AvatarBody";
import { useAuth } from "../context/AuthContext";
import { createStoreLayout } from "../Componant/Mall/StoreLayout";
import VendorStoreEditor from "../Componant/Mall/VendorStoreEditor";

const AVATAR_STORAGE_KEY = "mall_avatar_customization";

const API_BASE_URL = "http://localhost/gmaemalling/server/public";

const ESCALATOR_LEFT_GROUND = [-33.5, 0, 0];
const ESCALATOR_LEFT_SECOND = [-20.5, 5.5, 0];

const ESCALATOR_RIGHT_GROUND = [33.5, 0, 0];
const ESCALATOR_RIGHT_SECOND = [20.5, 5.5, 0];

/* قائمة موحّدة بكل السلالم؛ أي سلم جديد يتضاف هنا بس */
const ESCALATORS = [
    { id: "left", groundPos: ESCALATOR_LEFT_GROUND, secondPos: ESCALATOR_LEFT_SECOND },
    { id: "right", groundPos: ESCALATOR_RIGHT_GROUND, secondPos: ESCALATOR_RIGHT_SECOND },
];

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
   MOBILE DETECTION HOOK
========================================================= */

function isMobileDevice() {
    if (typeof window === "undefined") return false;

    const smallScreen = window.innerWidth <= 820;
    const touchCapable =
        "ontouchstart" in window ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

    return smallScreen && touchCapable;
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => isMobileDevice());

    useEffect(() => {
        const handleResize = () => setIsMobile(isMobileDevice());

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
        };
    }, []);

    return isMobile;
}

/* =========================================================
   CAMERA FOLLOWER
========================================================= */

function CameraFollower({ avatarMeshRef, controlsRef }) {
    const prevAvatarPos = useRef(null);
    const { scene, camera } = useThree();
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const frameCount = useRef(0);

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

            // فحص الحجب (occlusion) مكلّف جدًا (raycast على كل المشهد recursive)
            // مش محتاجينه كل فريم؛ كل 4 فريمات (~15 مرة/ثانية) كفاية بصريًا
            // وبيقلل التكلفة لحوالي ربع القيمة الأصلية
            frameCount.current += 1;

            if (frameCount.current % 4 === 0) {
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
function isInsideInteriorObstacle(point, store) {
    if (!store) return false;

    const local = worldToStoreLocal(point, store);

    const avatarRadius = 0.65;

    const layout = createStoreLayout(store);

    // ==========================================
    // SHELVES
    // ==========================================

    for (const shelf of layout.shelves) {
        const dx = local.x - shelf.position[0];
        const dz = local.z - shelf.position[2];

        const cos = Math.cos(-shelf.rotation);
        const sin = Math.sin(-shelf.rotation);

        const obstacleX =
            dx * cos - dz * sin;

        const obstacleZ =
            dx * sin + dz * cos;

        const halfWidth =
            0.7 / 2 + avatarRadius;

        const halfDepth =
            shelf.width / 2 + avatarRadius;

        if (
            Math.abs(obstacleX) <= halfWidth &&
            Math.abs(obstacleZ) <= halfDepth
        ) {
            return true;
        }
    }

    // ==========================================
    // COUNTER
    // ==========================================

    const counter = layout.counter;

    const counterDX =
        local.x - counter.position[0];

    const counterDZ =
        local.z - counter.position[2];

    const counterHalfWidth =
        counter.width / 2 + avatarRadius;

    const counterHalfDepth =
        counter.depth / 2 + avatarRadius;

    if (
        Math.abs(counterDX) <= counterHalfWidth &&
        Math.abs(counterDZ) <= counterHalfDepth
    ) {
        return true;
    }

    return false;
}

function storeLocalToWorld(localPoint, store) {
    const cos = Math.cos(store.rotation || 0);
    const sin = Math.sin(store.rotation || 0);

    return [
        store.position[0] + localPoint.x * cos - localPoint.z * sin,
        store.position[1] + localPoint.y,
        store.position[2] + localPoint.x * sin + localPoint.z * cos,
    ];
}

/* =========================================================
   STORE INTERIOR COLLISION
========================================================= */

function createStoreInteriorCollisionChecker(store, onExit) {
    return (nextPosition) => {
        if (!store) return true;

        const local = worldToStoreLocal(nextPosition, store);

        const avatarRadius = 0.65;

        const halfWidth = store.width / 2;
        const halfDepth = store.depth / 2;

        const innerMinX = -halfWidth + avatarRadius;
        const innerMaxX = halfWidth - avatarRadius;

        const innerMinZ = -halfDepth + avatarRadius;
        const innerMaxZ = halfDepth - avatarRadius;

        const entranceWidth = Math.min(
            store.width * 0.32,
            2.4
        );

        const doorHalfWidth = entranceWidth / 2 + 0.45;

        const insideWidth =
            local.x >= innerMinX &&
            local.x <= innerMaxX;

        const insideDepth =
            local.z >= innerMinZ &&
            local.z <= innerMaxZ;

        /*
         * الحركة الطبيعية داخل المحل
         */
        if (insideWidth && insideDepth) {
            return true;
        }

        /*
         * السماح بالخروج فقط من منطقة الباب
         */
        const inDoorWidth =
            Math.abs(local.x) <= doorHalfWidth;

        const atFrontDoor =
            local.z > innerMaxZ &&
            local.z <= halfDepth + 1.4;

        if (inDoorWidth && atFrontDoor) {
            return true;
        }

        /*
         * لو خرج من الباب لمسافة كافية
         * نرجعه للمول
         */
        if (
            inDoorWidth &&
            local.z > halfDepth + 0.8
        ) {
            if (onExit) {
                onExit();
            }

            return true;
        }

        /*
         * ممنوع الخروج من الحوائط
         */
        return false;
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

function isValidInsideStorePosition(point, store) {
    if (!store) return true;

    const local = worldToStoreLocal(point, store);

    const avatarRadius = 0.65;

    const halfWidth = store.width / 2 - avatarRadius;
    const halfDepth = store.depth / 2 - avatarRadius;

    const entranceWidth = Math.min(
        store.width * 0.32,
        2.4
    );

    const doorHalfWidth = entranceWidth / 2 + 0.35;

    // حدود المحل
    const insideX =
        Math.abs(local.x) <= halfWidth;

    const insideZ =
        Math.abs(local.z) <= halfDepth;

    if (insideX && insideZ) {
        return true;
    }

    // السماح بالخروج والدخول من منطقة الباب فقط
    const nearEntrance =
        local.z > store.depth / 2 - 1.5;

    const insideDoor =
        Math.abs(local.x) <= doorHalfWidth;

    if (nearEntrance && insideDoor) {
        return true;
    }

    return false;
}

function isInsideActiveStore(point, store) {
    if (!store) return true;

    const local = worldToStoreLocal(point, store);

    const avatarRadius = 0.55;

    const halfWidth = store.width / 2 - avatarRadius;
    const halfDepth = store.depth / 2 - avatarRadius;

    // حدود المحل من الداخل
    if (
        Math.abs(local.x) > halfWidth ||
        Math.abs(local.z) > halfDepth
    ) {
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

        const nearAnyEscalator = ESCALATORS.some(
            (esc) =>
                Math.hypot(x - esc.secondPos[0], z - esc.secondPos[2]) < 4.0
        );

        if (nearAnyEscalator) {
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


function getStoreEntrancePosition(store, inside = true) {
    const entranceOffset = store.depth / 2 + (inside ? -1.5 : 1.5);

    const localPosition = new THREE.Vector3(
        0,
        store.position[1],
        entranceOffset
    );

    const rotation = new THREE.Euler(0, store.rotation, 0);

    localPosition.applyEuler(rotation);

    return [
        store.position[0] + localPosition.x,
        store.position[1],
        store.position[2] + localPosition.z,
    ];
}
/* =========================================================
   MASTER COLLISION CHECKER
========================================================= */

function createCollisionChecker(stores, activeStore, isInsideStore) {
    return (nextPosition) => {

        // ==========================================
        // داخل المحل
        // ==========================================
        if (isInsideStore && activeStore) {

    // Collision مع الرفوف والـ Counter
    if (
        isInsideInteriorObstacle(
            nextPosition,
            activeStore
        )
    ) {
        return false;
    }

    // حدود المحل والباب
    return isValidInsideStorePosition(
        nextPosition,
        activeStore
    );
}

        // ==========================================
        // المول
        // ==========================================

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
    activeStore,
    onExitStore,
    avatarCustomization,
    isInsideStore,
    avatarStartPosition,
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

            {isInsideStore && activeStore && (
    <StoreInterior
        store={activeStore}
        onExit={onExitStore}
    />
)}

            <MainEntrance />
            <Escalators />
            <VerticalCores />
            <MallDetails />

            <Avatar 
    position={avatarStartPosition}
                isTransitioning={isTransitioning}
                onPositionUpdate={onAvatarMove}
                canMove={canMove}
                joystickInput={joystickInput}
                customization={avatarCustomization}
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
   MINI MAP
========================================================= */

function MiniMap({ stores, avatarPos }) {
    const MAP_SIZE = 170;
    const WORLD_MIN_X = -60;
    const WORLD_MAX_X = 60;
    const WORLD_MIN_Z = -55;
    const WORLD_MAX_Z = 55;

    const isGroundFloor = avatarPos[1] < 3.0;

    const floorStores = stores.filter((s) => {
        const onGround = s.position[1] < 3.0;
        return onGround === isGroundFloor;
    });

    const toMapCoords = (x, z) => {
        const px =
            ((x - WORLD_MIN_X) / (WORLD_MAX_X - WORLD_MIN_X)) * MAP_SIZE;
        const py =
            ((z - WORLD_MIN_Z) / (WORLD_MAX_Z - WORLD_MIN_Z)) * MAP_SIZE;
        return { px, py };
    };

    const avatarMapPos = toMapCoords(avatarPos[0], avatarPos[2]);
    const centerMapPos = toMapCoords(0, 0);

    return (
        <div
            style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                zIndex: 260,
                background: "rgba(15,23,42,0.85)",
                border: "2px solid rgba(124,60,255,0.5)",
                borderRadius: "12px",
                padding: "10px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                pointerEvents: "none",
                userSelect: "none",
            }}
        >
            <div
                style={{
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "6px",
                    textAlign: "center",
                }}
            >
                {isGroundFloor ? "الدور الأرضي" : "الدور الثاني"}
            </div>

            <div
                style={{
                    position: "relative",
                    width: `${MAP_SIZE}px`,
                    height: `${MAP_SIZE}px`,
                    background: "#0d1117",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.15)",
                }}
            >
                {/* Atrium / Fountain */}
                <div
                    style={{
                        position: "absolute",
                        left: `${centerMapPos.px - 18}px`,
                        top: `${centerMapPos.py - 18}px`,
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(143,211,255,0.25)",
                        border: "1px solid rgba(143,211,255,0.5)",
                    }}
                />

                {/* Escalator markers (كل السلالم في الدور الحالي) */}
                {ESCALATORS.map((esc) => {
                    const escPos = isGroundFloor ? esc.groundPos : esc.secondPos;
                    const { px, py } = toMapCoords(escPos[0], escPos[2]);

                    return (
                        <div
                            key={esc.id}
                            style={{
                                position: "absolute",
                                left: `${px - 4}px`,
                                top: `${py - 4}px`,
                                width: "8px",
                                height: "8px",
                                borderRadius: "2px",
                                background: "#f59e0b",
                                boxShadow: "0 0 6px rgba(245,158,11,0.8)",
                            }}
                        />
                    );
                })}

                {/* Stores */}
                {floorStores.map((store) => {
                    const { px, py } = toMapCoords(
                        store.position[0],
                        store.position[2]
                    );
                    const color =
                        store.storeStatus === "AVAILABLE"
                            ? "#10b981"
                            : "#ef4444";

                    return (
                        <div
                            key={store.id}
                            style={{
                                position: "absolute",
                                left: `${px - 3}px`,
                                top: `${py - 3}px`,
                                width: "6px",
                                height: "6px",
                                borderRadius: "2px",
                                background: color,
                            }}
                        />
                    );
                })}

                {/* Avatar */}
                <div
                    style={{
                        position: "absolute",
                        left: `${avatarMapPos.px - 5}px`,
                        top: `${avatarMapPos.py - 5}px`,
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#7c3cff",
                        boxShadow: "0 0 8px 3px rgba(124,60,255,0.9)",
                        border: "2px solid #fff",
                    }}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "6px",
                    fontSize: "10px",
                    color: "#ccc",
                    justifyContent: "center",
                }}
            >
                <span>
                    <span
                        style={{
                            display: "inline-block",
                            width: "8px",
                            height: "8px",
                            borderRadius: "2px",
                            background: "#10b981",
                            marginLeft: "4px",
                        }}
                    />
                    متاح
                </span>
                <span>
                    <span
                        style={{
                            display: "inline-block",
                            width: "8px",
                            height: "8px",
                            borderRadius: "2px",
                            background: "#ef4444",
                            marginLeft: "4px",
                        }}
                    />
                    محجوز
                </span>
            </div>
        </div>
    );
}



/* =========================================================
   MAIN MALL
========================================================= */

export default function Mall() {
    
    const { token, user } = useAuth();

    // التحقق هل المستخدم vendor ولديه محل مرتبط أم لا
const isVendor = user?.role === "vendor" || user?.is_vendor; 
const vendorStoreId = user?.store_id; // أو المعرف الخاص بمحله

    const [groundStores, setGroundStores] = useState([]);
    const [secondStores, setSecondStores] = useState([]);
    const [nearbyStore, setNearbyStore] = useState(null);
    const [nearEscalator, setNearEscalator] = useState(null);
    const [activeStore, setActiveStore] = useState(null);

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [targetPos, setTargetPos] = useState(null);

    const [joystickInput, setJoystickInput] = useState({
        x: 0,
        z: 0,
    });
    const [avatarStartPosition, setAvatarStartPosition] = useState([
    0,
    0,
    22,
]);

    const [avatarPos, setAvatarPos] = useState([0, 0, 22]);

    const [avatarCustomization, setAvatarCustomization] =
        useState(null);

    // مهم جدًا
    const [isInsideStore, setIsInsideStore] = useState(false);

    const [showCustomizer, setShowCustomizer] = useState(false);

    const isMobile = useIsMobile();

    const avatarMeshRef = useRef(null);
    const controlsRef = useRef(null);
    const storesRef = useRef([]);

    // باقي الكود...
    storesRef.current = [...groundStores, ...secondStores];


const canMove = useMemo(() => {
    return createCollisionChecker(
        storesRef.current,
        activeStore,
        isInsideStore
    );
}, [
    groundStores,
    secondStores,
    activeStore,
    isInsideStore,
]);
    /* تحميل شكل الأفاتار المحفوظ (لو موجود)، وإلا عرض شاشة الاختيار */
    useEffect(() => {
        try {
            const saved = localStorage.getItem(AVATAR_STORAGE_KEY);

            if (saved) {
                setAvatarCustomization(JSON.parse(saved));
            } else {
                setAvatarCustomization(DEFAULT_CUSTOMIZATION);
                setShowCustomizer(true);
            }
        } catch (err) {
            console.error("Avatar customization load error:", err);
            setAvatarCustomization(DEFAULT_CUSTOMIZATION);
        }
    }, []);

    const handleCustomizationConfirm = (data) => {
        setAvatarCustomization(data);
        setShowCustomizer(false);

        try {
            localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
            console.error("Avatar customization save error:", err);
        }
    };

    /* Fetch Stores */
    useEffect(() => {        const fetchAllStores = async () => {
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

    /* Minimap position sync (throttled, not per-frame, to avoid perf hit) */
    useEffect(() => {
        const interval = setInterval(() => {
            if (avatarMeshRef.current) {
                const p = avatarMeshRef.current.position;
                setAvatarPos([p.x, p.y, p.z]);
            }
        }, 150);

        return () => clearInterval(interval);
    }, []);

    /* Avatar Movement & Interaction */
    const handleAvatarMove = (avatarPos, meshRef) => {
        avatarMeshRef.current = meshRef;

        if (isTransitioning) return;

        const [ax, ay, az] = avatarPos;

        const PROXIMITY_THRESHOLD = 2.5;

        let matchedEscalator = null;

        for (const esc of ESCALATORS) {
            const distGroundEsc = Math.hypot(
                esc.groundPos[0] - ax,
                esc.groundPos[1] - ay,
                esc.groundPos[2] - az
            );

            const distSecondEsc = Math.hypot(
                esc.secondPos[0] - ax,
                esc.secondPos[1] - ay,
                esc.secondPos[2] - az
            );

            if (distGroundEsc <= PROXIMITY_THRESHOLD && ay < 2.0) {
                matchedEscalator = { direction: "UP", target: esc.secondPos };
                break;
            }

            if (distSecondEsc <= PROXIMITY_THRESHOLD && ay >= 4.0) {
                matchedEscalator = { direction: "DOWN", target: esc.groundPos };
                break;
            }
        }

        if (matchedEscalator) {
            setNearEscalator(matchedEscalator);
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
const checkStoreAccess = async (store) => {
    if (!token) {
        setActiveStore({
            ...store,
            accessError: "يجب تسجيل الدخول أولاً",
            canEnter: false,
        });
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/mall/store/access?store_id=${store.storeId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            setActiveStore({
                ...store,
                canEnter: false,
                accessError:
                    result.message || "حدث خطأ أثناء التحقق من صلاحية الدخول",
            });
            return;
        }

        const access = result.data;

        setActiveStore({
            ...store,
            ...access,
            canEnter: access.can_enter,
            canOpenRental: access.can_open_rental,
            accessType: access.access_type,
            accessMessage: access.message,
            accessError: null,
        });
    } catch (error) {
        console.error("Store access check failed:", error);

        setActiveStore({
            ...store,
            canEnter: false,
            accessError: "تعذر الاتصال بالسيرفر",
        });
    }
};

    const enterStore = (store) => {
    if (!store) return;

    const entrancePosition = getStoreEntrancePosition(store, true);

    if (avatarMeshRef.current) {
        avatarMeshRef.current.position.set(
            entrancePosition[0],
            entrancePosition[1],
            entrancePosition[2]
        );
    }

    setAvatarPos(entrancePosition);

    setActiveStore(store);
    setIsInsideStore(true);

    setNearbyStore(null);
    setNearEscalator(null);
};

const exitStore = () => {
    if (!activeStore) return;

    const exitPosition = getStoreEntrancePosition(
        activeStore,
        false
    );

    if (avatarMeshRef.current) {
        avatarMeshRef.current.position.set(
            exitPosition[0],
            exitPosition[1],
            exitPosition[2]
        );
    }

    setAvatarPos(exitPosition);

    setIsInsideStore(false);
    setActiveStore(null);
    setNearbyStore(null);
    setNearEscalator(null);
};

    const triggerAction = () => {
        if (isTransitioning) return;

        if (nearEscalator) {
            setIsTransitioning(true);
            setTargetPos(nearEscalator.target);
        } else if (nearbyStore) {
    checkStoreAccess(nearbyStore);
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
            {isMobile && <VirtualJoystick onMove={setJoystickInput} />}

            <MiniMap stores={storesRef.current} avatarPos={avatarPos} />

            {/* زرار تخصيص شكل الأفاتار */}
            {!showCustomizer && (
                <button
                    onClick={() => setShowCustomizer(true)}
                    style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        zIndex: 260,
                        background: "rgba(15,23,42,0.85)",
                        border: "2px solid rgba(124,60,255,0.5)",
                        borderRadius: "10px",
                        color: "#fff",
                        padding: "8px 14px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                    }}
                >
                    🧑 تخصيص الشكل
                </button>
            )}

            {showCustomizer && (
                <AvatarCustomizer
                    initialCustomization={avatarCustomization || DEFAULT_CUSTOMIZATION}
                    onConfirm={handleCustomizationConfirm}
                    onCancel={
                        avatarCustomization
                            ? () => setShowCustomizer(false)
                            : undefined
                    }
                />
            )}

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
                    {nearEscalator.direction === "UP"
                        ? "للصعود للدور الثاني ⬆️"
                        : "للنزول للدور الأرضي ⬇️"}
                </div>
            )}

            {nearbyStore && !nearEscalator && !activeStore && (
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

            {activeStore && !isInsideStore && (
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
                        {activeStore.shopLogo && (
                            <img
                                src={`${API_BASE_URL}/uploads/${activeStore.shopLogo}`}
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
                            {activeStore.storeName || activeStore.id}
                        </h2>

                        <p style={{ color: "#7c3cff", fontWeight: "bold" }}>
                            {activeStore.shopSpecializes ||
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
                                رمز المحل: <b>{activeStore.storeCode}</b>
                            </p>

                            <p style={{ margin: "4px 0", color: "#ccc" }}>
                                الحالة:{" "}
                                <b
                                    style={{
                                        color:
                                            activeStore.storeStatus ===
                                            "AVAILABLE"
                                                ? "#10b981"
                                                : "#ef4444",
                                    }}
                                >
                                    {activeStore.storeStatus ===
                                    "AVAILABLE"
                                        ? "متاح للحجز"
                                        : "محجوز"}
                                </b>
                            </p>
                        </div>

                        {activeStore.canEnter && (
    <p
        style={{
            color: "#10b981",
            fontWeight: "bold",
            marginTop: "12px",
        }}
    >
        ✓ يمكنك الدخول إلى هذا المحل
    </p>
)}

{activeStore.accessError && (
    <p
        style={{
            color: "#ef4444",
            fontWeight: "bold",
            marginTop: "12px",
        }}
    >
        {activeStore.accessError}
    </p>
)}

                        <div
    style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        marginTop: "20px",
    }}
>
   {activeStore.canEnter && (
    <button
        onClick={() => enterStore(activeStore)}
        style={{
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            background: "#10b981",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
        }}
    >
        دخول المحل
    </button>
)}

    {activeStore.canOpenRental && (
        <button
            onClick={() => {
                alert("جاري الانتقال لحجز المحل...");
            }}
            style={{
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                background: "#7c3cff",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
            }}
        >
            حجز المحل
        </button>
    )}

    <button
        onClick={() => setActiveStore(null)}
        style={{
            padding: "12px 24px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
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
                    activeStore={activeStore}
                    onExitStore={exitStore}
                        
                   
                    avatarCustomization={avatarCustomization}
                    isInsideStore={isInsideStore}
                    avatarStartPosition={avatarStartPosition}   
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