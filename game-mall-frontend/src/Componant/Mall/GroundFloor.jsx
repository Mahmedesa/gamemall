import Store3D from "./Store3D";

const stores = [
    // =========================
    // LEFT SIDE — U-01 → U-09
    // =========================
    {
        id: "U-01",
        position: [-48, 0, -30],
        rotation: Math.PI * 0.18,
        width: 6,
        depth: 10,
    },
    {
        id: "U-02",
        position: [-52, 0, -18],
        rotation: Math.PI * 0.22,
        width: 8,
        depth: 12,
    },
    {
        id: "U-03",
        position: [-55, 0, -5],
        rotation: Math.PI * 0.28,
        width: 6,
        depth: 10,
    },
    {
        id: "U-04",
        position: [-56, 0, 9],
        rotation: Math.PI * 0.34,
        width: 10,
        depth: 15,
    },
    {
        id: "U-05",
        position: [-53, 0, 24],
        rotation: Math.PI * 0.40,
        width: 6,
        depth: 10,
    },
    {
        id: "U-06",
        position: [-47, 0, 37],
        rotation: Math.PI * 0.48,
        width: 8,
        depth: 12,
    },
    {
        id: "U-07",
        position: [-37, 0, 47],
        rotation: Math.PI * 0.58,
        width: 6,
        depth: 10,
    },
    {
        id: "U-08",
        position: [-25, 0, 53],
        rotation: Math.PI * 0.68,
        width: 8,
        depth: 12,
    },
    {
        id: "U-09",
        position: [-10, 0, 56],
        rotation: Math.PI * 0.78,
        width: 6,
        depth: 10,
    },

    // =========================
    // RIGHT SIDE — U-10 → U-18
    // =========================
    {
        id: "U-10",
        position: [10, 0, 56],
        rotation: -Math.PI * 0.78,
        width: 6,
        depth: 10,
    },
    {
        id: "U-11",
        position: [25, 0, 53],
        rotation: -Math.PI * 0.68,
        width: 8,
        depth: 12,
    },
    {
        id: "U-12",
        position: [37, 0, 47],
        rotation: -Math.PI * 0.58,
        width: 6,
        depth: 10,
    },
    {
        id: "U-13",
        position: [47, 0, 37],
        rotation: -Math.PI * 0.48,
        width: 10,
        depth: 15,
    },
    {
        id: "U-14",
        position: [53, 0, 24],
        rotation: -Math.PI * 0.40,
        width: 6,
        depth: 10,
    },
    {
        id: "U-15",
        position: [56, 0, 9],
        rotation: -Math.PI * 0.34,
        width: 8,
        depth: 12,
    },
    {
        id: "U-16",
        position: [55, 0, -5],
        rotation: -Math.PI * 0.28,
        width: 6,
        depth: 10,
    },
    {
        id: "U-17",
        position: [52, 0, -18],
        rotation: -Math.PI * 0.22,
        width: 8,
        depth: 12,
    },
    {
        id: "U-18",
        position: [48, 0, -30],
        rotation: -Math.PI * 0.18,
        width: 6,
        depth: 10,
    },

    // =========================
    // BACK — FLAGSHIP / HERO
    // =========================
    {
        id: "F-01",
        position: [-23, 0, 62],
        rotation: Math.PI,
        width: 12,
        depth: 16,
    },
    {
        id: "F-02",
        position: [0, 0, 64],
        rotation: Math.PI,
        width: 15,
        depth: 18,
    },
    {
        id: "F-03",
        position: [23, 0, 62],
        rotation: Math.PI,
        width: 12,
        depth: 16,
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