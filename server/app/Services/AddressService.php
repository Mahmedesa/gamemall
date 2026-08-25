<?php

namespace App\Services;

use App\Models\CustomerAddress;
use App\Core\Database;
use RuntimeException;

class AddressService
{
    private CustomerAddress $address;

    public function __construct()
    {
        $this->address = new CustomerAddress();
    }

    /**
     * التأكد إن الحساب الحالي "customer" وإرجاع الـ cus_id بتاعه
     */
    private function currentCustomerId(array $authUser): int
    {
        if (($authUser['account_type'] ?? null) !== 'customer') {
            throw new RuntimeException(
                'Only customer accounts can manage addresses',
                403
            );
        }

        $customerId = $authUser['customer_id'] ?? null;

        if (!$customerId) {
            throw new RuntimeException(
                'Customer account is not linked properly',
                403
            );
        }

        return (int) $customerId;
    }

    /**
     * التأكد إن العنوان موجود وملك الكاستومر الحالي، وإرجاعه
     */
    private function assertOwnedByCustomer(
        int $addressId,
        int $customerId
    ): array {

        $address = $this->address->find($addressId);

        if (!$address) {
            throw new RuntimeException(
                'Address not found',
                404
            );
        }

        if ((int) $address['cus_id'] !== $customerId) {
            throw new RuntimeException(
                'You are not authorized to access this address',
                403
            );
        }

        return $address;
    }

    /**
     * كل عناوين الكاستومر الحالي
     */
    public function list(array $authUser): array
    {
        $customerId = $this->currentCustomerId($authUser);

        return $this->address
            ->where('cus_id', '=', $customerId)
            ->get();
    }

    /**
     * عرض عنوان واحد (لازم يكون ملك الكاستومر الحالي)
     */
    public function show(array $authUser, int $addressId): array
    {
        $customerId = $this->currentCustomerId($authUser);

        return $this->assertOwnedByCustomer($addressId, $customerId);
    }

    /**
     * إضافة عنوان جديد للكاستومر الحالي
     */
    public function create(array $authUser, array $data): array
    {
        $customerId = $this->currentCustomerId($authUser);

        $fullAddress = trim((string) ($data['full_address'] ?? ''));

        if ($fullAddress === '') {
            throw new RuntimeException(
                'full_address is required',
                422
            );
        }

        $db = Database::connection();

        $this->address->create([
            'address_name' => $data['address_name'] ?? null,
            'gov_id' => $data['gov_id'] ?? null,
            'city_id' => $data['city_id'] ?? null,
            'full_address' => $fullAddress,
            'zip_code' => $data['zip_code'] ?? null,
            'cus_id' => $customerId
        ]);

        $addressId = (int) $db->lastInsertId();

        return $this->address->find($addressId);
    }

    /**
     * تعديل عنوان (لازم يكون ملك الكاستومر الحالي)
     */
    public function update(
        array $authUser,
        int $addressId,
        array $data
    ): array {

        $customerId = $this->currentCustomerId($authUser);

        $this->assertOwnedByCustomer($addressId, $customerId);

        $updateData = [];

        if (array_key_exists('address_name', $data)) {
            $updateData['address_name'] = $data['address_name'];
        }

        if (array_key_exists('gov_id', $data)) {
            $updateData['gov_id'] = $data['gov_id'];
        }

        if (array_key_exists('city_id', $data)) {
            $updateData['city_id'] = $data['city_id'];
        }

        if (array_key_exists('full_address', $data)) {

            $fullAddress = trim((string) $data['full_address']);

            if ($fullAddress === '') {
                throw new RuntimeException(
                    'full_address cannot be empty',
                    422
                );
            }

            $updateData['full_address'] = $fullAddress;
        }

        if (array_key_exists('zip_code', $data)) {
            $updateData['zip_code'] = $data['zip_code'];
        }

        if (!empty($updateData)) {
            $this->address->update($addressId, $updateData);
        }

        return $this->address->find($addressId);
    }

    /**
     * حذف عنوان (لازم يكون ملك الكاستومر الحالي)
     */
    public function delete(array $authUser, int $addressId): bool
    {
        $customerId = $this->currentCustomerId($authUser);

        $this->assertOwnedByCustomer($addressId, $customerId);

        return $this->address->delete($addressId);
    }
}