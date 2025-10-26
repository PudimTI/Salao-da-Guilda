import React, { useState, useEffect } from 'react';
import UserPreferenceModal from './UserPreferenceModal';

const UserHeaderCard = ({ user, stats, preferences, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        display_name: user?.display_name || '',
        bio: user?.bio || '',
        avatar: null
    });
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState(user);

    // Atualizar currentUser quando user prop mudar
    useEffect(() => {
        setCurrentUser(user);
        setEditData({
            display_name: user?.display_name || '',
            bio: user?.bio || '',
            avatar: null
        });
    }, [user]);

    const handleEdit = () => {
        console.log('✏️ UserHeaderCard: Iniciando edição do perfil');
        console.log('✏️ UserHeaderCard: Dados atuais do usuário:', {
            display_name: user?.display_name,
            bio: user?.bio,
            avatar_url: user?.avatar_url
        });
        
        setIsEditing(true);
        setEditData({
            display_name: user?.display_name || '',
            bio: user?.bio || '',
            avatar: null
        });
        
        console.log('✏️ UserHeaderCard: Modo de edição ativado');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            console.log('💾 UserHeaderCard: Iniciando salvamento do perfil', editData);
            console.log('💾 UserHeaderCard: Dados a serem enviados:', {
                display_name: editData.display_name,
                bio: editData.bio,
                hasAvatar: !!editData.avatar,
                avatarInfo: editData.avatar ? {
                    name: editData.avatar.name,
                    size: editData.avatar.size,
                    type: editData.avatar.type
                } : null
            });
            
            await onUpdate(editData);
            console.log('✅ UserHeaderCard: Perfil salvo com sucesso');
            setIsEditing(false);
            
            // Atualizar os dados locais após salvamento bem-sucedido
            setCurrentUser(prev => ({
                ...prev,
                display_name: editData.display_name,
                bio: editData.bio,
                avatar_url: editData.avatar ? URL.createObjectURL(editData.avatar) : prev.avatar_url
            }));
            
            setEditData({
                display_name: editData.display_name,
                bio: editData.bio,
                avatar: null
            });
        } catch (error) {
            console.error('❌ UserHeaderCard: Erro ao salvar perfil:', {
                message: error.message,
                editData: editData,
                error: error
            });
            // Mostrar erro para o usuário
            alert('Erro ao salvar perfil: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        console.log('❌ UserHeaderCard: Cancelando edição do perfil');
        console.log('❌ UserHeaderCard: Dados originais restaurados:', {
            display_name: user?.display_name,
            bio: user?.bio
        });
        
        setIsEditing(false);
        setEditData({
            display_name: user?.display_name || '',
            bio: user?.bio || '',
            avatar: null
        });
        
        console.log('❌ UserHeaderCard: Modo de edição cancelado');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('📁 UserHeaderCard: Arquivo de avatar selecionado:', {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            });
            setEditData(prev => ({ ...prev, avatar: file }));
            console.log('📁 UserHeaderCard: Avatar adicionado ao editData');
        } else {
            console.log('📁 UserHeaderCard: Nenhum arquivo selecionado');
        }
    };

    const handlePreferencesClick = () => {
        console.log('⚙️ UserHeaderCard: Abrindo modal de preferências');
        setShowPreferencesModal(true);
    };

    const handlePreferencesSave = async (preferencesData) => {
        try {
            console.log('💾 UserHeaderCard: Salvando preferências:', preferencesData);
            await window.profileService.updatePreferences(preferencesData);
            console.log('✅ UserHeaderCard: Preferências salvas com sucesso');
            setShowPreferencesModal(false);
            // Recarregar dados do perfil se necessário
            if (onUpdate) {
                // Trigger a reload of profile data
                window.location.reload();
            }
        } catch (error) {
            console.error('❌ UserHeaderCard: Erro ao salvar preferências:', error);
            throw error;
        }
    };

    return (
        <section className="bg-purple-50 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="relative bg-white border border-purple-200 rounded-2xl p-6 shadow-lg shadow-purple-100">
                    {!isEditing ? (
                        <button 
                            onClick={handleEdit}
                            className="absolute right-4 top-4 border border-purple-300 text-purple-700 px-4 py-1.5 rounded-md text-sm hover:bg-purple-50"
                        >
                            Editar
                        </button>
                    ) : (
                        <div className="absolute right-4 top-4 flex space-x-2">
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-purple-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button 
                                onClick={handleCancel}
                                className="border border-purple-300 text-purple-700 px-4 py-1.5 rounded-md text-sm hover:bg-purple-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col items-center">
                        <div className="w-28 h-28 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border-2 border-purple-200">
                            {currentUser?.avatar_url ? (
                                <img 
                                    src={currentUser.avatar_url} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <svg className="w-12 h-12 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="w-full max-w-md mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-purple-700 mb-1">
                                        Nome de exibição
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.display_name}
                                        onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-700 mb-1">
                                        Biografia
                                    </label>
                                    <textarea
                                        value={editData.bio}
                                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-700 mb-1">
                                        Avatar
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="mt-4 text-2xl font-bold text-gray-800">
                                    {currentUser?.display_name || 'Usuário'}
                                </h1>
                                <div className="text-gray-500">@{currentUser?.handle || 'user'}</div>
                                <p className="mt-4 text-center text-gray-600 max-w-md">
                                    {currentUser?.bio || 'Nenhuma biografia definida'}
                                </p>
                            </>
                        )}

                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center space-x-8 text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2l3 7h7l-5.5 4.5L18 21l-6-3.5L6 21l1.5-7.5L2 9h7l3-7z" />
                                    </svg>
                                    <span><span className="font-semibold">{stats?.connections_count || 0}</span> Conexões</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6l-9 4 9 4 9-4-9-4zm0 8l-9-4v6l9 4 9-4v-6l-9 4z" />
                                    </svg>
                                    <span><span className="font-semibold">{stats?.total_campaigns || 0}</span> Campanhas</span>
                                </div>
                            </div>
                            
                            {/* Botão de Preferências - Só aparece no modo de edição */}
                            {isEditing && (
                                <button
                                    onClick={handlePreferencesClick}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Preferências</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Preferências */}
            <UserPreferenceModal
                isOpen={showPreferencesModal}
                onClose={() => setShowPreferencesModal(false)}
                preferences={preferences}
                onSave={handlePreferencesSave}
            />
        </section>
    );
};

export default UserHeaderCard;




