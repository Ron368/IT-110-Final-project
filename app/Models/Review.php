<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    /**
     * Use fillable instead of guarded = []
     * This is safer and prevents some VS Code warnings.
     */
    protected $fillable = [
        'user_id',
        'reviewable_id',
        'reviewable_type',
        'rating',
        'body',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    /**
     * The user who wrote the review.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The model (Recipe, Product, etc.) being reviewed.
     */
    public function reviewable()
    {
        return $this->morphTo();
    }
}

