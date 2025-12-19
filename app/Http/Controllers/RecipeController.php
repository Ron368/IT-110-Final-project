<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Services\MealDBClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class RecipeController extends Controller
{
    public function show(Recipe $recipe)
    {
        $recipe->load('reviews.user');

        $user = Auth::user();
        $userReview = $user ? $recipe->reviews->firstWhere('user_id', $user->id) : null;
        $isFavorited = $user ? $user->favorites()->where('recipe_id', $recipe->id)->exists() : false;
        $averageRating = $recipe->reviews->avg('rating');

        return view('recipes.show', compact(
            'recipe',
            'userReview',
            'isFavorited',
            'averageRating'
        ));
    }

    public function apiShow(Recipe $recipe): JsonResponse
    {
        $recipe->load('reviews.user');

        $user = Auth::user();
        $userReview = $user ? $recipe->reviews->firstWhere('user_id', $user->id) : null;
        $isFavorited = $user ? $user->favorites()->where('recipe_id', $recipe->id)->exists() : false;
        $averageRating = $recipe->reviews->avg('rating');

        return response()->json([
            'recipe' => [
                'id' => $recipe->id,
                'title' => $recipe->title,
                'description' => $recipe->description,
                'ingredients' => $recipe->ingredients,
                'instructions' => $recipe->instructions,
                'image' => $recipe->image,
            ],
            'auth' => [
                'user' => $user ? ['id' => $user->id, 'name' => $user->name] : null,
            ],
            'isFavorited' => $isFavorited,
            'averageRating' => $averageRating !== null ? (float) $averageRating : null,
            'userReview' => $userReview ? [
                'id' => $userReview->id,
                'rating' => (int) $userReview->rating,
                'body' => $userReview->body,
            ] : null,
            'reviews' => $recipe->reviews
                ->sortByDesc('created_at')
                ->values()
                ->map(fn ($rev) => [
                    'id' => $rev->id,
                    'rating' => (int) $rev->rating,
                    'body' => $rev->body,
                    'created_at' => optional($rev->created_at)->toIso8601String(),
                    'user' => [
                        'id' => $rev->user?->id,
                        'name' => $rev->user?->name ?? 'Unknown',
                    ],
                    'is_owner' => $user ? $rev->user_id === $user->id : false,
                ]),
        ]);
    }

    public function importFromMealDB(string $id, MealDBClient $client): JsonResponse
    {
        try {
            $id = trim($id);
            if ($id === '') {
                return response()->json(['message' => 'Missing MealDB id.'], 422);
            }

            // MealDB payload: { meals: [ ... ] }
            $payload = $client->lookup($id);
            $m = is_array($payload['meals'] ?? null) ? ($payload['meals'][0] ?? null) : null;

            if (!$m) {
                return response()->json(['message' => 'Meal not found on MealDB.'], 404);
            }

            $ingredients = [];
            for ($i = 1; $i <= 20; $i++) {
                $ing = trim((string)($m["strIngredient{$i}"] ?? ''));
                $mea = trim((string)($m["strMeasure{$i}"] ?? ''));
                if ($ing === '') continue;
                $ingredients[] = trim(($mea !== '' ? "{$mea} " : '') . $ing);
            }

            $description = trim((string)(($m['strArea'] ?? '') . ' • ' . ($m['strCategory'] ?? '')));
            if ($description === '•') $description = '';

            $recipe = Recipe::updateOrCreate(
                ['mealdb_id' => (string)($m['idMeal'] ?? $id)],
                [
                    'title' => (string)($m['strMeal'] ?? 'Untitled'),
                    'description' => $description !== '' ? $description : null,
                    'ingredients' => implode("\n", $ingredients),
                    'instructions' => (string)($m['strInstructions'] ?? ''),
                    'image' => $m['strMealThumb'] ?? null,
                ]
            );

            return response()->json([
                'recipe_id' => $recipe->id,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Import failed.',
            ], 500);
        }
    }
}

