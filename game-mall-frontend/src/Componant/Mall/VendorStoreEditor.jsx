import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import {
    OrbitControls,
    TransformControls,
} from "@react-three/drei";
import {
    getStoreLayout,
    createStoreLayoutItem,
    updateStoreLayoutItem,
    deleteStoreLayoutItem,
} from "../../Api/storeLayoutApi";


const ITEM_TYPES = [
    {
        type: "shelf",
        label: "Shelf",
    },
    {
        type: "counter",
        label: "Counter",
    },
    {
        type: "display",
        label: "Display",
    },
    {
        type: "table",
        label: "Table",
    },
    {
        type: "wall_display",
        label: "Wall Display",
    },
];


/* =========================================================
   Helpers
========================================================= */

function number(value, fallback = 0) {
    const result = Number(value);

    return Number.isFinite(result)
        ? result
        : fallback;
}



function clampItemPosition({
    x,
    z,
    width,
    depth,
    rotationY,
    storeWidth,
    storeDepth,
    wallThickness = 0.25,
}) {
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    // حساب الـ bounding box بعد الدوران
    const cos = Math.abs(Math.cos(rotationY));
    const sin = Math.abs(Math.sin(rotationY));

    const rotatedHalfWidth =
        cos * halfWidth +
        sin * halfDepth;

    const rotatedHalfDepth =
        sin * halfWidth +
        cos * halfDepth;

    const limitX =
        storeWidth / 2 -
        wallThickness -
        rotatedHalfWidth;

    const limitZ =
        storeDepth / 2 -
        wallThickness -
        rotatedHalfDepth;

    return {
        x: Math.max(
            -limitX,
            Math.min(limitX, x)
        ),

        z: Math.max(
            -limitZ,
            Math.min(limitZ, z)
        ),
    };
}


/* =========================================================
   Store item 3D object
========================================================= */

function StoreLayoutObject({
    item,
    selected,
    mode,
    onSelect,
    onTransformEnd,
    storeWidth,
    storeDepth,
}) {
    const groupRef = useRef(null);
    
    const [groupObject, setGroupObject] = useState(null);

    const width = Math.max(number(item.width, 2), 0.2);
    const height = Math.max(number(item.height, 2), 0.2);
    const depth = Math.max(number(item.depth, 1), 0.2);

    const position = [
        Number(item.position_x),
        Number(item.position_y) + height / 2,
        Number(item.position_z),
    ];

    const rotation = [
        Number(item.rotation_x),
        Number(item.rotation_y),
        Number(item.rotation_z),
    ];

    const color = selected ? "#a855f7" : "#5b21b6";


    const keepInsideStore = () => {
    if (!groupRef.current) return;

    const object = groupRef.current;

    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    const rotationY = object.rotation.y;

    const cos = Math.abs(Math.cos(rotationY));
    const sin = Math.abs(Math.sin(rotationY));

    const rotatedHalfWidth =
        cos * halfWidth +
        sin * halfDepth;

    const rotatedHalfDepth =
        sin * halfWidth +
        cos * halfDepth;

    const wallThickness = 0.25;

const maxX =
    storeWidth / 2 -
    wallThickness -
    rotatedHalfWidth;

const maxZ =
    storeDepth / 2 -
    wallThickness -
    rotatedHalfDepth;

    object.position.x = Math.max(
        -maxX,
        Math.min(maxX, object.position.x)
    );

    object.position.z = Math.max(
        -maxZ,
        Math.min(maxZ, object.position.z)
    );
};

    const handleTransformEnd = () => {
        if (!groupRef.current) return;

        const object = groupRef.current;

        onTransformEnd(item, {
            position_x: object.position.x,
            position_y: object.position.y - height / 2,
            position_z: object.position.z,
            rotation_x: object.rotation.x,
            rotation_y: object.rotation.y,
            rotation_z: object.rotation.z,
        });
    };

    return (
        <>
            <group
    ref={(node) => {
        groupRef.current = node;
        if (node) setGroupObject(node);
    }}
                position={position}
                rotation={rotation}
                onClick={(event) => {
                    event.stopPropagation();
                    onSelect(item.id);
                }}
            >
                {/* Main body */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[width, height, depth]} />
                    <meshStandardMaterial
                        color={color}
                        metalness={0.25}
                        roughness={0.55}
                    />
                </mesh>

                {/* باقي الأجزاء (Shelves, Counter, Display, Table...) بنفس كودك */}
                {/* ... */}

                {/* Selection outline */}
                {selected && (
                    <mesh>
                        <boxGeometry args={[width + 0.12, height + 0.12, depth + 0.12]} />
                        <meshBasicMaterial color="#c084fc" wireframe />
                    </mesh>
                )}
            </group>

            {/* نضع TransformControls منفصلاً ونربطه بـ groupRef */}
            {selected && groupObject && (
    <TransformControls
        object={groupObject}
        mode={mode}
        translationSnap={0.5}
        rotationSnap={Math.PI / 12}
        onChange={keepInsideStore}
        onMouseUp={handleTransformEnd}
    />
)}
        </>
    );
}


