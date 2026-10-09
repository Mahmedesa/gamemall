import { useRef, useEffect, Suspense, Component } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

import avatarModelPath from "../../assets/Avatar.glb?url";

/*
|--------------------------------------------------------------------------
| ملحوظة: الملف فيه أنيميشن واحد بس (Human.rigAction) — دورة مشي كاملة.
| مفيش حركة "وقوف" منفصلة، فمنطق التشغيل هو: شغّلي الحركة وهي بتتحرك،
| ووقّفيها (pause) في مكانها لما تقف.
|
| كمان الملف فيه 4 Shape Keys (ملامح شكل MakeHuman). بتتحكمي فيهم عن
| طريق الـ prop "shapeKeyValues" (array من 4 أرقام بين 0 و1).
|--------------------------------------------------------------------------
*/

class ModelErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.warn(
            "تعذّر تحميل موديل الأفاتار (GLB):",
            error?.message || error
        );
    }

    render() {
        if (this.state.hasError) {
            return (
                <mesh position={[0, 1, 0]}>
                    <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
                    <meshStandardMaterial color="#7c3cff" />
                </mesh>
            );
        }
        return this.props.children;
    }
}

function LoadedAvatarModel({ isMovingRef, shapeKeyValues }) {
    const group = useRef();
    const morphMeshRef = useRef(null);
    const { scene, animations } = useGLTF(avatarModelPath);
    const { actions, names } = useAnimations(animations, group);
    const wasMovingRef = useRef(false);

    // إصلاح الخامات ولقاء الميش اللي عليه Shape Keys
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.transparent = false;
                child.material.opacity = 1;
                child.material.depthWrite = true;
                child.material.needsUpdate = true;
            }

            if (child.isMesh && child.morphTargetInfluences) {
                morphMeshRef.current = child;
            }
        });
    }, [scene]);

    // تطبيق قيم السلايدرز على الـ Shape Keys
    useEffect(() => {
        const mesh = morphMeshRef.current;
        if (!mesh || !mesh.morphTargetInfluences || !shapeKeyValues) return;

        shapeKeyValues.forEach((value, i) => {
            if (mesh.morphTargetInfluences[i] !== undefined) {
                mesh.morphTargetInfluences[i] = value;
            }
        });
    }, [shapeKeyValues]);

    const walkAction = actions[names[0]];

    useEffect(() => {
        if (!walkAction) return;

        walkAction.setLoop(THREE.LoopRepeat, Infinity);
        walkAction.clampWhenFinished = false;
        walkAction.play();
        walkAction.paused = true;

        return () => {
            walkAction?.stop();
        };
    }, [walkAction]);

    useFrame(() => {
        if (!walkAction) return;

        const isMoving = isMovingRef.current;

        if (isMoving !== wasMovingRef.current) {
            walkAction.paused = !isMoving;
            wasMovingRef.current = isMoving;
        }
    });

    return (
        <primitive
            ref={group}
            object={scene}
            position={[0, 0.2, 0]}
            renderOrder={1}
        />
    );
}

useGLTF.preload(avatarModelPath);

export default function Avatar({
    position = [0, 0, 22],
    isTransitioning = false,
    onPositionUpdate,
    canMove,
    joystickInput,
    shapeKeyValues,
}) {
    const avatarRef = useRef();
    const keys = useRef({});
    const isMovingRef = useRef(false);

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

        const moveSpeed = 8 * delta;

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

        if (joystickInput && (joystickInput.x !== 0 || joystickInput.z !== 0)) {
            moveX = joystickInput.x * moveSpeed;
            moveZ = joystickInput.z * moveSpeed;
        }

        const isMoving = moveX !== 0 || moveZ !== 0;
        isMovingRef.current = isMoving;

        if (!isMoving) return;

        const angle = Math.atan2(moveX, moveZ);
        avatarRef.current.rotation.y = angle;

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
            <ModelErrorBoundary>
                <Suspense fallback={null}>
                    <LoadedAvatarModel
                        isMovingRef={isMovingRef}
                        shapeKeyValues={shapeKeyValues}
                    />
                </Suspense>
            </ModelErrorBoundary>

            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.1, 0.4, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.3} />
            </mesh>
        </group>
    );
}