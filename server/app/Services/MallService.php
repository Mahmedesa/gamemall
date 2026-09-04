<?php

namespace App\Services;

use App\Core\Database;
use App\Models\Mall;
use App\Models\MallFloor;
use RuntimeException;

class MallService
{
    private Mall $mall;
    private MallFloor $floor;

    public function __construct()
    {
        $this->mall = new Mall();
        $this->floor = new MallFloor();
    }

    /**
     * Get the mall world data
     */
    public function getMall(): array
    {
        $malls = $this->mall->all();

        $mall = $malls[0] ?? null;

        if (!$mall) {
            throw new RuntimeException(
                'Mall not found',
                404
            );
        }

        $floors = $this->floor
            ->where('mall_id', '=', $mall['mall_id'])
            ->orderBy('floor_id', 'ASC')
            ->get();

        $db = Database::connection();

        $sql = "
            SELECT
                s.store_id,
                s.Vendors_com_id,
                s.shop_name,
                s.floor_num,
                s.shop_logo,
                s.shop_specializes,
                s.is_active,

                l.id AS location_record_id,
                l.location_id,
                l.floor_id,
                l.mall_id,
                l.position_x,
                l.position_y,
                l.position_z,
                l.rotation,
                l.scale

            FROM shop_vendors_stores s

            INNER JOIN shop_store_locations l
                ON l.store_id = s.store_id

            WHERE
                s.is_active = 1
                AND l.mall_id = :mall_id

            ORDER BY
                l.floor_id ASC,
                s.store_id ASC
        ";

        $stmt = $db->prepare($sql);

        $stmt->execute([
            'mall_id' => (int) $mall['mall_id']
        ]);

        $stores = $stmt->fetchAll();

        return [
            'mall' => $mall,
            'floors' => $floors,
            'stores' => $stores
        ];
    }

    /**
     * Get one floor with its stores
     */
    public function getFloor(int $floorId): array
    {
        $floor = $this->floor->find($floorId);

        if (!$floor) {
            throw new RuntimeException(
                'Floor not found',
                404
            );
        }

        $db = Database::connection();

        $sql = "
            SELECT
                s.store_id,
                s.Vendors_com_id,
                s.shop_name,
                s.floor_num,
                s.shop_logo,
                s.shop_specializes,
                s.is_active,

                l.id AS location_record_id,
                l.location_id,
                l.floor_id,
                l.mall_id,
                l.position_x,
                l.position_y,
                l.position_z,
                l.rotation,
                l.scale

            FROM shop_vendors_stores s

            INNER JOIN shop_store_locations l
                ON l.store_id = s.store_id

            WHERE
                s.is_active = 1
                AND l.floor_id = :floor_id

            ORDER BY s.store_id ASC
        ";

        $stmt = $db->prepare($sql);

        $stmt->execute([
            'floor_id' => $floorId
        ]);

        return [
            'floor' => $floor,
            'stores' => $stmt->fetchAll()
        ];
    }
}