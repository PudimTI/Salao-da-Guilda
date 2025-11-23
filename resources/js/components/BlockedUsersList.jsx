import React, { useState, useEffect } from 'react';

const BlockedUsersList = ({ onUpdate }) => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unblocking, setUnblocking] = useState(null);

    useEffect(() => {
        loadBlockedUsers();
    }, []);

    const loadBlockedUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/friendships/blocked', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBlockedUsers(data.data || []);
            } else {
                throw new Error('Erro ao carregar usuários bloqueados');
            }
        } catch (err) {
            console.error('Erro ao carregar usuários bloqueados:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (userId) => {
        if (!confirm('Tem certeza que deseja desbloquear este usuário?')) {
            return;
        }

        try {
            setUnblocking(userId);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/api/friendships/unblock', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    user_id: userId,
                    _token: csrfToken
                })
            });

            if (response.ok) {
                await loadBlockedUsers();
                if (onUpdate) {
                    onUpdate();
                }
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Erro ao desbloquear usuário');
            }
        } catch (err) {
            console.error('Erro ao desbloquear usuário:', err);
            alert('Erro ao desbloquear usuário: ' + err.message);
        } finally {
            setUnblocking(null);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Carregando usuários bloqueados...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    if (blockedUsers.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário bloqueado</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Você não bloqueou nenhum usuário ainda.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                    Você bloqueou <strong>{blockedUsers.length}</strong> {blockedUsers.length === 1 ? 'usuário' : 'usuários'}.
                    Usuários bloqueados não podem interagir com você na plataforma.
                </p>
            </div>

            <div className="space-y-3">
                {blockedUsers.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border-2 border-purple-200">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.display_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg className="w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">{user.display_name || 'Usuário'}</h4>
                                <p className="text-sm text-gray-500">@{user.handle}</p>
                                {user.blocked_since && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Bloqueado em {new Date(user.blocked_since).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleUnblock(user.id)}
                            disabled={unblocking === user.id}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {unblocking === user.id ? 'Desbloqueando...' : 'Desbloquear'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlockedUsersList;


