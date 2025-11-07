<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReportRequest;
use App\Http\Requests\UpdateReportStatusRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService)
    {
    }

    public function index(Request $request)
    {
        $this->authorizeModerator();

        $perPage = min(max($request->integer('per_page', 20), 1), 100);

        $reports = Report::query()
            ->with(['reporter', 'handledBy', 'target'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('target_type'), fn ($query) => $query->where('target_type', $request->string('target_type')))
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return ReportResource::collection($reports);
    }

    public function show(Request $request, Report $report): ReportResource
    {
        $user = $request->user();

        if ($user === null) {
            abort(401);
        }

        if (! $user->isModerator() && $report->reporter_id !== $user->id) {
            abort(403, 'Você não tem permissão para visualizar esta denúncia.');
        }

        return new ReportResource($report->load(['reporter', 'handledBy', 'target']));
    }

    public function store(StoreReportRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $reporter = $request->user();

        $targetType = $validated['target_type'];
        $targetClass = config("reports.targets.{$targetType}");

        if ($targetClass === null) {
            throw ValidationException::withMessages([
                'target_type' => __('Tipo de alvo inválido.'),
            ]);
        }

        $target = $targetClass::find($validated['target_id']);

        if ($target === null) {
            throw ValidationException::withMessages([
                'target_id' => __('Registro alvo não encontrado.'),
            ]);
        }

        if ($targetType === 'user' && $target->id === $reporter->id) {
            throw ValidationException::withMessages([
                'target_id' => __('Você não pode denunciar a si mesmo.'),
            ]);
        }

        $evidenceUrls = collect($validated['evidence_urls'] ?? [])
            ->map(fn ($url) => trim($url))
            ->filter()
            ->values()
            ->all();

        $report = Report::create([
            'reporter_id' => $reporter->id,
            'target_type' => $targetType,
            'target_id' => $target->getKey(),
            'reason_text' => $validated['reason_text'],
            'evidence_urls' => $evidenceUrls,
            'status' => Report::STATUS_OPEN,
        ]);

        Log::channel('single')->info('Nova denúncia registrada', [
            'report_id' => $report->id,
            'reporter_id' => $reporter->id,
            'target_type' => $targetType,
            'target_id' => $target->getKey(),
        ]);

        return (new ReportResource($report->load(['reporter', 'target'])))->response()->setStatusCode(201);
    }

    public function update(UpdateReportStatusRequest $request, Report $report): ReportResource
    {
        $actor = $request->user();
        $validated = $request->validated();

        $report = $this->reportService->updateStatus(
            $report,
            $validated['status'],
            $validated['resolution_notes'] ?? null,
            $actor,
            $validated['target_user_status'] ?? null,
        );

        return new ReportResource($report->load(['reporter', 'handledBy', 'target']));
    }

    protected function authorizeModerator(): void
    {
        $user = auth()->user();

        if ($user === null || ! $user->isModerator()) {
            abort(403, 'Acesso permitido apenas para moderadores ou administradores.');
        }
    }
}


