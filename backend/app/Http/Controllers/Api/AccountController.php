<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Services\AccountService;
use App\Http\Resources\AccountResource;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function __construct(
        private AccountService $accountService
    ) {}

    public function index(Request $request)
    {
        $accounts = $this->accountService->list($request->user()->id);

        return AccountResource::collection($accounts);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'type'            => 'required|in:bank,cash,ewallet',
            'initial_balance' => 'nullable|numeric|min:0',
            'icon'            => 'nullable|string',
        ]);

        $account = $this->accountService->create($request->user()->id, $data);

        return new AccountResource($account);
    }

    public function show(Request $request, Account $account)
    {
        abort_if($account->user_id !== $request->user()->id, 403);
        return new AccountResource($account);
    }

    public function update(Request $request, Account $account)
    {
        abort_if($account->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'type'            => 'sometimes|in:bank,cash,ewallet',
            'icon'            => 'nullable|string',
            'is_active'       => 'sometimes|boolean',
            'initial_balance' => 'sometimes|numeric|min:0',
        ]);

        $account = $this->accountService->update($account, $data);

        return new AccountResource($account);
    }

    public function destroy(Request $request, Account $account)
    {
        abort_if($account->user_id !== $request->user()->id, 403);
        $this->accountService->delete($account);

        return response()->json(['message' => 'Account deleted successfully']);
    }
}
