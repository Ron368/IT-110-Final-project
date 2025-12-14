<?php

namespace App\Http\Controllers;

use App\Services\MealDbClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MealDBController extends Controller
{
    public function search(Request $request, MealDBClient $client): JsonResponse
    {
        $term = (string) $request->query('s', '');
        return response()->json($client->search($term));
    }

    public function meal(int $id, MealDBClient $client): JsonResponse
    {
        return response()->json($client->lookup($id));
    }

    public function random(MealDBClient $client): JsonResponse
    {
        return response()->json($client->random());
    }

    public function categories(MealDBClient $client): JsonResponse
    {
        return response()->json($client->categories());
    }
}