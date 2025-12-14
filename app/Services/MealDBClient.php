<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class MealDBClient
{
    private string $baseUrl;
    private int $ttl;
    private int $timeout;

    public function __construct()
    {
        $base = rtrim((string) config('services.mealdb.base_url'), '/');
        $key = (string) config('services.mealdb.api_key');

        $this->baseUrl = $base.'/'.$key;
        $this->ttl = (int) config('services.mealdb.cache_ttl', 600);
        $this->timeout = (int) config('services.mealdb.timeout', 8);
    }

    private function get(string $path, array $query = [], bool $cache = true): array
    {
        $url = $this->baseUrl.'/'.ltrim($path, '/');

        if (! $cache) {
            return Http::acceptJson()
                ->timeout($this->timeout)
                ->get($url, $query)
                ->throw()
                ->json() ?? [];
        }

        $cacheKey = 'mealdb:'.md5($url.'?'.http_build_query($query));

        return Cache::remember($cacheKey, $this->ttl, function () use ($url, $query) {
            return Http::acceptJson()
                ->timeout($this->timeout)
                ->get($url, $query)
                ->throw()
                ->json() ?? [];
        });
    }

    public function search(string $term): array
    {
        return $this->get('search.php', ['s' => $term]);
    }

    public function lookup(int|string $id): array
    {
        return $this->get('lookup.php', ['i' => $id]);
    }

    public function random(): array
    {
        // IMPORTANT: don't cache random.php, or it won't look random
        return $this->get('random.php', [], false);
    }

    public function categories(): array
    {
        return $this->get('categories.php');
    }

    /**
     * Returns a flat list of unique meals.
     *
     * @return array<int, array<string, mixed>>
     */
    public function randomBatch(int $count = 4): array
    {
        $count = max(1, min($count, 8)); // keep it reasonable
        $mealsById = [];
        $attempts = 0;
        $maxAttempts = $count * 4;

        while (count($mealsById) < $count && $attempts < $maxAttempts) {
            $attempts++;

            $payload = $this->random();
            $meal = $payload['meals'][0] ?? null;

            if (!is_array($meal)) {
                continue;
            }

            $id = (string) ($meal['idMeal'] ?? '');
            if ($id === '') {
                continue;
            }

            $mealsById[$id] = $meal;
        }

        return array_values($mealsById);
    }
}