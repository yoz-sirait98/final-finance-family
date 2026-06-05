<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Category;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Auto-seed default categories for the new user
        $defaultCategories = [
            ['name' => 'Salary', 'type' => 'income', 'icon' => 'bi-cash-stack', 'color' => '#198754'],
            ['name' => 'Food', 'type' => 'expense', 'icon' => 'bi-basket', 'color' => '#dc3545'],
            ['name' => 'Transport', 'type' => 'expense', 'icon' => 'bi-car-front', 'color' => '#ffc107'],
            ['name' => 'Utilities', 'type' => 'expense', 'icon' => 'bi-lightning', 'color' => '#0dcaf0'],
            ['name' => 'Entertainment', 'type' => 'expense', 'icon' => 'bi-controller', 'color' => '#6f42c1'],
        ];

        foreach ($defaultCategories as $cat) {
            Category::create(array_merge($cat, ['user_id' => $user->id]));
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($user->load('members')),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function profile(Request $request)
    {
        return new UserResource($request->user()->load('members'));
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password' => $request->password]);

        return response()->json(['message' => 'Password changed successfully']);
    }
}
