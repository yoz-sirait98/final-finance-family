<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\RecurringTransactionController;
use App\Http\Controllers\Api\BootstrapController;

/* |-------------------------------------------------------------------------- | API Routes — Family Finance Management System |-------------------------------------------------------------------------- | Base prefix: /api */

// Public routes
Route::get('/health', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'error: ' . $e->getMessage();
    }

    return response()->json([
        'status' => 'ok', 
        'database' => $dbStatus,
        'timestamp' => now()->toIso8601String()
    ]);
});

Route::post('/auth/register', [AuthController::class , 'register']);
Route::post('/auth/login', [AuthController::class , 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class , 'logout']);
    Route::get('/auth/profile', [AuthController::class , 'profile']);
    Route::put('/auth/password', [AuthController::class , 'changePassword']);

    // Bootstrap
    Route::get('/bootstrap', [BootstrapController::class, 'index']);

    // Members
    Route::apiResource('members', MemberController::class);
    Route::patch('/members/{member}/toggle-active', [MemberController::class , 'toggleActive']);

    // Accounts
    Route::apiResource('accounts', AccountController::class);

    // Categories
    Route::apiResource('categories', CategoryController::class);

    // Transactions
    Route::post('/transactions/transfer', [TransactionController::class , 'transfer']);
    Route::apiResource('transactions', TransactionController::class);

    // Budgets
    Route::get('/budgets/alerts', [BudgetController::class , 'alerts']);
    Route::apiResource('budgets', BudgetController::class);

    // Goals
    Route::post('/goals/{goal}/contribute', [GoalController::class , 'contribute']);
    Route::apiResource('goals', GoalController::class);

    // Recurring Transactions
    Route::apiResource('recurring-transactions', RecurringTransactionController::class);

    // Dashboard
    Route::get('/dashboard/full', [DashboardController::class , 'full']);
    Route::get('/dashboard/reports', [DashboardController::class , 'reports']);
});
