<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Production: restrict allowed_origins to your exact frontend domain(s).
    | Never use ['*'] in production — it defeats all CORS protection.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /*
     * Replace with your actual frontend domain(s).
     * Use env() so the value can differ between local/staging/production.
     */
    'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173'))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-XSRF-TOKEN'],

    'exposed_headers' => [],

    // Cache pre-flight for 2 hours
    'max_age' => 7200,

    // Required when using Sanctum cookie-based auth (SPA mode)
    'supports_credentials' => true,

];
