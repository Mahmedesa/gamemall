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
                s.store_code,

                /*
                 * IMPORTANT:
                 * The store is owned by the mall.
                 * Vendors are tenants.
                 *
                 * So we do NOT use s.Vendors_com_id
                 * as the current tenant.
                 */

                s.shop_name,
                s.floor_num,
                s.shop_logo,
                s.shop_specializes,
                s.is_active,
                s.store_status,

                /*
                 * Current active tenant
                 */
                sva.Vendors_com_id AS current_vendor_id,

                /*
                 * Current assignment
                 */
                sva.assignment_id AS current_assignment_id,
                sva.start_date AS current_assignment_start_date,

                /*
                 * Store location
                 */
                l.id AS location_record_id,
                l.location_id,
                l.floor_id,
                l.mall_id,
                l.position_x,
                l.position_y,
                l.position_z,
                l.rotation,
                l.scale,

                /*
                 * Store dimensions
                 */
                l.width,
                l.depth,
                l.height

            FROM shop_vendors_stores s

            INNER JOIN shop_store_locations l
                ON l.store_id = s.store_id

            LEFT JOIN shop_store_vendor_assignments sva
                ON sva.store_id = s.store_id
                AND sva.assignment_status = 'ACTIVE'

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
                s.store_code,

                /*
                 * IMPORTANT:
                 * Vendor is a tenant, not the owner of the store.
                 */

                s.shop_name,
                s.floor_num,
                s.shop_logo,
                s.shop_specializes,
                s.is_active,
                s.store_status,

                /*
                 * Current active tenant
                 */
                sva.Vendors_com_id AS current_vendor_id,

                /*
                 * Current assignment
                 */
                sva.assignment_id AS current_assignment_id,
                sva.start_date AS current_assignment_start_date,

                /*
                 * Store location
                 */
                l.id AS location_record_id,
                l.location_id,
                l.floor_id,
                l.mall_id,
                l.position_x,
                l.position_y,
                l.position_z,
                l.rotation,
                l.scale,

                /*
                 * Store dimensions
                 */
                l.width,
                l.depth,
                l.height

            FROM shop_vendors_stores s

            INNER JOIN shop_store_locations l
                ON l.store_id = s.store_id

            LEFT JOIN shop_store_vendor_assignments sva
                ON sva.store_id = s.store_id
                AND sva.assignment_status = 'ACTIVE'

            WHERE
                s.is_active = 1
                AND l.floor_id = :floor_id

            ORDER BY
                s.store_id ASC
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
    /**
 * Check whether the authenticated user can access a store
 */
public function checkStoreAccess(int $storeId): array
{
    $db = Database::connection();

    $sql = "
        SELECT
            s.store_id,
            s.store_code,
            s.shop_name,
            s.floor_num,
            s.is_active,
            s.store_status,

            sva.assignment_id AS current_assignment_id,
            sva.Vendors_com_id AS current_vendor_id,
            sva.start_date AS current_assignment_start_date

        FROM shop_vendors_stores s

        LEFT JOIN shop_store_vendor_assignments sva
            ON sva.store_id = s.store_id
            AND sva.assignment_status = 'ACTIVE'

        WHERE s.store_id = :store_id

        LIMIT 1
    ";

    $stmt = $db->prepare($sql);

    $stmt->execute([
        'store_id' => $storeId
    ]);

    $store = $stmt->fetch();

    if (!$store) {
        throw new RuntimeException(
            'Store not found',
            404
        );
    }

    if ((int) $store['is_active'] !== 1) {
        return [
            'store_id' => (int) $store['store_id'],
            'store_code' => $store['store_code'],
            'store_name' => $store['shop_name'],
            'store_status' => $store['store_status'],
            'can_enter' => false,
            'can_open_rental' => false,
            'access_type' => 'none',
            'message' => 'This store is inactive'
        ];
    }

    $user = \App\Core\Auth::user();

    if (!$user) {
        throw new RuntimeException(
            'Authentication required',
            401
        );
    }

    $accountType = $user['account_type'] ?? null;
    $vendorId = isset($user['vendor_id'])
        ? (int) $user['vendor_id']
        : null;

    $storeStatus = $store['store_status'];

    /*
     * AVAILABLE
     *
     * Nobody can enter the store as a tenant.
     * A vendor can start the rental process.
     */
    if ($storeStatus === 'AVAILABLE') {

        if ($accountType === 'vendor') {
            return [
                'store_id' => (int) $store['store_id'],
                'store_code' => $store['store_code'],
                'store_name' => $store['shop_name'],
                'store_status' => $storeStatus,

                'can_enter' => false,
                'can_open_rental' => true,

                'access_type' => 'rental',
                'message' => 'This store is available for rental'
            ];
        }

        return [
            'store_id' => (int) $store['store_id'],
            'store_code' => $store['store_code'],
            'store_name' => $store['shop_name'],
            'store_status' => $storeStatus,

            'can_enter' => false,
            'can_open_rental' => false,

            'access_type' => 'none',
            'message' => 'This store is currently available for rental'
        ];
    }

    /*
     * INACTIVE
     */
    if ($storeStatus === 'INACTIVE') {

        return [
            'store_id' => (int) $store['store_id'],
            'store_code' => $store['store_code'],
            'store_name' => $store['shop_name'],
            'store_status' => $storeStatus,

            'can_enter' => false,
            'can_open_rental' => false,

            'access_type' => 'none',
            'message' => 'This store is inactive'
        ];
    }

    /*
     * OCCUPIED
     */
    if ($storeStatus === 'OCCUPIED') {

        $currentVendorId = $store['current_vendor_id'] !== null
            ? (int) $store['current_vendor_id']
            : null;

        /*
         * Customer can enter an occupied store.
         */
        if ($accountType === 'customer') {

            return [
                'store_id' => (int) $store['store_id'],
                'store_code' => $store['store_code'],
                'store_name' => $store['shop_name'],
                'store_status' => $storeStatus,

                'can_enter' => true,
                'can_open_rental' => false,

                'access_type' => 'customer',
                'message' => 'Customer can enter this store'
            ];
        }

        /*
         * Current tenant vendor can enter/manage the store.
         */
        if (
            $accountType === 'vendor' &&
            $vendorId !== null &&
            $currentVendorId !== null &&
            $vendorId === $currentVendorId
        ) {

            return [
                'store_id' => (int) $store['store_id'],
                'store_code' => $store['store_code'],
                'store_name' => $store['shop_name'],
                'store_status' => $storeStatus,

                'can_enter' => true,
                'can_open_rental' => false,

                'access_type' => 'tenant',
                'message' => 'Current tenant can enter this store'
            ];
        }

        /*
         * Another vendor cannot enter another vendor's store.
         */
        if ($accountType === 'vendor') {

            return [
                'store_id' => (int) $store['store_id'],
                'store_code' => $store['store_code'],
                'store_name' => $store['shop_name'],
                'store_status' => $storeStatus,

                'can_enter' => false,
                'can_open_rental' => false,

                'access_type' => 'none',
                'message' => 'This store is occupied by another vendor'
            ];
        }

        return [
            'store_id' => (int) $store['store_id'],
            'store_code' => $store['store_code'],
            'store_name' => $store['shop_name'],
            'store_status' => $storeStatus,

            'can_enter' => false,
            'can_open_rental' => false,

            'access_type' => 'none',
            'message' => 'You cannot enter this store'
        ];
    }

    throw new RuntimeException(
        'Unknown store status',
        409
    );
}
}