import React, { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { submitReport } from '../services/reportService';

const QUICK_REASONS = [
    'Ameaça ou discurso de ódio',
    'Conteúdo impróprio ou ofensivo',
    'Spam ou comportamento suspeito',
    'Assédio direcionado a mim ou a outro usuário',
    'Informações pessoais vazadas',
];

const MAX_EVIDENCES = 5;

const ReportModal = ({
    isOpen,
    targetType,
    targetId,
    targetName,
    targetDescription,
    onClose,
    onSuccess,
}) => {
    const [reason, setReason] = useState('');
    const [selectedQuickReason, setSelectedQuickReason] = useState('');
    const [evidences, setEvidences] = useState(['']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setSelectedQuickReason('');
            setEvidences(['']);
            setIsSubmitting(false);
        }
    }, [isOpen, targetId, targetType]);

    const targetLabel = useMemo(() => {
        switch (targetType) {
            case 'user':
                return 'usuário';
            case 'post':
                return 'post';
            case 'campaign':
                return 'campanha';
            default:
                return 'conteúdo';
        }
    }, [targetType]);

    if (!isOpen) {
        return null;
    }

    const handleEvidenceChange = (index, value) => {
        const updated = [...evidences];
        updated[index] = value;
        setEvidences(updated);
    };

    const handleAddEvidence = () => {
        if (evidences.length >= MAX_EVIDENCES) return;
        setEvidences([...evidences, '']);
    };

    const handleRemoveEvidence = (index) => {
        if (evidences.length === 1) {
            setEvidences(['']);
            return;
        }
        setEvidences(evidences.filter((_, i) => i !== index));
    };

    const mergedReason = selectedQuickReason
        ? `${selectedQuickReason}${reason ? '\n\n' : ''}${reason}`
        : reason;

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedReason = mergedReason.trim();

        if (trimmedReason.length < 15) {
            toast.error('Descreva o motivo com pelo menos 15 caracteres.');
            return;
        }

        setIsSubmitting(true);

        try {
            await submitReport({
                targetType,
                targetId,
                reasonText: trimmedReason,
                evidenceUrls: evidences.filter((url) => url && url.trim()),
            });

            toast.success('Denúncia enviada para a moderação. Obrigado por ajudar a manter a comunidade segura.');

            if (typeof onSuccess === 'function') {
                onSuccess();
            }

            onClose?.();
        } catch (error) {
            if (!error?.status) {
                toast.error('Não foi possível enviar a denúncia. Tente novamente mais tarde.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
                <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <div className="flex-1 min-w-0 pr-2">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Denunciar {targetLabel}</h2>
                        {targetName && (
                            <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">{targetName}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
                        aria-label="Fechar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                            <span>Motivo da denúncia</span>
                            <span className="text-xs text-gray-400">mínimo de 15 caracteres</span>
                        </label>

                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {QUICK_REASONS.map((option) => (
                                <button
                                    type="button"
                                    key={option}
                                    onClick={() =>
                                        setSelectedQuickReason((current) =>
                                            current === option ? '' : option
                                        )
                                    }
                                    className={`px-2.5 sm:px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap ${
                                        selectedQuickReason === option
                                            ? 'bg-purple-600 text-white border-purple-600'
                                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Descreva o que aconteceu, incluindo datas, participantes e qualquer outro detalhe relevante."
                            rows={5}
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                            required={!selectedQuickReason}
                        />

                        {targetDescription && (
                            <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg p-2.5 sm:p-3">
                                {targetDescription}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                            <label className="text-xs sm:text-sm font-medium text-gray-700">Evidências (opcional)</label>
                            <span className="text-xs text-gray-400">links, prints ou vídeos</span>
                        </div>

                        <div className="space-y-2">
                            {evidences.map((url, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(event) => handleEvidenceChange(index, event.target.value)}
                                        placeholder="https://exemplo.com/evidencia.png"
                                        className="flex-1 border border-gray-300 rounded-lg px-2.5 sm:px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEvidence(index)}
                                        className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                                        aria-label="Remover evidência"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {evidences.length < MAX_EVIDENCES && (
                            <button
                                type="button"
                                onClick={handleAddEvidence}
                                className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Adicionar evidência
                            </button>
                        )}
                    </div>

                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 sm:p-4 text-xs text-purple-800">
                        <p className="font-medium mb-1.5 sm:mb-2">Lembre-se:</p>
                        <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                            <li>Denúncias falsas podem resultar em suspensão da conta.</li>
                            <li>Use linguagem respeitosa e descreva os fatos objetivamente.</li>
                            <li>Envie apenas links confiáveis e acessíveis pela equipe de moderação.</li>
                        </ul>
                    </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm sm:text-base"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center text-sm sm:text-base"
                        >
                            {isSubmitting && (
                                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                                    <path className="opacity-75" strokeWidth="4" d="M4 12a8 8 0 018-8" />
                                </svg>
                            )}
                            Enviar denúncia
                        </button>
                    </div>
                </form>

                <Toaster position="bottom-center" />
            </div>
        </div>
    );
};

export default ReportModal;









