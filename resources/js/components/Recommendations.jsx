import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, handleApiError } from '../utils/api';

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);

    // Buscar recomendações do usuário
    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await apiGet('/api/recommendations?type=campaign&limit=3');
            
            if (response.success && response.data.data) {
                setRecommendations(response.data.data);
                // Selecionar a primeira recomendação por padrão
                if (response.data.data.length > 0) {
                    setSelectedRecommendation(response.data.data[0]);
                }
            } else {
                setRecommendations([]);
            }
        } catch (err) {
            console.error('Erro ao buscar recomendações:', err);
            setError('Erro ao carregar recomendações');
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    // Gerar novas recomendações
    const generateRecommendations = async () => {
        try {
            setLoading(true);
            const response = await apiPost('/api/recommendations/generate', {
                limit: 3,
                force: true
            });
            
            if (response.success) {
                await fetchRecommendations(); // Recarregar após gerar
            }
        } catch (err) {
            console.error('Erro ao gerar recomendações:', err);
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    // Marcar recomendação como visualizada
    const markAsViewed = async (recommendationId) => {
        try {
            await apiPost(`/api/recommendations/${recommendationId}/view`);
        } catch (err) {
            console.error('Erro ao marcar como visualizada:', err);
        }
    };

    // Solicitar participação na campanha
    const requestCampaignParticipation = async (campaignId) => {
        try {
            // Aqui você implementaria a lógica para solicitar participação
            // Por enquanto, apenas mostra um alerta
            alert('Funcionalidade de solicitação de participação será implementada em breve!');
        } catch (err) {
            console.error('Erro ao solicitar participação:', err);
            handleApiError(err);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    // Se estiver carregando
    if (loading) {
        return (
            <section className="py-16 px-6 bg-rose-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 text-center">
                        Recomendações
                    </h2>
                    <p className="text-gray-600 text-center mt-4 max-w-xl mx-auto">
                        Carregando suas recomendações personalizadas...
                    </p>
                    <div className="mt-10 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </div>
            </section>
        );
    }

    // Se houver erro
    if (error) {
        return (
            <section className="py-16 px-6 bg-rose-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 text-center">
                        Recomendações
                    </h2>
                    <div className="mt-10 text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-lg font-medium">{error}</p>
                        </div>
                        <button 
                            onClick={fetchRecommendations}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // Se não houver recomendações
    if (recommendations.length === 0) {
        return (
            <section className="py-16 px-6 bg-rose-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 text-center">
                        Recomendações
                    </h2>
                    <p className="text-gray-600 text-center mt-4 max-w-xl mx-auto">
                        Não encontramos recomendações personalizadas para você ainda.
                    </p>
                    <div className="mt-10 text-center">
                        <button 
                            onClick={generateRecommendations}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Gerar Recomendações
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-6 bg-rose-50">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 text-center">
                    Recomendações
                </h2>
                <p className="text-gray-600 text-center mt-4 max-w-xl mx-auto">
                    Com base nas suas preferências, separamos essas campanhas para você
                </p>

                {/* Lista de recomendações */}
                <div className="mt-8 grid md:grid-cols-3 gap-4 mb-6">
                    {recommendations.map((rec) => (
                        <button
                            key={rec.id}
                            onClick={() => {
                                setSelectedRecommendation(rec);
                                markAsViewed(rec.id);
                            }}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                selectedRecommendation?.id === rec.id
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 bg-white hover:border-indigo-300'
                            }`}
                        >
                            <div className="text-left">
                                <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 text-sm truncate">
                                            {rec.target?.name || 'Campanha'}
                                        </h4>
                                        <p className="text-xs text-gray-600">
                                            Score: {Math.round(rec.score * 100)}%
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                    {rec.reason}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detalhes da recomendação selecionada */}
                {selectedRecommendation && (
                    <div className="mt-10 border border-gray-300 rounded-xl p-6 bg-white">
                        <div className="grid md:grid-cols-3 gap-6 items-center">
                            {/* Informações da campanha */}
                            <div className="flex items-center md:col-span-1">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {selectedRecommendation.target?.name || 'Nome da campanha'}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {selectedRecommendation.target?.description || 'Uma descrição dessa campanha criada!'}
                                    </p>
                                    <div className="mt-2 flex items-center space-x-2">
                                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                            {selectedRecommendation.target?.system || 'Sistema'}
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                            Score: {Math.round(selectedRecommendation.score * 100)}%
                                        </span>
                                    </div>
                                    <hr className="mt-4 border-gray-300" />
                                </div>
                            </div>

                            {/* Criado por + botão */}
                            <div className="md:col-span-2 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-800 font-semibold">Criado por:</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
                                            {selectedRecommendation.target?.owner?.avatar_url ? (
                                                <img 
                                                    src={selectedRecommendation.target.owner.avatar_url} 
                                                    alt="Avatar" 
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-700">
                                            {selectedRecommendation.target?.owner?.display_name || 'Usuário'}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => requestCampaignParticipation(selectedRecommendation.target_id)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium transition-colors"
                                >
                                    Solicitar
                                </button>
                            </div>
                        </div>

                        {/* Tags da campanha */}
                        {selectedRecommendation.target?.tags && selectedRecommendation.target.tags.length > 0 && (
                            <div className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                    {selectedRecommendation.target.tags.map((tag) => (
                                        <span 
                                            key={tag.id}
                                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 text-center">
                            <button 
                                onClick={generateRecommendations}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                                Gerar novas recomendações
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Recommendations;




