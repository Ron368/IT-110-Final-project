<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
}

