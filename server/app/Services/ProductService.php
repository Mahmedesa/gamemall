<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Store;
use App\Models\Department;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Brand;
use App\Core\Database;
use RuntimeException;

class ProductService
{
    private Product $product;
    private Store $store;
    private Department $department;
    private Category $category;
    private SubCategory $subCategory;
    private Brand $brand;

    public function __construct()
    {
        $this->product = new Product();
        $this->store = new Store();
        $this->department = new Department();
        $this->category = new Category();
        $this->subCategory = new SubCategory();
        $this->brand = new Brand();
    }

    /**
     * التأكد إن الـ department/category/subcategory/brand المبعوتة
     * (لو اتبعتت) موجودة فعلاً في الداتا بيز، وإن الهرم بينها متناسق
     * (category تابع لنفس الـ department، subcategory تابع لنفس الـ category).
     *
     * $effectiveIds: القيم النهائية بعد الدمج مع القديم (لو تعديل) أو
     * القيم المبعوتة مباشرة (لو إنشاء جديد).
     */
    private function validateTaxonomy(array $effectiveIds): void
    {
        $departmentId = $effectiveIds['product_department_id'] ?? null;
        $categoryId = $effectiveIds['product_category_id'] ?? null;
        $subcategoryId = $effectiveIds['subcategory_id'] ?? null;
        $brandId = $effectiveIds['brand_id'] ?? null;

        $categoryRow = null;
        $subcategoryRow = null;

        if ($departmentId !== null) {

            if (!$this->department->find((int) $departmentId)) {
                throw new RuntimeException(
                    'product_department_id does not exist',
                    422
                );
            }
        }

        if ($categoryId !== null) {

            $categoryRow = $this->category->find((int) $categoryId);

            if (!$categoryRow) {
                throw new RuntimeException(
                    'product_category_id does not exist',
                    422
                );
            }

            if (
                $departmentId !== null &&
                (int) $categoryRow['product_department_id'] !==
                    (int) $departmentId
            ) {
                throw new RuntimeException(
                    'product_category_id does not belong to the ' .
                        'given product_department_id',
                    422
                );
            }
        }

        if ($subcategoryId !== null) {

            $subcategoryRow = $this->subCategory->find(
                (int) $subcategoryId
            );

            if (!$subcategoryRow) {
                throw new RuntimeException(
                    'subcategory_id does not exist',
                    422
                );
            }

            if (
                $categoryId !== null &&
                (int) $subcategoryRow['product_category_id'] !==
                    (int) $categoryId
            ) {
                throw new RuntimeException(
                    'subcategory_id does not belong to the given ' .
                        'product_category_id',
                    422
                );
            }
        }

        if ($brandId !== null) {

            if (!$this->brand->find((int) $brandId)) {
                throw new RuntimeException(
                    'brand_id does not exist',
                    422
                );
            }
        }
    }

