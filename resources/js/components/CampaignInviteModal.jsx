import React, { useState } from 'react';
import { apiPost } from '../utils/api';

const CampaignInviteModal = ({ isOpen, onClose, campaignId, campaignName }) => {
    const [inviteType, setInviteType] = useState('user'); // 'user' ou 'character'
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [characterId, setCharacterId] = useState('');
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Carregar personagens do usuário quando modal abrir
    React.useEffect(() => {
        if (isOpen && inviteType === 'character') {
            loadUserCharacters();
        }
    }, [isOpen, inviteType]);

    const loadUserCharacters = async () => {
        try {
            const response = await fetch('/api/characters');
            const data = await response.json();
            setCharacters(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar personagens:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (inviteType === 'user') {
                await apiPost(`/campaigns/${campaignId}/invites/invite-user`, {
                    email,
                    message
                });
            } else {
                await apiPost(`/campaigns/${campaignId}/invites/request-with-character`, {
                    character_id: characterId,
                    message
                });
            }
            
            onClose();
            // TODO: Mostrar notificação de sucesso
        } catch (error) {
            console.error('Erro ao enviar convite:', error);
            setError(error.response?.data?.message || 'Erro ao enviar convite');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setMessage('');
        setCharacterId('');
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            {inviteType === 'user' ? 'Convidar Usuário' : 'Solicitar Entrada'}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    {/* Tabs para escolher tipo de convite */}
                    <div className="mb-4">
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setInviteType('user')}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                    inviteType === 'user'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Convidar Usuário
                            </button>
                            <button
                                type="button"
                                onClick={() => setInviteType('character')}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                    inviteType === 'character'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Solicitar com Personagem
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {inviteType === 'user' ? (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email do usuário
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="usuario@exemplo.com"
                                />
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Personagem
                                </label>
                                <select
                                    value={characterId}
                                    onChange={(e) => setCharacterId(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Selecione um personagem</option>
                                    {characters.map((character) => (
                                        <option key={character.id} value={character.id}>
                                            {character.name} - {character.class} (Nível {character.level})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensagem (opcional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                maxLength={500}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={inviteType === 'user' 
                                    ? "Conte um pouco sobre a campanha..." 
                                    : "Por que você gostaria de participar desta campanha?"
                                }
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {message.length}/500 caracteres
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : (inviteType === 'user' ? 'Enviar Convite' : 'Solicitar Entrada')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CampaignInviteModal;
