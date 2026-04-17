<?php

namespace App\Http\Controllers;

use App\Models\University;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class UniversityController extends Controller
{
    public function index(Request $request): View
    {
        $user = $this->authUser($request);
        $q = (string) $request->query('q', '');
        $universities = University::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->when($q !== '', fn ($query) => $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")->orWhere('country', 'like', "%{$q}%");
            }))
            ->latest('id')
            ->paginate(12)
            ->withQueryString();

        return view('universities.index', compact('universities', 'q'));
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $this->authUser($request);
        $data = $request->validate([
            'name' => 'required|string|max:160',
            'country' => 'required|string|max:80',
            'website' => 'nullable|url|max:255',
            'currency' => 'required|string|max:8',
            'tuition_range' => 'nullable|string|max:255',
            'language' => 'nullable|string|max:120',
            'programs_summary' => 'nullable|string|max:5000',
            'deadline' => 'nullable|date',
            'visa_notes' => 'nullable|string|max:2000',
            'description' => 'nullable|string|max:7000',
        ]);
        $data['tenant_id'] = $user->tenant_id;
        $data['is_active'] = 1;
        $university = University::query()->create($data);

        $this->audit($request, 'university.create', 'university', $university->id, $data);

        return back()->with('success', 'University created.');
    }

    public function show(Request $request, int $id): View
    {
        $user = $this->authUser($request);
        $university = University::query()->forTenant($user->tenant_id, $user->role_slug)->findOrFail($id);
        return view('universities.show', compact('university'));
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $university = University::query()->forTenant($user->tenant_id, $user->role_slug)->findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:160',
            'country' => 'required|string|max:80',
            'website' => 'nullable|url|max:255',
            'currency' => 'required|string|max:8',
            'tuition_range' => 'nullable|string|max:255',
            'language' => 'nullable|string|max:120',
            'programs_summary' => 'nullable|string|max:5000',
            'deadline' => 'nullable|date',
            'visa_notes' => 'nullable|string|max:2000',
            'description' => 'nullable|string|max:7000',
            'is_active' => 'nullable|boolean',
        ]);
        $university->update($data);
        $this->audit($request, 'university.update', 'university', $university->id, $data);

        return back()->with('success', 'University updated.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $university = University::query()->forTenant($user->tenant_id, $user->role_slug)->findOrFail($id);
        $university->delete();
        $this->audit($request, 'university.delete', 'university', $id);

        return back()->with('success', 'University deleted.');
    }
}
