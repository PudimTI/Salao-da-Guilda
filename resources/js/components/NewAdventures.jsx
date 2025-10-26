import React, { useState } from 'react';
import TagSelector from './TagSelector';

const NewAdventures = ({ recommendedCampaign }) => {
    const [activeTab, setActiveTab] = useState('recommendations');
    const [campaignTags, setCampaignTags] = useState([]);

    return (
        <section className="py-16 px-6 bg-gray-50">
            <div className="max-w-7xl mx-auto text-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-800 mb-8">
                    Comece novas aventuras
                </h2>

                {/* Tabs */}
                <div className="flex justify-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 max-w-md mx-auto mb-12">
                    <button
                        onClick={() => setActiveTab('recommendations')}
                        className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                            activeTab === 'recommendations'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Recomendações
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                            activeTab === 'create'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Criar
                    </button>
                </div>

                {/* Content based on active tab */}
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'recommendations' ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Recommended Campaign */}
                            {recommendedCampaign && (
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        {recommendedCampaign.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {recommendedCampaign.description || 'Campanha recomendada especialmente para você.'}
                                    </p>
                                    <a 
                                        href={`/campaigns/${recommendedCampaign.id}`}
                                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                                    >
                                        Ver detalhes →
                                    </a>
                                </div>
                            )}
                            
                            {/* Placeholder cards if no recommendation */}
                            {!recommendedCampaign && [1, 2, 3].map((item) => (
                                <div key={item} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        Aventura Recomendada {item}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Uma aventura épica baseada no seu perfil de jogador.
                                    </p>
                                    <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                                        Ver detalhes →
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                            <div className="max-w-md mx-auto text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    Crie sua própria aventura
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Desenvolva campanhas únicas e convide outros aventureiros para participar.
                                </p>
                                
                                <a 
                                    href="/campaigns/create"
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-block"
                                >
                                    Criar Campanha
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NewAdventures;









