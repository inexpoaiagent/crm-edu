<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Student;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SearchController extends Controller
{
    public function index(Request $request): View
    {
        $user = $this->authUser($request);
        $q = trim((string) $request->query('q', ''));
        $stage = trim((string) $request->query('stage', ''));
        $country = trim((string) $request->query('country', ''));
        $status = trim((string) $request->query('status', ''));

        $students = Student::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->whereNull('deleted_at')
            ->when($q !== '', fn ($query) => $query->where(function ($sub) use ($q) {
                $sub->where('full_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('field_of_study', 'like', "%{$q}%");
            }))
            ->when($stage !== '', fn ($query) => $query->where('stage', $stage))
            ->when($country !== '', fn ($query) => $query->where('target_country', 'like', "%{$country}%"))
            ->latest('id')
            ->limit(30)
            ->get();

        $applications = Application::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->when($q !== '', fn ($query) => $query->where(function ($sub) use ($q) {
                $sub->where('program', 'like', "%{$q}%")
                    ->orWhere('intake', 'like', "%{$q}%")
                    ->orWhere('notes', 'like', "%{$q}%");
            }))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest('id')
            ->limit(30)
            ->get();

        $universities = University::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->when($q !== '', fn ($query) => $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('country', 'like', "%{$q}%")
                    ->orWhere('programs_summary', 'like', "%{$q}%");
            }))
            ->latest('id')
            ->limit(20)
            ->get();

        return view('search.index', compact('q', 'stage', 'country', 'status', 'students', 'applications', 'universities'));
    }
}
