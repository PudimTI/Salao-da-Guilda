import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

const DEFAULT_PREFS = {
    systems: [],
    styles: [],
    dynamics: [],
};

const systemOptions = [
    'D&D 5e', 'D&D 3.5', 'Pathfinder 1e', 'Pathfinder 2e', 'Call of Cthulhu',
    'Vampire: The Masquerade', 'World of Darkness', 'GURPS', 'Savage Worlds',
    'FATE', 'Dungeon World', 'Blades in the Dark', 'Cyberpunk 2020',
    'Shadowrun', 'Warhammer 40k', 'Star Wars RPG', 'Outros',
];

const styleOptions = [
    'Narrativo', 'Tático', 'Sandbox', 'Linear', 'Roleplay', 'Combat',
    'Exploração', 'Mistério', 'Horror', 'Aventura', 'Drama', 'Comédia',
    'Realista', 'Fantástico', 'Sci-Fi', 'Steampunk', 'Cyberpunk',
];

const dynamicOptions = [
    'Cooperação', 'Competição', 'PvP', 'PvE', 'Exploração', 'Social',
    'Estratégico', 'Ação', 'Puzzle', 'Investigação', 'Político',
    'Econômico', 'Religioso', 'Militar', 'Diplomático', 'Criativo',
];

const UserOnboardingPreferencesModal = ({
    isOpen,
    onClose,
    onComplete,
    initialPreferences = DEFAULT_PREFS,
    initialBlacklist = [],
}) => {
    const [preferences, setPreferences] = useState(DEFAULT_PREFS);
    const [blacklist, setBlacklist] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [tagSearch, setTagSearch] = useState('');
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const hasFetchedTagsRef = useRef(false);
    const hasInitializedRef = useRef(false);

    // Inicializar estado apenas uma vez quando o modal abre
    useEffect(() => {
        if (!isOpen) {
            hasInitializedRef.current = false;
            hasFetchedTagsRef.current = false;
            return;
        }

        // Só inicializar se ainda não foi inicializado
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            setPreferences({
                systems: Array.isArray(initialPreferences?.systems) ? initialPreferences.systems : [],
                styles: Array.isArray(initialPreferences?.styles) ? initialPreferences.styles : [],
                dynamics: Array.isArray(initialPreferences?.dynamics) ? initialPreferences.dynamics : [],
            });
            setBlacklist(Array.isArray(initialBlacklist) ? initialBlacklist : []);
            setSuccess(false);
            setError(null);
        }
    }, [isOpen]); // Removido initialPreferences e initialBlacklist das dependências

    useEffect(() => {
        if (!isOpen || hasFetchedTagsRef.current) {
            return;
        }

        let isCancelled = false;

        const fetchTags = async () => {
            try {
                hasFetchedTagsRef.current = true;
                setIsLoadingTags(true);
                const token = localStorage.getItem('auth_token');
                const response = await fetch('/api/tags/popular?limit=50', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || 'Não foi possível carregar as tags populares.');
                }

                const data = await response.json();
                if (!isCancelled) {
                    setAvailableTags(Array.isArray(data?.data) ? data.data : []);
                }
            } catch (err) {
                console.error('Erro ao carregar tags populares:', err);
                if (!isCancelled) {
                    setError('Não foi possível carregar as sugestões de tags. Você poderá ajustar os filtros depois.');
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingTags(false);
                }
            }
        };

        fetchTags();

        return () => {
            isCancelled = true;
        };
    }, [isOpen]);

    // Criar Map de tags para busca O(1) ao invés de O(n)
    const tagsMap = useMemo(() => {
        const map = new Map();
        availableTags.forEach(tag => {
            map.set(tag.id, tag);
        });
        return map;
    }, [availableTags]);

    const filteredTags = useMemo(() => {
        if (!tagSearch.trim()) {
            return availableTags;
        }
        const search = tagSearch.toLowerCase();
        return availableTags.filter((tag) =>
            tag.name.toLowerCase().includes(search) ||
            (tag.type && tag.type.toLowerCase().includes(search))
        );
    }, [availableTags, tagSearch]);

    const handleToggleOption = useCallback((category, value) => {
        setPreferences((prev) => {
            const currentValues = prev[category] || [];
            const exists = currentValues.includes(value);
            return {
                ...prev,
                [category]: exists
                    ? currentValues.filter((item) => item !== value)
                    : [...currentValues, value],
            };
        });
    }, []);

    const handleAddCustomValue = useCallback((category, value) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        setPreferences((prev) => {
            const currentValues = prev[category] || [];
            if (currentValues.includes(trimmed)) return prev;
            return {
                ...prev,
                [category]: [...currentValues, trimmed],
            };
        });
    }, []);

    const handleToggleBlacklistTag = useCallback((tagId) => {
        setBlacklist((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    }, []);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const savePreferences = window.profileService
                ? window.profileService.updatePreferences(preferences)
                : fetch('/api/profile/preferences', {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json',
                          'X-Requested-With': 'XMLHttpRequest',
                          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                          ...(localStorage.getItem('auth_token')
                              ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                              : {}),
                      },
                      credentials: 'same-origin',
                      body: JSON.stringify({ ...preferences, _token: csrfToken }),
                  });

            const saveFilters = window.profileService
                ? window.profileService.updateFilters({ blacklist_tags: blacklist })
                : fetch('/api/profile/filters', {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json',
                          'X-Requested-With': 'XMLHttpRequest',
                          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                          ...(localStorage.getItem('auth_token')
                              ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                              : {}),
                      },
                      credentials: 'same-origin',
                      body: JSON.stringify({
                          blacklist_tags: blacklist,
                          _token: csrfToken,
                      }),
                  });

            await Promise.all([savePreferences, saveFilters]);

            setSuccess(true);
            setTimeout(() => {
                if (onComplete) {
                    onComplete();
                }
            }, 500);
        } catch (err) {
            console.error('Erro ao salvar preferências no onboarding:', err);
            setError('Não foi possível salvar suas preferências agora. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    // Extrair valores selecionados diretamente (arrays são comparados por referência, o que é suficiente)
    const selectedSystems = preferences.systems || [];
    const selectedStyles = preferences.styles || [];
    const selectedDynamics = preferences.dynamics || [];

    // Componente memoizado para botões de opção
    const OptionButton = React.memo(({ option, isSelected, category, onToggle }) => (
        <button
            type="button"
            onClick={() => onToggle(category, option)}
            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                isSelected
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:text-purple-700'
            }`}
        >
            {option}
        </button>
    ));

    OptionButton.displayName = 'OptionButton';

    // Componente memoizado para tag selecionada
    const SelectedTag = React.memo(({ value, category, onRemove }) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">
            {value}
            <button
                type="button"
                onClick={() => onRemove(category, value)}
                className="ml-2 text-purple-600 hover:text-purple-800"
                aria-label={`Remover ${value}`}
            >
                ×
            </button>
        </span>
    ));

    SelectedTag.displayName = 'SelectedTag';

    // Função memoizada para renderizar seção de opções
    const renderOptionSection = useCallback((title, category, options, accentColor, selectedValues) => (
        <section className="space-y-4">
            <header>
                <h3 className="text-lg font-semibold" style={{ color: accentColor }}>
                    {title}
                </h3>
                <p className="text-sm text-gray-500">
                    Selecione quantos desejar ou adicione opções personalizadas.
                </p>
            </header>

            <div className="flex flex-wrap gap-2">
                {selectedValues.map((value) => (
                    <SelectedTag
                        key={value}
                        value={value}
                        category={category}
                        onRemove={handleToggleOption}
                    />
                ))}
            </div>

            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <OptionButton
                        key={option}
                        option={option}
                        isSelected={selectedValues.includes(option)}
                        category={category}
                        onToggle={handleToggleOption}
                    />
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={`Adicionar ${title.toLowerCase()} personalizada`}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            handleAddCustomValue(category, event.currentTarget.value);
                            event.currentTarget.value = '';
                        }
                    }}
                />
                <button
                    type="button"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    onClick={(event) => {
                        const input = event.currentTarget.previousSibling;
                        if (input && input.value) {
                            handleAddCustomValue(category, input.value);
                            input.value = '';
                        }
                    }}
                >
                    Adicionar
                </button>
            </div>
        </section>
    ), [handleToggleOption, handleAddCustomValue]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                <header className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Personalize sua experiência</h2>
                            <p className="mt-1 text-purple-100">
                                Ajuste suas preferências de jogo e filtre o conteúdo que não deseja ver.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="text-purple-200 hover:text-white transition-colors text-lg"
                            onClick={onClose}
                        >
                            Fechar
                        </button>
                    </div>
                </header>

                <div className="px-8 py-6 space-y-8 max-h-[75vh] overflow-y-auto">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                            Preferências atualizadas! Vamos te redirecionar em instantes.
                        </div>
                    )}

                    <section className="grid gap-8 md:grid-cols-2">
                        {renderOptionSection('Sistemas preferidos', 'systems', systemOptions, '#6b21a8', selectedSystems)}
                        {renderOptionSection('Estilos de jogo', 'styles', styleOptions, '#2563eb', selectedStyles)}
                        {renderOptionSection('Dinâmicas que você curte', 'dynamics', dynamicOptions, '#059669', selectedDynamics)}
                    </section>

                    <section className="space-y-4">
                        <header>
                            <h3 className="text-lg font-semibold text-gray-800">Blacklist de Tags</h3>
                            <p className="text-sm text-gray-500">
                                Selecione tags que você não quer ver nas recomendações ou no feed.
                                Você pode alterar isso depois no seu perfil.
                            </p>
                        </header>

                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Buscar tags por nome ou tipo"
                                    value={tagSearch}
                                    onChange={(event) => setTagSearch(event.target.value)}
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                    🔍
                                </span>
                            </div>
                            {isLoadingTags && (
                                <span className="text-sm text-gray-500">Carregando tags...</span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {blacklist.map((tagId) => {
                                const tag = tagsMap.get(tagId); // O(1) lookup ao invés de O(n) find
                                return (
                                    <span
                                        key={tagId}
                                        className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                                    >
                                        {tag ? `${tag.name} (${tag.type || 'geral'})` : `Tag #${tagId}`}
                                        <button
                                            type="button"
                                            className="ml-2 text-red-500 hover:text-red-700"
                                            onClick={() => handleToggleBlacklistTag(tagId)}
                                            aria-label={`Remover ${tag?.name || tagId} da blacklist`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })}
                            {blacklist.length === 0 && (
                                <span className="text-sm text-gray-500">
                                    Nenhuma tag bloqueada por enquanto.
                                </span>
                            )}
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                            {filteredTags.length === 0 ? (
                                <p className="text-sm text-gray-500">Nenhuma tag encontrada para sua busca.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {filteredTags.map((tag) => {
                                        const isSelected = blacklist.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => handleToggleBlacklistTag(tag.id)}
                                                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                                                    isSelected
                                                        ? 'border-red-500 bg-red-500 text-white shadow-sm'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-600'
                                                }`}
                                            >
                                                {tag.name}
                                                {tag.type ? (
                                                    <span className="ml-2 text-xs uppercase text-gray-400">
                                                        {tag.type}
                                                    </span>
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

        <footer className="flex flex-col gap-3 bg-gray-50 px-8 py-5 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-gray-500">
                        Você poderá ajustar essas opções depois na página de perfil.
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <button
                            type="button"
                            onClick={onComplete}
                            className="rounded-md border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Pular por enquanto
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-md bg-purple-600 px-6 py-2 text-white shadow-sm transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar e continuar'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default UserOnboardingPreferencesModal;

