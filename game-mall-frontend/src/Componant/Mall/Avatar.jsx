import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export default function Avatar({ position = [0, 1, 22], isTransitioning = false, onPositionUpdate }) {
    const avatarRef = useRef();
    const keys = useRef({});

    useEffect(() => {
        const handleKeyDown = (e) => {
            keys.current[e.key.toLowerCase()] = true;
            keys.current[e.code] = true;
        };

        const handleKeyUp = (e) => {
            keys.current[e.key.toLowerCase()] = false;
            keys.current[e.code] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useFrame((_, delta) => {
        if (!avatarRef.current) return;

        // إرسال الإحداثيات باستمرار للمكون الرئيسي للتأكد من القرب من السلم أو المحلات
        const pos = avatarRef.current.position;
        if (onPositionUpdate) {
            onPositionUpdate([pos.x, pos.y, pos.z], avatarRef.current);
        }

        // إذا كان الأفاتار يتنقل بين الأدوار (صعود/نزول تلقائي)، بنوقف الحركة اليدوية
        if (isTransitioning) return;

        const moveSpeed = 12 * delta;

        const isUp = keys.current["w"] || keys.current["arrowup"] || keys.current["KeyW"];
        const isDown = keys.current["s"] || keys.current["arrowdown"] || keys.current["KeyS"];
        const isLeft = keys.current["a"] || keys.current["arrowleft"] || keys.current["KeyA"];
        const isRight = keys.current["d"] || keys.current["arrowright"] || keys.current["KeyD"];

        if (isUp) pos.z -= moveSpeed;
        if (isDown) pos.z += moveSpeed;
        if (isLeft) pos.x -= moveSpeed;
        if (isRight) pos.x += moveSpeed;
    });

    return (
        <group ref={avatarRef} position={position}>
            {/* جسم الأفاتار */}
            <mesh position={[0, 1.1, 0]}>
                <capsuleGeometry args={[0.45, 1.2, 8, 16]} />
                <meshStandardMaterial color="#7c3cff" roughness={0.3} />
            </mesh>

            {/* اتجاه النظر */}
            <mesh position={[0, 1.5, 0.4]}>
                <boxGeometry args={[0.5, 0.15, 0.1]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
            </mesh>

            {/* الظل */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.2, 0.6, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.4} />
            </mesh>
        </group>
    );
}