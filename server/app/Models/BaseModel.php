<?php

namespace App\Models;

use App\Core\QueryBuilder;

abstract class BaseModel
{
    protected string $table;

    protected string $primaryKey = 'id';

    protected QueryBuilder $query;

    /**
     * الأعمدة المسموح بإدخالها وتعديلها
     */
    protected array $fillable = [];

    /**
     * استخدام created_at و updated_at
     */
    protected bool $timestamps = true;

    public function __construct()
    {
        $this->query = new QueryBuilder(
            $this->table,
            $this->primaryKey
        );
    }

    /**
     * Get all records
     */
    public function all(): array
    {
        return $this->query->get();
    }

    /**
     * Find by primary key
     */
    public function find($id): ?array
    {
        return $this->query->find($id);
    }

    /**
     * Where
     */
    public function where(
        string $column,
        string $operator,
        $value
    ): QueryBuilder {
        return $this->query->where(
            $column,
            $operator,
            $value
        );
    }

    /**
     * Create new record
     */
    public function create(array $data): bool
    {
        $data = $this->filterFillable($data);

        if ($this->timestamps) {

            $data['created_at'] =
                date('Y-m-d H:i:s');

            $data['updated_at'] =
                date('Y-m-d H:i:s');
        }

        return $this->query->insert($data);
    }

    /**
     * Update record
     */
    public function update(
        $id,
        array $data
    ): bool {

        $data = $this->filterFillable($data);

        if ($this->timestamps) {

            $data['updated_at'] =
                date('Y-m-d H:i:s');
        }

        return $this->query->update(
            $id,
            $data
        );
    }

    /**
     * Delete record
     */
    public function delete($id): bool
    {
        return $this->query->delete($id);
    }

    /**
     * Count records
     */
    public function count(): int
    {
        return $this->query->count();
    }

    /**
     * Check if records exist
     */
    public function exists(): bool
    {
        return $this->query->exists();
    }

    /**
     * Filter data using fillable
     */
    protected function filterFillable(
        array $data
    ): array {

        if (empty($this->fillable)) {
            return $data;
        }

        return array_intersect_key(
            $data,
            array_flip($this->fillable)
        );
    }
}