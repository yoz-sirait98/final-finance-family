<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Http\Resources\MemberResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MemberController extends Controller
{
    private const TTL = 300; // 5 minutes

    private function cacheKeyMembers(int $userId): string
    {
        return 'member_list_' . $userId;
    }

    public function index(Request $request)
    {
        $members = Cache::remember($this->cacheKeyMembers($request->user()->id), self::TTL, function () use ($request) {
            return Member::where('user_id', $request->user()->id)->orderBy('name')->get();
        });

        return MemberResource::collection($members);
    }

    private function clearMemberCache(int $userId): void
    {
        Cache::forget($this->cacheKeyMembers($userId));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:father,mother,child',
            'avatar' => 'nullable|string',
        ]);

        $member = Member::create([
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        $this->clearMemberCache($request->user()->id);
        return new MemberResource($member);
    }

    public function show(Request $request, Member $member)
    {
        $this->authorize($request, $member);
        return new MemberResource($member);
    }

    public function update(Request $request, Member $member)
    {
        $this->authorize($request, $member);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|in:father,mother,child',
            'avatar' => 'nullable|string',
        ]);

        $member->update($data);

        $this->clearMemberCache($member->user_id);
        return new MemberResource($member);
    }

    public function destroy(Request $request, Member $member)
    {
        $this->authorize($request, $member);
        $userId = $member->user_id;
        $member->delete();

        $this->clearMemberCache($userId);
        return response()->json(['message' => 'Member deleted successfully']);
    }

    public function toggleActive(Request $request, Member $member)
    {
        $this->authorize($request, $member);
        $member->update(['is_active' => !$member->is_active]);

        $this->clearMemberCache($member->user_id);
        return new MemberResource($member);
    }

    private function authorize(Request $request, Member $member): void
    {
        abort_if($member->user_id !== $request->user()->id, 403);
    }
}
