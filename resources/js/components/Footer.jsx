import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-100 border-t border-gray-200 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-600 mb-4">
                        [Footer]
                    </h3>
                    <div className="flex justify-center space-x-8 text-sm text-gray-500">
                        <a href="#" className="hover:text-purple-600 transition-colors duration-200">
                            Sobre
                        </a>
                        <a href="#" className="hover:text-purple-600 transition-colors duration-200">
                            Contato
                        </a>
                        <a href="#" className="hover:text-purple-600 transition-colors duration-200">
                            Termos de Uso
                        </a>
                        <a href="#" className="hover:text-purple-600 transition-colors duration-200">
                            Privacidade
                        </a>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-400">
                            © 2024 Salão da Guilda. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;









