import React from 'react';

const CampaignListItem = ({ campaign }) => {
    return (
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <div className="grid grid-cols-12 gap-4 items-center">
                {/* Thumb */}
                <div className="col-span-2">
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7h18M3 17h18M7 3v18M17 3v18" />
                        </svg>
                    </div>
                </div>

                {/* Info */}
                <div className="col-span-7">
                    <div className="text-sm text-gray-400">{campaign.system}</div>
                    <div className="text-xl font-bold text-gray-800">{campaign.name}</div>
                    <div className="text-gray-600">{campaign.description}</div>
                    <div className="text-sm text-gray-500 mt-1">
                        Players: {campaign.members_count} | Status: {campaign.status} | Cidade: {campaign.city}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                        {campaign.tags && campaign.tags.map((tag) => (
                            <span key={tag.id} className="inline-flex items-center text-[10px] text-white bg-indigo-600 px-2 py-0.5 rounded">
                                {tag.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Created by / Button */}
                <div className="col-span-3 flex items-center justify-between md:justify-end space-x-3">
                    <div className="text-gray-800 font-semibold">Criado por:</div>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </div>
                        <span className="text-sm text-gray-600">{campaign.owner?.display_name || campaign.owner?.name || 'Usuário'}</span>
                    </div>
                    {campaign.is_member ? (
                        <a 
                            href={`/campaigns/${campaign.id}/chat`}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Entrar
                        </a>
                    ) : (
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium">
                            Solicitar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignListItem;




