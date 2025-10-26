@extends('layouts.admin')

@section('title', 'Mapa Mental - ' . $campaign->name)

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-brain mr-2"></i>
                        Mapa Mental: {{ $campaign->name }}
                    </h3>
                    <div class="card-tools">
                        <button class="btn btn-success" onclick="exportMindmap()">
                            <i class="fas fa-download mr-1"></i>
                            Exportar
                        </button>
                        <a href="{{ route('admin.mindmap.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left mr-1"></i>
                            Voltar
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="info-box">
                                <span class="info-box-icon bg-info">
                                    <i class="fas fa-users"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Membros</span>
                                    <span class="info-box-number">{{ $campaign->members->count() }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="info-box">
                                <span class="info-box-icon bg-primary">
                                    <i class="fas fa-circle"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Nós</span>
                                    <span class="info-box-number">{{ $campaign->mindmapNodes->count() }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="info-box">
                                <span class="info-box-icon bg-success">
                                    <i class="fas fa-link"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Conexões</span>
                                    <span class="info-box-number">{{ $campaign->mindmapEdges->count() }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="info-box">
                                <span class="info-box-icon bg-warning">
                                    <i class="fas fa-paperclip"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Arquivos</span>
                                    <span class="info-box-number">{{ $campaign->mindmapNodes->sum(function($node) { return $node->files->count(); }) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-header">
                                    <h4>Visualização do Mapa Mental</h4>
                                </div>
                                <div class="card-body">
                                    <div id="mindmap-container" style="height: 500px; border: 1px solid #ddd; background: #f9f9f9;">
                                        <div class="text-center py-5">
                                            <i class="fas fa-brain fa-3x text-muted mb-3"></i>
                                            <h5>Visualização do Mapa Mental</h5>
                                            <p class="text-muted">Aqui seria renderizada a visualização interativa do mapa mental</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h4>Informações da Campanha</h4>
                                </div>
                                <div class="card-body">
                                    <p><strong>Sistema:</strong> {{ $campaign->system }}</p>
                                    <p><strong>Tipo:</strong> {{ $campaign->type }}</p>
                                    <p><strong>Cidade:</strong> {{ $campaign->city }}</p>
                                    <p><strong>Status:</strong> 
                                        <span class="badge badge-{{ $campaign->status === 'active' ? 'success' : 'secondary' }}">
                                            {{ $campaign->status }}
                                        </span>
                                    </p>
                                    <p><strong>Visibilidade:</strong> 
                                        <span class="badge badge-{{ $campaign->visibility === 'public' ? 'success' : 'warning' }}">
                                            {{ $campaign->visibility }}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div class="card mt-3">
                                <div class="card-header">
                                    <h4>Nós do Mapa</h4>
                                </div>
                                <div class="card-body">
                                    @if($campaign->mindmapNodes->count() > 0)
                                        <div class="list-group">
                                            @foreach($campaign->mindmapNodes as $node)
                                                <div class="list-group-item">
                                                    <div class="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <h6 class="mb-1">{{ $node->title }}</h6>
                                                            @if($node->notes)
                                                                <small class="text-muted">{{ Str::limit($node->notes, 50) }}</small>
                                                            @endif
                                                        </div>
                                                        <div>
                                                            <span class="badge badge-info">{{ $node->files->count() }} arquivos</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            @endforeach
                                        </div>
                                    @else
                                        <p class="text-muted">Nenhum nó encontrado.</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function exportMindmap() {
    if (confirm('Deseja exportar este mapa mental?')) {
        window.location.href = '{{ route("admin.mindmap.export.campaign", $campaign) }}';
    }
}
</script>
@endsection
