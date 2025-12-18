@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">
        Search Recipes
    </h1>

    <!-- Search Form -->
    <form action="{{ route('search') }}" method="GET" class="max-w-2xl mx-auto mb-12">
        <div class="flex shadow-lg rounded-full overflow-hidden border">
            <input
                type="text"
                name="q"
                value="{{ request('q') }}"
                placeholder="Search by recipe name or ingredient (e.g. chicken, tomato, rice...)"
                class="w-full px-6 py-4 text-lg focus:outline-none"
                autofocus
                required
                minlength="2"
            >
            <button type="submit"
                class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 font-semibold">
                Search
            </button>
        </div>
    </form>

    <!-- Results -->
    @if($noResults)
        <div class="text-center py-16">
            <img src="https://http.cat/404" alt="Capybara not found" class="mx-auto w-80 rounded-xl shadow-lg mb-6">
            <p class="text-2xl text-gray-700 font-medium">
                The Capybara couldn't find any recipes with "<strong>{{ $query }}</strong>" 
            </p>
            <p class="text-lg text-gray-500 mt-4">
                Try searching for something else like "pasta", "chicken", or "chocolate"!
            </p>
        </div>
    @elseif($recipes->count() > 0)
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            @foreach($recipes as $recipe)
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-4">
                        <h3 class="text-xl font-semibold mb-2">{{ $recipe->title }}</h3>
                        @if($recipe->description)
                            <p class="text-gray-600 text-sm mb-2">{{ Str::limit($recipe->description, 100) }}</p>
                        @endif
                        <a href="{{ route('recipes.show', $recipe) }}" class="text-blue-600 hover:underline">View Recipe</a>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-12">
            {{ $recipes->links() }}
        </div>
    @else
        <div class="text-center py-20 text-gray-600">
            <p class="text-2xl">Start typing to search for recipes!</p>
        </div>
    @endif
</div>
@endsection