/* =========================================================
   Store room
========================================================= */

function StoreRoom({
    width = 12,
    depth = 18,
    height = 5,
}) {
    const wallThickness = 0.25;

    return (
        <group>
            {/* Floor */}
            <mesh
                rotation={[
                    -Math.PI / 2,
                    0,
                    0,
                ]}
                receiveShadow
            >
                <planeGeometry
                    args={[
                        width,
                        depth,
                    ]}
                />

                <meshStandardMaterial
                    color="#20202c"
                    roughness={0.75}
                />
            </mesh>


            {/* Back wall */}
            <mesh
                position={[
                    0,
                    height / 2,
                    -depth / 2,
                ]}
            >
                <boxGeometry
                    args={[
                        width,
                        height,
                        wallThickness,
                    ]}
                />

                <meshStandardMaterial
                    color="#171722"
                />
            </mesh>


            {/* Left wall */}
            <mesh
                position={[
                    -width / 2,
                    height / 2,
                    0,
                ]}
            >
                <boxGeometry
                    args={[
                        wallThickness,
                        height,
                        depth,
                    ]}
                />

                <meshStandardMaterial
                    color="#171722"
                />
            </mesh>


            {/* Right wall */}
            <mesh
                position={[
                    width / 2,
                    height / 2,
                    0,
                ]}
            >
                <boxGeometry
                    args={[
                        wallThickness,
                        height,
                        depth,
                    ]}
                />

                <meshStandardMaterial
                    color="#171722"
                />
            </mesh>


            {/* Ceiling frame */}
            <mesh
                position={[
                    0,
                    height,
                    0,
                ]}
            >
                <boxGeometry
                    args={[
                        width,
                        0.12,
                        depth,
                    ]}
                />

                <meshStandardMaterial
                    color="#11111b"
                    transparent
                    opacity={0.35}
                />
            </mesh>


            {/* Entrance opening visual */}
            <mesh
                position={[
                    0,
                    0.05,
                    depth / 2 - 0.15,
                ]}
            >
                <boxGeometry
                    args={[
                        Math.min(width * 0.45, 5),
                        0.1,
                        0.3,
                    ]}
                />

                <meshStandardMaterial
                    color="#7c3cff"
                    emissive="#3b0764"
                />
            </mesh>
        </group>
    );
}


/* =========================================================
   3D Editor Scene
========================================================= */

