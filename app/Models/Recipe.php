<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Recipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'mealdb_id',
        'title',
        'description',
        'ingredients',
        'instructions',
        'image',
    ];

    public function favorites()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }
}

