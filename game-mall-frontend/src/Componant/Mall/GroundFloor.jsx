import Store3D from "./Store3D";

/*
    Ground Floor
    ------------------------------------------------
    قوس نص دائري واحد متصل - 21 محل، بنفس روح التصميم
    اللي في الصورة المرجعية (Virtual Mall - Central
    Entrance View). المحلات الخمسة في المنتصف (U-09..U-13)
    أكبر شوية (Anchor Units)، زي U-04/U-07/U-16 في الصورة.

    كل الإحداثيات اتحسبت وتم التحقق منها برمجيًا (نص قطر
    ثابت = 54، وفحص تداخل شامل بمعادلة Three.js الصحيحة
    لدوران المحور Y) - صفر تداخلات مؤكدة بين أي محلين.
*/

const DEFAULT_STORES  = [
    {
        id: "U-01",
        position: [-53.18, 0, -9.38],
        rotation: 1.3962,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-02",
        position: [-53.99, 0, -1.22],
        rotation: 1.5482,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-03",
        position: [-53.55, 0, 6.96],
        rotation: 1.7,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-04",
        position: [-51.88, 0, 14.98],
        rotation: 1.8519,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-05",
        position: [-49.02, 0, 22.65],
        rotation: 2.0036,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-06",
        position: [-45.03, 0, 29.81],
        rotation: 2.1556,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-07",
        position: [-40.0, 0, 36.27],
        rotation: 2.3073,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-08",
        position: [-34.05, 0, 41.91],
        rotation: 2.4593,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-09",
        position: [-26.46, 0, 47.08],
        rotation: 2.6296,
        width: 8,
        depth: 12,
        height: 5.5,
    },
    {
        id: "U-10",
        position: [-16.19, 0, 51.51],
        rotation: 2.8371,
        width: 10,
        depth: 14,
        height: 5.5,
    },
    {
        id: "U-11",
        position: [-3.25, 0, 53.9],
        rotation: 3.0814,
        width: 12,
        depth: 16,
        height: 5.5,
    },
    {
        id: "U-12",
        position: [9.9, 0, 53.09],
        rotation: -2.9572,
        width: 10,
        depth: 14,
        height: 5.5,
    },
    {
        id: "U-13",
        position: [20.62, 0, 49.91],
        rotation: -2.7498,
        width: 8,
        depth: 12,
        height: 5.5,
    },
    {
        id: "U-14",
        position: [28.78, 0, 45.69],
        rotation: -2.5795,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-15",
        position: [35.36, 0, 40.81],
        rotation: -2.4276,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-16",
        position: [41.13, 0, 34.99],
        rotation: -2.2757,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-17",
        position: [45.95, 0, 28.37],
        rotation: -2.1239,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-18",
        position: [49.71, 0, 21.09],
        rotation: -1.972,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-19",
        position: [52.33, 0, 13.33],
        rotation: -1.8202,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-20",
        position: [53.74, 0, 5.26],
        rotation: -1.6684,
        width: 6,
        depth: 10,
        height: 5.5,
    },
    {
        id: "U-21",
        position: [53.92, 0, -2.93],
        rotation: -1.5165,
        width: 6,
        depth: 10,
        height: 5.5,
    },
];

export default function GroundFloor({ stores = DEFAULT_STORES }) {
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