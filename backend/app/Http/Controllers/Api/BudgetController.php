<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Services\BudgetService;
use App\Http\Resources\BudgetResource;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function __construct(
        private BudgetService $budgetService
    ) {}

    public function index(Request $request)
    {
        $budgets = $this->budgetService->list(
            $request->user()->id,
            $request->input('month'),
            $request->input('year')
        );

        return response()->json(['data' => $budgets]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020',
        ]);

        $data['user_id'] = $request->user()->id;
        $budget = $this->budgetService->createOrUpdate($request->user()->id, $data);

        return new BudgetResource($budget);
    }

    public function show(Request $request, Budget $budget)
    {
        abort_if($budget->user_id !== $request->user()->id, 403);
        return new BudgetResource($budget->load('category'));
    }

    public function update(Request $request, Budget $budget)
    {
        abort_if($budget->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'amount' => 'required|numeric|min:0',
        ]);

        $budget = $this->budgetService->update($budget, $data);

        return new BudgetResource($budget);
    }

    public function destroy(Request $request, Budget $budget)
    {
        abort_if($budget->user_id !== $request->user()->id, 403);
        $this->budgetService->delete($budget);

        return response()->json(['message' => 'Budget deleted successfully']);
    }

    public function alerts(Request $request)
    {
        $alerts = $this->budgetService->getAlerts(
            $request->user()->id,
            $request->input('month'),
            $request->input('year')
        );

        return response()->json(['data' => $alerts]);
    }
}
