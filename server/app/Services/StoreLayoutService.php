<?php

namespace App\Services;

use App\Core\Database;
use RuntimeException;

class StoreLayoutService
{
    /**
     * تأكيد إن الـ vendor هو صاحب المحل
     */
    private function verifyStoreOwnership(
        array $authUser,
        int $storeId
    ): array {

        if (($authUser['account_type'] ?? null) !== 'vendor') {
            throw new RuntimeException(
                'Only vendor accounts can manage store layout',
                403
            );
        }

        $vendorId = $authUser['vendor_id'] ?? null;

        if (!$vendorId) {
            throw new RuntimeException(
                'Vendor account is not linked to a company',
                403
            );
        }

        $db = Database::connection();

        $stmt = $db->prepare("
            SELECT
    s.*,
    l.width,
    l.depth,
    l.height,
    l.position_x,
    l.position_y,
    l.position_z,
    l.rotation,
    l.scale,
    l.floor_id,
    l.mall_id,
    l.location_id
FROM shop_vendors_stores s
LEFT JOIN shop_store_locations l
    ON l.store_id = s.store_id
WHERE s.store_id = ?
LIMIT 1
        ");

        $stmt->execute([$storeId]);

        $store = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$store) {
            throw new RuntimeException(
                'Store not found',
                404
            );
        }

        if ((int)$store['Vendors_com_id'] !== (int)$vendorId) {
            throw new RuntimeException(
                'You are not authorized to manage this store',
                403
            );
        }

        return $store;
    }

    /**
     * GET layout
     */
    public function getLayout(
        array $authUser,
        int $storeId
    ): array {

        $store = $this->verifyStoreOwnership(
            $authUser,
            $storeId
        );

        $db = Database::connection();

        $stmt = $db->prepare("
            SELECT
                id,
                store_id,
                item_type,

                position_x,
                position_y,
                position_z,

                rotation_x,
                rotation_y,
                rotation_z,

                width,
                height,
                depth,

                created_at,
                updated_at

            FROM store_layout_items

            WHERE store_id = ?

            ORDER BY id ASC
        ");

        $stmt->execute([$storeId]);

        return [
            'store' => $store,
            'items' => $stmt->fetchAll(\PDO::FETCH_ASSOC)
        ];
    }

    /**
     * إضافة عنصر جديد للمحل
     */
    public function createItem(
        array $authUser,
        int $storeId,
        array $data
    ): array {

        $this->verifyStoreOwnership(
            $authUser,
            $storeId
        );

        $allowedTypes = [
            'shelf',
            'counter',
            'display',
            'table',
            'wall_display'
        ];

        $itemType = $data['item_type'] ?? null;

        if (!in_array($itemType, $allowedTypes, true)) {
            throw new RuntimeException(
                'Invalid item_type',
                422
            );
        }

        $db = Database::connection();

        $stmt = $db->prepare("
            INSERT INTO store_layout_items (
                store_id,
                item_type,

                position_x,
                position_y,
                position_z,

                rotation_x,
                rotation_y,
                rotation_z,

                width,
                height,
                depth
            )

            VALUES (
                ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?
            )
        ");

        $stmt->execute([
            $storeId,
            $itemType,

            (float)($data['position_x'] ?? 0),
            (float)($data['position_y'] ?? 0),
            (float)($data['position_z'] ?? 0),

            (float)($data['rotation_x'] ?? 0),
            (float)($data['rotation_y'] ?? 0),
            (float)($data['rotation_z'] ?? 0),

            (float)($data['width'] ?? 1),
            (float)($data['height'] ?? 1),
            (float)($data['depth'] ?? 1),
        ]);

        $itemId = (int)$db->lastInsertId();

        return $this->findItem(
            $authUser,
            $storeId,
            $itemId
        );
    }

    /**
     * تعديل عنصر
     */
    public function updateItem(
        array $authUser,
        int $storeId,
        int $itemId,
        array $data
    ): array {

        $this->verifyStoreOwnership(
            $authUser,
            $storeId
        );

        $db = Database::connection();

        $check = $db->prepare("
            SELECT *
            FROM store_layout_items
            WHERE id = ?
            AND store_id = ?
            LIMIT 1
        ");

        $check->execute([
            $itemId,
            $storeId
        ]);

        $item = $check->fetch(\PDO::FETCH_ASSOC);

        if (!$item) {
            throw new RuntimeException(
                'Layout item not found',
                404
            );
        }

        $allowedFields = [
            'item_type',
            'position_x',
            'position_y',
            'position_z',
            'rotation_x',
            'rotation_y',
            'rotation_z',
            'width',
            'height',
            'depth'
        ];

        $updates = [];
        $values = [];

        foreach ($allowedFields as $field) {

            if (!array_key_exists($field, $data)) {
                continue;
            }

            if ($field === 'item_type') {

                $allowedTypes = [
                    'shelf',
                    'counter',
                    'display',
                    'table',
                    'wall_display'
                ];

                if (
                    !in_array(
                        $data[$field],
                        $allowedTypes,
                        true
                    )
                ) {
                    throw new RuntimeException(
                        'Invalid item_type',
                        422
                    );
                }

                $updates[] = "{$field} = ?";
                $values[] = $data[$field];

                continue;
            }

            $updates[] = "{$field} = ?";
            $values[] = (float)$data[$field];
        }

        if (empty($updates)) {
            return $item;
        }

        $values[] = $itemId;
        $values[] = $storeId;

        $sql = "
            UPDATE store_layout_items
            SET " . implode(', ', $updates) . "
            WHERE id = ?
            AND store_id = ?
        ";

        $stmt = $db->prepare($sql);

        $stmt->execute($values);

        return $this->findItem(
            $authUser,
            $storeId,
            $itemId
        );
    }

    /**
     * حذف عنصر
     */
    public function deleteItem(
        array $authUser,
        int $storeId,
        int $itemId
    ): bool {

        $this->verifyStoreOwnership(
            $authUser,
            $storeId
        );

        $db = Database::connection();

        $stmt = $db->prepare("
            DELETE FROM store_layout_items

            WHERE id = ?
            AND store_id = ?
        ");

        $stmt->execute([
            $itemId,
            $storeId
        ]);

        if ($stmt->rowCount() === 0) {
            throw new RuntimeException(
                'Layout item not found',
                404
            );
        }

        return true;
    }

    /**
     * جلب عنصر واحد
     */
    private function findItem(
        array $authUser,
        int $storeId,
        int $itemId
    ): array {

        $this->verifyStoreOwnership(
            $authUser,
            $storeId
        );

        $db = Database::connection();

        $stmt = $db->prepare("
            SELECT *
            FROM store_layout_items

            WHERE id = ?
            AND store_id = ?

            LIMIT 1
        ");

        $stmt->execute([
            $itemId,
            $storeId
        ]);

        $item = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$item) {
            throw new RuntimeException(
                'Layout item not found',
                404
            );
        }

        return $item;
    }
}