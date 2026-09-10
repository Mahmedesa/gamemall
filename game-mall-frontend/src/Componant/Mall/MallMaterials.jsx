import * as THREE from "three";

export const mallMaterials = {
    floor: new THREE.MeshStandardMaterial({
        color: "#d8d8dc",
        roughness: 0.65,
        metalness: 0.08,
    }),

    floorTile: new THREE.MeshStandardMaterial({
        color: "#eeeeee",
        roughness: 0.55,
        metalness: 0.05,
    }),

    corridor: new THREE.MeshStandardMaterial({
    color: "#eeeeef",
    roughness: 0.65,
    metalness: 0.08,
}),

    storeBody: new THREE.MeshStandardMaterial({
        color: "#24243a",
        roughness: 0.55,
        metalness: 0.2,
    }),

    storeGlass: new THREE.MeshPhysicalMaterial({
        color: "#8ddcff",
        transparent: true,
        opacity: 0.35,
        roughness: 0.12,
        metalness: 0.45,
        transmission: 0.2,
    }),

    storeFrame: new THREE.MeshStandardMaterial({
        color: "#17172a",
        roughness: 0.25,
        metalness: 0.8,
    }),

    storeBase: new THREE.MeshStandardMaterial({
        color: "#303047",
        roughness: 0.45,
        metalness: 0.35,
    }),

    atriumFloor: new THREE.MeshStandardMaterial({
        color: "#f1f1f3",
        roughness: 0.45,
        metalness: 0.08,
    }),

    atriumBorder: new THREE.MeshStandardMaterial({
        color: "#9da3ad",
        roughness: 0.4,
        metalness: 0.3,
    }),

    railingMetal: new THREE.MeshStandardMaterial({
        color: "#7d8793",
        roughness: 0.25,
        metalness: 0.75,
    }),

    railingGlass: new THREE.MeshPhysicalMaterial({
        color: "#b9e6ff",
        transparent: true,
        opacity: 0.28,
        roughness: 0.05,
        metalness: 0.15,
        transmission: 0.15,
    }),

    facadeGlass: new THREE.MeshPhysicalMaterial({
        color: "#9edfff",
        transparent: true,
        opacity: 0.28,
        roughness: 0.08,
        metalness: 0.45,
        transmission: 0.2,
    }),

    facadeFrame: new THREE.MeshStandardMaterial({
        color: "#4b5563",
        roughness: 0.25,
        metalness: 0.8,
    }),

    darkMetal: new THREE.MeshStandardMaterial({
        color: "#202633",
        roughness: 0.3,
        metalness: 0.7,
    }),

    lightMetal: new THREE.MeshStandardMaterial({
        color: "#c7cbd1",
        roughness: 0.55,
        metalness: 0.15,
    }),
};