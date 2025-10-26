import React from 'react';

const CampaignHeader = () => {
    return (
        <header className="bg-gray-100 border-b border-gray-200 px-6 py-4">
            <div className="max-w-full mx-auto flex items-center justify-between">
                {/* Botão Voltar */}
                <div className="flex items-center">
                    <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Sair
                    </button>
                </div>

                {/* Logo */}
                <div className="flex items-center">
                    <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors duration-200">
                        Logo
                    </button>
                </div>

                {/* Perfil do Usuário */}
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CampaignHeader;
