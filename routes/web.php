<?php

use App\Http\Controllers\PetController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Pet management routes
Route::prefix('pets')->group(function () {
    Route::get('/', [PetController::class, 'index'])->name('pets.index');
    Route::get('/species/{species}', [PetController::class, 'getBySpecies'])->name('pets.by-species');
    Route::get('/vaccination-needed', [PetController::class, 'needingVaccination'])->name('pets.vaccination-needed');
    Route::get('/{id}', [PetController::class, 'show'])->name('pets.show');
});
