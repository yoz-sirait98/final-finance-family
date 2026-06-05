<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    private const TTL = 300; // 5 minutes

    private function cacheKeyCategories(int $userId, ?string $type = null): string
    {
        return 'category_list_' . $userId . '_' . ($type ?? 'all');
    }

    public function index(Request $request)
    {
        $type = $request->query('type');
        $cacheKey = $this->cacheKeyCategories($request->user()->id, $type);

        $categories = Cache::remember($cacheKey, self::TTL, function () use ($request, $type) {
            $query = Category::where('user_id', $request->user()->id);
            if ($type) {
                $query->where('type', $type);
            }
            return $query->orderBy('name')->get();
        });

        return CategoryResource::collection($categories);
    }

    private function clearCategoryCache(int $userId): void
    {
        Cache::forget($this->cacheKeyCategories($userId, null));
        Cache::forget($this->cacheKeyCategories($userId, 'income'));
        Cache::forget($this->cacheKeyCategories($userId, 'expense'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'icon' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        $category = Category::create([
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        $this->clearCategoryCache($request->user()->id);
        return new CategoryResource($category);
    }

    public function show(Request $request, Category $category)
    {
        abort_if($category->user_id !== $request->user()->id, 403);
        return new CategoryResource($category);
    }

    public function update(Request $request, Category $category)
    {
        abort_if($category->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:income,expense',
            'icon' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        $category->update($data);

        $this->clearCategoryCache($category->user_id);
        return new CategoryResource($category);
    }

    public function destroy(Request $request, Category $category)
    {
        abort_if($category->user_id !== $request->user()->id, 403);
        $userId = $category->user_id;
        $category->delete();

        $this->clearCategoryCache($userId);
        return response()->json(['message' => 'Category deleted successfully']);
    }
}
