import React from 'react';
import AppLayout from '../components/layout/AppLayout';

const FriendshipExamplePage = () => {
    return (
        <AppLayout currentPage="friends">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Exemplo de Integração de Friendship</h1>
                    <p className="text-gray-600">
                        Esta página demonstra como integrar botões de friendship em qualquer lugar do sistema
                    </p>
                </div>

                {/* Exemplo 1: Lista de usuários com botões de friendship */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Lista de Usuários</h2>
                    <div id="users-list" className="grid gap-4">
                        {/* Usuário 1 */}
                        <div className="user-card border border-gray-200 rounded-lg p-4" data-user-id="1">
                            <div className="flex items-center space-x-4">
                                <img src="https://via.placeholder.com/60/8B5CF6/FFFFFF?text=JS" alt="João Silva" className="w-12 h-12 rounded-full" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">João Silva</h3>
                                    <p className="text-sm text-gray-500">@joao_silva</p>
                                    <p className="text-sm text-gray-600">Desenvolvedor apaixonado por RPG</p>
                                </div>
                            </div>
                        </div>

                        {/* Usuário 2 */}
                        <div className="user-card border border-gray-200 rounded-lg p-4" data-user-id="2">
                            <div className="flex items-center space-x-4">
                                <img src="https://via.placeholder.com/60/10B981/FFFFFF?text=MS" alt="Maria Santos" className="w-12 h-12 rounded-full" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Maria Santos</h3>
                                    <p className="text-sm text-gray-500">@maria_santos</p>
                                    <p className="text-sm text-gray-600">Mestre de RPG experiente</p>
                                </div>
                            </div>
                        </div>

                        {/* Usuário 3 */}
                        <div className="user-card border border-gray-200 rounded-lg p-4" data-user-id="3">
                            <div className="flex items-center space-x-4">
                                <img src="https://via.placeholder.com/60/F59E0B/FFFFFF?text=PC" alt="Pedro Costa" className="w-12 h-12 rounded-full" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Pedro Costa</h3>
                                    <p className="text-sm text-gray-500">@pedro_costa</p>
                                    <p className="text-sm text-gray-600">Jogador de mesa há 10 anos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exemplo 2: Cards de perfil com botões */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Cards de Perfil</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Card 1 */}
                        <div className="profile-card border border-gray-200 rounded-lg p-4" data-user-id="4">
                            <div className="text-center">
                                <img src="https://via.placeholder.com/80/EF4444/FFFFFF?text=AL" alt="Ana Lima" className="w-16 h-16 rounded-full mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900">Ana Lima</h3>
                                <p className="text-sm text-gray-500">@ana_lima</p>
                                <p className="text-sm text-gray-600 mt-2">Fã de fantasia e ficção científica</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="profile-card border border-gray-200 rounded-lg p-4" data-user-id="5">
                            <div className="text-center">
                                <img src="https://via.placeholder.com/80/8B5CF6/FFFFFF?text=CO" alt="Carlos Oliveira" className="w-16 h-16 rounded-full mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900">Carlos Oliveira</h3>
                                <p className="text-sm text-gray-500">@carlos_oliveira</p>
                                <p className="text-sm text-gray-600 mt-2">Criador de mundos e histórias</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exemplo 3: Lista de membros de campanha */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Membros da Campanha</h2>
                    <div className="grid gap-3">
                        {/* Membro 1 */}
                        <div className="member-card flex items-center justify-between border border-gray-200 rounded-lg p-3" data-user-id="6">
                            <div className="flex items-center space-x-3">
                                <img src="https://via.placeholder.com/40/10B981/FFFFFF?text=DM" alt="Dungeon Master" className="w-8 h-8 rounded-full" />
                                <div>
                                    <h4 className="font-medium text-gray-900">Dungeon Master</h4>
                                    <p className="text-sm text-gray-500">Mestre da campanha</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">DM</span>
                        </div>

                        {/* Membro 2 */}
                        <div className="member-card flex items-center justify-between border border-gray-200 rounded-lg p-3" data-user-id="7">
                            <div className="flex items-center space-x-3">
                                <img src="https://via.placeholder.com/40/F59E0B/FFFFFF?text=PL" alt="Player" className="w-8 h-8 rounded-full" />
                                <div>
                                    <h4 className="font-medium text-gray-900">Player</h4>
                                    <p className="text-sm text-gray-500">Jogador</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Player</span>
                        </div>
                    </div>
                </div>

                {/* Instruções */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Como Funciona</h3>
                    <ul className="text-blue-800 space-y-2">
                        <li>• Os botões de friendship são adicionados automaticamente aos elementos com classes <code className="bg-blue-100 px-1 rounded">user-card</code>, <code className="bg-blue-100 px-1 rounded">profile-card</code> ou <code className="bg-blue-100 px-1 rounded">member-card</code></li>
                        <li>• Cada elemento deve ter o atributo <code className="bg-blue-100 px-1 rounded">data-user-id</code> com o ID do usuário</li>
                        <li>• Os botões incluem: Ver Perfil, Adicionar Amigo e Iniciar Chat</li>
                        <li>• Clique nos botões para testar as funcionalidades mockadas</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
};

export default FriendshipExamplePage;
