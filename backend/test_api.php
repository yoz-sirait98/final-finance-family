<?php

$user = App\Models\User::first();

if (!$user) {
    echo "No users found in database.\n";
    exit;
}

echo "--- GET /api/insights ---(User ID: " . $user->id . ", Email: " . $user->email . ")\n";

$insights = [
    'monthly_comparison' => app(\App\Services\InsightService::class)->getMonthlyComparison($user->id),
    'top_spending_category' => app(\App\Services\InsightService::class)->getTopSpendingCategories($user->id),
    'budget_risk_prediction' => app(\App\Services\InsightService::class)->getBudgetRiskPrediction($user->id),
];

$activeInsights = array_filter($insights);

echo json_encode([
    'data' => [
        'insights' => array_values($activeInsights)
    ]
], JSON_PRETTY_PRINT);
echo "\n";
