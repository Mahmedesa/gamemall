import Store3D from "./Store3D";

const stores = [
    // =========================
    // LEFT SIDE — UF-01 → UF-05
    // =========================
    {
        id: "UF-01",
        position: [-45, 6.2, -24],
        rotation: Math.PI * 0.20,
        width: 7,
        depth: 10,
        height: 4.8,
    },
    {
        id: "UF-02",
        position: [-50, 6.2, -11],
        rotation: Math.PI * 0.27,
        width: 8,
        depth: 12,
        height: 4.8,
    },
    {
        id: "UF-03",
        position: [-51, 6.2, 3],
        rotation: Math.PI * 0.34,
        width: 7,
        depth: 10,
        height: 4.8,
    },
    {
        id: "UF-04",
        position: [-48, 6.2, 17],
        rotation: Math.PI * 0.42,
        width: 8,
        depth: 12,
        height: 4.8,
    },
    {
        id: "UF-05",
        position: [-40, 6.2, 31],
        rotation: Math.PI * 0.52,
        width: 7,
        depth: 10,
        height: 4.8,
    },

    // =========================
    // RIGHT SIDE — UF-06 → UF-10
    // =========================
    {
        id: "UF-06",
        position: [40, 6.2, 31],
        rotation: -Math.PI * 0.52,
        width: 7,
        depth: 10,
        height: 4.8,
    },
    {
        id: "UF-07",
        position: [48, 6.2, 17],
        rotation: -Math.PI * 0.42,
        width: 8,
        depth: 12,
        height: 4.8,
    },
    {
        id: "UF-08",
        position: [51, 6.2, 3],
        rotation: -Math.PI * 0.34,
        width: 7,
        depth: 10,
        height: 4.8,
    },
    {
        id: "UF-09",
        position: [50, 6.2, -11],
        rotation: -Math.PI * 0.27,
        width: 8,
        depth: 12,
        height: 4.8,
    },
    {
        id: "UF-10",
        position: [45, 6.2, -24],
        rotation: -Math.PI * 0.20,
        width: 7,
        depth: 10,
        height: 4.8,
    },

    // =========================
    // BACK — PF-01 / PF-02 / PF-03
    // =========================
    {
        id: "PF-01",
        position: [-22, 6.2, 48],
        rotation: Math.PI,
        width: 12,
        depth: 16,
        height: 4.8,
    },
    {
        id: "PF-02",
        position: [0, 6.2, 50],
        rotation: Math.PI,
        width: 14,
        depth: 16,
        height: 4.8,
    },
    {
        id: "PF-03",
        position: [22, 6.2, 48],
        rotation: Math.PI,
        width: 12,
        depth: 16,
        height: 4.8,
    },
];

export default function SecondFloor() {
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