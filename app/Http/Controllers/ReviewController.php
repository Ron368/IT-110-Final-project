<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Store a new review
     */
    public function store(Request $request, Recipe $recipe)
    {
        $request->validate([
            'rating' => 'required|integer|between:1,5',
            'body'   => 'required|string|min:10|max:1000',
        ]);

        // Prevent user from reviewing the same recipe twice
        $alreadyReviewed = Auth::user()->reviews()
            ->where('reviewable_id', $recipe->id)
            ->where('reviewable_type', Recipe::class)
            ->exists();

        if ($alreadyReviewed) {
            return back()->with('error', 'You have already reviewed this recipe.');
        }

        Auth::user()->reviews()->create([
            'reviewable_id'   => $recipe->id,
            'reviewable_type' => Recipe::class,
            'rating'          => $request->rating,
            'body'            => $request->body,
        ]);

        return back()->with('success', 'Thank you! Your review has been added.');
    }

    /**
     * Update the specified review
     */
    public function update(Request $request, Review $review)
    {
        $this->authorizeReview($review);

        $request->validate([
            'rating' => 'required|integer|between:1,5',
            'body'   => 'required|string|min:10|max:1000',
        ]);

        $review->update([
            'rating' => $request->rating,
            'body'   => $request->body,
        ]);

        return back()->with('success', 'Review updated successfully.');
    }

    /**
     * Delete the specified review
     */
    public function destroy(Review $review)
    {
        $this->authorizeReview($review);

        $review->delete();

        return back()->with('success', 'Review deleted.');
    }

    /**
     * Authorize that the current user owns the review
     */
    protected function authorizeReview(Review $review): void
    {
        if ($review->user_id !== Auth::id()) {
            abort(403, 'You are not allowed to modify this review.');
        }
    }
}

