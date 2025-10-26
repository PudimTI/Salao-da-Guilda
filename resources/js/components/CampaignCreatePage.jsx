import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';

const CampaignCreatePage = () => {
    const [tags, setTags] = useState([]);

    useEffect(() => {
        // Buscar tags do container
        const container = document.getElementById('campaign-create-app');
        if (container && container.dataset.tags) {
            try {
                setTags(JSON.parse(container.dataset.tags));
            } catch (e) {
                console.error('Erro ao carregar tags:', e);
            }
        }
    }, []);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        system: '',
        type: '',
        city: '',
        rules: '',
        status: 'open',
        visibility: 'public',
        tags: []
    });

    const systems = [
        'D&D 5e', 'D&D 3.5', 'Pathfinder', 'Pathfinder 2e',
        'Call of Cthulhu', 'Vampire: The Masquerade', 'World of Darkness',
        'GURPS', 'Savage Worlds', 'FATE', 'Cypher System',
        'Powered by the Apocalypse', 'Outros'
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            const tagValue = parseInt(value);
            setFormData(prev => ({
                ...prev,
                tags: checked
                    ? [...prev.tags, tagValue]
                    : prev.tags.filter(t => t !== tagValue)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('/campaigns', formData);
            window.location.href = `/campaigns/${response.data.campaign.id}`;
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Nova Campanha</h1>
                        <p className="text-gray-600 mt-2">Crie uma nova campanha de RPG</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Informações Básicas */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Básicas</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome da Campanha *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="system" className="block text-sm font-medium text-gray-700 mb-2">
                                        Sistema
                                    </label>
                                    <select
                                        id="system"
                                        name="system"
                                        value={formData.system}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Selecione um sistema</option>
                                        {systems.map(system => (
                                            <option key={system} value={system}>{system}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Configurações */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo
                                    </label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Selecione o tipo</option>
                                        <option value="digital">Digital</option>
                                        <option value="presencial">Presencial</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                        Cidade
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="open">Aberto</option>
                                        <option value="active">Ativo</option>
                                        <option value="closed">Fechado</option>
                                        <option value="paused">Pausado</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
                                        Visibilidade *
                                    </label>
                                    <select
                                        id="visibility"
                                        name="visibility"
                                        value={formData.visibility}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="public">Pública</option>
                                        <option value="private">Privada</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
                                    Regras
                                </label>
                                <textarea
                                    id="rules"
                                    name="rules"
                                    rows="4"
                                    value={formData.rules}
                                    onChange={handleChange}
                                    placeholder="Descreva as regras específicas da sua campanha..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        {tags && tags.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tags</h2>
                                <p className="text-sm text-gray-600 mb-4">Selecione as tags que descrevem sua campanha</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {tags.map(tag => (
                                        <label key={tag.id} className="flex items-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={tag.id}
                                                checked={formData.tags.includes(tag.id)}
                                                onChange={handleChange}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Botões */}
                        <div className="flex justify-end space-x-4">
                            <a
                                href="/campaigns"
                                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </a>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Criando...' : 'Criar Campanha'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CampaignCreatePage;
