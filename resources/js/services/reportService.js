import { apiPost, handleApiError } from '../utils/api';

export const submitReport = async ({
    targetType,
    targetId,
    reasonText,
    evidenceUrls = [],
}) => {
    try {
        const payload = {
            target_type: targetType,
            target_id: targetId,
            reason_text: reasonText,
        };

        if (Array.isArray(evidenceUrls) && evidenceUrls.length > 0) {
            payload.evidence_urls = evidenceUrls.filter(Boolean);
        }

        const response = await apiPost('/api/reports', payload);

        return response;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};









