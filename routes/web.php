<?php

use App\Http\Controllers\MealDBController;
use App\Http\Controllers\ProfileController;
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
