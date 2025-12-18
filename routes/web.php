<?php

use App\Http\Controllers\MealDBController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\SearchController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Recipe show page
Route::get('/recipes/{recipe}', [RecipeController::class, 'show'])->name('recipes.show');

// Search route 
Route::get('/search', [SearchController::class, 'index'])->name('search');

// Review routes
Route::post('/recipes/{recipe}/review', [ReviewController::class, 'store'])->middleware('auth');
Route::put('/reviews/{review}', [ReviewController::class, 'update'])->middleware('auth');
Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->middleware('auth');

// Favorite routes
Route::post('/recipes/{recipe}/favorite', [FavoriteController::class, 'store'])->middleware('auth');
Route::put('/recipes/{recipe}/favorite', [FavoriteController::class, 'update'])->middleware('auth');
Route::delete('/recipes/{recipe}/favorite', [FavoriteController::class, 'destroy'])->middleware('auth');
// Toggle route for backward compatibility
Route::post('/recipes/{recipe}/favorite/toggle', [FavoriteController::class, 'toggle'])->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::prefix('api/mealdb')->group(function () {
    Route::get('search', [MealDBController::class, 'search'])->name('mealdb.search');
    Route::get('meal/{id}', [MealDBController::class, 'meal'])->whereNumber('id')->name('mealdb.meal');
    Route::get('random', [MealDBController::class, 'random'])->name('mealdb.random');
    Route::get('categories', [MealDBController::class, 'categories'])->name('mealdb.categories');
    Route::get('random-batch', [MealDBController::class, 'randomBatch'])->name('mealdb.randomBatch');
});

require __DIR__.'/auth.php';
