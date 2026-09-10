import Store3D from "./Store3D";

/*
    Ground Floor
    ------------------------------------------------
    Based on the original 135m semicircle plan.

    18 Units
    3 Flagships

    All stores are on the same ground level.
*/

const stores = [
    // ============================================
    // LEFT WING
    // ============================================

    {
        id: "U-01",
        position: [-49, 0, -8],
        rotation: Math.PI * 0.27,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-02",
        position: [-48, 0, 4],
        rotation: Math.PI * 0.34,
        width: 8,
        depth: 12,
        height: 5.5,
    },
    {
        id: "U-03",
        position: [-45, 0, 17],
        rotation: Math.PI * 0.41,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-04",
        position: [-41, 0, 29],
        rotation: Math.PI * 0.48,
        width: 10,
        depth: 15,
        height: 5.5,
    },
    {
        id: "U-05",
        position: [-35, 0, 39],
        rotation: Math.PI * 0.56,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-06",
        position: [-28, 0, 48],
        rotation: Math.PI * 0.64,
        width: 8,
        depth: 12,
        height: 5.5,
    },
    {
        id: "U-07",
        position: [-20, 0, 54],
        rotation: Math.PI * 0.72,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-08",
        position: [-12, 0, 57],
        rotation: Math.PI * 0.82,
        width: 8,
        depth: 12,
        height: 5.5,
    },
    // {
    //     id: "U-09",
    //     position: [-7, 0, 61],
    //     rotation: Math.PI * 0.92,
    //     width: 6,
    //     depth: 10,
    //     height: 5.5,
    // },

    // ============================================
    // RIGHT WING
    // ============================================

    // {
    //     id: "U-10",
    //     position: [7, 0, 61],
    //     rotation: -Math.PI * 0.92,
    //     width: 6,
    //     depth: 10,
    //     height: 5.5,
    // },
    {
        id: "U-11",
        position: [12, 0, 57],
        rotation: -Math.PI * 0.82,
        width: 8,
        depth: 12,
        height: 5.5,
    },
    {
        id: "U-12",
        position: [20, 0, 54],
        rotation: -Math.PI * 0.72,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-13",
        position: [28, 0, 48],
        rotation: -Math.PI * 0.64,
        width: 10,
        depth: 15,
        height: 5.5,
    },
    {
        id: "U-14",
        position: [35, 0, 39],
        rotation: -Math.PI * 0.56,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-15",
        position: [41, 0, 29],
        rotation: -Math.PI * 0.48,
        width: 8,
        depth: 12,
        height: 5.5,
    },
    {
        id: "U-16",
        position: [45, 0, 17],
        rotation: -Math.PI * 0.41,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-17",
        position: [48, 0, 4],
        rotation: -Math.PI * 0.34,
        width: 8,
        depth: 12,
        height: 5.5,
    },
    {
        id: "U-18",
        position: [49, 0, -8],
        rotation: -Math.PI * 0.27,
        width: 6,
        depth: 10,
        height: 5.5,
    },

    // ============================================
    // FLAGSHIP AREA
    // ============================================

    {
        id: "F-01",
        position: [-21, 0, 57],
        rotation: Math.PI,
        width: 12,
        depth: 16,
        height: 5.5,
    },
    {
        id: "F-02",
        position: [0, 0, 61],
        rotation: Math.PI,
        width: 15,
        depth: 18,
        height: 5.5,
    },
    {
        id: "F-03",
        position: [21, 0, 57],
        rotation: Math.PI,
        width: 12,
        depth: 16,
        height: 5.5,
    },
];

export default function GroundFloor() {
    return (
        <group>
            {stores.map((store) => (
                <Store3D
                    key={store.id}
                    {...store}
                />
            ))}
        </group>
    );
}