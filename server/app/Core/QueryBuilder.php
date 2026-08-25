<?php

namespace App\Core;

use PDO;

class QueryBuilder
{
    protected PDO $db;

    protected string $table;

    protected string $primaryKey = 'id';

    protected array $where = [];

    protected array $bindings = [];

    protected string $orderBy = "";

    protected ?int $limit = null;

    public function __construct(
    string $table,
    string $primaryKey = "id"
    )
    {
        $this->db = Database::connection();
        $this->table = $table;
        $this->primaryKey = $primaryKey;
    }

    protected function buildWhere(): string
    {
        if (empty($this->where)) {
            return "";
        }

        return " WHERE " . implode(" AND ", $this->where);
    }

    protected function reset(): void
    {
        $this->where = [];
        $this->bindings = [];
        $this->orderBy = "";
        $this->limit = null;
    }

    public function where(
    string $column,
    string $operator,
    $value
    ): self {

        $operator = strtoupper(trim($operator));

        /*
        * Handle NULL
        */
        if ($value === null) {

            if ($operator === '=') {
                $this->where[] =
                    "{$column} IS NULL";

                return $this;
            }

            if (
                $operator === '!=' ||
                $operator === '<>'
            ) {
                $this->where[] =
                    "{$column} IS NOT NULL";

                return $this;
            }

            if ($operator === 'IS') {
                $this->where[] =
                    "{$column} IS NULL";

                return $this;
            }

            if ($operator === 'IS NOT') {
                $this->where[] =
                    "{$column} IS NOT NULL";

                return $this;
            }
        }

        /*
        * Normal where
        */
        $key =
            ":" .
            preg_replace(
                '/[^a-zA-Z0-9_]/',
                '',
                $column
            ) .
            count($this->bindings);

        $this->where[] =
            "{$column} {$operator} {$key}";

        $this->bindings[$key] = $value;

        return $this;
    }

    public function orderBy(string $column, string $direction = "ASC"): self
    {
        $direction = strtoupper($direction);

        if (!in_array($direction, ['ASC', 'DESC'])) {
            $direction = 'ASC';
        }

        $this->orderBy = " ORDER BY {$column} {$direction}";

        return $this;
    }

    public function limit(int $limit): self
    {
        $this->limit = $limit;

        return $this;
    }

    public function get(): array
    {
        $sql = "SELECT * FROM {$this->table}";

        $sql .= $this->buildWhere();

        $sql .= $this->orderBy;

        if ($this->limit !== null) {
            $sql .= " LIMIT {$this->limit}";
        }

        $stmt = $this->db->prepare($sql);

        $stmt->execute($this->bindings);

        $result = $stmt->fetchAll();

        $this->reset();

        return $result;
    }

    public function first(): ?array
    {
        $this->limit(1);

        $result = $this->get();

        return $result[0] ?? null;
    }

    public function find($id): ?array
    {
        return $this
            ->where($this->primaryKey, '=', $id)
            ->first();
    }

    public function insert(array $data): bool
    {
        $columns = implode(', ', array_keys($data));

        $placeholders = ":" . implode(', :', array_keys($data));

        $sql = "INSERT INTO {$this->table}
                ({$columns})
                VALUES
                ({$placeholders})";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute($data);
    }

    public function update($id, array $data): bool
    {
        $fields = [];

        foreach ($data as $column => $value) {
            $fields[] = "{$column} = :{$column}";
        }

        $sql = "UPDATE {$this->table}
                SET " . implode(', ', $fields) . "
                WHERE {$this->primaryKey} = :primary_key";

        $data['primary_key'] = $id;

        $stmt = $this->db->prepare($sql);

        return $stmt->execute($data);
    }

   public function delete($id): bool
    {
        $stmt = $this->db->prepare(
            "DELETE FROM {$this->table}
            WHERE {$this->primaryKey} = :primary_key"
        );

        return $stmt->execute([
            'primary_key' => $id
        ]);
    }

    public function count(): int
    {
        $sql = "SELECT COUNT(*) AS total
                FROM {$this->table}";

        $sql .= $this->buildWhere();

        $stmt = $this->db->prepare($sql);

        $stmt->execute($this->bindings);

        $result = (int)$stmt->fetch()['total'];

        $this->reset();

        return $result;
    }

    public function exists(): bool
    {
        return $this->count() > 0;
    }
}