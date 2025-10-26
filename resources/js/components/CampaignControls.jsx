import React from 'react';

const CampaignControls = ({ campaignId }) => {
    const gmControls = [
        { id: 1, name: "Iniciar Sessão", icon: "▶️", action: "start" },
        { id: 2, name: "Pausar Sessão", icon: "⏸️", action: "pause" },
        { id: 3, name: "Finalizar Sessão", icon: "⏹️", action: "stop" },
        { id: 4, name: "Rolagem Secreta", icon: "🎲", action: "secret" },
        { id: 5, name: "Iniciativa", icon: "⚡", action: "initiative" },
        { id: 6, name: "Combate", icon: "⚔️", action: "combat" },
        { id: 7, name: "NPCs", icon: "👤", action: "npcs" },
        { id: 8, name: "Mapa", icon: "🗺️", action: "map" },
        { id: 9, name: "Notas", icon: "📝", action: "notes" },
        { id: 10, name: "Música", icon: "🎵", action: "music" }
    ];

    const handleControlClick = (action) => {
        console.log(`Executando ação: ${action}`);
        // Aqui seria implementada a lógica de cada controle
    };

    return (
        <div className="w-64 bg-pink-50 h-full flex flex-col">
            {/* Título */}
            <div className="p-4 border-b border-pink-200">
                <h2 className="text-lg font-bold text-gray-800">Controles de GM</h2>
            </div>

            {/* Controles */}
            <div className="flex-1 p-4">
                <div className="space-y-3">
                    {gmControls.map((control) => (
                        <button
                            key={control.id}
                            onClick={() => handleControlClick(control.action)}
                            className="w-full text-left p-3 rounded-lg bg-white border border-pink-200 hover:bg-pink-100 hover:border-pink-300 transition-colors duration-200 group"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-lg">{control.icon}</span>
                                <span className="font-medium text-gray-700 group-hover:text-pink-800">
                                    {control.name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Botão Mapa Mental */}
            <div className="p-4 border-t border-pink-200">
                <button 
                    onClick={() => window.location.href = `/campaigns/${campaignId}/mindmap`}
                    className="w-full bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                    <span>🧠</span>
                    <span>Mapa mental</span>
                </button>
            </div>
        </div>
    );
};

export default CampaignControls;
