import { useMemo } from "react";
import { mallMaterials } from "./MallMaterials";

function TileLine({ position, size, rotation = 0 }) {
    return (
        <mesh
            position={position}
            rotation={[-Math.PI / 2, 0, rotation]}
            material={mallMaterials.floorTile}
        >
            <planeGeometry args={size} />
        </mesh>
    );
}

function MallFloor() {
    const tiles = useMemo(() => {
        const result = [];

        const width = 135;
        const depth = 120;
        const tileSize = 5;

        // Vertical tile lines
        for (let x = -width / 2; x <= width / 2; x += tileSize) {
            result.push(
                <mesh
                    key={`v-${x}`}
                    position={[x, 0.015, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    material={mallMaterials.floorTile}
                >
                    <planeGeometry args={[0.025, depth]} />
                </mesh>
            );
        }

        // Horizontal tile lines
        for (let z = -depth / 2; z <= depth / 2; z += tileSize) {
            result.push(
                <mesh
                    key={`h-${z}`}
                    position={[0, 0.016, z]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    material={mallMaterials.floorTile}
                >
                    <planeGeometry args={[width, 0.025]} />
                </mesh>
            );
        }

        return result;
    }, []);

    return (
        <group>

            {/* =================================
                MAIN MALL FLOOR
            ================================= */}

            <mesh
                position={[0, -0.12, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                material={mallMaterials.floor}
            >
                <planeGeometry args={[135, 120]} />
            </mesh>


            {/* =================================
                FLOOR TILES
            ================================= */}

            <group>
                {tiles}
            </group>


            {/* =================================
                MAIN CIRCULATION CORRIDOR
            ================================= */}

            <mesh
                position={[0, 0.025, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                material={mallMaterials.corridor}
            >
                <ringGeometry args={[22, 31, 96]} />
            </mesh>


            {/* =================================
                ATRIUM INNER RING
            ================================= */}

            <mesh
                position={[0, 0.04, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                material={mallMaterials.atriumFloor}
            >
                <ringGeometry args={[15, 21, 96]} />
            </mesh>


            {/* =================================
                ATRIUM OUTER BORDER
            ================================= */}

            <mesh
                position={[0, 0.06, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                material={mallMaterials.atriumBorder}
            >
                <ringGeometry args={[31, 32, 96]} />
            </mesh>


            {/* =================================
                FRONT MAIN WALKWAY
            ================================= */}

            <TileLine
                position={[0, 0.08, -42]}
                size={[42, 8]}
            />


            {/* =================================
                LEFT MAIN WALKWAY
            ================================= */}

            <TileLine
                position={[-39, 0.08, 5]}
                size={[8, 70]}
            />


            {/* =================================
                RIGHT MAIN WALKWAY
            ================================= */}

            <TileLine
                position={[39, 0.08, 5]}
                size={[8, 70]}
            />


            {/* =================================
                BACK WALKWAY
            ================================= */}

            <TileLine
                position={[0, 0.08, 43]}
                size={[80, 8]}
            />

        </group>
    );
}

export default MallFloor;