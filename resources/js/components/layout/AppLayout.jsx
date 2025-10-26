import React from 'react';
import HeaderWrapper from './Header';
import FooterWrapper from './Footer';

const AppLayout = ({ children, currentPage = '', className = '' }) => {
    return (
        <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
            <HeaderWrapper currentPage={currentPage} />
            <main className="flex-1">
                {children}
            </main>
            <FooterWrapper />
        </div>
    );
};

export default AppLayout;
