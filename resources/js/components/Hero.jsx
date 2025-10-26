import React from 'react';

const Hero = () => {
    return (
        <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-16 px-6">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                    Salão da Guilda
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
                    Se reuna com aventureiros para sua jornada!
                </p>
                
                {/* Hero Image */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center">
                        <img 
                            src="/src/Logo home.png" 
                            alt="Salão da Guilda" 
                            className="max-w-full h-auto max-h-96 object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

