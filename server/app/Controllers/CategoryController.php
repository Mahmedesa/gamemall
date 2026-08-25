<?php

namespace App\Controllers;

use App\Models\Department;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Brand;
use App\Core\Response;
use Throwable;

/**
 * مسارات عامة (بدون تسجيل دخول) لعرض شجرة التصنيفات:
 * Department -> Category -> SubCategory
 * بالإضافة لـ Brand (مستقلة عن الشجرة)
 */
class CategoryController
{
    private Department $department;
    private Category $category;
    private SubCategory $subCategory;
    private Brand $brand;

    public function __construct()
    {
        $this->department = new Department();
        $this->category = new Category();
        $this->subCategory = new SubCategory();
        $this->brand = new Brand();
    }

    /**
     * كل الأقسام الرئيسية النشطة، مرتبة حسب sort_order
     * GET /api/departments
     */
    public function departments(): void
    {
        try {

            $result = $this->department
                ->where('is_active', '=', 1)
                ->orderBy('sort_order', 'ASC')
                ->get();

            Response::success(
                $result,
                'Departments fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                400
            );
        }
    }

    /**
     * التصنيفات، ممكن تتفلتر بقسم معين
     * GET /api/categories?department_id=1
     */
    public function categories(): void
    {
        try {

            $query = $this->category
                ->where('is_active', '=', 1);

            $departmentId = $_GET['department_id'] ?? null;

            if (
                $departmentId !== null &&
                filter_var($departmentId, FILTER_VALIDATE_INT) !== false
            ) {
                $query = $query->where(
                    'product_department_id',
                    '=',
                    (int) $departmentId
                );
            }

            $result = $query
                ->orderBy('sort_order', 'ASC')
                ->get();

            Response::success(
                $result,
                'Categories fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                400
            );
        }
    }

    /**
     * التصنيفات الفرعية، ممكن تتفلتر بتصنيف معين
     * GET /api/subcategories?category_id=1
     */
    public function subcategories(): void
    {
        try {

            $query = $this->subCategory
                ->where('is_active', '=', 1);

            $categoryId = $_GET['category_id'] ?? null;

            if (
                $categoryId !== null &&
                filter_var($categoryId, FILTER_VALIDATE_INT) !== false
            ) {
                $query = $query->where(
                    'product_category_id',
                    '=',
                    (int) $categoryId
                );
            }

            $result = $query
                ->orderBy('sort_order', 'ASC')
                ->get();

            Response::success(
                $result,
                'Subcategories fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                400
            );
        }
    }

    /**
     * كل الماركات النشطة
     * GET /api/brands
     */
    public function brands(): void
    {
        try {

            $result = $this->brand
                ->where('is_active', '=', 1)
                ->orderBy('brand_name_en', 'ASC')
                ->get();

            Response::success(
                $result,
                'Brands fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                400
            );
        }
    }
}