// GameMall - 3D Mall Layout
// Based on the provided 2D architectural plans.
//
// Coordinate system:
// X = left / right
// Y = vertical height
// Z = front / back
//
// Center of the mall = central atrium
// Main entrance = negative Z direction

export const MALL_CONFIG = {
    width: 135,
    floors: 2,

    atrium: {
        width: 42,
        depth: 30,
    },

    groundFloor: {
        height: 5.5,
        corridorWidth: 8,
    },

    secondFloor: {
        height: 4.8,
        corridorWidth: 7,
    },

    entrance: {
        width: 12,
        depth: 5,
    },
};


// =====================================================
// STORE TYPES
// =====================================================

export const STORE_TYPES = {
    A: {
        name: "Type A",
        width: 6,
        depth: 10,
    },

    B: {
        name: "Type B",
        width: 8,
        depth: 12,
    },

    C: {
        name: "Type C",
        width: 10,
        depth: 15,
    },

    FLAGSHIP: {
        name: "Flagship",
        width: 12,
        depth: 16,
    },

    HERO: {
        name: "Hero",
        width: 15,
        depth: 18,
    },
};


// =====================================================
// GROUND FLOOR
// 21 STORES
// =====================================================

export const GROUND_FLOOR_STORES = [

    // Left side
    {
        id: "U-01",
        type: "A",
        side: "left",
    },
    {
        id: "U-02",
        type: "B",
        side: "left",
    },
    {
        id: "U-03",
        type: "A",
        side: "left",
    },
    {
        id: "U-04",
        type: "C",
        side: "left",
    },
    {
        id: "U-05",
        type: "A",
        side: "left",
    },
    {
        id: "U-06",
        type: "B",
        side: "left",
    },
    {
        id: "U-07",
        type: "A",
        side: "left",
    },
    {
        id: "U-08",
        type: "B",
        side: "left",
    },
    {
        id: "U-09",
        type: "A",
        side: "left",
    },

    // Right side
    {
        id: "U-10",
        type: "A",
        side: "right",
    },
    {
        id: "U-11",
        type: "B",
        side: "right",
    },
    {
        id: "U-12",
        type: "A",
        side: "right",
    },
    {
        id: "U-13",
        type: "C",
        side: "right",
    },
    {
        id: "U-14",
        type: "A",
        side: "right",
    },
    {
        id: "U-15",
        type: "B",
        side: "right",
    },
    {
        id: "U-16",
        type: "A",
        side: "right",
    },
    {
        id: "U-17",
        type: "B",
        side: "right",
    },
    {
        id: "U-18",
        type: "A",
        side: "right",
    },

    // Premium / flagship area
    {
        id: "F-01",
        type: "FLAGSHIP",
        side: "back-left",
    },
    {
        id: "F-02",
        type: "HERO",
        side: "back-center",
    },
    {
        id: "F-03",
        type: "FLAGSHIP",
        side: "back-right",
    },
];


// =====================================================
// SECOND FLOOR
// 13 STORES
// =====================================================

export const SECOND_FLOOR_STORES = [

    {
        id: "UF-01",
        type: "A",
        side: "left",
    },
    {
        id: "UF-02",
        type: "B",
        side: "left",
    },
    {
        id: "UF-03",
        type: "A",
        side: "left",
    },
    {
        id: "UF-04",
        type: "B",
        side: "left",
    },
    {
        id: "UF-05",
        type: "A",
        side: "left",
    },

    {
        id: "UF-06",
        type: "A",
        side: "right",
    },
    {
        id: "UF-07",
        type: "B",
        side: "right",
    },
    {
        id: "UF-08",
        type: "A",
        side: "right",
    },
    {
        id: "UF-09",
        type: "B",
        side: "right",
    },
    {
        id: "UF-10",
        type: "A",
        side: "right",
    },

    {
        id: "PF-01",
        type: "FLAGSHIP",
        side: "back-left",
    },
    {
        id: "PF-02",
        type: "HERO",
        side: "back-center",
    },
    {
        id: "PF-03",
        type: "FLAGSHIP",
        side: "back-right",
    },
];


// =====================================================
// MALL ELEMENTS
// =====================================================

export const MALL_ELEMENTS = {

    fountain: {
        radius: 5,
        height: 0.4,
    },

    centralPlaza: {
        width: 42,
        depth: 30,
    },

    escalators: [
        {
            id: "ESC-L",
            side: "left",
        },
        {
            id: "ESC-R",
            side: "right",
        },
    ],

    cores: [
        {
            id: "CORE-L",
            side: "left",
        },
        {
            id: "CORE-R",
            side: "right",
        },
    ],

    entrance: {
        width: 12,
        position: [0, 0, -67],
    },
};