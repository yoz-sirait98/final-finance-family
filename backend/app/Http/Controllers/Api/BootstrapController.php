<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;
use App\Models\Account;
use App\Models\Category;
use App\Models\Budget;
use Illuminate\Support\Facades\Cache;

class BootstrapController extends Controller
{
    private const TTL = 300; // 5 minutes

    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $now = now();

        $data = Cache::remember("bootstrap_data_{$userId}_{$now->month}_{$now->year}", self::TTL, function () use ($userId, $now) {
            return [
                'profile' => [
                    'id' => $userId,
                ],
                'members' => Member::where('user_id', $userId)
                    ->orderBy('name')
                    ->get(['id', 'name', 'is_active', 'created_at', 'updated_at']),
                'accounts' => Account::where('user_id', $userId)
                    ->orderBy('name')
                    ->get(['id', 'name', 'type', 'balance', 'initial_balance', 'icon', 'is_active', 'created_at', 'updated_at']),
                'categories' => Category::where('user_id', $userId)
                    ->orderBy('name')
                    ->get(['id', 'name', 'type', 'icon', 'color', 'created_at', 'updated_at']),
                'budgets' => Budget::where('user_id', $userId)
                    ->where('month', $now->month)
                    ->where('year', $now->year)
                    ->with('category:id,name,color,icon')
                    ->get(['id', 'category_id', 'amount', 'month', 'year', 'created_at', 'updated_at']),
            ];
        });

        // ETag caching strategy
        $etag = md5(json_encode($data));
        
        $response = response()->json(['data' => $data]);
        $response->setEtag($etag);

        return $response;
    }
}
