<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Services\InsightService;
use App\Services\NetWorthService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService,
        private InsightService $insightService,
        private NetWorthService $netWorthService,
    ) {}

    /**
     * Unified full-dashboard endpoint — returns ALL dashboard data in one HTTP round trip.
     */
    public function full(Request $request)
    {
        $userId = $request->user()->id;
        $month  = (int) ($request->input('month') ?? now()->month);
        $year   = (int) ($request->input('year')  ?? now()->year);

        $responseData = [
            'summary'            => $this->dashboardService->getSummary($userId, $month, $year),
            'expense_by_category'=> $this->dashboardService->getExpenseByCategory($userId, $month, $year),
            'income_vs_expense'  => $this->dashboardService->getIncomeVsExpense($userId, $year),
            'expense_trend'      => $this->dashboardService->getMonthlyExpenseTrend($userId, 6),
            'insights'           => array_values(array_filter([
                $this->insightService->getMonthlyComparison($userId),
                $this->insightService->getSavingsRate($userId),
                $this->insightService->getExpenseAnomaly($userId),
                $this->insightService->getHighestSpendingDay($userId),
                $this->insightService->getWeekendVsWeekdaySpending($userId),
            ])),
            'net_worth_current'  => $this->netWorthService->calculateCurrentNetWorth($userId),
            'net_worth_history'  => $this->netWorthService->getHistory($userId),
        ];

        $etag = md5(json_encode($responseData));
        $response = response()->json(['data' => $responseData]);
        $response->setEtag($etag);

        return $response;
    }

    /**
     * Unified reports endpoint — returns ALL report chart data in one HTTP request.
     * Reduces 4 HTTP requests to 1 for improved performance.
     */
    public function reports(Request $request)
    {
        $userId = $request->user()->id;
        $month  = (int) ($request->input('month') ?? 0);  // 0 = all months
        $year   = (int) ($request->input('year')  ?? now()->year);
        $memberId = $request->input('member_id') ? (int) $request->input('member_id') : null;

        $responseData = [
            'expense_by_category' => $this->dashboardService->getExpenseByCategory(
                $userId,
                $month,
                $year,
                $memberId
            ),
            'expense_by_member' => $this->dashboardService->getExpenseByMember(
                $userId,
                $month,
                $year,
                $memberId
            ),
            'income_vs_expense' => $this->dashboardService->getIncomeVsExpense($userId, $year),
            'expense_trend'     => $this->dashboardService->getMonthlyExpenseTrend($userId, 6),
        ];

        $etag = md5(json_encode($responseData));
        $response = response()->json(['data' => $responseData]);
        $response->setEtag($etag);

        return $response;
    }
}