function StoreEditorScene({
    items,
    selectedItem,
    selectedItemId,
    setSelectedItemId,
    mode,
    handleTransformEnd,
    storeWidth,
    storeDepth,
    storeHeight,
}) {

    return (
        <>
            <ambientLight intensity={1.2} />

            <directionalLight
                position={[
                    8,
                    12,
                    8,
                ]}
                intensity={2}
                castShadow
            />

            <pointLight
                position={[
                    -5,
                    5,
                    5,
                ]}
                intensity={20}
                distance={30}
            />


            <StoreRoom
                width={storeWidth}
                depth={storeDepth}
                height={storeHeight}
            />


            {items.map((item) => (
    <StoreLayoutObject
    key={item.id}
    item={item}
    selected={Number(selectedItemId) === Number(item.id)}
    mode={mode}
    onSelect={setSelectedItemId}
    onTransformEnd={handleTransformEnd}
    storeWidth={storeWidth}
    storeDepth={storeDepth}
/>
))}


            {/* Grid */}
            <gridHelper
                args={[
                    Math.max(
                        storeWidth,
                        storeDepth
                    ),
                    20,
                    "#52525b",
                    "#27272a",
                ]}
                position={[
                    0,
                    0.01,
                    0,
                ]}
            />


            <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.08}
                minDistance={5}
                maxDistance={30}
                maxPolarAngle={
                    Math.PI / 2.05
                }
            />
        </>
    );
}


/* =========================================================
   Main Component
========================================================= */

