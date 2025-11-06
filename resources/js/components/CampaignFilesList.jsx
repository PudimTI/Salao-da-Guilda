import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CampaignFilesList = ({ campaignId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFiles();
    }, [campaignId]);

    const loadFiles = async () => {
        if (!campaignId) return;
        
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/campaigns/${campaignId}/files`);
            if (response.data.success && response.data.data) {
                setFiles(response.data.data);
            } else {
                setError(response.data.message || 'Erro ao carregar arquivos');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao carregar arquivos');
            console.error('Erro ao carregar arquivos:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'image':
                return (
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'video':
                return (
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                );
            case 'audio':
                return (
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
        }
    };

    const handleFileClick = (file) => {
        if (file.url) {
            window.open(file.url, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                <p className="text-sm text-gray-600">Carregando arquivos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-red-600">
                <p className="text-center">Erro: {error}</p>
                <button
                    onClick={loadFiles}
                    className="mt-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4">
            {files.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Nenhum arquivo encontrado</p>
                    <p className="text-sm mt-2">Faça upload de um arquivo para começar</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            onClick={() => handleFileClick(file)}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            {/* Ícone do arquivo */}
                            <div className="flex-shrink-0">
                                {getFileIcon(file.type)}
                            </div>
                            
                            {/* Informações do arquivo */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                    {file.uploader && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <p className="text-xs text-gray-500 truncate">
                                                {file.uploader.display_name || file.uploader.name}
                                            </p>
                                        </>
                                    )}
                                    {file.uploaded_at && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <p className="text-xs text-gray-500">
                                                {new Date(file.uploaded_at).toLocaleDateString()}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignFilesList;

