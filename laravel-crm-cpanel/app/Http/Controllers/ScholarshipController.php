<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use App\Models\University;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ScholarshipController extends Controller
{
    public function index(Request $request): View
    {
        $user = $this->authUser($request);
        $q = (string) $request->query('q', '');

        $scholarships = Scholarship::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->when($q !== '', fn ($query) => $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            }))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $universities = University::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->orderBy('name')
            ->get();

        $uniMap = $universities->keyBy('id');

        return view('scholarships.index', compact('scholarships', 'universities', 'uniMap', 'q'));
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $this->authUser($request);
        $data = $request->validate([
            'university_id' => 'required|integer',
            'title' => 'required|string|max:190',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string|max:2000',
        ]);
        $data['tenant_id'] = $user->tenant_id;

        $scholarship = Scholarship::query()->create($data);
        $this->audit($request, 'scholarship.create', 'scholarship', $scholarship->id, $data);

        return back()->with('success', 'Scholarship created.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $scholarship = Scholarship::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->findOrFail($id);

        $data = $request->validate([
            'university_id' => 'required|integer',
            'title' => 'required|string|max:190',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string|max:2000',
        ]);
        $scholarship->update($data);
        $this->audit($request, 'scholarship.update', 'scholarship', $scholarship->id, $data);

        return back()->with('success', 'Scholarship updated.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $scholarship = Scholarship::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->findOrFail($id);
        $scholarship->delete();
        $this->audit($request, 'scholarship.delete', 'scholarship', $id);

        return back()->with('success', 'Scholarship deleted.');
    }
}