export default function VendorStoreEditor() {
    const { storeId } = useParams();

    const [items, setItems] = useState([]);

    const [selectedItemId, setSelectedItemId] = useState(null);
    const [storeInfo, setStoreInfo] = useState(null);

    const storeWidth = Math.max(
    number(storeInfo?.width, 14),
    1
);

const storeDepth = Math.max(
    number(storeInfo?.depth, 20),
    1
);

const storeHeight = Math.max(
    number(storeInfo?.height, 5.5),
    1
);

const selectedItem = useMemo(() => {
    if (selectedItemId === null) return null;

    return (
        items.find(
            (item) =>
                Number(item.id) === Number(selectedItemId)
        ) || null
    );
}, [items, selectedItemId]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [mode, setMode] =
        useState("translate");


    /* =====================================================
       Load Layout
    ===================================================== */

    const loadLayout = async () => {
        if (!storeId) return;

        try {
            setLoading(true);
            setError("");
            

            const response =
                await getStoreLayout(storeId);

                const store =
    response?.data?.store ||
    response?.store ||
    null;

setStoreInfo(store);

            const layoutItems =
                response?.data?.items ||
                response?.items ||
                [];

            setItems(layoutItems);

            setSelectedItemId(null);
        } catch (err) {
            console.error(
                "Failed to load store layout:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Failed to load store layout"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadLayout();
    }, [storeId]);


    /* =====================================================
       Add Item
    ===================================================== */

    const handleAddItem = async (
        itemType
    ) => {
        if (!storeId || saving) return;

        try {
            setSaving(true);
            setError("");

            const newItem = {
                item_type: itemType,

                position_x: 0,
                position_y: 0,
                position_z: 0,

                rotation_x: 0,
                rotation_y: 0,
                rotation_z: 0,

                width:
                    itemType === "counter"
                        ? 3
                        : itemType === "table"
                        ? 3
                        : 2,

                height:
                    itemType === "shelf"
                        ? 2.5
                        : itemType === "wall_display"
                        ? 2.5
                        : 2,

                depth:
                    itemType === "counter"
                        ? 1
                        : itemType === "table"
                        ? 2
                        : 1,
            };


            const response =
                await createStoreLayoutItem(
                    storeId,
                    newItem
                );


            
const createdItem =
  response?.data?.item ??
  response?.item ??
  response?.data ??
  response;

if (createdItem?.id == null) {
  throw new Error("لم يرجع السيرفر ID صالحًا للعنصر الجديد");
}

setItems((prev) => [...prev, createdItem]);
setSelectedItemId(createdItem.id);


            setItems((prev) => [
                ...prev,
                createdItem,
            ]);

            setSelectedItemId(createdItem.id);
        } catch (err) {
            console.error(
                "Failed to create layout item:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Failed to create layout item"
            );
        } finally {
            setSaving(false);
        }
    };


    /* =====================================================
       Delete Item
    ===================================================== */

    const handleDeleteItem = async () => {
        if (!selectedItem || saving)
            return;

        const confirmed =
            window.confirm(
                "هل أنت متأكد من حذف هذا العنصر؟"
            );

        if (!confirmed) return;


        try {
            setSaving(true);
            setError("");

            await deleteStoreLayoutItem(
                storeId,
                selectedItem.id
            );


            setItems((prev) =>
                prev.filter(
                    (item) =>
                        Number(item.id) !==
                        Number(
                            selectedItem.id
                        )
                )
            );


            setSelectedItemId(null);
        } catch (err) {
            console.error(
                "Failed to delete layout item:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Failed to delete layout item"
            );
        } finally {
            setSaving(false);
        }
    };


    /* =====================================================
       Transform
    ===================================================== */

    const handleTransformEnd = async (
    originalItem,
    transform
) => {
    const width = Math.max(
        number(originalItem.width, 2),
        0.2
    );

    const height = Math.max(
        number(originalItem.height, 2),
        0.2
    );

    const depth = Math.max(
        number(originalItem.depth, 1),
        0.2
    );

    const rotationY = Number(
        transform.rotation_y
    ) || 0;


    // منع العنصر من الخروج خارج المحل
    const clampedPosition =
        clampItemPosition({
            x: Number(transform.position_x) || 0,
            z: Number(transform.position_z) || 0,
            width,
            depth,
            rotationY,
            storeWidth,
            storeDepth,
        });

    const updatedItem = {
        position_x: clampedPosition.x,

        position_y:
            Number(transform.position_y) || 0,

        position_z: clampedPosition.z,

        rotation_x:
            Number(transform.rotation_x) || 0,

        rotation_y: rotationY,

        rotation_z:
            Number(transform.rotation_z) || 0,
    };

    // تحديث الشاشة فوراً
    setItems((prev) =>
        prev.map((item) =>
            Number(item.id) ===
            Number(originalItem.id)
                ? {
                      ...item,
                      ...updatedItem,
                  }
                : item
        )
    );

    try {
        setSaving(true);
        setError("");

        await updateStoreLayoutItem(
            storeId,
            originalItem.id,
            updatedItem
        );
    } catch (error) {
        console.error(
            "Failed to save layout item:",
            error
        );

        setError(
            error?.response?.data?.message ||
            "Failed to save layout item"
        );
    } finally {
        setSaving(false);
    }
};

    /* =====================================================
       Selected Item
    ===================================================== */

    const selectedInfo = useMemo(() => {
        if (!selectedItem) return null;

        return {
            x: number(
                selectedItem.position_x
            ),

            y: number(
                selectedItem.position_y
            ),

            z: number(
                selectedItem.position_z
            ),

            rx: number(
                selectedItem.rotation_x
            ),

            ry: number(
                selectedItem.rotation_y
            ),

            rz: number(
                selectedItem.rotation_z
            ),

            width: number(
                selectedItem.width,
                1
            ),

            height: number(
                selectedItem.height,
                1
            ),

            depth: number(
                selectedItem.depth,
                1
            ),
        };
    }, [selectedItem]);


    /* =====================================================
       Render
    ===================================================== */

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#080812",
                color: "#fff",
                padding: "30px",
                fontFamily:
                    "Arial, sans-serif",
            }}
        >
            {/* Header */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    marginBottom: "25px",
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "28px",
                        }}
                    >
                        Store Editor
                    </h1>

                    <p
                        style={{
                            marginTop: "8px",
                            color: "#9ca3af",
                        }}
                    >
                        Store ID: {storeId}
                    </p>
                </div>


                <button
                    onClick={loadLayout}
                    disabled={
                        loading || saving
                    }
                    style={{
                        padding:
                            "10px 18px",
                        border: "none",
                        borderRadius: "8px",
                        background:
                            "#7c3cff",
                        color: "#fff",
                        cursor:
                            "pointer",
                    }}
                >
                    Refresh
                </button>
            </div>


            {/* Error */}

            {error && (
                <div
                    style={{
                        background:
                            "#3b1111",
                        border:
                            "1px solid #ef4444",
                        color:
                            "#fca5a5",
                        padding:
                            "12px 15px",
                        borderRadius:
                            "8px",
                        marginBottom:
                            "20px",
                    }}
                >
                    {error}
                </div>
            )}


            {/* Editor */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "260px 1fr 280px",
                    gap: "20px",
                }}
            >
                {/* Tools */}

                <div
                    style={{
                        background:
                            "#11111d",
                        border:
                            "1px solid #27273a",
                        borderRadius:
                            "12px",
                        padding: "20px",
                    }}
                >
                    <h3
                        style={{
                            marginTop: 0,
                            marginBottom:
                                "18px",
                        }}
                    >
                        Add Item
                    </h3>


                    {ITEM_TYPES.map(
                        (item) => (
                            <button
                                key={
                                    item.type
                                }
                                onClick={() =>
                                    handleAddItem(
                                        item.type
                                    )
                                }
                                disabled={
                                    saving
                                }
                                style={{
                                    width:
                                        "100%",
                                    padding:
                                        "12px",
                                    marginBottom:
                                        "10px",
                                    border:
                                        "1px solid #34344a",
                                    borderRadius:
                                        "8px",
                                    background:
                                        "#181827",
                                    color:
                                        "#fff",
                                    cursor:
                                        saving
                                            ? "not-allowed"
                                            : "pointer",
                                    textAlign:
                                        "left",
                                }}
                            >
                                +{" "}
                                {
                                    item.label
                                }
                            </button>
                        )
                    )}


                    <div
                        style={{
                            marginTop:
                                "25px",
                            paddingTop:
                                "20px",
                            borderTop:
                                "1px solid #27273a",
                        }}
                    >
                        <h3>
                            Transform
                        </h3>


                        <button
                            onClick={() =>
                                setMode(
                                    "translate"
                                )
                            }
                            style={{
                                width:
                                    "100%",
                                padding:
                                    "10px",
                                marginBottom:
                                    "8px",
                                border:
                                    mode ===
                                    "translate"
                                        ? "2px solid #a855f7"
                                        : "1px solid #34344a",
                                borderRadius:
                                    "8px",
                                background:
                                    "#181827",
                                color:
                                    "#fff",
                                cursor:
                                    "pointer",
                            }}
                        >
                            Move
                        </button>


                        <button
                            onClick={() =>
                                setMode(
                                    "rotate"
                                )
                            }
                            style={{
                                width:
                                    "100%",
                                padding:
                                    "10px",
                                border:
                                    mode ===
                                    "rotate"
                                        ? "2px solid #a855f7"
                                        : "1px solid #34344a",
                                borderRadius:
                                    "8px",
                                background:
                                    "#181827",
                                color:
                                    "#fff",
                                cursor:
                                    "pointer",
                            }}
                        >
                            Rotate
                        </button>
                    </div>
                </div>


                {/* 3D Editor */}

                <div
                    style={{
                        height:
                            "650px",
                        background:
                            "#090912",
                        border:
                            "1px solid #27273a",
                        borderRadius:
                            "12px",
                        overflow:
                            "hidden",
                    }}
                >
                    <Canvas
                        shadows
                        camera={{
                            position: [
                                12,
                                12,
                                16,
                            ],
                            fov: 50,
                        }}
                        onPointerMissed={() =>
                            setSelectedItemId(
                                null
                            )
                        }
                    >
                        <color
                            attach="background"
                            args={[
                                "#090912",
                            ]}
                        />

                        <StoreEditorScene
    items={items}
    selectedItemId={selectedItemId}
    setSelectedItemId={setSelectedItemId}
    mode={mode}
    handleTransformEnd={handleTransformEnd}
    storeWidth={storeWidth}
    storeDepth={storeDepth}
    storeHeight={storeHeight}
