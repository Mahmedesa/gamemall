import { Text } from "@react-three/drei";
import { mallMaterials } from "./MallMaterials";

export default function Store3D({
    id,
    position = [0, 0, 0],
    rotation = 0,
    width = 6,
    depth = 10,
    height = 5.5,
}) {
    return (
        <group
            position={position}
            rotation={[0, rotation, 0]}
        >
            {/* Store body */}
            <mesh
                position={[0, height / 2, 0]}
                material={mallMaterials.storeBody}
            >
                <boxGeometry
                    args={[width, height, depth]}
                />
            </mesh>

            {/* Glass front */}
            <mesh
                position={[
                    0,
                    height / 2,
                    depth / 2 + 0.03,
                ]}
                material={mallMaterials.storeGlass}
            >
                <boxGeometry
                    args={[
                        width * 0.82,
                        height * 0.78,
                        0.08,
                    ]}
                />
            </mesh>

            {/* Entrance */}
            <mesh
                position={[
                    0,
                    height * 0.39,
                    depth / 2 + 0.09,
                ]}
                material={mallMaterials.darkMetal}
            >
                <boxGeometry
                    args={[
                        Math.min(width * 0.32, 2.4),
                        height * 0.78,
                        0.1,
                    ]}
                />
            </mesh>

            {/* Store sign */}
            <mesh
                position={[
                    0,
                    height * 0.9,
                    depth / 2 + 0.12,
                ]}
                material={mallMaterials.storeFrame}
            >
                <boxGeometry
                    args={[
                        Math.min(width * 0.8, 7),
                        0.65,
                        0.15,
                    ]}
                />
            </mesh>

            {/* Store name */}
            <Text
                position={[
                    0,
                    height * 0.9,
                    depth / 2 + 0.22,
                ]}
                fontSize={0.42}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {id}
            </Text>

            {/* Store floor */}
            <mesh
                position={[0, 0.05, 0]}
                material={mallMaterials.storeBase}
            >
                <boxGeometry
                    args={[
                        width + 0.15,
                        0.1,
                        depth + 0.15,
                    ]}
                />
            </mesh>
        </group>
    );
}