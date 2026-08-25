<?php

namespace App\Services;

use App\Models\Store;
use App\Core\Database;
use RuntimeException;

class StoreService
{
    private Store $store;

    public function __construct()
    {
        $this->store = new Store();
    }

    /**
     * التأكد إن الحساب الحالي "vendor" وإرجاع الـ Vendors_com_id بتاعه
     */
    private function currentVendorId(array $authUser): int
    {
        if (($authUser['account_type'] ?? null) !== 'vendor') {
            throw new RuntimeException(
                'Only vendor accounts can manage stores',
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

        return (int) $vendorId;
    }

    /**
     * جلب كل محلات الـ vendor الحالي فقط
     */
    public function listMyStores(array $authUser): array
    {
        $vendorId = $this->currentVendorId($authUser);

        return $this->store
            ->where('Vendors_com_id', '=', $vendorId)
            ->get();
    }

    /**
     * عرض محل واحد، بشرط إنه ملك الـ vendor الحالي
     */
    public function show(array $authUser, int $storeId): array
    {
        $vendorId = $this->currentVendorId($authUser);

        $store = $this->store->find($storeId);

        if (!$store) {
            throw new RuntimeException(
                'Store not found',
                404
            );
        }

        if ((int) $store['Vendors_com_id'] !== $vendorId) {
            throw new RuntimeException(
                'You are not authorized to access this store',
                403
            );
        }

        return $store;
    }

    /**
     * إنشاء محل جديد مرتبط تلقائيًا بالـ vendor الحالي
     * (Vendors_com_id بيتجاب من Auth::user() مش من الـ request أبدًا)
     */
    public function create(array $authUser, array $data): array
    {
        $vendorId = $this->currentVendorId($authUser);

        $shopName = trim($data['shop_name'] ?? '');

        if ($shopName === '') {
            throw new RuntimeException(
                'Shop name is required',
                422
            );
        }

        $floorNum = $data['floor_num'] ?? null;

        if (
            $floorNum !== null &&
            filter_var($floorNum, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                'Floor number must be an integer',
                422
            );
        }

        /*
         * التأكد إن اسم المحل مش متكرر (فيه UNIQUE KEY على shop_name في الداتا بيز)
         */
        if (
            $this->store
                ->where('shop_name', '=', $shopName)
                ->exists()
        ) {
            throw new RuntimeException(
                'Shop name already exists',
                422
            );
        }

        $db = Database::connection();

        try {

            $db->beginTransaction();

            $storeData = [
                'Vendors_com_id' => $vendorId,
                'shop_name' => $shopName,
                'floor_num' => $floorNum !== null ? (int) $floorNum : null,
                'shop_logo' => $data['shop_logo'] ?? null,
                'shop_specializes' => $data['shop_specializes'] ?? null,
                'is_active' => $data['is_active'] ?? 1
            ];

            $this->store->create($storeData);

            $storeId = (int) $db->lastInsertId();

            $db->commit();

            return $this->store->find($storeId);

        } catch (\Throwable $e) {

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $e;
        }
    }

    /**
     * تعديل محل، بشرط إنه ملك الـ vendor الحالي فقط
     * (مش بيسمح بتغيير Vendors_com_id عن طريق الـ request)
     */
    public function update(
        array $authUser,
        int $storeId,
        array $data
    ): array {

        $vendorId = $this->currentVendorId($authUser);

        $store = $this->store->find($storeId);

        if (!$store) {
            throw new RuntimeException(
                'Store not found',
                404
            );
        }

        if ((int) $store['Vendors_com_id'] !== $vendorId) {
            throw new RuntimeException(
                'You are not authorized to modify this store',
                403
            );
        }

        $updateData = [];

        if (array_key_exists('shop_name', $data)) {

            $shopName = trim((string) $data['shop_name']);

            if ($shopName === '') {
                throw new RuntimeException(
                    'Shop name cannot be empty',
                    422
                );
            }

            /*
             * التأكد إن الاسم الجديد مش مستخدم في محل تاني
             */
            $duplicate = $this->store
                ->where('shop_name', '=', $shopName)
                ->first();

            if (
                $duplicate &&
                (int) $duplicate['store_id'] !== $storeId
            ) {
                throw new RuntimeException(
                    'Shop name already exists',
                    422
                );
            }

            $updateData['shop_name'] = $shopName;
        }

        if (array_key_exists('floor_num', $data)) {

            $floorNum = $data['floor_num'];

            if (
                $floorNum !== null &&
                filter_var($floorNum, FILTER_VALIDATE_INT) === false
            ) {
                throw new RuntimeException(
                    'Floor number must be an integer',
                    422
                );
            }

            $updateData['floor_num'] =
                $floorNum !== null ? (int) $floorNum : null;
        }

        if (array_key_exists('shop_logo', $data)) {
            $updateData['shop_logo'] = $data['shop_logo'];
        }

        if (array_key_exists('shop_specializes', $data)) {
            $updateData['shop_specializes'] = $data['shop_specializes'];
        }

        if (array_key_exists('is_active', $data)) {
            $updateData['is_active'] = $data['is_active'];
        }

        /*
         * ملحوظة أمان: حتى لو اليوزر بعت Vendors_com_id في الـ body
         * بيتم تجاهله تمامًا، ودايمًا بيفضل قيمته الأصلية بتاعة صاحب المحل.
         */

        if (!empty($updateData)) {
            $this->store->update($storeId, $updateData);
        }

        return $this->store->find($storeId);
    }

    /**
     * حذف محل، بشرط إنه ملك الـ vendor الحالي فقط
     */
    public function delete(array $authUser, int $storeId): bool
    {
        $vendorId = $this->currentVendorId($authUser);

        $store = $this->store->find($storeId);

        if (!$store) {
            throw new RuntimeException(
                'Store not found',
                404
            );
        }

        if ((int) $store['Vendors_com_id'] !== $vendorId) {
            throw new RuntimeException(
                'You are not authorized to delete this store',
                403
            );
        }

        return $this->store->delete($storeId);
    }
}