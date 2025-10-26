@extends('layouts.app')

@section('title', 'Editar ' . $character->name)

@section('content')
<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center space-x-4">
                <a href="{{ route('characters.show', $character) }}" class="text-gray-600 hover:text-gray-800">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </a>
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Editar Personagem</h1>
                    <p class="mt-2 text-gray-600">Atualize as informações de {{ $character->name }}</p>
                </div>
            </div>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-lg shadow-md border border-gray-200">
            <form action="{{ route('characters.update', $character) }}" method="POST" class="p-6 space-y-6">
                @csrf
                @method('PUT')
                
                <!-- Basic Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Personagem *
                        </label>
                        <input type="text" name="name" id="name" value="{{ old('name', $character->name) }}" 
                               class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 @error('name') border-red-300 @enderror"
                               placeholder="Ex: Aragorn, Gandalf, Legolas..."
                               required>
                        @error('name')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="level" class="block text-sm font-medium text-gray-700 mb-2">
                            Nível *
                        </label>
                        <input type="number" name="level" id="level" value="{{ old('level', $character->level) }}" min="1" max="100"
                               class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 @error('level') border-red-300 @enderror"
                               required>
                        @error('level')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <div>
                    <label for="system" class="block text-sm font-medium text-gray-700 mb-2">
                        Sistema de RPG *
                    </label>
                    <select name="system" id="system" 
                            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 @error('system') border-red-300 @enderror"
                            required>
                        <option value="">Selecione um sistema</option>
                        @foreach($systems as $key => $label)
                            <option value="{{ $key }}" {{ old('system', $character->system) == $key ? 'selected' : '' }}>{{ $label }}</option>
                        @endforeach
                    </select>
                    @error('system')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="summary" class="block text-sm font-medium text-gray-700 mb-2">
                        Resumo do Personagem
                    </label>
                    <textarea name="summary" id="summary" rows="3" 
                              class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 @error('summary') border-red-300 @enderror"
                              placeholder="Uma breve descrição do personagem, classe, raça, etc.">{{ old('summary', $character->summary) }}</textarea>
                    <p class="mt-1 text-sm text-gray-500">Máximo 1000 caracteres</p>
                    @error('summary')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="backstory" class="block text-sm font-medium text-gray-700 mb-2">
                        História de Fundo
                    </label>
                    <textarea name="backstory" id="backstory" rows="6" 
                              class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 @error('backstory') border-red-300 @enderror"
                              placeholder="Conte a história de fundo do seu personagem, sua origem, motivações, etc.">{{ old('backstory', $character->backstory) }}</textarea>
                    <p class="mt-1 text-sm text-gray-500">Máximo 5000 caracteres</p>
                    @error('backstory')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Campaign Selection -->
                @if($campaigns->count() > 0)
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Participar de Campanhas
                        </label>
                        <div class="space-y-3">
                            @foreach($campaigns as $index => $campaign)
                                @php
                                    $isSelected = $characterCampaigns->has($campaign->id);
                                    $roleNote = $isSelected ? $characterCampaigns[$campaign->id]->pivot->role_note : '';
                                @endphp
                                <div class="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                                    <input type="checkbox" name="campaign_ids[]" value="{{ $campaign->id }}" 
                                           id="campaign_{{ $campaign->id }}" 
                                           {{ $isSelected ? 'checked' : '' }}
                                           class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                                    <label for="campaign_{{ $campaign->id }}" class="flex-1">
                                        <div class="font-medium text-gray-900">{{ $campaign->name }}</div>
                                        <div class="text-sm text-gray-500">{{ $campaign->system }} • {{ $campaign->type }}</div>
                                    </label>
                                    <input type="text" name="role_notes[]" placeholder="Papel/Classe" 
                                           value="{{ $roleNote }}"
                                           class="w-32 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                            @endforeach
                        </div>
                        <p class="mt-2 text-sm text-gray-500">Selecione as campanhas em que deseja participar com este personagem</p>
                    </div>
                @endif

                <!-- Current Campaigns Info -->
                @if($character->campaigns->count() > 0)
                    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h3 class="text-sm font-medium text-blue-800 mb-2">Campanhas Atuais</h3>
                        <div class="space-y-2">
                            @foreach($character->campaigns as $campaign)
                                <div class="text-sm text-blue-700">
                                    • {{ $campaign->name }} ({{ $campaign->system }})
                                    @if($campaign->pivot->role_note)
                                        - {{ $campaign->pivot->role_note }}
                                    @endif
                                </div>
                            @endforeach
                        </div>
                        <p class="text-xs text-blue-600 mt-2">
                            Para remover o personagem de uma campanha, desmarque a opção acima.
                        </p>
                    </div>
                @endif

                <!-- Form Actions -->
                <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <a href="{{ route('characters.show', $character) }}" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                    </a>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
// Auto-resize textareas
document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
});

// Character counter for textareas
function updateCharacterCount(textareaId, maxLength) {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(textareaId + '_counter');
    
    if (textarea && counter) {
        const remaining = maxLength - textarea.value.length;
        counter.textContent = `${remaining} caracteres restantes`;
        counter.className = remaining < 50 ? 'text-red-500' : 'text-gray-500';
    }
}

// Initialize counters
document.getElementById('summary').addEventListener('input', () => updateCharacterCount('summary', 1000));
document.getElementById('backstory').addEventListener('input', () => updateCharacterCount('backstory', 5000));
</script>
@endsection
