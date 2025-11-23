import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import UserPreferenceModal from './UserPreferenceModal';
import TagFilterManager from './TagFilterManager';
import BlockedUsersList from './BlockedUsersList';
import UserHeaderCard from './UserHeaderCard';

const ConfiguracoesPage = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('perfil');
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await window.profileService.getProfile();
            setProfileData(response);
        } catch (err) {
            console.error('Erro ao carregar dados do perfil:', err);
            setError('Erro ao carregar dados do perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (updatedData) => {
        try {
            await window.profileService.updateProfile(updatedData);
            await loadProfileData();
        } catch (err) {
            console.error('Erro ao atualizar perfil:', err);
            throw err;
        }
    };

    const handlePreferencesSave = async (preferencesData) => {
        try {
            await window.profileService.updatePreferences(preferencesData);
            setShowPreferencesModal(false);
            await loadProfileData();
        } catch (error) {
            console.error('Erro ao salvar preferências:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="mt-4 text-gray-600">Carregando configurações...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const sections = [
        { id: 'perfil', name: 'Perfil', icon: '👤' },
        { id: 'preferencias', name: 'Preferências', icon: '⚙️' },
        { id: 'filtros', name: 'Filtros de Tags', icon: '🏷️' },
        { id: 'bloqueios', name: 'Usuários Bloqueados', icon: '🚫' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Configurações</h1>
                    <p className="text-gray-600">Gerencie suas preferências e configurações de conta</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar de Navegação */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <nav className="space-y-2">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                            activeSection === section.id
                                                ? 'bg-purple-100 text-purple-700 font-semibold'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="mr-2">{section.icon}</span>
                                        {section.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {activeSection === 'perfil' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Editar Perfil</h2>
                                    <p className="text-gray-600 mb-6">
                                        Atualize suas informações pessoais, avatar e biografia.
                                    </p>
                                    {profileData && (
                                        <UserHeaderCard
                                            user={profileData.user}
                                            stats={profileData.stats}
                                            preferences={profileData.preferences}
                                            onUpdate={handleProfileUpdate}
                                        />
                                    )}
                                </div>
                            )}

                            {activeSection === 'preferencias' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Preferências de Jogo</h2>
                                    <p className="text-gray-600 mb-6">
                                        Configure seus sistemas de RPG preferidos, estilos de jogo e dinâmicas.
                                    </p>
                                    <button
                                        onClick={() => setShowPreferencesModal(true)}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Editar Preferências
                                    </button>
                                </div>
                            )}

                            {activeSection === 'filtros' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Filtros de Tags</h2>
                                    <p className="text-gray-600 mb-6">
                                        Configure quais tags você quer ver (whitelist) ou ocultar (blacklist) no conteúdo.
                                    </p>
                                    {profileData && (
                                        <TagFilterManager
                                            filters={profileData.filters}
                                            onUpdate={loadProfileData}
                                        />
                                    )}
                                </div>
                            )}

                            {activeSection === 'bloqueios' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Usuários Bloqueados</h2>
                                    <p className="text-gray-600 mb-6">
                                        Gerencie a lista de usuários que você bloqueou.
                                    </p>
                                    <BlockedUsersList onUpdate={loadProfileData} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Preferências */}
            {profileData && (
                <UserPreferenceModal
                    isOpen={showPreferencesModal}
                    onClose={() => setShowPreferencesModal(false)}
                    preferences={profileData.preferences}
                    onSave={handlePreferencesSave}
                />
            )}

            <Footer />
        </div>
    );
};

export default ConfiguracoesPage;

