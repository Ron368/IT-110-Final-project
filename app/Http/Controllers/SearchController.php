<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Services\MealDBClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = trim($request->get('q', ''));

        $recipes = collect(); // empty collection by default
        $searched = false;

        if (strlen($query) >= 2) {
            $searched = true;

            $recipes = Recipe::with(['reviews'])
                ->where(function($q) use ($query) {
                    $q->where('title', 'LIKE', "%{$query}%")
                      ->orWhere('ingredients', 'LIKE', "%{$query}%")
                      ->orWhere('instructions', 'LIKE', "%{$query}%");
                })
                ->latest()
                ->paginate(12);

            $recipes->appends(['q' => $query]);
        }

        // If no results and user actually searched
        $noResults = $searched && $recipes->isEmpty();

        return view('search.results', compact('recipes', 'query', 'noResults'));
    }

    public function apiSearch(Request $request, MealDBClient $client): JsonResponse
    {
        try {
            $query = trim((string) $request->get('q', ''));

            if (strlen($query) < 2) {
                return response()->json([
                    'data' => [],
                    'meta' => ['query' => $query],
                ]);
            }

            // 1) MealDB results (default / primary)
            $mealdbPayload = $client->search($query);
            $mealdbMeals = is_array($mealdbPayload['meals'] ?? null) ? $mealdbPayload['meals'] : [];

            $mealdb = collect($mealdbMeals)->map(function (array $m) {
                return [
                    'source' => 'mealdb',
                    'id' => (string) ($m['idMeal'] ?? ''),
                    'title' => (string) ($m['strMeal'] ?? ''),
                    'description' => trim((string) (($m['strArea'] ?? '').' • '.($m['strCategory'] ?? ''))),
                    'image' => $m['strMealThumb'] ?? null,
                    'reviews_count' => 0,
                    'reviews_avg_rating' => null,
                ];
            })->filter(fn ($x) => $x['id'] !== '' && $x['title'] !== '')->values();

            // 2) Local results (secondary)
            $local = Recipe::query()
                ->withCount('reviews')
                ->withAvg('reviews', 'rating')
                ->where(function ($q) use ($query) {
                    $q->where('title', 'LIKE', "%{$query}%")
                        ->orWhere('ingredients', 'LIKE', "%{$query}%")
                        ->orWhere('instructions', 'LIKE', "%{$query}%");
                })
                ->orderByDesc('id')
                ->limit(8)
                ->get()
                ->map(fn (Recipe $r) => [
                    'source' => 'local',
                    'id' => (string) $r->id,
                    'title' => $r->title,
                    'description' => $r->description,
                    'image' => $r->image,
                    'reviews_count' => (int) $r->reviews_count,
                    'reviews_avg_rating' => $r->reviews_avg_rating !== null ? (float) $r->reviews_avg_rating : null,
                ]);

            return response()->json([
                'data' => $mealdb->take(8)->concat($local)->take(12)->values(),
                'meta' => ['query' => $query],
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Recipe search failed.',
                'debug' => config('app.debug') ? [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ] : null,
            ], 500);
        }
    }
}

