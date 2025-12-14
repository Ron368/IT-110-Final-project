<?php

namespace app\Services;

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

    private function get(string $path, array $query = []): array
    {
        $url = $this->baseUrl.'/'.ltrim($path, '/');
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
        return $this->get('random.php');
    }

    public function categories(): array
    {
        return $this->get('categories.php');
    }
}