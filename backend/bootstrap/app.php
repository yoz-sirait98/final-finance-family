<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // We use token-based auth (Bearer), NOT cookie/session auth,
        // so we do NOT add EnsureFrontendRequestsAreStateful here.
        // That middleware causes CSRF mismatch for pure token auth.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
