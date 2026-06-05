<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Services\GoalService;
use App\Http\Resources\GoalResource;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function __construct(
        private GoalService $goalService
    ) {}

    public function index(Request $request)
    {
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 15);
        $goals = $this->goalService->list($request->user()->id, $page, $perPage);

        return GoalResource::collection($goals);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'deadline' => 'nullable|date',
            'account_id' => 'nullable|exists:accounts,id',
        ]);

        $goal = $this->goalService->create($request->user()->id, $data);

        return new GoalResource($goal->load('account'));
    }

    public function show(Request $request, Goal $goal)
    {
        abort_if($goal->user_id !== $request->user()->id, 403);
        return new GoalResource($goal->load(['goalTransactions', 'account']));
    }

    public function update(Request $request, Goal $goal)
    {
        abort_if($goal->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'target_amount' => 'sometimes|numeric|min:1',
            'deadline' => 'nullable|date',
            'status' => 'sometimes|in:active,completed,cancelled',
            'account_id' => 'nullable|exists:accounts,id',
        ]);

        $goal = $this->goalService->update($goal, $data);

        return new GoalResource($goal->load('account'));
    }

    public function destroy(Request $request, Goal $goal)
    {
        abort_if($goal->user_id !== $request->user()->id, 403);
        $this->goalService->delete($goal);

        return response()->json(['message' => 'Goal deleted successfully']);
    }

    public function contribute(Request $request, Goal $goal)
    {
        abort_if($goal->user_id !== $request->user()->id, 403);
        abort_if($goal->status !== 'active', 422, 'Cannot contribute to inactive goal');
        abort_if($goal->account_id !== null, 422, 'Cannot manually contribute to a goal linked to an account');

        $data = $request->validate([
            'amount' => 'required|numeric|min:1',
            'note' => 'nullable|string|max:255',
        ]);

        $goalTransaction = $this->goalService->contribute(
            $goal,
            $data['amount'],
            $data['note'] ?? null
        );

        return response()->json([
            'message' => 'Contribution added',
            'goal' => new GoalResource($goal->fresh()->load('goalTransactions')),
        ]);
    }
}
