@extends('layouts.admin')

@section('title', 'Mapas Mentais - Admin')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-brain mr-2"></i>
                        Mapas Mentais das Campanhas
                    </h3>
                    <div class="card-tools">
                        <button class="btn btn-primary" onclick="exportAll()">
                            <i class="fas fa-download mr-1"></i>
                            Exportar Todos
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    @if($campaigns->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Campanha</th>
                                        <th>Dono</th>
                                        <th>Nós</th>
                                        <th>Conexões</th>
                                        <th>Última Atualização</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($campaigns as $campaign)
                                        <tr>
                                            <td>
                                                <strong>{{ $campaign->name }}</strong>
                                                <br>
                                                <small class="text-muted">{{ $campaign->system }}</small>
                                            </td>
                                            <td>{{ $campaign->owner->name }}</td>
                                            <td>
                                                <span class="badge badge-info">
                                                    {{ $campaign->mindmapNodes->count() }} nós
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge badge-success">
                                                    {{ $campaign->mindmapEdges->count() }} conexões
                                                </span>
                                            </td>
                                            <td>
                                                {{ $campaign->mindmapNodes->max('updated_at')?->diffForHumans() ?? 'N/A' }}
                                            </td>
                                            <td>
                                                <a href="{{ route('admin.mindmap.show', $campaign) }}" 
                                                   class="btn btn-sm btn-primary">
                                                    <i class="fas fa-eye"></i>
                                                    Visualizar
                                                </a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="d-flex justify-content-center">
                            {{ $campaigns->links() }}
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-brain fa-3x text-muted mb-3"></i>
                            <h4>Nenhum mapa mental encontrado</h4>
                            <p class="text-muted">As campanhas ainda não criaram mapas mentais.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function exportAll() {
    if (confirm('Deseja exportar todos os mapas mentais?')) {
        window.location.href = '{{ route("admin.mindmap.export") }}';
    }
}
</script>
@endsection
