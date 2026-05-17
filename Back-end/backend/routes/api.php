<?php

use App\Http\Controllers\Api\ComiteController;
use App\Http\Controllers\Api\MembreController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;

Route::post('/login', [AuthController::class, 'login']);
Route::get('/me', [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    // Gestion des utilisateurs (rôles)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users/admin-local', [UserController::class, 'createAdminLocal']);
    Route::post('/users/moqaddem', [UserController::class, 'createMoqaddem']);
    Route::put('/comites/{id}/credentials', [UserController::class, 'assignComiteCredentials']);

    // Stats et PVs pour Admin Régional
    Route::get('/stats/region', [UserController::class, 'statsRegion']);
    Route::get('/pvs/a-valider', [UserController::class, 'pvsAValider']);
    Route::post('/pvs/{id}/valider-collection', [\App\Http\Controllers\Api\PvController::class, 'validerCollection']);
    Route::post('/pvs/{id}/valider-bouclage', [\App\Http\Controllers\Api\PvController::class, 'validerBouclage']);
    Route::get('/eleveurs/me/dashboard', [\App\Http\Controllers\Api\EleveurController::class, 'dashboard']);
    Route::get('/eleveurs/me/reclamations', [\App\Http\Controllers\Api\EleveurController::class, 'reclamations']);
    Route::post('/eleveurs/me/reclamations', [\App\Http\Controllers\Api\EleveurController::class, 'storeReclamation']);
});

Route::apiResource('membres', MembreController::class);
Route::apiResource('comites', ComiteController::class);
Route::apiResource('eleveurs', \App\Http\Controllers\Api\EleveurController::class);
Route::apiResource('pvs', \App\Http\Controllers\Api\PvController::class);
Route::get('pvs/{id}/pdf', [\App\Http\Controllers\Api\PvController::class, 'generatePdf']);