    /**
     * التأكد إن الحساب الحالي "vendor" وإرجاع الـ Vendors_com_id بتاعه
     */
    private function currentVendorId(array $authUser): int
    {
        if (($authUser['account_type'] ?? null) !== 'vendor') {
            throw new RuntimeException(
                'Only vendor accounts can manage products',
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
     * التأكد إن المحل ده موجود وفعلاً ملك الـ vendor الحالي
     * وإرجاع بياناته لو تمام
     */
    private function assertStoreOwnedByVendor(
        int $storeId,
        int $vendorId
    ): array {

        $store = $this->store->find($storeId);

        if (!$store) {
            throw new RuntimeException(
                'Store not found',
                404
            );
        }

        if ((int) $store['Vendors_com_id'] !== $vendorId) {
            throw new RuntimeException(
                'You are not authorized to manage this store',
                403
            );
        }

        return $store;
    }

    /**
     * التأكد إن المنتج موجود وإن المحل بتاعه ملك الـ vendor الحالي
     * (منتج -> محل -> فيندور)
     */
    private function assertProductOwnedByVendor(
        int $productId,
        int $vendorId
    ): array {

        $product = $this->product->find($productId);

        if (!$product) {
            throw new RuntimeException(
                'Product not found',
                404
            );
        }

        if (empty($product['store_id'])) {
            throw new RuntimeException(
                'Product is not linked to any store',
                403
            );
        }

        $this->assertStoreOwnedByVendor(
            (int) $product['store_id'],
            $vendorId
        );

        return $product;
    }

    /**
     * جلب منتجات محل معين (بشرط إن المحل ملك الـ vendor الحالي)
     */
    public function listByStore(array $authUser, int $storeId): array
    {
        $vendorId = $this->currentVendorId($authUser);

        $this->assertStoreOwnedByVendor($storeId, $vendorId);

        return $this->product
            ->where('store_id', '=', $storeId)
            ->get();
    }

    /**
     * عرض منتج واحد، بشرط إن محله ملك الـ vendor الحالي
     */
    public function show(array $authUser, int $productId): array
    {
        $vendorId = $this->currentVendorId($authUser);

        return $this->assertProductOwnedByVendor(
            $productId,
            $vendorId
        );
    }

    /**
     * إنشاء منتج جديد داخل محل يملكه الـ vendor الحالي
     */
    public function create(array $authUser, array $data): array
    {
        $vendorId = $this->currentVendorId($authUser);

        $storeId = $data['store_id'] ?? null;

        if (
            $storeId === null ||
            filter_var($storeId, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                'A valid store_id is required',
                422
            );
        }

        $storeId = (int) $storeId;

        /*
         * التأكد إن المحل المطلوب الإضافة له فعلاً ملك الـ vendor الحالي
         */
        $this->assertStoreOwnedByVendor($storeId, $vendorId);

        $nameAr = trim((string) ($data['product_name_ar'] ?? ''));
        $nameEn = trim((string) ($data['product_name_en'] ?? ''));

        if ($nameAr === '' && $nameEn === '') {
            throw new RuntimeException(
                'Product name (Arabic or English) is required',
                422
            );
        }

        if (
            isset($data['selling_price']) &&
            !is_numeric($data['selling_price'])
        ) {
            throw new RuntimeException(
                'Selling price must be numeric',
                422
            );
        }

        $this->validateTaxonomy([
            'product_department_id' =>
                $data['product_department_id'] ?? null,
            'product_category_id' =>
                $data['product_category_id'] ?? null,
            'subcategory_id' => $data['subcategory_id'] ?? null,
            'brand_id' => $data['brand_id'] ?? null
        ]);

        $db = Database::connection();

        try {

            $db->beginTransaction();

            $productData = [
                'barcode' => $data['barcode'] ?? null,
                'store_id' => $storeId,
                'sku' => $data['sku'] ?? null,
                'product_name_ar' => $nameAr !== '' ? $nameAr : null,
                'product_name_en' => $nameEn !== '' ? $nameEn : null,
                'product_department_id' => $data['product_department_id'] ?? null,
                'product_category_id' => $data['product_category_id'] ?? null,
                'subcategory_id' => $data['subcategory_id'] ?? null,
                'brand_id' => $data['brand_id'] ?? null,
                'unit_id' => $data['unit_id'] ?? null,
                'description_ar' => $data['description_ar'] ?? null,
                'description_en' => $data['description_en'] ?? null,
                'purchase_price' => $data['purchase_price'] ?? null,
                'selling_price' => $data['selling_price'] ?? null,
                'cost_price' => $data['cost_price'] ?? null,
                'vat' => $data['vat'] ?? null,
                'weight' => $data['weight'] ?? null,
                'width' => $data['width'] ?? null,
                'height' => $data['height'] ?? null,
                'length' => $data['length'] ?? null,
                'stock_quantity' => $data['stock_quantity'] ?? null,
                'min_stock' => $data['min_stock'] ?? null,
                'max_stock' => $data['max_stock'] ?? null,
                'image' => $data['image'] ?? null,
                'is_featured' => $data['is_featured'] ?? 0,
                'is_active' => $data['is_active'] ?? 1
            ];

            $this->product->create($productData);

            $productId = (int) $db->lastInsertId();

            $db->commit();

            return $this->product->find($productId);

        } catch (\Throwable $e) {

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $e;
        }
    }

    /**
     * تعديل منتج، بشرط إن محله (الحالي) ملك الـ vendor الحالي.
     * لو اليوزر حاول ينقل المنتج لمحل تاني (store_id جديد)، لازم نتأكد
     * إن المحل الجديد ده كمان ملك نفس الـ vendor، وإلا العملية مرفوضة.
     */
    public function update(
        array $authUser,
        int $productId,
        array $data
    ): array {

        $vendorId = $this->currentVendorId($authUser);

        /*
         * تأكيد إن المنتج الحالي ملك الـ vendor عن طريق محله الحالي
         */
        $existingProduct = $this->assertProductOwnedByVendor(
            $productId,
            $vendorId
        );

        $taxonomyKeys = [
            'product_department_id',
            'product_category_id',
            'subcategory_id',
            'brand_id'
        ];

        $taxonomyChanged = false;

        foreach ($taxonomyKeys as $key) {
            if (array_key_exists($key, $data)) {
                $taxonomyChanged = true;
                break;
            }
        }

        if ($taxonomyChanged) {

            $effectiveTaxonomy = [];

            foreach ($taxonomyKeys as $key) {
                $effectiveTaxonomy[$key] = array_key_exists($key, $data)
                    ? $data[$key]
                    : ($existingProduct[$key] ?? null);
            }

            $this->validateTaxonomy($effectiveTaxonomy);
        }

        $updateData = [];

        /*
         * لو فيه محاولة لتغيير store_id، لازم نتأكد إن المحل الجديد
         * برضو ملك نفس الـ vendor - وإلا ده يبقى محاولة نقل منتج
         * لمحل فيندور تاني، وده ممنوع.
         */
        if (array_key_exists('store_id', $data)) {

            $newStoreId = $data['store_id'];

            if (
                $newStoreId === null ||
                filter_var($newStoreId, FILTER_VALIDATE_INT) === false
            ) {
                throw new RuntimeException(
                    'A valid store_id is required',
                    422
                );
            }

            $newStoreId = (int) $newStoreId;

            $this->assertStoreOwnedByVendor($newStoreId, $vendorId);

            $updateData['store_id'] = $newStoreId;
        }

        if (array_key_exists('product_name_ar', $data)) {
            $updateData['product_name_ar'] =
                trim((string) $data['product_name_ar']) ?: null;
        }

        if (array_key_exists('product_name_en', $data)) {
            $updateData['product_name_en'] =
                trim((string) $data['product_name_en']) ?: null;
        }

        /*
         * التأكد إن الاسم مش هيبقى فاضي تمامًا بعد التعديل
         */
        if (
            (array_key_exists('product_name_ar', $updateData) ||
                array_key_exists('product_name_en', $updateData))
        ) {

            $finalAr = array_key_exists('product_name_ar', $updateData)
                ? $updateData['product_name_ar']
                : ($existingProduct['product_name_ar'] ?? null);

            $finalEn = array_key_exists('product_name_en', $updateData)
                ? $updateData['product_name_en']
                : ($existingProduct['product_name_en'] ?? null);

            if (empty($finalAr) && empty($finalEn)) {
                throw new RuntimeException(
                    'Product name (Arabic or English) is required',
                    422
                );
            }
        }

        if (
            array_key_exists('selling_price', $data) &&
            $data['selling_price'] !== null &&
            !is_numeric($data['selling_price'])
        ) {
            throw new RuntimeException(
                'Selling price must be numeric',
                422
            );
        }

        $simpleFields = [
            'barcode',
            'sku',
            'product_department_id',
            'product_category_id',
            'subcategory_id',
            'brand_id',
            'unit_id',
            'description_ar',
            'description_en',
            'purchase_price',
            'selling_price',
            'cost_price',
            'vat',
            'weight',
            'width',
            'height',
            'length',
            'stock_quantity',
            'min_stock',
            'max_stock',
            'image',
            'is_featured',
            'is_active'
        ];

        foreach ($simpleFields as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (!empty($updateData)) {
            $this->product->update($productId, $updateData);
        }

        return $this->product->find($productId);
    }

    /**
     * حذف منتج، بشرط إن محله ملك الـ vendor الحالي
     */
    public function delete(array $authUser, int $productId): bool
    {
        $vendorId = $this->currentVendorId($authUser);

        $this->assertProductOwnedByVendor($productId, $vendorId);

        return $this->product->delete($productId);
    }
}