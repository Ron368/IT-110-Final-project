<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $favorites = $user->favorites()
            ->select(['recipes.id', 'recipes.mealdb_id', 'recipes.title', 'recipes.description', 'recipes.image'])
            ->withPivot(['created_at', 'updated_at'])
            ->orderByDesc('favorites.updated_at')
            ->get();

        return Inertia::render('Dashboard', [
            'favorites' => $favorites,
        ]);
    }
}