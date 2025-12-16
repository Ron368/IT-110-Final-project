@extends('layouts.app')

@section('content')
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
    @if (session('success'))
        <div class="rounded-lg bg-green-100 text-green-800 px-4 py-3">
            {{ session('success') }}
        </div>
    @endif

    @if (session('error'))
        <div class="rounded-lg bg-red-100 text-red-800 px-4 py-3">
            {{ session('error') }}
        </div>
    @endif

    @if ($errors->any())
        <div class="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            <ul class="list-disc pl-5 space-y-1">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="bg-white shadow rounded-2xl p-8">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div class="space-y-3">
                <p class="text-sm uppercase tracking-[0.2em] text-orange-500 font-semibold">
                    Featured Recipe
                </p>
                <h1 class="text-4xl font-extrabold text-gray-900 leading-tight">
                    {{ $recipe->title }}
                </h1>
                @if ($recipe->description)
                    <p class="text-lg text-gray-600 max-w-3xl">
                        {{ $recipe->description }}
                    </p>
                @endif
                <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span class="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
                        ★ {{ number_format($averageRating ?? 0, 1) }}/5
                    </span>
                    <span class="text-gray-500">
                        {{ $recipe->reviews->count() }} review{{ $recipe->reviews->count() === 1 ? '' : 's' }}
                    </span>
                </div>
            </div>

            <div class="flex flex-col gap-2 w-full md:w-auto">
                @auth
                    <form method="POST" action="{{ url('/recipes/' . $recipe->id . '/favorite') }}" class="w-full md:w-auto">
                        @csrf
                        @if ($isFavorited)
                            @method('DELETE')
                            <button
                                class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition">
                                Remove from favorites
                            </button>
                        @else
                            <button
                                class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition shadow">
                                Save to favorites
                            </button>
                        @endif
                    </form>
                @else
                    <a href="{{ route('login') }}"
                       class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition shadow">
                        Sign in to save to favorites
                    </a>
                @endauth
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white shadow rounded-2xl p-8 space-y-6">
            <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🧺 Ingredients
            </h2>
            <ul class="space-y-3">
                @foreach (preg_split('/\r\n|\r|\n/', $recipe->ingredients) as $ingredient)
                    @if (trim($ingredient) !== '')
                        <li class="flex items-start gap-3 text-gray-700">
                            <span class="mt-1 text-orange-500">•</span>
                            <span>{{ $ingredient }}</span>
                        </li>
                    @endif
                @endforeach
            </ul>
        </div>

        <div class="bg-white shadow rounded-2xl p-8 space-y-6">
            <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🧭 Instructions
            </h2>
            <ol class="space-y-4">
                @php
                    $steps = array_filter(preg_split('/\r\n|\r|\n/', $recipe->instructions));
                @endphp
                @foreach ($steps as $index => $step)
                    <li class="flex gap-4">
                        <div class="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 font-semibold">
                            {{ $index + 1 }}
                        </div>
                        <p class="text-gray-700 leading-relaxed">{{ $step }}</p>
                    </li>
                @endforeach
            </ol>
        </div>
    </div>

    <div class="bg-white shadow rounded-2xl p-8 space-y-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Reviews</h2>
                <p class="text-gray-600">Share what you think of this recipe.</p>
            </div>
            @auth
                <div class="flex gap-3">
                    @if ($userReview)
                        <form method="POST" action="{{ url('/reviews/' . $userReview->id) }}">
                            @csrf
                            @method('DELETE')
                            <button class="px-4 py-2 rounded-lg bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition">
                                Delete my review
                            </button>
                        </form>
                    @endif
                </div>
            @endauth
        </div>

        @auth
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    {{ $userReview ? 'Update your review' : 'Add a review' }}
                </h3>
                <form method="POST"
                      action="{{ $userReview ? url('/reviews/' . $userReview->id) : url('/recipes/' . $recipe->id . '/review') }}"
                      class="space-y-4">
                    @csrf
                    @if ($userReview)
                        @method('PUT')
                    @endif
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="md:col-span-1">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <select name="rating" required
                                    class="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500">
                                @for ($i = 5; $i >= 1; $i--)
                                    <option value="{{ $i }}" {{ ($userReview?->rating ?? old('rating')) == $i ? 'selected' : '' }}>
                                        {{ $i }} ★
                                    </option>
                                @endfor
                            </select>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Your review</label>
                            <textarea name="body" rows="4" required minlength="10" maxlength="1000"
                                      class="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                      placeholder="Tell others how it turned out...">{{ old('body', $userReview->body ?? '') }}</textarea>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button
                            class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition shadow">
                            {{ $userReview ? 'Update review' : 'Submit review' }}
                        </button>
                    </div>
                </form>
            </div>
        @else
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-700">
                <p>
                    <a class="text-orange-600 font-semibold hover:underline" href="{{ route('login') }}">Sign in</a>
                    to leave a review or save this recipe to favorites.
                </p>
            </div>
        @endauth

        <div class="space-y-4">
            @forelse ($recipe->reviews->sortByDesc('created_at') as $review)
                <div class="border border-gray-200 rounded-xl p-5 bg-white">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                                {{ strtoupper(substr($review->user->name, 0, 1)) }}
                            </div>
                            <div>
                                <p class="font-semibold text-gray-900">{{ $review->user->name }}</p>
                                <p class="text-xs text-gray-500">{{ $review->created_at->diffForHumans() }}</p>
                            </div>
                        </div>
                        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold">
                            {{ $review->rating }} ★
                        </span>
                    </div>
                    <p class="text-gray-700 leading-relaxed">{{ $review->body }}</p>
                </div>
            @empty
                <div class="text-center text-gray-600 py-8">
                    No reviews yet. Be the first to share your thoughts!
                </div>
            @endforelse
        </div>
    </div>
</div>
@endsection


