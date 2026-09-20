import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export default function Avatar({
    position = [0, 0, 22],
    isTransitioning = false,
    onPositionUpdate,
    canMove,
    joystickInput, // مدخلات الجويستيك للجوال { x, z }
}) {
    const avatarRef = useRef();
    const meshGroupRef = useRef();
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

    useFrame((state, delta) => {
        if (!avatarRef.current) return;

        const pos = avatarRef.current.position;

        if (onPositionUpdate) {
            onPositionUpdate([pos.x, pos.y, pos.z], avatarRef.current);
        }

        if (isTransitioning) return;

        const moveSpeed = 12 * delta;

        // مدخلات لوحة المفاتيح
        const isUp = keys.current["w"] || keys.current["arrowup"] || keys.current["KeyW"];
        const isDown = keys.current["s"] || keys.current["arrowdown"] || keys.current["KeyS"];
        const isLeft = keys.current["a"] || keys.current["arrowleft"] || keys.current["KeyA"];
        const isRight = keys.current["d"] || keys.current["arrowright"] || keys.current["KeyD"];

        let moveX = 0;
        let moveZ = 0;

        if (isUp) moveZ -= moveSpeed;
        if (isDown) moveZ += moveSpeed;
        if (isLeft) moveX -= moveSpeed;
        if (isRight) moveX += moveSpeed;

        // دمج حركة الجويستيك إن وُجدت
        if (joystickInput && (joystickInput.x !== 0 || joystickInput.z !== 0)) {
            moveX = joystickInput.x * moveSpeed;
            moveZ = joystickInput.z * moveSpeed;
        }

        const isMoving = moveX !== 0 || moveZ !== 0;

        // 1. إضافة أنيميشن مشي مجسم للأفاتار عند الحركة
        if (meshGroupRef.current) {
            if (isMoving) {
                const t = state.clock.getElapsedTime() * 12;
                meshGroupRef.current.position.y = Math.sin(t) * 0.08;
                meshGroupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
            } else {
                meshGroupRef.current.position.y = 0;
                meshGroupRef.current.rotation.z = 0;
            }
        }

        if (!isMoving) return;

        // الدوران باتجاه الحركة
        const angle = Math.atan2(moveX, moveZ);
        avatarRef.current.rotation.y = angle;

        // التأكد من عدم الاصطدام بالهيئات
        const nextPosition = [pos.x + moveX, pos.y, pos.z + moveZ];

        if (canMove && !canMove(nextPosition)) {
            return;
        }

        pos.x = nextPosition[0];
        pos.y = nextPosition[1];
        pos.z = nextPosition[2];
    });

    return (
        <group ref={avatarRef} position={position}>
            <group ref={meshGroupRef}>
                {/* جسم اللاعب */}
                <mesh position={[0, 1.1, 0]}>
                    <capsuleGeometry args={[0.45, 1.2, 8, 16]} />
                    <meshStandardMaterial color="#7c3cff" roughness={0.3} />
                </mesh>

                {/* علامة اتجاه النظر */}
                <mesh position={[0, 1.5, 0.4]}>
                    <boxGeometry args={[0.5, 0.15, 0.1]} />
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
                </mesh>
            </group>

            {/* ظل اللاعب */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.2, 0.6, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.4} />
            </mesh>
        </group>
    );
}