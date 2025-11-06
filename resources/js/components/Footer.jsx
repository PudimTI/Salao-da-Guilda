import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 border-t border-gray-200 py-8 md:py-12 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-8 text-sm text-gray-500 mb-6">
                        <a 
                            href="/sobre" 
                            className="hover:text-purple-600 transition-colors duration-200"
                        >
                            Sobre
                        </a>
                        <a 
                            href="/contato" 
                            className="hover:text-purple-600 transition-colors duration-200"
                        >
                            Contato
                        </a>
                        <a 
                            href="/termos" 
                            className="hover:text-purple-600 transition-colors duration-200"
                        >
                            Termos de Uso
                        </a>
                        <a 
                            href="/privacidade" 
                            className="hover:text-purple-600 transition-colors duration-200"
                        >
                            Privacidade
                        </a>
                    </div>
                    <div className="pt-6 border-t border-gray-200">
                        <p className="text-xs md:text-sm text-gray-400">
                            © {currentYear} Salão da Guilda. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;









