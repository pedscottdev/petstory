<?php

use App\Http\Controllers\PetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Pet CRUD routes
Route::apiResource('pets', PetController::class);

// Additional pet routes
Route::get('pets/species/{species}', [PetController::class, 'getBySpecies'])
    ->name('pets.by-species');

Route::get('pets-needing-vaccination', [PetController::class, 'needingVaccination'])
    ->name('pets.needing-vaccination');