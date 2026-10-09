import { Text, Html } from "@react-three/drei";
import { createStoreLayout } from "./StoreLayout";
import ProductDisplay from "./ProductDisplay";
import Product3D from "./Product3D";

/*
|--------------------------------------------------------------------------
| Store Interior
|--------------------------------------------------------------------------
| أول نسخة من داخل المحل.
| المحل نفسه يأتي من API:
| storeName
| storeCode
| shopLogo
| shopSpecializes
| position
| rotation
| width
| depth
| height
|
| المنتجات هنربطها بالـ API في الخطوة التالية.
|--------------------------------------------------------------------------
*/


function Shelf({
    position,
    rotation = 0,
    width = 3.8,
}) {
    const levels = [0.65, 1.45, 2.25];

    return (
        <group
            position={position}
            rotation={[0, rotation, 0]}
        >
            {/* جسم الرف */}
            <mesh position={[0, 1.45, 0]}>
                <boxGeometry
                    args={[width, 2.9, 0.65]}
                />
                <meshStandardMaterial
                    color="#252936"
                    metalness={0.35}
                    roughness={0.45}
                />
            </mesh>

            {/* مستويات الرف */}
            {levels.map((y, index) => (
                <mesh
                    key={index}
                    position={[0, y, -0.38]}
                >
                    <boxGeometry
                        args={[width, 0.10, 0.75]}
                    />
                    <meshStandardMaterial
                        color="#555b6e"
                        metalness={0.2}
                        roughness={0.5}
                    />
                </mesh>
            ))}

            {/* المنتجات */}
            {/* =========================================================
    PRODUCTS
========================================================= */}

<Product3D
    type="laptop"
    position={[-width * 0.28, 0.55, -0.5]}
    scale={0.65}
/>

<Product3D
    type="printer"
    position={[0, 0.55, -0.5]}
    scale={0.55}
/>

<Product3D
    type="tv"
    position={[width * 0.28, 0.55, -0.5]}
    scale={0.65}
/>
        </group>
    );
}
function Counter({ position,
    counterWidth = 2.5, }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.65, 0]}>
                <boxGeometry args={[counterWidth, 1.3, 1.1]} />
                <meshStandardMaterial
                    color="#171923"
                    metalness={0.5}
                    roughness={0.35}
                />
            </mesh>

            <mesh position={[0, 1.35, 0]}>
                <boxGeometry
    args={[
        Math.max(counterWidth - 0.25, 1.5),
        0.12,
        0.95,
    ]}
/>
                <meshStandardMaterial color="#7c3cff" />
            </mesh>
        </group>
    );
}

function EntranceFrame({ width, height, depth }) {
    const entranceWidth = Math.min(
    Math.max(width * 0.36, 1.6),
    2.6
);

    return (
        <group>
            {/* الباب الشمال */}
            <mesh
                position={[
                    -(entranceWidth / 2 + 0.12),
                    height / 2,
                    depth / 2,
                ]}
            >
                <boxGeometry args={[0.22, height, 0.22]} />
                <meshStandardMaterial
                    color="#7c3cff"
                    emissive="#7c3cff"
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* الباب اليمين */}
            <mesh
                position={[
                    entranceWidth / 2 + 0.12,
                    height / 2,
                    depth / 2,
                ]}
            >
                <boxGeometry args={[0.22, height, 0.22]} />
                <meshStandardMaterial
                    color="#7c3cff"
                    emissive="#7c3cff"
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* أعلى الباب */}
            <mesh
                position={[0, height - 0.12, depth / 2]}
            >
                <boxGeometry args={[entranceWidth + 0.45, 0.22, 0.22]} />
                <meshStandardMaterial
                    color="#7c3cff"
                    emissive="#7c3cff"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </group>
    );
}

