<?php

namespace App\Core;

class Validator
{
    protected array $data;

    protected array $rules;

    protected array $errors = [];

    public function __construct(
        array $data,
        array $rules
    ) {
        $this->data = $data;
        $this->rules = $rules;
    }

    public static function make(
        array $data,
        array $rules
    ): self {
        return new self($data, $rules);
    }

    public function validate(): bool
    {
        $this->errors = [];

        foreach ($this->rules as $field => $rules) {

            $rules = explode('|', $rules);

            foreach ($rules as $rule) {

                $this->applyRule(
                    $field,
                    $rule
                );
            }
        }

        return empty($this->errors);
    }

    protected function applyRule(
        string $field,
        string $rule
    ): void {

        $value = $this->data[$field] ?? null;

        /*
        |--------------------------------------------------------------------------
        | required
        |--------------------------------------------------------------------------
        */

        if ($rule === 'required') {

            if (
                $value === null ||
                $value === ''
            ) {
                $this->addError(
                    $field,
                    "{$field} is required."
                );
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | email
        |--------------------------------------------------------------------------
        */

        if ($rule === 'email') {

            if (
                $value !== null &&
                !filter_var(
                    $value,
                    FILTER_VALIDATE_EMAIL
                )
            ) {
                $this->addError(
                    $field,
                    "{$field} must be a valid email."
                );
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | string
        |--------------------------------------------------------------------------
        */

        if ($rule === 'string') {

            if (
                $value !== null &&
                !is_string($value)
            ) {
                $this->addError(
                    $field,
                    "{$field} must be a string."
                );
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | integer
        |--------------------------------------------------------------------------
        */

        if ($rule === 'integer') {

            if (
                $value !== null &&
                filter_var(
                    $value,
                    FILTER_VALIDATE_INT
                ) === false
            ) {
                $this->addError(
                    $field,
                    "{$field} must be an integer."
                );
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | numeric
        |--------------------------------------------------------------------------
        */

        if ($rule === 'numeric') {

            if (
                $value !== null &&
                !is_numeric($value)
            ) {
                $this->addError(
                    $field,
                    "{$field} must be numeric."
                );
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | min
        |--------------------------------------------------------------------------
        */

        if (str_starts_with($rule, 'min:')) {

            $min = (int) substr(
                $rule,
                4
            );

            if (
                $value !== null &&
                strlen((string) $value) < $min
            ) {
                $this->addError(
                    $field,
                    "{$field} must be at least {$min} characters."
                );
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | max
        |--------------------------------------------------------------------------
        */

        if (str_starts_with($rule, 'max:')) {

            $max = (int) substr(
                $rule,
                4
            );

            if (
                $value !== null &&
                strlen((string) $value) > $max
            ) {
                $this->addError(
                    $field,
                    "{$field} must not exceed {$max} characters."
                );
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | confirmed
        |--------------------------------------------------------------------------
        */

        if ($rule === 'confirmed') {

            $confirmationField =
                $field . '_confirmation';

            if (
                ($this->data[$confirmationField] ?? null)
                !== $value
            ) {
                $this->addError(
                    $field,
                    "{$field} confirmation does not match."
                );
            }

            return;
        }
    }

    protected function addError(
        string $field,
        string $message
    ): void {
        $this->errors[$field][] = $message;
    }

    public function fails(): bool
    {
        return !$this->validate();
    }

    public function passes(): bool
    {
        return $this->validate();
    }

    public function errors(): array
    {
        return $this->errors;
    }
}