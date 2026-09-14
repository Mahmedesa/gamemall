import { Text } from "@react-three/drei";
import * as THREE from "three";

/*
|--------------------------------------------------------------------------
| GAMEMALL - OUTER CURVED FACADE
|--------------------------------------------------------------------------
| الشكل الخارجي للمول:
| - 2 Floors
| - Curved / Oval facade
| - Glass curtain wall
| - Open sky over central atrium
| - Large circular entrance canopy
|--------------------------------------------------------------------------
*/

function CurvedGlassPanel({
    position,
    length,
    height,
    rotation = 0,
}) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>

            {/* Glass */}
            <mesh position={[0, height / 2, 0]}>
                <boxGeometry
                    args={[length, height, 0.22]}
                />

                <meshPhysicalMaterial
                    color="#9edfff"
                    transparent
                    opacity={0.24}
                    roughness={0.08}
                    metalness={0.45}
                    transmission={0.25}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Bottom metal frame */}
            <mesh position={[0, 0.12, 0]}>
                <boxGeometry
                    args={[length, 0.22, 0.32]}
                />

                <meshStandardMaterial
                    color="#4b5563"
                    metalness={0.85}
                    roughness={0.25}
                />
            </mesh>

            {/* Top metal frame */}
            <mesh position={[0, height - 0.12, 0]}>
                <boxGeometry
                    args={[length, 0.22, 0.32]}
                />

                <meshStandardMaterial
                    color="#4b5563"
                    metalness={0.85}
                    roughness={0.25}
                />
            </mesh>

            {/* Vertical center frame */}
            <mesh position={[0, height / 2, 0.14]}>
                <boxGeometry
                    args={[0.14, height, 0.14]}
                />

                <meshStandardMaterial
                    color="#64748b"
                    metalness={0.9}
                    roughness={0.2}
                />
            </mesh>

        </group>
    );
}


/*
|--------------------------------------------------------------------------
| Curved facade generator
|--------------------------------------------------------------------------
*/

function CurvedFacade({
    radiusX,
    radiusZ,
    y,
    height,
    segments = 36,
    openingWidth = 0,
}) {

    const panels = [];

    for (let i = 0; i < segments; i++) {

        const a1 =
            (i / segments) * Math.PI * 2;

        const a2 =
            ((i + 1) / segments) * Math.PI * 2;

        const x1 = radiusX * Math.cos(a1);
        const z1 = radiusZ * Math.sin(a1);

        const x2 = radiusX * Math.cos(a2);
        const z2 = radiusZ * Math.sin(a2);

        const x = (x1 + x2) / 2;
        const z = (z1 + z2) / 2;

        const dx = x2 - x1;
        const dz = z2 - z1;

        const length =
            Math.sqrt(dx * dx + dz * dz);

        const angle =
            Math.atan2(-dz, dx);

        /*
        --------------------------------------------------------------
        Front entrance opening
        --------------------------------------------------------------
        Front = negative Z

        We leave a large opening in the center
        so MainEntrance remains visible.
        */

        const isEntranceArea =
            z < -radiusZ + 10 &&
            Math.abs(x) < openingWidth / 2;

        if (isEntranceArea) {
            continue;
        }

        panels.push(
            <CurvedGlassPanel
                key={`facade-${i}`}
                position={[x, y, z]}
                length={length + 0.15}
                height={height}
                rotation={angle}
            />
        );
    }

    return <group>{panels}</group>;
}


/*
|--------------------------------------------------------------------------
| Vertical exterior columns
|--------------------------------------------------------------------------
*/

function CurvedColumns({
    radiusX,
    radiusZ,
    y,
    height,
    segments = 18,
}) {

    const columns = [];

    for (let i = 0; i < segments; i++) {

        const angle =
            (i / segments) * Math.PI * 2;

        const x =
            radiusX * Math.cos(angle);

        const z =
            radiusZ * Math.sin(angle);

        columns.push(
            <mesh
                key={`column-${i}`}
                position={[x, y + height / 2, z]}
            >
                <boxGeometry
                    args={[0.32, height, 0.32]}
                />

                <meshStandardMaterial
                    color="#64748b"
                    metalness={0.9}
                    roughness={0.2}
                />
            </mesh>
        );
    }

    return <group>{columns}</group>;
}


/*
|--------------------------------------------------------------------------
| Curved horizontal ring
|--------------------------------------------------------------------------
*/

function CurvedRing({
    radiusX,
    radiusZ,
    y,
    thickness = 0.35,
}) {

    const segments = 64;
    const pieces = [];

    for (let i = 0; i < segments; i++) {

        const a1 =
            (i / segments) * Math.PI * 2;

        const a2 =
            ((i + 1) / segments) * Math.PI * 2;

        const x1 = radiusX * Math.cos(a1);
        const z1 = radiusZ * Math.sin(a1);

        const x2 = radiusX * Math.cos(a2);
        const z2 = radiusZ * Math.sin(a2);

        const x = (x1 + x2) / 2;
        const z = (z1 + z2) / 2;

        const dx = x2 - x1;
        const dz = z2 - z1;

        const length =
            Math.sqrt(dx * dx + dz * dz);

        const angle =
            Math.atan2(-dz, dx);

        pieces.push(
            <mesh
                key={`ring-${i}`}
                position={[x, y, z]}
                rotation={[0, angle, 0]}
            >
                <boxGeometry
                    args={[
                        length + 0.15,
                        thickness,
                        0.45,
                    ]}
                />

                <meshStandardMaterial
                    color="#202633"
                    metalness={0.8}
                    roughness={0.3}
                />
            </mesh>
        );
    }

    return <group>{pieces}</group>;
}


