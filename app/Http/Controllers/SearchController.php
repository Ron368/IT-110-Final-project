<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use Illuminate\Http\Request;

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
}

