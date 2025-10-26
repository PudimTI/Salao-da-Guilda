import React from 'react';
import Header from './Header';
import Footer from './Footer';
import InviteList from './InviteList';

const InvitesPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Meus Convites</h1>
                        <p className="mt-2 text-gray-600">Gerencie seus convites de campanhas</p>
                    </div>

                    {/* Lista de Convites */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Convites Pendentes</h2>
                        </div>
                        <div className="p-6">
                            <InviteList />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default InvitesPage;
