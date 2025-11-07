import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CampaignFileUpload = ({ campaignId, onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tamanho (10MB max)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !campaignId) {
            toast.error('Selecione um arquivo para fazer upload');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post(
                `/api/campaigns/${campaignId}/files`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                toast.success('Arquivo enviado com sucesso!');
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
            } else {
                toast.error(response.data.message || 'Erro ao enviar arquivo');
            }
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            toast.error(error.response?.data?.message || 'Erro ao enviar arquivo');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                
                <label
                    htmlFor="file-upload"
                    className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Selecione um arquivo'}
                    </span>
                </label>

                {selectedFile && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Enviando...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Enviar</span>
                            </>
                        )}
                    </button>
                )}
            </div>
            
            {selectedFile && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs text-gray-600 truncate">{selectedFile.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignFileUpload;