/>
                    </Canvas>
                </div>


                {/* Properties */}

                <div
                    style={{
                        background:
                            "#11111d",
                        border:
                            "1px solid #27273a",
                        borderRadius:
                            "12px",
                        padding: "20px",
                    }}
                >
                    <h3
                        style={{
                            marginTop: 0,
                            marginBottom:
                                "20px",
                        }}
                    >
                        Properties
                    </h3>


                    {!selectedItem ? (
                        <p
                            style={{
                                color:
                                    "#71717a",
                                lineHeight:
                                    1.6,
                            }}
                        >
                            اختر عنصر من
                            المحل لعرض
                            خصائصه
                            والتحكم فيه.
                        </p>
                    ) : (
                        <>
                            <div
                                style={{
                                    marginBottom:
                                        "18px",
                                }}
                            >
                                <div
                                    style={{
                                        color:
                                            "#a1a1aa",
                                        fontSize:
                                            "13px",
                                        marginBottom:
                                            "5px",
                                    }}
                                >
                                    Type
                                </div>

                                <strong>
                                    {
                                        selectedItem.item_type
                                    }
                                </strong>
                            </div>


                            {selectedInfo && (
                                <>
                                    <div
                                        style={{
                                            marginBottom:
                                                "18px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                color:
                                                    "#a1a1aa",
                                                fontSize:
                                                    "13px",
                                                marginBottom:
                                                    "7px",
                                            }}
                                        >
                                            Position
                                        </div>

                                        <div>
                                            X:{" "}
                                            {selectedInfo.x.toFixed(
                                                2
                                            )}
                                            <br />
                                            Y:{" "}
                                            {selectedInfo.y.toFixed(
                                                2
                                            )}
                                            <br />
                                            Z:{" "}
                                            {selectedInfo.z.toFixed(
                                                2
                                            )}
                                        </div>
                                    </div>


                                    <div
                                        style={{
                                            marginBottom:
                                                "18px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                color:
                                                    "#a1a1aa",
                                                fontSize:
                                                    "13px",
                                                marginBottom:
                                                    "7px",
                                            }}
                                        >
                                            Rotation
                                        </div>

                                        <div>
                                            X:{" "}
                                            {selectedInfo.rx.toFixed(
                                                2
                                            )}
                                            <br />
                                            Y:{" "}
                                            {selectedInfo.ry.toFixed(
                                                2
                                            )}
                                            <br />
                                            Z:{" "}
                                            {selectedInfo.rz.toFixed(
                                                2
                                            )}
                                        </div>
                                    </div>


                                    <div
                                        style={{
                                            marginBottom:
                                                "20px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                color:
                                                    "#a1a1aa",
                                                fontSize:
                                                    "13px",
                                                marginBottom:
                                                    "7px",
                                            }}
                                        >
                                            Size
                                        </div>

                                        <div>
                                            W:{" "}
                                            {selectedInfo.width.toFixed(
                                                2
                                            )}
                                            <br />
                                            H:{" "}
                                            {selectedInfo.height.toFixed(
                                                2
                                            )}
                                            <br />
                                            D:{" "}
                                            {selectedInfo.depth.toFixed(
                                                2
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}


                            <button
                                onClick={
                                    handleDeleteItem
                                }
                                disabled={
                                    saving
                                }
                                style={{
                                    width:
                                        "100%",
                                    padding:
                                        "12px",
                                    border:
                                        "none",
                                    borderRadius:
                                        "8px",
                                    background:
                                        "#dc2626",
                                    color:
                                        "#fff",
                                    cursor:
                                        "pointer",
                                }}
                            >
                                Delete Item
                            </button>
                        </>
                    )}
                </div>
            </div>


            {/* Footer */}

            <div
                style={{
                    marginTop:
                        "20px",
                    color:
                        "#52525b",
                    fontSize:
                        "13px",
                }}
            >
                {loading
                    ? "Loading store layout..."
                    : `${items.length} layout item(s)`}
            </div>
        </div>
    );
}
