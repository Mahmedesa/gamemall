export function createStoreLayout(store) {
    const width = store.width || 6;
    const depth = store.depth || 10;

    const shelfWidth = Math.min(
        Math.max(width * 0.38, 1.8),
        2.6
    );

    const counterWidth = Math.min(
        Math.max(width * 0.42, 1.8),
        2.8
    );

    return {
        shelves: [
            {
                id: "left-back",
                position: [
                    -width / 2 + 0.9,
                    0,
                    -depth / 2 + 1.8,
                ],
                rotation: Math.PI / 2,
                width: shelfWidth,
            },

            {
                id: "left-front",
                position: [
                    -width / 2 + 0.9,
                    0,
                    1.5,
                ],
                rotation: Math.PI / 2,
                width: shelfWidth,
            },

            {
                id: "right-back",
                position: [
                    width / 2 - 0.9,
                    0,
                    -depth / 2 + 1.8,
                ],
                rotation: -Math.PI / 2,
                width: shelfWidth,
            },

            {
                id: "right-front",
                position: [
                    width / 2 - 0.9,
                    0,
                    1.5,
                ],
                rotation: -Math.PI / 2,
                width: shelfWidth,
            },

            {
                id: "back-left",
                position: [
                    -width / 2 + 1.5,
                    0,
                    -depth / 2 + 0.8,
                ],
                rotation: 0,
                width: shelfWidth,
            },

            {
                id: "back-right",
                position: [
                    width / 2 - 1.5,
                    0,
                    -depth / 2 + 0.8,
                ],
                rotation: 0,
                width: shelfWidth,
            },
        ],

        counter: {
            position: [
                0,
                0,
                depth / 2 - 1.8,
            ],
            width: counterWidth,
            depth: 1.1,
        },
    };
}