/*
|--------------------------------------------------------------------------
| Entrance circular canopy
|--------------------------------------------------------------------------
*/

function EntranceCanopy() {

    const y = 10.7;

    return (
        <group position={[0, y, -50]}>

            {/* Main circular canopy */}
            {/* <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry
                    args={[15, 15, 0.45, 96]}
                />

                <meshStandardMaterial
                    color="#202633"
                    metalness={0.75}
                    roughness={0.25}
                />
            </mesh> */}


            {/* Inner opening */}
            <mesh
                position={[0, 0.25, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <ringGeometry
                    args={[7.5, 14.5, 96]}
                />

                <meshStandardMaterial
                    color="#c7cbd1"
                    metalness={0.35}
                    roughness={0.35}
                />
            </mesh>


            {/* Glowing ring */}
            <mesh
                position={[0, 0.28, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <ringGeometry
                    args={[14.2, 14.55, 96]}
                />

                <meshBasicMaterial
                    color="#a855f7"
                    transparent
                    opacity={0.9}
                />
            </mesh>


            {/* GAMEMALL sign */}
            <Text
                position={[0, -0.15, 14.75]}
                rotation={[0, Math.PI, 0]}
                fontSize={1.15}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                GAMEMALL
            </Text>


            {/* Support columns */}
            <mesh position={[-11, -4.6, 0]}>
    <cylinderGeometry
        args={[0.55, 0.7, 9.2, 32]}
    />

    <meshStandardMaterial
        color="#64748b"
        metalness={0.9}
        roughness={0.2}
    />
</mesh>

<mesh position={[11, -4.6, 0]}>
    <cylinderGeometry
        args={[0.55, 0.7, 9.2, 32]}
    />

    <meshStandardMaterial
        color="#64748b"
        metalness={0.9}
        roughness={0.2}
    />
</mesh>

        </group>
    );
}


/*
|--------------------------------------------------------------------------
| GAMEMALL Exterior
|--------------------------------------------------------------------------
*/

export default function MallFacade() {

    /*
    |--------------------------------------------------------------------------
    | Overall mall dimensions
    |--------------------------------------------------------------------------
    */

    const outerRadiusX = 67;
    const outerRadiusZ = 58;

    const groundHeight = 5.5;
    const secondHeight = 4.8;


    return (
        <group>

            {/* =========================================================
                GROUND FLOOR
            ========================================================= */}

            <CurvedFacade
                radiusX={outerRadiusX}
                radiusZ={outerRadiusZ}
                y={0}
                height={groundHeight}
                segments={48}
                openingWidth={28}
            />


            {/* =========================================================
                SECOND FLOOR
            ========================================================= */}

            <CurvedFacade
                radiusX={outerRadiusX - 1.5}
                radiusZ={outerRadiusZ - 1.5}
                y={5.7}
                height={secondHeight}
                segments={48}
                openingWidth={32}
            />


            {/* =========================================================
                FLOOR SEPARATION
            ========================================================= */}

            <CurvedRing
                radiusX={outerRadiusX + 0.5}
                radiusZ={outerRadiusZ + 0.5}
                y={5.55}
                thickness={0.42}
            />


            {/* =========================================================
                TOP EDGE
            ========================================================= */}

            <CurvedRing
                radiusX={outerRadiusX}
                radiusZ={outerRadiusZ}
                y={10.55}
                thickness={0.38}
            />


            {/* =========================================================
                EXTERIOR VERTICAL COLUMNS
            ========================================================= */}

            <CurvedColumns
                radiusX={outerRadiusX - 1}
                radiusZ={outerRadiusZ - 1}
                y={0}
                height={10.5}
                segments={24}
            />


            {/* =========================================================
                ENTRANCE CANOPY
            ========================================================= */}

            <EntranceCanopy />


            {/* =========================================================
                Entrance side pillars
            ========================================================= */}

            <mesh position={[-15, 5.0, -57]}>
                <boxGeometry args={[0.45, 10, 0.45]} />

                <meshStandardMaterial
                    color="#4b5563"
                    metalness={0.85}
                    roughness={0.2}
                />
            </mesh>

            <mesh position={[15, 5.0, -57]}>
                <boxGeometry args={[0.45, 10, 0.45]} />

                <meshStandardMaterial
                    color="#4b5563"
                    metalness={0.85}
                    roughness={0.2}
                />
            </mesh>


            {/* =========================================================
                Small entrance top beam
            ========================================================= */}

            <mesh position={[0, 9.7, -57]}>
                <boxGeometry args={[30, 0.45, 0.55]} />

                <meshStandardMaterial
                    color="#202633"
                    metalness={0.8}
                    roughness={0.25}
                />
            </mesh>

        </group>
    );
}