export default function StoreInterior({
    store,
    onExit,
}) {
    if (!store) return null;
    const layout = createStoreLayout(store);

    const width = store.width || 6;
    const depth = store.depth || 10;
    const height = store.height || 5.5;

    const shelfWidth = Math.min(
    Math.max(width * 0.38, 1.8),
    2.6
);

const counterWidth = Math.min(
    Math.max(width * 0.42, 1.8),
    2.8
);

const sideShelfX = Math.max(
    width / 2 - shelfWidth / 2 - 0.35,
    0
);

const backShelfZ = -depth / 2 + 1.8;

    return (
        <group
            position={store.position}
            rotation={[0, store.rotation || 0, 0]}
        >
            {/* =========================================================
                FLOOR
            ========================================================= */}

            <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[width, 0.1, depth]} />
                <meshStandardMaterial
                    color="#181b25"
                    roughness={0.65}
                />
            </mesh>

            {/* =========================================================
                BACK WALL
            ========================================================= */}

            <mesh position={[0, height / 2, -depth / 2]}>
                <boxGeometry args={[width, height, 0.18]} />
                <meshStandardMaterial
                    color="#202330"
                    roughness={0.55}
                />
            </mesh>

            {/* =========================================================
                LEFT WALL
            ========================================================= */}

            <mesh position={[-width / 2, height / 2, 0]}>
                <boxGeometry args={[0.18, height, depth]} />
                <meshStandardMaterial
                    color="#202330"
                    roughness={0.55}
                />
            </mesh>

            {/* =========================================================
                RIGHT WALL
            ========================================================= */}

            <mesh position={[width / 2, height / 2, 0]}>
                <boxGeometry args={[0.18, height, depth]} />
                <meshStandardMaterial
                    color="#202330"
                    roughness={0.55}
                />
            </mesh>

            {/* =========================================================
                CEILING
            ========================================================= */}

            <mesh position={[0, height, 0]}>
                <boxGeometry args={[width, 0.15, depth]} />
                <meshStandardMaterial
                    color="#10121a"
                    roughness={0.7}
                />
            </mesh>

            {/* =========================================================
                ENTRANCE
            ========================================================= */}

            <EntranceFrame
                width={width}
                height={height}
                depth={depth}
            />

            {/* =========================================================
                STORE SIGN
            ========================================================= */}

            <group position={[0, height - 0.75, -depth / 2 + 0.15]}>
                <mesh>
                    <boxGeometry args={[width * 0.7, 0.75, 0.08]} />
                    <meshStandardMaterial
                        color="#11131c"
                        emissive="#7c3cff"
                        emissiveIntensity={0.25}
                    />
                </mesh>

                <Text
                    position={[0, 0, 0.08]}
                    fontSize={0.34}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    {store.storeName || store.storeCode || "STORE"}
                </Text>
            </group>

            {/* =========================================================
                SPECIALIZATION
            ========================================================= */}

            <Text
                position={[0, height - 1.3, -depth / 2 + 0.15]}
                fontSize={0.18}
                color="#b6a4ff"
                anchorX="center"
                anchorY="middle"
            >
                {store.shopSpecializes || "Gaming Store"}
            </Text>

{/* =========================================================
    SHELVES
    توزيع الرفوف على 3 حوائط
========================================================= */}

/* الحائط الشمال */
{layout.shelves.map((shelf) => (
    <Shelf
        key={shelf.id}
        position={shelf.position}
        rotation={-shelf.rotation}
        width={shelf.width}
    />
))}


{/* =========================================================
    COUNTER
    أمام الباب مباشرة
========================================================= */}

<Counter
    position={layout.counter.position}
    counterWidth={layout.counter.width}
/>

            {/* =========================================================
                LIGHTS
            ========================================================= */}

            <pointLight
                position={[0, height - 0.6, 0]}
                intensity={2.5}
                distance={18}
            />

            <pointLight
                position={[-width / 3, height - 0.8, 1]}
                intensity={1.5}
                distance={12}
                color="#7c3cff"
            />

            <pointLight
                position={[width / 3, height - 0.8, 1]}
                intensity={1.5}
                distance={12}
                color="#10b981"
            />

            {/* =========================================================
                EXIT BUTTON (DOM overlay via drei's Html)
            ========================================================= */}

            <Html fullscreen>
                <div
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        zIndex: 500,
                        pointerEvents: "auto",
                    }}
                >
                    <button
                        onClick={onExit}
                        style={{
                            padding: "12px 22px",
                            borderRadius: "10px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "rgba(15,23,42,0.9)",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        ← خروج من المحل
                    </button>
                </div>
            </Html>
        </group>
    );
}