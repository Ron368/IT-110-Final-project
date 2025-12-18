<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    /**
     * Store a new favorite (add recipe to favorites)
     */
    public function store(Request $request, Recipe $recipe)
    {
        $user = Auth::user();

        // Check if already favorited
        if ($user->favorites()->where('recipe_id', $recipe->id)->exists()) {
            return back()->with('info', 'This recipe is already in your favorites!');
        }

        $user->favorites()->attach($recipe->id);

        return back()->with('success', 'Recipe added to favorites! ❤️');
    }

    /**
     * Update a favorite (refresh timestamps if needed)
     * Note: For favorites, update typically just updates timestamps
     */
    public function update(Request $request, Recipe $recipe)
    {
        $user = Auth::user();

        // Check if favorite exists
        if (!$user->favorites()->where('recipe_id', $recipe->id)->exists()) {
            return back()->with('error', 'This recipe is not in your favorites.');
        }

        // Update the timestamps on the pivot table
        DB::table('favorites')
            ->where('user_id', $user->id)
            ->where('recipe_id', $recipe->id)
            ->update(['updated_at' => now()]);

        return back()->with('success', 'Favorite updated!');
    }

    /**
     * Delete a favorite (remove recipe from favorites)
     */
    public function destroy(Recipe $recipe)
    {
        $user = Auth::user();

        // Check if favorite exists
        if (!$user->favorites()->where('recipe_id', $recipe->id)->exists()) {
            return back()->with('error', 'This recipe is not in your favorites.');
        }

        $user->favorites()->detach($recipe->id);

        return back()->with('success', 'Recipe removed from favorites.');
    }

    /**
     * Toggle favorite (convenience method for backward compatibility)
     */
    public function toggle(Recipe $recipe)
    {
        $user = Auth::user();

        // Toggle favorite
        if ($user->favorites()->where('recipe_id', $recipe->id)->exists()) {
            return $this->destroy($recipe);
        }

        return $this->store(request(), $recipe);
    }
}

