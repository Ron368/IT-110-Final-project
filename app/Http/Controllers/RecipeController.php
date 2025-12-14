<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function show(Recipe $recipe)
    {
        $recipe->load('reviews.user');

        return view('recipes.show', compact('recipe'));
    }
}

