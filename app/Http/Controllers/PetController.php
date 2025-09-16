<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PetController extends Controller
{
    /**
     * Display a listing of pets.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $pets = Pet::active()->get();
            
            return response()->json([
                'success' => true,
                'data' => $pets,
                'message' => 'Pets retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pets',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created pet.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'species' => 'required|string|max:100',
                'breed' => 'nullable|string|max:100',
                'age' => 'required|integer|min:0',
                'gender' => 'required|in:male,female',
                'color' => 'nullable|string|max:100',
                'weight' => 'nullable|numeric|min:0',
                'height' => 'nullable|numeric|min:0',
                'description' => 'nullable|string',
                'owner_name' => 'required|string|max:255',
                'owner_phone' => 'nullable|string|max:20',
                'owner_email' => 'nullable|email|max:255',
                'vaccination_status' => 'boolean',
                'medical_history' => 'nullable|array',
                'image_url' => 'nullable|url',
                'microchip_id' => 'nullable|string|max:50',
            ]);

            $validated['status'] = 'active';
            $validated['registration_date'] = now();

            $pet = Pet::create($validated);

            return response()->json([
                'success' => true,
                'data' => $pet,
                'message' => 'Pet created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create pet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified pet.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            $pet = Pet::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $pet,
                'message' => 'Pet retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Pet not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified pet.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $pet = Pet::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'species' => 'sometimes|string|max:100',
                'breed' => 'nullable|string|max:100',
                'age' => 'sometimes|integer|min:0',
                'gender' => 'sometimes|in:male,female',
                'color' => 'nullable|string|max:100',
                'weight' => 'nullable|numeric|min:0',
                'height' => 'nullable|numeric|min:0',
                'description' => 'nullable|string',
                'owner_name' => 'sometimes|string|max:255',
                'owner_phone' => 'nullable|string|max:20',
                'owner_email' => 'nullable|email|max:255',
                'vaccination_status' => 'boolean',
                'medical_history' => 'nullable|array',
                'image_url' => 'nullable|url',
                'microchip_id' => 'nullable|string|max:50',
                'status' => 'sometimes|in:active,inactive,adopted',
                'last_checkup' => 'nullable|date',
                'next_appointment' => 'nullable|date',
            ]);

            $pet->update($validated);

            return response()->json([
                'success' => true,
                'data' => $pet->fresh(),
                'message' => 'Pet updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update pet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified pet.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $pet = Pet::findOrFail($id);
            $pet->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pet deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete pet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pets by species.
     *
     * @param string $species
     * @return JsonResponse
     */
    public function getBySpecies(string $species): JsonResponse
    {
        try {
            $pets = Pet::getBySpecies($species);

            return response()->json([
                'success' => true,
                'data' => $pets,
                'message' => "Pets of species '{$species}' retrieved successfully"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pets by species',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pets that need vaccination.
     *
     * @return JsonResponse
     */
    public function needingVaccination(): JsonResponse
    {
        try {
            $pets = Pet::needingVaccination();

            return response()->json([
                'success' => true,
                'data' => $pets,
                'message' => 'Pets needing vaccination retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pets needing vaccination',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}