import React from 'react';
import { createRoot } from 'react-dom/client';
import UserOnboardingPreferencesModal from './components/UserOnboardingPreferencesModal';

const MODAL_CONTAINER_ID = 'user-onboarding-modal-root';
let modalRoot = null;
let currentRoot = null;

function ensureContainer() {
    if (!modalRoot) {
        modalRoot = document.getElementById(MODAL_CONTAINER_ID);
    }
    if (!modalRoot) {
        modalRoot = document.createElement('div');
        modalRoot.id = MODAL_CONTAINER_ID;
        document.body.appendChild(modalRoot);
    }
    if (!currentRoot) {
        currentRoot = createRoot(modalRoot);
    }
    return currentRoot;
}

function unmountModal() {
    if (currentRoot) {
        currentRoot.render(<React.Fragment />);
    }
}

window.showUserOnboardingModal = function showUserOnboardingModal(options = {}) {
    const { user, preferences, blacklist, onComplete } = options;
    const root = ensureContainer();

    const handleComplete = () => {
        if (typeof onComplete === 'function') {
            onComplete({ user });
        }
        unmountModal();
    };

    const handleClose = () => {
        handleComplete();
    };

    root.render(
        <UserOnboardingPreferencesModal
            isOpen
            onClose={handleClose}
            onComplete={handleComplete}
            initialPreferences={preferences}
            initialBlacklist={blacklist}
        />
    );
};

window.hideUserOnboardingModal = function hideUserOnboardingModal() {
    unmountModal();
};

