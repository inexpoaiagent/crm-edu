<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$autoload = __DIR__.'/../vendor/autoload.php';
$bootstrap = __DIR__.'/../bootstrap/app.php';

// cPanel common layout: /public_html + /vertue-crm
if (!file_exists($autoload)) {
    $autoload = __DIR__.'/../vertue-crm/vendor/autoload.php';
    $bootstrap = __DIR__.'/../vertue-crm/bootstrap/app.php';
}

require $autoload;
$app = require_once $bootstrap;

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
